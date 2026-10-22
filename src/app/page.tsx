'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Copy, RefreshCw, Trash2, QrCode, Mail, ChevronLeft, Inbox, Shield, Clock, Smartphone, Edit2, Phone, X } from 'lucide-react';

interface Message {
  id: number;
  from: string;
  subject: string;
  date: string;
}

interface MessageDetail extends Message {
  textBody: string;
  htmlBody: string;
  attachments: any[];
}

interface Article {
  id: number;
  title: string;
  description: string;
  url: string;
  social_image: string;
}

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingEmail, setLoadingEmail] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [viewMessage, setViewMessage] = useState<MessageDetail | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [phone, setPhone] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);

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
      if (!res.ok || !data.email) {
        throw new Error(data.error || 'Failed to generate email');
      }
      retriesLeft.current = 2;
      dismissToast();
      setEmail(data.email);
      localStorage.setItem('tempMailAddress', data.email);
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
    if (savedEmail) {
      setEmail(savedEmail);
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

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch('https://dev.to/api/articles?tag=privacy&per_page=6');
        const data = await res.json();
        if (Array.isArray(data)) {
          setArticles(data);
        }
      } catch (err) {
        console.error('Failed to fetch articles:', err);
      }
    };
    fetchArticles();
  }, []);

  const fetchMessages = useCallback(async (isAuto = false) => {
    if (!email) return;
    if (!isAuto) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages?email=${email}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!isAuto) setLoadingMessages(false);
    }
  }, [email]);

  useEffect(() => {
    if (email) {
      fetchMessages(true);
      const interval = setInterval(() => fetchMessages(true), 10000);
      return () => clearInterval(interval);
    }
  }, [email, fetchMessages]);

  const readMessage = async (id: number) => {
    setViewMessage(null);
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/message?email=${email}&id=${id}`);
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
      showToast(`${activeTab === 'email' ? 'Email address' : 'Phone number'} copied to clipboard`);
    }
  };

  return (
    <main className="container">
      {toast && <div className="toast">{toast}</div>}

      {showQR && (
        <div className="qr-modal" onClick={() => setShowQR(false)}>
          <div className="qr-content" onClick={e => e.stopPropagation()}>
            <button className="qr-close" onClick={() => setShowQR(false)} aria-label="Close">
              <X size={18} />
            </button>
            <h3>Scan QR Code</h3>
            {email && <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=mailto:${email}`} alt="QR Code" />}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`} onClick={() => setActiveTab('email')}>
            <Mail size={20} /> Temporary Email
          </button>
          <button className={`tab-btn ${activeTab === 'phone' ? 'active' : ''}`} onClick={() => setActiveTab('phone')}>
            <Phone size={20} /> Fake Phone Number
          </button>
        </div>

        <h1>{activeTab === 'email' ? 'Your Temporary Email Address' : 'Your Fake Phone Number'}</h1>
        <p>{activeTab === 'email' ? 'Forget about spam, advertising mailings, hacking and attacking robots. Keep your real mailbox clean and secure.' : 'Generate a random, fake phone number for testing or placeholders.'}</p>
        
        <div className="email-box">
          {loadingEmail && (
            <div className="loading-overlay">
              <RefreshCw className="animate-spin" size={32} color="#10b981" />
            </div>
          )}
          
          <div className="email-input-wrapper">
            <input 
              type="text" 
              className="email-input" 
              value={activeTab === 'email' ? (email || (loadingEmail ? 'Loading...' : 'Failed to generate email')) : (phone || 'Generating...')}
              readOnly 
            />
            {activeTab === 'email' && (
              <button className="qr-btn" onClick={() => setShowQR(true)} title="QR Code" disabled={!email}>
                <QrCode size={24} />
              </button>
            )}
          </div>
          
          <div className="email-actions">
            <button className="action-btn" onClick={copyToClipboard}>
              <Copy size={20} /> Copy
            </button>
            {activeTab === 'email' && (
              <button className="action-btn" onClick={() => fetchMessages(false)}>
                <RefreshCw size={20} className={loadingMessages ? 'animate-spin' : ''} /> Refresh
              </button>
            )}
            <button className="action-btn" onClick={activeTab === 'email' ? generateEmail : generatePhone}>
              <Edit2 size={20} /> Change
            </button>
            <button className="action-btn danger" onClick={activeTab === 'email' ? generateEmail : generatePhone}>
              <Trash2 size={20} /> Delete
            </button>
          </div>
        </div>
      </section>

      {/* Inbox Section */}
      {activeTab === 'email' ? (
        <section className="inbox-section">
          {viewMessage ? (
            <div className="message-view animate-fade-in">
              <div className="message-view-header">
                <button className="back-btn" onClick={() => setViewMessage(null)}>
                  <ChevronLeft size={20} /> Back to list
                </button>
                <h2 className="message-view-title">{viewMessage.subject || '(No Subject)'}</h2>
                <div className="message-meta">
                  <span><strong>From:</strong> {viewMessage.from}</span>
                  <span>{new Date(viewMessage.date).toLocaleString()}</span>
                </div>
              </div>
              <div className="message-body">
                {viewMessage.htmlBody ? (
                  <iframe srcDoc={viewMessage.htmlBody} title="Message Body" />
                ) : (
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{viewMessage.textBody}</pre>
                )}
              </div>
            </div>
          ) : (
            <div className="message-list-container">
              <div className="inbox-header">
                <h2><Inbox size={20} /> Inbox</h2>
                <div className="inbox-status">
                  <div className="status-dot"></div>
                  Waiting for incoming emails
                </div>
              </div>
              
              {loadingMessages && !messages.length ? (
                <div className="inbox-empty">
                  <RefreshCw className="animate-spin" size={32} />
                  <p>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="inbox-empty animate-fade-in">
                  <Mail />
                  <h3>Your inbox is empty</h3>
                  <p>Waiting for incoming emails...</p>
                </div>
              ) : (
                <div className="message-list">
                  {messages.map((msg) => (
                    <div key={msg.id} className="message-item animate-fade-in" onClick={() => readMessage(msg.id)}>
                      <div className="msg-sender">{msg.from}</div>
                      <div className="msg-subject">{msg.subject || '(No Subject)'}</div>
                      <div className="msg-time">{new Date(msg.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        <section className="inbox-section">
          <div className="inbox-empty animate-fade-in" style={{ padding: '6rem 2rem' }}>
            <Phone size={64} style={{ opacity: 0.2 }} />
            <h3>Fake Number Only</h3>
            <p style={{ maxWidth: '400px' }}>This feature generates a random formatting-compliant phone number for placeholder or testing purposes. It cannot send or receive SMS messages.</p>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="info-section">
        <h2>Why use a temporary email?</h2>
        <p>TempMail provides a free, secure, and disposable email address to help you protect your online privacy.</p>
        
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon"><Shield size={24} /></div>
            <h3>Protect your privacy</h3>
            <p>Avoid revealing your real email address. Protect yourself from spam, phishing, and unwanted promotional emails by using a disposable address.</p>
          </div>
          <div className="info-card">
            <div className="info-icon"><Clock size={24} /></div>
            <h3>Instant setup</h3>
            <p>No registration required. Your temporary email address is generated instantly and ready to receive emails from any sender immediately.</p>
          </div>
          <div className="info-card">
            <div className="info-icon"><Smartphone size={24} /></div>
            <h3>Mobile friendly</h3>
            <p>Our responsive design ensures that you can check your temporary inbox from any device, whether you're on a desktop, tablet, or smartphone.</p>
          </div>
        </div>
      </section>

      {/* Popular Articles Section */}
      {articles.length > 0 && (
        <section className="articles-section">
          <h2>Popular Articles</h2>
          <div className="articles-grid">
            {articles.map(article => (
              <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" className="article-card">
                <div className="article-content">
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                </div>
                <img src={article.social_image} alt={article.title} className="article-image" />
              </a>
            ))}
          </div>
        </section>
      )}
      {/* Deep Dive SEO Article Section */}
      <section className="long-article">
        <h2>The Technology Behind Disposable Email Addresses</h2>
        <p>Almost everyone requires an email address on a daily basis—whether it's for networking, corresponding with clients, keeping in touch with friends, or simply navigating the web. Today, nearly 99% of online services, apps, and forums demand an email address for registration, not to mention loyalty programs and promotional contests.</p>
        <p>While having an email address is essential, the sheer volume of spam that clutters our inboxes is incredibly frustrating. Moreover, data breaches are increasingly common; if an online store's database gets hacked, your primary email could be exposed and added to countless spam lists. Since true privacy is hard to guarantee online, safeguarding your identity is crucial, and the best way to do that is by using a disposable email address.</p>

        <h3>What Exactly Is a Disposable Email Address?</h3>
        <p>Have you ever noticed an unusual spike in bounce rates when sending out an email campaign? Often, this happens because users (or bots) sign up using temporary email addresses to mask their real identities.</p>
        <p>A disposable email address (DEA) is a system that allows users to generate a temporary, unique email address for immediate use. DEAs let you create an email that satisfies the validity requirements for signing up on websites and services without exposing your actual personal contact information.</p>
        <p>If a disposable email address is ever compromised or linked to spam, the owner remains completely insulated. You can simply discard the address without it ever affecting your real inbox or other contacts. A temporary email acts as a throwaway proxy—it receives your messages for a short duration and then self-destructs, ensuring your primary inbox remains clean.</p>

        <h3>Why Would You Need a Fake Email Address?</h3>
        <p>You’ve likely seen that premium services like Hulu, Netflix, or Amazon Prime offer limited-time free trials. If you wish to continue evaluating the service after your trial ends, a disposable email address can help. By using a newly generated email, you can easily sign up for an extended trial period.</p>
        <p>Additionally, both online and offline retailers frequently ask for your email address to send you special offers. While the discounts are nice, the resulting flood of promotional spam is not. A temporary email address is the perfect solution to bypass those annoying marketing messages.</p>
        <p>While some might associate disposable emails with shady internet activities, there are many highly legitimate and practical reasons to use a fake email service:</p>
        
        <ul>
          <li><strong>Store Loyalty Cards:</strong> Avoid promotional emails from retail stores. Use a disposable email when signing up so you never receive spam, and if the store's data is breached, your real email remains safe.</li>
          <li><strong>App Testing:</strong> If you’re a developer who just finished coding a web application, you can quickly generate 100 disposable emails to create dummy accounts. This allows you to thoroughly test your app without needing to hire unreliable third-party testers.</li>
          <li><strong>Managing Multiple Accounts:</strong> If you need a second account for a service (like an IFTTT automation for a marketing Twitter account), a disposable email from temp-email.org saves you the hassle of creating and managing a brand new traditional inbox.</li>
          <li><strong>Spam Elimination:</strong> For users who frequently use web forms, sign up for forums, or participate in discussion groups, a disposable email is an invaluable tool for keeping spam to an absolute minimum.</li>
        </ul>

        <h3>How to Choose the Best Disposable Email Provider?</h3>
        <p>The ideal fake email provider should offer the following:</p>
        <ul>
          <li>Generate temporary email addresses instantly with a single click.</li>
          <li>Require zero registration or personal identity information.</li>
          <li>Keep the email address completely anonymous.</li>
          <li>Allow you to generate as many email addresses as you need.</li>
          <li>Provide a functional, temporary inbox to receive and read your messages.</li>
          <li>Feature a clean, straightforward design for maximum ease of use.</li>
          <li>Give users random account names while also allowing custom address choices.</li>
        </ul>
        <p>Stay entirely spam-free and save your valuable time with <strong>temp-email.org</strong>, your reliable disposable email service.</p>

        <h3>How Do You Use a Disposable Email Address?</h3>
        <p>Some users try to create "disposable" addresses by registering new accounts with traditional providers like Gmail. However, this comes with hurdles: you have to provide a phone number, fill out registration forms, and then actively manage that new inbox.</p>
        <p>The beauty of a true disposable email address is its simplicity. At temp-email.org, your temporary inbox is ready instantly without any sign-up. You can even use these temporary addresses for quick verification and then forget about them entirely. If you suspect an address has been compromised, simply generate a new one and let the old one vanish.</p>

        <h3>To Conclude:</h3>
        <p>Setting up a disposable email address is a fantastic strategy to ensure that your real identity remains hidden when participating in online wikis, chat rooms, file-sharing platforms, and message boards. Never worry about your data being sold to spammers again—protect your inbox with <strong>temp-email.org</strong>.</p>
      </section>
    </main>
  );
}
