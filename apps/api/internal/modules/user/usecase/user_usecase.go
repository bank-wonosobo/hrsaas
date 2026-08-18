package usecase

import (
	"context"
	"hrsaas/internal/modules/user/entity"
	"hrsaas/internal/modules/user/model"
	"hrsaas/internal/modules/user/repository"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserUseCase struct {
	DB             *gorm.DB
	Log            *logrus.Logger
	Validate       *validator.Validate
	UserRepository *repository.UserRepository
	RoleRepository *repository.RoleRepository
	// S3Client          *pkg.S3Client
}

func NewUserUseCase(db *gorm.DB, log *logrus.Logger, validate *validator.Validate, userRepository *repository.UserRepository, roleRepository *repository.RoleRepository) *UserUseCase {
	return &UserUseCase{
		DB:             db,
		Log:            log,
		Validate:       validate,
		UserRepository: userRepository,
		RoleRepository: roleRepository,
	}
}

func (c *UserUseCase) List(ctx context.Context, request *model.SearchUserRequest) ([]model.UserResponse, int64, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Gagal memvalidasi query pencarian")
		return nil, 0, fiber.ErrBadRequest
	}

	users, total, err := c.UserRepository.Search(tx, request)
	if err != nil {
		c.Log.WithError(err).Error("Gagal mencari user")
		return nil, 0, fiber.ErrInternalServerError
	}

	responses := make([]model.UserResponse, len(users))
	for i := range users {
		responses[i] = *model.UserToResponse(&users[i])
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Gagal menyelesaikan transaksi")
		return nil, 0, fiber.ErrInternalServerError
	}

	return responses, total, nil
}

func (c *UserUseCase) Detail(ctx context.Context, id string) (*model.UserResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	user := new(entity.User)
	if err := c.UserRepository.FindById(tx, user, id, "Roles", "Roles.Permissions", "Employee"); err != nil {
		c.Log.WithError(err).Error("User tidak ditemukan")
		return nil, fiber.ErrNotFound
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Gagal menyelesaikan transaksi")
		return nil, fiber.ErrInternalServerError
	}

	// presignedUrl := s3.NewPresignClient(c.S3Client.Client)

	return model.UserToResponse(user), nil
}

func (c *UserUseCase) Update(ctx context.Context, request *model.UpdateUserRequest) (*model.UserResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	user := new(entity.User)
	if err := c.UserRepository.FindById(tx, user, request.ID, "Roles"); err != nil {
		c.Log.WithError(err).Error("User tidak ditemukan")
		return nil, fiber.ErrNotFound
	}

	if request.Name != nil {
		name := strings.TrimSpace(*request.Name)
		if name == "" {
			return nil, fiber.NewError(fiber.StatusBadRequest, "Nama tidak boleh kosong")
		}
		user.Name = name
	}

	if request.Email != nil {
		email := strings.TrimSpace(*request.Email)
		if email == "" {
			return nil, fiber.NewError(fiber.StatusBadRequest, "Email tidak boleh kosong")
		}

		count, err := c.UserRepository.CountByEmailExcludeID(tx, email, user.ID)
		if err != nil {
			c.Log.WithError(err).Error("Gagal menghitung user by email")
			return nil, fiber.ErrInternalServerError
		}
		if count > 0 {
			return nil, fiber.NewError(fiber.StatusConflict, "Email sudah terdaftar")
		}

		user.Email = email
	}

	if request.Image != nil {
		user.Image = request.Image
	}

	if request.RoleIDs != nil {
		var roles []entity.Role
		for _, roleID := range *request.RoleIDs {
			role := new(entity.Role)
			if err := c.RoleRepository.FindById(tx, role, roleID); err != nil {
				c.Log.WithError(err).Errorf("Role dengan ID %s tidak ditemukan", roleID)
				return nil, fiber.NewError(fiber.StatusBadRequest, "Role tidak ditemukan")
			}
			roles = append(roles, *role)
		}

		if err := c.UserRepository.AssignRoles(tx, user, roles); err != nil {
			c.Log.WithError(err).Error("Gagal mengassign role ke user")
			return nil, fiber.ErrInternalServerError
		}
		user.Roles = roles
	}

	if request.EmailVerified != nil {
		user.EmailVerified = *request.EmailVerified
	}

	user.UpdatedAt = time.Now().UnixMilli()

	if err := c.UserRepository.Update(tx, user); err != nil {
		c.Log.WithError(err).Error("Failed to update user")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Gagal menyelesaikan transaksi")
		return nil, fiber.ErrInternalServerError
	}

	return model.UserToResponse(user), nil
}

func (c *UserUseCase) Delete(ctx context.Context, id string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	user := new(entity.User)
	if err := c.UserRepository.FindById(tx, user, id); err != nil {
		c.Log.WithError(err).Error("User tidak ditemukan")
		return fiber.ErrNotFound
	}

	if err := c.UserRepository.Delete(tx, user); err != nil {
		c.Log.WithError(err).Error("Gagal menghapus user")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Gagal menyelesaikan transaksi")
		return fiber.ErrInternalServerError
	}

	return nil
}

func (c *UserUseCase) ResetPassword(ctx context.Context, userID string, request *model.ResetPasswordRequest) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	user := new(entity.User)
	if err := c.UserRepository.FindById(tx, user, userID); err != nil {
		c.Log.WithError(err).Error("User tidak ditemukan")
		return fiber.ErrNotFound
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(request.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.Log.WithError(err).Error("Failed to hash new password")
		return fiber.ErrInternalServerError
	}

	user.Password = string(passwordHash)
	user.UpdatedAt = time.Now().UnixMilli()

	if err := c.UserRepository.Update(tx, user); err != nil {
		c.Log.WithError(err).Error("Gagal mereset password user")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Gagal menyelesaikan transaksi")
		return fiber.ErrInternalServerError
	}

	return nil
}

func (c *UserUseCase) ChangePassword(ctx context.Context, userID string, request *model.ChangePasswordRequest) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	user := new(entity.User)
	if err := c.UserRepository.FindById(tx, user, userID); err != nil {
		c.Log.WithError(err).Error("User tidak ditemukan")
		return fiber.ErrNotFound
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.CurrentPassword)); err != nil {
		c.Log.WithError(err).Warn("Password saat ini tidak cocok")
		return fiber.NewError(fiber.StatusBadRequest, "Password saat ini salah")
	}

	if request.CurrentPassword == request.NewPassword {
		return fiber.NewError(fiber.StatusBadRequest, "Password baru harus berbeda dari password saat ini")
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(request.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.Log.WithError(err).Error("Failed to hash new password")
		return fiber.ErrInternalServerError
	}

	user.Password = string(passwordHash)
	user.UpdatedAt = time.Now().UnixMilli()

	if err := c.UserRepository.Update(tx, user); err != nil {
		c.Log.WithError(err).Error("Gagal memperbarui password user")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Gagal menyelesaikan transaksi")
		return fiber.ErrInternalServerError
	}

	return nil
}
