package repository

import (
	"hrsaas/internal/modules/notification/entity"
	"hrsaas/pkg/repository"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type NotificationDeliveryRepository struct {
	repository.Repository[entity.NotificationDelivery]
	Log *logrus.Logger
}

func NewNotificationDeliveryRepository(log *logrus.Logger) *NotificationDeliveryRepository {
	return &NotificationDeliveryRepository{Log: log}
}

func (r *NotificationDeliveryRepository) CreateBatch(db *gorm.DB, items []entity.NotificationDelivery) error {
	if len(items) == 0 {
		return nil
	}
	return db.Create(&items).Error
}
