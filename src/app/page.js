"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";
import ParticlesBackground from "@/components/ParticlesBackground";
import { 
  ArrowRight, 
  Sparkles, 
  BarChart3, 
  CreditCard, 
  Globe, 
  Check, 
  CheckCircle,
  ExternalLink,
  ChevronDown,
  Instagram,
  Twitter,
  Github,
  MessageCircle,
  Compass,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  
  // Billing cycle state
  const [billingCycle, setBillingCycle] = useState("monthly"); // monthly | yearly
  
  // Active theme in phone mockup
  const [activeThemeId, setActiveThemeId] = useState("neon-blue");
  
  // Active FAQ index
  const [activeFaq, setActiveFaq] = useState(null);

  // Landing page mockup themes
  const mockupThemes = {
    "neon-blue": {
      bg: "radial-gradient(circle, #0a0a14 0%, #030308 100%)",
      text: "#e0e6ed",
      accent: "#00d2ff",
      cardBg: "rgba(10, 10, 25, 0.6)",
      cardBorder: "rgba(0, 210, 255, 0.2)",
      buttonBg: "rgba(0, 210, 255, 0.1)",
      buttonBorder: "1px solid #00d2ff",
      buttonText: "#00d2ff"
    },
    "neon-purple": {
      bg: "radial-gradient(circle, #0f0214 0%, #060009 100%)",
      text: "#f3e8ff",
      accent: "#a855f7",
      cardBg: "rgba(20, 10, 30, 0.6)",
      cardBorder: "rgba(168, 85, 247, 0.2)",
      buttonBg: "rgba(168, 85, 247, 0.1)",
      buttonBorder: "1px solid #a855f7",
      buttonText: "#a855f7"
    },
    "cyberpunk": {
      bg: "linear-gradient(135deg, #120c1f 0%, #1a103c 100%)",
      text: "#ffe200",
      accent: "#ff007f",
      cardBg: "rgba(255, 0, 127, 0.05)",
      cardBorder: "rgba(255, 0, 127, 0.3)",
      buttonBg: "#ff007f",
      buttonBorder: "none",
      buttonText: "#ffffff"
    },
    "glass-dark": {
      bg: "linear-gradient(to bottom right, #0d0d1e, #141432)",
      text: "#ffffff",
      accent: "#ff6b6b",
      cardBg: "rgba(255, 255, 255, 0.03)",
      cardBorder: "rgba(255, 255, 255, 0.08)",
      buttonBg: "rgba(255, 255, 255, 0.05)",
      buttonBorder: "1px solid rgba(255, 255, 255, 0.1)",
      buttonText: "#ffffff"
    },
    "sunset": {
      bg: "linear-gradient(to bottom, #1f0d0d, #0d0303)",
      text: "#fff0eb",
      accent: "#ff9233",
      cardBg: "rgba(31, 13, 13, 0.7)",
      cardBorder: "rgba(255, 146, 51, 0.2)",
      buttonBg: "rgba(255, 146, 51, 0.1)",
      buttonBorder: "1px solid #ff9233",
      buttonText: "#ff9233"
    }
  };

  const selectedMockupTheme = mockupThemes[activeThemeId];

  // FAQ mock database
  const faqs = [
    {
      q: "What is LinkNest?",
      a: "LinkNest is a premium 'Link in Bio' platform designed for creators, SaaS builders, and professionals. It allows you to create a customized profile page to aggregate all your links, portfolios, payment integrations, social media profiles, and more in a single premium URL."
    },
    {
      q: "Can I accept payments directly on my page?",
      a: "Yes! LinkNest provides direct UPI and WhatsApp message shortcuts out-of-the-box. Premium users can also create checkout nodes to handle monetization or subscriptions."
    },
    {
      q: "How does the custom domain feature work?",
      a: "Premium members can link their personal domain (e.g. links.yourname.com) directly to their LinkNest profile. We configure the SSL certification and route traffic automatically."
    },
    {
      q: "Do you have real-time analytics?",
      a: "Yes! We track total visitors, button clicks, geographic locations, browser versions, and device types, presenting everything in interactive charts on your dashboard."
    },
    {
      q: "Can I try all features for free?",
      a: "Yes, you can register and create a bio link for free instantly. If you need unlimited links, premium animation cards, advanced custom themes, or tracking, you can upgrade to Premium starting at just ₹99/month."
    }
  ];

  const handleToggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className={styles.container}>
      <ParticlesBackground />
      <div className="bg-blob bg-blob-blue" />
      <div className="bg-blob bg-blob-purple" />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <Compass className={styles.logoIcon} size={28} />
          <span>LinkNest</span>
        </div>
        <nav className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>Features</a>
          <a href="#preview" className={styles.navLink}>Live Demo</a>
          <a href="#pricing" className={styles.navLink}>Pricing</a>
          <a href="#faq" className={styles.navLink}>FAQ</a>
        </nav>
        <div className={styles.authButtons}>
          {user ? (
            <Link href="/dashboard" className="neon-btn">
              Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link href="/login" className={styles.navLink} style={{ marginRight: 8 }}>
                Login
              </Link>
              <Link href="/register" className="neon-btn">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Sparkles size={14} />
            <span>Next-Generation Bio Pages</span>
          </div>
          <h1 className={styles.title}>
            Your Entire Online Presence in <span className="gradient-text">One Beautiful Link</span>
          </h1>
          <p className={styles.subtitle}>
            Create your own smart bio page with social links, portfolio, payment routes, traffic analytics, and premium customization in seconds.
          </p>
          <div className={styles.heroCTAs}>
            <Link href={user ? "/dashboard" : "/register"} className="neon-btn">
              Get Started Free <ArrowRight size={16} />
            </Link>
            <a href="#preview" className="neon-btn-secondary">
              View Demo
            </a>
          </div>
        </div>

        {/* Live Mockup Preview Column */}
        <div className={styles.previewContainer} id="preview">
          <div 
            className={styles.phoneMockup}
            style={{
              background: selectedMockupTheme.bg,
              color: selectedMockupTheme.text,
            }}
          >
            <div className={styles.phoneCamera} />
            
            <div className={styles.mockupProfile}>
              <div className={styles.mockupAvatar}>
                LN
              </div>
              <h3 className={styles.mockupName}>
                @gowtham
                <span className={styles.verifiedBadge}>
                  <CheckCircle size={14} fill="currentColor" stroke="#030308" />
                </span>
              </h3>
              <p className={styles.mockupBio}>
                Full-stack developer building futuristic tools. Welcome to my nest! ✨
              </p>
            </div>

            <div className={styles.mockupLinks}>
              <div 
                className={styles.mockupLink}
                style={{
                  background: selectedMockupTheme.buttonBg,
                  borderColor: selectedMockupTheme.buttonBorder.split(" ")[2] || "transparent",
                  border: selectedMockupTheme.buttonBorder,
                  color: selectedMockupTheme.buttonText,
                  boxShadow: activeThemeId === "cyberpunk" || activeThemeId === "neon-blue" ? `0 0 10px ${selectedMockupTheme.accent}44` : "none"
                }}
              >
                <span>🚀 LinkNest Premium SaaS</span>
                <ExternalLink size={12} />
              </div>
              <div 
                className={styles.mockupLink}
                style={{
                  background: selectedMockupTheme.buttonBg,
                  borderColor: selectedMockupTheme.buttonBorder.split(" ")[2] || "transparent",
                  border: selectedMockupTheme.buttonBorder,
                  color: selectedMockupTheme.buttonText
                }}
              >
                <span>💼 Design Portfolio</span>
                <ExternalLink size={12} />
              </div>
              <div 
                className={styles.mockupLink}
                style={{
                  background: selectedMockupTheme.buttonBg,
                  borderColor: selectedMockupTheme.buttonBorder.split(" ")[2] || "transparent",
                  border: selectedMockupTheme.buttonBorder,
                  color: selectedMockupTheme.buttonText
                }}
              >
                <span>☕ Buy Me a Coffee</span>
                <ExternalLink size={12} />
              </div>
              <div 
                className={styles.mockupLink}
                style={{
                  background: selectedMockupTheme.buttonBg,
                  borderColor: selectedMockupTheme.buttonBorder.split(" ")[2] || "transparent",
                  border: selectedMockupTheme.buttonBorder,
                  color: selectedMockupTheme.buttonText
                }}
              >
                <span>💬 WhatsApp Inquiry</span>
                <ExternalLink size={12} />
              </div>
            </div>

            <div className={styles.mockupSocials}>
              <span className={styles.mockupSocialIcon}><Instagram size={14} /></span>
              <span className={styles.mockupSocialIcon}><Twitter size={14} /></span>
              <span className={styles.mockupSocialIcon}><Github size={14} /></span>
              <span className={styles.mockupSocialIcon}><MessageCircle size={14} /></span>
            </div>
          </div>

          {/* Theme Bubble Switcher */}
          <div className={styles.themeSelector}>
            <span className={styles.sectionSubtitle} style={{ fontSize: 12, marginRight: 8 }}>Try Themes:</span>
            {Object.keys(mockupThemes).map((themeId) => (
              <div
                key={themeId}
                className={`${styles.themeBubble} ${activeThemeId === themeId ? styles.themeBubbleActive : ""}`}
                style={{
                  background: 
                    themeId === "neon-blue" ? "#00d2ff" :
                    themeId === "neon-purple" ? "#a855f7" :
                    themeId === "cyberpunk" ? "#ff007f" :
                    themeId === "glass-dark" ? "rgba(255,255,255,0.4)" :
                    themeId === "sunset" ? "#ff9233" : "#ffffff"
                }}
                onClick={() => setActiveThemeId(themeId)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features} id="features">
        <div className={styles.sectionHeader}>
          <div className={styles.badge}>
            <Zap size={12} />
            <span>Built For Creators</span>
          </div>
          <h2 className={styles.sectionTitle}>Stunning Features, Maximum Impact</h2>
          <p className={styles.sectionSubtitle}>
            Everything you need to showcase your talent, connect with followers, and monitor analytics.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={`${styles.featureCard} glass-card`}>
            <div className={styles.featureIcon}>
              <Sparkles size={20} />
            </div>
            <h3 className={styles.featureCardTitle}>Highly Customizable Themes</h3>
            <p className={styles.featureCardDesc}>
              Pick from our collection of 10 free and 20 premium gorgeous gradient and glassmorphism templates, or build your own from scratch.
            </p>
          </div>

          <div className={`${styles.featureCard} glass-card`}>
            <div className={styles.featureIcon}>
              <BarChart3 size={20} />
            </div>
            <h3 className={styles.featureCardTitle}>Advanced Traffic Analytics</h3>
            <p className={styles.featureCardDesc}>
              Track real-time visitors, link clicks, device categories, browser client types, and country locations from a single dashboard.
            </p>
          </div>

          <div className={`${styles.featureCard} glass-card`}>
            <div className={styles.featureIcon}>
              <CreditCard size={20} />
            </div>
            <h3 className={styles.featureCardTitle}>Payments & Instant Chats</h3>
            <p className={styles.featureCardDesc}>
              Integrate direct UPI payment anchors, custom WhatsApp dynamic links, and portfolio resources directly to collect leads and monetize.
            </p>
          </div>

          <div className={`${styles.featureCard} glass-card`}>
            <div className={styles.featureIcon}>
              <Globe size={20} />
            </div>
            <h3 className={styles.featureCardTitle}>Premium Custom Domains</h3>
            <p className={styles.featureCardDesc}>
              Connect your own custom domain (e.g. links.yourbrand.com) and replace our default styling brand for a truly white-labeled presence.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className={styles.pricing} id="pricing">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Fair, Simple Pricing</h2>
          <p className={styles.sectionSubtitle}>
            Start for free and scale with premium customization and traffic tracking tools.
          </p>
        </div>

        {/* Monthly/Yearly toggle */}
        <div className={styles.billingToggle}>
          <button
            className={`${styles.billingBtn} ${billingCycle === "monthly" ? styles.billingBtnActive : ""}`}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </button>
          <button
            className={`${styles.billingBtn} ${billingCycle === "yearly" ? styles.billingBtnActive : ""}`}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly (Save 15%)
          </button>
        </div>

        <div className={styles.pricingGrid}>
          {/* Free Plan */}
          <div className={`${styles.pricingCard} glass-card`}>
            <span className={styles.pricingPlan}>Free Tier</span>
            <div className={styles.pricingPrice}>
              <span className={styles.priceNum}>₹0</span>
              <span className={styles.pricePeriod}>/ forever</span>
            </div>
            <p className={styles.sectionSubtitle} style={{ fontSize: 14 }}>
              Perfect for getting started with standard links.
            </p>
            <div className={styles.pricingFeatures}>
              <div className={styles.pricingFeatureItem}>
                <Check size={16} className={styles.pricingFeatureIcon} />
                <span>Up to 5 Links</span>
              </div>
              <div className={styles.pricingFeatureItem}>
                <Check size={16} className={styles.pricingFeatureIcon} />
                <span>10 Standard Free Themes</span>
              </div>
              <div className={styles.pricingFeatureItem}>
                <Check size={16} className={styles.pricingFeatureIcon} />
                <span>WhatsApp and UPI Integration</span>
              </div>
              <div className={styles.pricingFeatureItem}>
                <Check size={16} className={styles.pricingFeatureIconDisabled} />
                <span className={styles.pricingFeatureTextDisabled}>Live Analytics Tracking</span>
              </div>
              <div className={styles.pricingFeatureItem}>
                <Check size={16} className={styles.pricingFeatureIconDisabled} />
                <span className={styles.pricingFeatureTextDisabled}>Custom Domains (DNS)</span>
              </div>
              <div className={styles.pricingFeatureItem}>
                <Check size={16} className={styles.pricingFeatureIconDisabled} />
                <span className={styles.pricingFeatureTextDisabled}>Remove LinkNest Branding</span>
              </div>
            </div>
            <Link href={user ? "/dashboard" : "/register"} className="neon-btn-secondary" style={{ marginTop: "auto" }}>
              Get Started Free
            </Link>
          </div>

          {/* Premium Plan */}
          <div className={`${styles.pricingCard} ${styles.pricingCardPopular} glass-card`}>
            <span className={styles.popularBadge}>Recommended</span>
            <span className={styles.pricingPlan} style={{ color: "var(--neon-blue)" }}>Pro Premium</span>
            <div className={styles.pricingPrice}>
              <span className={styles.priceNum}>
                {billingCycle === "monthly" ? "₹99" : "₹999"}
              </span>
              <span className={styles.pricePeriod}>
                {billingCycle === "monthly" ? "/ month" : "/ year"}
              </span>
            </div>
            <p className={styles.sectionSubtitle} style={{ fontSize: 14 }}>
              Unlock the complete custom styling, domain configurations and data analytics tools.
            </p>
            <div className={styles.pricingFeatures}>
              <div className={styles.pricingFeatureItem}>
                <Check size={16} className={styles.pricingFeatureIcon} />
                <span><strong>Unlimited Links</strong></span>
              </div>
              <div className={styles.pricingFeatureItem}>
                <Check size={16} className={styles.pricingFeatureIcon} />
                <span>30 Premium & Standard Themes</span>
              </div>
              <div className={styles.pricingFeatureItem}>
                <Check size={16} className={styles.pricingFeatureIcon} />
                <span>Interactive Traffic Dashboard</span>
              </div>
              <div className={styles.pricingFeatureItem}>
                <Check size={16} className={styles.pricingFeatureIcon} />
                <span>Custom Domain Linking</span>
              </div>
              <div className={styles.pricingFeatureItem}>
                <Check size={16} className={styles.pricingFeatureIcon} />
                <span>No LinkNest Brand Banner</span>
              </div>
              <div className={styles.pricingFeatureItem}>
                <Check size={16} className={styles.pricingFeatureIcon} />
                <span>Priority Developer Support</span>
              </div>
            </div>
            <Link href={user ? "/dashboard" : "/register"} className="neon-btn" style={{ marginTop: "auto" }}>
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Loved by Thousands of Creators</h2>
          <p className={styles.sectionSubtitle}>See what other builders, content creators and professionals say about LinkNest.</p>
        </div>

        <div className={styles.testimonialsGrid}>
          <div className={`${styles.testimonialCard} glass-card`}>
            <p className={styles.testimonialText}>
              “LinkNest completely transformed my bio page. The neon dark-mode aesthetic is exactly what I wanted. My followers love the design, and I've noticed a major bump in engagement.”
            </p>
            <div className={styles.testimonialUser}>
              <div className={styles.testimonialUserAvatar}>AR</div>
              <div>
                <h4 className={styles.testimonialUserName}>Aarav Roy</h4>
                <p className={styles.testimonialUserTitle}>Tech YouTuber</p>
              </div>
            </div>
          </div>

          <div className={`${styles.testimonialCard} glass-card`}>
            <p className={styles.testimonialText}>
              “The analytics tools are fantastic. Knowing exactly which links get clicked and which countries they come from has made adjusting my marketing channels simple and fast.”
            </p>
            <div className={styles.testimonialUser}>
              <div className={styles.testimonialUserAvatar}>KS</div>
              <div>
                <h4 className={styles.testimonialUserName}>Kavya Sharma</h4>
                <p className={styles.testimonialUserTitle}>Indie Hacker & Builder</p>
              </div>
            </div>
          </div>

          <div className={`${styles.testimonialCard} glass-card`}>
            <p className={styles.testimonialText}>
              “I love how clean the payments look. My clients can click my UPI link or send a WhatsApp message to book consultation hours immediately. Truly worth the premium upgrade.”
            </p>
            <div className={styles.testimonialUser}>
              <div className={styles.testimonialUserAvatar}>VK</div>
              <div>
                <h4 className={styles.testimonialUserName}>Vikram Krishnan</h4>
                <p className={styles.testimonialUserTitle}>Freelance UX Designer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faq} id="faq">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <p className={styles.sectionSubtitle}>Have questions about LinkNest? We've got answers.</p>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <button 
                className={styles.faqQuestion}
                onClick={() => handleToggleFaq(index)}
              >
                <span>{faq.q}</span>
                <ChevronDown 
                  size={18} 
                  style={{ 
                    transform: activeFaq === index ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                    color: "var(--neon-blue)"
                  }} 
                />
              </button>
              {activeFaq === index && (
                <div className={styles.faqAnswer}>
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogoInfo}>
            <div className={styles.logo}>
              <Compass className={styles.logoIcon} size={24} />
              <span>LinkNest</span>
            </div>
            <p className={styles.footerDesc}>
              Simplify your presence. Aggregate links, portfolios, UPI checkouts, and custom media in a single link.
            </p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerCol}>
              <span className={styles.footerColTitle}>Product</span>
              <div className={styles.footerColLinks}>
                <a href="#features" className={styles.footerColLink}>Features</a>
                <a href="#preview" className={styles.footerColLink}>Demo</a>
                <a href="#pricing" className={styles.footerColLink}>Pricing</a>
              </div>
            </div>
            <div className={styles.footerCol}>
              <span className={styles.footerColTitle}>Legal</span>
              <div className={styles.footerColLinks}>
                <a href="#" className={styles.footerColLink}>Privacy Policy</a>
                <a href="#" className={styles.footerColLink}>Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} LinkNest. All rights reserved.</span>
          <span>Made for developers and creators.</span>
        </div>
      </footer>
    </div>
  );
}
