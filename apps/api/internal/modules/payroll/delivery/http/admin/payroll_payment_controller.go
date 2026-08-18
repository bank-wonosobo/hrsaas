package admin

import (
	"hrsaas/internal/modules/payroll/model"
	"hrsaas/internal/modules/payroll/usecase"
	"hrsaas/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type PayrollPaymentController struct {
	PayrollPaymentUseCase *usecase.PayrollPaymentUseCase
	Log                   *logrus.Logger
}

func NewPayrollPaymentController(payrollPaymentUseCase *usecase.PayrollPaymentUseCase, log *logrus.Logger) *PayrollPaymentController {
	return &PayrollPaymentController{PayrollPaymentUseCase: payrollPaymentUseCase, Log: log}
}

func (c *PayrollPaymentController) List(ctx *fiber.Ctx) error {
	request := &model.SearchPayrollPaymentRequest{
		PayrollID: ctx.Query("payroll_id"),
		Status:    ctx.Query("status"),
		Page:      ctx.QueryInt("page", 1),
		Size:      ctx.QueryInt("size", 10),
	}

	result, total, err := c.PayrollPaymentUseCase.List(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[[]model.PayrollPaymentResponse]{
		Data: result,
		Paging: &response.PageMetadata{
			Page: request.Page, Size: request.Size, TotalItem: total,
			TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
		},
	})
}

func (c *PayrollPaymentController) Detail(ctx *fiber.Ctx) error {
	result, err := c.PayrollPaymentUseCase.Detail(ctx.UserContext(), ctx.Params("id"))
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.PayrollPaymentResponse]{Data: result})
}

func (c *PayrollPaymentController) UpdateStatus(ctx *fiber.Ctx) error {
	request := new(model.UpdatePayrollPaymentStatusRequest)
	if err := ctx.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}

	result, err := c.PayrollPaymentUseCase.UpdateStatus(ctx.UserContext(), ctx.Params("id"), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.PayrollPaymentResponse]{Data: result})
}
