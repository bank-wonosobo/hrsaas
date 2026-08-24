package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *EmployeeEducationController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/employee-educations")
	route.Get("/", protected("EMPLOYEE_EDUCATIONS", c.List)...)
	route.Post("/", protected("EMPLOYEE_EDUCATIONS", c.Create)...)
	route.Get("/:id", protected("EMPLOYEE_EDUCATIONS", c.Detail)...)
	route.Put("/:id", protected("EMPLOYEE_EDUCATIONS", c.Update)...)
	route.Delete("/:id", protected("EMPLOYEE_EDUCATIONS", c.Delete)...)
}
