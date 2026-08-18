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

type CollectingController struct {
	UseCase *usecase.CollectingUseCase
	Log     *logrus.Logger
}

func NewCollectingController(useCase *usecase.CollectingUseCase, log *logrus.Logger) *CollectingController {
	return &CollectingController{
		UseCase: useCase,
		Log:     log,
	}
}

func (c *CollectingController) SearchNasabah(ctx *fiber.Ctx) error {
	request := new(model.SearchNasabahRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	responses, err := c.UseCase.SearchNasabah(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to search nasabah")
		return err
	}

	return ctx.JSON(response.WebResponse[[]model.SearchNasabahResponse]{
		Data: responses,
	})
}

// func (c *RemidialVisitController) Create(ctx *fiber.Ctx) error {
// 	request := new(model.CreateRemidialVisitRequest)
// 	if err := ctx.BodyParser(request); err != nil {
// 		c.Log.WithError(err).Error("failed to parse request body")
// 		return fiber.ErrBadRequest
// 	}

// 	user := auth.GetUser(ctx)
// 	if user.Employee == nil || user.Employee.ID == "" {
// 		return fiber.NewError(fiber.StatusBadRequest, "Employee not found")
// 	}

// 	request.CompanyID = user.CompanyID
// 	request.EmployeeID = user.Employee.ID

// 	result, err := c.UseCase.Create(ctx.UserContext(), request)
// 	if err != nil {
// 		c.Log.WithError(err).Error("failed to create remidial visit")
// 		return err
// 	}

// 	return ctx.JSON(response.WebResponse[*model.RemidialVisitResponse]{
// 		Data: result,
// 	})
// }

// func (c *RemidialVisitController) ListCurrent(ctx *fiber.Ctx) error {
// 	user := auth.GetUser(ctx)
// 	if user.Employee == nil || user.Employee.ID == "" {
// 		return fiber.NewError(fiber.StatusBadRequest, "Employee not found")
// 	}

// 	request := new(model.SearchRemidialVisitRequest)
// 	request.EmployeeID = user.Employee.ID
// 	request.NasabahName = ctx.Query("nama_nasabah", "")
// 	request.StartDate = ctx.Query("start_date", "")
// 	request.EndDate = ctx.Query("end_date", "")
// 	request.Page = ctx.QueryInt("page", 1)
// 	request.Size = ctx.QueryInt("size", 10)

// 	responses, total, err := c.UseCase.List(ctx.UserContext(), request)
// 	if err != nil {
// 		c.Log.WithError(err).Error("failed to list current remidial visits")
// 		return err
// 	}

// 	paging := &model.PageMetadata{
// 		Page:      request.Page,
// 		Size:      request.Size,
// 		TotalItem: total,
// 		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
// 	}

// 	return ctx.JSON(model.WebResponse[[]model.RemidialVisitResponse]{
// 		Data:   responses,
// 		Paging: paging,
// 	})
// }

func (c *CollectingController) ListAdmin(ctx *fiber.Ctx) error {
	request := new(model.SearchRemidialVisitRequest)
	request.EmployeeID = ctx.Query("employee_id", "")
	request.EmployeeName = ctx.Query("employee_name", "")
	request.NasabahName = ctx.Query("nama", "")
	request.StartDate = ctx.Query("start_date", "")
	request.EndDate = ctx.Query("end_date", "")
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.UseCase.List(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list admin remidial visits")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.RemidialVisitResponse]{
		Data:   result,
		Paging: paging,
	})
}

func (c *CollectingController) Export(ctx *fiber.Ctx) error {
	request := new(model.SearchRemidialVisitRequest)
	request.CompanyID = auth.GetCompanyId(ctx)
	request.EmployeeID = ctx.Query("employee_id", "")
	request.EmployeeName = ctx.Query("employee_name", "")
	request.NasabahName = ctx.Query("nama", "")
	request.NoPjm = ctx.Query("no_pjm", "")
	request.StartDate = ctx.Query("start_date", "")
	request.EndDate = ctx.Query("end_date", "")

	request.Page = 1
	request.Size = 100

	file, err := c.UseCase.ExportToExcel(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to export remidial visits")
		return err
	}

	ctx.Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	ctx.Set("Content-Disposition", "attachment; filename=\"export-collecting.xlsx\"")

	buffer, err := file.WriteToBuffer()
	if err != nil {
		c.Log.WithError(err).Error("failed to write excel to buffer")
		return fiber.ErrInternalServerError
	}

	return ctx.Send(buffer.Bytes())
}

func (c *CollectingController) ListByNoPjm(ctx *fiber.Ctx) error {
	request := new(model.SearchRemidialVisitRequest)
	request.NoPjm = ctx.Params("no_pjm")
	request.StartDate = ctx.Query("start_date", "")
	request.EndDate = ctx.Query("end_date", "")
	request.NasabahName = ctx.Query("nama", "")
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.UseCase.List(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list history remidial visits on this no_pjm")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.RemidialVisitResponse]{
		Data:   result,
		Paging: paging,
	})

}

func (c *CollectingController) Update(ctx *fiber.Ctx) error {
	request := new(model.UpdateRemidialVisitRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	user := auth.GetUser(ctx)
	request.CompanyID = user.CompanyID
	request.ID = ctx.Params("remidial_visit_id")

	result, err := c.UseCase.Update(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to update remidial visit")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.RemidialVisitResponse]{
		Data: result,
	})
}

func (c *CollectingController) Delete(ctx *fiber.Ctx) error {
	requestID := ctx.Params("remidial_visit_id")
	if requestID == "" {
		return fiber.ErrBadRequest
	}
	if err := c.UseCase.Delete(ctx.UserContext(), requestID); err != nil {
		c.Log.WithError(err).Error("failed to delete visit")
		return err
	}

	return ctx.JSON(response.WebResponse[any]{Data: nil})
}
