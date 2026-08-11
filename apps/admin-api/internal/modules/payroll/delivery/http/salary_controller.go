package http

import (
	"hrsaas-admin-api/internal/modules/payroll/model"
	"hrsaas-admin-api/internal/modules/payroll/usecase"
	"hrsaas-admin-api/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type SalaryController struct {
	SalaryComponentUseCase *usecase.SalaryComponentUseCase
	log                    *logrus.Logger
}

func NewSalaryController(salaryComponentUseCase *usecase.SalaryComponentUseCase, log *logrus.Logger) *SalaryController {
	return &SalaryController{SalaryComponentUseCase: salaryComponentUseCase, log: log}
}

// ─── Salary Component ───────────────────────────────────────────────────────

func (h *SalaryController) Create(c *fiber.Ctx) error {
	request := new(model.CreateSalaryComponentRequest)
	if err := c.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}

	result, err := h.SalaryComponentUseCase.Create(c.UserContext(), request)
	if err != nil {
		return err
	}

	return c.JSON(response.WebResponse[*model.SalaryComponentResponse]{Data: result})
}

func (h *SalaryController) List(c *fiber.Ctx) error {
	request := &model.SearchSalaryComponentRequest{
		Key:        c.Query("key"),
		Type:       c.Query("type"),
		ActiveOnly: c.QueryBool("active_only", false),
		Page:       c.QueryInt("page", 1),
		Size:       c.QueryInt("size", 10),
	}

	result, total, err := h.SalaryComponentUseCase.List(c.UserContext(), request)
	if err != nil {
		return err
	}

	return c.JSON(response.WebResponse[[]model.SalaryComponentResponse]{
		Data: result,
		Paging: &response.PageMetadata{
			Page: request.Page, Size: request.Size, TotalItem: total,
			TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
		},
	})
}

func (h *SalaryController) Detail(c *fiber.Ctx) error {
	result, err := h.SalaryComponentUseCase.Detail(c.UserContext(), c.Params("id"))
	if err != nil {
		return err
	}

	return c.JSON(response.WebResponse[*model.SalaryComponentResponse]{Data: result})
}

func (h *SalaryController) Update(c *fiber.Ctx) error {
	request := new(model.UpdateSalaryComponentRequest)
	if err := c.BodyParser(request); err != nil {
		return fiber.ErrBadRequest
	}

	result, err := h.SalaryComponentUseCase.Update(c.UserContext(), c.Params("id"), request)
	if err != nil {
		return err
	}

	return c.JSON(response.WebResponse[*model.SalaryComponentResponse]{Data: result})
}

func (h *SalaryController) Delete(c *fiber.Ctx) error {
	if err := h.SalaryComponentUseCase.Delete(c.UserContext(), c.Params("id")); err != nil {
		return err
	}

	return c.JSON(response.WebResponse[any]{Data: nil})
}
