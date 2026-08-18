package repository

import (
	"hrsaas/internal/modules/payroll/entity"
	"hrsaas/pkg/repository"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type PayrollAdjustmentRepository struct {
	repository.Repository[entity.PayrollAdjustment]
	Log *logrus.Logger
}

func NewPayrollAdjustmentRepository(log *logrus.Logger) *PayrollAdjustmentRepository {
	return &PayrollAdjustmentRepository{Log: log}
}

func (r *PayrollAdjustmentRepository) ListByPayrollDetail(db *gorm.DB, payrollDetailID string) ([]entity.PayrollAdjustment, error) {
	var items []entity.PayrollAdjustment
	err := db.Where("payroll_detail_id = ?", payrollDetailID).Order("created_at ASC").Find(&items).Error
	return items, err
}

func (r *PayrollAdjustmentRepository) FindByID(db *gorm.DB, id string) (*entity.PayrollAdjustment, error) {
	var item entity.PayrollAdjustment
	if err := db.Where("id = ?", id).Take(&item).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *PayrollAdjustmentRepository) SumByPayrollDetail(db *gorm.DB, payrollDetailID string) (float64, error) {
	var sum float64
	err := db.Model(&entity.PayrollAdjustment{}).
		Where("payroll_detail_id = ?", payrollDetailID).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&sum).Error
	return sum, err
}
