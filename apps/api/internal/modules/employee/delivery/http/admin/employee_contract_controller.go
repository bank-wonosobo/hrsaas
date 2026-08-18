package admin

import (
	"hrsaas/internal/modules/employee/model"
	"hrsaas/internal/modules/employee/usecase"
	"hrsaas/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type EmployeeContractController struct {
	EmployeeContractUseCase *usecase.EmployeeContractUseCase
	Log                     *logrus.Logger
}

func NewEmployeeContractController(
	employeeContractUseCase *usecase.EmployeeContractUseCase,
	log *logrus.Logger,
) *EmployeeContractController {
	return &EmployeeContractController{
		EmployeeContractUseCase: employeeContractUseCase,
		Log:                     log,
	}
}

func (c *EmployeeContractController) CreateEmployeeContract(ctx *fiber.Ctx) error {
	request := new(model.CreateEmployeeContractRequest)
	if err := ctx.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}

	result, err := c.EmployeeContractUseCase.Create(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.EmployeeContractResponse]{Data: result})
}

func (c *EmployeeContractController) ListEmployeeContract(ctx *fiber.Ctx) error {
	request := &model.SearchEmployeeContractRequest{
		EmployeeID: ctx.Query("employee_id"),
		DivisionID: ctx.Query("division_id"),
		PositionID: ctx.Query("position_id"),
		ActiveOnly: ctx.QueryBool("active_only", false),
		Page:       ctx.QueryInt("page", 1),
		Size:       ctx.QueryInt("size", 10),
	}

	result, total, err := c.EmployeeContractUseCase.List(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[[]model.EmployeeContractResponse]{
		Data: result,
		Paging: &response.PageMetadata{
			Page: request.Page, Size: request.Size, TotalItem: total,
			TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
		},
	})
}

func (c *EmployeeContractController) DetailEmployeeContract(ctx *fiber.Ctx) error {
	result, err := c.EmployeeContractUseCase.Detail(ctx.UserContext(), ctx.Params("id"))
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.EmployeeContractResponse]{Data: result})
}

func (c *EmployeeContractController) UpdateEmployeeContract(ctx *fiber.Ctx) error {
	request := new(model.UpdateEmployeeContractRequest)
	if err := ctx.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}

	result, err := c.EmployeeContractUseCase.Update(ctx.UserContext(), ctx.Params("id"), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.EmployeeContractResponse]{Data: result})
}

func (c *EmployeeContractController) DeleteEmployeeContract(ctx *fiber.Ctx) error {
	if err := c.EmployeeContractUseCase.Delete(ctx.UserContext(), ctx.Params("id")); err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[any]{Data: nil})
}
