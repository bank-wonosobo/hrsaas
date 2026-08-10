package http

import (
	"hrsaas-admin-api/internal/modules/employee/model"
	"hrsaas-admin-api/internal/modules/employee/usecase"
	"hrsaas-admin-api/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type EmployeeDocumentController struct {
	UseCase *usecase.EmployeeDocumentUseCase
	Log     *logrus.Logger
}

func NewEmployeeDocumentController(useCase *usecase.EmployeeDocumentUseCase, log *logrus.Logger) *EmployeeDocumentController {
	return &EmployeeDocumentController{UseCase: useCase, Log: log}
}

func (c *EmployeeDocumentController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateEmployeeDocumentRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	result, err := c.UseCase.Create(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.EmployeeDocumentResponse]{Data: result})
}

func (c *EmployeeDocumentController) List(ctx *fiber.Ctx) error {
	request := &model.SearchEmployeeDocumentRequest{
		EmployeeID: ctx.Query("employee_id", ""),
		Page:       ctx.QueryInt("page", 1),
		Size:       ctx.QueryInt("size", 10),
	}

	result, total, err := c.UseCase.List(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.EmployeeDocumentResponse]{
		Data:   result,
		Paging: paging,
	})
}

func (c *EmployeeDocumentController) Update(ctx *fiber.Ctx) error {
	request := new(model.UpdateEmployeeDocumentRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}
	request.ID = ctx.Params("id")

	result, err := c.UseCase.Update(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.EmployeeDocumentResponse]{Data: result})
}

func (c *EmployeeDocumentController) Delete(ctx *fiber.Ctx) error {
	id := ctx.Params("id")

	if err := c.UseCase.Delete(ctx.UserContext(), id); err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[bool]{Data: true})
}
