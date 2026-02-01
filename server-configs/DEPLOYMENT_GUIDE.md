# Server Deployment Guide

This guide covers setting up and deploying Ruvera Couture to production servers.

## Server Requirements

### Software Requirements
- **OS**: Ubuntu 20.04 LTS or newer
- **Web Server**: Apache2 2.4+
- **Node.js**: 18.x or newer
- **Database**: MySQL 8.0+
- **Process Manager**: PM2
- **SSL**: Let's Encrypt (Certbot)

### Domain Setup
- `ruveracouture.com` → Customer storefront
- `admin.ruveracouture.com` → Admin dashboard
- `apis.ruveracouture.com` → Backend API

## Initial Server Setup

### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Apache2
sudo apt install apache2 -y

# Install Node.js (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install PM2 globally
sudo npm install -g pm2

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install Certbot for SSL
sudo apt install certbot python3-certbot-apache -y
```

### 2. Enable Apache Modules

```bash
# Enable required Apache modules
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel

# Restart Apache
sudo systemctl restart apache2
```

### 3. Create Directory Structure

```bash
# Create deployment directories
sudo mkdir -p /var/www/ruvera/{customer,admin,backend}
sudo mkdir -p /var/www/backups
sudo mkdir -p /var/log/pm2

# Set permissions
sudo chown -R $USER:www-data /var/www/ruvera
sudo chmod -R 755 /var/www/ruvera
```

### 4. Configure Apache Virtual Hosts

```bash
# Copy Apache configurations
sudo cp server-configs/apache2/*.conf /etc/apache2/sites-available/

# Enable sites
sudo a2ensite ruveracouture.com.conf
sudo a2ensite admin.ruveracouture.com.conf
sudo a2ensite apis.ruveracouture.com.conf

# Disable default site
sudo a2dissite 000-default.conf

# Test configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2
```

### 5. Setup SSL Certificates

```bash
# Obtain SSL certificates for all domains
sudo certbot --apache -d ruveracouture.com -d www.ruveracouture.com
sudo certbot --apache -d admin.ruveracouture.com
sudo certbot --apache -d apis.ruveracouture.com

# Auto-renewal (should be set up automatically, but verify)
sudo certbot renew --dry-run

# Certificates auto-renew via systemd timer
sudo systemctl status certbot.timer
```

### 6. Configure MySQL Database

```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE couture_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ruvera_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON couture_db.* TO 'ruvera_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import database schema (if you have one)
mysql -u ruvera_user -p couture_db < /path/to/create_db.sql
```

### 7. Setup PM2 for Backend

```bash
# Copy PM2 ecosystem file
sudo cp server-configs/pm2/ecosystem.config.js /var/www/ruvera/

# Start PM2 with ecosystem file
pm2 start /var/www/ruvera/ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Follow the instructions output by the command above

# Monitor processes
pm2 monit
```

## Deployment Process

### First-Time Deployment

1. **Build on local machine**
   ```bash
   ./build-prod.sh
   ```

2. **Deploy to server**
   ```bash
   ./deploy-prod.sh
   ```

   Or manually:
   ```bash
   # Upload backend
   rsync -avz backend/dist/ user@ruveracouture.com:/var/www/ruvera/backend/dist/
   rsync -avz backend/package*.json user@ruveracouture.com:/var/www/ruvera/backend/

   # Upload customer app
   rsync -avz --delete customer/dist/ user@ruveracouture.com:/var/www/ruvera/customer/

   # Upload admin app
   rsync -avz --delete admin/dist/ user@ruveracouture.com:/var/www/ruvera/admin/
   ```

3. **Install backend dependencies on server**
   ```bash
   ssh user@ruveracouture.com
   cd /var/www/ruvera/backend
   npm install --production
   ```

4. **Setup environment files**
   ```bash
   # Copy .env.production to .env on server
   scp backend/.env.production user@ruveracouture.com:/var/www/ruvera/backend/.env
   ```

5. **Start/Restart services**
   ```bash
   # On server
   pm2 restart ruvera-backend-prod
   ```

### Subsequent Deployments

Simply run:
```bash
./deploy-prod.sh
```

This script will:
- Build all apps for production
- Create a backup of current deployment
- Upload new files to server
- Install dependencies
- Restart backend service
- Run health checks

## Monitoring & Maintenance

### View Logs

```bash
# PM2 logs (backend)
pm2 logs ruvera-backend-prod

# Apache logs
sudo tail -f /var/log/apache2/ruveracouture.com-access.log
sudo tail -f /var/log/apache2/apis.ruveracouture.com-error.log
```

### Restart Services

```bash
# Restart backend
pm2 restart ruvera-backend-prod

# Reload Apache
sudo systemctl reload apache2
```

### Database Backup

```bash
# Create backup
mysqldump -u ruvera_user -p couture_db > /var/www/backups/db-$(date +%Y%m%d).sql

# Compress backup
gzip /var/www/backups/db-$(date +%Y%m%d).sql

# Automate with cron (daily at 2 AM)
crontab -e
# Add: 0 2 * * * mysqldump -u ruvera_user -pPASSWORD couture_db | gzip > /var/www/backups/db-$(date +\%Y\%m\%d).sql.gz
```

### SSL Certificate Renewal

Certificates auto-renew, but you can manually renew:
```bash
sudo certbot renew
sudo systemctl reload apache2
```

## Rollback Procedure

If deployment fails:

```bash
# On server
cd /var/www/backups

# Find latest backup
ls -lt

# Extract backup (replace with actual backup name)
tar -xzf backup_20240201_120000.tar.gz -C /var/www/ruvera/

# Restart services
pm2 restart ruvera-backend-prod
sudo systemctl reload apache2
```

## Security Checklist

- [ ] Firewall configured (allow only 80, 443, 22)
- [ ] SSH key-based authentication enabled
- [ ] Password authentication disabled
- [ ] MySQL accessible only from localhost
- [ ] Environment files have correct permissions (600)
- [ ] SSL certificates installed and auto-renewing
- [ ] Security headers enabled in Apache config
- [ ] Regular backups scheduled
- [ ] PM2 logs rotation configured
- [ ] Production credentials different from dev

## Troubleshooting

### Backend not starting
```bash
# Check PM2 logs
pm2 logs ruvera-backend-prod --lines 100

# Check if port 5000 is in use
sudo lsof -i :5000

# Restart PM2 process
pm2 restart ruvera-backend-prod
```

### 502 Bad Gateway (API)
```bash
# Check if backend is running
pm2 status

# Check Apache proxy configuration
sudo apache2ctl configtest

# Check backend logs
pm2 logs ruvera-backend-prod
```

### 404 on refresh (SPA)
```bash
# Ensure .htaccess or Apache config has rewrite rules
# Check if mod_rewrite is enabled
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### Database connection fails
```bash
# Test MySQL connection
mysql -u ruvera_user -p couture_db

# Check backend .env file has correct credentials
cat /var/www/ruvera/backend/.env | grep DB_
```

## Performance Optimization

### Enable Apache Compression

Already configured in virtual host files via `mod_deflate`.

### Enable Caching

Static assets already cached via headers in Apache configs.

### PM2 Cluster Mode

Backend runs in cluster mode (2 instances) for load balancing.

### Database Optimization

```sql
-- Add indexes for frequently queried fields
ALTER TABLE products ADD INDEX idx_slug (slug);
ALTER TABLE orders ADD INDEX idx_customer (customer_id);
ALTER TABLE orders ADD INDEX idx_status (status);
```

## Contact & Support

For deployment issues:
1. Check logs first
2. Verify configuration files
3. Test connectivity
4. Review recent changes
