package repository

import (
	"hrsaas/internal/modules/employee/entity"
	"hrsaas/internal/modules/employee/model"
	"hrsaas/pkg/repository"
	"time"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type EmployeeAllowanceRepository struct {
	repository.Repository[entity.EmployeeAllowance]
	Log *logrus.Logger
}

func NewEmployeeAllowanceRepository(log *logrus.Logger) *EmployeeAllowanceRepository {
	return &EmployeeAllowanceRepository{Log: log}
}

func (r *EmployeeAllowanceRepository) List(db *gorm.DB, request *model.SearchEmployeeAllowanceRequest, withRelations bool) ([]entity.EmployeeAllowance, int64, error) {
	var items []entity.EmployeeAllowance

	query := db.Model(&entity.EmployeeAllowance{})
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

func (r *EmployeeAllowanceRepository) FindByID(db *gorm.DB, id string, withRelations bool) (*entity.EmployeeAllowance, error) {
	var item entity.EmployeeAllowance

	query := db.Model(&entity.EmployeeAllowance{})
	if withRelations {
		query = query.Preload("Employee").Preload("SalaryComponent")
	}

	if err := query.Where("id = ?", id).Take(&item).Error; err != nil {
		return nil, err
	}

	return &item, nil
}

// FindActiveByEmployee returns every allowance in effect for the employee at asOf (unix millis).
func (r *EmployeeAllowanceRepository) FindActiveByEmployee(db *gorm.DB, employeeID string, asOf int64) ([]entity.EmployeeAllowance, error) {
	var items []entity.EmployeeAllowance
	err := db.
		Preload("SalaryComponent").
		Where("employee_id = ?", employeeID).
		Where("effective_date <= ?", asOf).
		Where("end_date IS NULL OR end_date >= ?", asOf).
		Find(&items).Error
	return items, err
}
