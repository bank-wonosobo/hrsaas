package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	companyEntity "hrsaas-admin-api/internal/modules/company/entity"
	userEntity "hrsaas-admin-api/internal/modules/user/entity"
)

type Employee struct {
	ID             string `gorm:"column:id;primaryKey"`
	CompanyID      string `gorm:"column:company_id;not null"`
	UserID         string `gorm:"column:user_id;not null"`
	EmployeeNumber string `gorm:"column:employee_number;uniqueIndex"`
	Fullname       string `gorm:"column:fullname;not null"`
	Gender         string `gorm:"column:gender;not null"`
	IdentityNumber string `gorm:"column:identity_number;not null"`
	BirthPlace     string `gorm:"column:birth_place;not null"`
	BirthDate      int64  `gorm:"column:birth_date;not null"`
	BlodType       string `gorm:"column:blood_type;not null"`
	MaritalStatus  string `gorm:"column:marital_status;not null"`
	Religion       string `gorm:"column:religion;not null"`
	Phone          string `gorm:"column:phone;not null"`
	Address        string `gorm:"column:address;not null"`
	City           string `gorm:"column:city;not null"`
	Timezone       string `gorm:"column:timezone;not null"`
	BankName       string `gorm:"column:bank_name"`
	BankAccount    string `gorm:"column:bank_account"`
	IsActive       bool   `gorm:"column:is_active;not null"`
	CreatedAt      int64  `gorm:"column:created_at"`
	UpdatedAt      int64  `gorm:"column:updated_at"`

	User               userEntity.User                `gorm:"foreignKey:UserID;references:ID"`
	EmployeeContract   []EmployeeContract             `gorm:"foreignKey:EmployeeID;references:ID"`
	OfficeLocations    []companyEntity.OfficeLocation `gorm:"many2many:employee_office_locations;joinForeignKey:employee_id;joinReferences:office_location_id"`
	EmployeeDocuments  []EmployeeDocument             `gorm:"foreignKey:EmployeeID;references:ID"`
	EmployeeEducations []EmployeeEducation            `gorm:"foreignKey:EmployeeID;references:ID"`
	EmployeeTrainings  []EmployeeTraining             `gorm:"foreignKey:EmployeeID;references:ID"`
}

// BeforeCreate hook to set UUID
func (u *Employee) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.NewString()
	u.CreatedAt = int64(time.Now().UnixMilli())
	u.UpdatedAt = int64(time.Now().UnixMilli())
	return nil
}

func (c *Employee) TableName() string {
	return "employees"
}
