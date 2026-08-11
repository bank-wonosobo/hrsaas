package entity

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	userEntity "hrsaas-admin-api/internal/modules/user/entity"
)

type PayrollApproval struct {
	ID         string  `gorm:"column:id;primaryKey"`
	PayrollID  string  `gorm:"column:payroll_id;not null"`
	ApproverID string  `gorm:"column:approver_id;not null"`
	Level      int     `gorm:"column:level;not null"`
	Status     string  `gorm:"column:status;not null"`
	Notes      *string `gorm:"column:notes"`
	ApprovedAt *int64  `gorm:"column:approved_at"`
	CreatedAt  int64   `gorm:"column:created_at;autoCreateTime:milli"`

	Approver userEntity.User `gorm:"foreignKey:ApproverID;references:ID"`
}

// BeforeCreate hook to set UUID.
func (a *PayrollApproval) BeforeCreate(tx *gorm.DB) (err error) {
	a.ID = uuid.NewString()
	return nil
}

func (a *PayrollApproval) TableName() string {
	return "payroll_approvals"
}
