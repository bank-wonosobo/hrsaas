package client

import (
	"hrsaas/internal/modules/announcement/model"
	"hrsaas/internal/modules/announcement/usecase"
	"hrsaas/pkg/auth"
	"hrsaas/pkg/response"
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

func (c *AnnouncementController) List(ctx *fiber.Ctx) error {
	request := new(model.SearchAnnouncementRequest)
	request.CompanyID = auth.GetCompanyId(ctx)
	request.Title = ctx.Query("title", "")
	request.Category = ctx.Query("category", "")
	request.EmployeeID = ctx.Query("employee_id", "")
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
