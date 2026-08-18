package admin

import (
	"hrsaas/internal/modules/notification/model"
	"hrsaas/internal/modules/notification/usecase"
	"hrsaas/pkg/auth"
	"hrsaas/pkg/response"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type NotificationTemplateController struct {
	NotificationTemplateUseCase *usecase.NotificationTemplateUseCase
	Log                         *logrus.Logger
}

func NewNotificationTemplateController(notificationTemplateUseCase *usecase.NotificationTemplateUseCase, log *logrus.Logger) *NotificationTemplateController {
	return &NotificationTemplateController{
		NotificationTemplateUseCase: notificationTemplateUseCase,
		Log:                         log,
	}
}

func (c *NotificationTemplateController) List(ctx *fiber.Ctx) error {
	request := &model.SearchNotificationTemplateRequest{
		CompanyID:  auth.GetCompanyId(ctx),
		Key:        ctx.Query("key", ""),
		Category:   ctx.Query("category", ""),
		ActiveOnly: ctx.QueryBool("active_only", false),
		Page:       ctx.QueryInt("page", 1),
		Size:       ctx.QueryInt("size", 10),
	}

	result, total, err := c.NotificationTemplateUseCase.List(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list notification templates")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.NotificationTemplateResponse]{
		Data:   result,
		Paging: paging,
	})
}

func (c *NotificationTemplateController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateNotificationTemplateRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	request.CompanyID = auth.GetCompanyId(ctx)
	result, err := c.NotificationTemplateUseCase.Create(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to create notification template")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.NotificationTemplateResponse]{Data: result})
}

func (c *NotificationTemplateController) Detail(ctx *fiber.Ctx) error {
	companyID := auth.GetCompanyId(ctx)

	result, err := c.NotificationTemplateUseCase.Detail(ctx.UserContext(), ctx.Params("id"), companyID)
	if err != nil {
		c.Log.WithError(err).Error("failed to get notification template detail")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.NotificationTemplateResponse]{Data: result})
}

func (c *NotificationTemplateController) Update(ctx *fiber.Ctx) error {
	request := new(model.UpdateNotificationTemplateRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	companyID := auth.GetCompanyId(ctx)
	result, err := c.NotificationTemplateUseCase.Update(ctx.UserContext(), ctx.Params("id"), companyID, request)
	if err != nil {
		c.Log.WithError(err).Error("failed to update notification template")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.NotificationTemplateResponse]{Data: result})
}

func (c *NotificationTemplateController) Delete(ctx *fiber.Ctx) error {
	companyID := auth.GetCompanyId(ctx)

	if err := c.NotificationTemplateUseCase.Delete(ctx.UserContext(), ctx.Params("id"), companyID); err != nil {
		c.Log.WithError(err).Error("failed to delete notification template")
		return err
	}

	return ctx.JSON(response.WebResponse[any]{Data: nil})
}
