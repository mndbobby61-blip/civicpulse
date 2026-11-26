"use client";
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "./lang-provider";
import LangToggle from "./lang-toggle";
import { loginAction, registerAction, type AuthState } from "@/lib/auth-actions";
import type { Key } from "@/lib/dict";

const ERR: Record<string, Key> = {
  invalid: "err_invalid",
  exists: "err_exists",
  fields: "err_fields",
  weak: "err_weak",
};
const DEMO = ["admin@civicpulse.test", "manager@civicpulse.test", "staff@civicpulse.test", "citizen@civicpulse.test"];

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t } = useLang();
  const isLogin = mode === "login";
  const [state, action, pending] = useActionState<AuthState, FormData>(
    isLogin ? loginAction : registerAction,
    {}
  );
  const [next, setNext] = useState("");

  useEffect(() => {
    setNext(new URLSearchParams(window.location.search).get("next") ?? "");
  }, []);

  // সফল হলে পুরো পেজ নতুন করে খোলে, যাতে নেভবার ও নোটিফিকেশন ঠিক অবস্থায় আসে
  useEffect(() => {
    if (state.to) window.location.assign(state.to);
  }, [state.to]);

  const other = `${isLogin ? "/register" : "/login"}${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <div className="cp-authpage">
      <div className="cp-authtop">
        <Link href="/" className="cp-logo">
          <svg viewBox="0 0 34 18" aria-hidden="true">
            <path d="M0 9h9l3-7 5 14 4-10 2 3h11" fill="none" stroke="var(--g2)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          CivicPulse
        </Link>
        <LangToggle />
      </div>

      <div className="cp-authwrap">
        <div className="cp-authcard">
          <h1>{isLogin ? t("auth_login") : t("auth_register")}</h1>
          <p className="sub">{isLogin ? t("auth_login_sub") : t("auth_reg_sub")}</p>

          <form action={action}>
            <input type="hidden" name="next" value={next} />
            {state.error && <p className="cp-err" role="alert">{t(ERR[state.error])}</p>}
            {!isLogin && (
              <label className="cp-field">
                <span>{t("auth_name")}</span>
                <input name="name" type="text" autoComplete="name" required />
              </label>
            )}
            <label className="cp-field">
              <span>{t("auth_email")}</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label className="cp-field">
              <span>{t("auth_pass")}</span>
              <input name="password" type="password" autoComplete={isLogin ? "current-password" : "new-password"} required />
              {!isLogin && <small>{t("auth_pass_hint")}</small>}
            </label>
            <button className="cp-btn cp-submit" disabled={pending || !!state.to}>
              {pending || state.to ? t("auth_wait") : isLogin ? t("auth_login") : t("auth_register")}
            </button>
          </form>

          <p className="cp-switch">
            {isLogin ? t("auth_no_acc") : t("auth_has_acc")}{" "}
            <Link href={other}>{isLogin ? t("auth_register") : t("auth_login")}</Link>
          </p>

          {isLogin && (
            <div className="cp-demo">
              <p>{t("auth_demo")}</p>
              {DEMO.map((e) => (<code key={e}>{e}</code>))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}