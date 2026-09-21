package entity

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	userEntity "hrsaas/internal/modules/user/entity"
)

type Payroll struct {
	ID             string  `gorm:"column:id;primaryKey"`
	CompanyID      string  `gorm:"column:company_id;not null"`
	PayrollNumber  string  `gorm:"column:payroll_number;not null"`
	PeriodMonth    int     `gorm:"column:period_month;not null"`
	PeriodYear     int     `gorm:"column:period_year;not null"`
	PaymentDate    *int64  `gorm:"column:payment_date"`
	Status         string  `gorm:"column:status;not null"`
	TotalGross     float64 `gorm:"column:total_gross;not null"`
	TotalDeduction float64 `gorm:"column:total_deduction;not null"`
	TotalNet       float64 `gorm:"column:total_net;not null"`
	CreatedBy      *string `gorm:"column:created_by"`
	ApprovedBy     *string `gorm:"column:approved_by"`
	ApprovedAt     *int64  `gorm:"column:approved_at"`
	CreatedAt      int64   `gorm:"column:created_at;autoCreateTime:milli"`
	UpdatedAt      int64   `gorm:"column:updated_at;autoUpdateTime:milli"`

	Details        []PayrollDetail   `gorm:"foreignKey:PayrollID;references:ID"`
	Approvals      []PayrollApproval `gorm:"foreignKey:PayrollID;references:ID"`
	CreatedByUser  *userEntity.User  `gorm:"foreignKey:CreatedBy;references:ID"`
	ApprovedByUser *userEntity.User  `gorm:"foreignKey:ApprovedBy;references:ID"`
}

// BeforeCreate hook to set UUID.
func (p *Payroll) BeforeCreate(tx *gorm.DB) (err error) {
	p.ID = uuid.NewString()
	return nil
}

func (p *Payroll) TableName() string {
	return "payrolls"
}
