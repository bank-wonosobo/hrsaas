package entity

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PayrollDetail is one employee's line within a Payroll. It intentionally only
// keeps EmployeeID (no gorm relation) to avoid an import cycle with the employee
// module, which itself depends on payroll/entity for SalaryComponent; employee
// data is joined in the usecase layer instead.
type PayrollDetail struct {
	ID             string  `gorm:"column:id;primaryKey"`
	PayrollID      string  `gorm:"column:payroll_id;not null"`
	EmployeeID     string  `gorm:"column:employee_id;not null"`
	BasicSalary    float64 `gorm:"column:basic_salary;not null"`
	GrossSalary    float64 `gorm:"column:gross_salary;not null"`
	TotalEarning   float64 `gorm:"column:total_earning;not null"`
	TotalDeduction float64 `gorm:"column:total_deduction;not null"`
	NetSalary      float64 `gorm:"column:net_salary;not null"`
	CreatedAt      int64   `gorm:"column:created_at;autoCreateTime:milli"`
	UpdatedAt      int64   `gorm:"column:updated_at;autoUpdateTime:milli"`

	Items       []PayrollItem       `gorm:"foreignKey:PayrollDetailID;references:ID"`
	Adjustments []PayrollAdjustment `gorm:"foreignKey:PayrollDetailID;references:ID"`
	Payments    []PayrollPayment    `gorm:"foreignKey:PayrollDetailID;references:ID"`
}

// BeforeCreate hook to set UUID.
func (d *PayrollDetail) BeforeCreate(tx *gorm.DB) (err error) {
	d.ID = uuid.NewString()
	return nil
}

func (d *PayrollDetail) TableName() string {
	return "payroll_details"
}
