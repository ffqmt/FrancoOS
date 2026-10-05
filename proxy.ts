import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// admin.francotech.com.br abre o painel; o domínio principal abre o site.
export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const url = request.nextUrl.clone();
  const ehAdminHost = host.startsWith("admin.");

  if (ehAdminHost && !url.pathname.startsWith("/admin") && !url.pathname.startsWith("/api")) {
    url.pathname = `/admin${url.pathname === "/" ? "" : url.pathname}`;
  }

  if (!url.pathname.startsWith("/admin")) {
    return url.pathname === request.nextUrl.pathname ? NextResponse.next() : NextResponse.rewrite(url);
  }

  // Sem as variáveis do Supabase o login não funciona: mostra quais faltam em vez de um erro genérico.
  const faltando = [
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && "NEXT_PUBLIC_SUPABASE_URL",
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ].filter(Boolean);
  if (faltando.length) {
    return new NextResponse(`FrancoOS: faltam as variáveis ${faltando.join(", ")} na Vercel. Cadastre e faça um Redeploy.`, {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  let response =
    url.pathname === request.nextUrl.pathname ? NextResponse.next({ request }) : NextResponse.rewrite(url, { request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (lista) => {
          lista.forEach(({ name, value }) => request.cookies.set(name, value));
          response =
            url.pathname === request.nextUrl.pathname
              ? NextResponse.next({ request })
              : NextResponse.rewrite(url, { request });
          lista.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && url.pathname !== "/admin/login") {
    const login = request.nextUrl.clone();
    login.pathname = "/admin/login";
    login.search = "";
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
