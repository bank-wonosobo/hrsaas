package repository

import (
	"hrsaas/internal/modules/employee/entity"
	"hrsaas/internal/modules/employee/model"
	"hrsaas/pkg/repository"
	"time"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type EmployeeSalaryRepository struct {
	repository.Repository[entity.EmployeeSalary]
	Log *logrus.Logger
}

func NewEmployeeSalaryRepository(log *logrus.Logger) *EmployeeSalaryRepository {
	return &EmployeeSalaryRepository{Log: log}
}

func (r *EmployeeSalaryRepository) List(db *gorm.DB, request *model.SearchEmployeeSalaryRequest, withRelations bool) ([]entity.EmployeeSalary, int64, error) {
	var items []entity.EmployeeSalary

	query := db.Model(&entity.EmployeeSalary{})
	if withRelations {
		query = query.Preload("Employee")
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

func (r *EmployeeSalaryRepository) FindByID(db *gorm.DB, id string, withRelations bool) (*entity.EmployeeSalary, error) {
	var item entity.EmployeeSalary

	query := db.Model(&entity.EmployeeSalary{})
	if withRelations {
		query = query.Preload("Employee")
	}

	if err := query.Where("id = ?", id).Take(&item).Error; err != nil {
		return nil, err
	}

	return &item, nil
}

// FindActiveByEmployee returns the employee's basic salary in effect at asOf (unix millis).
func (r *EmployeeSalaryRepository) FindActiveByEmployee(db *gorm.DB, employeeID string, asOf int64) (*entity.EmployeeSalary, error) {
	var item entity.EmployeeSalary
	if err := db.
		Where("employee_id = ?", employeeID).
		Where("effective_date <= ?", asOf).
		Where("end_date IS NULL OR end_date >= ?", asOf).
		Order("effective_date DESC").
		Limit(1).
		Take(&item).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

// CloseOpenEndedByEmployee closes any still-open salary record for the employee by
// setting its end_date, so a new salary record does not overlap with the previous one.
func (r *EmployeeSalaryRepository) CloseOpenEndedByEmployee(db *gorm.DB, employeeID string, endDate int64) error {
	return db.Model(&entity.EmployeeSalary{}).
		Where("employee_id = ?", employeeID).
		Where("end_date IS NULL").
		Update("end_date", endDate).Error
}
