package client

import (
	"hrsaas/internal/modules/payroll/model"
	"hrsaas/internal/modules/payroll/usecase"
	"hrsaas/pkg/auth"
	"hrsaas/pkg/middleware"
	"hrsaas/pkg/response"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type SalaryController struct {
	PayrollUseCase *usecase.PayrollUseCase
	Log            *logrus.Logger
}

func NewSalaryController(payrollUseCase *usecase.PayrollUseCase, log *logrus.Logger) *SalaryController {
	return &SalaryController{PayrollUseCase: payrollUseCase, Log: log}
}

// GetCurrent returns the logged-in employee's payslip for the current period.
func (c *SalaryController) GetCurrent(ctx *fiber.Ctx) error {
	result, err := c.PayrollUseCase.CurrentByEmployee(
		ctx.UserContext(),
		auth.GetCompanyId(ctx),
		auth.GetEmployeeId(ctx),
	)
	if err != nil {
		c.Log.WithError(err).Error("failed to get current salary slip")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.PayrollDetailResponse]{Data: result})
}

func (c *SalaryController) RegisterRoutes(router fiber.Router, client middleware.ClientMiddleware) {
	router.Get("/salary/_current", client(c.GetCurrent)...)
}
