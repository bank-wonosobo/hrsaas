package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *OfficeLocationController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware) {
	route := router.Group("/office-locations")
	route.Get("/", protected("OFFICE_LOCATIONS", c.List)...)
	route.Post("/", protected("OFFICE_LOCATIONS", c.Create)...)
	route.Get("/:officeLocationID", protected("OFFICE_LOCATIONS", c.Detail)...)
	route.Put("/:officeLocationID", protected("OFFICE_LOCATIONS", c.Update)...)
	route.Delete("/:officeLocationID", protected("OFFICE_LOCATIONS", c.Delete)...)
	route.Post("/assign-employee", protected("OFFICE_LOCATIONS", c.AssignEmployee)...)
	route.Post("/:officeLocationID/employees", protected("OFFICE_LOCATIONS", c.BulkAssignEmployees)...)
}
