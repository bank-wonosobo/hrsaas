package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// NotificationRecipient links one Notification to one user and tracks that
// user's read state. A broadcast notification has one Notification row and
// many NotificationRecipient rows.
type NotificationRecipient struct {
	ID             string `gorm:"column:id;primaryKey"`
	NotificationID string `gorm:"column:notification_id;not null"`
	UserID         string `gorm:"column:user_id;not null"`
	IsRead         bool   `gorm:"column:is_read;not null"`
	ReadAt         *int64 `gorm:"column:read_at"`
	CreatedAt      int64  `gorm:"column:created_at"`
	UpdatedAt      int64  `gorm:"column:updated_at"`

	Notification Notification `gorm:"foreignKey:NotificationID;references:ID"`
}

func (r *NotificationRecipient) BeforeCreate(tx *gorm.DB) (err error) {
	r.ID = uuid.NewString()
	r.CreatedAt = time.Now().UnixMilli()
	r.UpdatedAt = time.Now().UnixMilli()
	return nil
}

func (r *NotificationRecipient) TableName() string {
	return "notification_recipients"
}
