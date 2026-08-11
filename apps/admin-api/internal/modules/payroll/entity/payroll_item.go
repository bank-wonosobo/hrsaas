package entity

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PayrollItem is a frozen snapshot of one salary component's value for a
// PayrollDetail at the time the payroll was calculated, so old payslips stay
// accurate even if the master salary component or employee compensation changes later.
type PayrollItem struct {
	ID                string   `gorm:"column:id;primaryKey"`
	PayrollDetailID   string   `gorm:"column:payroll_detail_id;not null"`
	SalaryComponentID *string  `gorm:"column:salary_component_id"`
	Name              string   `gorm:"column:name;not null"`
	Type              string   `gorm:"column:type;not null"`
	Amount            float64  `gorm:"column:amount;not null"`
	CalculationValue  *float64 `gorm:"column:calculation_value"`
	CreatedAt         int64    `gorm:"column:created_at;autoCreateTime:milli"`

	SalaryComponent *SalaryComponent `gorm:"foreignKey:SalaryComponentID;references:ID"`
}

// BeforeCreate hook to set UUID.
func (i *PayrollItem) BeforeCreate(tx *gorm.DB) (err error) {
	i.ID = uuid.NewString()
	return nil
}

func (i *PayrollItem) TableName() string {
	return "payroll_items"
}
