package client

import (
	"hrsaas/internal/modules/user/model"
	"hrsaas/internal/modules/user/usecase"
	"hrsaas/pkg/auth"
	"hrsaas/pkg/response"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type UserController struct {
	UserUseCase *usecase.UserUseCase
	Log         *logrus.Logger
}

func NewUserController(userUseCase *usecase.UserUseCase, log *logrus.Logger) *UserController {
	return &UserController{
		UserUseCase: userUseCase,
		Log:         log,
	}
}

func (c *UserController) GetCurrentUser(ctx *fiber.Ctx) error {
	return ctx.JSON(response.WebResponse[*model.UserResponse]{Data: auth.GetUser(ctx)})
}
