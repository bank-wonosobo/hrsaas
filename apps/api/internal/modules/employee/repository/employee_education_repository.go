package repository

import (
	"hrsaas/internal/modules/employee/entity"
	"hrsaas/internal/modules/employee/model"
	"hrsaas/pkg/repository"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type EmployeeEducationRepository struct {
	repository.Repository[entity.EmployeeEducation]
	Log *logrus.Logger
}

func NewEmployeeEducationRepository(log *logrus.Logger) *EmployeeEducationRepository {
	return &EmployeeEducationRepository{Log: log}
}

func (r *EmployeeEducationRepository) List(
	db *gorm.DB,
	request *model.SearchEmployeeEducationRequest,
) ([]entity.EmployeeEducation, int64, error) {
	var items []entity.EmployeeEducation

	query := db.Model(&entity.EmployeeEducation{}).Preload("Employee")
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
		Order("graduation_year DESC").
		Offset((request.Page - 1) * request.Size).
		Limit(request.Size).
		Find(&items).Error; err != nil {
		return nil, 0, err
	}

	return items, total, nil
}
