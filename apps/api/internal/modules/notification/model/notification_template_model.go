package model

import "hrsaas/internal/modules/notification/entity"

type NotificationTemplateResponse struct {
	ID            string `json:"id"`
	Code          string `json:"code"`
	Name          string `json:"name"`
	TitleTemplate string `json:"title_template"`
	BodyTemplate  string `json:"body_template"`
	Category      string `json:"category"`
	IsActive      bool   `json:"is_active"`
	CreatedAt     int64  `json:"created_at"`
	UpdatedAt     int64  `json:"updated_at"`
}

type CreateNotificationTemplateRequest struct {
	CompanyID     string `json:"-"`
	Code          string `json:"code" validate:"required,max=100"`
	Name          string `json:"name" validate:"required,max=255"`
	TitleTemplate string `json:"title_template" validate:"required,max=255"`
	BodyTemplate  string `json:"body_template" validate:"required"`
	Category      string `json:"category" validate:"required,max=50"`
}

type UpdateNotificationTemplateRequest struct {
	Name          *string `json:"name,omitempty"`
	TitleTemplate *string `json:"title_template,omitempty"`
	BodyTemplate  *string `json:"body_template,omitempty"`
	Category      *string `json:"category,omitempty"`
	IsActive      *bool   `json:"is_active,omitempty"`
}

type SearchNotificationTemplateRequest struct {
	CompanyID  string `json:"-" validate:"required"`
	Key        string `json:"key" validate:"max=100"`
	Category   string `json:"category"`
	ActiveOnly bool   `json:"active_only"`
	Page       int    `json:"page" validate:"min=1"`
	Size       int    `json:"size" validate:"min=1,max=100"`
}

func NotificationTemplateToResponse(item *entity.NotificationTemplate) *NotificationTemplateResponse {
	if item == nil {
		return nil
	}
	return &NotificationTemplateResponse{
		ID:            item.ID,
		Code:          item.Code,
		Name:          item.Name,
		TitleTemplate: item.TitleTemplate,
		BodyTemplate:  item.BodyTemplate,
		Category:      item.Category,
		IsActive:      item.IsActive,
		CreatedAt:     item.CreatedAt,
		UpdatedAt:     item.UpdatedAt,
	}
}

func NotificationTemplatesToResponse(items []entity.NotificationTemplate) []NotificationTemplateResponse {
	if len(items) == 0 {
		return nil
	}
	responses := make([]NotificationTemplateResponse, 0, len(items))
	for i := range items {
		if response := NotificationTemplateToResponse(&items[i]); response != nil {
			responses = append(responses, *response)
		}
	}
	return responses
}
