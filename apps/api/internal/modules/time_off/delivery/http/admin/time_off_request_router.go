package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *TimeOffRequestController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/time-off-requests")
	route.Get("/", protected("TIME_OFF_REQUESTS", c.ListRequests)...)
	route.Post("/:employee_id", protected("TIME_OFF_REQUESTS", c.AdminCreateRequest)...)
	route.Delete("/:id", protected("TIME_OFF_REQUESTS", c.DeleteRequest)...)
}
