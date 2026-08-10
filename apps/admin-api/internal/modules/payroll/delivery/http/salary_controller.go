package http

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type SalaryController struct {
	log *logrus.Logger
}

func NewSalaryController(log *logrus.Logger) *SalaryController {
	return &SalaryController{log: log}
}

// ─── Account ──────────────────────────────────────────────────────────────────

func (h *SalaryController) List(c *fiber.Ctx) error {
	return c.Status(http.StatusCreated).JSON("OK")
}
