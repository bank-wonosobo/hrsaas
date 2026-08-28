package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *TimeOffApprovalController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/time-off-approvals")

	route.Get("/", protected("TIME_OFF_APPROVALS", c.ListCurrent)...)
	route.Patch("/:approval_id", protected("TIME_OFF_APPROVALS", c.DecideShort)...)

}
