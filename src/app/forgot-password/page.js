"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import styles from "../auth.module.css";
import ParticlesBackground from "@/components/ParticlesBackground";
import { Compass, AlertCircle, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
      showToast("Reset email sent! Check your inbox.", "success");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send password reset email.");
      showToast("Password reset request failed.", "error");
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
          <h2 className={styles.title}>Reset Password</h2>
          <p className={styles.subtitle}>Enter your email to receive a recovery link</p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className={styles.infoAlert}>
            <Check size={16} />
            <span>Check your inbox for reset instructions.</span>
          </div>
        )}

        {!success ? (
          <form className={styles.form} onSubmit={handleSubmit}>
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

            <button type="submit" className="neon-btn" disabled={loading} style={{ width: "100%" }}>
              {loading ? <span className={styles.loader}></span> : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: "center" }}>
            <Link href="/login" className="neon-btn" style={{ width: "100%" }}>
              Return to Login
            </Link>
          </div>
        )}

        <div className={styles.footer}>
          Remember your password?{" "}
          <Link href="/login" className={styles.footerLink}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
