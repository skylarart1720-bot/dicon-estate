"use client";

import { LockKeyhole, LogIn } from "lucide-react";
import { FormEvent, useState } from "react";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const result = await response.json();
    if (response.ok) window.location.reload();
    else setError(result.error ?? "Login failed.");
    setBusy(false);
  }

  return <main className="admin-login-page"><form className="admin-login-card" onSubmit={submit}><div className="admin-login-icon"><LockKeyhole size={22} /></div><p className="eyebrow">Dicon Estate admin</p><h1>Private workspace.</h1><p>Enter the administrator password to manage live media and listings.</p><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>{error && <div className="admin-login-error">{error}</div>}<button type="submit" disabled={busy}>{busy ? "Checking access" : "Log in"} <LogIn size={16} /></button></form></main>;
}
