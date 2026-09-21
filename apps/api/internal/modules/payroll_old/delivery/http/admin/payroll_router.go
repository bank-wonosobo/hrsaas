package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *PayrollController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	payrolls := router.Group("/payrolls")
	payrolls.Get("/", protected("PAYROLLS", c.List)...)
	payrolls.Post("/", protected("PAYROLLS", c.Create)...)
	payrolls.Get("/:id", protected("PAYROLLS", c.Detail)...)
	payrolls.Delete("/:id", protected("PAYROLLS", c.Delete)...)
	payrolls.Post("/:id/calculate", protected("PAYROLLS", c.Calculate)...)
	payrolls.Post("/:id/submit", protected("PAYROLLS", c.Submit)...)
	payrolls.Post("/:id/cancel", protected("PAYROLLS", c.Cancel)...)
	payrolls.Post("/:id/approve", protected("PAYROLL_APPROVALS", c.Approve)...)
	payrolls.Post("/:id/reject", protected("PAYROLL_APPROVALS", c.Reject)...)
	payrolls.Get("/:id/approvals", protected("PAYROLL_APPROVALS", c.ListApprovals)...)
	payrolls.Post("/:id/pay", protected("PAYROLL_PAYMENTS", c.Pay)...)

	details := router.Group("/payroll-details")
	details.Get("/:id", protected("PAYROLLS", c.DetailByDetailID)...)
	details.Get("/:id/adjustments", protected("PAYROLL_ADJUSTMENTS", c.ListAdjustments)...)
	details.Post("/:id/adjustments", protected("PAYROLL_ADJUSTMENTS", c.CreateAdjustment)...)

	adjustments := router.Group("/payroll-adjustments")
	adjustments.Delete("/:adjustmentId", protected("PAYROLL_ADJUSTMENTS", c.DeleteAdjustment)...)
}
