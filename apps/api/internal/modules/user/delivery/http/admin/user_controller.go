package admin

import (
	"hrsaas/internal/modules/user/model"
	"hrsaas/internal/modules/user/usecase"
	"hrsaas/pkg/response"
	"math"

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
	user := ctx.Locals("user").(*model.UserResponse)
	return ctx.JSON(response.WebResponse[*model.UserResponse]{Data: user})
}

// func (c *UserController) ChangePassword(ctx *fiber.Ctx) error {
// 	user := ctx.Locals("user").(*model.UserResponse)
// 	request := new(model.ChangePasswordRequest)
// 	if err := ctx.BodyParser(request); err != nil {
// 		c.Log.WithError(err).Error("failed to parse request body")
// 		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
// 	}

// 	if err := c.UserUseCase.ChangePassword(ctx.UserContext(), user.ID, request); err != nil {
// 		c.Log.WithError(err).Error("failed to change password")
// 		return err
// 	}

// 	return ctx.JSON(response.WebResponse[any]{Data: nil})
// }

func (c *UserController) ResetPassword(ctx *fiber.Ctx) error {
	request := new(model.ResetPasswordRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	if err := c.UserUseCase.ResetPassword(ctx.UserContext(), ctx.Params("id"), request); err != nil {
		c.Log.WithError(err).Error("failed to reset password")
		return err
	}

	return ctx.JSON(response.WebResponse[any]{Data: nil})
}

func (c *UserController) List(ctx *fiber.Ctx) error {
	request := &model.SearchUserRequest{
		Key:  ctx.Query("key", ""),
		Page: ctx.QueryInt("page", 1),
		Size: ctx.QueryInt("size", 10),
	}

	users, total, err := c.UserUseCase.List(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list users")
		return err
	}

	return ctx.JSON(response.WebResponse[[]model.UserResponse]{
		Data: users,
		Paging: &response.PageMetadata{
			Page:      request.Page,
			Size:      request.Size,
			TotalItem: total,
			TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
		},
	})
}

func (c *UserController) Detail(ctx *fiber.Ctx) error {
	user, err := c.UserUseCase.Detail(ctx.UserContext(), ctx.Params("id"))
	if err != nil {
		c.Log.WithError(err).Error("failed to get user detail")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.UserResponse]{Data: user})
}

func (c *UserController) Update(ctx *fiber.Ctx) error {
	request := new(model.UpdateUserRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	request.ID = ctx.Params("id")
	user, err := c.UserUseCase.Update(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to update user")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.UserResponse]{Data: user})
}

func (c *UserController) Delete(ctx *fiber.Ctx) error {
	if err := c.UserUseCase.Delete(ctx.UserContext(), ctx.Params("id")); err != nil {
		c.Log.WithError(err).Error("failed to delete user")
		return err
	}

	return ctx.JSON(response.WebResponse[any]{Data: nil})
}
