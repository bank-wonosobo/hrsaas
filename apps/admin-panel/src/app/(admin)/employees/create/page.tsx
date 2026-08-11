import Title from "@/components/ui/title/title";
import FormEmployee from "@/features/employee/components/form-employee";

export default function CreateEmployeePage() {
  return (
    <>
      <Title title="Tambah data karyawan" previus="/employees" />
      <div className="p-5 bg-white rounded-4xl border">
        <FormEmployee />
      </div>
    </>
  );
}
