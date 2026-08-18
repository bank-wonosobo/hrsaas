package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// NotificationPreference lets a user opt in/out of a channel for a given
// notification type. A missing row means "use defaults" (all channels on),
// handled in the usecase layer.
type NotificationPreference struct {
	ID               string `gorm:"column:id;primaryKey"`
	UserID           string `gorm:"column:user_id;not null"`
	NotificationType string `gorm:"column:notification_type;not null"`
	InAppEnabled     bool   `gorm:"column:in_app_enabled;not null"`
	EmailEnabled     bool   `gorm:"column:email_enabled;not null"`
	PushEnabled      bool   `gorm:"column:push_enabled;not null"`
	CreatedAt        int64  `gorm:"column:created_at"`
	UpdatedAt        int64  `gorm:"column:updated_at"`
}

func (p *NotificationPreference) BeforeCreate(tx *gorm.DB) (err error) {
	p.ID = uuid.NewString()
	p.CreatedAt = time.Now().UnixMilli()
	p.UpdatedAt = time.Now().UnixMilli()
	return nil
}

func (p *NotificationPreference) TableName() string {
	return "notification_preferences"
}
