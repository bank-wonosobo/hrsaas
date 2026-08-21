package model

import "hrsaas/internal/modules/device/entity"

// RegisterDeviceRequest is sent by the mobile app right after login to
// register (or refresh) the current device's push token.
type RegisterDeviceRequest struct {
	UserID     string  `json:"-"`
	PushToken  string  `json:"push_token" validate:"required,max=500"`
	DeviceID   *string `json:"device_id,omitempty" validate:"omitempty,max=255"`
	DeviceName *string `json:"device_name,omitempty" validate:"omitempty,max=255"`
	AppVersion *string `json:"app_version,omitempty" validate:"omitempty,max=30"`
	Provider   string  `json:"provider" validate:"required,oneof=expo fcm apns"`
	Platform   string  `json:"platform" validate:"required,oneof=ios android"`
}

type DeviceResponse struct {
	ID         string  `json:"id"`
	DeviceID   *string `json:"device_id,omitempty"`
	DeviceName *string `json:"device_name,omitempty"`
	AppVersion *string `json:"app_version,omitempty"`
	Provider   string  `json:"provider"`
	Platform   string  `json:"platform"`
	IsActive   bool    `json:"is_active"`
	LastSeenAt *int64  `json:"last_seen_at,omitempty"`
	CreatedAt  int64   `json:"created_at"`
}

func DeviceToResponse(item *entity.UserDevice) *DeviceResponse {
	if item == nil {
		return nil
	}
	return &DeviceResponse{
		ID:         item.ID,
		DeviceID:   item.DeviceID,
		DeviceName: item.DeviceName,
		AppVersion: item.AppVersion,
		Provider:   item.Provider,
		Platform:   item.Platform,
		IsActive:   item.IsActive,
		LastSeenAt: item.LastSeenAt,
		CreatedAt:  item.CreatedAt,
	}
}
