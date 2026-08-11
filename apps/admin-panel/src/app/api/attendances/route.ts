import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = searchParams.get("page") || "1";
  const size = searchParams.get("size") || "10";
  const employee_id = searchParams.get("employee_id") || "";
  const start_date = searchParams.get("start_date") || "";
  const end_date = searchParams.get("end_date") || "";
  const status = searchParams.get("status") || "";

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const params = new URLSearchParams({ page, size });
  if (employee_id) params.set("employee_id", employee_id);
  if (start_date) params.set("start_date", start_date);
  if (end_date) params.set("end_date", end_date);
  if (status) params.set("status", status);

  const res = await fetch(
    `${process.env.API_URL}/attendances?${params.toString()}`,
    {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    },
  );

  const data = await res.json();
  return Response.json(data);
}
