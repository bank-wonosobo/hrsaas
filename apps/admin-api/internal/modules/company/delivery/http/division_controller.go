package http

import (
	"hrsaas-admin-api/internal/modules/company/model"
	"hrsaas-admin-api/internal/modules/company/usecase"
	"hrsaas-admin-api/pkg/auth"
	"hrsaas-admin-api/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type DivisionController struct {
	DivisionUseCase *usecase.DivisionUseCase
	Log             *logrus.Logger
}

func NewDivisionController(divisionUseCase *usecase.DivisionUseCase, log *logrus.Logger) *DivisionController {
	return &DivisionController{
		DivisionUseCase: divisionUseCase,
		Log:             log,
	}
}

// TODO: Add role-based restriction (admin only) if needed.
func (c *DivisionController) List(ctx *fiber.Ctx) error {
	request := new(model.SearchDivisionRequest)
	request.CompanyID = auth.GetCompanyId(ctx)
	request.Name = ctx.Query("name", "")
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.DivisionUseCase.Search(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("error searching divisions")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.DivisionResponse]{
		Data:   result,
		Paging: paging,
	})
}

// TODO: Enforce admin-only access.
func (c *DivisionController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateDivisionRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	request.CompanyID = auth.GetCompanyId(ctx)
	result, err := c.DivisionUseCase.Create(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to create division")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.DivisionResponse]{
		Data: result,
	})
}

func (c *DivisionController) Detail(ctx *fiber.Ctx) error {
	companyID := auth.GetCompanyId(ctx)

	result, err := c.DivisionUseCase.Detail(ctx.UserContext(), ctx.Params("id"), companyID)
	if err != nil {
		c.Log.WithError(err).Error("failed to get division detail")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.DivisionResponse]{
		Data: result,
	})
}

func (c *DivisionController) Update(ctx *fiber.Ctx) error {
	request := new(model.UpdateDivisionRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	companyID := auth.GetCompanyId(ctx)
	result, err := c.DivisionUseCase.Update(ctx.UserContext(), ctx.Params("id"), companyID, request)
	if err != nil {
		c.Log.WithError(err).Error("failed to update division")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.DivisionResponse]{
		Data: result,
	})
}

func (c *DivisionController) Delete(ctx *fiber.Ctx) error {
	companyID := auth.GetCompanyId(ctx)

	if err := c.DivisionUseCase.Delete(ctx.UserContext(), ctx.Params("id"), companyID); err != nil {
		c.Log.WithError(err).Error("failed to delete division")
		return err
	}

	return ctx.JSON(response.WebResponse[any]{
		Data: nil,
	})
}
