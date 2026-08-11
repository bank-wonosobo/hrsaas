package http

import (
	"hrsaas-admin-api/internal/modules/attendance/model"
	"hrsaas-admin-api/internal/modules/attendance/usecase"
	"hrsaas-admin-api/pkg/auth"
	"hrsaas-admin-api/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type AttendanceController struct {
	UseCase *usecase.AttendanceUseCase
	Log     *logrus.Logger
}

func NewAttendanceController(useCase *usecase.AttendanceUseCase, log *logrus.Logger) *AttendanceController {
	return &AttendanceController{
		UseCase: useCase,
		Log:     log,
	}
}

func (c *AttendanceController) List(ctx *fiber.Ctx) error {
	request := new(model.SearchAttendanceRequest)
	request.CompanyID = auth.GetCompanyId(ctx)
	request.EmployeeID = ctx.Query("employee_id", "")
	request.Date = ctx.Query("date", "")
	request.StartDate = ctx.Query("start_date", "")
	request.EndDate = ctx.Query("end_date", "")
	request.Status = ctx.Query("status", "")
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.UseCase.Search(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list attendances")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.AttendanceResponse]{
		Data:   result,
		Paging: paging,
	})
}

func (c *AttendanceController) Export(ctx *fiber.Ctx) error {
	request := new(model.SearchAttendanceRequest)
	request.CompanyID = auth.GetCompanyId(ctx)
	request.EmployeeID = ctx.Query("employee_id", "")
	request.Date = ctx.Query("date", "")
	request.StartDate = ctx.Query("start_date", "")
	request.EndDate = ctx.Query("end_date", "")
	request.Status = ctx.Query("status", "")

	request.Page = 1
	request.Size = 100

	file, err := c.UseCase.Export(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to export attendances")
		return err
	}

	ctx.Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	ctx.Set("Content-Disposition", "attachment; filename=\"export-attendance.xlsx\"")

	buffer, err := file.WriteToBuffer()
	if err != nil {
		c.Log.WithError(err).Error("failed to write excel to buffer")
		return fiber.ErrInternalServerError
	}

	return ctx.Send(buffer.Bytes())
}

func (c *AttendanceController) ListLog(ctx *fiber.Ctx) error {
	request := new(model.SearchAttendanceLogRequest)
	request.CompanyID = auth.GetCompanyId(ctx)
	request.AttendanceID = ctx.Query("attendance_id", "")
	request.EmployeeID = ctx.Query("employee_id", "")
	request.Type = ctx.Query("type", "")
	request.Date = ctx.Query("date", "")
	if isApproved := ctx.Query("is_approved", ""); isApproved != "" {
		val := isApproved == "true"
		request.IsApproved = &val
	}
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.UseCase.SearchLog(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list attendance logs")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.AttendanceLogResponse]{
		Data:   result,
		Paging: paging,
	})
}

func (c *AttendanceController) Detail(ctx *fiber.Ctx) error {
	companyID := auth.GetCompanyId(ctx)

	result, err := c.UseCase.Detail(ctx.UserContext(), ctx.Params("attendanceID"), companyID)
	if err != nil {
		c.Log.WithError(err).Error("failed to get attendance detail")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.AttendanceResponse]{Data: result})
}

func (c *AttendanceController) Update(ctx *fiber.Ctx) error {
	request := new(model.UpdateAttendanceRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	companyID := auth.GetCompanyId(ctx)
	result, err := c.UseCase.Update(ctx.UserContext(), ctx.Params("attendanceID"), companyID, request)
	if err != nil {
		c.Log.WithError(err).Error("failed to update attendance")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.AttendanceResponse]{Data: result})
}

func (c *AttendanceController) Delete(ctx *fiber.Ctx) error {
	companyID := auth.GetCompanyId(ctx)

	if err := c.UseCase.Delete(ctx.UserContext(), ctx.Params("attendanceID"), companyID); err != nil {
		c.Log.WithError(err).Error("failed to delete attendance")
		return err
	}

	return ctx.JSON(response.WebResponse[any]{Data: nil})
}
