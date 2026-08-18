package admin

import (
	"hrsaas/internal/modules/attendance/model"
	"hrsaas/internal/modules/attendance/usecase"
	"hrsaas/pkg/auth"
	"hrsaas/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type ShiftController struct {
	UseCase *usecase.ShiftUseCase
	Log     *logrus.Logger
}

func NewShifController(usecase *usecase.ShiftUseCase, log *logrus.Logger) *ShiftController {
	return &ShiftController{
		UseCase: usecase,
		Log:     log,
	}
}

func (c *ShiftController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateShiftRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	request.CompanyID = auth.GetCompanyId(ctx)

	result, err := c.UseCase.Create(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to create shift")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.ShiftResponse]{
		Data: result,
	})
}

func (c *ShiftController) AssignEmployee(ctx *fiber.Ctx) error {
	request := new(model.AssignEmployeeToShiftRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	request.CompanyID = auth.GetCompanyId(ctx)

	if err := c.UseCase.AssignEmployee(ctx.UserContext(), request); err != nil {
		c.Log.WithError(err).Error("failed to assign employee to shift")
		return err
	}

	return ctx.JSON(response.WebResponse[any]{
		Data: nil,
	})
}

func (c *ShiftController) List(ctx *fiber.Ctx) error {
	request := new(model.SearchShiftRequest)
	request.CompanyID = auth.GetCompanyId(ctx)
	request.Key = ctx.Query("key", "")
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	responses, total, err := c.UseCase.Search(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list shifts")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.ShiftResponse]{
		Data:   responses,
		Paging: paging,
	})
}

func (c *ShiftController) Detail(ctx *fiber.Ctx) error {
	request := new(model.DetailShifRequest)
	request.CompanyID = auth.GetCompanyId(ctx)
	request.ShiftID = ctx.Params("shiftID")

	result, err := c.UseCase.DetailShift(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list shifts")
		return err
	}

	return ctx.JSON(response.WebResponse[model.ShiftResponse]{
		Data: *result,
	})
}

func (c *ShiftController) Update(ctx *fiber.Ctx) error {
	request := new(model.UpdateShiftRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	companyID := auth.GetCompanyId(ctx)

	result, err := c.UseCase.Update(ctx.UserContext(), ctx.Params("shiftID"), companyID, request)
	if err != nil {
		c.Log.WithError(err).Error("failed to update shift")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.ShiftResponse]{
		Data: result,
	})
}

func (c *ShiftController) BulkAssignEmployees(ctx *fiber.Ctx) error {
	request := new(model.BulkAssignEmployeesToShiftRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	request.CompanyID = auth.GetCompanyId(ctx)
	request.ShiftID = ctx.Params("shiftID")

	result, err := c.UseCase.BulkAssignEmployees(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to bulk assign employees to shift")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.ShiftResponse]{Data: result})
}

func (c *ShiftController) Delete(ctx *fiber.Ctx) error {
	companyID := auth.GetCompanyId(ctx)

	if err := c.UseCase.Delete(ctx.UserContext(), ctx.Params("shiftID"), companyID); err != nil {
		c.Log.WithError(err).Error("failed to delete shift")
		return err
	}

	return ctx.JSON(response.WebResponse[any]{
		Data: nil,
	})
}
