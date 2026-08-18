package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *AttendanceController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware) {
	route := router.Group("/attendances")
	route.Get("/", protected("ATTENDANCES", c.List)...)
	route.Get("/export", protected("ATTENDANCES", c.Export)...)
	route.Get("/logs", protected("ATTENDANCES", c.ListLog)...)
	route.Get("/:attendanceID", protected("ATTENDANCES", c.Detail)...)
	route.Put("/:attendanceID", protected("ATTENDANCES", c.Update)...)
	route.Delete("/:attendanceID", protected("ATTENDANCES", c.Delete)...)
}
