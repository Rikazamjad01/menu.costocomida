# 🚀 CostoComida - Deployment Guide

## Deployment Options (Ranked by Ease)

### ⭐ **Option 1: Vercel (RECOMMENDED - Easiest)**

**Why Vercel:**
- ✅ Zero-config deployment for React apps
- ✅ Automatic SSL certificates
- ✅ Built-in domain management
- ✅ Free tier with generous limits
- ✅ GitHub integration for auto-deploys
- ✅ Edge network (fast globally)

**Steps:**

1. **Prepare Your Code**
   ```bash
   # Create a GitHub repository
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/costocomida.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite/React app
   - Click "Deploy"

3. **Configure Environment Variables**
   In Vercel Dashboard → Settings → Environment Variables, add:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Connect Your Domain**
   - Vercel Dashboard → Domains
   - Add your domain (e.g., `costocomida.com`)
   - Follow DNS instructions (add CNAME or A record)
   - SSL is automatic

5. **Update Supabase URLs**
   - Supabase Dashboard → Authentication → URL Configuration
   - Site URL: `https://costocomida.com`
   - Redirect URLs: `https://costocomida.com/**`

**Cost:** FREE (then $20/month for Pro features if needed)

---

### ⭐ **Option 2: Netlify (Also Great)**

**Why Netlify:**
- ✅ Similar to Vercel, very easy
- ✅ Excellent free tier
- ✅ Great CI/CD
- ✅ Form handling (useful for future features)

**Steps:**

1. **Create `netlify.toml` in root:**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   - Go to [netlify.com](https://netlify.com)
   - "New site from Git"
   - Connect GitHub
   - Deploy

3. **Environment Variables**
   Site settings → Environment variables:
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   ```

4. **Custom Domain**
   - Site settings → Domain management
   - Add custom domain
   - Update DNS

**Cost:** FREE (then $19/month for Pro if needed)

---

### Option 3: Cloudflare Pages (Best Performance)

**Why Cloudflare:**
- ✅ Fastest edge network globally
- ✅ DDoS protection included
- ✅ Free tier is very generous
- ✅ Good for international users

**Steps:**

1. **Deploy via Git**
   - [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Pages → Create a project
   - Connect GitHub
   - Build settings:
     - Build command: `npm run build`
     - Build output: `dist`

2. **Environment Variables**
   Add in Pages settings:
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   ```

3. **Custom Domain**
   - If domain is on Cloudflare: one-click setup
   - If not: transfer or use external DNS

**Cost:** FREE

---

### Option 4: Railway (Includes Backend Hosting)

**Why Railway:**
- ✅ Can host both frontend and Supabase edge functions
- ✅ Simple pricing
- ✅ Good for fullstack apps

**Steps:**

1. **Create `railway.json`:**
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run preview",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

2. **Deploy**
   - [Railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Add environment variables

**Cost:** $5/month (pay-as-you-go)

---

## 🔧 Production Configuration Checklist

### 1. **Supabase Production Setup**

**Email Configuration (CRITICAL for Password Reset):**

Supabase Dashboard → Authentication → Email Templates

You need to configure SMTP or use a service:

**Option A: Use Custom SMTP (Recommended)**
- Settings → Auth → SMTP Settings
- Recommended providers:
  - **SendGrid** (100 emails/day free)
  - **Resend** (3,000 emails/month free)
  - **AWS SES** (very cheap, $0.10/1000 emails)

Example SendGrid config:
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: YOUR_SENDGRID_API_KEY
Sender email: noreply@costocomida.com
Sender name: CostoComida
```

**Option B: Use Supabase's Email (Development Only)**
- Limited to 4 emails/hour
- Not recommended for production
- Free but unreliable

**Update Email Templates:**

Go to Authentication → Email Templates → Reset Password

```html
<h2>Restablecer tu contraseña</h2>
<p>Hola,</p>
<p>Recibimos una solicitud para restablecer tu contraseña de CostoComida.</p>
<p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
<p><a href="{{ .ConfirmationURL }}">Restablecer contraseña</a></p>
<p>Este enlace expira en 1 hora.</p>
<p>Si no solicitaste este cambio, ignora este correo.</p>
<p>Saludos,<br>El equipo de CostoComida</p>
```

---

### 2. **Update Supabase URLs**

Supabase Dashboard → Authentication → URL Configuration

```
Site URL: https://costocomida.com
Redirect URLs:
  https://costocomida.com/**
  https://www.costocomida.com/**
```

---

### 3. **Environment Variables for Production**

Create `.env.production`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Don't include SUPABASE_SERVICE_ROLE_KEY in frontend!
# It should only be in Supabase Edge Functions environment
```

⚠️ **IMPORTANT:** 
- `SUPABASE_SERVICE_ROLE_KEY` should NEVER be in frontend code
- It's already configured in your Supabase Edge Functions
- Only use `ANON_KEY` in the frontend

---

### 4. **Build Configuration**

Update `vite.config.ts` if needed:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable for production
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
})
```

---

### 5. **Domain DNS Configuration**

**For Apex Domain (costocomida.com):**

Add A records:
```
Type: A
Name: @
Value: [Vercel/Netlify IP - provided by platform]
TTL: 3600
```

**For www subdomain:**

Add CNAME:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com (or your provider)
TTL: 3600
```

**For email (if using custom SMTP):**

Add MX, SPF, DKIM records provided by your email service.

---

### 6. **Security Checklist**

- [ ] Enable Row Level Security (RLS) on all Supabase tables ✅ (already done)
- [ ] Use HTTPS only (automatic with Vercel/Netlify)
- [ ] Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend
- [ ] Set up CORS properly in Edge Functions ✅ (already done)
- [ ] Configure Content Security Policy (CSP) headers
- [ ] Enable rate limiting in Supabase

Add to `netlify.toml` or `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

### 7. **Performance Optimization**

**Add to `package.json`:**

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview",
    "analyze": "vite-bundle-visualizer"
  }
}
```

**Consider:**
- Enable Brotli compression (automatic on Vercel/Netlify)
- Add cache headers for static assets
- Use CDN for images (Cloudinary, Imgix)
- Lazy load heavy components

---

## 📱 Mobile Viewport Configuration

The app is designed for 390×844 px (mobile). Add this to `index.html`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" content="#7BB97A">
```

---

## 🧪 Testing Before Launch

1. **Test Password Reset Flow:**
   ```
   1. Click "Olvidaste tu contraseña?"
   2. Enter email
   3. Check email arrives (check spam!)
   4. Click link in email
   5. Reset password
   6. Login with new password
   ```

2. **Test on Real Devices:**
   - iPhone (Safari)
   - Android (Chrome)
   - Desktop (responsive view)

3. **Check Performance:**
   - [PageSpeed Insights](https://pagespeed.web.dev/)
   - [GTmetrix](https://gtmetrix.com/)
   - Target: 90+ score

---

## 🎯 My Recommended Stack

**For CostoComida, I recommend:**

1. **Frontend:** Vercel (easiest, best DX)
2. **Domain:** Register at Namecheap/Cloudflare
3. **Email:** SendGrid (free tier, reliable)
4. **Database:** Supabase (already using ✅)
5. **Analytics:** Vercel Analytics or Plausible (privacy-friendly)

**Estimated Monthly Cost:**
- Domain: $12/year (~$1/month)
- Vercel: FREE
- Supabase: FREE (up to 50,000 users)
- SendGrid: FREE (100 emails/day)

**Total: ~$1/month** 🎉

---

## 🚀 Quick Deploy (5 Minutes)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# 5. Deploy to production
vercel --prod

# 6. Add your domain
vercel domains add costocomida.com
```

Done! Your app is live. 🎊

---

## 📞 Post-Launch Checklist

- [ ] Test password reset end-to-end
- [ ] Test signup flow
- [ ] Test login flow  
- [ ] Test all CRUD operations (dishes, ingredients, categories)
- [ ] Check mobile responsiveness
- [ ] Set up monitoring (Vercel Analytics, Sentry)
- [ ] Configure email alerts for errors
- [ ] Set up backup strategy for Supabase
- [ ] Add Google Analytics or privacy-friendly alternative
- [ ] Submit to Google Search Console
- [ ] Create sitemap.xml

---

## 🆘 Troubleshooting

**Password Reset Email Not Arriving:**
1. Check Supabase logs (Dashboard → Logs)
2. Verify SMTP settings
3. Check spam folder
4. Test with different email provider

**Domain Not Working:**
1. DNS propagation takes 24-48 hours
2. Check DNS with `dig costocomida.com`
3. Verify CNAME/A records

**Build Failing:**
1. Check environment variables are set
2. Test build locally: `npm run build`
3. Check Node.js version matches

**CORS Errors:**
1. Update Supabase redirect URLs
2. Check Supabase → Authentication → URL Configuration

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [React Production Build](https://react.dev/learn/production-build)

---

**Need help?** Feel free to ask! I can help with:
- Setting up DNS records
- Configuring SMTP
- Debugging deployment issues
- Performance optimization

---

**Version:** 1.0  
**Last Updated:** November 2024  
**Author:** CostoComida Team
