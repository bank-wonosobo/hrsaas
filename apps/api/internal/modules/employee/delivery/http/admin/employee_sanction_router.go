package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *EmSancController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/employee-sanctions")
	route.Get("/", protected("EMPLOYEE_SANCTIONS", c.Search)...)
	route.Post("/", protected("EMPLOYEE_SANCTIONS", c.Create)...)
	route.Get("/:id", protected("EMPLOYEE_SANCTIONS", c.Detail)...)
	route.Put("/:id", protected("EMPLOYEE_SANCTIONS", c.Update)...)
	route.Delete("/:id", protected("EMPLOYEE_SANCTIONS", c.Delete)...)
}
