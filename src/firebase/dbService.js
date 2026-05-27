import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  increment,
  writeBatch
} from "firebase/firestore";
import { db, isDemoMode } from "./config";

// --- HELPERS FOR MOCK DATA ---
const getMockData = (key, defaultVal = []) => {
  if (typeof window === "undefined") return defaultVal;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const saveMockData = (key, data) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const dbService = {
  // --- USER PROFILE ---
  getProfileByUsername: async (username) => {
    const formattedUsername = username.trim().toLowerCase();
    if (isDemoMode) {
      const users = getMockData("linknest_users");
      const user = users.find(u => u.username === formattedUsername);
      if (!user) return null;
      
      const links = getMockData("linknest_links");
      const userLinks = links
        .filter(l => l.uid === user.uid && l.enabled)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
        
      return { user, links: userLinks };
    } else {
      // Find the uid corresponding to username
      const usernameDoc = await getDoc(doc(db, "usernames", formattedUsername));
      if (!usernameDoc.exists()) return null;
      const { uid } = usernameDoc.data();
      
      // Get user profile
      const userDoc = await getDoc(doc(db, "users", uid));
      if (!userDoc.exists()) return null;
      const user = userDoc.data();

      // Get enabled links
      const q = query(
        collection(db, "links"), 
        where("uid", "==", uid), 
        where("enabled", "==", true)
      );
      const linksSnap = await getDocs(q);
      const links = linksSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      return { user, links };
    }
  },

  // --- LINK MANAGEMENT ---
  getUserLinks: async (uid) => {
    if (isDemoMode) {
      const links = getMockData("linknest_links");
      return links
        .filter(l => l.uid === uid)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    } else {
      const q = query(
        collection(db, "links"), 
        where("uid", "==", uid)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  },

  addLink: async (uid, linkData) => {
    if (isDemoMode) {
      const links = getMockData("linknest_links");
      const id = "mock_link_" + Math.random().toString(36).substring(2, 9);
      const newLink = {
        id,
        uid,
        title: linkData.title || "New Link",
        url: linkData.url || "https://",
        clicks: 0,
        enabled: true,
        icon: linkData.icon || "Globe",
        color: linkData.color || "#00d2ff",
        openNewTab: linkData.openNewTab !== false,
        order: links.filter(l => l.uid === uid).length
      };
      links.push(newLink);
      saveMockData("linknest_links", links);
      return newLink;
    } else {
      // Find current order length
      const currentLinks = await dbService.getUserLinks(uid);
      const newLink = {
        uid,
        title: linkData.title || "New Link",
        url: linkData.url || "https://",
        clicks: 0,
        enabled: true,
        icon: linkData.icon || "Globe",
        color: linkData.color || "#00d2ff",
        openNewTab: linkData.openNewTab !== false,
        order: currentLinks.length,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, "links"), newLink);
      return { id: docRef.id, ...newLink };
    }
  },

  updateLink: async (linkId, updatedFields) => {
    if (isDemoMode) {
      const links = getMockData("linknest_links");
      const idx = links.findIndex(l => l.id === linkId);
      if (idx === -1) throw new Error("Link not found");
      
      links[idx] = { ...links[idx], ...updatedFields };
      saveMockData("linknest_links", links);
      return links[idx];
    } else {
      const docRef = doc(db, "links", linkId);
      await updateDoc(docRef, updatedFields);
      return { id: linkId, ...updatedFields };
    }
  },

  deleteLink: async (linkId) => {
    if (isDemoMode) {
      let links = getMockData("linknest_links");
      links = links.filter(l => l.id !== linkId);
      saveMockData("linknest_links", links);
      return true;
    } else {
      await deleteDoc(doc(db, "links", linkId));
      return true;
    }
  },

  reorderLinks: async (uid, orderedLinks) => {
    if (isDemoMode) {
      const links = getMockData("linknest_links");
      // Map and update orders
      const updated = links.map(l => {
        if (l.uid === uid) {
          const matchIdx = orderedLinks.findIndex(ol => ol.id === l.id);
          if (matchIdx !== -1) {
            return { ...l, order: matchIdx };
          }
        }
        return l;
      });
      saveMockData("linknest_links", updated);
      return true;
    } else {
      const batch = writeBatch(db);
      orderedLinks.forEach((link, index) => {
        const docRef = doc(db, "links", link.id);
        batch.update(docRef, { order: index });
      });
      await batch.commit();
      return true;
    }
  },

  // --- THEMES ---
  getThemes: async () => {
    // Return all pre-configured themes (10 Free, 20 Premium)
    const mockThemes = getMockData("linknest_themes");
    if (mockThemes.length > 0) {
      // Ensure we fill up to 30 themes (10 Free + 20 Premium)
      if (mockThemes.length < 30) {
        const premiumThemes = [
          { id: "p1", name: "Nebula Dreams", type: "premium", style: { bg: "linear-gradient(45deg, #0f0c20 0%, #150a30 50%, #250540 100%)", text: "#ffc4d6", accent: "#ff007f", buttonBg: "rgba(255, 0, 127, 0.15)", buttonText: "#ff007f", buttonBorder: "1px dashed #ff007f", cardBg: "rgba(15, 12, 32, 0.7)", font: "var(--font-geist-sans)", glow: "0 0 25px rgba(255, 0, 127, 0.5)" } },
          { id: "p2", name: "Cyber Sunset", type: "premium", style: { bg: "linear-gradient(to bottom, #11001c, #240046, #3c096c, #5a189a, #7b2cbf)", text: "#ff9e00", accent: "#ff6d00", buttonBg: "#ff9e00", buttonText: "#11001c", buttonBorder: "none", cardBg: "rgba(17, 0, 28, 0.7)", font: "var(--font-geist-sans)" } },
          { id: "p3", name: "Carbon Fiber", type: "premium", style: { bg: "radial-gradient(circle at top right, #1a1a1a, #0d0d0d)", text: "#e6e6e6", accent: "#52ff3a", buttonBg: "rgba(82, 255, 58, 0.05)", buttonText: "#52ff3a", buttonBorder: "1px solid #52ff3a", cardBg: "rgba(20, 20, 20, 0.9)", font: "var(--font-geist-mono)" } },
          { id: "p4", name: "Holographic", type: "premium", style: { bg: "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)", text: "#333333", accent: "#635bff", buttonBg: "rgba(255, 255, 255, 0.8)", buttonText: "#635bff", buttonBorder: "1px solid rgba(99, 91, 255, 0.2)", cardBg: "rgba(255, 255, 255, 0.4)", font: "var(--font-geist-sans)", blur: "15px", shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.07)" } },
          { id: "p5", name: "Matrix Code", type: "premium", style: { bg: "#000000", text: "#00ff00", accent: "#00ff00", buttonBg: "none", buttonText: "#00ff00", buttonBorder: "1px solid #00ff00", cardBg: "rgba(0, 0, 0, 0.8)", font: "var(--font-geist-mono)", glow: "0 0 10px rgba(0, 255, 0, 0.5)" } },
          { id: "p6", name: "Champagne Gold", type: "premium", style: { bg: "linear-gradient(135deg, #161513 0%, #2a2825 100%)", text: "#f3e5d8", accent: "#d4af37", buttonBg: "rgba(212, 175, 55, 0.1)", buttonText: "#d4af37", buttonBorder: "1px solid #d4af37", cardBg: "rgba(22, 21, 19, 0.8)", font: "var(--font-geist-sans)", glow: "0 0 15px rgba(212, 175, 55, 0.25)" } },
          { id: "p7", name: "Midnight Purple", type: "premium", style: { bg: "linear-gradient(to right, #0f0c20, #06040d)", text: "#a29bfe", accent: "#6c5ce7", buttonBg: "#6c5ce7", buttonText: "#ffffff", buttonBorder: "none", cardBg: "rgba(15, 12, 32, 0.8)", font: "var(--font-geist-sans)", glow: "0 0 15px rgba(108, 92, 231, 0.5)" } },
          { id: "p8", name: "Neon Lime", type: "premium", style: { bg: "#050a05", text: "#e0f5e0", accent: "#39ff14", buttonBg: "rgba(57, 255, 20, 0.08)", buttonText: "#39ff14", buttonBorder: "1px solid #39ff14", cardBg: "rgba(10, 20, 10, 0.7)", font: "var(--font-geist-sans)", glow: "0 0 12px rgba(57, 255, 20, 0.3)" } },
          { id: "p9", name: "Soft Cotton", type: "premium", style: { bg: "linear-gradient(180deg, #efebeb 0%, #e3dbdb 100%)", text: "#4a3c3c", accent: "#ff6b8b", buttonBg: "#ff6b8b", buttonText: "#ffffff", buttonBorder: "none", cardBg: "#ffffff", font: "var(--font-geist-sans)", shadow: "0 10px 25px rgba(0,0,0,0.04)" } },
          { id: "p10", name: "Ice Cave", type: "premium", style: { bg: "linear-gradient(135deg, #0b1d28 0%, #1c3d52 100%)", text: "#e1f5fe", accent: "#80deea", buttonBg: "rgba(128, 222, 234, 0.1)", buttonText: "#80deea", buttonBorder: "1px solid #80deea", cardBg: "rgba(11, 29, 40, 0.7)", font: "var(--font-geist-sans)" } },
          { id: "p11", name: "Tokyo Synth", type: "premium", style: { bg: "linear-gradient(to bottom, #140526, #2d004d)", text: "#ff007f", accent: "#00ffff", buttonBg: "linear-gradient(90deg, #ff007f, #00ffff)", buttonText: "#000000", buttonBorder: "none", cardBg: "rgba(20, 5, 38, 0.8)", font: "var(--font-geist-sans)", glow: "0 0 15px rgba(0, 255, 255, 0.5)" } },
          { id: "p12", name: "Ocean Glass", type: "premium", style: { bg: "radial-gradient(circle, #0d2847 0%, #051324 100%)", text: "#e3fafc", accent: "#22b8cf", buttonBg: "rgba(34, 184, 207, 0.15)", buttonText: "#22b8cf", buttonBorder: "1px solid rgba(34, 184, 207, 0.3)", cardBg: "rgba(255, 255, 255, 0.05)", font: "var(--font-geist-sans)", blur: "10px" } },
          { id: "p13", name: "Monochrome Pro", type: "premium", style: { bg: "#ffffff", text: "#000000", accent: "#000000", buttonBg: "#000000", buttonText: "#ffffff", buttonBorder: "none", cardBg: "#f5f5f5", font: "var(--font-geist-sans)", shadow: "0 8px 24px rgba(0,0,0,0.06)" } },
          { id: "p14", name: "Ruby Fire", type: "premium", style: { bg: "linear-gradient(135deg, #2b0008 0%, #0d0003 100%)", text: "#ffb3b8", accent: "#ff002b", buttonBg: "rgba(255, 0, 43, 0.1)", buttonText: "#ff002b", buttonBorder: "1px solid #ff002b", cardBg: "rgba(43, 0, 8, 0.6)", font: "var(--font-geist-sans)", glow: "0 0 15px rgba(255, 0, 43, 0.3)" } },
          { id: "p15", name: "Warm Velvet", type: "premium", style: { bg: "linear-gradient(to right, #2c1a13, #150b07)", text: "#eddcd2", accent: "#cb997e", buttonBg: "#cb997e", buttonText: "#150b07", buttonBorder: "none", cardBg: "rgba(44, 26, 19, 0.7)", font: "var(--font-geist-sans)" } },
          { id: "p16", name: "Glitch Dream", type: "premium", style: { bg: "#0c0f1d", text: "#00ffff", accent: "#ff007f", buttonBg: "rgba(255, 255, 255, 0.05)", buttonText: "#00ffff", buttonBorder: "1px solid #ff007f", cardBg: "rgba(12, 15, 29, 0.8)", font: "var(--font-geist-mono)", shadow: "-3px 3px 0px #ff007f, 3px -3px 0px #00ffff" } },
          { id: "p17", name: "Emerald Luxe", type: "premium", style: { bg: "radial-gradient(circle, #081e14 0%, #020a06 100%)", text: "#d1ebd8", accent: "#00b074", buttonBg: "rgba(0, 176, 116, 0.1)", buttonText: "#00b074", buttonBorder: "1px solid #00b074", cardBg: "rgba(8, 30, 20, 0.6)", font: "var(--font-geist-sans)", glow: "0 0 10px rgba(0, 176, 116, 0.25)" } },
          { id: "p18", name: "Cyber Orange", type: "premium", style: { bg: "#0d0a08", text: "#ffeedd", accent: "#ff5500", buttonBg: "rgba(255, 85, 0, 0.15)", buttonText: "#ff5500", buttonBorder: "1px solid #ff5500", cardBg: "rgba(20, 15, 10, 0.7)", font: "var(--font-geist-sans)", glow: "0 0 15px rgba(255, 85, 0, 0.4)" } },
          { id: "p19", name: "Lavender Glass", type: "premium", style: { bg: "linear-gradient(135deg, #1e112a 0%, #0d0614 100%)", text: "#e8dbf2", accent: "#cc99ff", buttonBg: "rgba(204, 153, 255, 0.1)", buttonText: "#cc99ff", buttonBorder: "1px solid #cc99ff", cardBg: "rgba(255, 255, 255, 0.03)", font: "var(--font-geist-sans)", blur: "8px" } },
          { id: "p20", name: "Dark Aurora", type: "premium", style: { bg: "radial-gradient(circle at 50% -20%, #005f73, #0a0f1d, #001219)", text: "#94d2bd", accent: "#0a9396", buttonBg: "linear-gradient(to right, #005f73, #0a9396)", buttonText: "#ffffff", buttonBorder: "none", cardBg: "rgba(10, 15, 29, 0.7)", font: "var(--font-geist-sans)" } }
        ];
        const all = [...mockThemes, ...premiumThemes];
        saveMockData("linknest_themes", all);
        return all;
      }
      return mockThemes;
    }
    return [];
  },

  // --- ANALYTICS ---
  recordVisitor: async (username, visitorData) => {
    // Determine user uid first
    let uid = "";
    if (isDemoMode) {
      const users = getMockData("linknest_users");
      const user = users.find(u => u.username === username.toLowerCase());
      if (!user) return;
      uid = user.uid;
    } else {
      const usernameDoc = await getDoc(doc(db, "usernames", username.toLowerCase()));
      if (!usernameDoc.exists()) return;
      uid = usernameDoc.data().uid;
    }

    const event = {
      uid,
      linkId: null, // null means profile view
      timestamp: new Date().toISOString(),
      device: visitorData.device || "Desktop",
      browser: visitorData.browser || "Chrome",
      country: visitorData.country || "India",
      referrer: visitorData.referrer || "Direct"
    };

    if (isDemoMode) {
      const analytics = getMockData("linknest_analytics");
      analytics.push(event);
      saveMockData("linknest_analytics", analytics);
    } else {
      await addDoc(collection(db, "analytics"), event);
    }
  },

  recordLinkClick: async (username, linkId, clickData) => {
    let uid = "";
    if (isDemoMode) {
      const users = getMockData("linknest_users");
      const user = users.find(u => u.username === username.toLowerCase());
      if (!user) return;
      uid = user.uid;
      
      // Update link clicks locally
      const links = getMockData("linknest_links");
      const idx = links.findIndex(l => l.id === linkId);
      if (idx !== -1) {
        links[idx].clicks = (links[idx].clicks || 0) + 1;
        saveMockData("linknest_links", links);
      }
    } else {
      const usernameDoc = await getDoc(doc(db, "usernames", username.toLowerCase()));
      if (!usernameDoc.exists()) return;
      uid = usernameDoc.data().uid;
      
      // Increment clicks on link doc
      const linkDocRef = doc(db, "links", linkId);
      await updateDoc(linkDocRef, { clicks: increment(1) });
    }

    const event = {
      uid,
      linkId, // specific link clicked
      timestamp: new Date().toISOString(),
      device: clickData.device || "Desktop",
      browser: clickData.browser || "Chrome",
      country: clickData.country || "India",
      referrer: clickData.referrer || "Direct"
    };

    if (isDemoMode) {
      const analytics = getMockData("linknest_analytics");
      analytics.push(event);
      saveMockData("linknest_analytics", analytics);
    } else {
      await addDoc(collection(db, "analytics"), event);
    }
  },

  getUserAnalytics: async (uid) => {
    let events = [];
    let links = [];

    if (isDemoMode) {
      const allEvents = getMockData("linknest_analytics");
      events = allEvents.filter(e => e.uid === uid);
      links = getMockData("linknest_links").filter(l => l.uid === uid);
    } else {
      const q = query(collection(db, "analytics"), where("uid", "==", uid));
      const snap = await getDocs(q);
      events = snap.docs.map(d => d.data());
      links = await dbService.getUserLinks(uid);
    }

    const visitors = events.filter(e => e.linkId === null);
    const linkClicks = events.filter(e => e.linkId !== null);
    
    // Aggregations
    const totalVisitors = visitors.length;
    const totalClicks = linkClicks.length;
    
    // Top performing link
    const linkClickCounts = {};
    linkClicks.forEach(c => {
      linkClickCounts[c.linkId] = (linkClickCounts[c.linkId] || 0) + 1;
    });

    let topLinkId = null;
    let topLinkClicks = 0;
    Object.entries(linkClickCounts).forEach(([id, count]) => {
      if (count > topLinkClicks) {
        topLinkClicks = count;
        topLinkId = id;
      }
    });

    const topLinkObj = links.find(l => l.id === topLinkId) || null;
    const topLink = topLinkObj ? { ...topLinkObj, clicks: topLinkClicks } : null;

    // Devices break down
    const devices = {};
    events.forEach(e => {
      devices[e.device] = (devices[e.device] || 0) + 1;
    });

    // Browsers break down
    const browsers = {};
    events.forEach(e => {
      browsers[e.browser] = (browsers[e.browser] || 0) + 1;
    });

    // Countries break down
    const countries = {};
    events.forEach(e => {
      countries[e.country] = (countries[e.country] || 0) + 1;
    });

    // Timeline statistics (Past 7 days)
    const dailyStats = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
      
      const vCount = visitors.filter(e => e.timestamp.startsWith(dateStr)).length;
      const cCount = linkClicks.filter(e => e.timestamp.startsWith(dateStr)).length;
      
      // Formatting label like "May 27"
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      dailyStats.push({
        date: dateStr,
        label,
        visitors: vCount,
        clicks: cCount
      });
    }

    return {
      totalVisitors,
      totalClicks,
      topLink,
      devices,
      browsers,
      countries,
      dailyStats,
      allLinks: links.map(l => ({
        ...l,
        clicks: linkClickCounts[l.id] || 0
      })).sort((a,b) => b.clicks - a.clicks)
    };
  },

  // --- PREMIUM UPGRADES (RAZORPAY INTEGRATION SIMULATION/STORAGE) ---
  upgradeUserPremium: async (uid, plan, paymentDetails) => {
    if (isDemoMode) {
      const users = getMockData("linknest_users");
      const idx = users.findIndex(u => u.uid === uid);
      if (idx === -1) throw new Error("User not found");

      users[idx].premium = true;
      users[idx].premiumUntil = new Date(Date.now() + (plan === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString();
      saveMockData("linknest_users", users);

      // Record subscription
      const subscriptions = getMockData("linknest_subscriptions");
      const sub = {
        id: "sub_" + Math.random().toString(36).substring(2, 9),
        uid,
        status: "active",
        plan,
        razorpayOrderId: paymentDetails.razorpay_order_id || "mock_order_id",
        razorpayPaymentId: paymentDetails.razorpay_payment_id || "mock_payment_id",
        createdAt: new Date().toISOString()
      };
      subscriptions.push(sub);
      saveMockData("linknest_subscriptions", subscriptions);

      if (typeof window !== "undefined") {
        localStorage.setItem("linknest_current_user", JSON.stringify(users[idx]));
      }
      return users[idx];
    } else {
      // Production Firebase upgrade
      const userRef = doc(db, "users", uid);
      const premiumUntil = new Date(Date.now() + (plan === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString();
      
      await updateDoc(userRef, {
        premium: true,
        premiumUntil
      });

      const subData = {
        uid,
        status: "active",
        plan,
        razorpayOrderId: paymentDetails.razorpay_order_id,
        razorpayPaymentId: paymentDetails.razorpay_payment_id,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "subscriptions"), subData);

      const userSnap = await getDoc(userRef);
      return userSnap.data();
    }
  },

  cancelSubscription: async (uid) => {
    if (isDemoMode) {
      const users = getMockData("linknest_users");
      const idx = users.findIndex(u => u.uid === uid);
      if (idx !== -1) {
        users[idx].premium = false;
        users[idx].premiumUntil = null;
        saveMockData("linknest_users", users);
        if (typeof window !== "undefined") {
          localStorage.setItem("linknest_current_user", JSON.stringify(users[idx]));
        }
        return users[idx];
      }
    } else {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        premium: false,
        premiumUntil: null
      });
      // Deactivate any active subscriptions
      const q = query(
        collection(db, "subscriptions"), 
        where("uid", "==", uid), 
        where("status", "==", "active")
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => {
        batch.update(d.ref, { status: "cancelled" });
      });
      await batch.commit();
      
      const userSnap = await getDoc(userRef);
      return userSnap.data();
    }
  },

  // --- ADMIN PANEL CONTROLS ---
  getAdminUsers: async () => {
    if (isDemoMode) {
      return getMockData("linknest_users");
    } else {
      const snap = await getDocs(collection(db, "users"));
      return snap.docs.map(d => d.data());
    }
  },

  banUser: async (uid, isBanned) => {
    if (isDemoMode) {
      const users = getMockData("linknest_users");
      const idx = users.findIndex(u => u.uid === uid);
      if (idx !== -1) {
        users[idx].banned = isBanned;
        saveMockData("linknest_users", users);
        return true;
      }
      return false;
    } else {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { banned: isBanned });
      return true;
    }
  }
};
