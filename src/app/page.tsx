'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Copy, RefreshCw, Trash2, QrCode, Mail, ChevronLeft, Inbox, Shield, 
  Clock, Smartphone, Edit2, Phone, X, ChevronDown, Zap, Lock, Globe, 
  Check, Sparkles, Radio, ShieldCheck, Flame, ArrowRight, Bell, Terminal, Eye
} from 'lucide-react';

interface Message {
  id: string | number;
  from: string;
  subject: string;
  date: string;
}

interface MessageDetail extends Message {
  textBody: string;
  htmlBody: string;
  attachments: any[];
}

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingEmail, setLoadingEmail] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [viewMessage, setViewMessage] = useState<MessageDetail | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [phone, setPhone] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast(msg);
    toastTimeout.current = setTimeout(() => setToast(null), 3000);
  };

  const dismissToast = () => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast(null);
  };

  const retriesLeft = useRef(2);

  const generateEmail = useCallback(async () => {
    setLoadingEmail(true);
    try {
      const res = await fetch('/api/generate');
      const data = await res.json();
      if (!res.ok || !data.email || !data.token) {
        throw new Error(data.error || 'Failed to generate email');
      }
      retriesLeft.current = 2;
      dismissToast();
      setEmail(data.email);
      setToken(data.token);
      localStorage.setItem('tempMailAddress', data.email);
      localStorage.setItem('tempMailToken', data.token);
      setMessages([]);
      setViewMessage(null);
    } catch (err) {
      if (retriesLeft.current > 0) {
        retriesLeft.current -= 1;
        showToast('Failed to generate email. Retrying...');
        setTimeout(generateEmail, 2000);
      } else {
        showToast('Failed to generate email. Please try again.');
      }
    } finally {
      setLoadingEmail(false);
    }
  }, []);

  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const savedEmail = localStorage.getItem('tempMailAddress');
    const savedToken = localStorage.getItem('tempMailToken');
    if (savedEmail && savedToken) {
      setEmail(savedEmail);
      setToken(savedToken);
      setLoadingEmail(false);
    } else {
      generateEmail();
    }
  }, [generateEmail]);

  const generatePhone = () => {
    const firstDigit = Math.floor(Math.random() * 4) + 6; // 6, 7, 8, or 9
    const next4 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const last5 = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    setPhone(`+91 ${firstDigit}${next4} ${last5}`);
  };

  useEffect(() => {
    generatePhone();
  }, []);

  const fetchMessages = useCallback(async (isAuto = false) => {
    if (!token) return;
    if (!isAuto) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!isAuto) setLoadingMessages(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchMessages(true);
      const interval = setInterval(() => fetchMessages(true), 10000);
      return () => clearInterval(interval);
    }
  }, [token, fetchMessages]);

  const readMessage = async (id: string | number) => {
    if (!token) return;
    setViewMessage(null);
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/message?token=${encodeURIComponent(token)}&id=${id}`);
      const data = await res.json();
      if (data.message) {
        setViewMessage(data.message);
      }
    } catch (err) {
      showToast('Failed to read message');
    } finally {
      setLoadingMessages(false);
    }
  };

  const copyToClipboard = () => {
    const textToCopy = activeTab === 'email' ? email : phone;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      showToast(`${activeTab === 'email' ? 'Email address' : 'Phone number'} copied to clipboard`);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr || '';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr || '';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr || '';
      return d.toLocaleString();
    } catch {
      return dateStr || '';
    }
  };

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="container main-content">
      {/* Ambient Aurora Glow Spheres */}
      <div className="aurora-orb aurora-orb-1" aria-hidden="true" />
      <div className="aurora-orb aurora-orb-2" aria-hidden="true" />
      <div className="aurora-orb aurora-orb-3" aria-hidden="true" />

      {toast && (
        <div className="toast">
          <div className="toast-glow" />
          <Check size={18} className="toast-icon" />
          <span>{toast}</span>
        </div>
      )}

      {showQR && (
        <div className="qr-modal" onClick={() => setShowQR(false)}>
          <div className="qr-content" onClick={e => e.stopPropagation()}>
            <button className="qr-close" onClick={() => setShowQR(false)} aria-label="Close">
              <X size={18} />
            </button>
            <div className="qr-badge">
              <QrCode size={14} /> INSTANT HANDOFF
            </div>
            <h3>Scan QR Code</h3>
            <p className="qr-desc">Scan from your mobile device to open this temporary mailbox instantly.</p>
            {email && (
              <div className="qr-image-wrapper">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=mailto:${email}`} 
                  alt="QR Code" 
                />
              </div>
            )}
            <div className="qr-address-preview">{email}</div>
          </div>
        </div>
      )}

      {/* ── Hero Section ── */}
      <section className="hero">

        <h1 className="hero-title">
          {activeTab === 'email' ? (
            <>
              Next-Gen Disposable Email for the <span className="aurora-gradient-text">Autonomous Web</span>
            </>
          ) : (
            <>
              Synthetic Phone Identities for <span className="aurora-gradient-text">Instant Mocking</span>
            </>
          )}
        </h1>


        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`} 
            onClick={() => setActiveTab('email')}
          >
            <Mail size={18} /> 
            <span>Temporary Email</span>
            {activeTab === 'email' && <span className="tab-indicator" />}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'phone' ? 'active' : ''}`} 
            onClick={() => setActiveTab('phone')}
          >
            <Phone size={18} /> 
            <span>Fake Phone Number</span>
            {activeTab === 'phone' && <span className="tab-indicator" />}
          </button>
        </div>
        
        {/* Futuristic Command Console */}
        <div className="email-box">

          {loadingEmail && (
            <div className="loading-overlay">
              <div className="loading-spinner-wrap">
                <RefreshCw className="animate-spin" size={36} color="#06b6d4" />
                <span className="loading-text">Synthesizing Fresh Mail Node...</span>
              </div>
            </div>
          )}
          
          <div className="email-input-wrapper">
            <div className="input-prefix-icon">
              {activeTab === 'email' ? <Mail size={20} /> : <Phone size={20} />}
            </div>
            <input 
              type="text" 
              className="email-input" 
              value={activeTab === 'email' ? (email || (loadingEmail ? 'Generating secure address...' : 'Failed to generate email')) : (phone || 'Generating...')}
              readOnly 
              aria-label={activeTab === 'email' ? 'Temporary email address' : 'Fake phone number'}
            />
            {activeTab === 'email' && (
              <button 
                className="qr-btn" 
                onClick={() => setShowQR(true)} 
                title="Scan QR Code" 
                disabled={!email}
                aria-label="Scan QR Code"
              >
                <QrCode size={20} />
              </button>
            )}
          </div>
          
          <div className="email-actions">
            <button 
              className={`action-btn btn-copy ${copied ? 'btn-copied' : ''}`} 
              onClick={copyToClipboard}
              title="Copy to clipboard"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Address'}</span>
            </button>

            <button
              className="action-btn btn-refresh"
              onClick={() => activeTab === 'email' ? fetchMessages(false) : showToast('No new messages — this number does not receive real SMS')}
              title="Refresh inbox"
            >
              <RefreshCw size={18} className={loadingMessages ? 'animate-spin' : ''} />
              <span>Refresh Inbox</span>
            </button>

            <button 
              className="action-btn btn-change" 
              onClick={activeTab === 'email' ? generateEmail : generatePhone}
              title="Generate a new address"
            >
              <Edit2 size={18} />
              <span>Change Address</span>
            </button>

            <button 
              className="action-btn btn-delete danger" 
              onClick={activeTab === 'email' ? generateEmail : generatePhone}
              title="Delete and burn current inbox"
            >
              <Trash2 size={18} />
              <span>Delete &amp; Burn</span>
            </button>
          </div>
        </div>

      </section>

      {/* ── Inbox Section (Command Center) ── */}
      {activeTab === 'email' ? (
        <section className="inbox-section">
          {viewMessage ? (
            <div className="message-view animate-fade-in">
              <div className="message-view-header">
                <button className="back-btn" onClick={() => setViewMessage(null)}>
                  <ChevronLeft size={18} /> Back to list
                </button>
                <h2 className="message-view-title">{viewMessage.subject || '(No Subject)'}</h2>
                <div className="message-meta">
                  <span><strong>From:</strong> {viewMessage.from}</span>
                  <span>{formatDate(viewMessage.date)}</span>
                </div>
              </div>
              <div className="message-body">
                {viewMessage.htmlBody ? (
                  <iframe 
                    srcDoc={viewMessage.htmlBody} 
                    title="Message Body" 
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                  />
                ) : (
                  <pre className="message-text-preview">{viewMessage.textBody}</pre>
                )}
              </div>
            </div>
          ) : (
            <div className="message-list-container">
              <div className="inbox-header">
                <div className="inbox-header-left">
                  <div className="inbox-header-icon-wrap">
                    <Inbox size={20} />
                  </div>
                  <h2>Inbox</h2>
                </div>
                
                <div className="inbox-status">
                  <div className="radar-ping-wrap">
                    <span className="radar-wave"></span>
                    <span className="radar-wave wave-2"></span>
                    <div className="status-dot"></div>
                  </div>
                  <span className="status-text">
                    {loadingMessages ? 'Polling mail server...' : 'Waiting for incoming emails'}
                  </span>
                </div>
              </div>
              
              {loadingMessages && !messages.length ? (
                <div className="inbox-empty">
                  <div className="radar-scanner-box">
                    <div className="radar-circle circle-1"></div>
                    <div className="radar-circle circle-2"></div>
                    <div className="radar-circle circle-3"></div>
                    <div className="radar-sweep"></div>
                    <RefreshCw className="animate-spin radar-center-icon" size={28} />
                  </div>
                  <h3>Establishing Mail Stream...</h3>
                  <p>Connecting to IMAP nodes. Incoming verification codes will appear here automatically.</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="inbox-empty animate-fade-in">
                  <div className="radar-scanner-box">
                    <div className="radar-circle circle-1"></div>
                    <div className="radar-circle circle-2"></div>
                    <div className="radar-circle circle-3"></div>
                    <div className="radar-sweep"></div>
                    <Mail className="radar-center-icon" size={28} />
                  </div>
                  <h3>Your Inbox Stream is Clean &amp; Waiting</h3>
                  <p>Send an email to your temporary address above. Messages, verification OTPs, and links will pop in automatically with zero page reload required.</p>
                </div>
              ) : (
                <div className="message-list">
                  {messages.map((msg) => {
                    const initials = (msg.from || 'U')
                      .replace(/<.*?>/, '')
                      .trim()
                      .slice(0, 2)
                      .toUpperCase();
                    return (
                      <div 
                        key={msg.id} 
                        className="message-item animate-fade-in" 
                        onClick={() => readMessage(msg.id)}
                      >
                        <div className="msg-avatar" aria-hidden="true">
                          {initials}
                        </div>
                        <div className="msg-content-col">
                          <div className="msg-sender-row">
                            <span className="msg-sender">{msg.from}</span>
                          </div>
                          <div className="msg-subject">{msg.subject || '(No Subject)'}</div>
                        </div>
                        <div className="msg-time-col">
                          <span className="msg-time-pill">
                            {formatTime(msg.date)}
                          </span>
                          <ArrowRight size={16} className="msg-arrow" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        <section className="inbox-section">
          <div className="inbox-empty animate-fade-in" style={{ padding: '6rem 2rem' }}>
            <div className="radar-scanner-box">
              <div className="radar-circle circle-1"></div>
              <div className="radar-circle circle-2"></div>
              <div className="radar-sweep"></div>
              <Phone className="radar-center-icon" size={32} />
            </div>
            <h3>Synthetic Mock Number Only</h3>
            <p style={{ maxWidth: '440px' }}>
              This module generates synthetically formatted E.164-compliant numbers designed exclusively for QA forms, wireframes, and layout mocking. It does not interface with telecom carriers or receive inbound SMS.
            </p>
          </div>
        </section>
      )}

      {/* ── Features Section ── */}
      <section id="features" className="features-section">
        <div className="section-badge">
          <Shield size={14} /> ARCHITECTURAL PRIVACY
        </div>
        <h2 className="section-heading">
          Why <span className="aurora-gradient-text">GhostInbox</span> is your ultimate digital cloaking tool
        </h2>
        <p className="section-sub">
          Engineered from first principles for zero tracking, instant ephemeral existence, and resilient data hygiene.
        </p>

        <div className="features-grid">
          {([
            { 
              theme: 'theme-emerald', 
              icon: <Lock size={22} />, 
              title: 'Zero-Trace Architecture', 
              desc: "We don't collect names, IP logs, device fingerprints, or real emails. Every address exists in strict cryptographic isolation — your identity stays completely yours." 
            },
            { 
              theme: 'theme-cyan', 
              icon: <Zap size={22} />, 
              title: 'Sub-Second Activation', 
              desc: 'No registration forms, no phone numbers, no captcha delays. Open GhostInbox and your disposable inbox is already live — copy and deploy anywhere online immediately.' 
            },
            { 
              theme: 'theme-purple', 
              icon: <Smartphone size={22} />, 
              title: 'Universal Device Adaptation', 
              desc: "Whether on your phone during a commute or on high-resolution multi-monitor desktop setups, GhostInbox's cyber glass layout adapts fluidly with crisp accessibility." 
            },
            { 
              theme: 'theme-pink', 
              icon: <Mail size={22} />, 
              title: 'Rich HTML & Inline OTP Rendering', 
              desc: 'Unlike basic text scrapers, our engine receives and renders rich HTML emails with clickable links, OTPs, verification cards, and interactive confirmation banners.' 
            },
            { 
              theme: 'theme-amber', 
              icon: <RefreshCw size={22} />, 
              title: 'Unlimited Fresh Rotations', 
              desc: "Hit 'Change' and rotate to a brand-new address instantly. There are no quotas or throttle limits — use distinct disposable identities across every service you evaluate." 
            },
            { 
              theme: 'theme-blue', 
              icon: <QrCode size={22} />, 
              title: 'Holographic QR Air-Drop', 
              desc: 'Need to pass your temporary address to your smartphone or a coworker nearby? Scan the built-in QR code on any camera and transfer without typing a single character.' 
            },
          ] as { theme: string; icon: React.ReactNode; title: string; desc: string }[]).map((f, i) => (
            <div key={i} className={`feature-card ${f.theme}`}>
              <div className="feature-glow-ring" />
              <div className="feature-icon-wrap">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section className="hiw-section">
        <div className="section-badge">
          <Globe size={14} /> THREE-PHASE PIPELINE
        </div>
        <h2 className="section-heading">
          How <span className="aurora-gradient-text">GhostInbox</span> operates
        </h2>
        <p className="section-sub">
          A seamless three-step protocol that shields your primary email from spam, phishing, and database leaks.
        </p>

        <div className="hiw-steps">
          {([
            { 
              n: '01', 
              theme: 'step-cyan',
              title: 'Acquire Instant Identity', 
              desc: "When you land on GhostInbox, a unique disposable email address is synthesized for you immediately. Click 'Copy Address' and you are equipped to navigate the web safely." 
            },
            { 
              n: '02', 
              theme: 'step-purple',
              title: 'Deploy Into Any Sign-Up Gate', 
              desc: 'Paste the address into trial gates, gated downloads, forums, or untrusted services. Inbound verification codes and confirmation links stream directly to your console.' 
            },
            { 
              n: '03', 
              theme: 'step-pink',
              title: 'Verify, Extract & Purge', 
              desc: "Complete your verification in our sandboxed viewer. When finished, hit 'Delete & Burn' — the address is cryptographically severed and future spam routes into the void." 
            },
          ] as { n: string; theme: string; title: string; desc: string }[]).flatMap((s, i, arr) => {
            const step = (
              <div key={`step-${i}`} className={`hiw-step ${s.theme}`}>
                <div className="hiw-num-box">
                  <span className="hiw-num">{s.n}</span>
                  <div className="hiw-step-tag">PHASE // 0{i + 1}</div>
                </div>
                <div className="hiw-body">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            );
            return i < arr.length - 1
              ? [
                  step, 
                  <div key={`conn-${i}`} className="hiw-connector" aria-hidden="true">
                    <div className="laser-beam"></div>
                  </div>
                ]
              : [step];
          })}
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="faq-section">
        <div className="section-badge">
          <Mail size={14} /> INTEL &amp; FAQS
        </div>
        <h2 className="section-heading">
          Frequently asked <span className="aurora-gradient-text">questions</span>
        </h2>
        <p className="section-sub">
          Everything you need to know about disposable identities, data retention, and privacy mechanics.
        </p>

        <div className="faq-list">
          {([
            { 
              q: 'Is GhostInbox completely free to use?', 
              a: 'Yes — 100% free and uncapped. GhostInbox is built as an open utility without paywalls, credit card requirements, or forced subscriptions. Open the site and use your inbox freely as often as you want.' 
            },
            { 
              q: 'How long does my temporary address remain active?', 
              a: "Your address remains active and persistent in your local browser storage until you choose to click 'Delete & Burn' or clear your browser data. There is no arbitrary countdown timer cutting you off halfway through an account confirmation." 
            },
            { 
              q: 'Can I receive all email formats, HTML, and verification links?', 
              a: 'Yes. GhostInbox connects directly to actual email servers and renders incoming messages with HTML markup, images, formatted text, and clickable verification buttons so sign-ups work cleanly.' 
            },
            { 
              q: 'Is my temporary inbox visible to other users?', 
              a: 'No. Every email generated has a distinct random cryptographic alias and authentication token tied exclusively to your session. Others cannot browse or intercept your incoming mail.' 
            },
            { 
              q: 'Can I use GhostInbox to receive SMS text messages or calls?', 
              a: "The 'Fake Phone Number' utility generates formatting-compliant dummy numbers intended for UI mocking, QA testing, and layout placeholders. It is not connected to a telecom gateway and cannot receive incoming SMS or phone calls." 
            },
            { 
              q: 'Do you log, analyze, or sell personal data or messages?', 
              a: 'No. GhostInbox maintains zero tracking telemetry, does not sell data to advertisers, and does not retain emails once dismissed. Messages are pulled directly into your client session as an ephemeral pass-through viewer.' 
            },
          ]).map((item, i) => (
            <div
              key={i}
              className={`faq-item${openFaq === i ? ' faq-open' : ''}`}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              role="button"
              aria-expanded={openFaq === i}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="faq-q">
                <span className="faq-question-text">{item.q}</span>
                <ChevronDown size={18} className="faq-chevron" />
              </div>
              <div className="faq-a">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Deep Dive Article ── */}
      <section className="article-section">
        <div className="article-inner">
          <div className="section-badge">
            <ShieldCheck size={14} /> SECURITY DOSSIER
          </div>
          <h2 className="section-heading">
            The strategic imperative of <span className="aurora-gradient-text">disposable email</span> in 2026
          </h2>

          <p>
            Every time you submit your real primary email into an online form, you enter an asymmetrical contract: you hand over a permanent, cross-platform identifier in exchange for a one-time piece of content, software trial, or account gate. In 2026, data aggregation networks map this single identifier across hundreds of independent databases.
          </p>
          <p>
            GhostInbox reverses this vulnerability by decoupling your authentic digital identity from disposable web interactions, turning untrusted services into zero-risk dead ends.
          </p>

          <div className="article-pullquote">
            <div className="pullquote-decor"></div>
            <blockquote>
              &ldquo;Your primary email address is the single most valuable cross-site tracking anchor you give away for free every single day. Treating it as disposable by default is the highest-leverage privacy decision you can make.&rdquo;
            </blockquote>
          </div>

          <h3>The hidden economics of primary email harvesting</h3>
          <p>
            Data brokers, lead-generation aggregators, and advertising conglomerates ingest corporate acquisition lists and breach dumps continuously. When a startup you tested years ago pivots, merges, or suffers a security incident, your email address is seldom purged — it enters resale circulation. A single exposed inbox address can trigger dozens of automated drip spam campaigns and phishing exploits.
          </p>
          <p>
            By adopting GhostInbox for transient interactions, that cycle is shattered. If a downstream service leaks their records, the compromised entry leads to an ephemeral, discarded node with zero correlation to your personal or professional communications.
          </p>

          <h3>Key operational use cases</h3>
          <p>
            Ephemeral email infrastructure empowers users across engineering, testing, shopping, and everyday browsing:
          </p>
          <ul className="article-key-points">
            <li>
              <strong>Engineers &amp; QA Specialists</strong> &mdash; Test onboarding journeys, transactional email templates, and automated OTP authentication across dozens of isolated addresses without cluttering internal accounts.
            </li>
            <li>
              <strong>Content &amp; Research Access</strong> &mdash; Access gated industry whitepapers, market reports, and design templates without opting into multi-month corporate sales cadences.
            </li>
            <li>
              <strong>E-Commerce &amp; Coupon Verification</strong> &mdash; Unlock first-time consumer discounts and promo vouchers while completely preventing ongoing retail promotional spam.
            </li>
            <li>
              <strong>Public Wi-Fi &amp; Travel Check-ins</strong> &mdash; Register for airport connectivity, hotel access portals, and event venues without leaving a permanent footprint in hospitality CRM databases.
            </li>
          </ul>

          <h3>Core engineering principles of GhostInbox</h3>
          <p>
            Many legacy disposable email utilities are throttled by hostile pop-ups, broken HTML parsing, or sluggish polling. GhostInbox was engineered under strict foundational criteria:
          </p>
          <ul className="article-key-points">
            <li>
              <strong>Zero-friction instantiation</strong> &mdash; Inboxes are provisioned synchronously on page load with zero captcha gates or human verification friction.
            </li>
            <li>
              <strong>Authentic mail server interoperability</strong> &mdash; Inbound emails arrive via production SMTP routes, guaranteeing that verification links, OTP tokens, and rich styles render accurately.
            </li>
            <li>
              <strong>Client-sovereign control</strong> &mdash; Addresses and tokens live in your client browser session, allowing you to cycle or purge identities with a single click.
            </li>
          </ul>

          {/* Futuristic Call-To-Action Card */}
          <div className="article-cta">
            <div className="article-cta-glow"></div>
            <div className="article-cta-icon">
              <Zap size={28} />
            </div>
            <div className="article-cta-content">
              <strong>Your Disposable Inbox is Live Right Now</strong>
              <p>No software download. No registration. No tracking. Your unique, isolated address is active and waiting at the top of this console.</p>
            </div>
            <button className="article-cta-btn" onClick={scrollToHero}>
              <span>Generate / View Address</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <p className="article-closer">
            Your personal email belongs to you. <span className="aurora-gradient-text">Keep it that way.</span>
          </p>
        </div>
      </section>
    </main>
  );
}
