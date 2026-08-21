package repository

import (
	"hrsaas/internal/modules/employee/entity"
	"hrsaas/internal/modules/employee/model"
	"hrsaas/pkg/repository"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type EmployeeRepository struct {
	repository.Repository[entity.Employee]
	Log *logrus.Logger
}

func NewEmployeeRepository(log *logrus.Logger) *EmployeeRepository {
	return &EmployeeRepository{
		Log: log,
	}
}

func (r *EmployeeRepository) CountByEmployeeNumberAndCompanyID(db *gorm.DB, employeeNumber string, CompanyID string) (int64, error) {
	var total int64
	err := db.Model(new(entity.Employee)).
		Where("employee_number = ?", employeeNumber).
		Where("company_id = ?", CompanyID).Count(&total).Error
	return total, err
}

func (r *EmployeeRepository) FindByUserIdAndCompany(
	db *gorm.DB,
	employee *entity.Employee,
	userId string,
	companyId string,
	preloads ...string,
) error {
	query := db

	for _, preload := range preloads {
		query = query.Preload(preload)
	}

	return query.Where("user_id = ?", userId).
		Where("company_id = ?", companyId).
		Take(employee).Error
}

func (r *EmployeeRepository) Search(db *gorm.DB, request *model.SearchEmployeeRequest) ([]entity.Employee, int64, error) {
	var employee []entity.Employee
	if err := db.Preload("User").
		Order("fullname ASC").
		Preload("EmployeeContract").
		Preload("EmployeeContract.Division").
		Preload("EmployeeContract.Position").
		Scopes(r.FilterSearch(request)).
		Offset((request.Page - 1) * request.Size).Limit(request.Size).
		Find(&employee).Error; err != nil {
		return nil, 0, err
	}

	var total int64 = 0
	if err := db.Model(&entity.Employee{}).Scopes(r.FilterSearch(request)).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	return employee, total, nil
}

// ListActiveByCompany returns every active employee of a company, used by the
// payroll module to build payroll details for a period.
func (r *EmployeeRepository) ListActiveByCompany(db *gorm.DB, companyID string) ([]entity.Employee, error) {
	var employees []entity.Employee
	err := db.
		Where("company_id = ?", companyID).
		Where("is_active = ?", true).
		Order("fullname ASC").
		Find(&employees).Error
	return employees, err
}

func (r *EmployeeRepository) FilterSearch(request *model.SearchEmployeeRequest) func(tx *gorm.DB) *gorm.DB {
	return func(tx *gorm.DB) *gorm.DB {
		tx = tx.Where("company_id = ?", request.CompanyID)

		if key := request.Key; key != "" {
			key = "%" + key + "%"
			tx = tx.Where("fullname ILIKE ?", key).Or("employee_number ILIKE ?", key)
		}

		return tx
	}
}
