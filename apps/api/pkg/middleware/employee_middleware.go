package middleware

import (
	employeeModel "hrsaas/internal/modules/employee/model"
	employeeUsecase "hrsaas/internal/modules/employee/usecase"
	"hrsaas/pkg/auth"

	"github.com/gofiber/fiber/v2"
)

func NewEmployee(employeeUseCase *employeeUsecase.EmployeeUseCase) fiber.Handler {
	return func(ctx *fiber.Ctx) error {
		user := auth.GetUser(ctx)

		request := &employeeModel.CurrentEmployeeRequest{UserID: user.ID}

		employee, err := employeeUseCase.Current(ctx.UserContext(), request)
		if err != nil {
			employeeUseCase.Log.Warnf("Failed find employee by user id %s : %+v", user.ID, err)
			return fiber.NewError(
				fiber.StatusForbidden,
				"Akun ini belum terhubung dengan data karyawan",
			)
		}

		ctx.Locals("employee", employee)

		return ctx.Next()
	}
}
