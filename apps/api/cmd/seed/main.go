package main

import (
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

const (
	dbHost     = "localhost"
	dbPort     = 5432
	dbUser     = "postgres"
	dbPassword = "postgres"
	dbName     = "hr_saas"
	dbSSL      = "disable"
	dbTZ       = "Asia/Jakarta"
)

type Company struct {
	ID, Name             string
	CreatedAt, UpdatedAt int64
}

func (Company) TableName() string { return "companies" }

type Division struct {
	ID, CompanyID, Name  string
	CreatedAt, UpdatedAt int64
}

func (Division) TableName() string { return "divisions" }

type Position struct {
	ID, CompanyID, Name  string
	ParentID             *string
	IsApprover           bool
	CreatedAt, UpdatedAt int64
}

func (Position) TableName() string { return "positions" }

type Role struct {
	ID, Name             string
	CreatedAt, UpdatedAt int64
}

func (Role) TableName() string { return "roles" }

type Permission struct {
	ID, Name             string
	CreatedAt, UpdatedAt int64
}

func (Permission) TableName() string { return "permissions" }

type RolePermission struct{ RoleID, PermissionID string }

func (RolePermission) TableName() string { return "role_permissions" }

type User struct {
	ID, Name, Email, Password, CompanyID string
	EmailVerified                        bool
	CreatedAt, UpdatedAt                 int64
}

func (User) TableName() string { return "users" }

type UserRole struct{ UserID, RoleID string }

func (UserRole) TableName() string { return "user_roles" }

type Employee struct {
	ID, CompanyID, UserID, EmployeeNumber, Fullname, Gender, BirthPlace, BloodType, MaritalStatus, Religion, Phone, Timezone string
	BirthDate, CreatedAt, UpdatedAt                                                                                          int64
}

func (Employee) TableName() string { return "employees" }

type EmployeeContract struct {
	ID, EmployeeID, ContractType, DivisionID, PositionID string
	StartDate                                            int64
	EndDate                                              *int64
	Salary                                               float64
	IsActive                                             bool
}

func (EmployeeContract) TableName() string { return "employee_contracts" }

type employeeSeed struct {
	Name, Email, Number, Gender, Position, Division string
	Salary                                          float64
}

var employees = []employeeSeed{
	{"Budi Santoso", "direktur.utama@company.com", "EMP-001", "Laki-laki", "Direktur Utama", "Operasional", 25000000},
	{"Siti Rahayu", "direktur.operasional@company.com", "EMP-002", "Perempuan", "Direktur Operasional", "Operasional", 20000000},
	{"Andi Wijaya", "kadiv.operasional@company.com", "EMP-003", "Laki-laki", "Kadiv Operasional", "Operasional", 15000000},
	{"Dewi Kusuma", "kabag.operasional@company.com", "EMP-004", "Perempuan", "Kabag Operasional", "Operasional", 10000000},
	{"Reza Firmansyah", "staff.operasional@company.com", "EMP-005", "Laki-laki", "Staff Operasional", "Operasional", 6000000},
	{"Hendra Saputra", "kadiv.bisnis@company.com", "EMP-006", "Laki-laki", "Kadiv Bisnis", "Bisnis", 15000000},
	{"Ratna Sari", "kabag.bisnis@company.com", "EMP-007", "Perempuan", "Kabag Bisnis", "Bisnis", 10000000},
	{"Fajar Nugroho", "staff.bisnis@company.com", "EMP-008", "Laki-laki", "Staff Bisnis", "Bisnis", 6000000},
}

func id() string           { return uuid.NewString() }
func now() int64           { return time.Now().UnixMilli() }
func ptr(v string) *string { return &v }
func mustCreate(db *gorm.DB, value any) {
	if err := db.Create(value).Error; err != nil {
		log.Fatalf("seed insert error: %v", err)
	}
}
func password(value string) string {
	result, err := bcrypt.GenerateFromPassword([]byte(value), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}
	return string(result)
}

func main() {
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s TimeZone=%s", dbHost, dbPort, dbUser, dbPassword, dbName, dbSSL, dbTZ)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("DB connect error: %v", err)
	}

	company := findOrCreateCompany(db)
	divisionIDs := map[string]string{}
	for _, name := range []string{"Operasional", "Bisnis"} {
		var division Division
		if db.Where("name = ? AND company_id = ?", name, company.ID).First(&division).Error != nil {
			division = Division{ID: id(), CompanyID: company.ID, Name: name, CreatedAt: now(), UpdatedAt: now()}
			mustCreate(db, &division)
			fmt.Println("Created division:", name)
		}
		divisionIDs[name] = division.ID
	}

	type positionSeed struct {
		Name, Parent string
		Approver     bool
	}
	positions := []positionSeed{{"Direktur Utama", "", true}, {"Direktur Operasional", "Direktur Utama", true}, {"Kadiv Operasional", "Direktur Operasional", true}, {"Kabag Operasional", "Kadiv Operasional", false}, {"Staff Operasional", "Kabag Operasional", false}, {"Kadiv Bisnis", "Direktur Utama", true}, {"Kabag Bisnis", "Kadiv Bisnis", false}, {"Staff Bisnis", "Kabag Bisnis", false}}
	positionIDs := map[string]string{}
	for _, seed := range positions {
		var position Position
		if db.Where("name = ? AND company_id = ?", seed.Name, company.ID).First(&position).Error != nil {
			var parentID *string
			if seed.Parent != "" {
				parentID = ptr(positionIDs[seed.Parent])
			}
			position = Position{ID: id(), CompanyID: company.ID, Name: seed.Name, ParentID: parentID, IsApprover: seed.Approver, CreatedAt: now(), UpdatedAt: now()}
			mustCreate(db, &position)
			fmt.Println("Created position:", seed.Name)
		}
		positionIDs[seed.Name] = position.ID
	}

	adminRole := findOrCreateRole(db, "ADMIN")
	staffRole := findOrCreateRole(db, "STAFF")
	permissionNames := []string{"USERS", "EMPLOYEES", "EMPLOYEE_CONTRACTS", "DIVISIONS", "SANCTIONS", "EMPLOYEE_SANCTIONS", "POSITIONS", "OFFICE_LOCATIONS", "SHIFTS", "TIME_OFF_REQUESTS", "TIME_OFF_TYPES", "TIME_OFF_BALANCES", "PERMISSIONS", "ROLES", "EMPLOYEE_DOCUMENTS", "VISITS", "HOLIDAYS", "EMPLOYEE_EDUCATIONS", "EMPLOYEE_TRAININGS", "EMPLOYEE_IDENTITIES", "ATTENDANCES", "REMIDIAL_VISITS", "ANNOUNCEMENTS", "SALARY_COMPONENTS", "EMPLOYEE_SALARIES", "EMPLOYEE_ALLOWANCES", "EMPLOYEE_DEDUCTIONS", "PAYROLLS", "PAYROLL_ADJUSTMENTS", "PAYROLL_PAYMENTS", "PAYROLL_APPROVALS", "NOTIFICATIONS", "NOTIFICATION_TEMPLATES", "NOTIFICATION_PREFERENCES"}
	for _, name := range permissionNames {
		var permission Permission
		if db.Where("name = ?", name).First(&permission).Error != nil {
			permission = Permission{ID: id(), Name: name, CreatedAt: now(), UpdatedAt: now()}
			mustCreate(db, &permission)
		}
		var relation RolePermission
		if db.Where("role_id = ? AND permission_id = ?", adminRole.ID, permission.ID).First(&relation).Error != nil {
			mustCreate(db, &RolePermission{RoleID: adminRole.ID, PermissionID: permission.ID})
		}
	}

	defaultPassword := password("Password123!")
	var adminUser User
	if db.Where("email = ?", "admin@company.com").First(&adminUser).Error != nil {
		adminUser = User{ID: id(), Name: "Admin", Email: "admin@company.com", Password: defaultPassword, EmailVerified: true, CompanyID: company.ID, CreatedAt: now(), UpdatedAt: now()}
		mustCreate(db, &adminUser)
	}
	var adminUserRole UserRole
	if db.Where("user_id = ? AND role_id = ?", adminUser.ID, adminRole.ID).First(&adminUserRole).Error != nil {
		mustCreate(db, &UserRole{UserID: adminUser.ID, RoleID: adminRole.ID})
	}

	birthDate := time.Date(1990, 1, 1, 0, 0, 0, 0, time.UTC).UnixMilli()
	contractStart := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC).UnixMilli()
	for index, seed := range employees {
		var user User
		if db.Where("email = ?", seed.Email).First(&user).Error != nil {
			user = User{ID: id(), Name: seed.Name, Email: seed.Email, Password: defaultPassword, EmailVerified: true, CompanyID: company.ID, CreatedAt: now(), UpdatedAt: now()}
			mustCreate(db, &user)
		}
		var userRole UserRole
		if db.Where("user_id = ? AND role_id = ?", user.ID, staffRole.ID).First(&userRole).Error != nil {
			mustCreate(db, &UserRole{UserID: user.ID, RoleID: staffRole.ID})
		}
		var employee Employee
		if db.Where("user_id = ?", user.ID).First(&employee).Error != nil {
			employee = Employee{ID: id(), CompanyID: company.ID, UserID: user.ID, EmployeeNumber: seed.Number, Fullname: seed.Name, Gender: seed.Gender, BirthPlace: "Jakarta", BirthDate: birthDate, BloodType: "O", MaritalStatus: "single", Religion: "Islam", Phone: fmt.Sprintf("08100000000%d", index+1), Timezone: dbTZ, CreatedAt: now(), UpdatedAt: now()}
			mustCreate(db, &employee)
		}
		var contract EmployeeContract
		if db.Where("employee_id = ? AND position_id = ?", employee.ID, positionIDs[seed.Position]).First(&contract).Error != nil {
			mustCreate(db, &EmployeeContract{ID: id(), EmployeeID: employee.ID, ContractType: "PKWTT", StartDate: contractStart, DivisionID: divisionIDs[seed.Division], PositionID: positionIDs[seed.Position], Salary: seed.Salary, IsActive: true})
		}
	}

	fmt.Println("Seeding selesai!")
	fmt.Println("Default password semua karyawan: Password123!")
}

func findOrCreateCompany(db *gorm.DB) Company {
	var company Company
	if db.Where("name = ?", "PT Contoh Perusahaan").First(&company).Error != nil {
		company = Company{ID: id(), Name: "PT Contoh Perusahaan", CreatedAt: now(), UpdatedAt: now()}
		mustCreate(db, &company)
		fmt.Println("Created company:", company.Name)
	}
	return company
}

func findOrCreateRole(db *gorm.DB, name string) Role {
	var role Role
	if db.Where("name = ?", name).First(&role).Error != nil {
		role = Role{ID: id(), Name: name, CreatedAt: now(), UpdatedAt: now()}
		mustCreate(db, &role)
		fmt.Println("Created role:", name)
	}
	return role
}
