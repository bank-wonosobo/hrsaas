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

type EmployeeDocumentController struct {
	UseCase *usecase.EmployeeDocumentUseCase
	Log     *logrus.Logger
}

func NewEmployeeDocumentController(
	useCase *usecase.EmployeeDocumentUseCase,
	log *logrus.Logger,
) *EmployeeDocumentController {
	return &EmployeeDocumentController{UseCase: useCase, Log: log}
}

// ListCurrent memuat dokumen milik karyawan yang sedang login.
func (c *EmployeeDocumentController) ListCurrent(ctx *fiber.Ctx) error {
	request := &model.SearchEmployeeDocumentRequest{
		EmployeeID: auth.GetEmployeeId(ctx),
		Page:       ctx.QueryInt("page", 1),
		Size:       ctx.QueryInt("size", 10),
	}

	result, total, err := c.UseCase.List(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list current employee documents")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.EmployeeDocumentResponse]{
		Data:   result,
		Paging: paging,
	})
}
