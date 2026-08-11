import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const key = searchParams.get("key") || "";
  const type = searchParams.get("type") || "";
  const page = searchParams.get("page") || "1";
  const size = searchParams.get("size") || "10";

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const params = new URLSearchParams({ page, size });
  if (key) params.set("key", key);
  if (type) params.set("type", type);

  const res = await fetch(
    `${process.env.API_URL}/employees?${params.toString()}`,
    {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    },
  );

  const data = await res.json();
  return Response.json(data);
}
