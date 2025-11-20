# 🌐 Domain Setup Quick Reference

## DNS Configuration Examples

### For Vercel

**A Record (Apex domain - costocomida.com):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**CNAME Record (www subdomain):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### For Netlify

**A Record:**
```
Type: A
Name: @
Value: 75.2.60.5
TTL: 3600
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: [your-site].netlify.app
TTL: 3600
```

### For Cloudflare Pages

**A Record:**
```
Type: A
Name: @
Value: Provided by Cloudflare
Proxy: Enabled (orange cloud)
TTL: Auto
```

**CNAME Record:**
```
Type: CNAME  
Name: www
Value: [your-site].pages.dev
Proxy: Enabled (orange cloud)
TTL: Auto
```

---

## Domain Registrar-Specific Instructions

### Namecheap

1. Dashboard → Manage Domain
2. Advanced DNS
3. Add New Record
4. Type: A Record / CNAME
5. Save changes

**Propagation time:** 30 minutes - 2 hours

### GoDaddy

1. My Products → DNS
2. Add Record
3. Type: A / CNAME
4. Save

**Propagation time:** 1-2 hours

### Cloudflare (as Registrar)

1. DNS → Records → Add record
2. Already proxied through Cloudflare CDN
3. SSL is automatic

**Propagation time:** ~5 minutes

### Google Domains / Squarespace

1. DNS Settings
2. Custom resource records
3. Add A or CNAME record

**Propagation time:** 10-30 minutes

---

## Email DNS Records (for SMTP)

### SendGrid (Recommended)

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:sendgrid.net ~all
TTL: 3600
```

**DKIM Records (3 records):**
```
Type: CNAME
Name: s1._domainkey
Value: s1.domainkey.u12345.wl.sendgrid.net
TTL: 3600

Type: CNAME
Name: s2._domainkey
Value: s2.domainkey.u12345.wl.sendgrid.net
TTL: 3600

Type: CNAME
Name: em1234
Value: u12345.wl.sendgrid.net
TTL: 3600
```

*(Actual values will be provided by SendGrid)*

### Resend

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

**DKIM Record:**
```
Type: TXT
Name: resend._domainkey
Value: [Provided by Resend]
```

---

## SSL Certificate Setup

### Vercel / Netlify (Automatic)
- SSL is automatic via Let's Encrypt
- Provisioning takes 2-5 minutes
- Auto-renews every 90 days

### Cloudflare (Automatic)
- Universal SSL is included
- Edge certificates provided
- Full (strict) recommended

---

## Testing Your Setup

### Check DNS Propagation
```bash
# Check A record
dig costocomida.com

# Check CNAME record  
dig www.costocomida.com

# Check from different locations
https://dnschecker.org
```

### Check SSL
```bash
# Test SSL certificate
curl -I https://costocomida.com

# Check SSL details
https://www.ssllabs.com/ssltest/
```

### Check Email DNS
```bash
# Check SPF
dig TXT costocomida.com

# Check DKIM
dig TXT s1._domainkey.costocomida.com
```

---

## Common DNS Values

### Platform IP Addresses

| Platform | IPv4 | IPv6 |
|----------|------|------|
| Vercel | 76.76.21.21 | 2606:4700:90:0::/64 |
| Netlify | 75.2.60.5 | 2606:4700:3033::ac43:bd05 |
| Cloudflare | Varies | Varies |

### Typical TTL Values

- **3600** (1 hour) - Standard
- **300** (5 minutes) - For testing
- **86400** (24 hours) - For stable production
- **Auto** - Let DNS provider decide

---

## Supabase URL Configuration

After domain is live, update in Supabase:

**Dashboard → Authentication → URL Configuration**

```
Site URL:
https://costocomida.com

Redirect URLs:
https://costocomida.com/**
https://www.costocomida.com/**

Additional Redirect URLs (optional):
https://costocomida.com/reset-password
https://costocomida.com/auth/callback
```

---

## Email Template URLs

Update these in your email templates:

**Password Reset Email:**
```
Reset link: {{ .ConfirmationURL }}
This will redirect to: https://costocomida.com#type=recovery&...
```

**Magic Link Email:**
```
Login link: {{ .ConfirmationURL }}
```

**Confirmation Email:**
```
Confirm link: {{ .ConfirmationURL }}
```

---

## Troubleshooting

### Domain not resolving
- Wait 24-48 hours for full propagation
- Check NS records point to correct nameservers
- Use `dig` or `nslookup` to debug

### SSL not working
- Ensure DNS is fully propagated first
- Check if HTTPS redirect is enabled
- Verify CAA records don't block Let's Encrypt

### Emails not sending
- Verify all DNS records are correct
- Check DKIM alignment
- Test with mail-tester.com
- Check SPF includes email provider

### Password reset not working
- Verify Site URL in Supabase matches domain
- Check redirect URLs include `/**`
- Test with different email providers

---

## Pre-Launch Checklist

- [ ] Domain registered
- [ ] DNS A/CNAME records added
- [ ] Waited for DNS propagation (24-48h max)
- [ ] SSL certificate active (automatic)
- [ ] Supabase Site URL updated
- [ ] Supabase Redirect URLs added
- [ ] SMTP configured (SendGrid/Resend)
- [ ] Email DNS records added (SPF/DKIM)
- [ ] Test password reset flow end-to-end
- [ ] Test on mobile device
- [ ] Check PageSpeed score
- [ ] Submit to Google Search Console

---

## Quick Commands

```bash
# Test DNS
dig costocomida.com
dig www.costocomida.com

# Test SSL
openssl s_client -connect costocomida.com:443 -servername costocomida.com

# Check HTTP headers
curl -I https://costocomida.com

# Check DNS from multiple locations
for server in 8.8.8.8 1.1.1.1 208.67.222.222; do
  echo "Testing from $server"
  dig @$server costocomida.com
done
```

---

## Support Resources

- **Vercel DNS:** https://vercel.com/docs/projects/domains
- **Netlify DNS:** https://docs.netlify.com/domains-https/custom-domains/
- **Cloudflare:** https://developers.cloudflare.com/dns/
- **SendGrid:** https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication
- **Supabase Auth:** https://supabase.com/docs/guides/auth

---

**Need help?** Contact your domain registrar's support or the deployment platform (Vercel/Netlify).

**Last Updated:** November 2024
