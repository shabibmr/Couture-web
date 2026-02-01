module.exports = {
  apps: [
    {
      // Production Backend
      name: 'ruvera-backend-prod',
      script: '/var/www/ruvera/backend/dist/app.js',
      cwd: '/var/www/ruvera/backend',
      instances: 2,  // Run 2 instances for load balancing
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_file: '/var/www/ruvera/backend/.env.production',
      error_file: '/var/log/pm2/ruvera-backend-error.log',
      out_file: '/var/log/pm2/ruvera-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],

      // Advanced settings
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,

      // Environment-specific
      node_args: '--max-old-space-size=2048'
    },

    // Development Backend (optional - for staging)
    {
      name: 'ruvera-backend-dev',
      script: '/var/www/ruvera-dev/backend/dist/app.js',
      cwd: '/var/www/ruvera-dev/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 5001
      },
      env_file: '/var/www/ruvera-dev/backend/.env.development',
      error_file: '/var/log/pm2/ruvera-backend-dev-error.log',
      out_file: '/var/log/pm2/ruvera-backend-dev-out.log',
      autorestart: true,
      watch: false
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'ruveracouture.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-org/ruvera-couture.git',
      path: '/var/www/ruvera',
      'post-deploy': 'npm install --production && pm2 reload ecosystem.config.js --env production'
    }
  }
};
