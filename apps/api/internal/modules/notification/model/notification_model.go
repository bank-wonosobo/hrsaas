package model

import (
	"encoding/json"

	"hrsaas/internal/modules/notification/entity"
)

const (
	PriorityLow    = "LOW"
	PriorityNormal = "NORMAL"
	PriorityHigh   = "HIGH"
	PriorityUrgent = "URGENT"

	// TargetType values for broadcast notifications. USER is also accepted
	// here for symmetry, but CreateNotificationRequest.UserIDs is the more
	// direct way to target specific people.
	TargetTypeUser           = "USER"
	TargetTypeDivision       = "DIVISION"
	TargetTypePosition       = "POSITION"
	TargetTypeOfficeLocation = "OFFICE_LOCATION"
	TargetTypeRole           = "ROLE"
	TargetTypeAll            = "ALL"

	ChannelInApp = "IN_APP"
	ChannelEmail = "EMAIL"
	ChannelPush  = "PUSH"
	ChannelSMS   = "SMS"

	DeliveryStatusPending    = "PENDING"
	DeliveryStatusProcessing = "PROCESSING"
	DeliveryStatusSent       = "SENT"
	DeliveryStatusDelivered  = "DELIVERED"
	DeliveryStatusFailed     = "FAILED"
)

type NotificationTargetRequest struct {
	TargetType string  `json:"target_type" validate:"required,oneof=USER DIVISION POSITION OFFICE_LOCATION ROLE ALL"`
	TargetID   *string `json:"target_id,omitempty"`
}

// CreateNotificationRequest supports both personal notifications (UserIDs)
// and broadcast notifications (Targets, resolved by division/position/office
// location/role/all). At least one of the two must be provided.
//
// Either TemplateCode or Title+Body must be provided: a template renders
// Title/Body from Data, otherwise Title/Body are used as-is.
type CreateNotificationRequest struct {
	CompanyID string `json:"-"`
	CreatedBy string `json:"-"`

	TemplateCode *string `json:"template_code,omitempty"`
	Type         string  `json:"type,omitempty" validate:"max=50"`
	Category     string  `json:"category" validate:"required,max=50"`
	Title        string  `json:"title,omitempty" validate:"max=255"`
	Body         string  `json:"body,omitempty"`
	Priority     string  `json:"priority,omitempty" validate:"omitempty,oneof=LOW NORMAL HIGH URGENT"`

	ReferenceType *string                `json:"reference_type,omitempty"`
	ReferenceID   *string                `json:"reference_id,omitempty"`
	ActionURL     *string                `json:"action_url,omitempty"`
	Data          map[string]interface{} `json:"data,omitempty"`
	ScheduledAt   *int64                 `json:"scheduled_at,omitempty"`

	UserIDs []string                    `json:"user_ids,omitempty"`
	Targets []NotificationTargetRequest `json:"targets,omitempty" validate:"omitempty,dive"`
}

type NotificationResponse struct {
	ID             string                 `json:"id"`
	Type           string                 `json:"type"`
	Category       string                 `json:"category"`
	Title          string                 `json:"title"`
	Body           string                 `json:"body"`
	Priority       string                 `json:"priority"`
	ReferenceType  *string                `json:"reference_type,omitempty"`
	ReferenceID    *string                `json:"reference_id,omitempty"`
	ActionURL      *string                `json:"action_url,omitempty"`
	Data           map[string]interface{} `json:"data,omitempty"`
	ScheduledAt    *int64                 `json:"scheduled_at,omitempty"`
	PublishedAt    *int64                 `json:"published_at,omitempty"`
	RecipientCount int                    `json:"recipient_count,omitempty"`
	CreatedAt      int64                  `json:"created_at"`
}

type InboxNotificationResponse struct {
	RecipientID  string               `json:"recipient_id"`
	Notification NotificationResponse `json:"notification"`
	IsRead       bool                 `json:"is_read"`
	ReadAt       *int64               `json:"read_at,omitempty"`
}

type SearchInboxRequest struct {
	UserID     string `json:"-" validate:"required"`
	UnreadOnly bool   `json:"unread_only"`
	Page       int    `json:"page" validate:"min=1"`
	Size       int    `json:"size" validate:"min=1,max=100"`
}

type UnreadCountResponse struct {
	Count int64 `json:"count"`
}

func parseData(data *string) map[string]interface{} {
	if data == nil || *data == "" {
		return nil
	}
	var parsed map[string]interface{}
	if err := json.Unmarshal([]byte(*data), &parsed); err != nil {
		return nil
	}
	return parsed
}

func NotificationToResponse(item *entity.Notification) *NotificationResponse {
	if item == nil {
		return nil
	}
	return &NotificationResponse{
		ID:            item.ID,
		Type:          item.Type,
		Category:      item.Category,
		Title:         item.Title,
		Body:          item.Body,
		Priority:      item.Priority,
		ReferenceType: item.ReferenceType,
		ReferenceID:   item.ReferenceID,
		ActionURL:     item.ActionURL,
		Data:          parseData(item.Data),
		ScheduledAt:   item.ScheduledAt,
		PublishedAt:   item.PublishedAt,
		CreatedAt:     item.CreatedAt,
	}
}

func InboxItemToResponse(item *entity.NotificationRecipient) *InboxNotificationResponse {
	if item == nil {
		return nil
	}
	notification := NotificationToResponse(&item.Notification)
	return &InboxNotificationResponse{
		RecipientID:  item.ID,
		Notification: *notification,
		IsRead:       item.IsRead,
		ReadAt:       item.ReadAt,
	}
}

func InboxToResponse(items []entity.NotificationRecipient) []InboxNotificationResponse {
	if len(items) == 0 {
		return nil
	}
	responses := make([]InboxNotificationResponse, 0, len(items))
	for i := range items {
		if response := InboxItemToResponse(&items[i]); response != nil {
			responses = append(responses, *response)
		}
	}
	return responses
}
