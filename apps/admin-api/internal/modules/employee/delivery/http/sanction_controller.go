package http

import (
	"hrsaas-admin-api/internal/modules/employee/model"
	"hrsaas-admin-api/internal/modules/employee/usecase"
	"hrsaas-admin-api/pkg/auth"
	"hrsaas-admin-api/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type SanctionController struct {
	SanctionUseCase *usecase.SanctionUseCase
	Log             *logrus.Logger
}

func NewSanctionController(
	sanctionUseCase *usecase.SanctionUseCase,
	log *logrus.Logger,
) *SanctionController {
	return &SanctionController{
		SanctionUseCase: sanctionUseCase,
		Log:             log,
	}
}

/* Create Sanction Controller
 */
func (c *SanctionController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateSanctionRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	companyID := auth.GetCompanyId(ctx)
	request.CompanyID = companyID

	result, err := c.SanctionUseCase.Create(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to create sanction")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.SanctionResponse]{
		Data: result,
	})
}

/* Search Sanction
 */
func (c *SanctionController) ListSanction(ctx *fiber.Ctx) error {
	companyID := auth.GetCompanyId(ctx)
	request := new(model.SearchSanctionRequest)
	request.Key = ctx.Query("key", "")
	request.CompanyID = companyID
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.SanctionUseCase.Search(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("error searching sanction")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.SanctionResponse]{
		Data:   result,
		Paging: paging,
	})
}

func (c *SanctionController) Detail(ctx *fiber.Ctx) error {
	companyID := auth.GetCompanyId(ctx)

	result, err := c.SanctionUseCase.Detail(ctx.UserContext(), ctx.Params("id"), companyID)
	if err != nil {
		c.Log.WithError(err).Error("failed to get sanction detail")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.SanctionResponse]{
		Data: result,
	})
}

func (c *SanctionController) Update(ctx *fiber.Ctx) error {
	request := new(model.UpdateSanctionRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	companyID := auth.GetCompanyId(ctx)

	result, err := c.SanctionUseCase.Update(ctx.UserContext(), ctx.Params("id"), companyID, request)
	if err != nil {
		c.Log.WithError(err).Error("failed to update sanction")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.SanctionResponse]{
		Data: result,
	})
}

func (c *SanctionController) Delete(ctx *fiber.Ctx) error {
	companyID := auth.GetCompanyId(ctx)

	if err := c.SanctionUseCase.Delete(ctx.UserContext(), ctx.Params("id"), companyID); err != nil {
		c.Log.WithError(err).Error("failed to delete sanction")
		return err
	}

	return ctx.JSON(response.WebResponse[any]{
		Data: nil,
	})
}
