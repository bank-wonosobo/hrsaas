"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EmployeeAllowance } from "@/features/employee-allowance/schemas/employee-allowance-schema";
import {
  createEmployeeAllowance,
  deleteEmployeeAllowance,
  getEmployeeAllowances,
  updateEmployeeAllowance,
} from "@/features/employee-allowance/services/employee-allowance-service";
import type { EmployeeDeduction } from "@/features/employee-deduction/schemas/employee-deduction-schema";
import {
  createEmployeeDeduction,
  deleteEmployeeDeduction,
  getEmployeeDeductions,
  updateEmployeeDeduction,
} from "@/features/employee-deduction/services/employee-deduction-service";
import type { EmployeeSalary } from "@/features/employee-salary/schemas/employee-salary-schema";
import {
  createEmployeeSalary,
  getEmployeeSalaries,
  updateEmployeeSalary,
} from "@/features/employee-salary/services/employee-salary-service";
import { useGetEmployees } from "@/features/employee/hooks/use-get-employee";
import { useSearchSalaryComponent } from "@/features/salary-component/hooks/use-search-salary-component";
import type { SalaryComponent } from "@/features/salary-component/schemas/salary-component-schema";
import type { PaginatedData } from "@/lib/response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;
const ASSIGNMENT_PAGE_SIZE = 100;

type Assignment = EmployeeAllowance | EmployeeDeduction;
type AssignmentKind = "allowance" | "deduction";

async function getAllAssignments<T>(
  fetchPage: (page: number, size: number) => Promise<PaginatedData<T>>,
): Promise<T[]> {
  const firstPage = await fetchPage(1, ASSIGNMENT_PAGE_SIZE);
  const remainingPages = await Promise.all(
    Array.from(
      { length: Math.max(0, firstPage.paging.total_page - 1) },
      (_, index) => fetchPage(index + 2, ASSIGNMENT_PAGE_SIZE),
    ),
  );

  return [firstPage, ...remainingPages].flatMap((page) => page.data);
}

function assignmentKey(employeeId: string, componentId: string) {
  return `${employeeId}:${componentId}`;
}

function isPercentageComponent(component: SalaryComponent) {
  return (
    component.calculation_type === "SALARY_PERCENTAGE" ||
    component.calculation_type === "GROSS_PERCENTAGE"
  );
}

function formatGroupedNumber(value: number | null) {
  if (value === null) return "";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 20,
  }).format(value);
}

type EditableValueCellProps = {
  label: string;
  currentValue: number | null;
  isPending: boolean;
  isPercentage: boolean;
  clearable?: boolean;
  onClear: () => Promise<void>;
  onSave: (value: number) => Promise<void>;
};

function EditableValueCell({
  label,
  currentValue,
  isPending,
  isPercentage,
  clearable = true,
  onClear,
  onSave,
}: EditableValueCellProps) {
  const [value, setValue] = useState(currentValue?.toString() ?? "");
  const [isEditing, setIsEditing] = useState(false);

  const commit = async () => {
    if (value.trim() === "") {
      if (clearable && currentValue !== null) {
        try {
          await onClear();
        } catch {
          setValue(currentValue.toString());
        }
      }
      setIsEditing(false);
      return;
    }

    const numericValue = Number(value);
    if (
      !Number.isFinite(numericValue) ||
      numericValue < 0 ||
      (isPercentage && numericValue > 100)
    ) {
      setValue(currentValue?.toString() ?? "");
      toast.error(
        isPercentage
          ? "Persentase harus berada di antara 0 dan 100."
          : "Nilai harus berupa angka nol atau lebih.",
      );
      setIsEditing(false);
      return;
    }

    if (numericValue === currentValue) {
      setIsEditing(false);
      return;
    }

    try {
      await onSave(numericValue);
    } catch {
      setValue(currentValue?.toString() ?? "");
    }
    setIsEditing(false);
  };

  return (
    <div className="flex min-w-32 items-center gap-1.5">
      <span className="text-xs text-muted-foreground">
        {isPercentage ? "%" : "Rp"}
      </span>
      <Input
        aria-label={label}
        type="text"
        inputMode="decimal"
        placeholder="—"
        value={isEditing ? value : formatGroupedNumber(currentValue)}
        disabled={isPending}
        onFocus={() => {
          setValue(currentValue?.toString() ?? "");
          setIsEditing(true);
        }}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        className="h-8 min-w-0 rounded-md px-2 text-right tabular-nums"
      />
    </div>
  );
}

export default function Salary() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300,
    );
    return () => window.clearTimeout(timeout);
  }, [search]);

  const employeesQuery = useGetEmployees({
    key: debouncedSearch,
    page,
    size: PAGE_SIZE,
  });
  const allowancesQuery = useSearchSalaryComponent({
    type: "EARNING",
    active_only: true,
    page: 1,
    size: 100,
  });
  const deductionsQuery = useSearchSalaryComponent({
    type: "DEDUCTION",
    active_only: true,
    page: 1,
    size: 100,
  });
  const employeeAllowancesQuery = useQuery({
    queryKey: ["employee-allowances", "salary-grid"],
    queryFn: () =>
      getAllAssignments((currentPage, size) =>
        getEmployeeAllowances({
          active_only: true,
          page: currentPage,
          size,
        }),
      ),
  });
  const employeeDeductionsQuery = useQuery({
    queryKey: ["employee-deductions", "salary-grid"],
    queryFn: () =>
      getAllAssignments((currentPage, size) =>
        getEmployeeDeductions({
          active_only: true,
          page: currentPage,
          size,
        }),
      ),
  });
  const employeeSalariesQuery = useQuery({
    queryKey: ["employee-salaries", "salary-grid"],
    queryFn: () =>
      getAllAssignments((currentPage, size) =>
        getEmployeeSalaries({
          active_only: true,
          page: currentPage,
          size,
        }),
      ),
  });

  const invalidateAssignments = () => {
    void queryClient.invalidateQueries({ queryKey: ["employee-allowances"] });
    void queryClient.invalidateQueries({ queryKey: ["employee-deductions"] });
    void queryClient.invalidateQueries({ queryKey: ["employee-salaries"] });
  };

  const createAllowanceMutation = useMutation({
    mutationFn: createEmployeeAllowance,
    onSuccess: () => {
      invalidateAssignments();
      toast.success("Tunjangan berhasil ditambahkan.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const updateAllowanceMutation = useMutation({
    mutationFn: ({
      id,
      amount,
      percentage,
    }: {
      id: string;
      amount: number;
      percentage: number;
    }) => updateEmployeeAllowance(id, { amount, percentage }),
    onSuccess: () => {
      invalidateAssignments();
      toast.success("Tunjangan berhasil diperbarui.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const deleteAllowanceMutation = useMutation({
    mutationFn: deleteEmployeeAllowance,
    onSuccess: () => {
      invalidateAssignments();
      toast.success("Tunjangan berhasil dihapus.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const createDeductionMutation = useMutation({
    mutationFn: createEmployeeDeduction,
    onSuccess: () => {
      invalidateAssignments();
      toast.success("Potongan berhasil ditambahkan.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const updateDeductionMutation = useMutation({
    mutationFn: ({
      id,
      amount,
      percentage,
    }: {
      id: string;
      amount: number;
      percentage: number;
    }) => updateEmployeeDeduction(id, { amount, percentage }),
    onSuccess: () => {
      invalidateAssignments();
      toast.success("Potongan berhasil diperbarui.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const deleteDeductionMutation = useMutation({
    mutationFn: deleteEmployeeDeduction,
    onSuccess: () => {
      invalidateAssignments();
      toast.success("Potongan berhasil dihapus.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const createSalaryMutation = useMutation({
    mutationFn: createEmployeeSalary,
    onSuccess: () => {
      invalidateAssignments();
      toast.success("Gaji pokok berhasil ditambahkan.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const updateSalaryMutation = useMutation({
    mutationFn: ({ id, basic_salary }: { id: string; basic_salary: number }) =>
      updateEmployeeSalary(id, { basic_salary }),
    onSuccess: () => {
      invalidateAssignments();
      toast.success("Gaji pokok berhasil diperbarui.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const employees = employeesQuery.data?.data ?? [];
  const allowances = allowancesQuery.data?.data ?? [];
  const deductions = deductionsQuery.data?.data ?? [];
  const salariesByEmployee = useMemo(() => {
    const salaries = new Map<string, EmployeeSalary>();
    for (const salary of employeeSalariesQuery.data ?? []) {
      const current = salaries.get(salary.employee_id);
      if (!current || salary.effective_date > current.effective_date) {
        salaries.set(salary.employee_id, salary);
      }
    }
    return salaries;
  }, [employeeSalariesQuery.data]);

  const allowanceByCell = useMemo(() => {
    const assignments = new Map<string, EmployeeAllowance>();
    for (const item of employeeAllowancesQuery.data ?? []) {
      const key = assignmentKey(item.employee_id, item.salary_component_id);
      const current = assignments.get(key);
      if (!current || item.effective_date > current.effective_date) {
        assignments.set(key, item);
      }
    }
    return assignments;
  }, [employeeAllowancesQuery.data]);

  const deductionByCell = useMemo(() => {
    const assignments = new Map<string, EmployeeDeduction>();
    for (const item of employeeDeductionsQuery.data ?? []) {
      const key = assignmentKey(item.employee_id, item.salary_component_id);
      const current = assignments.get(key);
      if (!current || item.effective_date > current.effective_date) {
        assignments.set(key, item);
      }
    }
    return assignments;
  }, [employeeDeductionsQuery.data]);

  const isSaving =
    createAllowanceMutation.isPending ||
    updateAllowanceMutation.isPending ||
    deleteAllowanceMutation.isPending ||
    createDeductionMutation.isPending ||
    updateDeductionMutation.isPending ||
    deleteDeductionMutation.isPending ||
    createSalaryMutation.isPending ||
    updateSalaryMutation.isPending;
  const isLoading =
    employeesQuery.isLoading ||
    allowancesQuery.isLoading ||
    deductionsQuery.isLoading ||
    employeeAllowancesQuery.isLoading ||
    employeeDeductionsQuery.isLoading ||
    employeeSalariesQuery.isLoading;
  const hasError =
    employeesQuery.isError ||
    allowancesQuery.isError ||
    deductionsQuery.isError ||
    employeeAllowancesQuery.isError ||
    employeeDeductionsQuery.isError ||
    employeeSalariesQuery.isError;
  const totalPages = Math.max(1, employeesQuery.data?.paging.total_page ?? 1);

  const saveAssignment = async (
    kind: AssignmentKind,
    employeeId: string,
    component: SalaryComponent,
    assignment: Assignment | undefined,
    value: number,
  ) => {
    const isPercentage = isPercentageComponent(component);
    const amount = isPercentage ? 0 : value;
    const percentage = isPercentage ? value : 0;
    if (kind === "allowance") {
      if (assignment) {
        await updateAllowanceMutation.mutateAsync({
          id: assignment.id,
          amount,
          percentage,
        });
      } else {
        await createAllowanceMutation.mutateAsync({
          employee_id: employeeId,
          salary_component_id: component.id,
          amount,
          percentage,
          effective_date: new Date().toISOString(),
        });
      }
      return;
    }

    if (assignment) {
      await updateDeductionMutation.mutateAsync({
        id: assignment.id,
        amount,
        percentage,
      });
    } else {
      await createDeductionMutation.mutateAsync({
        employee_id: employeeId,
        salary_component_id: component.id,
        amount,
        percentage,
        effective_date: new Date().toISOString(),
      });
    }
  };

  const clearAssignment = async (
    kind: AssignmentKind,
    assignment: Assignment | undefined,
  ) => {
    if (!assignment) return;
    if (kind === "allowance") {
      await deleteAllowanceMutation.mutateAsync(assignment.id);
    } else {
      await deleteDeductionMutation.mutateAsync(assignment.id);
    }
  };

  const saveBasicSalary = async (
    employeeId: string,
    salary: EmployeeSalary | undefined,
    basicSalary: number,
  ) => {
    if (salary) {
      await updateSalaryMutation.mutateAsync({
        id: salary.id,
        basic_salary: basicSalary,
      });
      return;
    }

    await createSalaryMutation.mutateAsync({
      employee_id: employeeId,
      basic_salary: basicSalary,
      effective_date: new Date().toISOString(),
    });
  };

  const retryLoading = () => {
    void Promise.all([
      employeesQuery.refetch(),
      allowancesQuery.refetch(),
      deductionsQuery.refetch(),
      employeeAllowancesQuery.refetch(),
      employeeDeductionsQuery.refetch(),
      employeeSalariesQuery.refetch(),
    ]);
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Grid Gaji</h1>
        <p className="text-sm text-muted-foreground">
          Kelola tunjangan dan potongan setiap karyawan dalam satu tampilan.
        </p>
      </header>

      <Card>
        <CardHeader className="gap-3 border-b sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Komponen per Karyawan</CardTitle>
            <CardDescription className="mt-1">
              Ubah nominal atau persentase, lalu tekan Enter atau pindah dari
              sel untuk menyimpan. Kosongkan sel untuk menghapus komponen.
            </CardDescription>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Cari karyawan"
              placeholder="Cari nama atau nomor karyawan"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          {isLoading ? (
            <p
              role="status"
              className="py-12 text-center text-sm text-muted-foreground"
            >
              Memuat data grid gaji...
            </p>
          ) : hasError ? (
            <div className="space-y-3 py-10 text-center">
              <p role="alert" className="text-sm text-destructive">
                Grid gaji gagal dimuat. Silakan coba lagi.
              </p>
              <Button type="button" variant="outline" onClick={retryLoading}>
                Coba lagi
              </Button>
            </div>
          ) : employees.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Karyawan tidak ditemukan.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead
                      rowSpan={2}
                      className="sticky left-0 z-20 min-w-56 bg-card align-bottom"
                    >
                      Karyawan
                    </TableHead>
                    {allowances.length > 0 && (
                      <TableHead
                        colSpan={allowances.length}
                        className="bg-emerald-50 text-center text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                      >
                        Tunjangan
                      </TableHead>
                    )}
                    {deductions.length > 0 && (
                      <TableHead
                        colSpan={deductions.length}
                        className="bg-rose-50 text-center text-rose-900 dark:bg-rose-950/40 dark:text-rose-100"
                      >
                        Potongan
                      </TableHead>
                    )}
                    <TableHead
                      rowSpan={2}
                      className="min-w-44 bg-primary/5 text-center align-bottom"
                    >
                      Gaji Pokok
                      <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                        Nominal (Rp)
                      </span>
                    </TableHead>
                  </TableRow>
                  <TableRow className="hover:bg-transparent">
                    {[...allowances, ...deductions].map((component) => (
                      <TableHead
                        key={component.id}
                        className="min-w-40 whitespace-normal text-center"
                        title={`${component.code} · ${component.name}`}
                      >
                        <span className="block">{component.name}</span>
                        <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                          {isPercentageComponent(component)
                            ? "Persentase (%)"
                            : "Nominal (Rp)"}
                        </span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => {
                    const salary = salariesByEmployee.get(employee.id);
                    return (
                      <TableRow key={employee.id}>
                        <TableCell className="sticky left-0 z-10 bg-card">
                          <span className="block font-medium">
                            {employee.fullname}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {employee.employee_number}
                          </span>
                        </TableCell>
                        {[...allowances, ...deductions].map((component) => {
                          const kind: AssignmentKind =
                            component.type === "EARNING"
                              ? "allowance"
                              : "deduction";
                          const assignment =
                            kind === "allowance"
                              ? allowanceByCell.get(
                                  assignmentKey(employee.id, component.id),
                                )
                              : deductionByCell.get(
                                  assignmentKey(employee.id, component.id),
                                );
                          const isPercentage =
                            isPercentageComponent(component);
                          const currentValue =
                            assignment == null
                              ? null
                              : isPercentage
                                ? assignment.percentage
                                : assignment.amount;

                          return (
                            <TableCell
                              key={`${component.id}:${currentValue ?? ""}`}
                            >
                              <EditableValueCell
                                label={`${employee.fullname} · ${component.name}`}
                                currentValue={currentValue}
                                isPending={isSaving}
                                isPercentage={isPercentage}
                                onSave={(value) =>
                                  saveAssignment(
                                    kind,
                                    employee.id,
                                    component,
                                    assignment,
                                    value,
                                  )
                                }
                                onClear={() =>
                                  clearAssignment(kind, assignment)
                                }
                              />
                            </TableCell>
                          );
                        })}
                        <TableCell
                          key={`basic-salary:${salary?.basic_salary ?? ""}`}
                        >
                          <EditableValueCell
                            label={`${employee.fullname} · Gaji Pokok`}
                            currentValue={salary?.basic_salary ?? null}
                            isPending={isSaving}
                            isPercentage={false}
                            clearable={false}
                            onSave={(value) =>
                              saveBasicSalary(employee.id, salary, value)
                            }
                            onClear={async () => undefined}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Menampilkan {employees.length} dari{" "}
                  {employeesQuery.data?.paging.total_item ?? 0} karyawan
                </span>
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <span>
                    Halaman {page} dari {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label="Halaman sebelumnya"
                    disabled={page <= 1}
                    onClick={() => setPage((currentPage) => currentPage - 1)}
                  >
                    <ChevronLeft />
                    Sebelumnya
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label="Halaman berikutnya"
                    disabled={page >= totalPages}
                    onClick={() => setPage((currentPage) => currentPage + 1)}
                  >
                    Berikutnya
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
