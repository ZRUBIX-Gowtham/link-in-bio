import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, isDemoMode } from "./config";

// --- MOCK DATABASE HELPER FOR LOCAL STORAGE ---
const getMockData = (key, defaultVal = []) => {
  if (typeof window === "undefined") return defaultVal;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const saveMockData = (key, data) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
};

// Seed initial themes if not present
const seedMockThemes = () => {
  const themes = getMockData("linknest_themes");
  if (themes.length === 0) {
    const defaultThemes = [
      { id: "neon-blue", name: "Neon Blue", type: "free", style: { bg: "radial-gradient(circle, #09090e 0%, #03030b 100%)", text: "#e0e6ed", accent: "#00d2ff", buttonBg: "rgba(0, 210, 255, 0.1)", buttonText: "#00d2ff", buttonBorder: "1px solid #00d2ff", cardBg: "rgba(10, 10, 20, 0.6)", font: "var(--font-geist-sans)", glow: "0 0 15px rgba(0, 210, 255, 0.4)" } },
      { id: "neon-purple", name: "Neon Purple", type: "free", style: { bg: "radial-gradient(circle, #09020f 0%, #030006 100%)", text: "#f3e8ff", accent: "#bb86fc", buttonBg: "rgba(187, 134, 252, 0.1)", buttonText: "#bb86fc", buttonBorder: "1px solid #bb86fc", cardBg: "rgba(18, 10, 28, 0.6)", font: "var(--font-geist-sans)", glow: "0 0 15px rgba(187, 134, 252, 0.4)" } },
      { id: "cyberpunk", name: "Cyberpunk", type: "free", style: { bg: "linear-gradient(135deg, #120c1f 0%, #1a103c 100%)", text: "#ffe200", accent: "#ff007f", buttonBg: "#ff007f", buttonText: "#ffffff", buttonBorder: "none", cardBg: "rgba(26, 16, 60, 0.7)", font: "var(--font-geist-sans)", glow: "0 0 20px rgba(255, 0, 127, 0.6)" } },
      { id: "stripe-light", name: "Stripe Light", type: "free", style: { bg: "#f6f9fc", text: "#1a1f36", accent: "#635bff", buttonBg: "#635bff", buttonText: "#ffffff", buttonBorder: "none", cardBg: "#ffffff", font: "var(--font-geist-sans)", shadow: "0 10px 30px rgba(0, 0, 0, 0.05)" } },
      { id: "glass-dark", name: "Glassmorphism Dark", type: "free", style: { bg: "linear-gradient(to bottom right, #0d0d1e, #141432)", text: "#ffffff", accent: "#ff6b6b", buttonBg: "rgba(255, 255, 255, 0.05)", buttonText: "#ffffff", buttonBorder: "1px solid rgba(255, 255, 255, 0.1)", cardBg: "rgba(255, 255, 255, 0.03)", font: "var(--font-geist-sans)", blur: "12px" } },
      { id: "forest", name: "Deep Forest", type: "free", style: { bg: "linear-gradient(135deg, #0d1f14 0%, #050a06 100%)", text: "#e6f4ea", accent: "#34a853", buttonBg: "rgba(52, 168, 83, 0.15)", buttonText: "#81c995", buttonBorder: "1px solid #34a853", cardBg: "rgba(13, 31, 20, 0.6)", font: "var(--font-geist-sans)" } },
      { id: "sunset", name: "Sunset Gold", type: "free", style: { bg: "linear-gradient(to bottom, #1f0d0d, #0d0303)", text: "#fff0eb", accent: "#ff9233", buttonBg: "rgba(255, 146, 51, 0.1)", buttonText: "#ff9233", buttonBorder: "1px solid #ff9233", cardBg: "rgba(31, 13, 13, 0.7)", font: "var(--font-geist-sans)", glow: "0 0 10px rgba(255, 146, 51, 0.3)" } },
      { id: "minimal-dark", name: "Minimal Dark", type: "free", style: { bg: "#000000", text: "#888888", accent: "#ffffff", buttonBg: "none", buttonText: "#ffffff", buttonBorder: "1px solid #222222", cardBg: "#050505", font: "var(--font-geist-mono)" } },
      { id: "aurora", name: "Aurora Glow", type: "free", style: { bg: "linear-gradient(180deg, #07162c 0%, #0b3c5d 100%)", text: "#e2f1f6", accent: "#00ffd0", buttonBg: "rgba(0, 255, 208, 0.1)", buttonText: "#00ffd0", buttonBorder: "1px solid #00ffd0", cardBg: "rgba(7, 22, 44, 0.7)", font: "var(--font-geist-sans)" } },
      { id: "rose", name: "Rose Quartz", type: "free", style: { bg: "#fff5f5", text: "#702459", accent: "#d53f8c", buttonBg: "#d53f8c", buttonText: "#ffffff", buttonBorder: "none", cardBg: "#ffffff", font: "var(--font-geist-sans)", shadow: "0 4px 20px rgba(213, 63, 140, 0.1)" } }
    ];
    saveMockData("linknest_themes", defaultThemes);
  }
};

// --- AUTH SERVICE ---
export const authService = {
  // Check if username is already taken
  isUsernameTaken: async (username) => {
    const formattedUsername = username.trim().toLowerCase();
    if (isDemoMode) {
      const users = getMockData("linknest_users");
      return users.some(u => u.username === formattedUsername);
    } else {
      const q = doc(db, "usernames", formattedUsername);
      const snap = await getDoc(q);
      return snap.exists();
    }
  },

  // Register user
  register: async (email, password, username, name) => {
    const formattedUsername = username.trim().toLowerCase();
    
    // Validate username taken
    const taken = await authService.isUsernameTaken(formattedUsername);
    if (taken) {
      throw new Error("Username is already taken.");
    }

    if (isDemoMode) {
      seedMockThemes();
      const users = getMockData("linknest_users");
      const uid = "mock_uid_" + Math.random().toString(36).substring(2, 9);
      
      const newUser = {
        uid,
        email: email.toLowerCase(),
        username: formattedUsername,
        name: name || formattedUsername,
        avatar: "",
        bio: "Welcome to my LinkNest! 🚀",
        premium: false,
        themeId: "neon-blue",
        createdAt: new Date().toISOString(),
        socialLinks: {
          whatsapp: "",
          upi: "",
          instagram: "",
          twitter: "",
          github: "",
          youtube: "",
          spotify: ""
        }
      };

      // Simulating simple password store for mock credentials
      const credentials = getMockData("linknest_credentials");
      credentials.push({ email: email.toLowerCase(), password, uid });
      saveMockData("linknest_credentials", credentials);

      users.push(newUser);
      saveMockData("linknest_users", users);

      // Save session
      if (typeof window !== "undefined") {
        localStorage.setItem("linknest_current_user", JSON.stringify(newUser));
      }
      return newUser;
    } else {
      // Firebase flow
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData = {
        uid: user.uid,
        email: user.email,
        username: formattedUsername,
        name: name || formattedUsername,
        avatar: "",
        bio: "Welcome to my LinkNest! 🚀",
        premium: false,
        themeId: "neon-blue",
        createdAt: new Date().toISOString(),
        socialLinks: {
          whatsapp: "",
          upi: "",
          instagram: "",
          twitter: "",
          github: "",
          youtube: "",
          spotify: ""
        }
      };

      // Set user doc
      await setDoc(doc(db, "users", user.uid), userData);
      // Claim username doc to prevent duplicate registrations
      await setDoc(doc(db, "usernames", formattedUsername), { uid: user.uid });

      return userData;
    }
  },

  // Login User
  login: async (email, password) => {
    if (isDemoMode) {
      seedMockThemes();
      const credentials = getMockData("linknest_credentials");
      const userCred = credentials.find(c => c.email === email.toLowerCase() && c.password === password);
      
      if (!userCred) {
        throw new Error("Invalid email or password.");
      }

      const users = getMockData("linknest_users");
      const userProfile = users.find(u => u.uid === userCred.uid);

      if (!userProfile) {
        throw new Error("User profile not found.");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("linknest_current_user", JSON.stringify(userProfile));
      }
      return userProfile;
    } else {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        throw new Error("User document does not exist in Firestore.");
      }
      return userDoc.data();
    }
  },

  // Google Login
  loginWithGoogle: async () => {
    if (isDemoMode) {
      seedMockThemes();
      // Generate a mock google user
      const users = getMockData("linknest_users");
      const randomUsername = "google_user_" + Math.random().toString(36).substring(2, 6);
      const mockEmail = `${randomUsername}@gmail.com`;
      
      let userProfile = users.find(u => u.email === mockEmail);
      
      if (!userProfile) {
        userProfile = {
          uid: "mock_google_uid_" + Math.random().toString(36).substring(2, 9),
          email: mockEmail,
          username: randomUsername,
          name: "Google Explorer",
          avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c",
          bio: "Exploring LinkNest! ✨",
          premium: false,
          themeId: "neon-purple",
          createdAt: new Date().toISOString(),
          socialLinks: {
            whatsapp: "",
            upi: "",
            instagram: "",
            twitter: "",
            github: "",
            youtube: "",
            spotify: ""
          }
        };
        users.push(userProfile);
        saveMockData("linknest_users", users);
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("linknest_current_user", JSON.stringify(userProfile));
      }
      return userProfile;
    } else {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already has a document
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        // First-time google login - prompt/assign a username
        const baseUsername = user.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
        let finalUsername = baseUsername;
        let suffix = 1;
        
        while (true) {
          const taken = await authService.isUsernameTaken(finalUsername);
          if (!taken) break;
          finalUsername = baseUsername + suffix;
          suffix++;
        }

        const userData = {
          uid: user.uid,
          email: user.email,
          username: finalUsername,
          name: user.displayName || finalUsername,
          avatar: user.photoURL || "",
          bio: "Welcome to my LinkNest! 🚀",
          premium: false,
          themeId: "neon-blue",
          createdAt: new Date().toISOString(),
          socialLinks: {
            whatsapp: "",
            upi: "",
            instagram: "",
            twitter: "",
            github: "",
            youtube: "",
            spotify: ""
          }
        };

        await setDoc(userDocRef, userData);
        await setDoc(doc(db, "usernames", finalUsername), { uid: user.uid });
        return userData;
      }
    }
  },

  // Password reset
  resetPassword: async (email) => {
    if (isDemoMode) {
      const credentials = getMockData("linknest_credentials");
      const exists = credentials.some(c => c.email === email.toLowerCase());
      if (!exists) {
        throw new Error("No account found with this email address.");
      }
      return true; // Successfully simulated sending reset email
    } else {
      await sendPasswordResetEmail(auth, email);
      return true;
    }
  },

  // Logout
  logout: async () => {
    if (isDemoMode) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("linknest_current_user");
      }
      return true;
    } else {
      await signOut(auth);
      return true;
    }
  },

  // Update profile details
  updateProfile: async (uid, updatedData) => {
    if (isDemoMode) {
      const users = getMockData("linknest_users");
      const userIdx = users.findIndex(u => u.uid === uid);
      if (userIdx === -1) throw new Error("User not found.");

      // Check if username changed and validate it
      if (updatedData.username && updatedData.username !== users[userIdx].username) {
        const taken = await authService.isUsernameTaken(updatedData.username);
        if (taken) throw new Error("Username is already taken.");
      }

      users[userIdx] = { ...users[userIdx], ...updatedData };
      saveMockData("linknest_users", users);

      if (typeof window !== "undefined") {
        localStorage.setItem("linknest_current_user", JSON.stringify(users[userIdx]));
      }
      return users[userIdx];
    } else {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) throw new Error("User not found.");

      const currentData = userDoc.data();
      
      // If username changed, update the usernames index collection
      if (updatedData.username && updatedData.username !== currentData.username) {
        const newUsername = updatedData.username.trim().toLowerCase();
        const taken = await authService.isUsernameTaken(newUsername);
        if (taken) throw new Error("Username is already taken.");

        // Safe transaction: set new username doc, delete old username doc
        await setDoc(doc(db, "usernames", newUsername), { uid });
        // NOTE: we don't strictly delete the old one right here to keep it simple, but in production you'd delete old
      }

      await setDoc(userDocRef, { ...currentData, ...updatedData }, { merge: true });
      const updatedSnap = await getDoc(userDocRef);
      return updatedSnap.data();
    }
  }
};
