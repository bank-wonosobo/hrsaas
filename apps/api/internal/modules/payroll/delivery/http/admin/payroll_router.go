package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (h *PayrollHandler) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	payrolls := router.Group("/payrolls")
	payrolls.Get("/", protected("PAYROLLS", h.List)...)
	payrolls.Post("/", protected("PAYROLLS", h.Create)...)
	payrolls.Get("/:id", protected("PAYROLLS", h.Detail)...)
	payrolls.Delete("/:id", protected("PAYROLLS", h.Delete)...)
	payrolls.Post("/:id/calculate", protected("PAYROLLS", h.Calculate)...)
	payrolls.Post("/:id/submit", protected("PAYROLLS", h.Submit)...)
	payrolls.Post("/:id/approve", protected("PAYROLL_APPROVALS", h.Approve)...)
	payrolls.Post("/:id/pay", protected("PAYROLL_PAYMENTS", h.Pay)...)
	payrolls.Post("/:id/cancel", protected("PAYROLLS", h.Cancel)...)
	payrolls.Get("/:id/approvals", protected("PAYROLL_APPROVALS", h.ListApprovals)...)
}
