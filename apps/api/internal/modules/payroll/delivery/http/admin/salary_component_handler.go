package admin

import (
	"hrsaas/internal/modules/payroll/dto"
	"hrsaas/internal/modules/payroll/service"
	"hrsaas/pkg/response"
	"math"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type SalaryComponentHandler struct {
	SalaryComponentService service.SalaryComponentService
	Validator              *validator.Validate
	Log                    *logrus.Logger
}

func NewSalaryComponentHandler(
	salaryComponentService service.SalaryComponentService,
	validator *validator.Validate,
	log *logrus.Logger,
) *SalaryComponentHandler {
	return &SalaryComponentHandler{
		SalaryComponentService: salaryComponentService,
		Validator:              validator,
		Log:                    log,
	}
}

func (h *SalaryComponentHandler) Create(ctx *fiber.Ctx) error {
	request := new(dto.CreateSalaryComponentRequest)
	if err := ctx.BodyParser(request); err != nil {
		if h.Log != nil {
			h.Log.WithError(err).Error("failed to parse salary component request body")
		}
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	if err := h.Validator.Struct(request); err != nil {
		return err
	}

	result, err := h.SalaryComponentService.Create(ctx.UserContext(), request)
	if err != nil {
		if h.Log != nil {
			h.Log.WithError(err).Error("failed to create salary component")
		}
		return err
	}

	return ctx.JSON(response.WebResponse[*dto.SalaryComponentResponse]{Data: result})
}

func (h *SalaryComponentHandler) List(ctx *fiber.Ctx) error {
	request := &dto.SearchSalaryComponentRequest{
		Key:        ctx.Query("key"),
		Type:       ctx.Query("type"),
		ActiveOnly: ctx.QueryBool("active_only", false),
		Page:       ctx.QueryInt("page", 1),
		Size:       ctx.QueryInt("size", 10),
	}
	if err := h.Validator.Struct(request); err != nil {
		return err
	}

	result, total, err := h.SalaryComponentService.List(ctx.UserContext(), request)
	if err != nil {
		if h.Log != nil {
			h.Log.WithError(err).Error("failed to list salary components")
		}
		return err
	}

	return ctx.JSON(response.WebResponse[[]dto.SalaryComponentResponse]{
		Data: result,
		Paging: &response.PageMetadata{
			Page: request.Page, Size: request.Size, TotalItem: total,
			TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
		},
	})
}
