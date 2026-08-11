package http

import (
	"hrsaas-admin-api/internal/modules/attendance/model"
	"hrsaas-admin-api/internal/modules/attendance/usecase"
	"hrsaas-admin-api/pkg/auth"
	"hrsaas-admin-api/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type OfficeLocationController struct {
	UseCase *usecase.OfficeLocationUseCase
	Log     *logrus.Logger
}

func NewOfficeLocationController(
	useCase *usecase.OfficeLocationUseCase,
	log *logrus.Logger,
) *OfficeLocationController {
	return &OfficeLocationController{
		UseCase: useCase,
		Log:     log,
	}
}

// Create Office Location Controller
func (c *OfficeLocationController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateOfficeLocationRequest)
	companyID := auth.GetCompanyId(ctx)
	request.CompanyID = companyID

	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	result, err := c.UseCase.Create(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to create office location")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.OfficeLocationResponse]{
		Data: result,
	})
}

/* Search Office Location Controller
 */
func (c *OfficeLocationController) List(ctx *fiber.Ctx) error {
	companyID := auth.GetCompanyId(ctx)
	request := new(model.SearchOfficeLocationRequest)
	request.Key = ctx.Query("key", "")
	request.CompanyID = companyID
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.UseCase.Search(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("error searching office locations")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.OfficeLocationResponse]{
		Data:   result,
		Paging: paging,
	})
}

func (c *OfficeLocationController) AssignEmployee(ctx *fiber.Ctx) error {
	request := new(model.AssignEmployeeToOfficeLocationRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	request.CompanyID = auth.GetCompanyId(ctx)

	if err := c.UseCase.AssignEmployee(ctx.UserContext(), request); err != nil {
		c.Log.WithError(err).Error("failed to assign employee to office location")
		return err
	}

	return ctx.JSON(response.WebResponse[any]{
		Data: nil,
	})
}

func (c *OfficeLocationController) Detail(ctx *fiber.Ctx) error {
	request := new(model.DetailOfficeLocationRequest)
	request.CompanyID = auth.GetCompanyId(ctx)
	request.OfficeLocationID = ctx.Params("officeLocationID")

	result, err := c.UseCase.DetailOfficeLocation(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list shifts")
		return err
	}

	return ctx.JSON(response.WebResponse[model.OfficeLocationResponse]{
		Data: *result,
	})
}

func (c *OfficeLocationController) Update(ctx *fiber.Ctx) error {
	request := new(model.UpdateOfficeLocationRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	companyID := auth.GetCompanyId(ctx)
	result, err := c.UseCase.Update(
		ctx.UserContext(),
		ctx.Params("officeLocationID"),
		companyID,
		request,
	)
	if err != nil {
		c.Log.WithError(err).Error("failed to update office location")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.OfficeLocationResponse]{
		Data: result,
	})
}

func (c *OfficeLocationController) BulkAssignEmployees(ctx *fiber.Ctx) error {
	request := new(model.BulkAssignEmployeesToOfficeLocationRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.ErrBadRequest
	}

	request.CompanyID = auth.GetCompanyId(ctx)
	request.OfficeLocationID = ctx.Params("officeLocationID")

	result, err := c.UseCase.BulkAssignEmployees(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to bulk assign employees to office location")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.OfficeLocationResponse]{Data: result})
}

func (c *OfficeLocationController) Delete(ctx *fiber.Ctx) error {
	companyID := auth.GetCompanyId(ctx)

	if err := c.UseCase.Delete(ctx.UserContext(), ctx.Params("officeLocationID"), companyID); err != nil {
		c.Log.WithError(err).Error("failed to delete office location")
		return err
	}

	return ctx.JSON(response.WebResponse[any]{
		Data: nil,
	})
}
