# MedRef Deployment Guide

## Panduan Deployment Production

---

## 1. Prerequisites

### 1.1 Infrastructure Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 2 GB | 4 GB |
| Storage | 20 GB SSD | 50 GB SSD |
| Database | PostgreSQL 15+ | Managed PostgreSQL (Supabase, Neon, RDS) |

### 1.2 Required Services

- PostgreSQL Database (Supabase, Neon, AWS RDS, or self-hosted)
- Vercel Account (for hosting)
- GitHub Account (for repository and CI/CD)
- Domain Name (optional)

---

## 2. Database Setup

### 2.1 Managed PostgreSQL (Supabase)

```bash
# Create Supabase project
# Get connection string from Project Settings > Database

# Connection string format:
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 2.2 Managed PostgreSQL (Neon)

```bash
# Create Neon project
# Get connection string from Dashboard

# Connection string format:
postgresql://[USER]:[PASSWORD]@[HOST].neon.tech/[DATABASE]?sslmode=require
```

### 2.3 Self-Hosted PostgreSQL

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE medref;
CREATE USER medref_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE medref TO medref_user;

# Connection string:
postgresql://medref_user:your_secure_password@localhost:5432/medref
```

### 2.4 Database Initialization

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="your_connection_string"

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial data
npm run db:seed
```

---

## 3. Vercel Deployment

### 3.1 Project Setup

1. Push code to GitHub repository
2. Log in to [Vercel](https://vercel.com)
3. Click "Add New Project"
4. Import GitHub repository
5. Configure project settings

### 3.2 Environment Variables

Set in Vercel Dashboard > Project > Settings > Environment Variables:

```bash
# Required
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-production-secret-min-32-chars
NEXTAUTH_URL=https://your-domain.com

# Optional OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 3.3 Generate NEXTAUTH_SECRET

```bash
# Generate secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3.4 Build Settings

Vercel automatically detects Next.js. Configure if needed:

```json
// vercel.json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "regions": ["sin1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

### 3.5 Domain Configuration

1. Go to Project > Settings > Domains
2. Add your domain
3. Configure DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

## 4. OAuth Provider Setup

### 4.1 Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Navigate to "APIs & Services" > "Credentials"
4. Create OAuth 2.0 Client ID
5. Configure authorized redirect URIs:
   ```
   https://your-domain.com/api/auth/callback/google
   ```
6. Copy Client ID and Client Secret

### 4.2 GitHub OAuth

1. Go to GitHub > Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Configure:
   - Homepage URL: `https://your-domain.com`
   - Authorization callback URL: `https://your-domain.com/api/auth/callback/github`
4. Copy Client ID and generate Client Secret

---

## 5. CI/CD Configuration

### 5.1 GitHub Secrets

Set in GitHub repository > Settings > Secrets and variables > Actions:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `SNYK_TOKEN` | Snyk API token (optional) |

### 5.2 Get Vercel IDs

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Get IDs from .vercel/project.json
```

### 5.3 Workflow Status

The CI/CD pipeline runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

Jobs:
1. `lint` - ESLint and TypeScript check
2. `test` - Unit tests with PostgreSQL
3. `e2e` - Playwright E2E tests (PR only)
4. `security` - npm audit and Snyk scan
5. `build` - Production build test
6. `preview` - Deploy PR preview
7. `deploy` - Deploy to production (main only)

---

## 6. Production Checklist

### 6.1 Security

- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set secure cookies (`COOKIE_SECURE=true` in production)
- [ ] Configure CORS if needed
- [ ] Review security headers in `middleware.ts`
- [ ] Enable rate limiting for API routes
- [ ] Audit user roles and permissions
- [ ] Set up audit logging
- [ ] Review database access controls

### 6.2 Performance

- [ ] Enable Vercel Analytics
- [ ] Configure caching headers
- [ ] Set up CDN for static assets
- [ ] Enable image optimization
- [ ] Review bundle size
- [ ] Configure database connection pooling

### 6.3 Monitoring

- [ ] Enable Vercel Logging
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up database monitoring
- [ ] Enable audit log review

### 6.4 Backup

- [ ] Configure database backups
- [ ] Set up point-in-time recovery
- [ ] Document restore procedures
- [ ] Test backup restoration

---

## 7. Monitoring & Logging

### 7.1 Vercel Analytics

```typescript
// Enable in next.config.ts
export default {
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'TTFB', 'INP']
  }
}
```

### 7.2 Sentry Integration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
})
```

### 7.3 Custom Logging

```typescript
// Use server-side logging
import { logAudit } from '@/lib/auth/audit'

await logAudit({
  action: 'CREATE_DRUG',
  entity: 'Drug',
  entityId: drug.id,
  details: { name: drug.name }
})
```

---

## 8. Scaling Considerations

### 8.1 Horizontal Scaling

Vercel automatically scales:
- Serverless functions scale automatically
- Edge functions for global distribution

### 8.2 Database Scaling

For high traffic:
1. Use connection pooling (PgBouncer or Supabase Pooler)
2. Consider read replicas
3. Optimize queries
4. Add caching layer (Redis)

### 8.3 Caching Strategy

```typescript
// Use Vercel KV (Redis) for production caching
import { kv } from '@vercel/kv'

export async function getCached<T>(key: string): Promise<T | null> {
  return kv.get<T>(key)
}

export async function setCached<T>(key: string, value: T, ttl: number) {
  await kv.set(key, value, { ex: ttl })
}
```

---

## 9. Maintenance

### 9.1 Database Migrations

```bash
# Create migration
npx prisma migrate dev --name description

# Apply to production (via CI/CD or manual)
npx prisma migrate deploy
```

### 9.2 Updates

```bash
# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### 9.3 Backup Procedure

```bash
# PostgreSQL backup
pg_dump -U medref_user -d medref > backup_$(date +%Y%m%d).sql

# Restore
psql -U medref_user -d medref < backup_20240115.sql
```

---

## 10. Troubleshooting

### 10.1 Common Issues

**Build Fails:**
```bash
# Clear caches and reinstall
rm -rf node_modules .next
npm install
npm run build
```

**Database Connection Error:**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

**Authentication Not Working:**
- Verify NEXTAUTH_URL matches your domain
- Check NEXTAUTH_SECRET is set
- Verify OAuth callback URLs

**Migration Errors:**
```bash
# Reset migrations (development only)
npx prisma migrate reset

# Force resolve (use carefully)
npx prisma migrate resolve --applied migration_name
```

### 10.2 Debug Mode

```typescript
// Enable debug in auth configuration
export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  // ...
}
```

### 10.3 Logs

```bash
# Vercel logs
vercel logs --follow

# Function logs
vercel logs --function api/drugs
```

---

## 11. Rollback Procedure

### 11.1 Vercel Rollback

1. Go to Vercel Dashboard > Project > Deployments
2. Find previous working deployment
3. Click "..." menu > "Promote to Production"

### 11.2 Database Rollback

```bash
# Rollback to previous migration
npx prisma migrate resolve --rolled-back migration_name

# Or restore from backup
psql -U medref_user -d medref < backup.sql
```

---

## 12. Security Best Practices

### 12.1 Environment Variables

- Never commit `.env` files
- Use Vercel's encrypted environment variables
- Rotate secrets regularly
- Use different secrets per environment

### 12.2 Database Security

- Use SSL connections
- Restrict IP access
- Use strong passwords
- Enable row-level security (RLS) if applicable

### 12.3 API Security

- Validate all inputs
- Use rate limiting
- Implement proper CORS
- Log suspicious activities

---

## 13. Cost Estimation

### 13.1 Vercel Pricing

| Plan | Cost | Features |
|------|------|----------|
| Hobby | Free | 100GB bandwidth, 100 builds/day |
| Pro | $20/mo | 1TB bandwidth, team features |
| Enterprise | Custom | Unlimited, dedicated support |

### 13.2 Database Pricing

| Provider | Free Tier | Paid |
|----------|-----------|------|
| Supabase | 500MB | $25+/mo |
| Neon | 0.5GB | $19+/mo |
| AWS RDS | None | $15+/mo |

---

## 14. Support Contacts

- **Technical Issues**: GitHub Issues
- **Security Concerns**: security@medref.app
- **Vercel Support**: Vercel Dashboard

---

*Dokumentasi terakhir diperbarui: Maret 2026*