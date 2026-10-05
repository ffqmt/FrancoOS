import { redirect } from "next/navigation";
import { emailPermitido, supabaseServer } from "@/lib/supabase";
import Sistema from "./Sistema";

export const metadata = { title: "FrancoOS", robots: { index: false } };

export default async function PaginaSistema() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !emailPermitido(user.email)) redirect("/admin/login");

  return <Sistema />;
}
