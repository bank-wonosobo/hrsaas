package admin

import (
	"hrsaas/internal/modules/time_off/model"
	"hrsaas/internal/modules/time_off/usecase"
	"hrsaas/pkg/response"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type TimeOffBalanceController struct {
	BalanceUseCase *usecase.TimeOffBalanceUseCase
	Log            *logrus.Logger
}

func NewTimeOffBalanceController(
	balanceUseCase *usecase.TimeOffBalanceUseCase,
	log *logrus.Logger,
) *TimeOffBalanceController {
	return &TimeOffBalanceController{
		BalanceUseCase: balanceUseCase,
		Log:            log,
	}
}

// TODO: Enforce admin-only access with middleware at router.
func (c *TimeOffBalanceController) ListBalancesByEmployee(ctx *fiber.Ctx) error {
	request := new(model.SearchTimeOffBalanceRequest)
	request.TimeOffTypeID = ctx.Query("time_off_type_id", "")
	request.PeriodYear = ctx.QueryInt("period_year", 0)

	employeeID := ctx.Query("employee_id", "")
	if employeeID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "employee_id is required")
	}

	result, err := c.BalanceUseCase.ListBalances(ctx.UserContext(), employeeID, request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list time off balances")
		return err
	}

	return ctx.JSON(response.WebResponse[[]model.TimeOffBalanceResponse]{
		Data: result,
	})
}

// TODO: Enforce admin-only access with middleware at router.
func (c *TimeOffBalanceController) SetBalance(ctx *fiber.Ctx) error {
	request := new(model.SetTimeOffBalanceRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	result, err := c.BalanceUseCase.SetBalance(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to set time off balance")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.TimeOffBalanceResponse]{
		Data: result,
	})
}

func (c *TimeOffBalanceController) Update(ctx *fiber.Ctx) error {
	request := new(model.UpdateTimeOffBalanceRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	result, err := c.BalanceUseCase.Update(ctx.UserContext(), ctx.Params("id"), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to update time off balance")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.TimeOffBalanceResponse]{
		Data: result,
	})
}

func (c *TimeOffBalanceController) Delete(ctx *fiber.Ctx) error {
	if err := c.BalanceUseCase.Delete(ctx.UserContext(), ctx.Params("id")); err != nil {
		c.Log.WithError(err).Error("failed to delete time off balance")
		return err
	}

	return ctx.JSON(response.WebResponse[any]{
		Data: nil,
	})
}
