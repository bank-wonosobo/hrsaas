package admin

import (
	"hrsaas/internal/modules/visit/model"
	"hrsaas/internal/modules/visit/usecase"
	"hrsaas/pkg/auth"
	"hrsaas/pkg/response"

	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type VisitController struct {
	UseCase *usecase.VisitUseCase
	Log     *logrus.Logger
}

func NewVisitController(useCase *usecase.VisitUseCase, log *logrus.Logger) *VisitController {
	return &VisitController{
		UseCase: useCase,
		Log:     log,
	}
}

// TODO: Enforce admin-only access.
func (c *VisitController) List(ctx *fiber.Ctx) error {

	request := new(model.SearchVisitRequest)
	request.EmployeeID = ctx.Query("employee_id", "")
	request.StartDate = ctx.Query("start_date", "")
	request.EndDate = ctx.Query("end_date", "")
	request.SortBy = ctx.Query("sort_by", "newest")
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	responses, total, err := c.UseCase.List(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list visits")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.VisitResponse]{
		Data:   responses,
		Paging: paging,
	})
}

func (c *VisitController) Export(ctx *fiber.Ctx) error {
	request := new(model.SearchVisitRequest)
	request.CompanyID = auth.GetCompanyId(ctx)
	request.EmployeeID = ctx.Query("employee_id", "")
	request.StartDate = ctx.Query("start_date", "")
	request.EndDate = ctx.Query("end_date", "")
	request.SortBy = ctx.Query("sort_by", "oldest")

	request.Page = 1
	request.Size = 100

	file, err := c.UseCase.ExportToExcel(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to export visits")
		return err
	}

	ctx.Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	ctx.Set("Content-Disposition", "attachment; filename=\"export-visit.xlsx\"")

	buffer, err := file.WriteToBuffer()
	if err != nil {
		c.Log.WithError(err).Error("failed to write excel to buffer")
		return fiber.ErrInternalServerError
	}

	return ctx.Send(buffer.Bytes())
}

func (c *VisitController) Update(ctx *fiber.Ctx) error {
	requestID := ctx.Params("id")
	if requestID == "" {
		return fiber.ErrBadRequest
	}

	request := new(model.UpdateVisitRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	result, err := c.UseCase.Update(ctx.UserContext(), requestID, request)
	if err != nil {
		c.Log.WithError(err).Error("failed to update visit")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.VisitResponse]{
		Data: result,
	})
}

// TODO: Decide whether delete should be admin-only or owner-only.
func (c *VisitController) Delete(ctx *fiber.Ctx) error {
	requestID := ctx.Params("id")
	if requestID == "" {
		return fiber.ErrBadRequest
	}

	if err := c.UseCase.Delete(ctx.UserContext(), requestID); err != nil {
		c.Log.WithError(err).Error("failed to delete visit")
		return err
	}

	return ctx.JSON(response.WebResponse[any]{Data: nil})
}
