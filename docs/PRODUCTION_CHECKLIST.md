# Production Deployment Checklist

This checklist covers all the changes you need to make before deploying MountainMerge to production.

---

## 🔐 Authentication & Security

### 1. Enable Email Confirmation

**Current State**: Email confirmation is auto-confirmed in development  
**Production Action**: Re-enable email confirmation in Supabase

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **Settings**
3. Scroll to **"Email Auth"** section
4. **Turn ON** "Enable email confirmations"
5. Click **"Save"**

**Code Changes Needed**:
- Remove or disable the auto-confirmation code in `backend/app/services/auth_service.py`
- Users will need to click confirmation links in their email before logging in

### 2. Update Secret Keys

**Current State**: Development keys in `.env` files  
**Production Action**: Generate new secure keys

```bash
# Generate a new SECRET_KEY for Flask
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Update `backend/.env`:
- `SECRET_KEY`: Use a strong, randomly generated key (32+ characters)
- Never commit `.env` files to git

### 3. Review CORS Settings

**Current State**: CORS allows `http://localhost:3000`  
**Production Action**: Update to production domain(s)

Update `backend/.env`:
```bash
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

Update `backend/app/__init__.py` if needed to handle multiple origins securely.

### 4. Disable Debug Mode

**Current State**: `FLASK_DEBUG=1` and `FLASK_ENV=development`  
**Production Action**: Disable debug mode

Update `backend/.env`:
```bash
FLASK_ENV=production
FLASK_DEBUG=0
```

**Security Risk**: Debug mode exposes stack traces and allows code execution - **CRITICAL** to disable in production!

---

## 🗄️ Database & Supabase

### 5. Review Row Level Security (RLS) Policies

**Current State**: RLS policies may be permissive for development  
**Production Action**: Audit and tighten RLS policies

1. Go to **Supabase Dashboard** → **Authentication** → **Policies**
2. Review all RLS policies on your tables:
   - `users`
   - `classes`
   - `class_members`
   - `sessions`
   - `notes`
   - `flashcard_decks`
   - `flashcards`
   - `comments`
   - `upvotes`
   - `study_events`

3. Ensure policies:
   - Users can only access their own data
   - Class members can only access their classes
   - Public data (if any) is read-only
   - No policies allow unrestricted access

### 6. Review Database Indexes

**Current State**: Indexes created in setup script  
**Production Action**: Verify indexes are optimized

Check that indexes exist on:
- Foreign keys
- Frequently queried columns
- Join tables

### 7. Set Up Database Backups

**Production Action**: Enable automatic backups

1. Go to **Supabase Dashboard** → **Settings** → **Database**
2. Enable **Point-in-time Recovery** (if available on your plan)
3. Set up regular backup schedule
4. Test restore procedure

### 8. Review API Keys

**Current State**: Using anon key and service role key  
**Production Action**: Secure API keys

- **Anon Key**: Safe to use in frontend (has RLS protection)
- **Service Role Key**: **NEVER** expose in frontend - backend only!
- Consider rotating keys periodically
- Use environment variables, never hardcode

---

## 🌐 Frontend Configuration

### 9. Update API URLs

**Current State**: `http://localhost:5001/api`  
**Production Action**: Update to production API URL

Update `frontend/.env`:
```bash
REACT_APP_API_URL=https://api.yourdomain.com/api
```

Or if using the same domain:
```bash
REACT_APP_API_URL=https://yourdomain.com/api
```

### 10. Update Supabase URLs

**Current State**: Development Supabase project  
**Production Action**: Use production Supabase project (or keep same project)

If using a separate production Supabase project:
```bash
REACT_APP_SUPABASE_URL=https://your-production-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-production-anon-key
```

### 11. Enable Production Build Optimizations

**Production Action**: Build optimized production bundle

```bash
cd frontend
npm run build
```

This creates an optimized `build/` folder with:
- Minified JavaScript
- Optimized CSS
- Tree-shaking
- Code splitting

### 12. Set Up Error Tracking

**Production Action**: Add error tracking service

Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Google Analytics** for usage analytics

Example with Sentry:
```bash
npm install @sentry/react
```

---

## 🚀 Backend Configuration

### 13. Use Production WSGI Server

**Current State**: Flask development server (`flask run`)  
**Production Action**: Use production WSGI server

**DO NOT** use `flask run` in production! Use:

**Option A: Gunicorn** (Recommended)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 "app.main:app"
```

**Option B: uWSGI**
```bash
pip install uwsgi
uwsgi --http :5001 --wsgi-file app/main.py --callable app
```

### 14. Set Up Reverse Proxy

**Production Action**: Use Nginx or Apache as reverse proxy

Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 15. Enable HTTPS/SSL

**Production Action**: Set up SSL certificates

- Use **Let's Encrypt** (free) or commercial SSL
- Configure in Nginx/Apache
- Force HTTPS redirects
- Update CORS to use `https://` origins only

### 16. Set Up Logging

**Current State**: Print statements for debugging  
**Production Action**: Use proper logging

Update `backend/app/__init__.py`:
```python
import logging
from logging.handlers import RotatingFileHandler

# Configure logging
if not app.debug:
    file_handler = RotatingFileHandler('logs/mountainmerge.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
```

### 17. Remove Auto-Confirmation Code

**Current State**: Auto-confirms users in `auth_service.py`  
**Production Action**: Remove or disable auto-confirmation

In `backend/app/services/auth_service.py`, remove or comment out:
```python
# Remove this block in production:
# Auto-confirm email using admin API
admin_client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_KEY)
admin_client.auth.admin.update_user_by_id(user_id, {"email_confirm": True})
```

---

## 🔒 Security Hardening

### 18. Rate Limiting

**Production Action**: Add rate limiting to prevent abuse

Install Flask-Limiter:
```bash
pip install flask-limiter
```

Add to `backend/app/__init__.py`:
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Apply to auth routes
limiter.limit("5 per minute")(auth_bp)
```

### 19. Input Validation

**Production Action**: Add comprehensive input validation

- Validate all user inputs
- Sanitize data before database operations
- Use Pydantic models for request validation
- Check for SQL injection vulnerabilities
- Validate file uploads (if any)

### 20. Password Requirements

**Production Action**: Enforce strong password requirements

Update `frontend/src/pages/Auth/SignupPage.tsx`:
```typescript
// Require: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
```

### 21. Environment Variable Security

**Production Action**: Secure all environment variables

- Never commit `.env` files
- Use secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)
- Rotate keys regularly
- Use different keys for dev/staging/production

### 22. API Security Headers

**Production Action**: Add security headers

Add to Nginx or Flask middleware:
```python
@app.after_request
def set_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response
```

---

## 📊 Monitoring & Performance

### 23. Set Up Application Monitoring

**Production Action**: Monitor application health

- **Uptime monitoring**: UptimeRobot, Pingdom
- **Application Performance Monitoring (APM)**: New Relic, Datadog
- **Error tracking**: Sentry, Rollbar
- **Log aggregation**: Loggly, Papertrail

### 24. Database Performance Monitoring

**Production Action**: Monitor Supabase performance

- Check Supabase Dashboard → **Database** → **Performance**
- Monitor query performance
- Set up alerts for slow queries
- Review connection pool usage

### 25. Set Up Health Checks

**Production Action**: Configure health check endpoints

Already have `/api/health` - ensure it's:
- Accessible without authentication
- Returns meaningful status
- Checks database connectivity
- Used by load balancer/monitoring

---

## 📧 Email Configuration

### 26. Configure Production Email

**Production Action**: Set up custom SMTP (optional but recommended)

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Configure **SMTP Settings**:
   - Use SendGrid, Mailgun, or AWS SES
   - Update sender email
   - Customize email templates

### 27. Customize Email Templates

**Production Action**: Brand your confirmation emails

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Customize:
   - Confirmation email
   - Password reset email
   - Magic link email (if used)

---

## 🧪 Testing

### 28. Load Testing

**Production Action**: Test under load

- Use tools like **k6**, **Apache Bench**, or **Locust**
- Test critical endpoints:
  - `/api/auth/signup`
  - `/api/auth/login`
  - `/api/classes` (if implemented)
- Identify bottlenecks

### 29. Security Testing

**Production Action**: Perform security audit

- Run **OWASP ZAP** or similar
- Check for common vulnerabilities
- Review authentication flows
- Test authorization boundaries

### 30. Backup & Recovery Testing

**Production Action**: Test backup restoration

- Verify backups are working
- Test restore procedure
- Document recovery steps
- Set recovery time objectives (RTO)

---

## 📝 Documentation

### 31. Update Documentation

**Production Action**: Document production setup

- Deployment process
- Environment variables
- Database migrations
- Rollback procedures
- Incident response plan

### 32. Create Runbook

**Production Action**: Create operations runbook

Include:
- How to deploy updates
- How to rollback
- Common issues and solutions
- Contact information
- Escalation procedures

---

## ✅ Pre-Launch Checklist

Before going live, verify:

- [ ] Email confirmation enabled
- [ ] Debug mode disabled
- [ ] Production API URLs configured
- [ ] HTTPS/SSL enabled
- [ ] CORS restricted to production domains
- [ ] Secret keys rotated and secure
- [ ] RLS policies reviewed and tightened
- [ ] Rate limiting enabled
- [ ] Error tracking configured
- [ ] Logging set up
- [ ] Monitoring configured
- [ ] Backups enabled
- [ ] Health checks working
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation updated

---

## 🚨 Critical Security Reminders

1. **NEVER** commit `.env` files or secrets to git
2. **ALWAYS** use HTTPS in production
3. **DISABLE** debug mode in production
4. **RESTRICT** CORS to known domains
5. **ROTATE** API keys regularly
6. **MONITOR** for suspicious activity
7. **BACKUP** data regularly
8. **TEST** disaster recovery procedures

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Flask Production**: https://flask.palletsprojects.com/en/latest/deploying/
- **React Production**: https://create-react-app.dev/docs/deployment/

---

**Last Updated**: 2025-01-15  
**Version**: 1.0

