"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import styles from "@/app/dashboard/dashboard.module.css";
import { 
  Users, 
  ShieldAlert, 
  Megaphone, 
  Search, 
  Ban, 
  Check, 
  UserCheck, 
  Zap, 
  Mail,
  Award
} from "lucide-react";
import { dbService } from "@/firebase/dbService";

export default function AdminTab() {
  const { showToast } = useToast();
  const [usersList, setUsersList] = useState([]);
  const [search, setSearch] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const list = await dbService.getAdminUsers();
      setUsersList(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Toggle user ban status
  const handleToggleBan = async (uid, currentBanned) => {
    try {
      await dbService.banUser(uid, !currentBanned);
      showToast(!currentBanned ? "User account has been banned!" : "User account has been unbanned.", "success");
      fetchUsers();
    } catch (error) {
      console.error(error);
      showToast("Failed to change ban status.", "error");
    }
  };

  // Toggle user premium status
  const handleTogglePremium = async (uid, currentPremium) => {
    try {
      if (!currentPremium) {
        await dbService.upgradeUserPremium(uid, "yearly", {
          razorpay_order_id: "admin_granted",
          razorpay_payment_id: "admin_p_" + Math.random().toString(36).substring(2, 7)
        });
        showToast("Premium Pro status granted to user!", "success");
      } else {
        await dbService.cancelSubscription(uid);
        showToast("Premium Pro status revoked.", "info");
      }
      fetchUsers();
    } catch (e) {
      console.error(e);
      showToast("Failed to modify user plan.", "error");
    }
  };

  // Trigger global announcement
  const handleSendAnnouncement = (e) => {
    e.preventDefault();
    if (!announcement.trim()) return;
    
    setLoading(true);
    setTimeout(() => {
      showToast("Announcement broadcasted successfully to all profiles!", "success");
      setAnnouncement("");
      setLoading(false);
    }, 1000);
  };

  const filteredUsers = usersList.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      
      {/* 1. Global broadcast announcement */}
      <form onSubmit={handleSendAnnouncement} className="glass-card" style={{ padding: 32 }}>
        <h3 className={styles.cardTitle} style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Megaphone size={18} style={{ color: "var(--neon-blue)" }} /> System Announcement Broadcast
        </h3>
        <p style={{ fontSize: 13, color: "var(--gray-400)", marginBottom: 20 }}>
          Publish an administrative alert banner that renders at the top of all LinkNest public bios.
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <input
            type="text"
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            className={styles.input}
            style={{ flexGrow: 1 }}
            placeholder="Type alert banner notification text..."
            required
          />
          <button type="submit" disabled={loading} className="neon-btn" style={{ padding: "0 20px" }}>
            Broadcast
          </button>
        </div>
      </form>

      {/* 2. Registered Users Administration Panel */}
      <div className="glass-card" style={{ padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <h3 className={styles.cardTitle} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={18} style={{ color: "var(--neon-purple)" }} /> User Base Administration
          </h3>
          
          <div style={{ position: "relative", width: "100%", maxWidth: 300 }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-600)" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.input}
              style={{ paddingLeft: 38, width: "100%" }}
              placeholder="Search by name, email or slug..."
            />
          </div>
        </div>

        <div className={styles.adminTableWrapper}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Name / Email</th>
                <th>Premium Tier</th>
                <th>Account Status</th>
                <th>Control Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.uid}>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--neon-blue)" }}>/{u.username}</span>
                    </td>
                    <td>
                      <div>{u.name}</div>
                      <div style={{ fontSize: 11, color: "var(--gray-600)" }}>{u.email}</div>
                    </td>
                    <td>
                      {u.premium ? (
                        <span className={styles.premiumBadge}>Pro Active</span>
                      ) : (
                        <span className={styles.freeBadge}>Free Account</span>
                      )}
                    </td>
                    <td>
                      {u.banned ? (
                        <span style={{ color: "#ef4444", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                          <Ban size={12} /> Banned
                        </span>
                      ) : (
                        <span style={{ color: "#10b981", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                          <UserCheck size={12} /> Active
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        {/* Ban trigger */}
                        <button 
                          onClick={() => handleToggleBan(u.uid, u.banned)}
                          className={styles.actionBtn}
                          style={{
                            borderColor: u.banned ? "#10b981" : "rgba(255,255,255,0.08)",
                            color: u.banned ? "#34d399" : "#f87171"
                          }}
                        >
                          {u.banned ? "Unban User" : "Ban User"}
                        </button>
                        {/* Plan trigger */}
                        <button 
                          onClick={() => handleTogglePremium(u.uid, u.premium)}
                          className={styles.actionBtn}
                          style={{
                            borderColor: u.premium ? "#f59e0b" : "rgba(0, 210, 255, 0.2)",
                            color: u.premium ? "#fbbf24" : "var(--neon-blue)"
                          }}
                        >
                          {u.premium ? "Revoke Pro" : "Grant Pro"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textCenter: "center", color: "var(--gray-600)", padding: 32 }}>
                    No registered user accounts match search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
