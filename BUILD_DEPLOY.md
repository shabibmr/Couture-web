# Build & Deployment Quick Reference

Quick reference for building and deploying Ruvera Couture applications.

## 📋 Quick Commands

### Development

```bash
# Build all apps for development
./build-dev.sh

# Deploy to development server
./deploy-dev.sh

# Or run locally
./start_all.sh
```

### Production

```bash
# Build all apps for production
./build-prod.sh

# Deploy to production server
./deploy-prod.sh
```

## 🏗️ Build Scripts

### `./build-dev.sh`
Builds all three apps (backend, customer, admin) for **development** environment:
- Uses `.env.development` files
- Includes source maps for debugging
- Backend: Compiles TypeScript to `backend/dist/`
- Customer: Builds React app to `customer/dist/`
- Admin: Builds React app to `admin/dist/`

**When to use**: Testing builds locally before deploying to dev server

### `./build-prod.sh`
Builds all three apps for **production** environment:
- Uses `.env.production` files
- Optimized and minified builds
- Creates deployment package (`.tar.gz`)
- Displays build sizes
- Includes safety confirmation prompt

**When to use**: Before deploying to production server

## 🚀 Deployment Scripts

### `./deploy-dev.sh`
Deploys to **development** server:
- Runs `build-dev.sh` first
- Uploads to dev server via rsync
- Restarts PM2 backend process
- No confirmation required (faster workflow)

**Requirements**:
- SSH access to dev server
- Server configured in script variables

### `./deploy-prod.sh`
Deploys to **production** server:
- Runs `build-prod.sh` first
- **Creates backup** before deployment
- Uploads to production server via rsync
- Restarts PM2 backend process
- Sets proper file permissions
- Runs health checks on all services
- Requires confirmation ("yes" to proceed)

**Requirements**:
- SSH access to production server
- Server paths: `/var/www/ruvera/{customer,admin,backend}`

## 📁 Server Structure

```
/var/www/ruvera/
├── customer/           # Customer storefront (https://ruveracouture.com)
│   └── (built files from customer/dist/)
├── admin/              # Admin dashboard (https://admin.ruveracouture.com)
│   └── (built files from admin/dist/)
└── backend/            # API backend (https://apis.ruveracouture.com)
    ├── dist/           # Compiled JS from TypeScript
    ├── node_modules/   # Production dependencies
    ├── package.json
    └── .env            # Production environment variables
```

## 🌐 Production Domains

| App | Domain | Path |
|-----|--------|------|
| Customer | https://ruveracouture.com | `/var/www/ruvera/customer` |
| Admin | https://admin.ruveracouture.com | `/var/www/ruvera/admin` |
| Backend | https://apis.ruveracouture.com | `/var/www/ruvera/backend` |

## ⚙️ Server Configuration

### Apache2 Virtual Hosts
Location: `server-configs/apache2/`
- `ruveracouture.com.conf` - Customer app
- `admin.ruveracouture.com.conf` - Admin app
- `apis.ruveracouture.com.conf` - Backend API (proxy to port 5000)

**To apply on server:**
```bash
sudo cp server-configs/apache2/*.conf /etc/apache2/sites-available/
sudo a2ensite ruveracouture.com.conf admin.ruveracouture.com.conf apis.ruveracouture.com.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

### PM2 Process Manager
Location: `server-configs/pm2/ecosystem.config.js`

**To apply on server:**
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd  # Enable auto-start on boot
```

## 🔧 Manual Build Process

If you need to build apps individually:

### Backend
```bash
cd backend
npm install
npm run build              # Compiles TS → dist/
npm run typecheck          # Check for type errors
```

### Customer App
```bash
cd customer
npm install
npm run build -- --mode production   # Production build
npm run build -- --mode development  # Development build
npm run preview            # Test production build locally
```

### Admin App
```bash
cd admin
npm install
npm run build -- --mode production   # Production build
npm run build -- --mode development  # Development build
npm run preview            # Test production build locally
```

## 🧪 Testing Builds Locally

After building, test before deploying:

### Backend
```bash
cd backend
NODE_ENV=production node dist/app.js
# Should start on port 5000
```

### Customer/Admin (Vite Preview)
```bash
cd customer  # or admin
npm run preview
# Serves production build on local server
```

## 📦 Environment Files Usage

| Environment | File Used | When |
|------------|-----------|------|
| Local Dev | `.env` | Default for `npm run dev` |
| Build Dev | `.env.development` | `build-dev.sh`, `--mode development` |
| Build Prod | `.env.production` | `build-prod.sh`, `--mode production` |

**Important**:
- `.env` files are git-ignored
- `.env.example` files are templates (committed to git)
- Production `.env` files must be manually placed on server

## 🔐 Pre-Deployment Checklist

### Before deploying to production:

- [ ] All `.env.production` files configured with correct values
- [ ] Database schema up-to-date
- [ ] SSL certificates installed and valid
- [ ] Apache virtual hosts configured
- [ ] PM2 ecosystem file configured
- [ ] Backup system in place
- [ ] Test payment gateway credentials (Razorpay live keys)
- [ ] SMTP/Email configured and tested
- [ ] Firebase Admin SDK credentials set
- [ ] CORS origins include production domains

## 🆘 Troubleshooting

### Build fails
```bash
# Clean node_modules and rebuild
cd backend  # or customer, admin
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment fails (SSH)
```bash
# Test SSH connection
ssh deploy@ruveracouture.com

# Check SSH keys
ssh-add -l
```

### Backend won't start on server
```bash
# SSH to server
ssh deploy@ruveracouture.com

# Check PM2 status
pm2 status

# View logs
pm2 logs ruvera-backend-prod --lines 50

# Restart
pm2 restart ruvera-backend-prod
```

### Frontend shows blank page
1. Check browser console for errors
2. Verify API URL in `.env.production`
3. Check Apache config has SPA rewrite rules
4. Ensure file permissions: `sudo chown -R www-data:www-data /var/www/ruvera`

## 📊 Monitoring

### PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# Process status
pm2 status

# View logs
pm2 logs ruvera-backend-prod

# Restart process
pm2 restart ruvera-backend-prod
```

### Apache Logs
```bash
# Access logs
sudo tail -f /var/log/apache2/ruveracouture.com-access.log

# Error logs
sudo tail -f /var/log/apache2/apis.ruveracouture.com-error.log
```

## 🔄 Rollback

If deployment causes issues:

```bash
# SSH to server
ssh deploy@ruveracouture.com

# List backups
ls -lt /var/www/backups/

# Restore from backup
cd /var/www/backups
tar -xzf backup_YYYYMMDD_HHMMSS.tar.gz -C /var/www/ruvera/

# Restart services
pm2 restart ruvera-backend-prod
sudo systemctl reload apache2
```

## 📚 Additional Resources

- Full deployment guide: `server-configs/DEPLOYMENT_GUIDE.md`
- Environment setup: `ENV_SETUP.md`
- Apache configs: `server-configs/apache2/`
- PM2 config: `server-configs/pm2/ecosystem.config.js`

## 🎯 Common Workflows

### Deploying a hotfix to production
```bash
# 1. Fix the issue locally
# 2. Test thoroughly
# 3. Build and deploy
./build-prod.sh
./deploy-prod.sh
```

### Testing changes on dev server
```bash
./build-dev.sh
./deploy-dev.sh
```

### Updating only backend
```bash
cd backend
npm run build
rsync -avz dist/ deploy@ruveracouture.com:/var/www/ruvera/backend/dist/
ssh deploy@ruveracouture.com "pm2 restart ruvera-backend-prod"
```

### Updating only frontend
```bash
cd customer  # or admin
npm run build -- --mode production
rsync -avz --delete dist/ deploy@ruveracouture.com:/var/www/ruvera/customer/
```
