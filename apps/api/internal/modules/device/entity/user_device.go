package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserDevice stores one mobile device's push token for a user. PushToken is
// globally unique: re-registering the same device (even under a different
// user, e.g. after logout/login) reassigns ownership instead of duplicating.
type UserDevice struct {
	ID         string  `gorm:"column:id;primaryKey"`
	UserID     string  `gorm:"column:user_id;not null"`
	DeviceID   *string `gorm:"column:device_id"`
	DeviceName *string `gorm:"column:device_name"`
	AppVersion *string `gorm:"column:app_version"`
	PushToken  string  `gorm:"column:push_token;not null"`
	Provider   string  `gorm:"column:provider;not null"`
	Platform   string  `gorm:"column:platform;not null"`
	IsActive   bool    `gorm:"column:is_active;not null"`
	LastSeenAt *int64  `gorm:"column:last_seen_at"`
	CreatedAt  int64   `gorm:"column:created_at"`
	UpdatedAt  int64   `gorm:"column:updated_at"`
}

func (d *UserDevice) BeforeCreate(tx *gorm.DB) (err error) {
	d.ID = uuid.NewString()
	now := time.Now().UnixMilli()
	d.CreatedAt = now
	d.UpdatedAt = now
	if d.LastSeenAt == nil {
		d.LastSeenAt = &now
	}
	return nil
}

func (d *UserDevice) TableName() string {
	return "user_devices"
}
