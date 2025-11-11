module.exports = {
    apps : [{
      name: 'gk-esports-backend', // Your application name
      script: 'index.js', // Path to your main application file (after building)
      cwd: '', // Working directory
      log_date_format: 'YYYY-MM-DD HH:mm Z', // Optional: Log formatting
      env: {
        NODE_ENV: 'production', // Set environment variables
        PORT: 2000, // Port number
        // DB_URL: 'mongodb://localhost:27017/gk-esports', // MongoDB connection string
      }
    }]
  }