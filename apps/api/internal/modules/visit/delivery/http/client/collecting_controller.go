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

type CollectingController struct {
	UseCase *usecase.CollectingUseCase
	Log     *logrus.Logger
}

func NewCollectingController(
	useCase *usecase.CollectingUseCase,
	log *logrus.Logger,
) *CollectingController {
	return &CollectingController{
		UseCase: useCase,
		Log:     log,
	}
}

// SearchNasabah mencari data pinjaman nasabah di sistem inti untuk halaman
// cari kredit. Filter boleh dikirim lewat body JSON maupun query string, jadi
// keduanya diterima: body dibaca dulu, lalu query dipakai sebagai pelengkap
// untuk field yang masih kosong.
func (c *CollectingController) SearchNasabah(ctx *fiber.Ctx) error {
	request := new(model.SearchNasabahRequest)
	if len(ctx.Body()) > 0 {
		if err := ctx.BodyParser(request); err != nil {
			c.Log.WithError(err).Error("failed to parse request body")
			return fiber.ErrBadRequest
		}
	}

	if request.BranchCode == "" {
		request.BranchCode = ctx.Query("kodecabang", "")
	}
	if request.CIF == "" {
		request.CIF = ctx.Query("cif", "")
	}
	if request.NamaNasabah == "" {
		request.NamaNasabah = ctx.Query("nama", "")
	}
	if request.NIK == "" {
		request.NIK = ctx.Query("nik", "")
	}
	if request.LoanNumber == "" {
		request.LoanNumber = ctx.Query("nopjm", "")
	}

	result, err := c.UseCase.SearchNasabah(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to search nasabah")
		return err
	}

	return ctx.JSON(response.WebResponse[[]model.SearchNasabahResponse]{
		Data: result,
	})
}

// ListCurrent memuat penagihan kredit yang dicatat karyawan yang sedang login.
func (c *CollectingController) ListCurrent(ctx *fiber.Ctx) error {
	request := new(model.SearchRemidialVisitRequest)
	request.CompanyID = auth.GetCompanyId(ctx)
	request.EmployeeID = auth.GetEmployeeId(ctx)
	request.NasabahName = ctx.Query("nama_nasabah", "")
	request.NoPjm = ctx.Query("no_pjm", "")
	request.StartDate = ctx.Query("start_date", "")
	request.EndDate = ctx.Query("end_date", "")
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.UseCase.List(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list current remidial visits")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.RemidialVisitResponse]{
		Data:   result,
		Paging: paging,
	})
}

// Create mencatat hasil penagihan kredit atas nama karyawan yang sedang login.
func (c *CollectingController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateRemidialVisitRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	request.CompanyID = auth.GetCompanyId(ctx)
	request.EmployeeID = auth.GetEmployeeId(ctx)

	result, err := c.UseCase.Create(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to create remidial visit")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.RemidialVisitResponse]{
		Data: result,
	})
}
