package client

import (
	"hrsaas/internal/modules/time_off/model"
	"hrsaas/internal/modules/time_off/usecase"
	"hrsaas/pkg/auth"
	"hrsaas/pkg/response"
	"time"

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

// ListCurrent memuat sisa kuota cuti milik karyawan yang sedang login.
func (c *TimeOffBalanceController) ListCurrent(ctx *fiber.Ctx) error {
	request := new(model.SearchTimeOffBalanceRequest)
	request.TimeOffTypeID = ctx.Query("time_off_type_id", "")
	// period_year wajib >= 2000 di validator, jadi defaultnya tahun berjalan.
	request.PeriodYear = ctx.QueryInt("period_year", time.Now().Year())

	result, err := c.BalanceUseCase.ListBalances(
		ctx.UserContext(),
		auth.GetEmployeeId(ctx),
		request,
	)
	if err != nil {
		c.Log.WithError(err).Error("failed to list current time off balances")
		return err
	}

	return ctx.JSON(response.WebResponse[[]model.TimeOffBalanceResponse]{
		Data: result,
	})
}
