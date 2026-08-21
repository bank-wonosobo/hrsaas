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

type EmployeeContractController struct {
	EmployeeContractUseCase *usecase.EmployeeContractUseCase
	Log                     *logrus.Logger
}

func NewEmployeeContractController(
	employeeContractUseCase *usecase.EmployeeContractUseCase,
	log *logrus.Logger,
) *EmployeeContractController {
	return &EmployeeContractController{
		EmployeeContractUseCase: employeeContractUseCase,
		Log:                     log,
	}
}

// ListCurrent memuat riwayat kontrak milik karyawan yang sedang login.
func (c *EmployeeContractController) ListCurrent(ctx *fiber.Ctx) error {
	request := &model.SearchEmployeeContractRequest{
		EmployeeID: auth.GetEmployeeId(ctx),
		ActiveOnly: ctx.QueryBool("active_only", false),
		Page:       ctx.QueryInt("page", 1),
		Size:       ctx.QueryInt("size", 10),
	}

	result, total, err := c.EmployeeContractUseCase.List(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list current employee contracts")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.EmployeeContractResponse]{
		Data:   result,
		Paging: paging,
	})
}
