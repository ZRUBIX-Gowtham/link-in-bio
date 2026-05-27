"use client";

import styles from "@/app/dashboard/dashboard.module.css";
import { BarChart3, Lock, Globe, Smartphone, Laptop, Sparkles } from "lucide-react";

export default function AnalyticsTab({ user, analytics, setTab }) {
  const isLocked = !user?.premium;

  // Calculate percentage of max value in dailyStats to scale bars
  const maxHits = analytics?.dailyStats
    ? Math.max(...analytics.dailyStats.map(d => d.visitors + d.clicks), 1)
    : 1;

  // Helpers to calculate percentages for items
  const renderPercentageRow = (label, count, total) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
      <div key={label} className={styles.percentRow}>
        <div className={styles.percentHeader}>
          <span>{label}</span>
          <span>{count} ({percentage}%)</span>
        </div>
        <div className={styles.percentTrack}>
          <div className={styles.percentFill} style={{ width: `${percentage}%` }} />
        </div>
      </div>
    );
  };

  // Browser list
  const browserList = Object.entries(analytics?.browsers || {}).sort((a,b) => b[1] - a[1]);
  const totalBrowsers = Object.values(analytics?.browsers || {}).reduce((sum, v) => sum + v, 0);

  // Device list
  const deviceList = Object.entries(analytics?.devices || {}).sort((a,b) => b[1] - a[1]);
  const totalDevices = Object.values(analytics?.devices || {}).reduce((sum, v) => sum + v, 0);

  // Country list
  const countryList = Object.entries(analytics?.countries || {}).sort((a,b) => b[1] - a[1]);
  const totalCountries = Object.values(analytics?.countries || {}).reduce((sum, v) => sum + v, 0);

  return (
    <div style={{ position: "relative" }}>
      {/* Locked overlay for free tier */}
      {isLocked && (
        <div 
          style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: "rgba(3, 3, 7, 0.7)", 
            backdropFilter: "blur(12px)", 
            WebkitBackdropFilter: "blur(12px)",
            zIndex: 10, 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: 20, 
            textAlign: "center",
            padding: 40,
            borderRadius: 16,
            border: "1px solid var(--card-border)"
          }}
        >
          <div 
            style={{ 
              width: 72, 
              height: 72, 
              borderRadius: "50%", 
              background: "rgba(0, 210, 255, 0.1)", 
              border: "1px solid rgba(0, 210, 255, 0.3)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              color: "var(--neon-blue)",
              boxShadow: "0 0 20px rgba(0, 210, 255, 0.2)"
            }}
          >
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Analytics are locked on your Free Plan</h2>
          <p style={{ color: "var(--gray-400)", maxWidth: 440, fontSize: 14, lineHeight: 1.6 }}>
            Upgrade to Pro to track your profiles visitors, link click counts, browser devices, geography distributions, and inspect daily statistics.
          </p>
          <button 
            onClick={() => setTab("premium")} 
            className="neon-btn"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Sparkles size={16} /> Upgrade to Premium for ₹99/mo
          </button>
        </div>
      )}

      {/* Main Analytics Layout - Blurred if locked */}
      <div style={{ filter: isLocked ? "blur(4px)" : "none", pointerEvents: isLocked ? "none" : "auto" }}>
        
        {/* Core summary card */}
        <div className={`${styles.analyticsCard} glass-card`} style={{ marginBottom: 32 }}>
          <h3 className={styles.cardTitle} style={{ marginBottom: 24 }}>Traffic Timeline (Past 7 Days)</h3>
          
          <div className={styles.barChartContainer}>
            {analytics?.dailyStats?.map((day) => {
              const totalVal = day.visitors + day.clicks;
              const heightPct = Math.max((totalVal / maxHits) * 100, 4); // min height
              return (
                <div key={day.date} className={styles.barColumn}>
                  <div 
                    className={styles.bar} 
                    style={{ height: `${heightPct}%` }}
                  >
                    <div className={styles.barTooltip}>
                      Visits: {day.visitors} | Clicks: {day.clicks}
                    </div>
                  </div>
                  <span className={styles.barLabel}>{day.label}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 16, fontSize: 12, color: "var(--gray-400)", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: "linear-gradient(var(--neon-blue), var(--neon-purple))" }} />
              <span>Visitor & Click Volume</span>
            </div>
          </div>
        </div>

        {/* Breakdown details */}
        <div className={styles.chartsGrid}>
          {/* Countries / Referrers */}
          <div className={`${styles.analyticsCard} glass-card`}>
            <h3 className={styles.cardTitle} style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <Globe size={18} style={{ color: "var(--neon-blue)" }} /> Top Countries
            </h3>
            <div className={styles.percentList}>
              {countryList.length > 0 ? (
                countryList.slice(0, 5).map(([country, val]) => renderPercentageRow(country, val, totalCountries))
              ) : (
                <p style={{ color: "var(--gray-600)", fontSize: 13 }}>No country stats available.</p>
              )}
            </div>
          </div>

          {/* Browser / Device breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div className={`${styles.analyticsCard} glass-card`}>
              <h3 className={styles.cardTitle} style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Laptop size={18} style={{ color: "var(--neon-purple)" }} /> Browsers
              </h3>
              <div className={styles.percentList}>
                {browserList.length > 0 ? (
                  browserList.slice(0, 3).map(([browser, val]) => renderPercentageRow(browser, val, totalBrowsers))
                ) : (
                  <p style={{ color: "var(--gray-600)", fontSize: 13 }}>No browser stats available.</p>
                )}
              </div>
            </div>

            <div className={`${styles.analyticsCard} glass-card`}>
              <h3 className={styles.cardTitle} style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Smartphone size={18} style={{ color: "var(--neon-pink)" }} /> Devices
              </h3>
              <div className={styles.percentList}>
                {deviceList.length > 0 ? (
                  deviceList.slice(0, 3).map(([device, val]) => renderPercentageRow(device, val, totalDevices))
                ) : (
                  <p style={{ color: "var(--gray-600)", fontSize: 13 }}>No device stats available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
