# MyWork - Job Management & Scheduling Platform

A professional web application for managing jobs, scheduling, invoicing, and team coordination.

## Features

### Core Functionality
- **📅 Calendar View** - Visual job scheduling with day-by-day breakdown
- **📝 Job Management** - Create, edit, and delete jobs
- **💼 Line Items** - Add multiple service items with quantities and rates
- **💰 Automatic Calculations** - Real-time total pricing
- **👥 Team Assignment** - Assign jobs to team members
- **📊 Job Status Tracking** - Pending, In Progress, Completed, Cancelled

### Collaboration Features
- **📌 Notes** - Add and view job notes with timestamps
- **📸 Photos** - Upload and manage project photos
- **🚨 Service Alerts** - Report urgent issues with severity levels (SMS enabled)
- **⏱️ Duration Tracking** - Manage project timelines

### User Management
- **🔐 User Authentication** - Login with email and name
- **👤 Session Management** - Persistent login sessions
- **📱 User Profiles** - Track job creators and assignees

## Tech Stack

- **Frontend**: Next.js 15.5.7, React 19, Tailwind CSS v3
- **Backend**: Node.js with Next.js API routes
- **Database**: SQLite with Prisma ORM (easily migrate to PostgreSQL)
- **UI Components**: Lucide React icons, React Hot Toast notifications
- **State Management**: React hooks with localStorage for persistence
- **SMS**: Twilio integration for alert notifications

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Seed with demo data
npm run seed
```

### Development

```bash
# Start dev server (http://localhost:3000)
npm run dev
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Demo Accounts

Use these to test the application:

| Email | Name |
|-------|------|
| john@example.com | John Smith |
| admin@example.com | Admin User |

Or create your own account with any email/name combination.

## SMS Notifications (Twilio Integration)

### Quick Setup

1. **Create a Twilio Account**
   - Visit [twilio.com](https://www.twilio.com)
   - Sign up for a free account (includes $15 credit)
   - Verify your phone number

2. **Get Your Credentials**
   - Account SID: Found in Twilio Console
   - Auth Token: Found in Twilio Console
   - Phone Number: Purchase a Twilio phone number

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Twilio credentials:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ALERT_RECIPIENT_PHONE=+1987654321
   ```

4. **Redeploy**
   - SMS alerts will automatically send when service alerts are created
   - Leave these variables blank to disable SMS (alerts will still be logged to database)

### How It Works
- When a service alert is created, MyWork checks if Twilio credentials are configured
- If configured, sends SMS to the alert recipient with job details
- If not configured, alert is still saved to database (SMS is optional)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── jobs/                 # Job CRUD operations
│   │   ├── jobs/[jobId]/         # Job detail endpoints
│   │   ├── jobs/[jobId]/notes/   # Notes management
│   │   ├── jobs/[jobId]/photos/  # Photo uploads
│   │   ├── jobs/[jobId]/alerts/  # Service alerts (with SMS)
│   │   └── users/                # User authentication
│   ├── page.tsx                  # Main entry point
│   └── layout.tsx                # Root layout
├── components/
│   ├── JobCalendar.tsx           # Calendar view
│   ├── JobDetailModal.tsx        # Job details & editing
│   ├── CreateJobModal.tsx        # New job form
│   └── LoginScreen.tsx           # User authentication
└── globals.css                   # Global styles

prisma/
├── schema.prisma                 # Database schema
├── seed.ts                       # Demo data
└── migrations/                   # Database migrations
```

## Database Schema

### User
- `id` - Unique identifier
- `email` - User email (unique)
- `name` - Display name
- `role` - User role (user/admin)
- `phone` - Contact number (optional)

### Job
- `id` - Unique identifier
- `title` - Job name
- `description` - Job details
- `status` - pending/in-progress/completed/cancelled
- `scheduledDate` - Job date
- `duration` - Duration in days
- `assignedTo` - Team member
- `createdBy` - Job creator

## Usage

### Creating a Job
1. Click "New Job" button
2. Enter job title, description, and date
3. Add line items (services with qty/rate)
4. Set assignee
5. Submit to save

### Managing Jobs
- Click job on calendar to open details
- Edit title/description with "Edit" button
- Change status and duration
- Add notes and photos
- Report issues with alerts (triggers SMS if configured)
- Delete with confirmation

## Deployment

### Option 1: Vercel (Recommended for Next.js)

**Easiest and fastest deployment - includes free tier.**

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/mywork.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set environment variables:
     - `TWILIO_ACCOUNT_SID`
     - `TWILIO_AUTH_TOKEN`
     - `TWILIO_PHONE_NUMBER`
     - `ALERT_RECIPIENT_PHONE`
   - Click "Deploy"

3. **Database Migration on Vercel**
   - Vercel will persist SQLite file from your repo
   - Or use Vercel Postgres for managed database

**Vercel Features**: 
- Automatic deployments on git push
- Preview URLs for each branch
- Free HTTPS
- Automatic scaling
- Built-in analytics

### Option 2: Heroku

**Traditional PaaS platform with scalable options.**

1. **Install Heroku CLI**
   ```bash
   brew tap heroku/brew && brew install heroku
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create mywork-app
   heroku stack:set heroku-22
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set TWILIO_ACCOUNT_SID=your_sid
   heroku config:set TWILIO_AUTH_TOKEN=your_token
   heroku config:set TWILIO_PHONE_NUMBER=+1234567890
   heroku config:set ALERT_RECIPIENT_PHONE=+1987654321
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Database Setup**
   ```bash
   heroku run npx prisma migrate deploy
   heroku run npm run seed
   ```

6. **Verify Deployment**
   ```bash
   heroku open
   ```

**Note**: Use Heroku Eco Dynos ($5/month) or consider alternatives like Railway.

### Option 3: Railway.app

**Modern deployment platform - simpler than Heroku.**

1. **Connect GitHub Account**
   - Visit [railway.app](https://railway.app)
   - Connect GitHub account
   - Select mywork repository

2. **Configure Project**
   - Add PostgreSQL plugin (recommended over SQLite)
   - Set environment variables in Railway dashboard
   - Deploy automatically on git push

3. **Database Migration**
   ```bash
   railway run npx prisma migrate deploy
   ```

### Option 4: Render.com

**Free tier available, good for small projects.**

1. **Deploy Service**
   - Visit [render.com](https://render.com)
   - Click "New +"
   - Select "Web Service"
   - Connect GitHub

2. **Configuration**
   - Build command: `npm install && npx prisma migrate deploy`
   - Start command: `npm run start`
   - Environment variables in Settings

3. **Database**
   - Add PostgreSQL database service
   - Link to web service

### Database Backup & Migration

#### SQLite Backup
```bash
# Backup local database
cp prisma/dev.db prisma/dev.db.backup

# Export to SQL
sqlite3 prisma/dev.db ".dump" > backup.sql
```

#### Migrate to PostgreSQL (Recommended for Production)

```bash
# 1. Install PostgreSQL driver
npm install pg

# 2. Update DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@localhost:5432/mywork"

# 3. Generate and run migration
npx prisma migrate deploy

# 4. Verify data
npx prisma studio
```

## Suggested Features for Future Development

### Quick Wins (1-2 weeks)
1. **Email Notifications** - Notify users on job updates
2. **Advanced Filtering** - Filter by date, status, assignee
3. **Time Tracking** - Clock in/out, billable hours
4. **Job Templates** - Reusable job types for recurring work
5. **Search** - Full-text job search

### Core Enhancements (1-3 months)
6. **Invoice Generation** - Auto-generate PDFs with line items and totals
7. **Dashboard & Analytics** - Revenue, completion rates, team metrics
8. **Mobile Optimization** - Fully responsive mobile interface
9. **Customer Portal** - Let customers view their jobs
10. **Payment Integration** - Stripe/PayPal for online payments
11. **Expense Tracking** - Materials and labor cost tracking
12. **Recurring Jobs** - Schedule repeated jobs automatically

### Advanced Features (3-6 months)
13. **Advanced Scheduling** - Resource allocation, route optimization
14. **Multi-company Support** - Manage multiple business entities
15. **Document Management** - Store contracts, estimates, signatures
16. **API & Webhooks** - Third-party integrations
17. **Mobile App** - Native iOS/Android via React Native
18. **Integrations** - QuickBooks, Google Calendar, Slack

## Environment Variables Reference

Create `.env.local` based on `.env.example`:

```env
# Database (SQLite by default)
DATABASE_URL="file:./prisma/dev.db"

# Or use PostgreSQL for production
# DATABASE_URL="postgresql://user:password@host:5432/mywork"

# SMS Notifications (optional - leave blank to disable)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
ALERT_RECIPIENT_PHONE=+1987654321

# Environment
NODE_ENV=development
```

## File Uploads

- Photos are stored in `public/uploads/` directory
- Directory is created automatically on first upload
- Supports common image formats (jpg, png, gif, webp)

## Performance Metrics

- **Production Build**: 114 kB optimized bundle
- **First Load**: ~500ms
- **Database**: SQLite suitable for 10-100 concurrent users
- **Scalability**: PostgreSQL recommended for larger deployments

## Troubleshooting

### Port 3000 Already in Use
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Database Connection Issues
```bash
# Reset database (warning: deletes all data)
rm prisma/dev.db

# Reapply migrations
npx prisma migrate dev

# Reseed demo data
npm run seed
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Twilio SMS Not Sending
- Verify credentials in `.env.local` or deployment environment
- Check Twilio phone number is activated and has credits
- Verify recipient number format (include country code: +1 for US)
- Check Twilio console logs for error details
- Confirm alert is being created (check database)

### Production Server Won't Start
```bash
# Check for errors
npm run start

# Or run with debug output
NODE_DEBUG=http npm run start
```

## API Documentation

### Jobs
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/[jobId]` - Update job (title, description, status, duration)
- `DELETE /api/jobs/[jobId]` - Delete job

### Notes
- `GET /api/jobs/[jobId]/notes` - List job notes
- `POST /api/jobs/[jobId]/notes` - Add note to job

### Photos
- `GET /api/jobs/[jobId]/photos` - List job photos
- `POST /api/jobs/[jobId]/photos` - Upload photo to job

### Alerts
- `GET /api/jobs/[jobId]/alerts` - List job alerts
- `POST /api/jobs/[jobId]/alerts` - Create alert (triggers SMS if configured)

### Users
- `POST /api/users` - Create/verify user

## License

MIT

---

**MyWork v1.0** - Job Management Platform  
Built with ❤️ using Next.js, React, Tailwind CSS, and Prisma
