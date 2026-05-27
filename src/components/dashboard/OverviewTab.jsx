"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/context/ToastContext";
import styles from "@/app/dashboard/dashboard.module.css";
import { 
  BarChart3, 
  MousePointerClick, 
  Sparkles, 
  QrCode, 
  Check, 
  Copy, 
  FileText, 
  User, 
  Link2 
} from "lucide-react";

export default function OverviewTab({ user, analytics, links }) {
  const { showToast } = useToast();
  const [profileUrl, setProfileUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      setProfileUrl(`${window.location.origin}/${user.username}`);
    }
  }, [user]);

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && profileUrl) {
      navigator.clipboard.writeText(profileUrl);
      showToast("Profile link copied to clipboard!", "success");
    }
  };

  // Calculate profile completion metrics
  const completionTasks = [
    { label: "Set up your bio details", completed: !!(user?.bio && user.bio !== "Welcome to my LinkNest! 🚀") },
    { label: "Add at least one link card", completed: links && links.length > 0 },
    { label: "Link a social network account", completed: !!(user?.socialLinks && Object.values(user.socialLinks).some(v => v !== "")) },
    { label: "Upload a custom avatar picture", completed: !!user?.avatar },
    { label: "Upgrade to premium subscription", completed: !!user?.premium }
  ];

  const completedCount = completionTasks.filter(t => t.completed).length;
  const completionPercentage = Math.round((completedCount / completionTasks.length) * 100);

  return (
    <div>
      {/* Top Aggregated Metrics */}
      <div className={styles.widgetsGrid}>
        <div className={`${styles.widget} glass-card`}>
          <div className={styles.widgetIcon}>
            <BarChart3 size={20} />
          </div>
          <div className={styles.widgetDetails}>
            <span className={styles.widgetVal}>{analytics?.totalVisitors || 0}</span>
            <span className={styles.widgetLabel}>Profile Visitors</span>
          </div>
        </div>

        <div className={`${styles.widget} glass-card`}>
          <div className={styles.widgetIcon} style={{ color: "var(--neon-purple)", background: "rgba(168, 85, 247, 0.08)" }}>
            <MousePointerClick size={20} />
          </div>
          <div className={styles.widgetDetails}>
            <span className={styles.widgetVal}>{analytics?.totalClicks || 0}</span>
            <span className={styles.widgetLabel}>Total Link Clicks</span>
          </div>
        </div>

        <div className={`${styles.widget} glass-card`}>
          <div className={styles.widgetIcon} style={{ color: "var(--neon-pink)", background: "rgba(255, 0, 127, 0.08)" }}>
            <Sparkles size={20} />
          </div>
          <div className={styles.widgetDetails}>
            <span className={styles.widgetVal}>
              {analytics?.totalVisitors > 0 
                ? `${Math.round(((analytics?.totalClicks || 0) / analytics.totalVisitors) * 100)}%` 
                : "0%"
              }
            </span>
            <span className={styles.widgetLabel}>Click-Through Rate</span>
          </div>
        </div>
      </div>

      {/* Grid: QR Code & Completion Card */}
      <div className={styles.overviewLayout}>
        {/* Left Side: Top Link & Profile Completion */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Top Performing Link Card */}
          <div className="glass-card" style={{ padding: 30 }}>
            <h3 className={styles.cardTitle} style={{ marginBottom: 16 }}>Top Performing Link</h3>
            {analytics?.topLink ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                    {analytics.topLink.title}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--gray-400)" }}>
                    {analytics.topLink.url}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 20, color: "var(--neon-blue)" }}>
                    {analytics.topLink.clicks}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--gray-600)" }}>clicks</div>
                </div>
              </div>
            ) : (
              <p style={{ color: "var(--gray-600)", fontSize: 14 }}>
                No link clicks recorded yet. Share your bio page to gather analytics!
              </p>
            )}
          </div>

          {/* Profile Completion Card */}
          <div className={`${styles.completionCard} glass-card`}>
            <div className={styles.cardHeader} style={{ marginBottom: 16, borderBottom: "none", paddingBottom: 0 }}>
              <h3 className={styles.cardTitle}>Profile Completion</h3>
              <span style={{ fontWeight: 800, color: "var(--neon-blue)", fontSize: 16 }}>{completionPercentage}%</span>
            </div>
            
            <div style={{ height: 6, background: "var(--gray-700)", borderRadius: 10, overflow: "hidden", marginBottom: 24 }}>
              <div 
                style={{ 
                  height: "100%", 
                  background: "linear-gradient(90deg, var(--neon-blue), var(--neon-purple))", 
                  width: `${completionPercentage}%`,
                  transition: "width 0.5s ease" 
                }} 
              />
            </div>

            <div className={styles.completionList}>
              {completionTasks.map((t, idx) => (
                <div key={idx} className={styles.completionItem}>
                  {t.completed ? (
                    <Check size={16} className={styles.completedTask} />
                  ) : (
                    <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--gray-700)" }} />
                  )}
                  <span style={{ textDecoration: t.completed ? "none" : "none", color: t.completed ? "#ffffff" : "var(--gray-400)" }}>
                    {t.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: QR Code Generator Card */}
        <div className={`${styles.qrCard} glass-card`}>
          <div className={styles.widgetIcon} style={{ width: 60, height: 60, borderRadius: 16 }}>
            <QrCode size={28} />
          </div>
          <div>
            <h3 className={styles.cardTitle} style={{ marginBottom: 8 }}>Your Bio QR Code</h3>
            <p style={{ fontSize: 13, color: "var(--gray-400)", maxWidth: 220, margin: "0 auto" }}>
              Download or copy your custom code to share offline, on business cards, or flyers.
            </p>
          </div>

          <div className={styles.qrContainer}>
            {profileUrl ? (
              <QRCodeSVG 
                value={profileUrl} 
                size={160} 
                level={"H"}
                fgColor="#030307"
                imageSettings={{
                  src: "/favicon.ico",
                  x: null,
                  y: null,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            ) : (
              <div style={{ width: 160, height: 160, background: "#f3f4f6" }} />
            )}
          </div>

          <div style={{ display: "flex", gap: 12, width: "100%", marginTop: 12 }}>
            <button 
              onClick={handleCopyLink} 
              className="neon-btn-secondary" 
              style={{ flexGrow: 1, padding: "10px 16px", fontSize: 13 }}
            >
              <Copy size={14} /> Copy URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
