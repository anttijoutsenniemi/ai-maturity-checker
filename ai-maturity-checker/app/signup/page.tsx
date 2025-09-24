"use client";

import { useState } from "react";
import Link from "next/link";
import { validateCredentials } from "@/utils/validation";
import styles from "../../styles/Auth.module.css";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateCredentials(email, password, repeatPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, repeatPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sign up failed");
      } else {
        setSuccess(data.message);
        window.location.href = "/home";
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Sign Up</h1>

        <input
          className={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          className={styles.input}
          type="password"
          placeholder="Repeat Password"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          required
        />

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Create Account"}
        </button>

        <p className={styles.switchText}>
          Already have an account?{" "}
          <Link href="/signin" className={styles.link}>
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
