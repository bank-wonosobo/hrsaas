import ProfileEmployee from "@/features/employee/components/detail/profile-employee";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DetailEmployeePage({ params }: Props) {
  const { id } = await params;

  return <ProfileEmployee id={id} />;
}
