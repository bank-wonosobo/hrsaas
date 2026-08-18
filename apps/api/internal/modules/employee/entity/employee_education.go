package entity

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EmployeeEducation struct {
	ID              string   `gorm:"column:id;primaryKey"`
	CompanyID       string   `gorm:"column:company_id;not null"`
	EmployeeID      string   `gorm:"column:employee_id;not null"`
	EducationLevel  string   `gorm:"column:education_level;not null"`
	InstitutionName string   `gorm:"column:institution_name;not null"`
	Major           string   `gorm:"column:major;not null"`
	GraduationYear  int64    `gorm:"column:graduation_year"`
	GPA             *float64 `gorm:"column:gpa"`
	StartYear       *int     `gorm:"column:start_year"`
	EndYear         *int     `gorm:"column:end_year"`
	CreatedAt       int64    `gorm:"column:created_at;autoCreateTime:milli"`
	UpdatedAt       int64    `gorm:"column:updated_at;autoUpdateTime:milli"`
	Employee        Employee `gorm:"foreignKey:EmployeeID;references:ID"`
}

// BeforeCreate hook to set UUID
func (c *EmployeeEducation) BeforeCreate(tx *gorm.DB) (err error) {
	c.ID = uuid.NewString()
	return nil
}

func (c *EmployeeEducation) TableName() string {
	return "employee_educations"
}
