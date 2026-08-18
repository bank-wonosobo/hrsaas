package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Notification stores the content/event of a notification, not who receives
// it. One row here can fan out to many NotificationRecipient rows.
type Notification struct {
	ID         string  `gorm:"column:id;primaryKey"`
	CompanyID  string  `gorm:"column:company_id;not null"`
	TemplateID *string `gorm:"column:template_id"`
	Type       string  `gorm:"column:type;not null"`
	Category   string  `gorm:"column:category;not null"`
	Title      string  `gorm:"column:title;not null"`
	Body       string  `gorm:"column:body;not null"`
	Priority   string  `gorm:"column:priority;not null"`

	// ReferenceType/ReferenceID point generically at the source entity
	// (leave_request, payroll, attendance, ...) instead of a FK per module,
	// so this module stays independent of every other module's schema.
	ReferenceType *string `gorm:"column:reference_type"`
	ReferenceID   *string `gorm:"column:reference_id"`
	ActionURL     *string `gorm:"column:action_url"`
	Data          *string `gorm:"column:data;type:jsonb"`

	CreatedBy   *string `gorm:"column:created_by"`
	ScheduledAt *int64  `gorm:"column:scheduled_at"`
	PublishedAt *int64  `gorm:"column:published_at"`

	CreatedAt int64 `gorm:"column:created_at"`
	UpdatedAt int64 `gorm:"column:updated_at"`
}

func (n *Notification) BeforeCreate(tx *gorm.DB) (err error) {
	n.ID = uuid.NewString()
	n.CreatedAt = time.Now().UnixMilli()
	n.UpdatedAt = time.Now().UnixMilli()
	return nil
}

func (n *Notification) TableName() string {
	return "notifications"
}
