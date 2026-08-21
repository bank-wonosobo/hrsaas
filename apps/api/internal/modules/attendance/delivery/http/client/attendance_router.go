package client

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *AttendanceController) RegisterRoutes(
	router fiber.Router,
	client middleware.ClientMiddleware,
) {
	route := router.Group("/attendances")

	route.Get("/", client(c.List)...)
	route.Get("/_today", client(c.DetailToday)...)
	route.Post("/check-in", client(c.CheckIn)...)
	route.Post("/check-out", client(c.CheckOut)...)
	route.Post("/break-in", client(c.BreakIn)...)
	route.Post("/break-out", client(c.BreakOut)...)
	route.Post("/lend/check-in", client(c.LendCheckIn)...)
	route.Post("/lend/check-out", client(c.LendCheckOut)...)
	route.Post("/_current/register-face", client(c.RegisterFaceCurrent)...)
	route.Post("/_current/face", client(c.FaceStatusCurrent)...)

}
