package repository

import (
	"hrsaas-admin-api/internal/modules/payroll/entity"
	"hrsaas-admin-api/internal/modules/payroll/model"
	"hrsaas-admin-api/pkg/repository"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type PayrollRepository struct {
	repository.Repository[entity.Payroll]
	Log *logrus.Logger
}

func NewPayrollRepository(log *logrus.Logger) *PayrollRepository {
	return &PayrollRepository{Log: log}
}

func (r *PayrollRepository) List(db *gorm.DB, request *model.SearchPayrollRequest) ([]entity.Payroll, int64, error) {
	var items []entity.Payroll

	query := db.Model(&entity.Payroll{}).Where("company_id = ?", request.CompanyID)
	if request.Status != "" {
		query = query.Where("status = ?", request.Status)
	}
	if request.PeriodYear != 0 {
		query = query.Where("period_year = ?", request.PeriodYear)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Order("period_year DESC, period_month DESC").
		Offset((request.Page - 1) * request.Size).Limit(request.Size).
		Find(&items).Error; err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

func (r *PayrollRepository) FindByID(db *gorm.DB, id string, withDetails bool) (*entity.Payroll, error) {
	var item entity.Payroll

	query := db.Model(&entity.Payroll{})
	if withDetails {
		query = query.Preload("Details").Preload("Details.Items").Preload("Details.Adjustments")
	}

	if err := query.Where("id = ?", id).Take(&item).Error; err != nil {
		return nil, err
	}

	return &item, nil
}

func (r *PayrollRepository) FindByPeriod(db *gorm.DB, companyID string, month, year int) (*entity.Payroll, error) {
	var item entity.Payroll
	if err := db.
		Where("company_id = ?", companyID).
		Where("period_month = ?", month).
		Where("period_year = ?", year).
		Take(&item).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *PayrollRepository) CountByCompanyAndYear(db *gorm.DB, companyID string, year int) (int64, error) {
	var total int64
	err := db.Model(&entity.Payroll{}).
		Where("company_id = ?", companyID).
		Where("period_year = ?", year).
		Count(&total).Error
	return total, err
}
