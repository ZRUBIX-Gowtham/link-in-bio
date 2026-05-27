"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import styles from "@/app/dashboard/dashboard.module.css";
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Link2, 
  ExternalLink,
  Globe,
  Github,
  Youtube,
  Twitter,
  Instagram,
  Coffee,
  Briefcase,
  DollarSign,
  MessageCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { dbService } from "@/firebase/dbService";

// Helper mapping Lucide icon names to React nodes
const getIconComponent = (name, size = 16) => {
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

const iconOptions = ["Globe", "Github", "Youtube", "Twitter", "Instagram", "Coffee", "Briefcase", "DollarSign", "MessageCircle"];

export default function LinksTab({ user, links, onLinksChange, setTab }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Link form states
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newIcon, setNewIcon] = useState("Globe");
  const [newColor, setNewColor] = useState("#00d2ff");
  const [newOpenNewTab, setNewOpenNewTab] = useState(true);

  // Add a new link card
  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) {
      showToast("Please enter a title and URL.", "warning");
      return;
    }

    // Limit check for free users
    if (!user?.premium && links.length >= 5) {
      showToast("Free plan is limited to 5 links. Upgrade to add unlimited links!", "warning");
      setTab("premium");
      return;
    }

    setLoading(true);
    try {
      let formattedUrl = newUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = "https://" + formattedUrl;
      }

      const added = await dbService.addLink(user.uid, {
        title: newTitle.trim(),
        url: formattedUrl,
        icon: newIcon,
        color: newColor,
        openNewTab: newOpenNewTab
      });

      onLinksChange([...links, added]);
      showToast("Link added successfully!", "success");
      
      // Reset form
      setNewTitle("");
      setNewUrl("");
      setNewIcon("Globe");
      setNewColor("#00d2ff");
      setShowAddForm(false);
    } catch (error) {
      console.error(error);
      showToast("Failed to add link.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Toggle enabled/disabled state of a link
  const handleToggleEnabled = async (linkId, currentVal) => {
    try {
      const updatedLinks = links.map(l => l.id === linkId ? { ...l, enabled: !currentVal } : l);
      onLinksChange(updatedLinks); // optimistic update
      
      await dbService.updateLink(linkId, { enabled: !currentVal });
      showToast(!currentVal ? "Link enabled!" : "Link disabled!", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to update status.", "error");
    }
  };

  // Inline update of a link
  const handleUpdateLink = async (linkId, fields) => {
    try {
      const updatedLinks = links.map(l => l.id === linkId ? { ...l, ...fields } : l);
      onLinksChange(updatedLinks);
      
      await dbService.updateLink(linkId, fields);
    } catch (error) {
      console.error(error);
      showToast("Failed to update link details.", "error");
    }
  };

  // Delete link
  const handleDeleteLink = async (linkId) => {
    try {
      const updatedLinks = links.filter(l => l.id !== linkId);
      onLinksChange(updatedLinks);
      
      await dbService.deleteLink(linkId);
      showToast("Link deleted.", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to delete link.", "error");
    }
  };

  // Move Link Up in list order
  const handleMoveUp = async (index) => {
    if (index === 0) return;
    const reordered = [...links];
    // Swap
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;
    
    // Update local state
    onLinksChange(reordered);
    await dbService.reorderLinks(user.uid, reordered);
  };

  // Move Link Down in list order
  const handleMoveDown = async (index) => {
    if (index === links.length - 1) return;
    const reordered = [...links];
    // Swap
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;
    
    // Update local state
    onLinksChange(reordered);
    await dbService.reorderLinks(user.uid, reordered);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h3 className={styles.cardTitle}>
          My Links ({links.length} {user?.premium ? "" : "/ 5"})
        </h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="neon-btn"
          style={{ padding: "8px 16px", fontSize: 13 }}
        >
          <Plus size={16} /> Add New Link
        </button>
      </div>

      {/* Add New Link Card Form */}
      {showAddForm && (
        <form onSubmit={handleAddLink} className="glass-card" style={{ padding: 24, marginBottom: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <h4 style={{ fontWeight: 700, fontSize: 14 }}>Create Bio Link Card</h4>
          
          <div className={styles.linkForm}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Link Title</label>
              <input
                type="text"
                placeholder="e.g. My Portfolio Website"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>URL Link</label>
              <input
                type="text"
                placeholder="e.g. https://portfolio.me"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.linkForm}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Display Icon</label>
              <select 
                value={newIcon} 
                onChange={(e) => setNewIcon(e.target.value)}
                className={styles.input}
                style={{ background: "#1f1f2e", border: "1px solid var(--card-border)" }}
              >
                {iconOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Button Color</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  style={{ width: 44, height: 44, padding: 0, border: "none", borderRadius: 8, cursor: "pointer", background: "none" }}
                />
                <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--gray-400)" }}>{newColor}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="openNewTab"
              checked={newOpenNewTab}
              onChange={(e) => setNewOpenNewTab(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            <label htmlFor="openNewTab" style={{ fontSize: 13, fontWeight: 500 }}>Open in new tab</label>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="neon-btn-secondary"
              style={{ padding: "8px 16px", fontSize: 13 }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="neon-btn"
              disabled={loading}
              style={{ padding: "8px 16px", fontSize: 13 }}
            >
              {loading ? "Adding..." : "Add Link"}
            </button>
          </div>
        </form>
      )}

      {/* Links List View */}
      {links.length === 0 ? (
        <div className={styles.emptyState}>
          <Link2 size={40} style={{ color: "var(--gray-600)" }} />
          <h3>No Links Found</h3>
          <p style={{ fontSize: 13, maxWidth: 300 }}>
            You haven&apos;t added any links yet. Click &quot;Add New Link&quot; above to start building your profile.
          </p>
        </div>
      ) : (
        <div className={styles.linksList}>
          {links.map((link, idx) => (
            <div key={link.id} className={`${styles.linkItem} glass-card`}>
              <div className={styles.linkItemHeader}>
                {/* Reorder Arrows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <button 
                    disabled={idx === 0} 
                    onClick={() => handleMoveUp(idx)} 
                    className={styles.reorderHandle}
                    style={{ background: "none", border: "none", opacity: idx === 0 ? 0.3 : 1 }}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button 
                    disabled={idx === links.length - 1} 
                    onClick={() => handleMoveDown(idx)} 
                    className={styles.reorderHandle}
                    style={{ background: "none", border: "none", opacity: idx === links.length - 1 ? 0.3 : 1 }}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                <div style={{ color: link.color || "var(--neon-blue)", display: "flex", alignItems: "center" }}>
                  {getIconComponent(link.icon, 20)}
                </div>

                {/* Edit inline */}
                <div className={styles.linkDetailsSummary}>
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => handleUpdateLink(link.id, { title: e.target.value })}
                    className={styles.input}
                    style={{ padding: "4px 8px", background: "none", border: "none", borderBottom: "1px solid transparent", fontWeight: 700, fontSize: 15, width: "100%", borderRadius: 0, color: "#ffffff" }}
                    placeholder="Enter Title"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => handleUpdateLink(link.id, { url: e.target.value })}
                    className={styles.input}
                    style={{ padding: "4px 8px", background: "none", border: "none", fontSize: 12, width: "100%", borderRadius: 0, color: "var(--gray-400)", marginTop: 2 }}
                    placeholder="Enter URL"
                  />
                </div>

                {/* Toggles & Delete */}
                <div className={styles.linkToggles}>
                  {/* Enabled switch */}
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={!!link.enabled}
                      onChange={() => handleToggleEnabled(link.id, link.enabled)}
                    />
                    <span className={styles.slider}></span>
                  </label>

                  {/* Delete button */}
                  <button onClick={() => handleDeleteLink(link.id)} className={styles.deleteBtn}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Extra Settings Panel */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--gray-400)" }}>Icon:</span>
                  <select
                    value={link.icon || "Globe"}
                    onChange={(e) => handleUpdateLink(link.id, { icon: e.target.value })}
                    className={styles.input}
                    style={{ padding: "4px 8px", fontSize: 12, background: "#1f1f2e" }}
                  >
                    {iconOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--gray-400)" }}>Accent Color:</span>
                  <input
                    type="color"
                    value={link.color || "#00d2ff"}
                    onChange={(e) => handleUpdateLink(link.id, { color: e.target.value })}
                    style={{ width: 28, height: 28, border: "none", borderRadius: 4, cursor: "pointer", background: "none", padding: 0 }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
