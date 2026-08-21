package client

import (
	"hrsaas/internal/modules/attendance/model"
	"hrsaas/internal/modules/attendance/usecase"
	"hrsaas/pkg/auth"
	"hrsaas/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type ShiftController struct {
	ShiftUseCase *usecase.ShiftUseCase
	Log          *logrus.Logger
}

func NewShiftController(shiftUseCase *usecase.ShiftUseCase, log *logrus.Logger) *ShiftController {
	return &ShiftController{
		ShiftUseCase: shiftUseCase,
		Log:          log,
	}
}

// ListCurrent memuat shift yang ditugaskan ke karyawan yang sedang login,
// dipakai halaman area presensi untuk menampilkan jam kerja hari ini.
func (c *ShiftController) ListCurrent(ctx *fiber.Ctx) error {
	request := new(model.SearchShiftRequest)
	request.CompanyID = auth.GetCompanyId(ctx)
	request.EmployeeID = auth.GetEmployeeId(ctx)
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.ShiftUseCase.Search(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list current shifts")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.ShiftResponse]{
		Data:   result,
		Paging: paging,
	})
}
