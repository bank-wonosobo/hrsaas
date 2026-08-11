package http

import (
	"hrsaas-admin-api/internal/modules/employee/model"
	"hrsaas-admin-api/internal/modules/employee/usecase"
	"hrsaas-admin-api/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type EmployeeSalaryController struct {
	EmployeeSalaryUseCase *usecase.EmployeeSalaryUseCase
	Log                   *logrus.Logger
}

func NewEmployeeSalaryController(
	employeeSalaryUseCase *usecase.EmployeeSalaryUseCase,
	log *logrus.Logger,
) *EmployeeSalaryController {
	return &EmployeeSalaryController{
		EmployeeSalaryUseCase: employeeSalaryUseCase,
		Log:                   log,
	}
}

func (c *EmployeeSalaryController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateEmployeeSalaryRequest)
	if err := ctx.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}

	result, err := c.EmployeeSalaryUseCase.Create(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.EmployeeSalaryResponse]{Data: result})
}

func (c *EmployeeSalaryController) List(ctx *fiber.Ctx) error {
	request := &model.SearchEmployeeSalaryRequest{
		EmployeeID: ctx.Query("employee_id"),
		ActiveOnly: ctx.QueryBool("active_only", false),
		Page:       ctx.QueryInt("page", 1),
		Size:       ctx.QueryInt("size", 10),
	}

	result, total, err := c.EmployeeSalaryUseCase.List(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[[]model.EmployeeSalaryResponse]{
		Data: result,
		Paging: &response.PageMetadata{
			Page: request.Page, Size: request.Size, TotalItem: total,
			TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
		},
	})
}

func (c *EmployeeSalaryController) Detail(ctx *fiber.Ctx) error {
	result, err := c.EmployeeSalaryUseCase.Detail(ctx.UserContext(), ctx.Params("id"))
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.EmployeeSalaryResponse]{Data: result})
}

func (c *EmployeeSalaryController) Update(ctx *fiber.Ctx) error {
	request := new(model.UpdateEmployeeSalaryRequest)
	if err := ctx.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}

	result, err := c.EmployeeSalaryUseCase.Update(ctx.UserContext(), ctx.Params("id"), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.EmployeeSalaryResponse]{Data: result})
}

func (c *EmployeeSalaryController) Delete(ctx *fiber.Ctx) error {
	if err := c.EmployeeSalaryUseCase.Delete(ctx.UserContext(), ctx.Params("id")); err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[any]{Data: nil})
}
