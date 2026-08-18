package repository

import (
	"hrsaas/internal/modules/payroll/entity"
	"hrsaas/internal/modules/payroll/model"
	"hrsaas/pkg/repository"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type PayrollPaymentRepository struct {
	repository.Repository[entity.PayrollPayment]
	Log *logrus.Logger
}

func NewPayrollPaymentRepository(log *logrus.Logger) *PayrollPaymentRepository {
	return &PayrollPaymentRepository{Log: log}
}

func (r *PayrollPaymentRepository) List(db *gorm.DB, request *model.SearchPayrollPaymentRequest) ([]entity.PayrollPayment, int64, error) {
	var items []entity.PayrollPayment

	query := db.Model(&entity.PayrollPayment{})
	if request.PayrollID != "" {
		query = query.Joins("JOIN payroll_details ON payroll_details.id = payroll_payments.payroll_detail_id").
			Where("payroll_details.payroll_id = ?", request.PayrollID)
	}
	if request.Status != "" {
		query = query.Where("payroll_payments.status = ?", request.Status)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Order("payroll_payments.created_at DESC").
		Offset((request.Page - 1) * request.Size).Limit(request.Size).
		Find(&items).Error; err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

func (r *PayrollPaymentRepository) FindByID(db *gorm.DB, id string) (*entity.PayrollPayment, error) {
	var item entity.PayrollPayment
	if err := db.Where("id = ?", id).Take(&item).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *PayrollPaymentRepository) ListByPayrollDetail(db *gorm.DB, payrollDetailID string) ([]entity.PayrollPayment, error) {
	var items []entity.PayrollPayment
	err := db.Where("payroll_detail_id = ?", payrollDetailID).Find(&items).Error
	return items, err
}

func (r *PayrollPaymentRepository) ExistsByPayroll(db *gorm.DB, payrollID string) (bool, error) {
	var total int64
	err := db.Model(&entity.PayrollPayment{}).
		Joins("JOIN payroll_details ON payroll_details.id = payroll_payments.payroll_detail_id").
		Where("payroll_details.payroll_id = ?", payrollID).
		Count(&total).Error
	return total > 0, err
}
