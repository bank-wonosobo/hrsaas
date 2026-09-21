package entity

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PayrollPayment struct {
	ID               string  `gorm:"column:id;primaryKey"`
	PayrollDetailID  string  `gorm:"column:payroll_detail_id;not null"`
	EmployeeID       string  `gorm:"column:employee_id;not null"`
	BankName         *string `gorm:"column:bank_name"`
	BankAccount      *string `gorm:"column:bank_account"`
	AccountName      *string `gorm:"column:account_name"`
	Amount           float64 `gorm:"column:amount;not null"`
	PaymentReference *string `gorm:"column:payment_reference"`
	PaidAt           *int64  `gorm:"column:paid_at"`
	Status           string  `gorm:"column:status;not null"`
	CreatedAt        int64   `gorm:"column:created_at;autoCreateTime:milli"`
	UpdatedAt        int64   `gorm:"column:updated_at;autoUpdateTime:milli"`
}

// BeforeCreate hook to set UUID.
func (p *PayrollPayment) BeforeCreate(tx *gorm.DB) (err error) {
	p.ID = uuid.NewString()
	return nil
}

func (p *PayrollPayment) TableName() string {
	return "payroll_payments"
}
