package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SalaryComponent struct {
	ID              string `gorm:"column:id;primaryKey"`
	Code            string `gorm:"column:code"`
	Name            string `gorm:"column:name"`
	Type            string `gorm:"column:type"`
	CalculationType string `gorm:"column:calculation_type"`
	IsTaxable       bool   `gorm:"column:is_taxable"`
	IsBpjsBase      bool   `gorm:"column:is_bpjs_base"`
	IsActive        bool   `gorm:"column:is_active"`

	CreatedAt int64 `gorm:"column:created_at"`
	UpdatedAt int64 `gorm:"column:updated_at"`
}

// BeforeCreate hook to set UUID
func (u *SalaryComponent) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.NewString()
	u.CreatedAt = int64(time.Now().UnixMilli())
	u.UpdatedAt = int64(time.Now().UnixMilli())
	return nil
}

func (c *SalaryComponent) TableName() string {
	return "salary_components"
}
