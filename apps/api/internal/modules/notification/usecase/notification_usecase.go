package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"hrsaas/internal/modules/notification/entity"
	"hrsaas/internal/modules/notification/model"
	"hrsaas/internal/modules/notification/repository"
	"regexp"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

var templateVarPattern = regexp.MustCompile(`\{\{\s*([a-zA-Z0-9_]+)\s*\}\}`)

type NotificationUseCase struct {
	DB                     *gorm.DB
	Log                    *logrus.Logger
	Validate               *validator.Validate
	NotificationRepository *repository.NotificationRepository
	TargetRepository       *repository.NotificationTargetRepository
	RecipientRepository    *repository.NotificationRecipientRepository
	DeliveryRepository     *repository.NotificationDeliveryRepository
	TemplateRepository     *repository.NotificationTemplateRepository
	PreferenceRepository   *repository.NotificationPreferenceRepository
}

func NewNotificationUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	notificationRepository *repository.NotificationRepository,
	targetRepository *repository.NotificationTargetRepository,
	recipientRepository *repository.NotificationRecipientRepository,
	deliveryRepository *repository.NotificationDeliveryRepository,
	templateRepository *repository.NotificationTemplateRepository,
	preferenceRepository *repository.NotificationPreferenceRepository,
) *NotificationUseCase {
	return &NotificationUseCase{
		DB:                     db,
		Log:                    log,
		Validate:               validate,
		NotificationRepository: notificationRepository,
		TargetRepository:       targetRepository,
		RecipientRepository:    recipientRepository,
		DeliveryRepository:     deliveryRepository,
		TemplateRepository:     templateRepository,
		PreferenceRepository:   preferenceRepository,
	}
}

func (c *NotificationUseCase) Create(ctx context.Context, request *model.CreateNotificationRequest) (*model.NotificationResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	if len(request.UserIDs) == 0 && len(request.Targets) == 0 {
		return nil, fiber.NewError(fiber.StatusBadRequest, "user_ids or targets is required")
	}

	title, body, notifType := request.Title, request.Body, request.Type
	var templateID *string

	if request.TemplateCode != nil && strings.TrimSpace(*request.TemplateCode) != "" {
		tmpl, err := c.TemplateRepository.FindByCodeAndCompany(tx, *request.TemplateCode, request.CompanyID)
		if err != nil {
			c.Log.WithError(err).Error("Notification template not found")
			return nil, fiber.NewError(fiber.StatusNotFound, "Notification template not found")
		}
		title = renderTemplate(tmpl.TitleTemplate, request.Data)
		body = renderTemplate(tmpl.BodyTemplate, request.Data)
		notifType = tmpl.Code
		templateID = &tmpl.ID
		if request.Category == "" {
			request.Category = tmpl.Category
		}
	}

	if strings.TrimSpace(title) == "" || strings.TrimSpace(body) == "" {
		return nil, fiber.NewError(fiber.StatusBadRequest, "title/body or template_code is required")
	}
	if notifType == "" {
		notifType = request.Category
	}

	priority := request.Priority
	if priority == "" {
		priority = model.PriorityNormal
	}

	var dataJSON *string
	if len(request.Data) > 0 {
		if b, err := json.Marshal(request.Data); err == nil {
			s := string(b)
			dataJSON = &s
		}
	}

	notification := &entity.Notification{
		CompanyID:     request.CompanyID,
		TemplateID:    templateID,
		Type:          notifType,
		Category:      request.Category,
		Title:         title,
		Body:          body,
		Priority:      priority,
		ReferenceType: request.ReferenceType,
		ReferenceID:   request.ReferenceID,
		ActionURL:     request.ActionURL,
		Data:          dataJSON,
		ScheduledAt:   request.ScheduledAt,
	}
	if request.CreatedBy != "" {
		notification.CreatedBy = &request.CreatedBy
	}

	now := time.Now().UnixMilli()
	if request.ScheduledAt == nil || *request.ScheduledAt <= now {
		notification.PublishedAt = &now
	}

	if err := c.NotificationRepository.Create(tx, notification); err != nil {
		c.Log.WithError(err).Error("Failed to create notification")
		return nil, fiber.ErrInternalServerError
	}

	userIDSet := map[string]bool{}
	for _, userID := range request.UserIDs {
		if userID != "" {
			userIDSet[userID] = true
		}
	}

	for _, target := range request.Targets {
		targetEntity := &entity.NotificationTarget{
			NotificationID: notification.ID,
			TargetType:     target.TargetType,
			TargetID:       target.TargetID,
		}
		if err := c.TargetRepository.Create(tx, targetEntity); err != nil {
			c.Log.WithError(err).Error("Failed to create notification target")
			return nil, fiber.ErrInternalServerError
		}

		resolved, err := c.TargetRepository.ResolveUserIDs(tx, request.CompanyID, target.TargetType, target.TargetID)
		if err != nil {
			c.Log.WithError(err).Error("Failed to resolve notification target")
			return nil, fiber.ErrInternalServerError
		}
		for _, userID := range resolved {
			userIDSet[userID] = true
		}
	}

	if len(userIDSet) == 0 {
		return nil, fiber.NewError(fiber.StatusBadRequest, "no recipients resolved from user_ids/targets")
	}

	recipients := make([]entity.NotificationRecipient, 0, len(userIDSet))
	for userID := range userIDSet {
		recipients = append(recipients, entity.NotificationRecipient{
			NotificationID: notification.ID,
			UserID:         userID,
		})
	}
	if err := c.RecipientRepository.CreateBatch(tx, &recipients); err != nil {
		c.Log.WithError(err).Error("Failed to create notification recipients")
		return nil, fiber.ErrInternalServerError
	}

	// Deliveries are only fanned out once the notification is actually
	// published; a scheduled notification gets its deliveries when a worker
	// publishes it later (not implemented here — see ScheduledAt on the
	// entity).
	if notification.PublishedAt != nil {
		deliveries := make([]entity.NotificationDelivery, 0, len(recipients)*2)
		for _, recipient := range recipients {
			pref, err := c.PreferenceRepository.FindByUserAndType(tx, recipient.UserID, notification.Type)
			if err != nil {
				pref = nil // no row means "use defaults", not an error
			}
			for _, channel := range enabledChannels(pref) {
				delivery := entity.NotificationDelivery{
					NotificationID: notification.ID,
					RecipientID:    recipient.ID,
					Channel:        channel,
					Status:         model.DeliveryStatusPending,
				}
				// In-app delivery has no external dependency: the recipient
				// row already exists, so it's delivered the moment it's
				// created. Email/push/sms stay pending for a dispatch
				// worker/integration to pick up (TODO: not implemented yet).
				if channel == model.ChannelInApp {
					delivery.Status = model.DeliveryStatusDelivered
					delivery.SentAt = &now
					delivery.DeliveredAt = &now
				}
				deliveries = append(deliveries, delivery)
			}
		}
		if err := c.DeliveryRepository.CreateBatch(tx, deliveries); err != nil {
			c.Log.WithError(err).Error("Failed to create notification deliveries")
			return nil, fiber.ErrInternalServerError
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	response := model.NotificationToResponse(notification)
	response.RecipientCount = len(recipients)
	return response, nil
}

func (c *NotificationUseCase) Inbox(ctx context.Context, request *model.SearchInboxRequest) ([]model.InboxNotificationResponse, int64, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate search query")
		return nil, 0, fiber.ErrBadRequest
	}

	items, total, err := c.RecipientRepository.SearchInbox(tx, request)
	if err != nil {
		c.Log.WithError(err).Error("Failed to search notification inbox")
		return nil, 0, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, 0, fiber.ErrInternalServerError
	}

	return model.InboxToResponse(items), total, nil
}

func (c *NotificationUseCase) Detail(ctx context.Context, notificationID string, userID string) (*model.InboxNotificationResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	item, err := c.RecipientRepository.FindByNotificationAndUser(tx, notificationID, userID)
	if err != nil {
		c.Log.WithError(err).Error("Notification not found")
		return nil, fiber.ErrNotFound
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.InboxItemToResponse(item), nil
}

func (c *NotificationUseCase) MarkAsRead(ctx context.Context, notificationID string, userID string) (*model.InboxNotificationResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	item, err := c.RecipientRepository.FindByNotificationAndUser(tx, notificationID, userID)
	if err != nil {
		c.Log.WithError(err).Error("Notification not found")
		return nil, fiber.ErrNotFound
	}

	if !item.IsRead {
		now := time.Now().UnixMilli()
		item.IsRead = true
		item.ReadAt = &now
		item.UpdatedAt = now

		if err := c.RecipientRepository.Update(tx, item); err != nil {
			c.Log.WithError(err).Error("Failed to mark notification as read")
			return nil, fiber.ErrInternalServerError
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.InboxItemToResponse(item), nil
}

func (c *NotificationUseCase) MarkAllAsRead(ctx context.Context, userID string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.RecipientRepository.MarkAllAsRead(tx, userID); err != nil {
		c.Log.WithError(err).Error("Failed to mark all notifications as read")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return fiber.ErrInternalServerError
	}

	return nil
}

func (c *NotificationUseCase) UnreadCount(ctx context.Context, userID string) (int64, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	count, err := c.RecipientRepository.CountUnread(tx, userID)
	if err != nil {
		c.Log.WithError(err).Error("Failed to count unread notifications")
		return 0, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return 0, fiber.ErrInternalServerError
	}

	return count, nil
}

func (c *NotificationUseCase) Delete(ctx context.Context, id string, companyID string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	item, err := c.NotificationRepository.FindByIDAndCompany(tx, id, companyID)
	if err != nil {
		c.Log.WithError(err).Error("Notification not found")
		return fiber.ErrNotFound
	}

	// Deletes cascade to notification_targets, notification_recipients, and
	// notification_deliveries via the FK ON DELETE CASCADE constraints.
	if err := c.NotificationRepository.Delete(tx, item); err != nil {
		c.Log.WithError(err).Error("Failed to delete notification")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return fiber.ErrInternalServerError
	}

	return nil
}

func renderTemplate(tpl string, data map[string]interface{}) string {
	return templateVarPattern.ReplaceAllStringFunc(tpl, func(match string) string {
		key := templateVarPattern.FindStringSubmatch(match)[1]
		if val, ok := data[key]; ok {
			return fmt.Sprintf("%v", val)
		}
		return match
	})
}

func enabledChannels(pref *entity.NotificationPreference) []string {
	inApp, email, push := true, true, true
	if pref != nil {
		inApp, email, push = pref.InAppEnabled, pref.EmailEnabled, pref.PushEnabled
	}

	channels := make([]string, 0, 3)
	if inApp {
		channels = append(channels, model.ChannelInApp)
	}
	if email {
		channels = append(channels, model.ChannelEmail)
	}
	if push {
		channels = append(channels, model.ChannelPush)
	}
	return channels
}
