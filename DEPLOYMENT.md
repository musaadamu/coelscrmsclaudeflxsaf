# COELS CRMS Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests passing (`npm run test`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Environment variables configured
- [ ] Database backups created
- [ ] SSL certificates ready (production)
- [ ] DNS records updated
- [ ] Monitoring alerts configured

## Development Environment

### Local Setup

```bash
# Clone repository
git clone <repo-url>
cd coels-crms

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with local values

# Start services
docker-compose up -d

# Seed database
npm run seed --workspace=backend

# Verify
curl http://localhost:4000/api/health
```

## Production Deployment

### Prerequisites

- Linux server (Ubuntu 22.04 LTS recommended)
- Docker & Docker Compose installed
- Domain name
- SSL certificate (Let's Encrypt)
- Backup system
- Monitoring tools

### Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
sudo mkdir -p /opt/coels-crms
cd /opt/coels-crms
```

### Configuration

```bash
# Copy source code
sudo git clone <repo-url> .

# Configure environment
sudo cp .env.example .env
sudo nano .env  # Edit all production values

# SSL Certificate (Let's Encrypt)
sudo docker run --rm -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  -d yourdomain.com -d www.yourdomain.com \
  -d api.yourdomain.com

# Adjust nginx config
sudo nano nginx/prod.conf  # Update server names
```

### Database Initialization

```bash
# Start only database services
docker-compose -f docker-compose.prod.yml up -d mongodb redis

# Wait for MongoDB to start
sleep 10

# Run migrations/seed
docker-compose -f docker-compose.prod.yml run backend npm run seed

# Verify data
docker-compose -f docker-compose.prod.yml exec mongodb mongosh
# > use coels_crms
# > db.users.countDocuments()
```

### Application Deployment

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Verify services
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Health check
curl https://yourdomain.com/api/health
```

### Backup Strategy

```bash
# Create backup script (backup.sh)
#!/bin/bash
BACKUP_DIR="/backups/coels-crms"
DATE=$(date +%Y%m%d_%H%M%S)

# MongoDB backup
docker-compose -f docker-compose.prod.yml exec mongodb \
  mongodump --out /backup/$DATE

# Redis backup
docker-compose -f docker-compose.prod.yml exec redis \
  redis-cli BGSAVE

# Store in S3
aws s3 cp /backups/$DATE s3://coels-backups/$DATE --recursive

# Schedule with crontab (daily at 2 AM)
0 2 * * * /opt/coels-crms/backup.sh
```

### Monitoring

```bash
# Monitor container logs
docker-compose -f docker-compose.prod.yml logs -f backend frontend

# Monitor system resources
docker stats

# Health check endpoint
curl https://yourdomain.com/api/health
# Response should include: { "status": "ok", "db": "connected", "redis": "connected" }

# Monitor queue depths (Redis)
docker-compose -f docker-compose.prod.yml exec redis redis-cli
> LLEN bull:pdf-generation:1
> LLEN bull:email-notifications:1
> LLEN bull:sms-notifications:1
> LLEN bull:cgpa-computation:1
```

### Database Maintenance

```bash
# MongoDB - Create indexes
docker-compose -f docker-compose.prod.yml exec mongodb mongosh
> use coels_crms
> db.users.createIndex({ email: 1 }, { unique: true })
> db.students.createIndex({ matricNo: 1 }, { unique: true })
> db.payments.createIndex({ reference: 1 })

# MongoDB - Repair
docker-compose -f docker-compose.prod.yml exec mongodb mongosh
> db.repairDatabase()

# Redis - Cleanup
docker-compose -f docker-compose.prod.yml exec redis redis-cli
> FLUSHDB  # Clear current database
> DBSIZE   # Check database size
```

## CI/CD Pipeline

### GitHub Actions Workflow

Automatically triggered on push to `main` or `develop`:

1. **Lint & Type Check**
   - ESLint on all packages
   - TypeScript type checking

2. **Test**
   - Unit tests with coverage
   - Min 80% coverage required

3. **Build**
   - Compile TypeScript
   - Build Docker images
   - Push to registry (optional)

4. **Deploy** (main branch only)
   - Deploy to production environment

### Manual Deployment

```bash
# SSH into server
ssh ubuntu@yourdomain.com

# Navigate to app
cd /opt/coels-crms

# Pull latest code
git pull origin main

# Rebuild images
docker-compose -f docker-compose.prod.yml build

# Stop old services
docker-compose -f docker-compose.prod.yml down

# Start new services
docker-compose -f docker-compose.prod.yml up -d

# Verify deployment
docker-compose -f docker-compose.prod.yml ps
curl https://yourdomain.com/api/health
```

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.prod.yml - Multiple backend instances
version: '3.9'
services:
  backend-1:
    # ... same config
  backend-2:
    # ... same config
  backend-3:
    # ... same config

  # Nginx handles load balancing
  nginx:
    # ... config with multiple upstreams
```

### Vertical Scaling

```yaml
# Increase resource limits
backend:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '1'
        memory: 1G
```

## Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check resource usage
docker stats

# Check disk space
df -h

# Check network
docker network ls
docker network inspect coels-crms_crms_net
```

### Database connection errors

```bash
# Test MongoDB
docker-compose -f docker-compose.prod.yml exec mongodb mongosh

# Test Redis
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping

# Check connection strings in .env
grep MONGODB_URI .env
grep REDIS_HOST .env
```

### High CPU/Memory usage

```bash
# Profile running container
docker top <container_id>

# Check for memory leaks
docker stats --no-stream

# Restart problematic service
docker-compose -f docker-compose.prod.yml restart <service>
```

### SSL certificate issues

```bash
# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -noout -dates

# Renew certificate
docker run --rm -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/certbot renew --webroot -w /opt/coels-crms

# Reload Nginx after renewal
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

## Performance Optimization

### Database

```bash
# Add indexes
db.users.createIndex({ email: 1 })
db.students.createIndex({ matricNo: 1 })
db.payments.createIndex({ studentId: 1, createdAt: -1 })

# Enable compression
docker-compose -f docker-compose.prod.yml exec mongodb mongosh
> db.setProfilingLevel(1)  # Enable profiling
```

### Cache

```bash
# Monitor Redis memory
docker-compose -f docker-compose.prod.yml exec redis redis-cli info memory

# Set eviction policy
docker-compose -f docker-compose.prod.yml exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### CDN

```bash
# CloudFront distribution
# Serve static assets + API through CDN
# Origins:
#   - S3: /assets/*
#   - API Gateway: /api/*
```

## Rollback

```bash
# If deployment fails
docker-compose -f docker-compose.prod.yml down

# Check git history
git log --oneline

# Checkout previous version
git checkout <commit-hash>

# Restart with previous version
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## Updates & Maintenance

### Security Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker image vulnerabilities
docker pull mongo:7
docker pull redis:7-alpine
docker pull nginx:alpine

# Rebuild with latest base images
docker-compose -f docker-compose.prod.yml build --no-cache
```

### Database Migration

```bash
# For schema changes, follow steps:
1. Create migration script
2. Test on staging environment
3. Backup production database
4. Run migration
5. Verify data integrity
6. Update application code
```

## Support & Issues

For deployment issues, check:
1. Service logs: `docker-compose logs -f <service>`
2. Network connectivity: `docker network inspect`
3. Resource availability: `docker stats`
4. Certificate validity: `ssl-test yourdomain.com`
5. DNS resolution: `nslookup yourdomain.com`

---

**Last Updated:** June 2024  
**Version:** 1.0.0
