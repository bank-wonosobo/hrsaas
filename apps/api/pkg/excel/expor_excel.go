package excel

import (
	"fmt"
<<<<<<< HEAD:apps/admin-api/pkg/excel/expor_excel.go
	"hrsaas-admin-api/internal/modules/attendance/model"
	employeeModel "hrsaas-admin-api/internal/modules/employee/model"
	visitModel "hrsaas-admin-api/internal/modules/visit/model"
	"strings"
=======
	"hrsaas/internal/modules/attendance/model"
	employeeModel "hrsaas/internal/modules/employee/model"
	visitModel "hrsaas/internal/modules/visit/model"
	collectionModel "hrsaas/internal/modules/visit/model"
>>>>>>> edef0240a9dad419f26aa3517d6a2014e4231eef:apps/api/pkg/excel/expor_excel.go
	"time"

	"github.com/xuri/excelize/v2"
)

func ExportAbsensiToExcel(
	sheets []model.AttendanceSheet,
	periodeData string,
) (*excelize.File, error) {
	f := excelize.NewFile()

	// f.SetSheetName("Sheet1", "Hallo")
	for i, sheet := range sheets {
		sheetName := sheet.Name
		if i == 0 {
			f.SetSheetName("Sheet1", sheetName)
		} else {
			f.NewSheet(sheetName)
		}

		headStyle, _ := f.NewStyle(&excelize.Style{
			Font: &excelize.Font{Bold: true, Size: 14, Color: "#000000ff"},
			Fill: excelize.Fill{Type: "pattern", Color: []string{"#cfcfcfff"}, Pattern: 1},
		})
		f.SetCellStyle(sheetName, "A1", "AA", headStyle)

		// Style Judul
		titleStyle, _ := f.NewStyle(&excelize.Style{
			Font:      &excelize.Font{Bold: true, Size: 14, Color: "#1D1D1Dff"},
			Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
			Fill:      excelize.Fill{Type: "pattern", Color: []string{"#d4d4d4ff"}, Pattern: 1},
		})

		// Style Header
		headerStyle, _ := f.NewStyle(&excelize.Style{
			Font:      &excelize.Font{Bold: true, Color: "#FFFFFF"},
			Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
			Fill:      excelize.Fill{Type: "pattern", Color: []string{"#18254F"}, Pattern: 1},
			Border: []excelize.Border{
				{Type: "left", Color: "656565", Style: 1},
				{Type: "right", Color: "656565", Style: 1},
				{Type: "top", Color: "656565", Style: 1},
				{Type: "bottom", Color: "656565", Style: 1},
			},
		})

		// Style Default Isi
		cellStyle, _ := f.NewStyle(&excelize.Style{
			Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
			Border: []excelize.Border{
				{Type: "left", Color: "656565", Style: 1},
				{Type: "right", Color: "656565", Style: 1},
				{Type: "top", Color: "656565", Style: 1},
				{Type: "bottom", Color: "656565", Style: 1},
			},
		})

		// Judul
		f.SetCellValue(sheetName, "B1", "REKAP KEHADIRAN HARIAN")
		f.MergeCell(sheetName, "B1", "H1")
		f.SetCellStyle(sheetName, "A1", "H1", titleStyle)

		// Detail Personalia
		f.SetCellValue(sheetName, "B3", "PT BPR BANK WONOSOBO (PERSERODA)")
		f.MergeCell(sheetName, "B3", "E3")
		// Style Default Isi
		styleTitleBawon, _ := f.NewStyle(&excelize.Style{
			Font:      &excelize.Font{Bold: true, Size: 16, Color: "#ffffffff"},
			Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
			Fill:      excelize.Fill{Type: "pattern", Color: []string{"#18254F"}, Pattern: 1},
		})

		f.SetCellStyle(sheetName, "B3", "D3", styleTitleBawon)

		// Style Default Isi
		styleTitleDetail, _ := f.NewStyle(&excelize.Style{
			Font:      &excelize.Font{Bold: true, Size: 10, Color: "#1D1D1Dff"},
			Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
			Fill:      excelize.Fill{Type: "pattern", Color: []string{"#dfe5f7ff"}, Pattern: 1},
		})

		f.SetCellValue(sheetName, "B4", "Karyawan")
		f.SetCellValue(sheetName, "C4", sheet.Name)
		f.SetCellValue(sheetName, "B5", "Periode")
		f.SetCellValue(sheetName, "C5", periodeData)
		f.SetCellValue(sheetName, "B6", "Total Hadir")
		f.SetCellValue(sheetName, "C6", sheet.Total)
		f.SetCellStyle(sheetName, "B4", "B6", styleTitleDetail)

		// Header Tabel
		headers := []string{
			"No",
			"Tanggal",
			"Status",
			"Jam Masuk",
			"Jam Keluar",
			"Terlambat",
			"Pulang Lebih Awal",
			"Catatan",
		}
		for col, h := range headers {
			cell, _ := excelize.CoordinatesToCellName(col+2, 8)
			f.SetCellValue(sheetName, cell, h)
		}
		f.SetCellStyle(sheetName, "B8", "I8", headerStyle)

		no := 1
		// Data
		for rowIdx, row := range sheet.Data {
			r := rowIdx + 9
			f.SetRowHeight(sheetName, r, 20)

			f.SetCellValue(sheetName, fmt.Sprintf("B%d", r), no)
			f.SetCellValue(
				sheetName,
				fmt.Sprintf("C%d", r),
				formatTimeMilli(row.Date, "2006-01-02"),
			)
			f.SetCellValue(sheetName, fmt.Sprintf("D%d", r), row.Status)
			f.SetCellValue(
				sheetName,
				fmt.Sprintf("E%d", r),
				formatTimeMilli(row.CheckInTime, "15:04:05"),
			)
			f.SetCellValue(
				sheetName,
				fmt.Sprintf("F%d", r),
				formatTimeMilli(row.CheckOutTime, "15:04:05"),
			)
			f.SetCellValue(sheetName, fmt.Sprintf("G%d", r), row.LateCheckIn)
			f.SetCellValue(sheetName, fmt.Sprintf("H%d", r), row.LateCheckOut)
			f.SetCellValue(sheetName, fmt.Sprintf("I%d", r), row.Note)

			f.SetCellStyle(sheetName, fmt.Sprintf("B%d", r), fmt.Sprintf("I%d", r), cellStyle)

			// Warna kuning untuk "Bukan Hari Kerja"
			if row.Status == "Bukan Hari Kerja" {
				style, _ := f.NewStyle(&excelize.Style{
					Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
					Fill: excelize.Fill{
						Type:    "pattern",
						Color:   []string{"#FFFF00"},
						Pattern: 1,
					},
				})
				f.SetCellStyle(sheetName, fmt.Sprintf("D%d", r), fmt.Sprintf("D%d", r), style)
			}

			if row.Status == "Belum Ada Status (TS)" {
				style, _ := f.NewStyle(&excelize.Style{
					Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
					Fill: excelize.Fill{
						Type:    "pattern",
						Color:   []string{"#8a8a8aff"},
						Pattern: 1,
					},
				})
				f.SetCellStyle(sheetName, fmt.Sprintf("D%d", r), fmt.Sprintf("D%d", r), style)
			}
			no++
		}

		// Atur lebar kolom
		f.SetColWidth(sheetName, "A", "A", 5)
		f.SetColWidth(sheetName, "B", "B", 10)
		f.SetColWidth(sheetName, "C", "C", 22)
		f.SetColWidth(sheetName, "D", "D", 30)
		f.SetColWidth(sheetName, "E", "F", 20)
		f.SetColWidth(sheetName, "G", "G", 20)
		f.SetColWidth(sheetName, "H", "H", 20)
		f.SetColWidth(sheetName, "I", "I", 20)
		f.SetRowHeight(sheetName, 3, 30)
		f.SetRowHeight(sheetName, 1, 30)
		f.SetRowHeight(sheetName, 8, 30)

	}

	return f, nil
}

func ExportEmployeeToExcel(
	employees []employeeModel.ExportExcelEmployeeResponse,
) (*excelize.File, error) {
	f := excelize.NewFile()

	sheetName := "Data Karyawan"
	f.SetSheetName("Sheet1", sheetName)

	// Style Judul
	titleStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Size: 16, Color: "#ffffffff"},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"#18254F"}, Pattern: 1},
	})

	// Style Header
	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Color: "#FFFFFF"},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"#18254F"}, Pattern: 1},
		Border: []excelize.Border{
			{Type: "left", Color: "656565", Style: 1},
			{Type: "right", Color: "656565", Style: 1},
			{Type: "top", Color: "656565", Style: 1},
			{Type: "bottom", Color: "656565", Style: 1},
		},
	})

	// Style Default Isi
	cellStyle, _ := f.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Border: []excelize.Border{
			{Type: "left", Color: "656565", Style: 1},
			{Type: "right", Color: "656565", Style: 1},
			{Type: "top", Color: "656565", Style: 1},
			{Type: "bottom", Color: "656565", Style: 1},
		},
	})

	// Judul
	f.SetCellValue(sheetName, "A1", "DATA KARYAWAN PT BPR BANK WONOSOBO (PERSERODA)")
	f.MergeCell(sheetName, "A1", "N1")
	f.SetCellStyle(sheetName, "A1", "N1", titleStyle)
	f.SetRowHeight(sheetName, 1, 30)

	// Header Tabel
	headers := []string{
		"No",
		"Nama",
		"Jenis Kelamin",
		"No. Identitas",
		"Tempat Lahir",
		"Tanggal Lahir",
		"No. Telepon",
		"Alamat",
		"Status Aktif",
		"Jenis Kontrak",
		"Divisi Saat Ini",
		"Posisi Saat Ini",
		"Riwayat Divisi",
		"Riwayat Posisi",
	}
	for col, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(col+1, 3)
		f.SetCellValue(sheetName, cell, h)
	}
	f.SetCellStyle(sheetName, "A3", "N3", headerStyle)
	f.SetRowHeight(sheetName, 3, 25)

	// Data
	for rowIdx, employee := range employees {
		r := rowIdx + 4
		f.SetRowHeight(sheetName, r, 20)

		no := rowIdx + 1
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", r), no)
		f.SetCellValue(sheetName, fmt.Sprintf("B%d", r), employee.Nama)
		f.SetCellValue(sheetName, fmt.Sprintf("C%d", r), employee.Gender)
		f.SetCellValue(sheetName, fmt.Sprintf("D%d", r), employee.IdentityNumber)
		f.SetCellValue(sheetName, fmt.Sprintf("E%d", r), employee.BirthPlace)
		f.SetCellValue(
			sheetName,
			fmt.Sprintf("F%d", r),
			formatTimeMilli(employee.BirthDate, "2006-01-02"),
		)
		f.SetCellValue(sheetName, fmt.Sprintf("G%d", r), employee.Phone)
		f.SetCellValue(sheetName, fmt.Sprintf("H%d", r), employee.Address)

		// Status Aktif
		statusAktif := "Tidak Aktif"
		if employee.IsActive {
			statusAktif = "Aktif"
		}
		f.SetCellValue(sheetName, fmt.Sprintf("I%d", r), statusAktif)

		// Kontrak
		var currentContractType, currentDivision, currentPosition string
		var historyDivisions, historyPositions string
		for _, c := range employee.Contracts {
			if c.Division.Name != "" {
				if historyDivisions != "" {
					historyDivisions += ", "
				}
				historyDivisions += c.Division.Name
			}
			if c.Position.Name != "" {
				if historyPositions != "" {
					historyPositions += ", "
				}
				historyPositions += c.Position.Name
			}

			var endDateVal int64
			if c.EndDate != nil {
				endDateVal = *c.EndDate
			}
			if endDateVal == 0 || endDateVal >= time.Now().UnixMilli() {
				currentContractType = c.ContractType
				currentDivision = c.Division.Name
				currentPosition = c.Position.Name
			}
		}
		f.SetCellValue(sheetName, fmt.Sprintf("J%d", r), currentContractType)
		f.SetCellValue(sheetName, fmt.Sprintf("K%d", r), currentDivision)
		f.SetCellValue(sheetName, fmt.Sprintf("L%d", r), currentPosition)
		f.SetCellValue(sheetName, fmt.Sprintf("M%d", r), historyDivisions)
		f.SetCellValue(sheetName, fmt.Sprintf("N%d", r), historyPositions)

		f.SetCellStyle(sheetName, fmt.Sprintf("A%d", r), fmt.Sprintf("N%d", r), cellStyle)

		// Warna untuk status tidak aktif
		if !employee.IsActive {
			style, _ := f.NewStyle(&excelize.Style{
				Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
				Fill: excelize.Fill{
					Type:    "pattern",
					Color:   []string{"#ffccccff"},
					Pattern: 1,
				},
				Border: []excelize.Border{
					{Type: "left", Color: "656565", Style: 1},
					{Type: "right", Color: "656565", Style: 1},
					{Type: "top", Color: "656565", Style: 1},
					{Type: "bottom", Color: "656565", Style: 1},
				},
			})
			f.SetCellStyle(sheetName, fmt.Sprintf("I%d", r), fmt.Sprintf("I%d", r), style)
		}
	}

	// Atur lebar kolom
	f.SetColWidth(sheetName, "A", "A", 5)
	f.SetColWidth(sheetName, "B", "B", 25)
	f.SetColWidth(sheetName, "C", "C", 15)
	f.SetColWidth(sheetName, "D", "D", 18)
	f.SetColWidth(sheetName, "E", "E", 18)
	f.SetColWidth(sheetName, "F", "F", 15)
	f.SetColWidth(sheetName, "G", "G", 15)
	f.SetColWidth(sheetName, "H", "H", 25)
	f.SetColWidth(sheetName, "I", "I", 12)
	f.SetColWidth(sheetName, "J", "J", 20)
	f.SetColWidth(sheetName, "K", "K", 25)
	f.SetColWidth(sheetName, "L", "L", 25)
	f.SetColWidth(sheetName, "M", "M", 30)
	f.SetColWidth(sheetName, "N", "N", 30)

	return f, nil
}

func ExportVisitToExcel(
	sheets []visitModel.VisitSheet,
	periodeData string,
) (*excelize.File, error) {
	f := excelize.NewFile()

	usedSheetNames := make(map[string]int)
	for i, sheet := range sheets {
		sheetName := buildSheetName(sheet.Name, i, usedSheetNames)
		if i == 0 {
			f.SetSheetName("Sheet1", sheetName)
		} else {
			f.NewSheet(sheetName)
		}

		// Style Judul
		titleStyle, _ := f.NewStyle(&excelize.Style{
			Font:      &excelize.Font{Bold: true, Size: 14, Color: "#1D1D1Dff"},
			Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
			Fill:      excelize.Fill{Type: "pattern", Color: []string{"#d4d4d4ff"}, Pattern: 1},
		})

		// Style Header
		headerStyle, _ := f.NewStyle(&excelize.Style{
			Font:      &excelize.Font{Bold: true, Color: "#FFFFFF"},
			Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
			Fill:      excelize.Fill{Type: "pattern", Color: []string{"#18254F"}, Pattern: 1},
			Border: []excelize.Border{
				{Type: "left", Color: "656565", Style: 1},
				{Type: "right", Color: "656565", Style: 1},
				{Type: "top", Color: "656565", Style: 1},
				{Type: "bottom", Color: "656565", Style: 1},
			},
		})

		// Style Default Isi
		cellStyle, _ := f.NewStyle(&excelize.Style{
			Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
			Border: []excelize.Border{
				{Type: "left", Color: "656565", Style: 1},
				{Type: "right", Color: "656565", Style: 1},
				{Type: "top", Color: "656565", Style: 1},
				{Type: "bottom", Color: "656565", Style: 1},
			},
		})

		// Judul
		f.SetCellValue(sheetName, "B1", "REKAP KUNJUNGAN (VISIT)")
		f.MergeCell(sheetName, "B1", "G1")
		f.SetCellStyle(sheetName, "A1", "G1", titleStyle)

		// Detail Personalia
		f.SetCellValue(sheetName, "B3", "PT BPR BANK WONOSOBO (PERSERODA)")
		f.MergeCell(sheetName, "B3", "E3")

		// Style Title Bawon
		styleTitleBawon, _ := f.NewStyle(&excelize.Style{
			Font:      &excelize.Font{Bold: true, Size: 16, Color: "#ffffffff"},
			Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
			Fill:      excelize.Fill{Type: "pattern", Color: []string{"#18254F"}, Pattern: 1},
		})
		f.SetCellStyle(sheetName, "B3", "D3", styleTitleBawon)

		// Style Title Detail
		styleTitleDetail, _ := f.NewStyle(&excelize.Style{
			Font:      &excelize.Font{Bold: true, Size: 10, Color: "#1D1D1Dff"},
			Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
			Fill:      excelize.Fill{Type: "pattern", Color: []string{"#dfe5f7ff"}, Pattern: 1},
		})

		f.SetCellValue(sheetName, "B4", "Karyawan")
		f.SetCellValue(sheetName, "C4", sheet.Name)
		f.SetCellValue(sheetName, "B5", "Periode")
		f.SetCellValue(sheetName, "C5", periodeData)
		f.SetCellValue(sheetName, "B6", "Total Kunjungan")
		f.SetCellValue(sheetName, "C6", sheet.Total)
		f.SetCellStyle(sheetName, "B4", "B6", styleTitleDetail)

		// Header Tabel
		headers := []string{
			"No",
			"Tanggal Mulai",
			"Tanggal Selesai",
			"Nama Klien",
			"Alamat",
			"Catatan",
		}
		for col, h := range headers {
			cell, _ := excelize.CoordinatesToCellName(col+2, 8) // starts from column B (2)
			f.SetCellValue(sheetName, cell, h)
		}
		f.SetCellStyle(sheetName, "B8", "G8", headerStyle)

		no := 1
		// Data
		for rowIdx, visit := range sheet.Data {
			r := rowIdx + 9
			f.SetRowHeight(sheetName, r, 20)

			f.SetCellValue(sheetName, fmt.Sprintf("B%d", r), no)
			f.SetCellValue(sheetName, fmt.Sprintf("C%d", r), visit.StartDate)
			f.SetCellValue(sheetName, fmt.Sprintf("D%d", r), visit.EndDate)
			f.SetCellValue(sheetName, fmt.Sprintf("E%d", r), visit.ClientName)

			var address, note string
			if visit.Address != nil {
				address = *visit.Address
			}
			if visit.Note != nil {
				note = *visit.Note
			}

			f.SetCellValue(sheetName, fmt.Sprintf("F%d", r), address)
			f.SetCellValue(sheetName, fmt.Sprintf("G%d", r), note)

			f.SetCellStyle(sheetName, fmt.Sprintf("B%d", r), fmt.Sprintf("G%d", r), cellStyle)
			no++
		}

		// Atur lebar kolom
		f.SetColWidth(sheetName, "A", "A", 5)
		f.SetColWidth(sheetName, "B", "B", 10)
		f.SetColWidth(sheetName, "C", "C", 20)
		f.SetColWidth(sheetName, "D", "D", 20)
		f.SetColWidth(sheetName, "E", "E", 25)
		f.SetColWidth(sheetName, "F", "F", 40)
		f.SetColWidth(sheetName, "G", "G", 40)

		f.SetRowHeight(sheetName, 3, 30)
		f.SetRowHeight(sheetName, 1, 30)
		f.SetRowHeight(sheetName, 8, 30)
	}

	return f, nil
}

func ExportCreditCollectionToExcel(
	sheets []visitModel.CollectingSheet,
	periodeData string,
) (*excelize.File, error) {
	f := excelize.NewFile()

	usedSheetNames := make(map[string]int)
	for i, sheet := range sheets {
		sheetName := buildSheetName(sheet.Name, i, usedSheetNames)
		if i == 0 {
			f.SetSheetName("Sheet1", sheetName)
		} else {
			f.NewSheet(sheetName)
		}

		// Style Judul
		titleStyle, _ := f.NewStyle(&excelize.Style{
			Font:      &excelize.Font{Bold: true, Size: 14, Color: "#1D1D1Dff"},
			Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
			Fill:      excelize.Fill{Type: "pattern", Color: []string{"#d4d4d4ff"}, Pattern: 1},
		})

		// Style Header
		headerStyle, _ := f.NewStyle(&excelize.Style{
			Font:      &excelize.Font{Bold: true, Color: "#FFFFFF"},
			Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
			Fill:      excelize.Fill{Type: "pattern", Color: []string{"#18254F"}, Pattern: 1},
			Border: []excelize.Border{
				{Type: "left", Color: "656565", Style: 1},
				{Type: "right", Color: "656565", Style: 1},
				{Type: "top", Color: "656565", Style: 1},
				{Type: "bottom", Color: "656565", Style: 1},
			},
		})

		// Style Default Isi
		cellStyle, _ := f.NewStyle(&excelize.Style{
			Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
			Border: []excelize.Border{
				{Type: "left", Color: "656565", Style: 1},
				{Type: "right", Color: "656565", Style: 1},
				{Type: "top", Color: "656565", Style: 1},
				{Type: "bottom", Color: "656565", Style: 1},
			},
		})

		// Style Nominal Rupiah
		currencyFormat := "#,##0"
		currencyStyle, _ := f.NewStyle(&excelize.Style{
			CustomNumFmt: &currencyFormat,
			Alignment:    &excelize.Alignment{Horizontal: "right", Vertical: "center"},
			Border: []excelize.Border{
				{Type: "left", Color: "656565", Style: 1},
				{Type: "right", Color: "656565", Style: 1},
				{Type: "top", Color: "656565", Style: 1},
				{Type: "bottom", Color: "656565", Style: 1},
			},
		})

		// Judul
		f.SetCellValue(sheetName, "B1", "REKAP COLLECTING (REMIDIAL)")
		f.MergeCell(sheetName, "B1", "J1")
		f.SetCellStyle(sheetName, "A1", "J1", titleStyle)

		// Detail Personalia
		f.SetCellValue(sheetName, "B3", "PT BPR BANK WONOSOBO (PERSERODA)")
		f.MergeCell(sheetName, "B3", "E3")

		// Style Title Bawon
		styleTitleBawon, _ := f.NewStyle(&excelize.Style{
			Font:      &excelize.Font{Bold: true, Size: 16, Color: "#ffffffff"},
			Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
			Fill:      excelize.Fill{Type: "pattern", Color: []string{"#18254F"}, Pattern: 1},
		})
		f.SetCellStyle(sheetName, "B3", "D3", styleTitleBawon)

		// Style Title Detail
		styleTitleDetail, _ := f.NewStyle(&excelize.Style{
			Font:      &excelize.Font{Bold: true, Size: 10, Color: "#1D1D1Dff"},
			Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
			Fill:      excelize.Fill{Type: "pattern", Color: []string{"#dfe5f7ff"}, Pattern: 1},
		})

		f.SetCellValue(sheetName, "B4", "Karyawan")
		f.SetCellValue(sheetName, "C4", sheet.Name)
		f.SetCellValue(sheetName, "B5", "Periode")
		f.SetCellValue(sheetName, "C5", periodeData)
		f.SetCellValue(sheetName, "B6", "Total Kunjungan")
		f.SetCellValue(sheetName, "C6", sheet.Total)
		f.SetCellValue(sheetName, "B7", "Total Dibayar")
		f.SetCellValue(sheetName, "C7", sheet.TotalPaid)
		f.SetCellStyle(sheetName, "B4", "B7", styleTitleDetail)
		f.SetCellStyle(sheetName, "C7", "C7", currencyStyle)

		// Header Tabel
		headers := []string{
			"No",
			"Tanggal",
			"Nama Nasabah",
			"No Pinjaman",
			"Kolektibilitas",
			"Saldo Pinjaman",
			"Tunggakan Total",
			"Total Dibayar",
			"Komitmen",
		}
		for col, h := range headers {
			cell, _ := excelize.CoordinatesToCellName(col+2, 9) // starts from column B (2)
			f.SetCellValue(sheetName, cell, h)
		}
		f.SetCellStyle(sheetName, "B9", "J9", headerStyle)

		no := 1
		// Data
		for rowIdx, collecting := range sheet.Data {
			r := rowIdx + 10
			f.SetRowHeight(sheetName, r, 20)

			f.SetCellValue(sheetName, fmt.Sprintf("B%d", r), no)
			f.SetCellValue(
				sheetName,
				fmt.Sprintf("C%d", r),
				formatTimeMilli(collecting.Date, "2006-01-02 15:04:05"),
			)
			f.SetCellValue(sheetName, fmt.Sprintf("D%d", r), collecting.NasabahName)
			f.SetCellValue(sheetName, fmt.Sprintf("E%d", r), collecting.NoPjm)
			f.SetCellValue(sheetName, fmt.Sprintf("F%d", r), collecting.Collectibility)
			f.SetCellValue(sheetName, fmt.Sprintf("G%d", r), collecting.OutstandingBalance)
			f.SetCellValue(sheetName, fmt.Sprintf("H%d", r), collecting.OverdueTotal)
			f.SetCellValue(sheetName, fmt.Sprintf("I%d", r), collecting.TotalPaid)
			f.SetCellValue(sheetName, fmt.Sprintf("J%d", r), collecting.Commitment)

			f.SetCellStyle(sheetName, fmt.Sprintf("B%d", r), fmt.Sprintf("J%d", r), cellStyle)
			f.SetCellStyle(sheetName, fmt.Sprintf("G%d", r), fmt.Sprintf("I%d", r), currencyStyle)
			no++
		}

		// Atur lebar kolom
		f.SetColWidth(sheetName, "A", "A", 5)
		f.SetColWidth(sheetName, "B", "B", 10)
		f.SetColWidth(sheetName, "C", "C", 22)
		f.SetColWidth(sheetName, "D", "D", 30)
		f.SetColWidth(sheetName, "E", "E", 20)
		f.SetColWidth(sheetName, "F", "F", 15)
		f.SetColWidth(sheetName, "G", "H", 20)
		f.SetColWidth(sheetName, "I", "I", 20)
		f.SetColWidth(sheetName, "J", "J", 40)

		f.SetRowHeight(sheetName, 1, 30)
		f.SetRowHeight(sheetName, 3, 30)
		f.SetRowHeight(sheetName, 9, 30)
	}

	return f, nil
}

func formatTimeMilli(milli int64, format string) string {
	if milli <= 0 {
		return "-"
	}
	return time.UnixMilli(milli).Format(format)
}

// buildSheetName membersihkan nama karyawan sebagai nama sheet excel.
func buildSheetName(name string, index int, used map[string]int) string {
	cleaned := strings.TrimSpace(name)
	for _, char := range []string{":", "\\", "/", "?", "*", "[", "]"} {
		cleaned = strings.ReplaceAll(cleaned, char, " ")
	}
	if cleaned == "" {
		cleaned = fmt.Sprintf("Karyawan %d", index+1)
	}
	cleaned = truncateSheetName(cleaned, 31)

	used[cleaned]++
	if total := used[cleaned]; total > 1 {
		suffix := fmt.Sprintf(" (%d)", total)
		cleaned = truncateSheetName(cleaned, 31-len([]rune(suffix))) + suffix
	}

	return cleaned
}

func truncateSheetName(name string, max int) string {
	runes := []rune(name)
	if len(runes) <= max {
		return name
	}
	return strings.TrimSpace(string(runes[:max]))
}
