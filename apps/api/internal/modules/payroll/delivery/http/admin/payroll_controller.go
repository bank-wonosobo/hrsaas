package admin

import (
	"hrsaas/internal/modules/payroll/model"
	"hrsaas/internal/modules/payroll/usecase"
	"hrsaas/pkg/auth"
	"hrsaas/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type PayrollController struct {
	PayrollUseCase *usecase.PayrollUseCase
	Log            *logrus.Logger
}

func NewPayrollController(payrollUseCase *usecase.PayrollUseCase, log *logrus.Logger) *PayrollController {
	return &PayrollController{PayrollUseCase: payrollUseCase, Log: log}
}

// ─── Payroll ─────────────────────────────────────────────────────────────

func (c *PayrollController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreatePayrollRequest)
	if err := ctx.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}

	user := auth.GetUser(ctx)
	result, err := c.PayrollUseCase.Create(ctx.UserContext(), user.CompanyID, user.ID, request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.PayrollResponse]{Data: result})
}

func (c *PayrollController) List(ctx *fiber.Ctx) error {
	request := &model.SearchPayrollRequest{
		CompanyID:  auth.GetCompanyId(ctx),
		Status:     ctx.Query("status"),
		PeriodYear: ctx.QueryInt("period_year", 0),
		Page:       ctx.QueryInt("page", 1),
		Size:       ctx.QueryInt("size", 10),
	}

	result, total, err := c.PayrollUseCase.List(ctx.UserContext(), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[[]model.PayrollResponse]{
		Data: result,
		Paging: &response.PageMetadata{
			Page: request.Page, Size: request.Size, TotalItem: total,
			TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
		},
	})
}

func (c *PayrollController) Detail(ctx *fiber.Ctx) error {
	result, err := c.PayrollUseCase.Detail(ctx.UserContext(), ctx.Params("id"), auth.GetCompanyId(ctx))
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.PayrollResponse]{Data: result})
}

func (c *PayrollController) Delete(ctx *fiber.Ctx) error {
	if err := c.PayrollUseCase.Delete(ctx.UserContext(), ctx.Params("id"), auth.GetCompanyId(ctx)); err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[any]{Data: nil})
}

func (c *PayrollController) Calculate(ctx *fiber.Ctx) error {
	result, err := c.PayrollUseCase.Calculate(ctx.UserContext(), ctx.Params("id"), auth.GetCompanyId(ctx))
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.PayrollResponse]{Data: result})
}

func (c *PayrollController) Submit(ctx *fiber.Ctx) error {
	result, err := c.PayrollUseCase.Submit(ctx.UserContext(), ctx.Params("id"), auth.GetCompanyId(ctx))
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.PayrollResponse]{Data: result})
}

func (c *PayrollController) Cancel(ctx *fiber.Ctx) error {
	result, err := c.PayrollUseCase.Cancel(ctx.UserContext(), ctx.Params("id"), auth.GetCompanyId(ctx))
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.PayrollResponse]{Data: result})
}

func (c *PayrollController) Approve(ctx *fiber.Ctx) error {
	user := auth.GetUser(ctx)
	result, err := c.PayrollUseCase.Approve(ctx.UserContext(), ctx.Params("id"), user.CompanyID, user.ID)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.PayrollResponse]{Data: result})
}

func (c *PayrollController) Reject(ctx *fiber.Ctx) error {
	request := new(model.RejectPayrollRequest)
	if err := ctx.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}

	user := auth.GetUser(ctx)
	result, err := c.PayrollUseCase.Reject(ctx.UserContext(), ctx.Params("id"), user.CompanyID, user.ID, request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.PayrollResponse]{Data: result})
}

func (c *PayrollController) Pay(ctx *fiber.Ctx) error {
	result, err := c.PayrollUseCase.Pay(ctx.UserContext(), ctx.Params("id"), auth.GetCompanyId(ctx))
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.PayrollResponse]{Data: result})
}

func (c *PayrollController) ListApprovals(ctx *fiber.Ctx) error {
	result, err := c.PayrollUseCase.ListApprovals(ctx.UserContext(), ctx.Params("id"), auth.GetCompanyId(ctx))
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[[]model.PayrollApprovalResponse]{Data: result})
}

// ─── Payroll Detail ──────────────────────────────────────────────────────

func (c *PayrollController) DetailByDetailID(ctx *fiber.Ctx) error {
	result, err := c.PayrollUseCase.DetailByDetailID(ctx.UserContext(), ctx.Params("id"))
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.PayrollDetailResponse]{Data: result})
}

// ─── Payroll Adjustments ─────────────────────────────────────────────────

func (c *PayrollController) ListAdjustments(ctx *fiber.Ctx) error {
	result, err := c.PayrollUseCase.ListAdjustments(ctx.UserContext(), ctx.Params("id"))
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[[]model.PayrollAdjustmentResponse]{Data: result})
}

func (c *PayrollController) CreateAdjustment(ctx *fiber.Ctx) error {
	request := new(model.CreatePayrollAdjustmentRequest)
	if err := ctx.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}

	result, err := c.PayrollUseCase.CreateAdjustment(ctx.UserContext(), ctx.Params("id"), request)
	if err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[*model.PayrollAdjustmentResponse]{Data: result})
}

func (c *PayrollController) DeleteAdjustment(ctx *fiber.Ctx) error {
	if err := c.PayrollUseCase.DeleteAdjustment(ctx.UserContext(), ctx.Params("adjustmentId")); err != nil {
		return err
	}

	return ctx.JSON(response.WebResponse[any]{Data: nil})
}
