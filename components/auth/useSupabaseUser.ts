"use client";

import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

export function useSupabaseUser() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: isSupabaseConfigured,
    error: isSupabaseConfigured ? null : "Google 로그인 설정을 불러오지 못했습니다.",
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = getSupabaseBrowserClient();
    let active = true;

    const loadUser = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;

      if (sessionError) {
        setState({ user: null, loading: false, error: "로그인 상태를 확인하지 못했습니다." });
        return;
      }

      if (!sessionData.session) {
        setState({ user: null, loading: false, error: null });
        return;
      }

      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      setState({
        user: data.user,
        loading: false,
        error: error ? "로그인 정보를 확인하지 못했습니다." : null,
      });
    };

    void loadUser();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setState({ user: session?.user ?? null, loading: false, error: null });
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async (callbackUrl = "/account") => {
    if (!isSupabaseConfigured) {
      setState((current) => ({ ...current, error: "Google 로그인이 아직 설정되지 않았습니다." }));
      return;
    }

    const safeCallback = callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/account";
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const redirectTo = `${window.location.origin}${basePath}/account/`;

    if (safeCallback !== "/account") {
      window.sessionStorage.setItem("droproom:auth-callback", safeCallback);
    }

    setState((current) => ({ ...current, loading: true, error: null }));
    const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { prompt: "select_account" },
      },
    });

    if (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: "Google 로그인을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      }));
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setState((current) => ({ ...current, loading: true, error: null }));
    const { error } = await getSupabaseBrowserClient().auth.signOut();
    setState({
      user: null,
      loading: false,
      error: error ? "로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요." : null,
    });
  }, []);

  return { ...state, configured: isSupabaseConfigured, signInWithGoogle, signOut };
}
