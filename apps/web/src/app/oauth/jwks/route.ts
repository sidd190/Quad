import { getJwks } from "@/lib/oauth";

export async function GET() {
  return Response.json(await getJwks());
}
