package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type NotificationTemplate struct {
	ID            string `gorm:"column:id;primaryKey"`
	CompanyID     string `gorm:"column:company_id;not null"`
	Code          string `gorm:"column:code;not null"`
	Name          string `gorm:"column:name;not null"`
	TitleTemplate string `gorm:"column:title_template;not null"`
	BodyTemplate  string `gorm:"column:body_template;not null"`
	Category      string `gorm:"column:category;not null"`
	IsActive      bool   `gorm:"column:is_active;not null"`
	CreatedAt     int64  `gorm:"column:created_at"`
	UpdatedAt     int64  `gorm:"column:updated_at"`
}

func (t *NotificationTemplate) BeforeCreate(tx *gorm.DB) (err error) {
	t.ID = uuid.NewString()
	t.CreatedAt = time.Now().UnixMilli()
	t.UpdatedAt = time.Now().UnixMilli()
	return nil
}

func (t *NotificationTemplate) TableName() string {
	return "notification_templates"
}
