package repository

import (
	"hrsaas-admin-api/internal/modules/employee/entity"
	"hrsaas-admin-api/internal/modules/employee/model"
	"hrsaas-admin-api/pkg/repository"
	"time"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type EmployeeDeductionRepository struct {
	repository.Repository[entity.EmployeeDeduction]
	Log *logrus.Logger
}

func NewEmployeeDeductionRepository(log *logrus.Logger) *EmployeeDeductionRepository {
	return &EmployeeDeductionRepository{Log: log}
}

func (r *EmployeeDeductionRepository) List(db *gorm.DB, request *model.SearchEmployeeDeductionRequest, withRelations bool) ([]entity.EmployeeDeduction, int64, error) {
	var items []entity.EmployeeDeduction

	query := db.Model(&entity.EmployeeDeduction{})
	if withRelations {
		query = query.Preload("Employee").Preload("SalaryComponent")
	}
	if request.EmployeeID != "" {
		query = query.Where("employee_id = ?", request.EmployeeID)
	}
	if request.ActiveOnly {
		now := time.Now().UnixMilli()
		query = query.Where("effective_date <= ?", now).Where("end_date IS NULL OR end_date >= ?", now)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Order("effective_date DESC").Offset((request.Page - 1) * request.Size).Limit(request.Size).Find(&items).Error; err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

func (r *EmployeeDeductionRepository) FindByID(db *gorm.DB, id string, withRelations bool) (*entity.EmployeeDeduction, error) {
	var item entity.EmployeeDeduction

	query := db.Model(&entity.EmployeeDeduction{})
	if withRelations {
		query = query.Preload("Employee").Preload("SalaryComponent")
	}

	if err := query.Where("id = ?", id).Take(&item).Error; err != nil {
		return nil, err
	}

	return &item, nil
}

// FindActiveByEmployee returns every deduction in effect for the employee at asOf (unix millis).
func (r *EmployeeDeductionRepository) FindActiveByEmployee(db *gorm.DB, employeeID string, asOf int64) ([]entity.EmployeeDeduction, error) {
	var items []entity.EmployeeDeduction
	err := db.
		Preload("SalaryComponent").
		Where("employee_id = ?", employeeID).
		Where("effective_date <= ?", asOf).
		Where("end_date IS NULL OR end_date >= ?", asOf).
		Find(&items).Error
	return items, err
}
