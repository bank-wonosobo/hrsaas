package bootstrap

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"gorm.io/gorm"

	authHttp "hrsaas/internal/modules/auth/delivery/http/client"
	authRepo "hrsaas/internal/modules/auth/repository"
	authUc "hrsaas/internal/modules/auth/usecase"
	"hrsaas/pkg/middleware"
	"hrsaas/pkg/pushnotification"
	pkg "hrsaas/pkg/s3"

	announcementHttp "hrsaas/internal/modules/announcement/delivery/http/client"
	announcementRepo "hrsaas/internal/modules/announcement/repository"
	announcementUc "hrsaas/internal/modules/announcement/usecase"

	attendanceHttp "hrsaas/internal/modules/attendance/delivery/http/client"
	attendanceRepo "hrsaas/internal/modules/attendance/repository"
	attendanceUc "hrsaas/internal/modules/attendance/usecase"

	companyRepo "hrsaas/internal/modules/company/repository"
	"hrsaas/internal/modules/upload"

	employeeHttp "hrsaas/internal/modules/employee/delivery/http/client"
	employeeRepo "hrsaas/internal/modules/employee/repository"
	employeeUc "hrsaas/internal/modules/employee/usecase"

	deviceHttp "hrsaas/internal/modules/device/delivery/http/client"
	deviceRepo "hrsaas/internal/modules/device/repository"
	deviceUc "hrsaas/internal/modules/device/usecase"

	timeOffHttp "hrsaas/internal/modules/time_off/delivery/http/client"
	timeOffRepo "hrsaas/internal/modules/time_off/repository"
	timeOffUc "hrsaas/internal/modules/time_off/usecase"

	userHttp "hrsaas/internal/modules/user/delivery/http/client"
	userRepo "hrsaas/internal/modules/user/repository"
	userUc "hrsaas/internal/modules/user/usecase"

	visitHttp "hrsaas/internal/modules/visit/delivery/http/client"
	visitRepo "hrsaas/internal/modules/visit/repository"
	visitUc "hrsaas/internal/modules/visit/usecase"

	payrollHttp "hrsaas/internal/modules/payroll/delivery/http/client"
	payrollRepo "hrsaas/internal/modules/payroll/repository"
	payrollUc "hrsaas/internal/modules/payroll/usecase"

	uploadHttp "hrsaas/internal/modules/upload/delivery/http"
)

type ClientBootstrapConfig struct {
	App       *fiber.App
	DB        *gorm.DB
	Log       *logrus.Logger
	Validator *validator.Validate
	Config    *viper.Viper
	S3Client  *pkg.S3Client
}

func BootstrapClient(cfg *ClientBootstrapConfig) {
	api := cfg.App.Group("/api")
	uploadUseCase := upload.NewUploadUseCase(
		cfg.Log,
		cfg.Validator,
		cfg.S3Client,
		cfg.Config,
	)

	// ====== REPO =======

	// module Auth
	userRepository := userRepo.NewUserRepository(cfg.Log)
	sessionRepo := authRepo.NewSessionRepository(cfg.Log)

	// module Announcement
	announcementRepository := announcementRepo.NewAnnouncementRepository(cfg.Log)

	// module attendance
	attendanceRepository := attendanceRepo.NewAttendanceRepository(cfg.Log)
	attendanceLogRepository := attendanceRepo.NewAttendanceLogRepository(cfg.Log)
	shiftRepository := attendanceRepo.NewShiftRepository(cfg.Log)
	shiftDayRepository := attendanceRepo.NewShiftDayRepository(cfg.Log)
	officeLocRepository := attendanceRepo.NewOfficeLocationRepository(cfg.Log)

	// module company
	companyRepository := companyRepo.NewCompanyRepository(cfg.Log)
	divisionRepository := companyRepo.NewDivisionRepository(cfg.Log)
	positionRepository := companyRepo.NewPositionRepository(cfg.Log)

	// module employee
	employeeRepository := employeeRepo.NewEmployeeRepository(cfg.Log)
	employeeContractRepository := employeeRepo.NewEmployeeContractRepository(cfg.Log)
	employeeDocsRepository := employeeRepo.NewEmployeeDocumentRepository(cfg.Log)
	employeeEducationRepository := employeeRepo.NewEmployeeEducationRepository(cfg.Log)
	employeeTrainingRepository := employeeRepo.NewEmployeeTrainingRepository(cfg.Log)
	employeeSalaryRepository := employeeRepo.NewEmployeeSalaryRepository(cfg.Log)
	employeeAllowanceRepository := employeeRepo.NewEmployeeAllowanceRepository(cfg.Log)
	employeeDeductionRepository := employeeRepo.NewEmployeeDeductionRepository(cfg.Log)
	sanctionRepository := employeeRepo.NewSanctionRepository(cfg.Log)
	employeeSancRepository := employeeRepo.NewEmSancRepository(cfg.Log)

	// module time off
	timeOffApprovalRepository := timeOffRepo.NewTimeOffApprovalRepository(cfg.Log)
	timeOffBalanceRepository := timeOffRepo.NewTimeOffBalanceRepository(cfg.Log)
	timeOffRequestRepository := timeOffRepo.NewTimeOffRequestRepository(cfg.Log)
	timeOffTypeRepository := timeOffRepo.NewTimeOffTypeRepository(cfg.Log)

	// module user
	roleRepoitory := userRepo.NewRoleRepository(cfg.Log)

	// module device
	deviceRepository := deviceRepo.NewDeviceRepository(cfg.Log)

	// module visit
	visitRepository := visitRepo.NewVisitRepository(cfg.Log)
	collectingRepository := visitRepo.NewCollectingRepository(
		cfg.Log,
		cfg.Config.GetString("nasabah.base_url"),
	)

	// module payroll
	payrollRepository := payrollRepo.NewPayrollRepository(cfg.Log)
	payrollDetailRepository := payrollRepo.NewPayrollDetailRepository(cfg.Log)
	payrollItemRepository := payrollRepo.NewPayrollItemRepository(cfg.Log)
	payrollAdjustmentRepository := payrollRepo.NewPayrollAdjustmentRepository(cfg.Log)
	payrollPaymentRepository := payrollRepo.NewPayrollPaymentRepository(cfg.Log)
	payrollApprovalRepository := payrollRepo.NewPayrollApprovalRepository(cfg.Log)

	// ====== USECASE =======
	// module auth
	authUseCase := authUc.NewAuthUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		userRepository,
		sessionRepo,
		companyRepository,
		roleRepoitory,
	)

	// module announcement
	announcementUseCase := announcementUc.NewAnnouncementUsecase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		announcementRepository,
		employeeRepository,
		cfg.S3Client,
		deviceRepository,
		pushnotification.NewExpoClient(cfg.Config),
	)

	// module attendance
	attendanceUseCase := attendanceUc.NewAttendanceUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		attendanceRepository,
		officeLocRepository,
		shiftRepository,
		shiftDayRepository,
		attendanceLogRepository,
		employeeRepository,
		userRepository,
		uploadUseCase,
		cfg.Config.GetString("face.base_url"),
	)
	shiftUseCase := attendanceUc.NewShiftUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		shiftRepository,
		shiftDayRepository,
	)
	officeLocationUseCase := attendanceUc.NewOfficeLocationUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		officeLocRepository,
	)

	// module employee
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
	employeeContractUseCase := employeeUc.NewEmployeeContractUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		employeeContractRepository,
	)
	employeeDocsUseCase := employeeUc.NewEmployeeDocumentUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		employeeDocsRepository,
	)
	employeeEducationUseCase := employeeUc.NewEmployeeEducationUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		employeeEducationRepository,
	)
	employeeTrainingUseCase := employeeUc.NewEmployeeTrainingUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		employeeTrainingRepository,
	)
	empSancUseCase := employeeUc.NewEmSancUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		employeeSancRepository,
		sanctionRepository,
		employeeRepository,
		cfg.S3Client,
	)

	// module time off
	timeOffApprovalUseCase := timeOffUc.NewTimeOffApprovalUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		timeOffRequestRepository,
		timeOffTypeRepository,
		timeOffBalanceRepository,
	)
	timeOffBalanceUseCase := timeOffUc.NewTimeOffBalanceUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		timeOffBalanceRepository,
		timeOffTypeRepository,
	)
	timeOffRequestUseCase := timeOffUc.NewTimeOffRequestUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		timeOffRequestRepository,
		timeOffTypeRepository,
		timeOffBalanceRepository,
		timeOffApprovalRepository,
		employeeContractRepository,
		deviceRepository,
		pushnotification.NewExpoClient(cfg.Config),
	)

	timeOffTypeUseCase := timeOffUc.NewTimeOffTypeUseCase(
		cfg.DB, cfg.Log, cfg.Validator, timeOffTypeRepository,
	)

	payrollUseCase := payrollUc.NewPayrollUseCase(
		cfg.DB, cfg.Log, cfg.Validator,
		payrollRepository, payrollDetailRepository, payrollItemRepository,
		payrollAdjustmentRepository, payrollPaymentRepository, payrollApprovalRepository,
		employeeRepository, employeeSalaryRepository, employeeAllowanceRepository,
		employeeDeductionRepository,
	)

	// module user
	userUseCase := userUc.NewUserUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		userRepository,
		roleRepoitory,
	)
	deviceUseCase := deviceUc.NewDeviceUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		deviceRepository,
	)

	// module visit
	visitUseCase := visitUc.NewVisitUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		visitRepository,
		cfg.S3Client,
	)
	collectingUseCase := visitUc.NewCollectingUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		collectingRepository,
		employeeRepository,
		cfg.S3Client,
	)

	// ====== CONTROLLER =======

	// module auth
	authController := authHttp.NewAuthController(authUseCase, cfg.Log, cfg.Config)

	// module announcement
	announcementController := announcementHttp.NewAnnouncementController(
		announcementUseCase,
		cfg.Log,
	)

	// module attendance
	attendanceController := attendanceHttp.NewAttendanceController(attendanceUseCase, cfg.Log)
	shiftController := attendanceHttp.NewShiftController(shiftUseCase, cfg.Log)
	officeLocController := attendanceHttp.NewOfficeLocationController(
		officeLocationUseCase,
		cfg.Log,
	)

	// module employee
	employeeController := employeeHttp.NewEmployeeController(employeeUseCase, cfg.Log)
	employeeContractController := employeeHttp.NewEmployeeContractController(
		employeeContractUseCase,
		cfg.Log,
	)
	employeeDocsController := employeeHttp.NewEmployeeDocumentController(
		employeeDocsUseCase,
		cfg.Log,
	)
	employeeEducationController := employeeHttp.NewEmployeeEducationController(
		employeeEducationUseCase,
		cfg.Log,
	)
	employeeTrainingController := employeeHttp.NewEmployeeTrainingController(
		employeeTrainingUseCase,
		cfg.Log,
	)
	empSancController := employeeHttp.NewEmSancController(empSancUseCase, cfg.Log)

	// module time off
	timeOffApprovalController := timeOffHttp.NewTimeOffApprovalController(
		timeOffApprovalUseCase,
		cfg.Log,
	)
	timeOffBalanceController := timeOffHttp.NewTimeOffBalanceController(
		timeOffBalanceUseCase,
		cfg.Log,
	)
	timeOffRequestController := timeOffHttp.NewTimeOffRequestController(
		timeOffRequestUseCase,
		cfg.Log,
	)
	timeOffTypeController := timeOffHttp.NewTimeOffTypeController(
		timeOffTypeUseCase, cfg.Log,
	)

	// module user
	userController := userHttp.NewUserController(userUseCase, cfg.Log)
	deviceController := deviceHttp.NewDeviceController(deviceUseCase, cfg.Log)

	// module visit
	visitController := visitHttp.NewVisitController(visitUseCase, cfg.Log)
	collectingController := visitHttp.NewCollectingController(collectingUseCase, cfg.Log)
	salaryController := payrollHttp.NewSalaryController(payrollUseCase, cfg.Log)

	// module upload
	uploadController := uploadHttp.NewUploadController(uploadUseCase, cfg.Log)

	// ====== MIDDLEWARE =======
	authMiddleware, client := middleware.NewClient(authUseCase, employeeUseCase)

	// ====== ROUTER REGISTER =======

	// module auth
	authController.RegisterRoutes(api)

	// module announcement
	announcementController.RegisterRoutes(api, authMiddleware)

	// module attendance
	attendanceController.RegisterRoutes(api, client)
	shiftController.RegisterRoutes(api, client)
	officeLocController.RegisterRoutes(api, client)

	// module employee
	employeeController.RegisterRoutes(api, client)
	employeeContractController.RegisterRoutes(api, client)
	employeeDocsController.RegisterRoutes(api, client)
	employeeEducationController.RegisterRoutes(api, client)
	employeeTrainingController.RegisterRoutes(api, client)
	empSancController.RegisterRoutes(api, client)

	// module time off
	timeOffApprovalController.RegisterRoutes(api, client)
	timeOffBalanceController.RegisterRoutes(api, client)
	timeOffRequestController.RegisterRoutes(api, client)
	timeOffTypeController.RegisterRoutes(api, client)

	// module user
	userController.RegisterRoutes(api, authMiddleware)
	deviceController.RegisterRoutes(api, authMiddleware)

	// module visit
	visitController.RegisterRoutes(api, client)
	collectingController.RegisterRoutes(api, client)
	salaryController.RegisterRoutes(api, client)

	// module upload
	uploadController.RegisterRoutes(api, authMiddleware)
}
