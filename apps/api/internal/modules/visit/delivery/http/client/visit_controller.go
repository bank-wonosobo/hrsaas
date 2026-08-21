package client

import (
	"hrsaas/internal/modules/visit/model"
	"hrsaas/internal/modules/visit/usecase"
	"hrsaas/pkg/auth"
	"hrsaas/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type VisitController struct {
	UseCase *usecase.VisitUseCase
	Log     *logrus.Logger
}

func NewVisitController(useCase *usecase.VisitUseCase, log *logrus.Logger) *VisitController {
	return &VisitController{
		UseCase: useCase,
		Log:     log,
	}
}

// ListCurrent memuat kunjungan klien yang dicatat karyawan yang sedang login.
func (c *VisitController) ListCurrent(ctx *fiber.Ctx) error {
	request := new(model.SearchVisitRequest)
	request.CompanyID = auth.GetCompanyId(ctx)
	request.EmployeeID = auth.GetEmployeeId(ctx)
	request.StartDate = ctx.Query("start_date", "")
	request.EndDate = ctx.Query("end_date", "")
	request.SortBy = ctx.Query("sort_by", "newest")
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.UseCase.List(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list current visits")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.VisitResponse]{
		Data:   result,
		Paging: paging,
	})
}

// Create mencatat kunjungan klien. visit_type IN membuka kunjungan baru dan
// OUT menutup kunjungan terakhir yang masih berjalan.
func (c *VisitController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateVisitRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	result, err := c.UseCase.Create(
		ctx.UserContext(),
		auth.GetCompanyId(ctx),
		auth.GetEmployeeId(ctx),
		request,
	)
	if err != nil {
		c.Log.WithError(err).Error("failed to create visit")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.VisitResponse]{
		Data: result,
	})
}
