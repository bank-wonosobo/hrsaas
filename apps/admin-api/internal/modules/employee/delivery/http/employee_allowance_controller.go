package http

import (
	"hrsaas-admin-api/internal/modules/employee/model"
	"hrsaas-admin-api/internal/modules/employee/usecase"
	"hrsaas-admin-api/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type EmployeeAllowanceController struct {
	EmployeeAllowanceUseCase *usecase.EmployeeAllowanceUseCase
	Log                      *logrus.Logger
}

func NewEmployeeAllowanceController(
	employeeAllowanceUseCase *usecase.EmployeeAllowanceUseCase,
	log *logrus.Logger,
) *EmployeeAllowanceController {
	return &EmployeeAllowanceController{
		EmployeeAllowanceUseCase: employeeAllowanceUseCase,
		Log:                      log,
	}
}

func (c *EmployeeAllowanceController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateEmployeeAllowanceRequest)
	if err := ctx.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}

	result, err := c.EmployeeAllowanceUseCase.Create(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.EmployeeAllowanceResponse]{Data: result})
}

func (c *EmployeeAllowanceController) List(ctx *fiber.Ctx) error {
	request := &model.SearchEmployeeAllowanceRequest{
		EmployeeID: ctx.Query("employee_id"),
		ActiveOnly: ctx.QueryBool("active_only", false),
		Page:       ctx.QueryInt("page", 1),
		Size:       ctx.QueryInt("size", 10),
	}

	result, total, err := c.EmployeeAllowanceUseCase.List(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[[]model.EmployeeAllowanceResponse]{
		Data: result,
		Paging: &response.PageMetadata{
			Page: request.Page, Size: request.Size, TotalItem: total,
			TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
		},
	})
}

func (c *EmployeeAllowanceController) Detail(ctx *fiber.Ctx) error {
	result, err := c.EmployeeAllowanceUseCase.Detail(ctx.UserContext(), ctx.Params("id"))
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.EmployeeAllowanceResponse]{Data: result})
}

func (c *EmployeeAllowanceController) Update(ctx *fiber.Ctx) error {
	request := new(model.UpdateEmployeeAllowanceRequest)
	if err := ctx.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}

	result, err := c.EmployeeAllowanceUseCase.Update(ctx.UserContext(), ctx.Params("id"), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.EmployeeAllowanceResponse]{Data: result})
}

func (c *EmployeeAllowanceController) Delete(ctx *fiber.Ctx) error {
	if err := c.EmployeeAllowanceUseCase.Delete(ctx.UserContext(), ctx.Params("id")); err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[any]{Data: nil})
}
