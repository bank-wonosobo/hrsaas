package client

import (
	"hrsaas/internal/modules/employee/model"
	"hrsaas/internal/modules/employee/usecase"
	"hrsaas/pkg/auth"
	"hrsaas/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type EmployeeController struct {
	EmployeeUseCase *usecase.EmployeeUseCase
	Log             *logrus.Logger
}

func NewEmployeeController(
	employeeUseCase *usecase.EmployeeUseCase,
	log *logrus.Logger,
) *EmployeeController {
	return &EmployeeController{
		EmployeeUseCase: employeeUseCase,
		Log:             log,
	}
}

func (c *EmployeeController) ListEmployee(ctx *fiber.Ctx) error {
	request := new(model.SearchEmployeeRequest)
	request.CompanyID = auth.GetCompanyId(ctx)
	request.Key = ctx.Query("key", "")
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.EmployeeUseCase.Search(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list employees")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.EmployeeResponse]{
		Data:   result,
		Paging: paging,
	})
}

func (c *EmployeeController) GetCurrent(ctx *fiber.Ctx) error {
	return ctx.JSON(response.WebResponse[*model.EmployeeResponse]{
		Data: auth.GetEmployee(ctx),
	})
}
