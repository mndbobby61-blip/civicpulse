"use client";
import { logoutAction } from "@/lib/auth-actions";
import { useLang } from "./lang-provider";

export default function LogoutButton() {
  const { t } = useLang();
  return (
    <button
      className="cp-btn ghost"
      style={{ padding: "10px 20px" }}
      onClick={async () => {
        await logoutAction();
        window.location.assign("/");
      }}
    >
      {t("logout")}
    </button>
  );
}