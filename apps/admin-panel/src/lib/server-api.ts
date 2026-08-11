import { cookies } from "next/headers";

type Params = Record<string, string | number | boolean | undefined>;

export async function serverApi<T = unknown>(
  path: string,
  params?: Params,
): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== null) {
        searchParams.set(k, String(v));
      }
    });
  }

  const query = searchParams.toString();
  const url = `${process.env.API_URL}/${path}${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  return res.json();
}
