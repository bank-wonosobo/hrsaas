package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *ShiftController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware) {
	route := router.Group("/shifts")
	route.Get("/", protected("SHIFTS", c.List)...)
	route.Post("/", protected("SHIFTS", c.Create)...)
	route.Get("/:shiftID", protected("SHIFTS", c.Detail)...)
	route.Put("/:shiftID", protected("SHIFTS", c.Update)...)
	route.Delete("/:shiftID", protected("SHIFTS", c.Delete)...)
	route.Post("/assign-employee", protected("SHIFTS", c.AssignEmployee)...)
	route.Post("/:shiftID/employees", protected("SHIFTS", c.BulkAssignEmployees)...)
}
