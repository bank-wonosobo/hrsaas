package admin

import (
	"hrsaas/internal/modules/payroll/dto"
	"hrsaas/internal/modules/payroll/service"
	"hrsaas/pkg/auth"
	"hrsaas/pkg/response"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

// PayrollHandler handles payroll administration requests.
type PayrollHandler struct {
	PayrollService service.PayrollService
	Validator      *validator.Validate
	Log            *logrus.Logger
}

func (h *PayrollHandler) List(ctx *fiber.Ctx) error {
	u := auth.GetUser(ctx)
	r := &dto.SearchPayrollRequest{Status: ctx.Query("status"), PeriodYear: ctx.QueryInt("period_year"), Page: ctx.QueryInt("page", 1), Size: ctx.QueryInt("size", 10)}
	items, total, err := h.PayrollService.List(ctx.UserContext(), u.CompanyID, r)
	if err != nil {
		return err
	}
	return ctx.JSON(response.WebResponse[[]dto.PayrollResponse]{Data: items, Paging: &response.PageMetadata{Page: r.Page, Size: r.Size, TotalItem: total, TotalPage: (total + int64(r.Size) - 1) / int64(r.Size)}})
}

func (h *PayrollHandler) Detail(ctx *fiber.Ctx) error {
	u := auth.GetUser(ctx)
	p, err := h.PayrollService.Detail(ctx.UserContext(), u.CompanyID, ctx.Params("id"))
	if err != nil {
		return err
	}
	return ctx.JSON(response.WebResponse[*dto.PayrollResponse]{Data: p})
}

func (h *PayrollHandler) ListApprovals(ctx *fiber.Ctx) error {
	u := auth.GetUser(ctx)
	items, err := h.PayrollService.ListApprovals(ctx.UserContext(), u.CompanyID, ctx.Params("id"))
	if err != nil {
		return err
	}
	return ctx.JSON(response.WebResponse[[]dto.PayrollApprovalResponse]{Data: items})
}
func (h *PayrollHandler) Delete(ctx *fiber.Ctx) error {
	u := auth.GetUser(ctx)
	if err := h.PayrollService.Delete(ctx.UserContext(), u.CompanyID, ctx.Params("id")); err != nil {
		return err
	}
	return ctx.JSON(response.WebResponse[any]{Data: nil})
}

func (h *PayrollHandler) Cancel(ctx *fiber.Ctx) error {
	u := auth.GetUser(ctx)
	p, err := h.PayrollService.Cancel(ctx.UserContext(), u.CompanyID, ctx.Params("id"))
	if err != nil {
		return err
	}
	return ctx.JSON(response.WebResponse[*dto.PayrollResponse]{Data: p})
}

func (h *PayrollHandler) ListPayments(ctx *fiber.Ctx) error {
	r := &dto.SearchPayrollRequest{PayrollID: ctx.Query("payroll_id"), Status: ctx.Query("status"), Page: ctx.QueryInt("page", 1), Size: ctx.QueryInt("size", 10)}
	items, total, err := h.PayrollService.ListPayments(ctx.UserContext(), r)
	if err != nil {
		return err
	}
	return ctx.JSON(response.WebResponse[[]dto.PayrollPaymentResponse]{Data: items, Paging: &response.PageMetadata{Page: r.Page, Size: r.Size, TotalItem: total, TotalPage: (total + int64(r.Size) - 1) / int64(r.Size)}})
}
func (h *PayrollHandler) PaymentDetail(ctx *fiber.Ctx) error {
	p, err := h.PayrollService.PaymentDetail(ctx.UserContext(), ctx.Params("id"))
	if err != nil {
		return err
	}
	return ctx.JSON(response.WebResponse[*dto.PayrollPaymentResponse]{Data: p})
}
func (h *PayrollHandler) UpdatePaymentStatus(ctx *fiber.Ctx) error {
	r := new(dto.UpdatePayrollPaymentStatusRequest)
	if err := ctx.BodyParser(r); err != nil {
		return fiber.ErrBadRequest
	}
	if err := h.Validator.Struct(r); err != nil {
		return err
	}
	p, err := h.PayrollService.UpdatePaymentStatus(ctx.UserContext(), ctx.Params("id"), r)
	if err != nil {
		return err
	}
	return ctx.JSON(response.WebResponse[*dto.PayrollPaymentResponse]{Data: p})
}

func NewPayrollHandler(payrollService service.PayrollService, validator *validator.Validate, log *logrus.Logger) *PayrollHandler {
	return &PayrollHandler{
		PayrollService: payrollService,
		Validator:      validator,
		Log:            log,
	}
}

// Create creates a payroll period for the authenticated user's company.
func (h *PayrollHandler) Create(ctx *fiber.Ctx) error {
	request := new(dto.CreatePayrollRequest)
	if err := ctx.BodyParser(request); err != nil {
		if h.Log != nil {
			h.Log.WithError(err).Error("failed to parse payroll request body")
		}
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	if err := h.Validator.Struct(request); err != nil {
		return err
	}

	user := auth.GetUser(ctx)
	result, err := h.PayrollService.Create(
		ctx.UserContext(),
		user.CompanyID,
		user.ID,
		request,
	)
	if err != nil {
		if h.Log != nil {
			h.Log.WithError(err).Error("failed to create payroll")
		}
		return err
	}

	return ctx.JSON(response.WebResponse[*dto.PayrollResponse]{Data: result})
}

// Calculate calculates payroll for the requested payroll period.
func (h *PayrollHandler) Calculate(ctx *fiber.Ctx) error {
	user := auth.GetUser(ctx)
	result, err := h.PayrollService.Calculate(
		ctx.UserContext(),
		user.CompanyID,
		ctx.Params("id"),
	)
	if err != nil {
		if h.Log != nil {
			h.Log.WithError(err).Error("failed to calculate payroll")
		}
		return err
	}

	return ctx.JSON(response.WebResponse[*dto.PayrollResponse]{Data: result})
}

func (h *PayrollHandler) Submit(ctx *fiber.Ctx) error {
	user := auth.GetUser(ctx)
	result, err := h.PayrollService.Submit(ctx.UserContext(), user.CompanyID, ctx.Params("id"))
	if err != nil {
		return err
	}
	return ctx.JSON(response.WebResponse[*dto.PayrollResponse]{Data: result})
}

func (h *PayrollHandler) Approve(ctx *fiber.Ctx) error {
	user := auth.GetUser(ctx)
	result, err := h.PayrollService.Approve(ctx.UserContext(), user.CompanyID, ctx.Params("id"), user.ID)
	if err != nil {
		return err
	}
	return ctx.JSON(response.WebResponse[*dto.PayrollResponse]{Data: result})
}

func (h *PayrollHandler) Pay(ctx *fiber.Ctx) error {
	user := auth.GetUser(ctx)
	result, err := h.PayrollService.Pay(ctx.UserContext(), user.CompanyID, ctx.Params("id"))
	if err != nil {
		return err
	}
	return ctx.JSON(response.WebResponse[*dto.PayrollResponse]{Data: result})
}
