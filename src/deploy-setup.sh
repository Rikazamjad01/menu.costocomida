#!/bin/bash

# 🚀 CostoComida - Quick Deployment Setup Script
# This script helps you deploy CostoComida to production

echo "🍽️  CostoComida - Deployment Setup"
echo "===================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Check for node_modules
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << EOF
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Production
dist
build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Vercel
.vercel

# Netlify
.netlify
EOF
    echo "✅ .gitignore created"
fi

# Create .env.example
if [ ! -f .env.example ]; then
    echo "📝 Creating .env.example..."
    cat > .env.example << EOF
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# DO NOT INCLUDE SUPABASE_SERVICE_ROLE_KEY HERE!
# It should only be in Supabase Edge Functions environment
EOF
    echo "✅ .env.example created"
fi

# Create vercel.json
if [ ! -f vercel.json ]; then
    echo "📝 Creating vercel.json..."
    cat > vercel.json << EOF
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
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
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
EOF
    echo "✅ vercel.json created"
fi

# Create netlify.toml
if [ ! -f netlify.toml ]; then
    echo "📝 Creating netlify.toml..."
    cat > netlify.toml << EOF
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
EOF
    echo "✅ netlify.toml created"
fi

# Test build
echo ""
echo "🔨 Testing production build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📋 Next steps:"
    echo ""
    echo "1️⃣  Create a GitHub repository:"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git branch -M main"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/costocomida.git"
    echo "   git push -u origin main"
    echo ""
    echo "2️⃣  Deploy to Vercel (recommended):"
    echo "   - Go to https://vercel.com"
    echo "   - Click 'New Project'"
    echo "   - Import your GitHub repository"
    echo "   - Add environment variables (see .env.example)"
    echo "   - Click 'Deploy'"
    echo ""
    echo "3️⃣  Or deploy to Netlify:"
    echo "   - Go to https://netlify.com"
    echo "   - Click 'New site from Git'"
    echo "   - Connect your GitHub repository"
    echo "   - Netlify will auto-detect settings from netlify.toml"
    echo "   - Add environment variables"
    echo "   - Click 'Deploy'"
    echo ""
    echo "4️⃣  Configure Supabase for production:"
    echo "   - Go to Supabase Dashboard → Authentication → URL Configuration"
    echo "   - Set Site URL to your production domain"
    echo "   - Add redirect URLs: https://yourdomain.com/**"
    echo ""
    echo "5️⃣  Set up custom email (IMPORTANT for password reset):"
    echo "   - Supabase Dashboard → Settings → Auth → SMTP Settings"
    echo "   - Recommended: Use SendGrid (free tier: 100 emails/day)"
    echo "   - Configure SMTP settings"
    echo "   - Update email templates"
    echo ""
    echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
    echo ""
else
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi
