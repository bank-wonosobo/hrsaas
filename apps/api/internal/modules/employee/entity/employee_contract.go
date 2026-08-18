package entity

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	companyEntity "hrsaas/internal/modules/company/entity"
)

type EmployeeContract struct {
	ID               string                 `gorm:"column:id;primaryKey"`
	EmployeeID       string                 `gorm:"column:employee_id;not null"`
	ContractType     string                 `gorm:"column:contract_type;not null"`
	StartDate        int64                  `gorm:"column:start_date;not null"`
	EndDate          *int64                 `gorm:"column:end_date"`
	DivisionID       string                 `gorm:"column:division_id;not null"`
	PositionID       string                 `gorm:"column:position_id;not null"`
	EmploymentStatus string                 `gorm:"column:employee_status;not null"`
	Salary           float64                `gorm:"column:salary;not null"`
	Employee         Employee               `gorm:"foreignKey:EmployeeID;references:ID"`
	Division         companyEntity.Division `gorm:"foreignKey:DivisionID;references:ID"`
	Position         companyEntity.Position `gorm:"foreignKey:PositionID;references:ID"`
	IsActive         bool                   `gorm:"column:is_active;not null"`
}

// BeforeCreate hook to set UUID
func (c *EmployeeContract) BeforeCreate(tx *gorm.DB) (err error) {
	c.ID = uuid.NewString()
	return nil
}

func (c *EmployeeContract) TableName() string {
	return "employee_contracts"
}
