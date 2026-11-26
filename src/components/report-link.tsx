"use client";
import Link from "next/link";
import { useMe } from "./me-provider";

const HOME = { ADMIN: "/admin", MANAGER: "/manager", STAFF: "/staff", CITIZEN: "/citizen" } as const;

export default function ReportLink(props: Omit<React.ComponentPropsWithoutRef<"a">, "href">) {
  const { me } = useMe();
  const to = !me ? "/login?next=/issues/new" : me.role === "CITIZEN" ? "/issues/new" : HOME[me.role];
  return <Link href={to} {...props} />;
}