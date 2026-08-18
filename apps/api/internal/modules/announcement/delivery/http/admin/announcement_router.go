package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *AnnouncementController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware) {
	route := router.Group("/announcements")
	route.Post("/", protected("ANNOUNCEMENTS", c.Create)...)
	route.Put("/:announce_id", protected("ANNOUNCEMENTS", c.Update)...)
	route.Delete("/:announce_id", protected("ANNOUNCEMENTS", c.Delete)...)
}
