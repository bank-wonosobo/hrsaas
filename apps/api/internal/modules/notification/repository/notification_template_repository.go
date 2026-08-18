package repository

import (
	"hrsaas/internal/modules/notification/entity"
	"hrsaas/internal/modules/notification/model"
	"hrsaas/pkg/repository"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type NotificationTemplateRepository struct {
	repository.Repository[entity.NotificationTemplate]
	Log *logrus.Logger
}

func NewNotificationTemplateRepository(log *logrus.Logger) *NotificationTemplateRepository {
	return &NotificationTemplateRepository{Log: log}
}

func (r *NotificationTemplateRepository) Search(db *gorm.DB, request *model.SearchNotificationTemplateRequest) ([]entity.NotificationTemplate, int64, error) {
	var items []entity.NotificationTemplate

	if err := db.Scopes(r.FilterSearch(request)).
		Order("name ASC").
		Offset((request.Page - 1) * request.Size).
		Limit(request.Size).
		Find(&items).Error; err != nil {
		return nil, 0, err
	}

	var total int64
	if err := db.Model(&entity.NotificationTemplate{}).Scopes(r.FilterSearch(request)).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

func (r *NotificationTemplateRepository) FilterSearch(request *model.SearchNotificationTemplateRequest) func(tx *gorm.DB) *gorm.DB {
	return func(tx *gorm.DB) *gorm.DB {
		tx = tx.Where("company_id = ?", request.CompanyID)
		if key := request.Key; key != "" {
			key = "%" + key + "%"
			tx = tx.Where("code ILIKE ? OR name ILIKE ?", key, key)
		}
		if request.Category != "" {
			tx = tx.Where("category = ?", request.Category)
		}
		if request.ActiveOnly {
			tx = tx.Where("is_active = ?", true)
		}
		return tx
	}
}

func (r *NotificationTemplateRepository) FindByIDAndCompany(db *gorm.DB, id string, companyID string) (*entity.NotificationTemplate, error) {
	var item entity.NotificationTemplate
	if err := db.Where("id = ?", id).Where("company_id = ?", companyID).Take(&item).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *NotificationTemplateRepository) FindByCodeAndCompany(db *gorm.DB, code string, companyID string) (*entity.NotificationTemplate, error) {
	var item entity.NotificationTemplate
	if err := db.Where("code = ?", code).Where("company_id = ?", companyID).Take(&item).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *NotificationTemplateRepository) CountByCode(db *gorm.DB, code string, companyID string, excludeID string) (int64, error) {
	var total int64
	query := db.Model(&entity.NotificationTemplate{}).
		Where("code = ?", code).
		Where("company_id = ?", companyID)
	if excludeID != "" {
		query = query.Where("id <> ?", excludeID)
	}
	err := query.Count(&total).Error
	return total, err
}
