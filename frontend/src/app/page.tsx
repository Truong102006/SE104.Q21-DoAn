import { redirect } from "next/navigation";
import { cookies } from "next/headers";

/**
 * Root page — redirects to /dashboard if authenticated, /login otherwise.
 */
export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (token) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
