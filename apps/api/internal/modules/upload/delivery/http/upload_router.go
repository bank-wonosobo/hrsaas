package http

import "github.com/gofiber/fiber/v2"

func (c *UploadController) RegisterRoutes(
	router fiber.Router,
	authMiddleware fiber.Handler,
) {
	route := router.Group("/upload")

	route.Post("/generate-url", authMiddleware, c.GenerateUploadUrl)
	route.Get("/generate-url", authMiddleware, c.GenerateUploadUrl)
	route.Post("/", authMiddleware, c.Upload)
	route.Post("/multiple", authMiddleware, c.Uploads)
}
