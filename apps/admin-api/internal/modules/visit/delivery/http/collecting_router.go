package http

import (
	"hrsaas-admin-api/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *CollectingController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware) {
	route := router.Group("/collecting")
	route.Get("/admin", protected("REMIDIAL_VISITS", c.ListAdmin)...)
	route.Get("/_export", protected("REMIDIAL_VISITS", c.Export)...)
	route.Put("/:remidial_visit_id", protected("REMIDIAL_VISITS", c.Update)...)
	route.Delete("/:remidial_visit_id/delete", protected("REMIDIAL_VISITS", c.Delete)...)
}
