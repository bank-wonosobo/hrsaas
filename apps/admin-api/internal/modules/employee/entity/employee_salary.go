package entity

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EmployeeSalary struct {
	ID            string   `gorm:"column:id;primaryKey"`
	EmployeeID    string   `gorm:"column:employee_id;not null"`
	BasicSalary   float64  `gorm:"column:basic_salary;not null"`
	EffectiveDate int64    `gorm:"column:effective_date;not null"`
	EndDate       *int64   `gorm:"column:end_date"`
	CreatedAt     int64    `gorm:"column:created_at;autoCreateTime:milli"`
	UpdatedAt     int64    `gorm:"column:updated_at;autoUpdateTime:milli"`
	Employee      Employee `gorm:"foreignKey:EmployeeID;references:ID"`
}

// BeforeCreate hook to set UUID.
func (s *EmployeeSalary) BeforeCreate(tx *gorm.DB) (err error) {
	s.ID = uuid.NewString()
	return nil
}

func (s *EmployeeSalary) TableName() string {
	return "employee_salary"
}
