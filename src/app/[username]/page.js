"use client";

import { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import styles from "./profile.module.css";
import ParticlesBackground from "@/components/ParticlesBackground";
import { dbService } from "@/firebase/dbService";
import { 
  Globe, 
  Github, 
  Youtube, 
  Twitter, 
  Instagram, 
  Coffee, 
  Briefcase, 
  DollarSign, 
  MessageCircle, 
  CheckCircle,
  ExternalLink,
  Music,
  Palette,
  AlertOctagon,
  Copy,
  Check,
  X,
  Play,
  Pause
} from "lucide-react";

// Helper mapping Lucide icon names to React nodes
const getIconComponent = (name, size = 18) => {
  switch (name) {
    case "Github": return <Github size={size} />;
    case "Youtube": return <Youtube size={size} />;
    case "Twitter": return <Twitter size={size} />;
    case "Instagram": return <Instagram size={size} />;
    case "Coffee": return <Coffee size={size} />;
    case "Briefcase": return <Briefcase size={size} />;
    case "DollarSign": return <DollarSign size={size} />;
    case "MessageCircle": return <MessageCircle size={size} />;
    default: return <Globe size={size} />;
  }
};

export default function PublicProfilePage({ params }) {
  // Await the params object in Next.js 15
  const resolvedParams = use(params);
  const username = resolvedParams.username;

  const { showToast } = useToast();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overrideTheme, setOverrideTheme] = useState(null);
  
  // Modals & music states
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Parse browser/device metadata for analytics
  const getVisitorDetails = () => {
    if (typeof window === "undefined") return {};
    const ua = navigator.userAgent;
    let device = "Desktop";
    if (/mobile/i.test(ua)) device = "Mobile";
    else if (/tablet|ipad/i.test(ua)) device = "Tablet";

    let browser = "Chrome";
    if (/firefox/i.test(ua)) browser = "Firefox";
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
    else if (/edge/i.test(ua)) browser = "Edge";

    return {
      device,
      browser,
      country: "India", // standard mock default
      referrer: document.referrer || "Direct"
    };
  };

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await dbService.getProfileByUsername(username);
        if (data) {
          setProfileData(data);
          
          // Log visitor event
          const details = getVisitorDetails();
          await dbService.recordVisitor(username, details);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [username]);

  // Handle music player toggle
  const handleToggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => {
        console.warn("Audio play blocked by browser autoplay settings:", e);
        showToast("Click anywhere on page first to allow music!", "info");
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Handle clicks on link cards
  const handleLinkClick = async (link) => {
    try {
      const details = getVisitorDetails();
      await dbService.recordLinkClick(username, link.id, details);
    } catch (e) {
      console.error(e);
    }

    if (link.openNewTab !== false) {
      window.open(link.url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = link.url;
    }
  };

  // Copy UPI address
  const handleCopyUpi = () => {
    if (profileData?.user?.socialLinks?.upi) {
      navigator.clipboard.writeText(profileData.user.socialLinks.upi);
      setIsCopied(true);
      showToast("UPI address copied!", "success");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#030307", color: "white" }}>
        <div style={{ display: "inline-block", width: 24, height: 24, border: "2px solid rgba(255, 255, 255, 0.3)", borderRadius: "50%", borderTopColor: "var(--neon-blue)", animation: "spin 0.8s linear infinite" }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not Found View
  if (!profileData) {
    return (
      <div className={styles.bannedContainer} style={{ background: "#030307", color: "#ffffff" }}>
        <ParticlesBackground />
        <AlertOctagon size={48} style={{ color: "var(--neon-blue)", filter: "drop-shadow(0 0 10px rgba(0,210,255,0.3))" }} />
        <h1 style={{ fontWeight: 800, fontSize: 28 }}>Profile Not Found</h1>
        <p style={{ color: "var(--gray-400)", maxWidth: 360, fontSize: 14 }}>
          The bio link you are trying to visit is not registered yet. Claim this handle now!
        </p>
        <Link href="/register" className="neon-btn" style={{ marginTop: 8 }}>
          Create your LinkNest Bio
        </Link>
      </div>
    );
  }

  const { user, links } = profileData;

  // Banned View
  if (user.banned) {
    return (
      <div className={styles.bannedContainer} style={{ background: "#030307", color: "#ffffff" }}>
        <ParticlesBackground />
        <AlertOctagon size={48} className={styles.bannedIcon} />
        <h1 style={{ fontWeight: 800, fontSize: 26 }}>Profile Suspended</h1>
        <p style={{ color: "var(--gray-400)", maxWidth: 360, fontSize: 14 }}>
          This account is temporarily suspended due to a violation of our community guidelines.
        </p>
        <Link href="/" className="neon-btn-secondary" style={{ marginTop: 8 }}>
          Back to Home
        </Link>
      </div>
    );
  }

  // Pre-configured themes configurations
  const profileThemes = {
    "neon-blue": { bg: "radial-gradient(circle, #0a0a14 0%, #030308 100%)", text: "#e0e6ed", accent: "#00d2ff", cardBg: "rgba(10, 10, 25, 0.6)", cardBorder: "rgba(0, 210, 255, 0.2)", buttonBg: "rgba(0, 210, 255, 0.08)", buttonBorder: "1px solid #00d2ff", buttonText: "#00d2ff", font: "var(--font-outfit)" },
    "neon-purple": { bg: "radial-gradient(circle, #0f0214 0%, #060009 100%)", text: "#f3e8ff", accent: "#a855f7", cardBg: "rgba(20, 10, 30, 0.6)", cardBorder: "rgba(168, 85, 247, 0.2)", buttonBg: "rgba(168, 85, 247, 0.08)", buttonBorder: "1px solid #a855f7", buttonText: "#a855f7", font: "var(--font-outfit)" },
    "cyberpunk": { bg: "linear-gradient(135deg, #120c1f 0%, #1a103c 100%)", text: "#ffe200", accent: "#ff007f", cardBg: "rgba(255, 0, 127, 0.04)", cardBorder: "rgba(255, 0, 127, 0.3)", buttonBg: "#ff007f", buttonBorder: "none", buttonText: "#ffffff", font: "var(--font-outfit)", glow: "0 0 12px rgba(255,0,127,0.4)" },
    "glass-dark": { bg: "linear-gradient(to bottom right, #0d0d1e, #141432)", text: "#ffffff", accent: "#ff6b6b", cardBg: "rgba(255, 255, 255, 0.02)", cardBorder: "rgba(255, 255, 255, 0.07)", buttonBg: "rgba(255, 255, 255, 0.04)", buttonBorder: "1px solid rgba(255, 255, 255, 0.1)", buttonText: "#ffffff", font: "var(--font-outfit)" },
    "sunset": { bg: "linear-gradient(to bottom, #1f0d0d, #0d0303)", text: "#fff0eb", accent: "#ff9233", cardBg: "rgba(31, 13, 13, 0.7)", cardBorder: "rgba(255, 146, 51, 0.2)", buttonBg: "rgba(255, 146, 51, 0.08)", buttonBorder: "1px solid #ff9233", buttonText: "#ff9233", font: "var(--font-outfit)" }
  };

  const getProfileTheme = () => {
    if (overrideTheme) return profileThemes[overrideTheme];
    if (user.themeId === "custom" && user.customTheme) return user.customTheme;
    return profileThemes[user.themeId] || profileThemes["neon-blue"];
  };

  const activeTheme = getProfileTheme();

  return (
    <div 
      className={styles.container}
      style={{
        background: activeTheme.bg,
        color: activeTheme.text,
        fontFamily: activeTheme.font || "var(--font-sans)"
      }}
    >
      <ParticlesBackground />
      <audio 
        ref={audioRef} 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" 
        loop
      />

      <div className={styles.profileCard}>
        {/* Profile details */}
        <header className={styles.header}>
          <div className={styles.avatar} style={{ borderColor: activeTheme.accent }}>
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              user.name?.substring(0, 2).toUpperCase()
            )}
          </div>
          
          <h1 className={styles.name}>
            {user.name}
            {user.premium && (
              <span className={styles.verified}>
                <CheckCircle size={18} fill={activeTheme.accent} stroke={activeTheme.bg.includes("#") ? activeTheme.bg : "#030308"} />
              </span>
            )}
          </h1>
          <p style={{ fontSize: 13, opacity: 0.6, marginTop: -4 }}>@{user.username}</p>
          {user.bio && <p className={styles.bio}>{user.bio}</p>}
        </header>

        {/* Links listing */}
        <div className={styles.linksList}>
          {links.map((link, idx) => (
            <div
              key={link.id}
              onClick={() => handleLinkClick(link)}
              className={styles.linkCard}
              style={{
                background: activeTheme.buttonBg,
                border: activeTheme.buttonBorder,
                color: activeTheme.buttonText,
                fontFamily: activeTheme.font || "var(--font-sans)",
                animationDelay: `${idx * 0.1}s`,
                boxShadow: activeTheme.glow ? activeTheme.glow : "none"
              }}
            >
              <div className={styles.linkTitle}>
                {getIconComponent(link.icon, 18)}
                <span>{link.title}</span>
              </div>
              <ExternalLink size={14} style={{ opacity: 0.8 }} />
            </div>
          ))}
        </div>

        {/* Contact/Social Integrations Row */}
        <div className={styles.socialsRow} style={{ animationDelay: `${links.length * 0.1}s` }}>
          {/* WhatsApp Direct Integration */}
          {user.socialLinks?.whatsapp && (
            <a 
              href={`https://wa.me/${user.socialLinks.whatsapp}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.socialIcon}
              style={{ background: activeTheme.buttonBg, border: activeTheme.buttonBorder, color: activeTheme.buttonText }}
            >
              <MessageCircle size={18} />
            </a>
          )}

          {/* UPI checkout Integration */}
          {user.socialLinks?.upi && (
            <button 
              onClick={() => setShowUpiModal(true)} 
              className={styles.socialIcon}
              style={{ background: activeTheme.buttonBg, border: activeTheme.buttonBorder, color: activeTheme.buttonText }}
            >
              <DollarSign size={18} />
            </button>
          )}

          {/* Other standard socials */}
          {user.socialLinks?.instagram && (
            <a 
              href={`https://instagram.com/${user.socialLinks.instagram}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.socialIcon}
              style={{ background: activeTheme.buttonBg, border: activeTheme.buttonBorder, color: activeTheme.buttonText }}
            >
              <Instagram size={18} />
            </a>
          )}

          {user.socialLinks?.twitter && (
            <a 
              href={`https://twitter.com/${user.socialLinks.twitter}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.socialIcon}
              style={{ background: activeTheme.buttonBg, border: activeTheme.buttonBorder, color: activeTheme.buttonText }}
            >
              <Twitter size={18} />
            </a>
          )}

          {user.socialLinks?.github && (
            <a 
              href={`https://github.com/${user.socialLinks.github}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.socialIcon}
              style={{ background: activeTheme.buttonBg, border: activeTheme.buttonBorder, color: activeTheme.buttonText }}
            >
              <Github size={18} />
            </a>
          )}

          {user.socialLinks?.youtube && (
            <a 
              href={user.socialLinks.youtube} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.socialIcon}
              style={{ background: activeTheme.buttonBg, border: activeTheme.buttonBorder, color: activeTheme.buttonText }}
            >
              <Youtube size={18} />
            </a>
          )}
        </div>

        {/* Brand Banner (removable if Pro) */}
        {!user.premium && (
          <div className={styles.brandingFooter}>
            <span>Create your own page with</span>
            <Link href="/" className={styles.brandingLink}>LinkNest</Link>
          </div>
        )}
      </div>

      {/* Floating Controls Dashboard */}
      <div className={styles.floatingControls}>
        {/* Lofi Beat player */}
        <button 
          onClick={handleToggleMusic} 
          className={styles.controlBtn}
          title="Background Lofi Beats"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <div className={styles.controlDivider} />

        {/* Mini Theme overrides bubbler */}
        <div className={styles.profileThemeBubbles} title="Switch Profile Theme View">
          {["neon-blue", "neon-purple", "cyberpunk", "glass-dark"].map((themeId) => (
            <button
              key={themeId}
              onClick={() => {
                setOverrideTheme(themeId);
                showToast(`Switched view to ${themeId.replace("-", " ")}!`, "info");
              }}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                background: 
                  themeId === "neon-blue" ? "#00d2ff" :
                  themeId === "neon-purple" ? "#a855f7" :
                  themeId === "cyberpunk" ? "#ff007f" : "#ffffff",
                outline: overrideTheme === themeId ? "1.5px solid #ffffff" : "none",
                outlineOffset: "1px"
              }}
            />
          ))}
        </div>
      </div>

      {/* UPI Checkout Payment Dialog popup */}
      {showUpiModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUpiModal(false)}>
          <div 
            className={`${styles.modalContent} glass-card`} 
            onClick={(e) => e.stopPropagation()}
            style={{ borderColor: activeTheme.accent }}
          >
            <button onClick={() => setShowUpiModal(false)} className={styles.modalClose}>
              <X size={18} />
            </button>
            <div style={{ color: activeTheme.accent }}><DollarSign size={32} /></div>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: 18 }}>Support {user.name}</h3>
              <p style={{ fontSize: 13, color: "var(--gray-400)", marginTop: 6 }}>
                Scan or send support payments directly to their UPI address below.
              </p>
            </div>

            <div style={{ background: "#09090e", border: "1px solid var(--card-border)", borderRadius: 12, padding: "16px 24px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "#ffffff" }}>
                {user.socialLinks.upi}
              </span>
              <button 
                onClick={handleCopyUpi} 
                className="neon-btn-secondary" 
                style={{ padding: "6px 12px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}
              >
                {isCopied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                {isCopied ? "Copied" : "Copy"}
              </button>
            </div>
            
            <p style={{ fontSize: 11, color: "var(--gray-600)" }}>
              Direct UPI transfer. 100% of support reaches the creator directly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
