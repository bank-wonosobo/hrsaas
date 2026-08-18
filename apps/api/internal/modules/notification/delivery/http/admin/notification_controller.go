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

type NotificationController struct {
	NotificationUseCase *usecase.NotificationUseCase
	Log                 *logrus.Logger
}

func NewNotificationController(notificationUseCase *usecase.NotificationUseCase, log *logrus.Logger) *NotificationController {
	return &NotificationController{
		NotificationUseCase: notificationUseCase,
		Log:                 log,
	}
}

// Create sends a notification, either to specific user_ids or broadcast via
// targets (division/position/office_location/role/all).
func (c *NotificationController) Create(ctx *fiber.Ctx) error {
	request := new(model.CreateNotificationRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	user := auth.GetUser(ctx)
	request.CompanyID = user.CompanyID
	request.CreatedBy = user.ID

	result, err := c.NotificationUseCase.Create(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to create notification")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.NotificationResponse]{Data: result})
}

// Inbox lists the notifications addressed to the current user.
func (c *NotificationController) Inbox(ctx *fiber.Ctx) error {
	user := auth.GetUser(ctx)
	request := &model.SearchInboxRequest{
		UserID:     user.ID,
		UnreadOnly: ctx.QueryBool("unread_only", false),
		Page:       ctx.QueryInt("page", 1),
		Size:       ctx.QueryInt("size", 10),
	}

	result, total, err := c.NotificationUseCase.Inbox(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to list notification inbox")
		return err
	}

	paging := &response.PageMetadata{
		Page:      request.Page,
		Size:      request.Size,
		TotalItem: total,
		TotalPage: int64(math.Ceil(float64(total) / float64(request.Size))),
	}

	return ctx.JSON(response.WebResponse[[]model.InboxNotificationResponse]{
		Data:   result,
		Paging: paging,
	})
}

func (c *NotificationController) UnreadCount(ctx *fiber.Ctx) error {
	user := auth.GetUser(ctx)

	count, err := c.NotificationUseCase.UnreadCount(ctx.UserContext(), user.ID)
	if err != nil {
		c.Log.WithError(err).Error("failed to count unread notifications")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.UnreadCountResponse]{
		Data: &model.UnreadCountResponse{Count: count},
	})
}

func (c *NotificationController) Detail(ctx *fiber.Ctx) error {
	user := auth.GetUser(ctx)

	result, err := c.NotificationUseCase.Detail(ctx.UserContext(), ctx.Params("id"), user.ID)
	if err != nil {
		c.Log.WithError(err).Error("failed to get notification detail")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.InboxNotificationResponse]{Data: result})
}

func (c *NotificationController) MarkAsRead(ctx *fiber.Ctx) error {
	user := auth.GetUser(ctx)

	result, err := c.NotificationUseCase.MarkAsRead(ctx.UserContext(), ctx.Params("id"), user.ID)
	if err != nil {
		c.Log.WithError(err).Error("failed to mark notification as read")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.InboxNotificationResponse]{Data: result})
}

func (c *NotificationController) MarkAllAsRead(ctx *fiber.Ctx) error {
	user := auth.GetUser(ctx)

	if err := c.NotificationUseCase.MarkAllAsRead(ctx.UserContext(), user.ID); err != nil {
		c.Log.WithError(err).Error("failed to mark all notifications as read")
		return err
	}

	return ctx.JSON(response.WebResponse[any]{Data: nil})
}

// Delete retracts a notification entirely (admin only). Cascades to its
// targets, recipients, and deliveries.
func (c *NotificationController) Delete(ctx *fiber.Ctx) error {
	companyID := auth.GetCompanyId(ctx)

	if err := c.NotificationUseCase.Delete(ctx.UserContext(), ctx.Params("id"), companyID); err != nil {
		c.Log.WithError(err).Error("failed to delete notification")
		return err
	}

	return ctx.JSON(response.WebResponse[any]{Data: nil})
}
