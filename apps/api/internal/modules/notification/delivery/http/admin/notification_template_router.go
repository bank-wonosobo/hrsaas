package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *NotificationTemplateController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/notification-templates")

	route.Get("/", protected("NOTIFICATION_TEMPLATES", c.List)...)
	route.Post("/", protected("NOTIFICATION_TEMPLATES", c.Create)...)
	route.Get("/:id", protected("NOTIFICATION_TEMPLATES", c.Detail)...)
	route.Put("/:id", protected("NOTIFICATION_TEMPLATES", c.Update)...)
	route.Delete("/:id", protected("NOTIFICATION_TEMPLATES", c.Delete)...)
}
