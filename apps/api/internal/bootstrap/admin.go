package bootstrap

import (
	authHttp "hrsaas/internal/modules/auth/delivery/http/admin"
	authRepo "hrsaas/internal/modules/auth/repository"
	authUc "hrsaas/internal/modules/auth/usecase"
	"hrsaas/internal/modules/upload"
	"hrsaas/pkg/middleware"
	"hrsaas/pkg/pushnotification"
	pkg "hrsaas/pkg/s3"

	announcementHttp "hrsaas/internal/modules/announcement/delivery/http/admin"
	announcementRepo "hrsaas/internal/modules/announcement/repository"
	announcementUc "hrsaas/internal/modules/announcement/usecase"

	attendanceHttp "hrsaas/internal/modules/attendance/delivery/http/admin"
	attendanceRepo "hrsaas/internal/modules/attendance/repository"
	attendanceUc "hrsaas/internal/modules/attendance/usecase"

	companyHttp "hrsaas/internal/modules/company/delivery/http/admin"
	companyRepo "hrsaas/internal/modules/company/repository"
	compantUc "hrsaas/internal/modules/company/usecase"

	collectingHttp "hrsaas/internal/modules/visit/delivery/http/admin"
	collectingRepo "hrsaas/internal/modules/visit/repository"
	collectingUc "hrsaas/internal/modules/visit/usecase"

	employeeHttp "hrsaas/internal/modules/employee/delivery/http/admin"
	employeeRepo "hrsaas/internal/modules/employee/repository"
	employeeUc "hrsaas/internal/modules/employee/usecase"

	payrollHttp "hrsaas/internal/modules/payroll/delivery/http/admin"
	payrollRepo "hrsaas/internal/modules/payroll/repository"
	payrollUc "hrsaas/internal/modules/payroll/usecase"

	permissionHttp "hrsaas/internal/modules/user/delivery/http/admin"
	permissionRepo "hrsaas/internal/modules/user/repository"
	permissionUc "hrsaas/internal/modules/user/usecase"

	roleHttp "hrsaas/internal/modules/user/delivery/http/admin"
	roleRepo "hrsaas/internal/modules/user/repository"
	roleUc "hrsaas/internal/modules/user/usecase"

	userHttp "hrsaas/internal/modules/user/delivery/http/admin"
	userRepo "hrsaas/internal/modules/user/repository"
	userUc "hrsaas/internal/modules/user/usecase"

	timeOffHttp "hrsaas/internal/modules/time_off/delivery/http/admin"
	timeOffRepo "hrsaas/internal/modules/time_off/repository"
	timeOffUc "hrsaas/internal/modules/time_off/usecase"

	visitHttp "hrsaas/internal/modules/visit/delivery/http/admin"
	visitRepo "hrsaas/internal/modules/visit/repository"
	visitUc "hrsaas/internal/modules/visit/usecase"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"gorm.io/gorm"
)

type AdminBootstrapConfig struct {
	App       *fiber.App
	DB        *gorm.DB
	Log       *logrus.Logger
	Validator *validator.Validate
	Config    *viper.Viper
	S3Client  *pkg.S3Client
	Upload    *upload.UploadUseCase
	PushNotif *pushnotification.ExpoClient
}

func BootstrapAdmin(cfg *AdminBootstrapConfig) {
	api := cfg.App.Group("/api")

	// ====== REPO =======
	// module auth
	userRepository := userRepo.NewUserRepository(cfg.Log)
	sessionRepo := authRepo.NewSessionRepository(cfg.Log)

	// module announcement
	announcementRepository := announcementRepo.NewAnnouncementRepository(cfg.Log)

	// module attendance
	attendanceRepository := attendanceRepo.NewAttendanceRepository(cfg.Log)
	attendanceLogRepository := attendanceRepo.NewAttendanceLogRepository(cfg.Log)
	shiftRepository := attendanceRepo.NewShiftRepository(cfg.Log)
	shiftDayRepository := attendanceRepo.NewShiftDayRepository(cfg.Log)
	holidayRepository := attendanceRepo.NewHolidayRepository(cfg.Log)
	officeLocRepository := attendanceRepo.NewOfficeLocationRepository(cfg.Log)

	// module company
	companyRepository := companyRepo.NewCompanyRepository(cfg.Log)
	divisionRepository := companyRepo.NewDivisionRepository(cfg.Log)
	positionRepository := companyRepo.NewPositionRepository(cfg.Log)

	// module user
	roleRepoitory := roleRepo.NewRoleRepository(cfg.Log)
	permissionRepository := permissionRepo.NewPermissionRepository(cfg.Log)

	// module employee
	employeeRepository := employeeRepo.NewEmployeeRepository(cfg.Log)
	employeeContractRepository := employeeRepo.NewEmployeeContractRepository(cfg.Log)
	employeeDocsRepository := employeeRepo.NewEmployeeDocumentRepository(cfg.Log)
	employeeEducationRepository := employeeRepo.NewEmployeeEducationRepository(cfg.Log)
	sanctionRepository := employeeRepo.NewSanctionRepository(cfg.Log)
	employeeSancRepository := employeeRepo.NewEmSancRepository(cfg.Log)
	emoloyeeTrainRepository := employeeRepo.NewEmployeeTrainingRepository(cfg.Log)

	// module time_off
	timeOffApprovalRepository := timeOffRepo.NewTimeOffApprovalRepository(cfg.Log)
	timeOffBalanceRepository := timeOffRepo.NewTimeOffBalanceRepository(cfg.Log)
	timeOffRequestRepository := timeOffRepo.NewTimeOffRequestRepository(cfg.Log)
	timeOffTypeRepository := timeOffRepo.NewTimeOffTypeRepository(cfg.Log)

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
	//module visit
	visitRepository := visitRepo.NewVisitRepository(cfg.Log)
	collectingRepository := collectingRepo.NewCollectingRepository(
		cfg.Log,
		cfg.Config.GetString("nasabah.base_url"),
	)

	// module salary

	// ====== USE CASE =======

	// modul announcement
	announcementUseCase := announcementUc.NewAnnouncementUsecase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		announcementRepository,
		employeeRepository,
	)

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
		cfg.Upload,
		cfg.Config.GetString("face.base_url"),
	)
	shiftUseCase := attendanceUc.NewShiftUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		shiftRepository,
		shiftDayRepository,
	)
	holidayUseCase := attendanceUc.NewHolidayUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		holidayRepository,
	)
	officeLocationUseCase := attendanceUc.NewOfficeLocationUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		officeLocRepository,
	)

	// module company
	divisionUseCase := compantUc.NewDivisionUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		divisionRepository,
	)
	positionUseCase := compantUc.NewPositionUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		positionRepository,
	)

	// module user
	permissionUseCase := permissionUc.NewPermissionUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		permissionRepository,
	)
	roleUseCase := roleUc.NewRoleUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		roleRepoitory,
		permissionRepository,
	)
	userUseCase := userUc.NewUserUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		userRepository,
		roleRepoitory,
	)

	// module employee
	employeeContractUseCase := employeeUc.NewEmployeeContractUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		employeeContractRepository,
	)
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
	employeeDocsUseCase := employeeUc.NewEmployeeDocumentUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		employeeDocsRepository,
	)
	employeeEducationUseCase := employeeUc.NewEmployeeEducationUseCase(
		cfg.DB, cfg.Log, cfg.Validator, employeeEducationRepository,
	)
	employeeSalaryUseCase := employeeUc.NewEmployeeSalaryUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		employeeSalaryRepository,
	)
	employeeAllowanceUseCase := employeeUc.NewEmployeeAllowanceUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		employeeAllowanceRepository,
		salaryComponentRepository,
	)
	employeeDeductionUseCase := employeeUc.NewEmployeeDeductionUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		employeeDeductionRepository,
		salaryComponentRepository,
	)
	sanctionUseCase := employeeUc.NewSantionUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		sanctionRepository,
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

	employeeTrainUseCase := employeeUc.NewEmployeeTrainingUseCase(
		cfg.DB, cfg.Log, cfg.Validator, emoloyeeTrainRepository,
	)
	// module time off
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
	)
	timeOffTypeUseCase := timeOffUc.NewTimeOffTypeUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		timeOffTypeRepository,
	)
	// module payroll
	salaryComponentUseCase := payrollUc.NewSalaryComponentUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		salaryComponentRepository,
	)
	payrollUseCase := payrollUc.NewPayrollUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		payrollRepository,
		payrollDetailRepository,
		payrollItemRepository,
		payrollAdjustmentRepository,
		payrollPaymentRepository,
		payrollApprovalRepository,
		employeeRepository,
		employeeSalaryRepository,
		employeeAllowanceRepository,
		employeeDeductionRepository,
	)
	payrollPaymentUseCase := payrollUc.NewPayrollPaymentUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		payrollPaymentRepository,
	)
	// module visit
	visitUseCase := visitUc.NewVisitUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		visitRepository,
		cfg.S3Client,
	)
	collectingUseCase := collectingUc.NewCollectingUseCase(
		cfg.DB,
		cfg.Log,
		cfg.Validator,
		collectingRepository,
		employeeRepository,
		cfg.S3Client,
	)

	// module salary

	// ====== CONTROLLER =======
	// module auth
	authController := authHttp.NewAuthController(authUseCase, cfg.Log, cfg.Config)

	// module announcement
	announcementController := announcementHttp.NewAnnouncementController(
		announcementUseCase,
		cfg.Log,
	)

	// module attendnance
	attendanceController := attendanceHttp.NewAttendanceController(attendanceUseCase, cfg.Log)
	shiftController := attendanceHttp.NewShifController(shiftUseCase, cfg.Log)
	holidayController := attendanceHttp.NewHolidayController(holidayUseCase, cfg.Log)
	officeLocController := attendanceHttp.NewOfficeLocationController(
		officeLocationUseCase,
		cfg.Log,
	)

	// module company
	divisionController := companyHttp.NewDivisionController(divisionUseCase, cfg.Log)
	positionController := companyHttp.NewPositionController(positionUseCase, cfg.Log)

	// module user
	userController := userHttp.NewUserController(userUseCase, cfg.Log)
	permissionController := permissionHttp.NewPermissionController(permissionUseCase, cfg.Log)
	roleController := roleHttp.NewRoleController(roleUseCase, cfg.Log)

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
	employeeSalaryController := employeeHttp.NewEmployeeSalaryController(
		employeeSalaryUseCase,
		cfg.Log,
	)
	employeeAllowanceController := employeeHttp.NewEmployeeAllowanceController(
		employeeAllowanceUseCase,
		cfg.Log,
	)
	employeeDeductionController := employeeHttp.NewEmployeeDeductionController(
		employeeDeductionUseCase,
		cfg.Log,
	)
	sanctionController := employeeHttp.NewSanctionController(sanctionUseCase, cfg.Log)
	empSancController := employeeHttp.NewEmSancController(empSancUseCase, cfg.Log)
	employeeTrainController := employeeHttp.NewEmployeeTrainingController(
		employeeTrainUseCase,
		cfg.Log,
	)
	// module time off
	timeOffBalanceController := timeOffHttp.NewTimeOffBalanceController(
		timeOffBalanceUseCase,
		cfg.Log,
	)
	timeOffRequestController := timeOffHttp.NewTimeOffRequestController(
		timeOffRequestUseCase,
		cfg.Log,
	)
	timeOffTypeController := timeOffHttp.NewTimeOffTypeController(timeOffTypeUseCase, cfg.Log)
	// module payroll
	salaryController := payrollHttp.NewSalaryController(salaryComponentUseCase, cfg.Log)
	payrollController := payrollHttp.NewPayrollController(payrollUseCase, cfg.Log)
	payrollPaymentController := payrollHttp.NewPayrollPaymentController(
		payrollPaymentUseCase,
		cfg.Log,
	)
	// module visit
	visitController := visitHttp.NewVisitController(visitUseCase, cfg.Log)
	collectingController := collectingHttp.NewCollectingController(collectingUseCase, cfg.Log)

	// module salary

	// ====== MIDDLEWARE =======
	authMiddleware, protected := middleware.NewProtected(authUseCase)

	// ====== ROUTER REGISTER =======

	//module announcement
	announcementController.RegisterRoutes(api, protected)

	// module auth
	authController.RegisterRoutes(api)

	// module attendance
	attendanceController.RegisterRoutes(api, protected)
	shiftController.RegisterRoutes(api, protected)
	holidayController.RegisterRoutes(api, protected)
	officeLocController.RegisterRoutes(api, protected)

	// module company
	divisionController.RegisterRoutes(api, protected)
	positionController.RegisterRoutes(api, protected)

	// module user
	userController.RegisterRoutes(api, authMiddleware, protected)
	permissionController.RegisterRoutes(api, protected)
	roleController.RegisterRoutes(api, protected)

	// module employee
	employeeController.RegisterRoutes(api, protected)
	employeeContractController.RegisterRoutes(api, protected)
	employeeDocsController.RegisterRoutes(api, protected)
	employeeEducationController.RegisterRoutes(api, protected)
	sanctionController.RegisterRoutes(api, protected)
	empSancController.RegisterRoutes(api, protected)
	employeeTrainController.RegisterRoutes(api, protected)

	// module time off
	timeOffBalanceController.RegisterRoutes(api, protected)
	timeOffRequestController.RegisterRoutes(api, protected)
	timeOffTypeController.RegisterRoutes(api, protected)

	employeeSalaryController.RegisterRoutes(api, protected)
	employeeAllowanceController.RegisterRoutes(api, protected)
	employeeDeductionController.RegisterRoutes(api, protected)
	// module payroll
	salaryController.RegisterRoutes(api, protected)
	payrollController.RegisterRoutes(api, protected)
	payrollPaymentController.RegisterRoutes(api, protected)
	// module visit
	visitController.RegisterRoutes(api, protected)
	collectingController.RegisterRoutes(api, protected)

	// module salary
}
