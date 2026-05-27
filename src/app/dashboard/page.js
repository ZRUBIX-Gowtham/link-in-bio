"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import styles from "./dashboard.module.css";
import pageStyles from "../page.module.css";
import ParticlesBackground from "@/components/ParticlesBackground";
import { dbService } from "@/firebase/dbService";

// Tab Components
import OverviewTab from "@/components/dashboard/OverviewTab";
import LinksTab from "@/components/dashboard/LinksTab";
import AppearanceTab from "@/components/dashboard/AppearanceTab";
import AnalyticsTab from "@/components/dashboard/AnalyticsTab";
import PremiumTab from "@/components/dashboard/PremiumTab";
import SettingsTab from "@/components/dashboard/SettingsTab";
import AdminTab from "@/components/dashboard/AdminTab";

// Icons
import { 
  Compass, 
  BarChart3, 
  Link2, 
  Palette, 
  TrendingUp, 
  Award, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X,
  ShieldAlert,
  CheckCircle,
  ExternalLink,
  Instagram,
  Twitter,
  Github,
  MessageCircle,
  Eye,
  Copy
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading, logout, updateProfile, isDemoMode } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Dashboard states
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | links | appearance | analytics | premium | settings | admin
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [links, setLinks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [profileUrl, setProfileUrl] = useState("");

  // Sync session and redirect if guest
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load User Data & Analytics
  useEffect(() => {
    if (user) {
      setProfileUrl(`${window.location.origin}/${user.username}`);
      
      const loadDashboardData = async () => {
        try {
          const userLinks = await dbService.getUserLinks(user.uid);
          setLinks(userLinks);

          const stats = await dbService.getUserAnalytics(user.uid);
          setAnalytics(stats);
        } catch (err) {
          console.error("Error loading dashboard data:", err);
        }
      };
      loadDashboardData();
    }
  }, [user]);

  // Handle updates to user profile document
  const handleProfileUpdate = async (fields) => {
    try {
      const updated = await updateProfile(fields);
      // Reload analytics if username slug changed (re-maps references)
      if (fields.username) {
        setProfileUrl(`${window.location.origin}/${fields.username}`);
      }
      return updated;
    } catch (e) {
      throw e;
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast("Signed out successfully.", "info");
    router.push("/");
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && profileUrl) {
      navigator.clipboard.writeText(profileUrl);
      showToast("Link copied to clipboard!", "success");
    }
  };

  if (loading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#030307", color: "white", gap: 12 }}>
        <div className={styles.loader} style={{ width: 24, height: 24, borderTopColor: "var(--neon-blue)" }}></div>
        <span style={{ fontSize: 15, fontWeight: 500, color: "var(--gray-400)" }}>Loading User Workspace...</span>
      </div>
    );
  }

  // Active theme properties map for preview phone
  const themesMap = {
    "neon-blue": { bg: "radial-gradient(circle, #0a0a14 0%, #030308 100%)", text: "#e0e6ed", accent: "#00d2ff", cardBg: "rgba(10, 10, 25, 0.6)", cardBorder: "rgba(0, 210, 255, 0.2)", buttonBg: "rgba(0, 210, 255, 0.1)", buttonBorder: "1px solid #00d2ff", buttonText: "#00d2ff", font: "var(--font-outfit)" },
    "neon-purple": { bg: "radial-gradient(circle, #0f0214 0%, #060009 100%)", text: "#f3e8ff", accent: "#a855f7", cardBg: "rgba(20, 10, 30, 0.6)", cardBorder: "rgba(168, 85, 247, 0.2)", buttonBg: "rgba(168, 85, 247, 0.1)", buttonBorder: "1px solid #a855f7", buttonText: "#a855f7", font: "var(--font-outfit)" },
    "cyberpunk": { bg: "linear-gradient(135deg, #120c1f 0%, #1a103c 100%)", text: "#ffe200", accent: "#ff007f", cardBg: "rgba(255, 0, 127, 0.05)", cardBorder: "rgba(255, 0, 127, 0.3)", buttonBg: "#ff007f", buttonBorder: "none", buttonText: "#ffffff", font: "var(--font-outfit)" },
    "stripe-light": { bg: "#f6f9fc", text: "#1a1f36", accent: "#635bff", cardBg: "#ffffff", cardBorder: "none", buttonBg: "#635bff", buttonBorder: "none", buttonText: "#ffffff", font: "var(--font-outfit)" },
    "glass-dark": { bg: "linear-gradient(to bottom right, #0d0d1e, #141432)", text: "#ffffff", accent: "#ff6b6b", cardBg: "rgba(255, 255, 255, 0.03)", cardBorder: "rgba(255, 255, 255, 0.08)", buttonBg: "rgba(255, 255, 255, 0.05)", buttonBorder: "1px solid rgba(255, 255, 255, 0.1)", buttonText: "#ffffff", font: "var(--font-outfit)" },
    "forest": { bg: "linear-gradient(135deg, #0d1f14 0%, #050a06 100%)", text: "#e6f4ea", accent: "#34a853", cardBg: "rgba(13, 31, 20, 0.6)", cardBorder: "rgba(52, 168, 83, 0.2)", buttonBg: "rgba(52, 168, 83, 0.15)", buttonBorder: "1px solid #34a853", buttonText: "#81c995", font: "var(--font-outfit)" },
    "sunset": { bg: "linear-gradient(to bottom, #1f0d0d, #0d0303)", text: "#fff0eb", accent: "#ff9233", cardBg: "rgba(31, 13, 13, 0.7)", cardBorder: "rgba(255, 146, 51, 0.2)", buttonBg: "rgba(255, 146, 51, 0.1)", buttonBorder: "1px solid #ff9233", buttonText: "#ff9233", font: "var(--font-outfit)" },
    "minimal-dark": { bg: "#000000", text: "#888888", accent: "#ffffff", cardBg: "#050505", cardBorder: "1px solid #222222", buttonBg: "none", buttonBorder: "1px solid #222222", buttonText: "#ffffff", font: "var(--font-mono)" },
    "aurora": { bg: "linear-gradient(180deg, #07162c 0%, #0b3c5d 100%)", text: "#e2f1f6", accent: "#00ffd0", cardBg: "rgba(7, 22, 44, 0.7)", cardBorder: "rgba(0, 255, 208, 0.2)", buttonBg: "rgba(0, 255, 208, 0.1)", buttonBorder: "1px solid #00ffd0", buttonText: "#00ffd0", font: "var(--font-outfit)" },
    "rose": { bg: "#fff5f5", text: "#702459", accent: "#d53f8c", cardBg: "#ffffff", cardBorder: "none", buttonBg: "#d53f8c", buttonBorder: "none", buttonText: "#ffffff", font: "var(--font-outfit)" }
  };

  const getActiveThemeStyle = () => {
    if (user.themeId === "custom" && user.customTheme) {
      return user.customTheme;
    }
    return themesMap[user.themeId] || themesMap["neon-blue"];
  };

  const activeTheme = getActiveThemeStyle();

  return (
    <div className={styles.container}>
      <ParticlesBackground />
      
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logo}>
            <Compass className={styles.logoIcon} size={24} />
            <span>LinkNest</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={styles.menuToggle}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navMobileOpen : ""}`}>
          <div 
            onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }} 
            className={`${styles.navItem} ${activeTab === "dashboard" ? styles.navItemActive : ""}`}
          >
            <BarChart3 size={16} /> Dashboard
          </div>
          <div 
            onClick={() => { setActiveTab("links"); setMobileMenuOpen(false); }} 
            className={`${styles.navItem} ${activeTab === "links" ? styles.navItemActive : ""}`}
          >
            <Link2 size={16} /> My Links
          </div>
          <div 
            onClick={() => { setActiveTab("appearance"); setMobileMenuOpen(false); }} 
            className={`${styles.navItem} ${activeTab === "appearance" ? styles.navItemActive : ""}`}
          >
            <Palette size={16} /> Appearance
          </div>
          <div 
            onClick={() => { setActiveTab("analytics"); setMobileMenuOpen(false); }} 
            className={`${styles.navItem} ${activeTab === "analytics" ? styles.navItemActive : ""}`}
          >
            <TrendingUp size={16} /> Analytics
          </div>
          <div 
            onClick={() => { setActiveTab("premium"); setMobileMenuOpen(false); }} 
            className={`${styles.navItem} ${activeTab === "premium" ? styles.navItemActive : ""}`}
          >
            <Award size={16} /> Premium Plan
          </div>
          <div 
            onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }} 
            className={`${styles.navItem} ${activeTab === "settings" ? styles.navItemActive : ""}`}
          >
            <SettingsIcon size={16} /> Settings
          </div>
          {/* Admin tab is available to anyone in local demo mode, or if email is admin@linknest.com in firebase */}
          {(isDemoMode || user.email === "admin@linknest.com") && (
            <div 
              onClick={() => { setActiveTab("admin"); setMobileMenuOpen(false); }} 
              className={`${styles.navItem} ${activeTab === "admin" ? styles.navItemActive : ""}`}
              style={{ color: "var(--neon-pink)", borderColor: activeTab === "admin" ? "var(--neon-pink)" : "transparent" }}
            >
              <ShieldAlert size={16} /> Admin Sandbox
            </div>
          )}
        </nav>

        <div className={`${styles.sidebarFooter} ${mobileMenuOpen ? styles.sidebarFooterMobileOpen : ""}`}>
          <div className={styles.profileCard}>
            <div className={styles.avatar}>
              {user.avatar ? <img src={user.avatar} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : user.name?.substring(0, 2).toUpperCase()}
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{user.name}</span>
              {user.premium ? (
                <span className={styles.premiumBadge}>Pro Tier</span>
              ) : (
                <span className={styles.freeBadge}>Free Tier</span>
              )}
            </div>
          </div>
          <div onClick={handleLogout} className={styles.navItem} style={{ color: "#f87171" }}>
            <LogOut size={16} /> Sign Out
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className={styles.mainContent}>
        {/* Workspace Title Header */}
        <div className={styles.contentHeader}>
          <div className={styles.titleArea}>
            <h1 className={styles.contentTitle}>
              {activeTab === "dashboard" && "Workspace Overview"}
              {activeTab === "links" && "Link Management"}
              {activeTab === "appearance" && "Custom Themes"}
              {activeTab === "analytics" && "Profile Analytics"}
              {activeTab === "premium" && "Billing & Upgrade"}
              {activeTab === "settings" && "Integrations & Setup"}
              {activeTab === "admin" && "Administrative Sandbox"}
            </h1>
            <p className={styles.contentSubtitle}>
              {activeTab === "dashboard" && "Overview statistics and configurations for your bio links."}
              {activeTab === "links" && "Create, edit, toggle, or rearrange your button cards."}
              {activeTab === "appearance" && "Select templates, fonts, accents, and custom gradient skins."}
              {activeTab === "analytics" && "Inspect country demographics, click counts, devices, and traffic flow."}
              {activeTab === "premium" && "Manage subscription orders and unlock premium whitelists."}
              {activeTab === "settings" && "Save profile bios, avatar icons, custom domain records and socials."}
              {activeTab === "admin" && "Control local user records, issue bans and manage plan memberships."}
            </p>
          </div>

          <div className={styles.headerActions}>
            <span style={{ fontSize: 13, color: "var(--gray-400)", fontFamily: "var(--font-mono)" }}>
              linknest.app/{user.username}
            </span>
            <button onClick={handleCopyLink} className="neon-btn-secondary" style={{ padding: "8px 12px", fontSize: 12 }}>
              Copy Link
            </button>
            <Link href={`/${user.username}`} target="_blank" className="neon-btn" style={{ padding: "8px 12px", fontSize: 12 }}>
              <Eye size={14} /> Visit Page
            </Link>
          </div>
        </div>

        {/* Content Layout (Double column if editing links) */}
        {activeTab === "links" ? (
          <div className={styles.linksLayout}>
            <LinksTab 
              user={user} 
              links={links} 
              onLinksChange={setLinks} 
              setTab={setActiveTab} 
            />

            {/* STICKY LIVE MOCKUP PREVIEW */}
            <div className={styles.previewPhoneSticky}>
              <div 
                className={pageStyles.phoneMockup}
                style={{
                  background: activeTheme.bg,
                  color: activeTheme.text,
                  fontFamily: activeTheme.font || "var(--font-sans)",
                }}
              >
                <div className={pageStyles.phoneCamera} />
                
                <div className={pageStyles.mockupProfile}>
                  <div className={pageStyles.mockupAvatar}>
                    {user.avatar ? (
                      <img src={user.avatar} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      user.name?.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <h3 className={pageStyles.mockupName}>
                    {user.name}
                    {user.premium && (
                      <span className={pageStyles.verifiedBadge}>
                        <CheckCircle size={14} fill="var(--neon-blue)" stroke="#030308" />
                      </span>
                    )}
                  </h3>
                  <p className={pageStyles.mockupBio}>{user.bio}</p>
                </div>

                <div className={pageStyles.mockupLinks}>
                  {links.filter(l => l.enabled).map((link) => (
                    <div
                      key={link.id}
                      className={pageStyles.mockupLink}
                      style={{
                        background: activeTheme.buttonBg,
                        border: activeTheme.buttonBorder,
                        color: activeTheme.buttonText,
                        fontFamily: activeTheme.font || "var(--font-sans)",
                        boxShadow: activeTheme.glow ? activeTheme.glow : "none"
                      }}
                    >
                      <span>{link.title}</span>
                      <ExternalLink size={12} />
                    </div>
                  ))}
                </div>

                <div className={pageStyles.mockupSocials}>
                  {user.socialLinks?.instagram && <span className={pageStyles.mockupSocialIcon}><Instagram size={14} /></span>}
                  {user.socialLinks?.twitter && <span className={pageStyles.mockupSocialIcon}><Twitter size={14} /></span>}
                  {user.socialLinks?.github && <span className={pageStyles.mockupSocialIcon}><Github size={14} /></span>}
                  {user.socialLinks?.whatsapp && <span className={pageStyles.mockupSocialIcon}><MessageCircle size={14} /></span>}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div>
            {activeTab === "dashboard" && <OverviewTab user={user} analytics={analytics} links={links} />}
            {activeTab === "appearance" && <AppearanceTab user={user} onProfileUpdate={handleProfileUpdate} setTab={setActiveTab} />}
            {activeTab === "analytics" && <AnalyticsTab user={user} analytics={analytics} setTab={setActiveTab} />}
            {activeTab === "premium" && <PremiumTab user={user} onProfileUpdate={handleProfileUpdate} />}
            {activeTab === "settings" && <SettingsTab user={user} onProfileUpdate={handleProfileUpdate} setTab={setActiveTab} />}
            {activeTab === "admin" && <AdminTab />}
          </div>
        )}
      </main>
    </div>
  );
}
