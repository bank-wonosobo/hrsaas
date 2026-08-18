package usecase

import (
	"context"
	"hrsaas/internal/modules/notification/entity"
	"hrsaas/internal/modules/notification/model"
	"hrsaas/internal/modules/notification/repository"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type NotificationPreferenceUseCase struct {
	DB       *gorm.DB
	Log      *logrus.Logger
	Validate *validator.Validate
	Repo     *repository.NotificationPreferenceRepository
}

func NewNotificationPreferenceUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	repo *repository.NotificationPreferenceRepository,
) *NotificationPreferenceUseCase {
	return &NotificationPreferenceUseCase{DB: db, Log: log, Validate: validate, Repo: repo}
}

func (c *NotificationPreferenceUseCase) List(ctx context.Context, userID string) ([]model.NotificationPreferenceResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	items, err := c.Repo.ListByUser(tx, userID)
	if err != nil {
		c.Log.WithError(err).Error("Failed to list notification preferences")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.NotificationPreferencesToResponse(items), nil
}

// Upsert creates or updates the preference row for one notification type.
// Fields left nil keep their current value, defaulting to true (all
// channels enabled) when the row doesn't exist yet.
func (c *NotificationPreferenceUseCase) Upsert(ctx context.Context, userID string, request *model.UpdateNotificationPreferenceRequest) (*model.NotificationPreferenceResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	item, err := c.Repo.FindByUserAndType(tx, userID, request.NotificationType)
	if err != nil {
		item = &entity.NotificationPreference{
			UserID:           userID,
			NotificationType: request.NotificationType,
			InAppEnabled:     true,
			EmailEnabled:     true,
			PushEnabled:      true,
		}
		if request.InAppEnabled != nil {
			item.InAppEnabled = *request.InAppEnabled
		}
		if request.EmailEnabled != nil {
			item.EmailEnabled = *request.EmailEnabled
		}
		if request.PushEnabled != nil {
			item.PushEnabled = *request.PushEnabled
		}

		if err := c.Repo.Create(tx, item); err != nil {
			c.Log.WithError(err).Error("Failed to create notification preference")
			return nil, fiber.ErrInternalServerError
		}
	} else {
		if request.InAppEnabled != nil {
			item.InAppEnabled = *request.InAppEnabled
		}
		if request.EmailEnabled != nil {
			item.EmailEnabled = *request.EmailEnabled
		}
		if request.PushEnabled != nil {
			item.PushEnabled = *request.PushEnabled
		}

		if err := c.Repo.Update(tx, item); err != nil {
			c.Log.WithError(err).Error("Failed to update notification preference")
			return nil, fiber.ErrInternalServerError
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.NotificationPreferenceToResponse(item), nil
}
