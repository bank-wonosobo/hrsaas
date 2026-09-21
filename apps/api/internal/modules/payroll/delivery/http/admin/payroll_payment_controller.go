package admin

import (
	"hrsaas/internal/modules/payroll/dto"
	"hrsaas/internal/modules/payroll/service"
	"hrsaas/pkg/response"
	"math"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type PayrollPaymentController struct {
	PayrollService service.PayrollService
	Validator      *validator.Validate
	Log            *logrus.Logger
}

func NewPayrollPaymentController(payrollService service.PayrollService, validator *validator.Validate, log *logrus.Logger) *PayrollPaymentController {
	return &PayrollPaymentController{PayrollService: payrollService, Validator: validator, Log: log}
}

func (c *PayrollPaymentController) List(ctx *fiber.Ctx) error {
	r := &dto.SearchPayrollRequest{PayrollID: ctx.Query("payroll_id"), Status: ctx.Query("status"), Page: ctx.QueryInt("page", 1), Size: ctx.QueryInt("size", 10)}
	items, total, err := c.PayrollService.ListPayments(ctx.UserContext(), r)
	if err != nil {
		return err
	}
	return ctx.JSON(response.WebResponse[[]dto.PayrollPaymentResponse]{Data: items, Paging: &response.PageMetadata{Page: r.Page, Size: r.Size, TotalItem: total, TotalPage: int64(math.Ceil(float64(total) / float64(r.Size)))}})
}

func (c *PayrollPaymentController) Detail(ctx *fiber.Ctx) error {
	item, err := c.PayrollService.PaymentDetail(ctx.UserContext(), ctx.Params("id"))
	if err != nil {
		return err
	}
	return ctx.JSON(response.WebResponse[*dto.PayrollPaymentResponse]{Data: item})
}

func (c *PayrollPaymentController) UpdateStatus(ctx *fiber.Ctx) error {
	r := new(dto.UpdatePayrollPaymentStatusRequest)
	if err := ctx.BodyParser(r); err != nil {
		return fiber.ErrBadRequest
	}
	if err := c.Validator.Struct(r); err != nil {
		return err
	}
	item, err := c.PayrollService.UpdatePaymentStatus(ctx.UserContext(), ctx.Params("id"), r)
	if err != nil {
		return err
	}
	return ctx.JSON(response.WebResponse[*dto.PayrollPaymentResponse]{Data: item})
}
