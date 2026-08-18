package repository

import (
	"hrsaas/internal/modules/notification/entity"
	"hrsaas/pkg/repository"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type NotificationPreferenceRepository struct {
	repository.Repository[entity.NotificationPreference]
	Log *logrus.Logger
}

func NewNotificationPreferenceRepository(log *logrus.Logger) *NotificationPreferenceRepository {
	return &NotificationPreferenceRepository{Log: log}
}

func (r *NotificationPreferenceRepository) ListByUser(db *gorm.DB, userID string) ([]entity.NotificationPreference, error) {
	var items []entity.NotificationPreference
	err := db.Where("user_id = ?", userID).Order("notification_type ASC").Find(&items).Error
	return items, err
}

func (r *NotificationPreferenceRepository) FindByUserAndType(db *gorm.DB, userID string, notificationType string) (*entity.NotificationPreference, error) {
	var item entity.NotificationPreference
	if err := db.Where("user_id = ?", userID).
		Where("notification_type = ?", notificationType).
		Take(&item).Error; err != nil {
		return nil, err
	}
	return &item, nil
}
