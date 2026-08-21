package repository

import (
	"hrsaas/internal/modules/employee/entity"
	"hrsaas/internal/modules/employee/model"
	"hrsaas/pkg/repository"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type EmployeeTrainingRepository struct {
	repository.Repository[entity.EmployeeTraining]
	Log *logrus.Logger
}

func NewEmployeeTrainingRepository(log *logrus.Logger) *EmployeeTrainingRepository {
	return &EmployeeTrainingRepository{Log: log}
}

func (r *EmployeeTrainingRepository) List(
	db *gorm.DB,
	request *model.SearchEmployeeTrainingRequest,
) ([]entity.EmployeeTraining, int64, error) {
	var items []entity.EmployeeTraining

	query := db.Model(&entity.EmployeeTraining{}).Preload("Employee")
	if request.CompanyID != "" {
		query = query.Where("company_id = ?", request.CompanyID)
	}
	if request.EmployeeID != "" {
		query = query.Where("employee_id = ?", request.EmployeeID)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.
		Order("start_date DESC").
		Offset((request.Page - 1) * request.Size).
		Limit(request.Size).
		Find(&items).Error; err != nil {
		return nil, 0, err
	}

	return items, total, nil
}
