import ListEmployeeContract from "@/features/employee-contract/components/list-employee-contract";
import MenuEmployeeContract from "@/features/employee-contract/components/menu-employee-contract";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmployeeContractPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="border p-4 rounded-2xl space-y-4">
      <MenuEmployeeContract employeeId={id} />
      <ListEmployeeContract employeeId={id} />
    </div>
  );
}
