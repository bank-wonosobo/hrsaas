package admin

import (
	"hrsaas/internal/modules/notification/model"
	"hrsaas/internal/modules/notification/usecase"
	"hrsaas/pkg/auth"
	"hrsaas/pkg/response"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type NotificationPreferenceController struct {
	NotificationPreferenceUseCase *usecase.NotificationPreferenceUseCase
	Log                           *logrus.Logger
}

func NewNotificationPreferenceController(notificationPreferenceUseCase *usecase.NotificationPreferenceUseCase, log *logrus.Logger) *NotificationPreferenceController {
	return &NotificationPreferenceController{
		NotificationPreferenceUseCase: notificationPreferenceUseCase,
		Log:                           log,
	}
}

// List returns the current user's stored channel preferences. A
// notification_type with no row here simply means "all channels enabled".
func (c *NotificationPreferenceController) List(ctx *fiber.Ctx) error {
	user := auth.GetUser(ctx)

	result, err := c.NotificationPreferenceUseCase.List(ctx.UserContext(), user.ID)
	if err != nil {
		c.Log.WithError(err).Error("failed to list notification preferences")
		return err
	}

	return ctx.JSON(response.WebResponse[[]model.NotificationPreferenceResponse]{Data: result})
}

func (c *NotificationPreferenceController) Update(ctx *fiber.Ctx) error {
	request := new(model.UpdateNotificationPreferenceRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	user := auth.GetUser(ctx)
	result, err := c.NotificationPreferenceUseCase.Upsert(ctx.UserContext(), user.ID, request)
	if err != nil {
		c.Log.WithError(err).Error("failed to update notification preference")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.NotificationPreferenceResponse]{Data: result})
}
