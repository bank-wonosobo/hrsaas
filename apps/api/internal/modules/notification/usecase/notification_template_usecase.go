package usecase

import (
	"context"
	"hrsaas/internal/modules/notification/entity"
	"hrsaas/internal/modules/notification/model"
	"hrsaas/internal/modules/notification/repository"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type NotificationTemplateUseCase struct {
	DB       *gorm.DB
	Log      *logrus.Logger
	Validate *validator.Validate
	Repo     *repository.NotificationTemplateRepository
}

func NewNotificationTemplateUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	repo *repository.NotificationTemplateRepository,
) *NotificationTemplateUseCase {
	return &NotificationTemplateUseCase{DB: db, Log: log, Validate: validate, Repo: repo}
}

func (c *NotificationTemplateUseCase) Create(ctx context.Context, request *model.CreateNotificationTemplateRequest) (*model.NotificationTemplateResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	code := strings.ToUpper(strings.TrimSpace(request.Code))

	count, err := c.Repo.CountByCode(tx, code, request.CompanyID, "")
	if err != nil {
		c.Log.WithError(err).Error("Failed to count notification template by code")
		return nil, fiber.ErrInternalServerError
	}
	if count > 0 {
		return nil, fiber.NewError(fiber.StatusConflict, "Code already in use")
	}

	item := &entity.NotificationTemplate{
		CompanyID:     request.CompanyID,
		Code:          code,
		Name:          strings.TrimSpace(request.Name),
		TitleTemplate: request.TitleTemplate,
		BodyTemplate:  request.BodyTemplate,
		Category:      request.Category,
		IsActive:      true,
	}

	if err := c.Repo.Create(tx, item); err != nil {
		c.Log.WithError(err).Error("Failed to create notification template")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.NotificationTemplateToResponse(item), nil
}

func (c *NotificationTemplateUseCase) List(ctx context.Context, request *model.SearchNotificationTemplateRequest) ([]model.NotificationTemplateResponse, int64, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate search query")
		return nil, 0, fiber.ErrBadRequest
	}

	items, total, err := c.Repo.Search(tx, request)
	if err != nil {
		c.Log.WithError(err).Error("Failed to list notification templates")
		return nil, 0, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, 0, fiber.ErrInternalServerError
	}

	return model.NotificationTemplatesToResponse(items), total, nil
}

func (c *NotificationTemplateUseCase) Detail(ctx context.Context, id string, companyID string) (*model.NotificationTemplateResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	item, err := c.Repo.FindByIDAndCompany(tx, id, companyID)
	if err != nil {
		c.Log.WithError(err).Error("Notification template not found")
		return nil, fiber.ErrNotFound
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.NotificationTemplateToResponse(item), nil
}

func (c *NotificationTemplateUseCase) Update(ctx context.Context, id string, companyID string, request *model.UpdateNotificationTemplateRequest) (*model.NotificationTemplateResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	item, err := c.Repo.FindByIDAndCompany(tx, id, companyID)
	if err != nil {
		c.Log.WithError(err).Error("Notification template not found")
		return nil, fiber.ErrNotFound
	}

	if request.Name != nil {
		name := strings.TrimSpace(*request.Name)
		if name == "" {
			return nil, fiber.NewError(fiber.StatusBadRequest, "name cannot be empty")
		}
		item.Name = name
	}
	if request.TitleTemplate != nil {
		item.TitleTemplate = *request.TitleTemplate
	}
	if request.BodyTemplate != nil {
		item.BodyTemplate = *request.BodyTemplate
	}
	if request.Category != nil {
		item.Category = *request.Category
	}
	if request.IsActive != nil {
		item.IsActive = *request.IsActive
	}

	if err := c.Repo.Update(tx, item); err != nil {
		c.Log.WithError(err).Error("Failed to update notification template")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.NotificationTemplateToResponse(item), nil
}

func (c *NotificationTemplateUseCase) Delete(ctx context.Context, id string, companyID string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	item, err := c.Repo.FindByIDAndCompany(tx, id, companyID)
	if err != nil {
		c.Log.WithError(err).Error("Notification template not found")
		return fiber.ErrNotFound
	}

	if err := c.Repo.Delete(tx, item); err != nil {
		c.Log.WithError(err).Error("Failed to delete notification template")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return fiber.ErrInternalServerError
	}

	return nil
}
