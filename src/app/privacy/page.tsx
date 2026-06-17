export const metadata = {
  title: 'Privacy Policy - Temp-Email.org',
  description: 'Privacy Policy for Temp-Email.org',
};

export default function PrivacyPolicy() {
  return (
    <main className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Privacy Policy</h1>
      
      <div className="long-article" style={{ borderTop: 'none', padding: 0 }}>
        <p><strong>Effective Date:</strong> January 1, 2024</p>
        
        <p>At Temp-Email.org, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information when you use our temporary email service.</p>

        <h3>1. Information We Collect</h3>
        <p>We do not collect personal information such as your real name, address, or phone number. When you generate a temporary email address or a fake phone number, we do not require any registration or personal details.</p>
        <p>We may automatically collect non-personally identifiable information, such as IP addresses, browser types, and usage data, to help us monitor and improve our service.</p>

        <h3>2. How We Use Your Information</h3>
        <p>The temporary emails you receive are stored securely and are only accessible via the unique email address generated for you. We use the information we collect solely to:</p>
        <ul>
          <li>Provide and maintain the Temp-Email.org service.</li>
          <li>Analyze usage trends and optimize our infrastructure.</li>
        </ul>

        <h3>3. Data Retention and Deletion</h3>
        <p>Because privacy is our core feature, all temporary emails and their contents are highly ephemeral. Emails are stored for a short duration and are automatically deleted from our servers. Once an email is deleted, it cannot be recovered.</p>
        <p>We do not store or backup your temporary inbox data for long-term use.</p>

        <h3>4. Third-Party Services</h3>
        <p>We utilize third-party APIs (such as mail.tm) to facilitate our temporary email services. While we do not share your personal information, your use of our service involves routing data through these secure third-party channels.</p>

        <h3>5. Cookies</h3>
        <p>We may use minimal local storage (such as HTML5 LocalStorage) strictly to remember your active temporary email address across page reloads. We do not use tracking cookies for advertising.</p>

        <h3>6. Changes to This Privacy Policy</h3>
        <p>We reserve the right to update this Privacy Policy at any time. Any changes will be posted on this page with an updated "Effective Date."</p>

        <h3>7. Contact Us</h3>
        <p>If you have any questions or concerns about this Privacy Policy, please contact us via our <a href="https://in.linkedin.com/in/chhotu" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Contact Page</a>.</p>
      </div>
    </main>
  );
}
