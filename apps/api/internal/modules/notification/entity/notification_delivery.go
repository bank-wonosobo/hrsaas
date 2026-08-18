package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// NotificationDelivery tracks per-channel send status (in_app/email/push/sms)
// for one recipient, kept separate from NotificationRecipient so each channel
// can be retried and audited independently.
type NotificationDelivery struct {
	ID             string  `gorm:"column:id;primaryKey"`
	NotificationID string  `gorm:"column:notification_id;not null"`
	RecipientID    string  `gorm:"column:recipient_id;not null"`
	Channel        string  `gorm:"column:channel;not null"`
	Status         string  `gorm:"column:status;not null"`
	SentAt         *int64  `gorm:"column:sent_at"`
	DeliveredAt    *int64  `gorm:"column:delivered_at"`
	FailedAt       *int64  `gorm:"column:failed_at"`
	ErrorMessage   *string `gorm:"column:error_message"`
	AttemptCount   int     `gorm:"column:attempt_count;not null"`
	CreatedAt      int64   `gorm:"column:created_at"`
	UpdatedAt      int64   `gorm:"column:updated_at"`
}

func (d *NotificationDelivery) BeforeCreate(tx *gorm.DB) (err error) {
	d.ID = uuid.NewString()
	d.CreatedAt = time.Now().UnixMilli()
	d.UpdatedAt = time.Now().UnixMilli()
	return nil
}

func (d *NotificationDelivery) TableName() string {
	return "notification_deliveries"
}
