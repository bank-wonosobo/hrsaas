package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *EmployeeTrainingController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/employee-trainings")
	route.Get("/", protected("EMPLOYEE_TRAININGS", c.List)...)
	route.Post("/", protected("EMPLOYEE_TRAININGS", c.Create)...)
	route.Get("/:id", protected("EMPLOYEE_TRAININGS", c.Detail)...)
	route.Put("/:id", protected("EMPLOYEE_TRAININGS", c.Update)...)
	route.Delete("/:id", protected("EMPLOYEE_TRAININGS", c.Delete)...)
}
