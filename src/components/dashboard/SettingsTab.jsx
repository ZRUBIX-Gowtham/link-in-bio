"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import styles from "@/app/dashboard/dashboard.module.css";
import { 
  User, 
  Lock, 
  Globe, 
  MessageCircle, 
  CreditCard, 
  Save, 
  Instagram, 
  Twitter, 
  Github, 
  Youtube, 
  Music,
  KeyRound,
  CheckCircle,
  Copy
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SettingsTab({ user, onProfileUpdate, setTab }) {
  const { showToast } = useToast();
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);

  // Profile forms
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  // Social Links forms
  const [whatsapp, setWhatsapp] = useState(user?.socialLinks?.whatsapp || "");
  const [upi, setUpi] = useState(user?.socialLinks?.upi || "");
  const [instagram, setInstagram] = useState(user?.socialLinks?.instagram || "");
  const [twitter, setTwitter] = useState(user?.socialLinks?.twitter || "");
  const [github, setGithub] = useState(user?.socialLinks?.github || "");
  const [youtube, setYoutube] = useState(user?.socialLinks?.youtube || "");
  const [spotify, setSpotify] = useState(user?.socialLinks?.spotify || "");

  // Custom Domain forms
  const [customDomain, setCustomDomain] = useState(user?.customDomain || "");
  const [dnsVerified, setDnsVerified] = useState(!!user?.customDomain);

  // Update Profile details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      showToast("Name and username cannot be blank.", "warning");
      return;
    }

    setLoading(true);
    try {
      const updated = await onProfileUpdate({
        name: name.trim(),
        username: username.trim().toLowerCase().replace(/\s+/g, ""),
        bio: bio.trim(),
        avatar: avatar.trim()
      });
      showToast("Profile settings saved!", "success");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to update profile details.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update Social Links integrations
  const handleSaveSocialLinks = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onProfileUpdate({
        socialLinks: {
          whatsapp: whatsapp.trim(),
          upi: upi.trim(),
          instagram: instagram.trim(),
          twitter: twitter.trim(),
          github: github.trim(),
          youtube: youtube.trim(),
          spotify: spotify.trim()
        }
      });
      showToast("Social links integrations updated!", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to save integrations.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Trigger password reset email
  const handlePasswordReset = async () => {
    setLoading(true);
    try {
      await resetPassword(user.email);
      showToast("Password reset link sent to your email!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to send reset link.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Save Custom Domain mapping
  const handleSaveDomain = async (e) => {
    e.preventDefault();
    if (!user?.premium) {
      showToast("Custom Domain mapping is a Pro feature. Upgrade now!", "warning");
      setTab("premium");
      return;
    }

    setLoading(true);
    try {
      const domainVal = customDomain.trim().toLowerCase();
      await onProfileUpdate({ customDomain: domainVal });
      setDnsVerified(!!domainVal);
      showToast(domainVal ? "Custom domain updated! Setup DNS configuration." : "Custom domain removed.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to map custom domain.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      
      {/* 1. Core Profile Details */}
      <form onSubmit={handleSaveProfile} className="glass-card" style={{ padding: 32 }}>
        <h3 className={styles.cardTitle} style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <User size={18} style={{ color: "var(--neon-blue)" }} /> Profile Information
        </h3>

        <div className={styles.linkForm}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Username slug</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.linkForm} style={{ marginTop: 16 }}>
          <div className={styles.inputGroup} style={{ gridColumn: "span 2" }}>
            <label className={styles.label}>Profile Bio Description</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={styles.input}
              rows={3}
              style={{ resize: "none" }}
            />
          </div>
        </div>

        <div className={styles.linkForm} style={{ marginTop: 16 }}>
          <div className={styles.inputGroup} style={{ gridColumn: "span 2" }}>
            <label className={styles.label}>Avatar Image URL</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className={styles.input}
              placeholder="https://images.unsplash.com/... or profile-picture-link"
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
          <button type="submit" disabled={loading} className="neon-btn" style={{ padding: "10px 20px", fontSize: 13 }}>
            <Save size={14} /> Save Profile Information
          </button>
        </div>
      </form>

      {/* 2. Custom Domain configuration */}
      <div className="glass-card" style={{ padding: 32, position: "relative" }}>
        <h3 className={styles.cardTitle} style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Globe size={18} style={{ color: "var(--neon-purple)" }} /> Custom Domain Connections
        </h3>
        
        {!user?.premium && (
          <div 
            style={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              background: "rgba(3, 3, 7, 0.8)", 
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              zIndex: 5, 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: 8,
              borderRadius: 16
            }}
          >
            <Lock size={20} style={{ color: "var(--neon-blue)" }} />
            <span style={{ fontSize: 13, fontWeight: 700 }}>Custom Domain connects require Pro Premium</span>
            <button onClick={() => setTab("premium")} className="neon-btn" style={{ padding: "6px 12px", fontSize: 11, marginTop: 8 }}>
              Upgrade to Pro
            </button>
          </div>
        )}

        <div style={{ filter: !user?.premium ? "blur(3px)" : "none", pointerEvents: !user?.premium ? "none" : "auto" }}>
          <p style={{ fontSize: 13, color: "var(--gray-400)", marginBottom: 20 }}>
            White-label your brand. Link your personal subdomain (e.g. <code>links.gowtham.com</code>) to your LinkNest profile.
          </p>

          <form onSubmit={handleSaveDomain} style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div className={styles.inputGroup} style={{ flexGrow: 1 }}>
              <label className={styles.label}>Custom Domain Name</label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className={styles.input}
                placeholder="links.yourname.com"
              />
            </div>
            <button type="submit" className="neon-btn" style={{ height: 48, padding: "0 20px" }}>
              Configure
            </button>
          </form>

          {dnsVerified && (
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#10b981", fontSize: 13, fontWeight: 700 }}>
                <CheckCircle size={16} /> Domain maps successfully linked! Set DNS records:
              </div>

              <div className={styles.dnsBox}>
                <div className={styles.dnsRow}>
                  <strong>Type</strong>
                  <strong>Host / Name</strong>
                  <strong>Value / Points To</strong>
                </div>
                <div className={styles.dnsRow}>
                  <span>CNAME</span>
                  <span>{customDomain.split(".")[0] || "links"}</span>
                  <span style={{ color: "var(--neon-blue)" }}>cname.linknest.app</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Social Media & Integrations */}
      <form onSubmit={handleSaveSocialLinks} className="glass-card" style={{ padding: 32 }}>
        <h3 className={styles.cardTitle} style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <MessageCircle size={18} style={{ color: "var(--neon-pink)" }} /> Social Icons & Integrations
        </h3>

        <div className={styles.linkForm}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>WhatsApp Direct (Number with country code)</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className={styles.input}
              placeholder="e.g. 919876543210"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>UPI Address (e.g. gowtham@upi)</label>
            <input
              type="text"
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              className={styles.input}
              placeholder="name@upi"
            />
          </div>
        </div>

        <div className={styles.linkForm} style={{ marginTop: 16 }}>
          <div className={styles.inputGroup}>
            <label className={styles.label} style={{ display: "flex", alignItems: "center", gap: 6 }}><Instagram size={14} /> Instagram Username</label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className={styles.input}
              placeholder="username"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label} style={{ display: "flex", alignItems: "center", gap: 6 }}><Twitter size={14} /> Twitter Username</label>
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className={styles.input}
              placeholder="username"
            />
          </div>
        </div>

        <div className={styles.linkForm} style={{ marginTop: 16 }}>
          <div className={styles.inputGroup}>
            <label className={styles.label} style={{ display: "flex", alignItems: "center", gap: 6 }}><Github size={14} /> GitHub Username</label>
            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className={styles.input}
              placeholder="username"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label} style={{ display: "flex", alignItems: "center", gap: 6 }}><Youtube size={14} /> YouTube Channel URL</label>
            <input
              type="text"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              className={styles.input}
              placeholder="https://youtube.com/c/name"
            />
          </div>
        </div>

        <div className={styles.linkForm} style={{ marginTop: 16 }}>
          <div className={styles.inputGroup} style={{ gridColumn: "span 2" }}>
            <label className={styles.label} style={{ display: "flex", alignItems: "center", gap: 6 }}><Music size={14} /> Spotify Playlist/Artist URL</label>
            <input
              type="text"
              value={spotify}
              onChange={(e) => setSpotify(e.target.value)}
              className={styles.input}
              placeholder="https://open.spotify.com/playlist/..."
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
          <button type="submit" disabled={loading} className="neon-btn" style={{ padding: "10px 20px", fontSize: 13 }}>
            <Save size={14} /> Save Integrations Settings
          </button>
        </div>
      </form>

      {/* 4. Credentials/Security Page */}
      <div className="glass-card" style={{ padding: 32 }}>
        <h3 className={styles.cardTitle} style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <KeyRound size={18} style={{ color: "#ef4444" }} /> Account Security
        </h3>
        <p style={{ fontSize: 13, color: "var(--gray-400)", marginBottom: 20 }}>
          Manage your authorization credentials. Request reset triggers to change your account password securely.
        </p>
        <button 
          onClick={handlePasswordReset} 
          disabled={loading} 
          className="neon-btn-secondary" 
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Lock size={14} /> Send Password Reset Email
        </button>
      </div>

    </div>
  );
}
