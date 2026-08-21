package client

import (
	"hrsaas/internal/modules/employee/model"
	"hrsaas/internal/modules/employee/usecase"
	"hrsaas/pkg/auth"
	"hrsaas/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type EmSancController struct {
	EmSancUseCase *usecase.EmSancUseCase
	Log           *logrus.Logger
}

func NewEmSancController(
	emSancUseCase *usecase.EmSancUseCase,
	log *logrus.Logger,
) *EmSancController {
	return &EmSancController{
		EmSancUseCase: emSancUseCase,
		Log:           log,
	}
}

// SearchCurrent memuat sanksi yang tercatat atas karyawan yang sedang login.
func (c *EmSancController) SearchCurrent(ctx *fiber.Ctx) error {
	request := new(model.SearchEmSancRequest)
	request.CompanyID = auth.GetCompanyId(ctx)
	request.EmployeeID = auth.GetEmployeeId(ctx)
	request.SanctionID = ctx.Query("sanction_id", "")
	request.Reason = ctx.Query("reason", "")
	request.Status = ctx.Query("status", "")
	request.StartDate = ctx.Query("start_date", "")
	request.EndDate = ctx.Query("end_date", "")
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.EmSancUseCase.Search(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list current employee sanctions")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.EmSancResponse]{
		Data:   result,
		Paging: paging,
	})
}
