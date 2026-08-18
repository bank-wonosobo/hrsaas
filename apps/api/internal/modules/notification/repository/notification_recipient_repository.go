package repository

import (
	"hrsaas/internal/modules/notification/entity"
	"hrsaas/internal/modules/notification/model"
	"hrsaas/pkg/repository"
	"time"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type NotificationRecipientRepository struct {
	repository.Repository[entity.NotificationRecipient]
	Log *logrus.Logger
}

func NewNotificationRecipientRepository(log *logrus.Logger) *NotificationRecipientRepository {
	return &NotificationRecipientRepository{Log: log}
}

// CreateBatch inserts every recipient in one statement. It takes a pointer to
// the slice so GORM's BeforeCreate hooks can populate each row's ID back into
// the caller's slice (needed to build the matching delivery rows).
func (r *NotificationRecipientRepository) CreateBatch(db *gorm.DB, items *[]entity.NotificationRecipient) error {
	if len(*items) == 0 {
		return nil
	}
	return db.Create(items).Error
}

func (r *NotificationRecipientRepository) FilterInbox(request *model.SearchInboxRequest) func(tx *gorm.DB) *gorm.DB {
	return func(tx *gorm.DB) *gorm.DB {
		tx = tx.Where("user_id = ?", request.UserID)
		if request.UnreadOnly {
			tx = tx.Where("is_read = ?", false)
		}
		return tx
	}
}

func (r *NotificationRecipientRepository) SearchInbox(db *gorm.DB, request *model.SearchInboxRequest) ([]entity.NotificationRecipient, int64, error) {
	var items []entity.NotificationRecipient

	if err := db.Preload("Notification").
		Scopes(r.FilterInbox(request)).
		Order("created_at DESC").
		Offset((request.Page - 1) * request.Size).
		Limit(request.Size).
		Find(&items).Error; err != nil {
		return nil, 0, err
	}

	var total int64
	if err := db.Model(&entity.NotificationRecipient{}).Scopes(r.FilterInbox(request)).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

func (r *NotificationRecipientRepository) FindByNotificationAndUser(db *gorm.DB, notificationID string, userID string) (*entity.NotificationRecipient, error) {
	var item entity.NotificationRecipient
	if err := db.Preload("Notification").
		Where("notification_id = ?", notificationID).
		Where("user_id = ?", userID).
		Take(&item).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *NotificationRecipientRepository) CountUnread(db *gorm.DB, userID string) (int64, error) {
	var total int64
	err := db.Model(&entity.NotificationRecipient{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&total).Error
	return total, err
}

func (r *NotificationRecipientRepository) MarkAllAsRead(db *gorm.DB, userID string) error {
	now := time.Now().UnixMilli()
	return db.Model(&entity.NotificationRecipient{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Updates(map[string]interface{}{"is_read": true, "read_at": now, "updated_at": now}).Error
}
