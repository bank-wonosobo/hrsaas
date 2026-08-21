package usecase

import (
	"context"
	"hrsaas/internal/modules/auth/entity"
	userEntity "hrsaas/internal/modules/user/entity"
	"hrsaas/internal/modules/user/model"

	"hrsaas/internal/modules/auth/repository"

	companyEntity "hrsaas/internal/modules/company/entity"
	companyRepository "hrsaas/internal/modules/company/repository"
	userRepo "hrsaas/internal/modules/user/repository"
	"hrsaas/pkg/auth"

	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthUseCase struct {
	DB                *gorm.DB
	Log               *logrus.Logger
	Validate          *validator.Validate
	UserRepository    *userRepo.UserRepository
	SessionRepository *repository.SessionRepository
	CompanyRepository *companyRepository.CompanyRepository
	RoleRepository    *userRepo.RoleRepository
	// S3Client          *pkg.S3Client
}

func NewAuthUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	userRepository *userRepo.UserRepository,
	sessionRepository *repository.SessionRepository,
	companyRepository *companyRepository.CompanyRepository,
	roleRepository *userRepo.RoleRepository,
) *AuthUseCase {
	return &AuthUseCase{
		DB:                db,
		Log:               log,
		Validate:          validate,
		SessionRepository: sessionRepository,
		CompanyRepository: companyRepository,
		UserRepository:    userRepository,
		RoleRepository:    roleRepository,
	}
}

/*
Verify User
*/
func (c *AuthUseCase) Verify(
	ctx context.Context,
	request *model.VerifyUserRequest,
) (*model.UserResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	// find session
	session := new(entity.Session)
	if err := c.SessionRepository.FindByToken(tx, session, request.Token); err != nil {
		c.Log.Warnf("Gagal menemukan user by token : %+v", err)
		return nil, fiber.ErrUnauthorized
	}

	expiredAt := time.Unix(session.CreatedAt, 0)

	// Check expiry
	if expiredAt.Before(time.Now()) {
		if err := c.SessionRepository.Delete(tx, session); err != nil {
			c.Log.WithError(err).Error("Gagal menghapus session by user id")
			return nil, fiber.ErrInternalServerError
		}
		return nil, fiber.NewError(fiber.StatusUnauthorized, "Session expired")
	}

	// find user
	user := new(userEntity.User)
	if err := c.UserRepository.FindById(tx, user, session.UserID, "Roles", "Roles.Permissions"); err != nil {
		c.Log.Warnf("Gagal menemukan user by token : %+v", err)
		return nil, fiber.ErrUnauthorized
	}

	if user.CompanyID == "" {
		return nil, fiber.NewError(
			fiber.StatusForbidden,
			"User tidak terasosiasi dengan perusahaan manapun",
		)
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.Warnf("Gagal menyelesaikan transaksi : %+v", err)
		return nil, fiber.ErrInternalServerError
	}

	return model.UserToResponse(user), nil
}

/*
Register User
*/
func (c *AuthUseCase) Register(
	ctx context.Context,
	request *model.RegisterUserRequest,
) (*model.UserResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	// validate request
	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	// cek user exist
	count, err := c.UserRepository.CountByEmail(tx, request.Email)
	if err != nil {
		c.Log.WithError(err).Error("Failed to count user by email")
		return nil, fiber.ErrInternalServerError
	}

	if count > 0 {
		return nil, fiber.NewError(fiber.StatusConflict, "Email already registered")
	}

	// create company
	company := &companyEntity.Company{
		Name: request.CompanyName,
	}

	if err := c.CompanyRepository.Create(tx, company); err != nil {
		c.Log.WithError(err).Error("Failed to create company")
		return nil, fiber.ErrInternalServerError
	}

	// hash password
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err != nil {
		c.Log.WithError(err).Error("Failed to hash password")
		return nil, fiber.ErrInternalServerError
	}

	// create user
	user := &userEntity.User{
		Name:      request.Name,
		Email:     request.Email,
		Password:  string(passwordHash),
		CompanyID: company.ID,
	}

	if err := c.UserRepository.Create(tx, user); err != nil {
		c.Log.WithError(err).Error("Failed to create user")
		return nil, fiber.ErrInternalServerError
	}

	adminRole, roleErr := c.RoleRepository.FindByName(tx, "ADMIN")
	if roleErr != nil {
		adminRole = &userEntity.Role{Name: "ADMIN"}
		if err := c.RoleRepository.Create(tx, adminRole); err != nil {
			c.Log.WithError(err).Error("Failed to create admin role")
			return nil, fiber.ErrInternalServerError
		}
	}

	if err := c.UserRepository.AssignRoles(tx, user, []userEntity.Role{*adminRole}); err != nil {
		c.Log.WithError(err).Error("Failed to assign admin role to user")
		return nil, fiber.ErrInternalServerError
	}
	user.Roles = []userEntity.Role{*adminRole}

	if err := tx.Commit().Error; err != nil {
		c.Log.Warnf("Failed commit transaction : %+v", err)
		return nil, fiber.ErrInternalServerError
	}

	return model.UserToResponse(user), nil
}

/*
Login User
*/
func (c *AuthUseCase) Login(
	ctx context.Context,
	request *model.LoginUserRequest,
) (*model.LoginUserResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	// validate request
	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	// find user by email
	user := new(userEntity.User)
	if err := c.UserRepository.FindByEmail(tx, user, request.Email, "Roles", "Roles.Permissions"); err != nil {
		c.Log.Warnf("Gagal menemukan user by email : %+v", err)
		return nil, fiber.NewError(fiber.StatusConflict, "email dan password tidak valid")
	}

	// find session by user id
	session := new(entity.Session)
	totalSession, err := c.SessionRepository.CountByUserId(tx, user.ID)
	if err != nil {
		return nil, fiber.ErrInternalServerError
	}
	if totalSession > 10000 {
		return nil, fiber.NewError(fiber.StatusConflict, "User sudah login di perangkat lain")
	}

	// compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password)); err != nil {
		c.Log.Warnf("Password tidak valid : %+v", err)
		return nil, fiber.NewError(fiber.StatusConflict, "email dan password tidak valid")
	}

	// create token
	token, err := auth.GenerateToken(32)
	if err != nil {
		return nil, fiber.ErrInternalServerError
	}

	// create session
	session = &entity.Session{
		UserID:    user.ID,
		Token:     token,
		IPAddress: &request.Ip,
		UserAgent: &request.UserAgent,
		ExpiredAt: time.Now().Add(24 * time.Hour).UnixMilli(),
	}

	if err := c.SessionRepository.Create(tx, session); err != nil {
		c.Log.WithError(err).Error("Failed to create session")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.Warnf("Failed commit transaction : %+v", err)
		return nil, fiber.ErrInternalServerError
	}

	return &model.LoginUserResponse{
		User:  *model.UserToResponse(user),
		Token: token,
	}, nil
}

func (c *AuthUseCase) LoginClient(
	ctx context.Context,
	request *model.LoginUserRequest,
) (*model.LoginUserResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	// validate request
	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	// find user by email
	user := new(userEntity.User)
	if err := c.UserRepository.FindByEmail(tx, user, request.Email, "Roles", "Roles.Permissions"); err != nil {
		c.Log.Warnf("Gagal menemukan user by email : %+v", err)
		return nil, fiber.NewError(fiber.StatusConflict, "email dan password tidak valid")
	}

	// find session by user id
	session := new(entity.Session)
	totalSession, err := c.SessionRepository.CountByUserId(tx, user.ID)
	if err != nil {
		return nil, fiber.ErrInternalServerError
	}
	if totalSession > 10000 {
		return nil, fiber.NewError(fiber.StatusConflict, "User sudah login di perangkat lain")
	}

	// compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password)); err != nil {
		c.Log.Warnf("Password tidak valid : %+v", err)
		return nil, fiber.NewError(fiber.StatusConflict, "email dan password tidak valid")
	}

	// create token
	token, err := auth.GenerateToken(32)
	if err != nil {
		return nil, fiber.ErrInternalServerError
	}

	// create session
	session = &entity.Session{
		UserID:    user.ID,
		Token:     token,
		IPAddress: &request.Ip,
		UserAgent: &request.UserAgent,
	}

	if err := c.SessionRepository.Create(tx, session); err != nil {
		c.Log.WithError(err).Error("Failed to create session")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.Warnf("Failed commit transaction : %+v", err)
		return nil, fiber.ErrInternalServerError
	}

	return &model.LoginUserResponse{
		User:  *model.UserToResponse(user),
		Token: token,
	}, nil
}

/*
Logout User
*/
func (c *AuthUseCase) Logout(ctx context.Context, userId string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	// delete session by user id
	if err := c.SessionRepository.DeleteByUserId(tx, userId); err != nil {
		c.Log.WithError(err).Error("Failed to delete session by user id")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.Warnf("Failed commit transaction : %+v", err)
		return fiber.ErrInternalServerError
	}

	return nil
}
