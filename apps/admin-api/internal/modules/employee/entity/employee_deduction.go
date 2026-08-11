package entity

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	payrollEntity "hrsaas-admin-api/internal/modules/payroll/entity"
)

type EmployeeDeduction struct {
	ID                string  `gorm:"column:id;primaryKey"`
	EmployeeID        string  `gorm:"column:employee_id;not null"`
	SalaryComponentID string  `gorm:"column:salary_component_id;not null"`
	Amount            float64 `gorm:"column:amount;not null"`
	Percentage        float64 `gorm:"column:percentage;not null"`
	EffectiveDate     int64   `gorm:"column:effective_date;not null"`
	EndDate           *int64  `gorm:"column:end_date"`
	CreatedAt         int64   `gorm:"column:created_at;autoCreateTime:milli"`
	UpdatedAt         int64   `gorm:"column:updated_at;autoUpdateTime:milli"`

	Employee        Employee                      `gorm:"foreignKey:EmployeeID;references:ID"`
	SalaryComponent payrollEntity.SalaryComponent `gorm:"foreignKey:SalaryComponentID;references:ID"`
}

// BeforeCreate hook to set UUID.
func (d *EmployeeDeduction) BeforeCreate(tx *gorm.DB) (err error) {
	d.ID = uuid.NewString()
	return nil
}

func (d *EmployeeDeduction) TableName() string {
	return "employee_deductions"
}
