package admin

import (
	"hrsaas/internal/modules/user/model"
	"hrsaas/internal/modules/user/usecase"
	"hrsaas/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type RoleController struct {
	UseCase *usecase.RoleUseCase
	Log     *logrus.Logger
}

func NewRoleController(useCase *usecase.RoleUseCase, log *logrus.Logger) *RoleController {
	return &RoleController{UseCase: useCase, Log: log}
}

func (c *RoleController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateRoleRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	result, err := c.UseCase.Create(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.RoleResponse]{Data: result})
}

func (c *RoleController) List(ctx *fiber.Ctx) error {
	request := &model.SearchRoleRequest{
		Name: ctx.Query("name", ""),
		Page: ctx.QueryInt("page", 1),
		Size: ctx.QueryInt("size", 10),
	}

	responses, total, err := c.UseCase.List(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[[]model.RoleResponse]{
		Data: responses,
		Paging: &response.PageMetadata{
			Page:      request.Page,
			Size:      request.Size,
			TotalItem: total,
			TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
		},
	})
}

func (c *RoleController) Detail(ctx *fiber.Ctx) error {
	id := ctx.Params("id")

	result, err := c.UseCase.Detail(ctx.UserContext(), id)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.RoleResponse]{Data: result})
}

func (c *RoleController) Update(ctx *fiber.Ctx) error {
	request := new(model.UpdateRoleRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	request.ID = ctx.Params("id")

	result, err := c.UseCase.Update(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.RoleResponse]{Data: result})
}

func (c *RoleController) Delete(ctx *fiber.Ctx) error {
	id := ctx.Params("id")

	if err := c.UseCase.Delete(ctx.UserContext(), id); err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[any]{Data: nil})
}

func (c *RoleController) AssignPermissions(ctx *fiber.Ctx) error {
	request := new(model.AssignPermissionRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	request.RoleID = ctx.Params("id")

	result, err := c.UseCase.AssignPermissions(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.RoleResponse]{Data: result})
}
