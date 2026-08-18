package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// NotificationTarget stores a broadcast target (division/position/office
// location/role/all) before it is resolved into NotificationRecipient rows.
// Personal notifications skip this table entirely.
type NotificationTarget struct {
	ID             string  `gorm:"column:id;primaryKey"`
	NotificationID string  `gorm:"column:notification_id;not null"`
	TargetType     string  `gorm:"column:target_type;not null"`
	TargetID       *string `gorm:"column:target_id"`
	CreatedAt      int64   `gorm:"column:created_at"`
}

func (t *NotificationTarget) BeforeCreate(tx *gorm.DB) (err error) {
	t.ID = uuid.NewString()
	t.CreatedAt = time.Now().UnixMilli()
	return nil
}

func (t *NotificationTarget) TableName() string {
	return "notification_targets"
}
