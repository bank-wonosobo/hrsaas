import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = searchParams.get("page") || "1";
  const size = searchParams.get("size") || "10";
  const employee_id = searchParams.get("employee_id") || "";
  const status = searchParams.get("status") || "";
  const time_off_type_id = searchParams.get("time_off_type_id") || "";
  const request_status = searchParams.get("request_status") || "";
  const start_date = searchParams.get("start_date") || "";
  const end_date = searchParams.get("end_date") || "";

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const params = new URLSearchParams({ page, size });
  if (employee_id) params.set("employee_id", employee_id);
  if (status) params.set("status", status);
  if (time_off_type_id) params.set("time_off_type_id", time_off_type_id);
  if (request_status) params.set("request_status", request_status);
  if (start_date) params.set("start_date", start_date);
  if (end_date) params.set("end_date", end_date);

  const res = await fetch(
    `${process.env.API_URL}/time-off-approvals/_current?${params.toString()}`,
    {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    },
  );

  const data = await res.json();
  return Response.json(data);
}
