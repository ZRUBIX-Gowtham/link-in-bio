"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import styles from "@/app/dashboard/dashboard.module.css";
import { Lock, Sparkles, Check, Settings, Palette } from "lucide-react";
import { dbService } from "@/firebase/dbService";

export default function AppearanceTab({ user, onProfileUpdate, setTab }) {
  const { showToast } = useToast();
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Custom Theme Builder states
  const [bgType, setBgType] = useState("gradient"); // solid | gradient
  const [customBg, setCustomBg] = useState("linear-gradient(135deg, #120c1f 0%, #1a103c 100%)");
  const [customText, setCustomText] = useState("#ffffff");
  const [customAccent, setCustomAccent] = useState("#00d2ff");
  const [customBtnBg, setCustomBtnBg] = useState("rgba(0, 210, 255, 0.1)");
  const [customBtnBorder, setCustomBtnBorder] = useState("1px solid #00d2ff");
  const [customFont, setCustomFont] = useState("var(--font-outfit)");
  const [customBlur, setCustomBlur] = useState("12px");

  // Load themes
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const list = await dbService.getThemes();
        setThemes(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchThemes();
  }, []);

  // Update theme selection
  const handleSelectTheme = async (theme) => {
    if (theme.type === "premium" && !user?.premium) {
      showToast("Nebula, Carbon, Cyberpunk and other premium layouts are locked. Upgrade to unlock!", "warning");
      setTab("premium");
      return;
    }

    setLoading(true);
    try {
      await onProfileUpdate({ themeId: theme.id, customTheme: null });
      showToast(`Applied ${theme.name} theme!`, "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to apply theme.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Custom Theme Application for premium users
  const handleSaveCustomTheme = async () => {
    if (!user?.premium) {
      showToast("Custom Theme builder is a Pro feature. Upgrade now!", "warning");
      setTab("premium");
      return;
    }

    setLoading(true);
    try {
      const customThemeObj = {
        bg: customBg,
        text: customText,
        accent: customAccent,
        buttonBg: customBtnBg,
        buttonText: customAccent,
        buttonBorder: customBtnBorder,
        cardBg: `rgba(255, 255, 255, 0.03)`,
        font: customFont,
        blur: customBlur
      };
      
      await onProfileUpdate({ themeId: "custom", customTheme: customThemeObj });
      showToast("Custom theme applied successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to save custom theme.", "error");
    } finally {
      setLoading(false);
    }
  };

  const freeThemes = themes.filter(t => t.type === "free");
  const premiumThemes = themes.filter(t => t.type === "premium");

  return (
    <div>
      <p className={styles.contentSubtitle} style={{ marginBottom: 24 }}>
        Select a template or design your custom canvas layout to show off your links.
      </p>

      {/* Free themes section */}
      <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Free Themes (10 Standard)</h4>
      <div className={styles.themesGrid}>
        {freeThemes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => handleSelectTheme(theme)}
            className={`${styles.themeCard} ${user?.themeId === theme.id ? styles.themeCardActive : ""}`}
            style={{ background: theme.style?.bg }}
          >
            <span className={styles.themeName}>{theme.name}</span>
            {user?.themeId === theme.id && (
              <div style={{ position: "absolute", top: 12, right: 12, width: 20, height: 20, borderRadius: "50%", background: "var(--neon-blue)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                <Check size={12} color="#000000" strokeWidth={3} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Premium themes section */}
      <h4 style={{ fontWeight: 700, fontSize: 16, marginTop: 40, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        Premium Themes (20 Pro Styles) <Sparkles size={16} style={{ color: "var(--neon-blue)" }} />
      </h4>
      <div className={styles.themesGrid}>
        {premiumThemes.map((theme) => {
          const isActive = user?.themeId === theme.id;
          const isLocked = !user?.premium;
          return (
            <div
              key={theme.id}
              onClick={() => handleSelectTheme(theme)}
              className={`${styles.themeCard} ${isActive ? styles.themeCardActive : ""}`}
              style={{ background: theme.style?.bg }}
            >
              <span className={styles.themeName}>{theme.name}</span>
              
              {isLocked && (
                <div className={styles.themeLockedOverlay}>
                  <Lock size={16} />
                  <span>PRO LOCKED</span>
                </div>
              )}

              {isActive && !isLocked && (
                <div style={{ position: "absolute", top: 12, right: 12, width: 20, height: 20, borderRadius: "50%", background: "var(--neon-blue)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                  <Check size={12} color="#000000" strokeWidth={3} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Theme builder section */}
      <div className={`${styles.customBuilder} glass-card`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 className={styles.cardTitle} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Palette size={18} style={{ color: "var(--neon-purple)" }} /> Custom Canvas Builder
          </h3>
          {!user?.premium && (
            <span style={{ fontSize: 10, fontWeight: 800, background: "rgba(0, 210, 255, 0.1)", color: "var(--neon-blue)", border: "1px solid rgba(0, 210, 255, 0.2)", padding: "2px 8px", borderRadius: 100 }}>
              PRO FEATURE
            </span>
          )}
        </div>

        <p style={{ fontSize: 13, color: "var(--gray-400)", marginBottom: 24 }}>
          Fine-tune every detail of your theme including backgrounds, accent hues, borders, fonts, and card blurs.
        </p>

        <div className={styles.builderForm}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Background CSS/Color</label>
            <input
              type="text"
              value={customBg}
              onChange={(e) => setCustomBg(e.target.value)}
              className={styles.input}
              placeholder="linear-gradient(...) or #hex"
              disabled={!user?.premium}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Accent Highlight Color</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="color"
                value={customAccent}
                onChange={(e) => {
                  setCustomAccent(e.target.value);
                  setCustomBtnBorder(`1px solid ${e.target.value}`);
                  setCustomBtnBg(`${e.target.value}1a`);
                }}
                disabled={!user?.premium}
                style={{ width: 44, height: 44, border: "none", borderRadius: 8, cursor: "pointer", background: "none", padding: 0 }}
              />
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--gray-400)" }}>{customAccent}</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Text Color</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="color"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                disabled={!user?.premium}
                style={{ width: 44, height: 44, border: "none", borderRadius: 8, cursor: "pointer", background: "none", padding: 0 }}
              />
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--gray-400)" }}>{customText}</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Typography Font</label>
            <select
              value={customFont}
              onChange={(e) => setCustomFont(e.target.value)}
              className={styles.input}
              disabled={!user?.premium}
              style={{ background: "#1f1f2e" }}
            >
              <option value="var(--font-outfit)">Outfit</option>
              <option value="var(--font-mono)">JetBrains Mono</option>
              <option value="Arial, sans-serif">Arial Sans</option>
              <option value="Times New Roman, serif">Times serif</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
          <button
            onClick={handleSaveCustomTheme}
            className="neon-btn"
            disabled={loading}
            style={{ padding: "10px 20px", fontSize: 13 }}
          >
            Apply Custom Theme
          </button>
        </div>
      </div>
    </div>
  );
}
