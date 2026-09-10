"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@compass/db";

// ponytail: supabase-js exchanges ?code in-URL on its own; here we only wait then go home
export default function AuthCallbackPage() {
  const router = useRouter();
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      router.replace("/");
      return;
    }
    const done = () => router.replace("/");
    const fallback = setTimeout(done, 8000);
    sb.auth.getSession().then(({ data }) => {
      if (data.session) {
        clearTimeout(fallback);
        done();
      }
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      if (session) {
        clearTimeout(fallback);
        done();
      }
    });
    return () => {
      clearTimeout(fallback);
      sub.subscription.unsubscribe();
    };
  }, [router]);
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16 text-center">
      <p className="text-base font-semibold text-ink">Đang đăng nhập…</p>
      <p className="mt-2 text-sm text-muted">Xong sẽ tự về trang chủ.</p>
    </div>
  );
}
