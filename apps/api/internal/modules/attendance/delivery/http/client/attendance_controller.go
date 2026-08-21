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

type AttendanceController struct {
	AttendanceUseCase *usecase.AttendanceUseCase
	Log               *logrus.Logger
}

func NewAttendanceController(
	attendanceUseCase *usecase.AttendanceUseCase,
	log *logrus.Logger,
) *AttendanceController {
	return &AttendanceController{
		AttendanceUseCase: attendanceUseCase,
		Log:               log,
	}
}

func (c *AttendanceController) parseRequest(
	ctx *fiber.Ctx,
) (*model.CheckInAttendanceRequest, error) {
	request := new(model.CheckInAttendanceRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return nil, fiber.ErrBadRequest
	}

	file, err := ctx.FormFile("file")
	if err != nil {
		c.Log.WithError(err).Error("failed to read face image file")
		return nil, fiber.NewError(fiber.StatusBadRequest, "File gambar wajah wajib diisi")
	}
	request.File = file

	request.CompanyID = auth.GetCompanyId(ctx)
	request.EmployeeID = auth.GetEmployeeId(ctx)
	return request, nil
}

// List riwayat presensi milik karyawan yang sedang login.
func (c *AttendanceController) List(ctx *fiber.Ctx) error {
	request := new(model.SearchAttendanceRequest)
	request.CompanyID = auth.GetCompanyId(ctx)
	request.EmployeeID = auth.GetEmployeeId(ctx)
	request.Date = ctx.Query("date", "")
	request.StartDate = ctx.Query("start_date", "")
	request.EndDate = ctx.Query("end_date", "")
	request.Status = ctx.Query("status", "")
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.AttendanceUseCase.Search(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list current attendances")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.AttendanceResponse]{
		Data:   result,
		Paging: paging,
	})
}

// DetailToday memuat presensi hari ini untuk beranda aplikasi.
func (c *AttendanceController) DetailToday(ctx *fiber.Ctx) error {
	result, err := c.AttendanceUseCase.DetailToday(
		ctx.UserContext(),
		auth.GetEmployeeId(ctx),
		auth.GetCompanyId(ctx),
	)
	if err != nil {
		c.Log.WithError(err).Error("failed to get today attendance")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.AttendanceResponse]{
		Data: result,
	})
}

func (c *AttendanceController) CheckIn(ctx *fiber.Ctx) error {
	request := new(model.CheckInAttendanceRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	file, err := ctx.FormFile("file")
	if err != nil {
		c.Log.WithError(err).Error("failed to read selfie file")
		return fiber.NewError(fiber.StatusBadRequest, "Foto selfie harus diunggah")
	}
	request.File = file

	request.CompanyID = auth.GetCompanyId(ctx)
	request.EmployeeID = auth.GetEmployeeId(ctx)

	result, err := c.AttendanceUseCase.CheckIn(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to check in")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.AttendanceResponse]{
		Data: result,
	})
}

func (c *AttendanceController) CheckOut(ctx *fiber.Ctx) error {
	request, err := c.parseRequest(ctx)
	if err != nil {
		return err
	}

	result, err := c.AttendanceUseCase.CheckOut(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to check out attendance")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.AttendanceResponse]{Data: result})
}

func (c *AttendanceController) BreakIn(ctx *fiber.Ctx) error {
	request, err := c.parseRequest(ctx)
	if err != nil {
		return err
	}

	result, err := c.AttendanceUseCase.BreakIn(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to break in attendance")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.AttendanceResponse]{Data: result})
}

func (c *AttendanceController) BreakOut(ctx *fiber.Ctx) error {
	request, err := c.parseRequest(ctx)
	if err != nil {
		return err
	}

	result, err := c.AttendanceUseCase.BreakOut(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to break out attendance")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.AttendanceResponse]{Data: result})
}

func (c *AttendanceController) RegisterFaceCurrent(ctx *fiber.Ctx) error {
	user := auth.GetUser(ctx)
	request := new(model.RegisterFaceRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}
	request.UserId = user.ID
	request.CompanyID = user.CompanyID

	result, err := c.AttendanceUseCase.RegisterFace(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("Failed to register face")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.RegisterFaceResponse]{Data: result})
}

func (c *AttendanceController) FaceStatusCurrent(ctx *fiber.Ctx) error {
	user := auth.GetUser(ctx)

	result, err := c.AttendanceUseCase.FaceStatus(
		ctx.UserContext(),
		user.ID,
		user.CompanyID,
	)
	if err != nil {
		c.Log.WithError(err).Error("Failed to get face status")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.FaceStatusResponse]{Data: result})
}

func (c *AttendanceController) parseLendRequest(
	ctx *fiber.Ctx,
) (*model.CheckInAttendanceRequest, error) {
	request := new(model.CheckInAttendanceRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return nil, fiber.ErrBadRequest
	}

	if request.EmployeeID == "" {
		return nil, fiber.NewError(fiber.StatusBadRequest, "employee_id wajib diisi")
	}

	file, err := ctx.FormFile("file")
	if err != nil {
		c.Log.WithError(err).Error("failed to read face image file")
		return nil, fiber.NewError(fiber.StatusBadRequest, "File gambar wajah wajib diisi")
	}
	request.File = file

	request.CompanyID = auth.GetCompanyId(ctx)
	return request, nil
}

func (c *AttendanceController) LendCheckIn(ctx *fiber.Ctx) error {
	request, err := c.parseLendRequest(ctx)
	if err != nil {
		return err
	}

	result, err := c.AttendanceUseCase.CheckIn(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to lend check in attendance")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.AttendanceResponse]{Data: result})
}

func (c *AttendanceController) LendCheckOut(ctx *fiber.Ctx) error {
	request, err := c.parseLendRequest(ctx)
	if err != nil {
		return err
	}

	result, err := c.AttendanceUseCase.CheckOut(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to lend check out attendance")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.AttendanceResponse]{Data: result})
}
