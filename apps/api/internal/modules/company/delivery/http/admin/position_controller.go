package admin

import (
	"hrsaas/internal/modules/company/model"
	"hrsaas/internal/modules/company/usecase"
	"hrsaas/pkg/auth"
	"hrsaas/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type PositionController struct {
	PositionUseCase *usecase.PositionUseCase
	Log             *logrus.Logger
}

func NewPositionController(positionUseCase *usecase.PositionUseCase, log *logrus.Logger) *PositionController {
	return &PositionController{
		Log:             log,
		PositionUseCase: positionUseCase,
	}
}

/* List Position Controller
 */
func (c *PositionController) ListPosition(ctx *fiber.Ctx) error {
	request := new(model.SearchPositionRequest)
	companyID := auth.GetCompanyId(ctx)
	request.CompanyID = companyID
	request.Name = ctx.Query("name", "")
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.PositionUseCase.Search(ctx.UserContext(), request)
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

	return ctx.JSON(response.WebResponse[[]model.PositionResponse]{
		Data:   result,
		Paging: paging,
	})
}

/* Create Position
 */
func (c *PositionController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreatePositionRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	companyID := auth.GetCompanyId(ctx)
	request.CompanyID = companyID

	result, err := c.PositionUseCase.Create(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to create sanction")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.PositionResponse]{
		Data: result,
	})
}

func (c *PositionController) Detail(ctx *fiber.Ctx) error {
	result, err := c.PositionUseCase.Detail(ctx.UserContext(), ctx.Params("id"))
	if err != nil {
		c.Log.WithError(err).Error("failed to get position detail")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.PositionResponse]{
		Data: result,
	})
}

func (c *PositionController) Update(ctx *fiber.Ctx) error {
	request := new(model.UpdatePositionRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	result, err := c.PositionUseCase.Update(ctx.UserContext(), ctx.Params("id"), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to update position")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.PositionResponse]{
		Data: result,
	})
}

func (c *PositionController) Delete(ctx *fiber.Ctx) error {
	if err := c.PositionUseCase.Delete(ctx.UserContext(), ctx.Params("id")); err != nil {
		c.Log.WithError(err).Error("failed to delete position")
		return err
	}

	return ctx.JSON(response.WebResponse[any]{
		Data: nil,
	})
}
