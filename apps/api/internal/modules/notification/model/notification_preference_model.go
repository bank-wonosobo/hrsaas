package model

import "hrsaas/internal/modules/notification/entity"

type NotificationPreferenceResponse struct {
	ID               string `json:"id"`
	NotificationType string `json:"notification_type"`
	InAppEnabled     bool   `json:"in_app_enabled"`
	EmailEnabled     bool   `json:"email_enabled"`
	PushEnabled      bool   `json:"push_enabled"`
}

// UpdateNotificationPreferenceRequest upserts the preference for one
// notification type. Fields left nil keep their current value (or the
// default of true when the preference row doesn't exist yet).
type UpdateNotificationPreferenceRequest struct {
	NotificationType string `json:"notification_type" validate:"required,max=100"`
	InAppEnabled     *bool  `json:"in_app_enabled,omitempty"`
	EmailEnabled     *bool  `json:"email_enabled,omitempty"`
	PushEnabled      *bool  `json:"push_enabled,omitempty"`
}

func NotificationPreferenceToResponse(item *entity.NotificationPreference) *NotificationPreferenceResponse {
	if item == nil {
		return nil
	}
	return &NotificationPreferenceResponse{
		ID:               item.ID,
		NotificationType: item.NotificationType,
		InAppEnabled:     item.InAppEnabled,
		EmailEnabled:     item.EmailEnabled,
		PushEnabled:      item.PushEnabled,
	}
}

func NotificationPreferencesToResponse(items []entity.NotificationPreference) []NotificationPreferenceResponse {
	if len(items) == 0 {
		return nil
	}
	responses := make([]NotificationPreferenceResponse, 0, len(items))
	for i := range items {
		if response := NotificationPreferenceToResponse(&items[i]); response != nil {
			responses = append(responses, *response)
		}
	}
	return responses
}
