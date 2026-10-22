# Fake Email & Temporary Phone Number Service

A modern, high-performance, and privacy-focused web application that provides users with disposable email addresses and fake phone number generation. Built entirely with Next.js (App Router), this application mirrors the core functionality of popular temporary email services while maintaining a sleek, glassmorphic UI and 100% free external APIs.

## 🌟 Key Features

1. **Disposable Temporary Email (Powered by Mail.tm API):**
   - Instantly generates a random email address using active domains.
   - Automatically polls the server every 10 seconds to retrieve incoming emails.
   - Robust viewing of both Plain Text and HTML emails using secure iframes.
   - Action buttons to Copy the address, Refresh the inbox, Change the address, or Delete (self-destruct) the inbox.
   - **Persistence:** Email state is automatically saved to LocalStorage, meaning you won't lose your inbox on page reload.

2. **Fake Phone Number Generator:**
   - Seamlessly toggleable interface to switch between "Email" and "Phone" modes.
   - Instantly generates authentic-looking Indian mobile numbers (starting with +91) for placeholder or testing purposes.
   - Note: This is an offline algorithmic generator and does not physically receive SMS messages (due to lack of free open APIs).

3. **QR Code Sharing:**
   - Instantly generates a scannable QR Code containing a `mailto:` link of your temporary email address for easy mobile sharing.

4. **Dynamic Popular Articles:**
   - Pulls real-time, privacy-focused tech articles using the free [DEV.to](https://dev.to) API to give the application an authentic, active blog feed.

5. **Heavy SEO Optimization:**
   - Includes highly optimized Next.js Metadata, custom canonical URLs, dynamic OpenGraph & Twitter Cards, and Schema.org JSON-LD structured data.
   - Includes deeply optimized SEO articles on the homepage explaining "The Tech behind Disposable Email Addresses."

6. **Legal Pages:**
   - Includes beautifully formatted `Privacy Policy` and `Terms of Service` pages built directly into the Next.js routing system.

---

## 🏗️ Architecture & Technology Stack

The project operates entirely within the Next.js ecosystem without the need for a separate backend (like NestJS) or paid dependencies.

- **Frontend:** Next.js 14+ (App Router), React 18, HTML5, Vanilla CSS variables (for the custom design system).
- **Icons:** `lucide-react` for crisp SVG iconography.
- **Backend (Serverless):** Next.js Route Handlers (`/api/generate`, `/api/messages`, `/api/message`).
- **External Email API:** [Mail.tm](https://mail.tm/)
- **External Article API:** [Dev.to API](https://developers.forem.com/api)
- **External QR API:** QRServer API

### Why Mail.tm?
Originally, the project was tested with `1secmail`, but aggressive Cloudflare restrictions blocked backend requests. The architecture was migrated to `mail.tm`.
The backend creates a **deterministic password** (a cryptographic-style hash based on the email address). This means our frontend only ever needs to remember the generated "email address", and our backend magically handles account creation, token fetching, and mailbox reading behind the scenes.

---

## 📂 Project Structure

```text
/temp-email
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/route.ts  # Creates a new Mail.tm account & email address
│   │   │   ├── messages/route.ts  # Fetches the inbox list for the given email
│   │   │   └── message/route.ts   # Fetches the full contents (HTML/Text) of an email
│   │   ├── privacy/page.tsx       # Privacy Policy page
│   │   ├── terms/page.tsx         # Terms of Service page
│   │   ├── globals.css            # The entire Glassmorphic Design System
│   │   ├── layout.tsx             # Global Navbar, Footer, and strict SEO configurations
│   │   └── page.tsx               # The main application UI and logic (Client Component)
├── public/                        # Static assets
└── package.json                   # Dependencies
```

---

## 🚀 Running Locally

To run the development server locally:

1. Ensure you have Node.js installed.
2. Navigate to the project directory:
   ```bash
   cd /home/user/Downloads/temp-email
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) (or whichever port is assigned) in your browser.

---

## ☁️ Deployment (Vercel)

This application is built purposefully for **Vercel** and requires absolutely zero configuration to launch online.

1. Push this folder to a GitHub, GitLab, or Bitbucket repository.
2. Log into your [Vercel](https://vercel.com/) dashboard.
3. Click **Add New... > Project**.
4. Import your repository.
5. Vercel will automatically detect that this is a Next.js project. Click **Deploy**.
6. Within 60 seconds, your application will be live globally on Vercel's Edge Network!
