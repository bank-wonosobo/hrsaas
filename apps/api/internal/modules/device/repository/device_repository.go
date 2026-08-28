package repository

import (
	"errors"
	"time"

	"hrsaas/internal/modules/device/entity"
	"hrsaas/pkg/repository"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type DeviceRepository struct {
	repository.Repository[entity.UserDevice]
	Log *logrus.Logger
}

func NewDeviceRepository(log *logrus.Logger) *DeviceRepository {
	return &DeviceRepository{Log: log}
}

// Upsert updates an existing device when its device ID is known. A new device
// gets a new row; the push-token conflict fallback keeps registrations without
// a device ID idempotent.
func (r *DeviceRepository) Upsert(db *gorm.DB, item *entity.UserDevice) error {
	if item.DeviceID != nil && *item.DeviceID != "" {
		var existing entity.UserDevice
		err := db.Where("device_id = ?", *item.DeviceID).First(&existing).Error
		if err == nil {
			now := time.Now().UnixMilli()
			if err := db.Transaction(func(tx *gorm.DB) error {
				// A token can belong to only one row. Remove its old owner before
				// moving the token onto the known device.
				if err := tx.Where("push_token = ? AND id <> ?", item.PushToken, existing.ID).
					Delete(&entity.UserDevice{}).Error; err != nil {
					return err
				}
				return tx.Model(&existing).Updates(map[string]interface{}{
					"user_id":      item.UserID,
					"device_name":  item.DeviceName,
					"app_version":  item.AppVersion,
					"push_token":   item.PushToken,
					"provider":     item.Provider,
					"platform":     item.Platform,
					"is_active":    item.IsActive,
					"last_seen_at": item.LastSeenAt,
					"updated_at":   now,
				}).Error
			}); err != nil {
				return err
			}
			item.ID = existing.ID
			item.CreatedAt = existing.CreatedAt
			item.UpdatedAt = now
			return nil
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		return db.Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "push_token"}},
			DoUpdates: clause.AssignmentColumns([]string{
				"user_id", "device_id", "device_name", "app_version",
				"provider", "platform", "is_active", "last_seen_at", "updated_at",
			}),
		}).Create(item).Error
	}

	return db.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "push_token"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"user_id", "device_id", "device_name", "app_version",
			"provider", "platform", "is_active", "last_seen_at", "updated_at",
		}),
	}).Create(item).Error
}

// FindActiveByUserId returns the user's active devices registered with the
// given push provider (e.g. "expo"), for fan-out notifications like login alerts.
func (r *DeviceRepository) FindActiveByUserId(db *gorm.DB, userId string, provider string) ([]entity.UserDevice, error) {
	var devices []entity.UserDevice
	err := db.
		Where("user_id = ? AND is_active = ? AND provider = ?", userId, true, provider).
		Find(&devices).Error
	return devices, err
}

func (r *DeviceRepository) FindActiveByUserIds(db *gorm.DB, userIds []string, provider string) ([]entity.UserDevice, error) {
	var devices []entity.UserDevice
	if len(userIds) == 0 {
		return devices, nil
	}
	err := db.
		Where("user_id IN ? AND is_active = ? AND provider = ?", userIds, true, provider).
		Find(&devices).Error
	return devices, err
}

// FindActiveByProvider returns all active devices registered with a push provider.
func (r *DeviceRepository) FindActiveByProvider(db *gorm.DB, provider string) ([]entity.UserDevice, error) {
	var devices []entity.UserDevice
	err := db.
		Where("is_active = ? AND provider = ?", true, provider).
		Find(&devices).Error
	return devices, err
}
