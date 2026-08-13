package http

import (
	"hrsaas-admin-api/internal/modules/announcement/model"
	"hrsaas-admin-api/internal/modules/announcement/usecase"
	"hrsaas-admin-api/pkg/auth"
	"hrsaas-admin-api/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type AnnouncementController struct {
	AnnouncementUsecase *usecase.AnnouncementUsecase
	Log                 *logrus.Logger
}

func NewAnnouncementController(
	announcementUsecase *usecase.AnnouncementUsecase,
	log *logrus.Logger,
) *AnnouncementController {
	return &AnnouncementController{
		AnnouncementUsecase: announcementUsecase,
		Log:                 log,
	}
}

// List Announcements
func (c *AnnouncementController) List(ctx *fiber.Ctx) error {
	request := new(model.SearchAnnouncementRequest)
	companyID := auth.GetCompanyId(ctx)
	request.CompanyID = companyID
	request.Title = ctx.Query("title", "")
	request.Category = ctx.Query("category", "")
	request.EmployeeID = ctx.Query("employee_id", "")
	request.CreatedAt = 0
	request.Page = ctx.QueryInt("page", 1)
	request.Size = ctx.QueryInt("size", 10)

	result, total, err := c.AnnouncementUsecase.List(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("error listing announcements")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.AnnouncementResponse]{
		Data:   result,
		Paging: paging,
	})
}

// Create Announcement
func (c *AnnouncementController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateAnnouncementRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	user := auth.GetUser(ctx)
	request.CompanyID = user.CompanyID

	result, err := c.AnnouncementUsecase.Create(ctx.UserContext(), user.ID, request)
	if err != nil {
		c.Log.WithError(err).Error("failed to create announcement")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.AnnouncementResponse]{
		Data: result,
	})
}

// Get Announcement Detail
func (c *AnnouncementController) Detail(ctx *fiber.Ctx) error {
	id := ctx.Params("announce_id")
	companyID := auth.GetCompanyId(ctx)

	result, err := c.AnnouncementUsecase.Detail(ctx.UserContext(), id, companyID)
	if err != nil {
		c.Log.WithError(err).Error("failed to get announcement detail")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.AnnouncementResponse]{
		Data: result,
	})
}

// Update Announcement
func (c *AnnouncementController) Update(ctx *fiber.Ctx) error {
	request := new(model.UpdateAnnouncementRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	id := ctx.Params("announce_id")
	companyID := auth.GetCompanyId(ctx)

	result, err := c.AnnouncementUsecase.Update(ctx.UserContext(), id, companyID, request)
	if err != nil {
		c.Log.WithError(err).Error("failed to update announcement")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.AnnouncementResponse]{
		Data: result,
	})
}

// Delete Announcement
func (c *AnnouncementController) Delete(ctx *fiber.Ctx) error {
	id := ctx.Params("announce_id")
	companyID := auth.GetCompanyId(ctx)

	err := c.AnnouncementUsecase.Delete(ctx.UserContext(), id, companyID)
	if err != nil {
		c.Log.WithError(err).Error("failed to delete announcement")
		return err
	}

	return ctx.JSON(response.WebResponse[interface{}]{
		Data: nil,
	})
}
