# Pulse Magazine Newsletter Setup Guide

## Overview
The newsletter feature sends welcome emails to subscribers with curated content and information about available categories.

## Features Implemented

### 1. **Welcome Email**
When a user subscribes, they receive a personalized welcome email that includes:
- Warm greeting with subscriber's email
- Overview of what they'll receive (Weekly Digest, Editor's Notes, Recommendations, Exclusive Content)
- Category showcases (Tech, Culture, Music, Design)
- Call-to-action button to explore the magazine
- Contact information
- Professional HTML and plain text versions

### 2. **Weekly Digest Template**
Ready to send weekly emails with:
- Top 5 articles of the week
- Direct links to read full stories
- Category-specific content recommendations

### 3. **Subscriber Management**
- Tracks all subscribers in `data/content.json`
- Prevents duplicate subscriptions
- Admin endpoint to view subscriber list: `/api/newsletter/subscribers`

## Setup Instructions

### Step 1: Enable Gmail App Password
1. Go to [Google Account Security](https://myaccount.google.com/apppasswords)
2. Log in with your Google account
3. Select **Mail** and your **Device type** (Windows Computer, etc.)
4. Google will generate a 16-character app password
5. Copy this password

### Step 2: Configure Environment Variables
1. In the `Dynamic` folder, copy `.env.example` to `.env`
2. Open `.env` and add your credentials:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```
3. Replace `xxxx xxxx xxxx xxxx` with the 16-character password from Step 1

### Step 3: Update the Transporter in server.js (Optional)
If using a different email service (SendGrid, Mailgun, etc.), update the `emailConfig` object:
```javascript
const emailConfig = {
  service: "gmail", // Change to your service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};
```

## API Endpoints

### Subscribe to Newsletter
**POST** `/api/newsletter`
```json
Request:
{
  "email": "subscriber@gmail.com"
}

Response (Success):
{
  "message": "Successfully subscribed! Check your email for a welcome message.",
  "subscribed": true,
  "email": "subscriber@gmail.com"
}

Response (Already Subscribed):
{
  "message": "Already subscribed",
  "subscribed": false
}
```

### Get Subscribers List (Admin)
**GET** `/api/newsletter/subscribers`
```json
Response:
{
  "count": 5,
  "subscribers": ["user1@gmail.com", "user2@gmail.com", ...]
}
```

## Email Templates

### Welcome Email
- **Subject**: "Welcome to Pulse Magazine 🎉"
- **Includes**: 
  - Personalized greeting
  - Feature list (Weekly Digest, Editor's Notes, etc.)
  - Category information with descriptions
  - Call-to-action button
  - Contact information

### Weekly Digest Email (Ready to Use)
- **Subject**: "Pulse Magazine Weekly Digest 📰"
- **Includes**:
  - Top 5 articles of the week
  - Brief excerpts for each article
  - Direct links to read full stories
  - Professional layout

## Email Message Organization

The emails are structured in well-organized sections:

1. **Header** - Branded header with magazine name and tagline
2. **Welcome Section** - Personalized greeting
3. **What You'll Get Section** - Benefits of subscription with checkmarks
4. **Categories Section** - Overview of available content categories
5. **Next Steps Section** - Call-to-action with link to magazine
6. **Questions Section** - Contact information
7. **Pro Tips Section** - Helpful advice for email delivery
8. **Footer** - Copyright, links, and unsubscribe options

## How It Works

1. **User subscribes** via the footer newsletter form on the website
2. **Frontend** validates the email format and sends to `/api/newsletter`
3. **Backend** checks if email already subscribed
4. **Email is sent** using Nodemailer with the welcome template
5. **Subscriber added** to the `data/content.json` subscriber list
6. **Success message** displayed to the user

## Testing Without Gmail Setup

If you don't want to configure Gmail credentials yet:
- The subscription will still be saved to the database
- You'll see a success message
- Email sending will fail gracefully with a user-friendly error message

To enable actual email delivery:
1. Set up Gmail App Password (see Step 1)
2. Add credentials to `.env` file
3. Restart the server

## Troubleshooting

### "Less secure app access" Error
- Google no longer supports "Less secure app access"
- Use App Password method instead (see Step 1)

### Email Not Sent
1. Check `.env` file has correct credentials
2. Verify Gmail account has 2-factor authentication enabled
3. Check server logs for detailed error messages
4. Ensure internet connection is active

### Duplicate Subscriptions
- System prevents the same email from subscribing twice
- Users will see "You're already subscribed" message

## Future Enhancements

- Automated weekly digest sending
- Email preference management
- Unsubscribe functionality
- GDPR compliance features
- A/B testing for email subject lines
- Segmented emails based on category preferences
