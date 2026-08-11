package repository

import (
	"hrsaas-admin-api/internal/modules/payroll/entity"
	"hrsaas-admin-api/pkg/repository"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type PayrollApprovalRepository struct {
	repository.Repository[entity.PayrollApproval]
	Log *logrus.Logger
}

func NewPayrollApprovalRepository(log *logrus.Logger) *PayrollApprovalRepository {
	return &PayrollApprovalRepository{Log: log}
}

func (r *PayrollApprovalRepository) ListByPayroll(db *gorm.DB, payrollID string) ([]entity.PayrollApproval, error) {
	var items []entity.PayrollApproval
	err := db.Where("payroll_id = ?", payrollID).Order("level ASC, created_at ASC").Find(&items).Error
	return items, err
}

func (r *PayrollApprovalRepository) CountByPayroll(db *gorm.DB, payrollID string) (int64, error) {
	var total int64
	err := db.Model(&entity.PayrollApproval{}).Where("payroll_id = ?", payrollID).Count(&total).Error
	return total, err
}
