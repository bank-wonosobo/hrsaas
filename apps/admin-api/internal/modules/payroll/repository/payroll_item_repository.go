package repository

import (
	"hrsaas-admin-api/internal/modules/payroll/entity"
	"hrsaas-admin-api/pkg/repository"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type PayrollItemRepository struct {
	repository.Repository[entity.PayrollItem]
	Log *logrus.Logger
}

func NewPayrollItemRepository(log *logrus.Logger) *PayrollItemRepository {
	return &PayrollItemRepository{Log: log}
}

func (r *PayrollItemRepository) ListByPayrollDetail(db *gorm.DB, payrollDetailID string) ([]entity.PayrollItem, error) {
	var items []entity.PayrollItem
	err := db.
		Preload("SalaryComponent").
		Where("payroll_detail_id = ?", payrollDetailID).
		Find(&items).Error
	return items, err
}

func (r *PayrollItemRepository) DeleteByPayrollDetail(db *gorm.DB, payrollDetailID string) error {
	return db.Where("payroll_detail_id = ?", payrollDetailID).Delete(&entity.PayrollItem{}).Error
}
