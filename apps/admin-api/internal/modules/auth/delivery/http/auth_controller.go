package http

import (
	"hrsaas-admin-api/internal/modules/user/model"

	"hrsaas-admin-api/internal/modules/auth/usecase"
	"hrsaas-admin-api/pkg/response"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

type AuthController struct {
	AuthUseCase *usecase.AuthUseCase
	Log         *logrus.Logger
	Viper       *viper.Viper
}

func NewAuthController(authUseCase *usecase.AuthUseCase, log *logrus.Logger, viper *viper.Viper) *AuthController {
	return &AuthController{
		AuthUseCase: authUseCase,
		Log:         log,
		Viper:       viper,
	}
}

/*
Cookies
*/
func (c *AuthController) setTokenCookie(ctx *fiber.Ctx, token string) {
	secure := c.Viper.GetBool("app.cookie_secure")
	domain := c.Viper.GetString("app.cookie_domain")
	sameSite := "Lax"
	if secure {
		sameSite = "None"
	}

	ctx.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    token,
		HTTPOnly: true,
		Secure:   secure,
		SameSite: sameSite,
		Domain:   domain,
		Path:     "/",
		MaxAge:   60 * 60 * 24 * 7,
	})
}

func (c *AuthController) clearTokenCookie(ctx *fiber.Ctx) {
	secure := c.Viper.GetBool("app.cookie_secure")
	domain := c.Viper.GetString("app.cookie_domain")
	sameSite := "Lax"
	if secure {
		sameSite = "None"
	}

	ctx.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    "",
		HTTPOnly: true,
		Secure:   secure,
		SameSite: sameSite,
		Domain:   domain,
		Path:     "/",
		MaxAge:   -1,
	})
}

/*
Register User Controller
*/
func (c *AuthController) Register(ctx *fiber.Ctx) error {
	request := new(model.RegisterUserRequest)
	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	result, err := c.AuthUseCase.Register(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to register user")
		return err
	}

	return ctx.JSON(response.WebResponse[*model.UserResponse]{
		Data: result,
	})
}

/*
Login User Controller
*/
func (c *AuthController) Login(ctx *fiber.Ctx) error {
	userAgent := ctx.Get(fiber.HeaderUserAgent)
	ip := ctx.IP()

	c.Log.Infof("Login attempt from IP: %s, User-Agent: %s", ip, userAgent)

	request := new(model.LoginUserRequest)
	request.UserAgent = userAgent
	request.Ip = ip

	if err := ctx.BodyParser(request); err != nil {
		c.Log.WithError(err).Error("failed to parse request body")
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	result, err := c.AuthUseCase.Login(ctx.UserContext(), request)
	if err != nil {
		c.Log.WithError(err).Error("failed to login user")
		return err
	}

	c.setTokenCookie(ctx, result.Token)

	return ctx.JSON(response.WebResponse[*model.LoginUserResponse]{
		Data: result,
	})
}

/*
Logout User Controller
*/
func (c *AuthController) Logout(ctx *fiber.Ctx) error {
	token := ctx.Cookies("token")
	if token == "" {
		return fiber.NewError(fiber.StatusBadRequest, "No token found in cookies")
	}

	if err := c.AuthUseCase.Logout(ctx.UserContext(), token); err != nil {
		c.Log.WithError(err).Error("Gagal Logout")
		return err
	}

	c.clearTokenCookie(ctx)
	return ctx.JSON(response.WebResponse[any]{
		Data: nil,
	})
}
