package admin

import (
	"hrsaas/internal/modules/time_off/model"
	"hrsaas/internal/modules/time_off/usecase"
	"hrsaas/pkg/auth"
	"hrsaas/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type TimeOffApprovalController struct {
	ApprovalUseCase *usecase.TimeOffApprovalUseCase
	Log             *logrus.Logger
}

func NewTimeOffApprovalController(
	approvalUseCase *usecase.TimeOffApprovalUseCase,
	log *logrus.Logger,
) *TimeOffApprovalController {
	return &TimeOffApprovalController{
		ApprovalUseCase: approvalUseCase,
		Log:             log,
	}
}

// ListCurrent memuat pengajuan cuti yang menunggu persetujuan karyawan yang
// sedang login, yaitu saat ia menjadi atasan pada rantai persetujuan.
func (c *TimeOffApprovalController) ListCurrent(ctx *fiber.Ctx) error {
	request := new(model.SearchTimeOffApprovalRequest)
	request.Status = ctx.Query("status", "")
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.ApprovalUseCase.ListApprovalsByApprover(
		ctx.UserContext(),
		auth.GetEmployeeId(ctx),
		request,
	)
	if err != nil {
		c.Log.WithError(err).Error("failed to list current time off approvals")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.TimeOffApprovalResponse]{
		Data:   result,
		Paging: paging,
	})
}

// TODO: Add audit logging for approval actions.
func (c *TimeOffApprovalController) DecideShort(ctx *fiber.Ctx) error {
	approvalID := ctx.Params("approval_id")
	if approvalID == "" {
		return fiber.ErrBadRequest
	}

	// user := auth.GetUser(ctx)
	if auth.GetEmployeeId(ctx) == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Employee not found")
	}

	request := new(model.DecideTimeOffApprovalRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	if err := c.ApprovalUseCase.DecideByApprovalID(ctx.UserContext(), approvalID, auth.GetEmployeeId(ctx), request); err != nil {
		c.Log.WithError(err).Error("failed to update time off approval")
		return err
	}

	return ctx.JSON(response.WebResponse[any]{
		Data: nil,
	})
}
