package admin

import (
	"fmt"
	"hrsaas/internal/modules/time_off/model"
	"hrsaas/internal/modules/time_off/usecase"
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

func (c *TimeOffRequestController) AdminCreateRequest(ctx *fiber.Ctx) error {
	employeeID := ctx.Params("employee_id")
	fmt.Println("employee : " + employeeID)
	if employeeID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "employee_id param is required")
	}

	request := new(model.CreateTimeOffRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	result, err := c.RequestUseCase.CreateRequest(ctx.UserContext(), employeeID, request)
	if err != nil {
		c.Log.WithError(err).Error("failed to create time off request")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.TimeOffRequestResponse]{
		Data: result,
	})
}

func (c *TimeOffRequestController) DeleteRequest(ctx *fiber.Ctx) error {
	requestID := ctx.Params("id")
	if requestID == "" {
		return fiber.ErrBadRequest
	}

	if err := ensureOwnerOrAdmin(ctx, c.RequestUseCase, requestID); err != nil {
		return err
	}

	if err := c.RequestUseCase.DeleteRequest(ctx.UserContext(), requestID); err != nil {
		c.Log.WithError(err).Error("failed to delete time off request")
		return err
	}

	return ctx.JSON(response.WebResponse[any]{
		Data: nil,
	})
}

// TODO: Add admin-only filters and company scoping.
func (c *TimeOffRequestController) ListRequests(ctx *fiber.Ctx) error {
	request := new(model.SearchTimeOffRequest)
	request.EmployeeID = ctx.Query("employee_id", "")
	request.TimeOffTypeID = ctx.Query("time_off_type_id", "")
	request.RequestStatus = ctx.Query("request_status", "")
	request.StartDate = ctx.Query("start_date", "")
	request.EndDate = ctx.Query("end_date", "")
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.RequestUseCase.ListRequests(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list time off requests")
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
