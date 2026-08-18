package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *NotificationController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/notifications")

	route.Get("/", protected("NOTIFICATIONS", c.Inbox)...)
	route.Post("/", protected("NOTIFICATIONS", c.Create)...)
	route.Get("/unread-count", protected("NOTIFICATIONS", c.UnreadCount)...)
	route.Put("/read-all", protected("NOTIFICATIONS", c.MarkAllAsRead)...)
	route.Get("/:id", protected("NOTIFICATIONS", c.Detail)...)
	route.Put("/:id/read", protected("NOTIFICATIONS", c.MarkAsRead)...)
	route.Delete("/:id", protected("NOTIFICATIONS", c.Delete)...)
}
