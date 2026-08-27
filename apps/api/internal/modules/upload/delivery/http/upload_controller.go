package http

import (
	"hrsaas/internal/modules/upload"
	"hrsaas/pkg/response"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type UploadController struct {
	UseCase *upload.UploadUseCase
	Log     *logrus.Logger
}

func NewUploadController(useCase *upload.UploadUseCase, log *logrus.Logger) *UploadController {
	return &UploadController{
		UseCase: useCase,
		Log:     log,
	}
}

func (c *UploadController) Upload(ctx *fiber.Ctx) error {
	file, err := ctx.FormFile("file")
	if err != nil {
		c.Log.WithError(err).Error("failed to read uploaded file")
		return fiber.NewError(fiber.StatusBadRequest, "file is required")
	}

	request := &upload.UploadRequest{File: file}

	result, err := c.UseCase.Upload(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to upload file")
		return err
	}

	return ctx.JSON(response.WebResponse[*upload.UploadResponse]{Data: result})
}

func (c *UploadController) Uploads(ctx *fiber.Ctx) error {
	form, err := ctx.MultipartForm()
	if err != nil {
		c.Log.WithError(err).Error("failed to parse multipart form")
		return fiber.NewError(fiber.StatusBadRequest, "multipart form is required")
	}

	files := form.File["file"]
	if len(files) == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "at least one file is required")
	}

	request := &upload.UploadsRequest{Files: files}

	result, err := c.UseCase.Uploads(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to upload files")
		return err
	}

	return ctx.JSON(response.WebResponse[*upload.UploadResponses]{Data: result})
}

func (c *UploadController) GenerateUploadUrl(ctx *fiber.Ctx) error {
	request := new(upload.PresignRequest)
	if ctx.Method() == fiber.MethodPost {
		if err := ctx.BodyParser(request); err != nil {
			c.Log.WithError(err).Error("failed to parse request body")
			return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
		}
	} else {
		if err := ctx.QueryParser(request); err != nil {
			c.Log.WithError(err).Error("failed to parse query params")
		}
		if request.MimeType == "" {
			request.MimeType = ctx.Query("mime_type")
		}
		if ctx.Query("is_public") == "true" || ctx.Query("is_public") == "1" {
			request.IsPublic = true
		}
	}

	result, err := c.UseCase.GenerateUploadURL(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to generate upload url")
		return err
	}

	return ctx.JSON(response.WebResponse[*upload.PresignResponse]{Data: result})
}
