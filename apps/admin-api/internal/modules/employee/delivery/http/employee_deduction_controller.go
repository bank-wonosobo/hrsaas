package http

import (
	"hrsaas-admin-api/internal/modules/employee/model"
	"hrsaas-admin-api/internal/modules/employee/usecase"
	"hrsaas-admin-api/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type EmployeeDeductionController struct {
	EmployeeDeductionUseCase *usecase.EmployeeDeductionUseCase
	Log                      *logrus.Logger
}

func NewEmployeeDeductionController(
	employeeDeductionUseCase *usecase.EmployeeDeductionUseCase,
	log *logrus.Logger,
) *EmployeeDeductionController {
	return &EmployeeDeductionController{
		EmployeeDeductionUseCase: employeeDeductionUseCase,
		Log:                      log,
	}
}

func (c *EmployeeDeductionController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateEmployeeDeductionRequest)
	if err := ctx.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}

	result, err := c.EmployeeDeductionUseCase.Create(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.EmployeeDeductionResponse]{Data: result})
}

func (c *EmployeeDeductionController) List(ctx *fiber.Ctx) error {
	request := &model.SearchEmployeeDeductionRequest{
		EmployeeID: ctx.Query("employee_id"),
		ActiveOnly: ctx.QueryBool("active_only", false),
		Page:       ctx.QueryInt("page", 1),
		Size:       ctx.QueryInt("size", 10),
	}

	result, total, err := c.EmployeeDeductionUseCase.List(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[[]model.EmployeeDeductionResponse]{
		Data: result,
		Paging: &response.PageMetadata{
			Page: request.Page, Size: request.Size, TotalItem: total,
			TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
		},
	})
}

func (c *EmployeeDeductionController) Detail(ctx *fiber.Ctx) error {
	result, err := c.EmployeeDeductionUseCase.Detail(ctx.UserContext(), ctx.Params("id"))
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.EmployeeDeductionResponse]{Data: result})
}

func (c *EmployeeDeductionController) Update(ctx *fiber.Ctx) error {
	request := new(model.UpdateEmployeeDeductionRequest)
	if err := ctx.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}

	result, err := c.EmployeeDeductionUseCase.Update(ctx.UserContext(), ctx.Params("id"), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.EmployeeDeductionResponse]{Data: result})
}

func (c *EmployeeDeductionController) Delete(ctx *fiber.Ctx) error {
	if err := c.EmployeeDeductionUseCase.Delete(ctx.UserContext(), ctx.Params("id")); err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[any]{Data: nil})
}
