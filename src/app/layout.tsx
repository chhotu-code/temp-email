import type { Metadata } from 'next';
import './globals.css';
import ThemeToggle from './theme-toggle';

export const metadata: Metadata = {
  title: 'Temp Mail - Disposable Temporary Email Address & Fake Phone Number',
  description: 'Protect your privacy with Temp-Email.org. Get a free, secure, and anonymous disposable temporary email address or a fake phone number instantly to avoid spam, phishing, and hackers.',
  keywords: [
    'temp mail', 'temporary email', 'disposable email', 'fake email', 
    '10 minute mail', 'throwaway email', 'temp-email.org', 'anonymous email',
    'free temp mail', 'fake phone number', 'temporary phone number', 'sms verification'
  ],
  authors: [{ name: 'Temp-Email.org' }],
  creator: 'Temp-Email.org',
  publisher: 'Temp-Email.org',
  alternates: {
    canonical: 'https://temp-email.org',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Temp Mail - Disposable Temporary Email Address',
    description: 'Keep your real mailbox clean and secure. Use our free temporary email and fake phone number generator to protect your identity online.',
    url: 'https://temp-email.org',
    siteName: 'Temp-Email.org',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Temp Mail - Disposable Temporary Email',
    description: 'Protect your personal email from spam, bots, and phishing with Temp-Email.org.',
  },
  verification: {
    google: 'add-your-google-site-verification-here', // Placeholder for actual verification
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Temp-Email.org',
              url: 'https://temp-email.org',
              description: 'Free disposable temporary email address and fake phone number generator.',
              applicationCategory: 'UtilityApplication',
              operatingSystem: 'All',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </head>
      <body>
        <header className="site-header">
          <div className="container">
            <div className="navbar">
              <a href="/" className="logo">
                <div className="logo-icon-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>
                </div>
                <div className="logo-text">
                  Fake<span className="logo-highlight">Email</span>
                  <span className="logo-version">v2.4</span>
                </div>
              </a>


              <div className="nav-links">
                <a href="#features" className="nav-link">Features</a>
                <a href="#faq" className="nav-link">FAQ</a>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {children}

        <footer className="footer">
          <div className="footer-aurora-line"></div>
          <div className="container footer-content">
            <div className="footer-brand-col">
              <div className="logo">
                <div className="logo-icon-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>
                </div>
                <div className="logo-text">
                  Fake<span className="logo-highlight">Email</span>
                </div>
              </div>
              <p className="footer-tagline">
                Ephemeral, zero-trace temporary inboxes engineered for autonomous web browsing, privacy defense, and developer test mocking.
              </p>
            </div>

            <div className="footer-links">
              <a href="/privacy" className="footer-link">Privacy Policy</a>
              <a href="/terms" className="footer-link">Terms of Service</a>
              <a href="https://in.linkedin.com/in/chhotu" target="_blank" rel="noopener noreferrer" className="footer-link">Contacts</a>
              <a href="https://github.com/chhotu-code" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
            </div>
          </div>

          <div className="container footer-bottom">
            <div className="footer-bottom-left">
              <p>&copy; {new Date().getFullYear()} GhostInbox. Military-grade privacy protocol. Developed by{' '}
                <a href="https://github.com/chhotu-code" target="_blank" rel="noopener noreferrer">Chhotu</a>.
              </p>
            </div>
            
          </div>
        </footer>
      </body>
    </html>
  );
}
