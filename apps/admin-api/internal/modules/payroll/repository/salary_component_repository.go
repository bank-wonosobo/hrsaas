package repository

import (
	"hrsaas-admin-api/internal/modules/payroll/entity"
	"hrsaas-admin-api/internal/modules/payroll/model"
	"hrsaas-admin-api/pkg/repository"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type SalaryComponentRepository struct {
	repository.Repository[entity.SalaryComponent]
	Log *logrus.Logger
}

func NewSalaryComponentRepository(log *logrus.Logger) *SalaryComponentRepository {
	return &SalaryComponentRepository{Log: log}
}

func (r *SalaryComponentRepository) List(db *gorm.DB, request *model.SearchSalaryComponentRequest) ([]entity.SalaryComponent, int64, error) {
	var items []entity.SalaryComponent

	query := db.Model(&entity.SalaryComponent{})
	if request.Key != "" {
		like := "%" + request.Key + "%"
		query = query.Where("code ILIKE ? OR name ILIKE ?", like, like)
	}
	if request.Type != "" {
		query = query.Where("type = ?", request.Type)
	}
	if request.ActiveOnly {
		query = query.Where("is_active = ?", true)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Order("name ASC").Offset((request.Page - 1) * request.Size).Limit(request.Size).Find(&items).Error; err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

func (r *SalaryComponentRepository) FindByID(db *gorm.DB, id string) (*entity.SalaryComponent, error) {
	var item entity.SalaryComponent
	if err := db.Where("id = ?", id).Take(&item).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *SalaryComponentRepository) FindByIDs(db *gorm.DB, ids []string) ([]entity.SalaryComponent, error) {
	var items []entity.SalaryComponent
	if len(ids) == 0 {
		return items, nil
	}
	if err := db.Where("id IN ?", ids).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *SalaryComponentRepository) CountByCode(db *gorm.DB, code string, excludeID string) (int64, error) {
	var total int64
	query := db.Model(&entity.SalaryComponent{}).Where("code = ?", code)
	if excludeID != "" {
		query = query.Where("id <> ?", excludeID)
	}
	err := query.Count(&total).Error
	return total, err
}
