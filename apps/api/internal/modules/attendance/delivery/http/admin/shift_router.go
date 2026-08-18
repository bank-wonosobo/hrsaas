package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *ShiftController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware) {
	route := router.Group("/shits")
	route.Get("/", protected("SHIFT", c.List)...)
	route.Post("/", protected("SHIFT", c.Create)...)
	route.Get("/:shiftID", protected("SHIFT", c.Detail)...)
	route.Put("/:shiftID", protected("SHIFT", c.Update)...)
	route.Delete("/:shiftID", protected("SHIFT", c.Delete)...)
	route.Post("/assign-employee", protected("SHIFT", c.AssignEmployee)...)
	route.Post("/:shiftID/employees", protected("SHIFT", c.BulkAssignEmployees)...)
}
