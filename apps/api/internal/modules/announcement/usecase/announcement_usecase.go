package usecase

import (
	"context"
	"hrsaas/internal/modules/announcement/entity"
	"hrsaas/internal/modules/announcement/model"
	"hrsaas/internal/modules/announcement/repository"
	employeeEntity "hrsaas/internal/modules/employee/entity"
	employeeRepo "hrsaas/internal/modules/employee/repository"
	pkg "hrsaas/pkg/s3"
	"strings"

	"github.com/aws/aws-sdk-go-v2/service/s3"
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
	S3Client           *pkg.S3Client
}

func NewAnnouncementUsecase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	announcementRepo *repository.AnnouncementRepository,
	employeeRepository *employeeRepo.EmployeeRepository,
	s3Client *pkg.S3Client,
) *AnnouncementUsecase {
	return &AnnouncementUsecase{
		DB:                 db,
		Log:                log,
		Validate:           validate,
		AnnouncementRepo:   announcementRepo,
		EmployeeRepository: employeeRepository,
		S3Client:           s3Client,
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
		FileUrl:    request.FileUrl,
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
	presignClient := s3.NewPresignClient(c.S3Client.Client)

	for i, announcement := range announcements {
		responses[i] = *model.NewAnnouncementResponse(&announcement)

		if announcement.FileUrl != nil {
			url, err := c.S3Client.GenerateDownloadURL(presignClient, *announcement.FileUrl)
			if err != nil {
				return nil, 0, err
			}
			responses[i].FileUrl = &url
		}
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
	if announcement.FileUrl != nil {
		presignClient := s3.NewPresignClient(c.S3Client.Client)
		url, err := c.S3Client.GenerateDownloadURL(presignClient, *announcement.FileUrl)
		if err != nil {
			return nil, err
		}
		announcement.FileUrl = &url
	}
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
