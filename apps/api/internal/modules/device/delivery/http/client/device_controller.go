package client

import (
	"hrsaas/internal/modules/device/model"
	"hrsaas/internal/modules/device/usecase"
	"hrsaas/pkg/auth"
	"hrsaas/pkg/response"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type DeviceController struct {
	DeviceUseCase *usecase.DeviceUseCase
	Log           *logrus.Logger
}

func NewDeviceController(deviceUseCase *usecase.DeviceUseCase, log *logrus.Logger) *DeviceController {
	return &DeviceController{
		DeviceUseCase: deviceUseCase,
		Log:           log,
	}
}

// Register saves (or reassigns) the current device's push token, called by
// the mobile app right after login.
func (c *DeviceController) Register(ctx *fiber.Ctx) error {
	request := new(model.RegisterDeviceRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	user := auth.GetUser(ctx)
	request.UserID = user.ID

	result, err := c.DeviceUseCase.Register(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to register device")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.DeviceResponse]{Data: result})
}
