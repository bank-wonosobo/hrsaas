package bootstrap

import (
	authHttp "hrsaas-admin-api/internal/modules/auth/delivery/http"
	authRepo "hrsaas-admin-api/internal/modules/auth/repository"
	authUc "hrsaas-admin-api/internal/modules/auth/usecase"
	"hrsaas-admin-api/pkg/middleware"

	companyHttp "hrsaas-admin-api/internal/modules/company/delivery/http"
	companyRepo "hrsaas-admin-api/internal/modules/company/repository"
	compantUc "hrsaas-admin-api/internal/modules/company/usecase"

	employeeHttp "hrsaas-admin-api/internal/modules/employee/delivery/http"
	employeeRepo "hrsaas-admin-api/internal/modules/employee/repository"
	employeeUc "hrsaas-admin-api/internal/modules/employee/usecase"

	httpSalary "hrsaas-admin-api/internal/modules/salary/delivery/http"
	userHttp "hrsaas-admin-api/internal/modules/user/delivery/http"
	userRepo "hrsaas-admin-api/internal/modules/user/repository"
	"hrsaas-admin-api/internal/modules/user/usecase"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"gorm.io/gorm"
)

type BootstrapConfig struct {
	App       *fiber.App
	DB        *gorm.DB
	Log       *logrus.Logger
	Validator *validator.Validate
	Config    *viper.Viper
}

func Bootstrap(cfg *BootstrapConfig) {
	api := cfg.App.Group("/api")

	// ====== REPO =======
	// module auth
	userRepository := userRepo.NewUserRepository(cfg.Log)
	sessionRepo := authRepo.NewSessionRepository(cfg.Log)
	// module company
	companyRepository := companyRepo.NewCompanyRepository(cfg.Log)
	divisionRepository := companyRepo.NewDivisionRepository(cfg.Log)
	positionRepository := companyRepo.NewPositionRepository(cfg.Log)
	// module user
	roleRepoitory := userRepo.NewRoleRepository(cfg.Log)
	// module employee
	employeeRepository := employeeRepo.NewEmployeeRepository(cfg.Log)
	employeeContractRepository := employeeRepo.NewEmployeeContractRepository(cfg.Log)
	employeeDocsRepository := employeeRepo.NewEmployeeDocumentRepository(cfg.Log)
	// module salary

	// ====== USE CASE =======
	// module auth
	authUseCase := authUc.NewAuthUseCase(cfg.DB, cfg.Log, cfg.Validator, userRepository, sessionRepo, companyRepository, roleRepoitory)
	// module company
	divisionUseCase := compantUc.NewDivisionUseCase(cfg.DB, cfg.Log, cfg.Validator, divisionRepository)
	positionUseCase := compantUc.NewPositionUseCase(cfg.DB, cfg.Log, cfg.Validator, positionRepository)
	// module user
	userUseCase := usecase.NewUserUseCase(cfg.DB, cfg.Log, cfg.Validator, userRepository, roleRepoitory)
	// module employee
	employeeContractUseCase := employeeUc.NewEmployeeContractUseCase(cfg.DB, cfg.Log, cfg.Validator, employeeContractRepository)
	employeeUseCase := employeeUc.NewEmployeeUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		employeeRepository,
		userRepository,
		employeeContractRepository,
		positionRepository,
		divisionRepository,
	)
	employeeDocsUseCase := employeeUc.NewEmployeeDocumentUseCase(cfg.DB, cfg.Log, cfg.Validator, employeeDocsRepository)
	// module salary

	// ====== CONTROLLER =======
	// module auth
	authController := authHttp.NewAuthController(authUseCase, cfg.Log, cfg.Config)
	// module company
	divisionController := companyHttp.NewDivisionController(divisionUseCase, cfg.Log)
	positionController := companyHttp.NewPositionController(positionUseCase, cfg.Log)
	// module user
	userController := userHttp.NewUserController(userUseCase, cfg.Log)
	// module employee
	employeeController := employeeHttp.NewEmployeeController(employeeUseCase, cfg.Log)
	employeeContractController := employeeHttp.NewEmployeeContractController(employeeContractUseCase, cfg.Log)
	employeeDocsController := employeeHttp.NewEmployeeDocumentController(employeeDocsUseCase, cfg.Log)
	// module salary
	salaryHandler := httpSalary.NewSalaryController(cfg.Log)

	// ====== MIDDLEWARE =======
	authMiddleware, protected := middleware.NewProtected(authUseCase)

	// ====== ROUTER REGISTER =======
	// module auth
	authController.RegisterRoutes(api)
	// module company
	divisionController.RegisterRoutes(api, protected)
	positionController.RegisterRoutes(api, protected)
	// module user
	userController.RegisterRoutes(api, authMiddleware, protected)
	// module employee
	employeeController.RegisterRoutes(api, protected)
	employeeContractController.RegisterRoutes(api, protected)
	employeeDocsController.RegisterRoutes(api, protected)
	// module salary
	salaryHandler.RegisterRoutes(api, protected)
}
