package entity

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EmployeeTraining struct {
	ID             string   `gorm:"column:id;primaryKey"`
	CompanyID      string   `gorm:"column:company_id;not null"`
	EmployeeID     string   `gorm:"column:employee_id;not null"`
	TrainingName   string   `gorm:"column:training_name;not null"`
	Organizer      string   `gorm:"column:organizer;not null"`
	StartDate      int64    `gorm:"column:start_date;not null"`
	EndDate        *int64   `gorm:"column:end_date"`
	CertificateURL *string  `gorm:"column:certificate_url"`
	CreatedAt      int64    `gorm:"column:created_at;autoCreateTime:milli"`
	UpdatedAt      int64    `gorm:"column:updated_at;autoUpdateTime:milli"`
	Employee       Employee `gorm:"foreignKey:EmployeeID;references:ID"`
}

func (c *EmployeeTraining) BeforeCreate(tx *gorm.DB) (err error) {
	c.ID = uuid.NewString()
	return nil
}

func (c *EmployeeTraining) TableName() string {
	return "employee_trainings"
}
