"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded border border-zinc-700 px-3 py-1 text-sm hover:bg-zinc-800"
    >
      Sign out
    </button>
  );
}
