package usecase

import (
	"context"
	"time"

	"hrsaas/internal/modules/device/entity"
	"hrsaas/internal/modules/device/model"
	"hrsaas/internal/modules/device/repository"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type DeviceUseCase struct {
	DB       *gorm.DB
	Log      *logrus.Logger
	Validate *validator.Validate
	Repo     *repository.DeviceRepository
}

func NewDeviceUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	repo *repository.DeviceRepository,
) *DeviceUseCase {
	return &DeviceUseCase{DB: db, Log: log, Validate: validate, Repo: repo}
}

// Register saves (or reassigns) one device's push token. Called by the
// mobile app right after login.
func (c *DeviceUseCase) Register(ctx context.Context, request *model.RegisterDeviceRequest) (*model.DeviceResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	now := time.Now().UnixMilli()
	item := &entity.UserDevice{
		UserID:     request.UserID,
		DeviceID:   request.DeviceID,
		DeviceName: request.DeviceName,
		AppVersion: request.AppVersion,
		PushToken:  request.PushToken,
		Provider:   request.Provider,
		Platform:   request.Platform,
		IsActive:   true,
		LastSeenAt: &now,
	}
	if err := c.Repo.Upsert(tx, item); err != nil {
		c.Log.WithError(err).Error("Failed to register device")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.DeviceToResponse(item), nil
}
