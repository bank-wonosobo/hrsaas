package http

import (
	"hrsaas-admin-api/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *EmployeeController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/employees")

	// Employee management requires the EMPLOYEES permission.
	route.Get("/", protected("EMPLOYEES", c.ListEmployee)...)
	route.Post("/", protected("EMPLOYEES", c.CreateEmployee)...)
	route.Post("/_import", protected("EMPLOYEES", c.ImportExcel)...)
	route.Get("/_export", protected("EMPLOYEES", c.ExportExcel)...)
	route.Get("/:id", protected("EMPLOYEES", c.DetailEmployee)...)
	route.Put("/:id", protected("EMPLOYEES", c.UpdateEmployee)...)
	route.Delete("/:id", protected("EMPLOYEES", c.DeleteEmployee)...)
}
