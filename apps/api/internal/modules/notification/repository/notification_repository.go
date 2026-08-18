package repository

import (
	"hrsaas/internal/modules/notification/entity"
	"hrsaas/pkg/repository"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type NotificationRepository struct {
	repository.Repository[entity.Notification]
	Log *logrus.Logger
}

func NewNotificationRepository(log *logrus.Logger) *NotificationRepository {
	return &NotificationRepository{Log: log}
}

func (r *NotificationRepository) FindByIDAndCompany(db *gorm.DB, id string, companyID string) (*entity.Notification, error) {
	var item entity.Notification
	if err := db.Where("id = ?", id).Where("company_id = ?", companyID).Take(&item).Error; err != nil {
		return nil, err
	}
	return &item, nil
}
