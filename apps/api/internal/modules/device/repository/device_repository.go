package repository

import (
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

// Upsert registers a device's push token. push_token is globally unique, so
// re-registering the same device (reinstall, re-login as a different user,
// ...) reassigns it to the current user instead of creating a duplicate row.
func (r *DeviceRepository) Upsert(db *gorm.DB, item *entity.UserDevice) error {
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
