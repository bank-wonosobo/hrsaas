package repository

import (
	"hrsaas/internal/modules/payroll/entity"
	"hrsaas/pkg/repository"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type PayrollDetailRepository struct {
	repository.Repository[entity.PayrollDetail]
	Log *logrus.Logger
}

func NewPayrollDetailRepository(log *logrus.Logger) *PayrollDetailRepository {
	return &PayrollDetailRepository{Log: log}
}

func (r *PayrollDetailRepository) FindByID(db *gorm.DB, id string, withRelations bool) (*entity.PayrollDetail, error) {
	var item entity.PayrollDetail

	query := db.Model(&entity.PayrollDetail{})
	if withRelations {
		query = query.Preload("Items").Preload("Adjustments").Preload("Payments")
	}

	if err := query.Where("id = ?", id).Take(&item).Error; err != nil {
		return nil, err
	}

	return &item, nil
}

func (r *PayrollDetailRepository) ListByPayroll(db *gorm.DB, payrollID string) ([]entity.PayrollDetail, error) {
	var items []entity.PayrollDetail
	err := db.
		Preload("Items").
		Preload("Adjustments").
		Where("payroll_id = ?", payrollID).
		Find(&items).Error
	return items, err
}

func (r *PayrollDetailRepository) DeleteByPayroll(db *gorm.DB, payrollID string) error {
	return db.Where("payroll_id = ?", payrollID).Delete(&entity.PayrollDetail{}).Error
}
