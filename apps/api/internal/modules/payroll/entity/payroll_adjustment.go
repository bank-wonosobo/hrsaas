package entity

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PayrollAdjustment records ad-hoc additions/corrections (bonus, THR, correction, ...)
// for a payroll detail, kept separate from the fixed salary component snapshot in PayrollItem.
type PayrollAdjustment struct {
	ID              string  `gorm:"column:id;primaryKey"`
	PayrollDetailID string  `gorm:"column:payroll_detail_id;not null"`
	Type            string  `gorm:"column:type;not null"`
	Name            string  `gorm:"column:name;not null"`
	Amount          float64 `gorm:"column:amount;not null"`
	Description     *string `gorm:"column:description"`
	CreatedAt       int64   `gorm:"column:created_at;autoCreateTime:milli"`
}

// BeforeCreate hook to set UUID.
func (a *PayrollAdjustment) BeforeCreate(tx *gorm.DB) (err error) {
	a.ID = uuid.NewString()
	return nil
}

func (a *PayrollAdjustment) TableName() string {
	return "payroll_adjustments"
}
