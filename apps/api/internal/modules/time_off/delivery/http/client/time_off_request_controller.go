package client

import (
	"hrsaas/internal/modules/time_off/model"
	"hrsaas/internal/modules/time_off/usecase"
	"hrsaas/pkg/auth"
	"hrsaas/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type TimeOffRequestController struct {
	RequestUseCase *usecase.TimeOffRequestUseCase
	Log            *logrus.Logger
}

func NewTimeOffRequestController(
	requestUseCase *usecase.TimeOffRequestUseCase,
	log *logrus.Logger,
) *TimeOffRequestController {
	return &TimeOffRequestController{
		RequestUseCase: requestUseCase,
		Log:            log,
	}
}

// ListCurrent memuat riwayat pengajuan izin & cuti milik karyawan yang login.
func (c *TimeOffRequestController) ListCurrent(ctx *fiber.Ctx) error {
	request := new(model.SearchTimeOffRequest)
	request.EmployeeID = auth.GetEmployeeId(ctx)
	request.TimeOffTypeID = ctx.Query("time_off_type_id", "")
	request.RequestStatus = ctx.Query("request_status", "")
	request.StartDate = ctx.Query("start_date", "")
	request.EndDate = ctx.Query("end_date", "")
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.RequestUseCase.ListRequests(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list current time off requests")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.TimeOffRequestResponse]{
		Data:   result,
		Paging: paging,
	})
}

// Create mengajukan izin & cuti atas nama karyawan yang sedang login.
func (c *TimeOffRequestController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateTimeOffRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	result, err := c.RequestUseCase.CreateRequest(
		ctx.UserContext(),
		auth.GetEmployeeId(ctx),
		request,
	)
	if err != nil {
		c.Log.WithError(err).Error("failed to create time off request")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.TimeOffRequestResponse]{
		Data: result,
	})
}
