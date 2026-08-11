package bootstrap

import (
	authHttp "hrsaas-admin-api/internal/modules/auth/delivery/http"
	authRepo "hrsaas-admin-api/internal/modules/auth/repository"
	authUc "hrsaas-admin-api/internal/modules/auth/usecase"
	"hrsaas-admin-api/pkg/middleware"
	pkg "hrsaas-admin-api/pkg/s3"

	companyHttp "hrsaas-admin-api/internal/modules/company/delivery/http"
	companyRepo "hrsaas-admin-api/internal/modules/company/repository"
	compantUc "hrsaas-admin-api/internal/modules/company/usecase"

	employeeHttp "hrsaas-admin-api/internal/modules/employee/delivery/http"
	employeeRepo "hrsaas-admin-api/internal/modules/employee/repository"
	employeeUc "hrsaas-admin-api/internal/modules/employee/usecase"

	payrollHttp "hrsaas-admin-api/internal/modules/payroll/delivery/http"
	payrollRepo "hrsaas-admin-api/internal/modules/payroll/repository"
	payrollUc "hrsaas-admin-api/internal/modules/payroll/usecase"

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
	S3Client  *pkg.S3Client
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
	employeeSalaryRepository := employeeRepo.NewEmployeeSalaryRepository(cfg.Log)
	employeeAllowanceRepository := employeeRepo.NewEmployeeAllowanceRepository(cfg.Log)
	employeeDeductionRepository := employeeRepo.NewEmployeeDeductionRepository(cfg.Log)
	// module payroll
	salaryComponentRepository := payrollRepo.NewSalaryComponentRepository(cfg.Log)
	payrollRepository := payrollRepo.NewPayrollRepository(cfg.Log)
	payrollDetailRepository := payrollRepo.NewPayrollDetailRepository(cfg.Log)
	payrollItemRepository := payrollRepo.NewPayrollItemRepository(cfg.Log)
	payrollAdjustmentRepository := payrollRepo.NewPayrollAdjustmentRepository(cfg.Log)
	payrollPaymentRepository := payrollRepo.NewPayrollPaymentRepository(cfg.Log)
	payrollApprovalRepository := payrollRepo.NewPayrollApprovalRepository(cfg.Log)

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
	employeeSalaryUseCase := employeeUc.NewEmployeeSalaryUseCase(cfg.DB, cfg.Log, cfg.Validator, employeeSalaryRepository)
	employeeAllowanceUseCase := employeeUc.NewEmployeeAllowanceUseCase(cfg.DB, cfg.Log, cfg.Validator, employeeAllowanceRepository, salaryComponentRepository)
	employeeDeductionUseCase := employeeUc.NewEmployeeDeductionUseCase(cfg.DB, cfg.Log, cfg.Validator, employeeDeductionRepository, salaryComponentRepository)
	// module payroll
	salaryComponentUseCase := payrollUc.NewSalaryComponentUseCase(cfg.DB, cfg.Log, cfg.Validator, salaryComponentRepository)
	payrollUseCase := payrollUc.NewPayrollUseCase(
		cfg.DB, cfg.Log, cfg.Validator,
		payrollRepository, payrollDetailRepository, payrollItemRepository,
		payrollAdjustmentRepository, payrollPaymentRepository, payrollApprovalRepository,
		employeeRepository, employeeSalaryRepository, employeeAllowanceRepository, employeeDeductionRepository,
	)
	payrollPaymentUseCase := payrollUc.NewPayrollPaymentUseCase(cfg.DB, cfg.Log, cfg.Validator, payrollPaymentRepository)

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
	employeeSalaryController := employeeHttp.NewEmployeeSalaryController(employeeSalaryUseCase, cfg.Log)
	employeeAllowanceController := employeeHttp.NewEmployeeAllowanceController(employeeAllowanceUseCase, cfg.Log)
	employeeDeductionController := employeeHttp.NewEmployeeDeductionController(employeeDeductionUseCase, cfg.Log)
	// module payroll
	salaryController := payrollHttp.NewSalaryController(salaryComponentUseCase, cfg.Log)
	payrollController := payrollHttp.NewPayrollController(payrollUseCase, cfg.Log)
	payrollPaymentController := payrollHttp.NewPayrollPaymentController(payrollPaymentUseCase, cfg.Log)

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
	employeeSalaryController.RegisterRoutes(api, protected)
	employeeAllowanceController.RegisterRoutes(api, protected)
	employeeDeductionController.RegisterRoutes(api, protected)
	// module payroll
	salaryController.RegisterRoutes(api, protected)
	payrollController.RegisterRoutes(api, protected)
	payrollPaymentController.RegisterRoutes(api, protected)
}
