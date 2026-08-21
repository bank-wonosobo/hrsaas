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

type EmployeeEducationController struct {
	UseCase *usecase.EmployeeEducationUseCase
	Log     *logrus.Logger
}

func NewEmployeeEducationController(
	useCase *usecase.EmployeeEducationUseCase,
	log *logrus.Logger,
) *EmployeeEducationController {
	return &EmployeeEducationController{UseCase: useCase, Log: log}
}

// ListCurrent memuat riwayat pendidikan milik karyawan yang sedang login.
func (c *EmployeeEducationController) ListCurrent(ctx *fiber.Ctx) error {
	request := &model.SearchEmployeeEducationRequest{
		CompanyID:  auth.GetCompanyId(ctx),
		EmployeeID: auth.GetEmployeeId(ctx),
		Page:       ctx.QueryInt("page", 1),
		Size:       ctx.QueryInt("size", 10),
	}

	result, total, err := c.UseCase.List(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list current employee educations")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.EmployeeEducationResponse]{
		Data:   result,
		Paging: paging,
	})
}
