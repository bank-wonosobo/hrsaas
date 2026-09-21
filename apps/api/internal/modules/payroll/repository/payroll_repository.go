package repository

import (
	"hrsaas/internal/modules/payroll/entity"

	"hrsaas/pkg/repository"

	"gorm.io/gorm"
)

type PayrollRepository interface {
	Create(
		db *gorm.DB,
		entity *entity.Payroll,
	) error

	Update(db *gorm.DB, entity *entity.Payroll) error

	FindByPeriod(
		db *gorm.DB,
		companyID string,
		month, year int,
	) (*entity.Payroll, error)

	CountByCompanyAndYear(
		db *gorm.DB,
		companyID string,
		year int) (int64, error)

	FindById(
		db *gorm.DB,
		entity *entity.Payroll,
		id any,
		preloads ...string,
	) error
}

type payrollRepository struct {
	repository.Repository[entity.Payroll]
}

func NewPayrollRepository(db *gorm.DB) PayrollRepository {
	return &payrollRepository{
		Repository: repository.Repository[entity.Payroll]{
			DB: db,
		},
	}
}

// CountByCompanyAndYear implements PayrollRepository.
func (p *payrollRepository) CountByCompanyAndYear(db *gorm.DB, companyID string, year int) (int64, error) {
	var total int64
	err := db.Model(&entity.Payroll{}).
		Where("company_id = ?", companyID).
		Where("period_year = ?", year).
		Count(&total).Error
	return total, err
}

// FindByPeriod implements PayrollRepository.
func (p *payrollRepository) FindByPeriod(db *gorm.DB, companyID string, month int, year int) (*entity.Payroll, error) {
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
