"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import styles from "@/app/dashboard/dashboard.module.css";
import { 
  CheckCircle, 
  CreditCard, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Award,
  Lock,
  Globe,
  Loader
} from "lucide-react";
import { dbService } from "@/firebase/dbService";

export default function PremiumTab({ user, onProfileUpdate }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("monthly"); // monthly | yearly
  const [showSimulatedGateway, setShowSimulatedGateway] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  // Trigger Razorpay payment flow
  const handleUpgrade = async () => {
    setLoading(true);
    
    // Check if we are running in Demo Mode
    const isDemo = localStorage.getItem("linknest_current_user") !== null;

    if (isDemo) {
      // Simulate Razorpay Gateway popping up
      setTimeout(() => {
        setLoading(false);
        setShowSimulatedGateway(true);
      }, 800);
    } else {
      // Real Razorpay integration flow
      try {
        // 1. Dynamically load Razorpay SDK script
        const res = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
          showToast("Failed to load Razorpay SDK. Antivirus or Adblocker might be blocking it.", "error");
          setLoading(false);
          return;
        }

        // 2. Open standard checkout (normally orders are created via API backend route first)
        // Here we configure direct client integration options for simplicity, using a mock key or public testing key
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock_key_id",
          amount: selectedPlan === "monthly" ? 9900 : 99900, // paise
          currency: "INR",
          name: "LinkNest Pro",
          description: `Subscription Upgrade - ${selectedPlan === "monthly" ? "Monthly" : "Yearly"} Plan`,
          image: "/favicon.ico",
          handler: async function (response) {
            // Verify payment on frontend / database
            setLoading(true);
            try {
              const updated = await dbService.upgradeUserPremium(user.uid, selectedPlan, {
                razorpay_order_id: response.razorpay_order_id || "direct_checkout",
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature || ""
              });
              onProfileUpdate(updated);
              setPaymentSuccessData(response);
              showToast("Upgrade successful! Welcome to Pro.", "success");
            } catch (err) {
              console.error(err);
              showToast("Verification failed.", "error");
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: user.name || "",
            email: user.email || ""
          },
          theme: {
            color: "#00d2ff"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
      } catch (err) {
        console.error(err);
        showToast("Razorpay startup failed.", "error");
        setLoading(false);
      }
    }
  };

  const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Cancel Subscription
  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const updated = await dbService.cancelSubscription(user.uid);
      onProfileUpdate(updated);
      showToast("Subscription cancelled successfully.", "info");
    } catch (error) {
      console.error(error);
      showToast("Failed to cancel subscription.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Simulating successful gateway completion
  const handleSimulatePaymentSuccess = async () => {
    setShowSimulatedGateway(false);
    setLoading(true);
    
    try {
      const paymentId = "pay_mock_" + Math.random().toString(36).substring(2, 9);
      const updated = await dbService.upgradeUserPremium(user.uid, selectedPlan, {
        razorpay_order_id: "order_mock_12345",
        razorpay_payment_id: paymentId
      });
      onProfileUpdate(updated);
      setPaymentSuccessData({ razorpay_payment_id: paymentId });
      showToast("Simulated payment succeeded! Welcome to Pro.", "success");
    } catch (e) {
      console.error(e);
      showToast("Upgrade failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Simulating failed payment
  const handleSimulatePaymentFailure = () => {
    setShowSimulatedGateway(false);
    showToast("Simulated transaction was declined by customer.", "error");
  };

  return (
    <div>
      {/* SUCCESS SCREEN */}
      {paymentSuccessData && (
        <div className="glass-card" style={{ padding: 40, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, maxWidth: 600, margin: "0 auto" }}>
          <CheckCircle size={56} style={{ color: "#10b981", filter: "drop-shadow(0 0 10px rgba(16,185,129,0.3))" }} />
          <h2 style={{ fontWeight: 800, fontSize: 24 }}>Payment Successful!</h2>
          <p style={{ color: "var(--gray-400)", fontSize: 14 }}>
            Thank you for upgrading. Your LinkNest Pro subscription is now active!
          </p>
          <div style={{ background: "#09090e", border: "1px solid var(--card-border)", borderRadius: 12, padding: "16px 24px", width: "100%", textAlign: "left", fontSize: 13, fontFamily: "var(--font-mono)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "var(--gray-600)" }}>Plan:</span><span>Pro {selectedPlan}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "var(--gray-600)" }}>Reference ID:</span><span>{paymentSuccessData.razorpay_payment_id}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--gray-600)" }}>Status:</span><span style={{ color: "#10b981" }}>Active</span></div>
          </div>
          <button onClick={() => setPaymentSuccessData(null)} className="neon-btn" style={{ width: "100%", marginTop: 12 }}>
            Go to Dashboard Overview
          </button>
        </div>
      )}

      {/* ACTIVE SUBSCRIPTION SCREEN */}
      {!paymentSuccessData && user?.premium && (
        <div className="glass-card" style={{ padding: 40, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, maxWidth: 600, margin: "0 auto" }}>
          <Award size={56} style={{ color: "var(--neon-blue)", filter: "drop-shadow(0 0 10px rgba(0,210,255,0.3))" }} />
          <h2 style={{ fontWeight: 800, fontSize: 24 }}>You are a Pro Member!</h2>
          <p style={{ color: "var(--gray-400)", fontSize: 14 }}>
            You have unlocked unlimited links, advanced country/browser analytics, white-label custom domain maps, and 30 premium themes.
          </p>
          
          <div style={{ background: "#09090e", border: "1px solid var(--card-border)", borderRadius: 12, padding: "16px 24px", width: "100%", textAlign: "left", fontSize: 13, fontFamily: "var(--font-mono)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "var(--gray-600)" }}>Member Since:</span><span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Today"}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "var(--gray-600)" }}>Premium Valid Until:</span><span>{user?.premiumUntil ? new Date(user.premiumUntil).toLocaleDateString() : "Lifetime"}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--gray-600)" }}>Verification Badge:</span><span style={{ color: "var(--neon-blue)" }}>Enabled</span></div>
          </div>

          <button 
            onClick={handleCancelSubscription} 
            disabled={loading} 
            className="neon-btn-secondary" 
            style={{ width: "100%", marginTop: 12, borderColor: "#ef4444", color: "#f87171" }}
          >
            {loading ? "Cancelling..." : "Cancel Subscription"}
          </button>
        </div>
      )}

      {/* PLANS & UPGRADE SCREEN */}
      {!paymentSuccessData && !user?.premium && (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div className={styles.pricingBox}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 440 }}>
              <div className={styles.premiumBadge}>PRO MEMBERSHIP</div>
              <h2 style={{ fontWeight: 800, fontSize: 24 }}>Upgrade Your LinkNest Experience</h2>
              <p style={{ color: "var(--gray-400)", fontSize: 13, lineHeight: 1.5 }}>
                Unlock custom domain shortcuts, interactive visitor analytics, locked styling templates, and remove the branding badge.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Toggle monthly/yearly */}
              <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: 100, border: "1px solid var(--card-border)" }}>
                <button 
                  onClick={() => setSelectedPlan("monthly")} 
                  className={styles.billingBtn} 
                  style={{ padding: "6px 12px", fontSize: 11, background: selectedPlan === "monthly" ? "linear-gradient(135deg, var(--neon-blue), var(--neon-purple))" : "none", color: selectedPlan === "monthly" ? "#030307" : "white" }}
                >
                  Monthly (₹99)
                </button>
                <button 
                  onClick={() => setSelectedPlan("yearly")} 
                  className={styles.billingBtn} 
                  style={{ padding: "6px 12px", fontSize: 11, background: selectedPlan === "yearly" ? "linear-gradient(135deg, var(--neon-blue), var(--neon-purple))" : "none", color: selectedPlan === "yearly" ? "#030307" : "white" }}
                >
                  Yearly (₹999)
                </button>
              </div>

              <button 
                onClick={handleUpgrade} 
                disabled={loading} 
                className="neon-btn" 
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 8 }}
              >
                {loading ? <Loader size={16} className={styles.loader} /> : <CreditCard size={16} />}
                Pay {selectedPlan === "monthly" ? "₹99/mo" : "₹999/yr"} via Razorpay
              </button>
            </div>
          </div>

          {/* Premium features list */}
          <div className="glass-card" style={{ padding: 32 }}>
            <h3 className={styles.cardTitle} style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={18} style={{ color: "var(--neon-blue)" }} /> Included Pro Perks
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ color: "var(--neon-blue)", marginTop: 2 }}><CheckCircle size={16} /></div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Unlimited Links</h4>
                  <p style={{ fontSize: 12, color: "var(--gray-400)" }}>Remove the 5-link cap and add as many cards and socials as you like.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ color: "var(--neon-blue)", marginTop: 2 }}><CheckCircle size={16} /></div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Locked Premium Themes</h4>
                  <p style={{ fontSize: 12, color: "var(--gray-400)" }}>Access all 20+ neon gradient and styled developer templates instantly.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ color: "var(--neon-blue)", marginTop: 2 }}><CheckCircle size={16} /></div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Interactive Dashboard</h4>
                  <p style={{ fontSize: 12, color: "var(--gray-400)" }}>Inspect daily visitors, link clicks, device breakdowns, browser counts, and countries.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ color: "var(--neon-blue)", marginTop: 2 }}><CheckCircle size={16} /></div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Custom Domain Linking</h4>
                  <p style={{ fontSize: 12, color: "var(--gray-400)" }}>Connect links.yourdomain.com directly and whitelist your branding.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATED GATEWAY POPUP (DEMO MODE ONLY) */}
      {showSimulatedGateway && (
        <div 
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: "rgba(0,0,0,0.8)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            zIndex: 99999,
            padding: 24
          }}
        >
          <div 
            className="glass-card" 
            style={{ 
              maxWidth: 400, 
              width: "100%", 
              padding: 32, 
              border: "1px solid rgba(0, 210, 255, 0.4)", 
              boxShadow: "0 0 40px rgba(0, 210, 255, 0.2)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: 20
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffb000" }} />
              <h3 style={{ fontWeight: 800, fontSize: 18, color: "#ffffff" }}>Razorpay Test Sandbox</h3>
            </div>
            
            <p style={{ fontSize: 13, color: "var(--gray-400)", lineHeight: 1.5 }}>
              You are simulating a subscription transaction of <strong>{selectedPlan === "monthly" ? "₹99" : "₹999"}</strong> for <strong>LinkNest Pro</strong>.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button 
                onClick={handleSimulatePaymentSuccess} 
                className="neon-btn" 
                style={{ width: "100%", background: "#10b981", color: "#000000", fontWeight: 700 }}
              >
                Simulate Successful Payment
              </button>
              <button 
                onClick={handleSimulatePaymentFailure} 
                className="neon-btn-secondary" 
                style={{ width: "100%", borderColor: "#ef4444", color: "#f87171" }}
              >
                Simulate Cancelled/Failed Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
