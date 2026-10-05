// PM2 Production Ecosystem Configuration for Grantly
// Documentation: https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [
    {
      name: 'grantly',
      script: '.next/standalone/server.js',
      cwd: './',
      // Process count: configurable via PM2_INSTANCES env var; conservative default of 2 for shared VPS
      instances: process.env.PM2_INSTANCES ? parseInt(process.env.PM2_INSTANCES, 10) : 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3300,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3300,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
