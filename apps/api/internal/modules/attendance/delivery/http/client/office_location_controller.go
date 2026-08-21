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

type OfficeLocationController struct {
	OfficeLocationUseCase *usecase.OfficeLocationUseCase
	Log                   *logrus.Logger
}

func NewOfficeLocationController(
	officeLocationUseCase *usecase.OfficeLocationUseCase,
	log *logrus.Logger,
) *OfficeLocationController {
	return &OfficeLocationController{
		OfficeLocationUseCase: officeLocationUseCase,
		Log:                   log,
	}
}

// ListCurrent memuat lokasi kantor yang ditugaskan ke karyawan yang sedang
// login, dipakai halaman area presensi untuk menggambar radius geofence.
func (c *OfficeLocationController) ListCurrent(ctx *fiber.Ctx) error {
	request := new(model.SearchOfficeLocationRequest)
	request.CompanyID = auth.GetCompanyId(ctx)
	request.EmployeeID = auth.GetEmployeeId(ctx)
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.OfficeLocationUseCase.Search(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list current office locations")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.OfficeLocationResponse]{
		Data:   result,
		Paging: paging,
	})
}
