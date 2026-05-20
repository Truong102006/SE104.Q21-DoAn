import { redirect } from "next/navigation";

export default function CategoriesRedirectPage() {
  redirect("/dashboard/units");
}
