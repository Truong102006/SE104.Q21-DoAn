import { redirect } from "next/navigation";

export default function ServicesRedirectPage() {
  redirect("/dashboard/service-types");
}
