package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *TimeOffBalanceController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/time-off-balances")
	route.Post("/_set", protected("TIME_OFF_BALANCES", c.SetBalance)...)
	route.Get("/", protected("TIME_OFF_BALANCES", c.ListBalancesByEmployee)...)
	route.Put("/:id", protected("TIME_OFF_BALANCES", c.Update)...)
	route.Delete("/:id", protected("TIME_OFF_BALANCES", c.Delete)...)
}
