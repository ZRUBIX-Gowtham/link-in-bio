"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import styles from "../auth.module.css";
import ParticlesBackground from "@/components/ParticlesBackground";
import { Compass, AlertCircle, Info } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle, user, isDemoMode } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !name || !username) {
      setError("Please fill in all fields.");
      return;
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
    if (!usernameRegex.test(username)) {
      setError("Username must be between 3 and 16 characters and contain only letters, numbers, or underscores.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await register(email, password, username, name);
      showToast("Account created successfully!", "success");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create account. Username might be taken.");
      showToast("Registration failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      showToast("Signed in with Google!", "success");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to sign in with Google.");
      showToast("Google authentication failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <ParticlesBackground />
      <div className="bg-blob bg-blob-blue" />
      
      <div className={`${styles.authCard} glass-card`}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Compass className={styles.logoIcon} size={28} />
            <span>LinkNest</span>
          </div>
          <h2 className={styles.title}>Create Account</h2>
          <p className={styles.subtitle}>Claim your unique smart bio link today</p>
        </div>

        {isDemoMode && (
          <div className={styles.infoAlert}>
            <Info size={16} />
            <span>Demo Mode: Register to create a local profile!</span>
          </div>
        )}

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              placeholder="Gowtham"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Choose Username</label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--gray-600)",
                fontSize: 14,
                fontWeight: 600
              }}>
                linknest.app/
              </span>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                className={styles.input}
                style={{ paddingLeft: 106 }}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <button type="submit" className="neon-btn" disabled={loading} style={{ width: "100%" }}>
            {loading ? <span className={styles.loader}></span> : "Create Profile"}
          </button>
        </form>

        <div className={styles.socialAuth}>
          <div className={styles.divider}>Or Sign Up With</div>
          <button type="button" onClick={handleGoogleSignIn} className={styles.googleBtn} disabled={loading}>
            <svg className={styles.googleIcon} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Google OAuth
          </button>
        </div>

        <div className={styles.footer}>
          Already have an account?{" "}
          <Link href="/login" className={styles.footerLink}>
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
