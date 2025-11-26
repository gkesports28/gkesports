# Docker Setup Guide

This guide explains how to dockerize and run the GK Esports backend application.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, but recommended)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=8000
NODE_ENV=production

# Database Configuration
MONGO_URI=mongodb://localhost:27017/gk-esports
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET_KEY=your-secret-jwt-key-here-change-in-production

# Payment Gateway (Cashfree)
PAYMENT_CLIENT_ID=your-cashfree-client-id
PAYMENT_CLIENT_SECRET=your-cashfree-client-secret

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL=your-email@gmail.com
EMAIL_PASSWORD=your-email-password-or-app-password

# Cron Job Secret (Optional)
CRON_SECRET=your-cron-secret-key
```

## Building and Running with Docker

### Option 1: Using Docker Compose (Recommended)

1. **Build and start the container:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f app
   ```

3. **Stop the container:**
   ```bash
   docker-compose down
   ```

4. **Rebuild after code changes:**
   ```bash
   docker-compose up -d --build
   ```

### Option 2: Using Docker directly

1. **Build the Docker image:**
   ```bash
   docker build -t gk-esports-backend .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name gk-esports-backend \
     -p 8000:8000 \
     --env-file .env \
     -v $(pwd)/public/image:/app/public/image \
     -v $(pwd)/config/serviceAccountKey.json:/app/config/serviceAccountKey.json:ro \
     gk-esports-backend
   ```

3. **View logs:**
   ```bash
   docker logs -f gk-esports-backend
   ```

4. **Stop the container:**
   ```bash
   docker stop gk-esports-backend
   docker rm gk-esports-backend
   ```

## Important Notes

1. **Firebase Service Account Key**: The `config/serviceAccountKey.json` file is copied into the Docker image during build. Make sure it exists in your project before building.

2. **Image Uploads**: By default, uploaded images are stored in a Docker named volume (`image_uploads`) to avoid permission issues on macOS/Windows. The images persist across container restarts but are stored in Docker's volume storage.
   - To access images from the host, you can change the volume mount in `docker-compose.yml` to use a bind mount: `./public/image:/app/public/image`
   - On macOS, ensure Docker Desktop has file sharing enabled for the directory in Settings > Resources > File Sharing

3. **MongoDB**: The application expects MongoDB to be running. You can either:
   - Use an external MongoDB instance (MongoDB Atlas, etc.)
   - Uncomment the MongoDB service in `docker-compose.yml` to run MongoDB in Docker

4. **Port Configuration**: The default port is 8000. Change it in the `.env` file or `docker-compose.yml` if needed.

5. **Health Check**: The container includes a health check that verifies the server is responding on port 8000.

6. **Environment Variables**: All environment variables have default empty values to prevent warnings. Make sure to set them in your `.env` file.

## Troubleshooting

### Container won't start
- Check if port 8000 is already in use: `lsof -i :8000`
- Verify your `.env` file has all required variables
- Check logs: `docker-compose logs app` or `docker logs gk-esports-backend`

### Database connection issues
- Verify `MONGO_URI` is correct in your `.env` file
- Ensure MongoDB is accessible from the container
- Check MongoDB connection string format

### Permission issues with image uploads (macOS/Windows)
- The default configuration uses a Docker named volume to avoid permission issues
- If you need host directory access, ensure Docker Desktop has file sharing enabled:
  - macOS: Docker Desktop > Settings > Resources > File Sharing > Add your project directory
  - Windows: Docker Desktop > Settings > Resources > File Sharing > Add your drive
- Alternatively, use the named volume (default) which doesn't require file sharing permissions

### Environment variable warnings
- If you see warnings about unset environment variables, they're safe to ignore if those features aren't being used
- To remove warnings, either set the variables in your `.env` file or remove them from `docker-compose.yml`

## Production Deployment

For production deployment:

1. Use environment-specific `.env` files
2. Consider using Docker secrets for sensitive data
3. Set up proper logging and monitoring
4. Use a reverse proxy (nginx) in front of the container
5. Enable HTTPS/SSL
6. Set up proper backup strategies for MongoDB and uploaded images

## Development

For development with hot-reload, you can modify the Dockerfile to use `nodemon`:

```dockerfile
# In Dockerfile, change CMD to:
CMD ["npm", "run", "dev"]
```

However, for production, always use `node index.js` as specified in the current Dockerfile.

