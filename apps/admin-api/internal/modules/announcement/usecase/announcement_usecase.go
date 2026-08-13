package usecase

import (
	"context"
	"hrsaas-admin-api/internal/modules/announcement/entity"
	"hrsaas-admin-api/internal/modules/announcement/model"
	"hrsaas-admin-api/internal/modules/announcement/repository"
	employeeEntity "hrsaas-admin-api/internal/modules/employee/entity"
	employeeRepo "hrsaas-admin-api/internal/modules/employee/repository"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type AnnouncementUsecase struct {
	DB                 *gorm.DB
	Log                *logrus.Logger
	Validate           *validator.Validate
	AnnouncementRepo   *repository.AnnouncementRepository
	EmployeeRepository *employeeRepo.EmployeeRepository
}

func NewAnnouncementUsecase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	announcementRepo *repository.AnnouncementRepository,
	employeeRepository *employeeRepo.EmployeeRepository,
) *AnnouncementUsecase {
	return &AnnouncementUsecase{
		DB:                 db,
		Log:                log,
		Validate:           validate,
		AnnouncementRepo:   announcementRepo,
		EmployeeRepository: employeeRepository,
	}
}

// Create Announcement
func (c *AnnouncementUsecase) Create(
	ctx context.Context,
	userID string,
	request *model.CreateAnnouncementRequest,
) (*model.AnnouncementResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	employee := new(employeeEntity.Employee)
	if err := c.EmployeeRepository.FindByUserId(tx, employee, userID); err != nil {
		c.Log.WithError(err).Error("Failed to fetch employee by user id")

	}
	request.EmployeeID = employee.ID

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	announcement := &entity.Announcement{
		CompanyID:  request.CompanyID,
		EmployeeID: request.EmployeeID,
		Title:      request.Title,
		Category:   request.Category,
		Content:    request.Content,
	}

	if err := c.AnnouncementRepo.Create(tx, announcement); err != nil {
		c.Log.WithError(err).Error("Error creating announcement")
		return nil, fiber.ErrInternalServerError
	}

	announcement.Employee = *employee

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.NewAnnouncementResponse(announcement), nil
}

// List Announcements
func (c *AnnouncementUsecase) List(
	ctx context.Context,
	request *model.SearchAnnouncementRequest,
) ([]model.AnnouncementResponse, int64, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, 0, fiber.ErrBadRequest
	}

	announcements, total, err := c.AnnouncementRepo.List(tx, request)
	if err != nil {
		c.Log.WithError(err).Error("Error listing announcements")
		return nil, 0, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, 0, fiber.ErrInternalServerError
	}

	responses := make([]model.AnnouncementResponse, len(announcements))
	for i, announcement := range announcements {
		responses[i] = *model.NewAnnouncementResponse(&announcement)
	}

	return responses, total, nil
}

// Get Announcement Detail
func (c *AnnouncementUsecase) Detail(
	ctx context.Context,
	id string,
	companyID string,
) (*model.AnnouncementResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	announcement := new(entity.Announcement)
	if err := c.AnnouncementRepo.FindByIdAndCompany(tx, announcement, id, companyID, "Employee"); err != nil {
		c.Log.WithError(err).Error("Announcement not found")
		return nil, fiber.ErrNotFound
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.NewAnnouncementResponse(announcement), nil
}

// Update Announcement
func (c *AnnouncementUsecase) Update(
	ctx context.Context,
	id string,
	companyID string,
	request *model.UpdateAnnouncementRequest,
) (*model.AnnouncementResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	announcement := new(entity.Announcement)
	if err := c.AnnouncementRepo.FindByIdAndCompany(tx, announcement, id, companyID, "Employee"); err != nil {
		c.Log.WithError(err).Error("Announcement not found")
		return nil, fiber.ErrNotFound
	}

	if request.Title != nil {
		title := strings.TrimSpace(*request.Title)
		if title == "" {
			return nil, fiber.NewError(fiber.StatusBadRequest, "title cannot be empty")
		}
		announcement.Title = title
	}

	if request.Category != nil {
		category := strings.TrimSpace(*request.Category)
		if category == "" {
			return nil, fiber.NewError(fiber.StatusBadRequest, "category cannot be empty")
		}
		announcement.Category = category
	}

	if request.Content != nil {
		content := strings.TrimSpace(*request.Content)
		if content == "" {
			return nil, fiber.NewError(fiber.StatusBadRequest, "content cannot be empty")
		}
		announcement.Content = content
	}

	if err := c.AnnouncementRepo.Update(tx, announcement); err != nil {
		c.Log.WithError(err).Error("Failed to update announcement")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.NewAnnouncementResponse(announcement), nil
}

// Delete Announcement
func (c *AnnouncementUsecase) Delete(ctx context.Context, id string, companyID string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	announcement := new(entity.Announcement)
	if err := c.AnnouncementRepo.FindByIdAndCompany(tx, announcement, id, companyID); err != nil {
		c.Log.WithError(err).Error("Announcement not found")
		return fiber.ErrNotFound
	}

	if err := c.AnnouncementRepo.Delete(tx, announcement); err != nil {
		c.Log.WithError(err).Error("Failed to delete announcement")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return fiber.ErrInternalServerError
	}

	return nil
}
