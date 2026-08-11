import MenuEmployeeAllowance from "@/features/employee-allowance/components/menu-employee-allowance";
import ListEmployeeAllowance from "@/features/employee-allowance/components/list-employee-allowance";
import MenuEmployeeDeduction from "@/features/employee-deduction/components/menu-employee-deduction";
import ListEmployeeDeduction from "@/features/employee-deduction/components/list-employee-deduction";
import MenuEmployeeSalary from "@/features/employee-salary/components/menu-employee-salary";
import ListEmployeeSalary from "@/features/employee-salary/components/list-employee-salary";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmployeePayroll({ params }: Props) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="border p-4 rounded-2xl space-y-4">
        <MenuEmployeeSalary employeeId={id} />
        <ListEmployeeSalary employeeId={id} />
      </div>

      <div className="border p-4 rounded-2xl space-y-4">
        <MenuEmployeeAllowance employeeId={id} />
        <ListEmployeeAllowance employeeId={id} />
      </div>

      <div className="border p-4 rounded-2xl space-y-4">
        <MenuEmployeeDeduction employeeId={id} />
        <ListEmployeeDeduction employeeId={id} />
      </div>
    </div>
  );
}
