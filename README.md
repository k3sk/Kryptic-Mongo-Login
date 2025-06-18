# SaaS Landing Page with Portfolio Dashboard

A SaaS-style landing page with user sign-up, email verification, and a post-login portfolio dashboard.

## Features
- Modern landing page with Tailwind CSS
- User sign-up with email verification (Nodemailer + Gmail App Password)
- MongoDB for user storage
- Login with modal
- After login, users see a portfolio dashboard (profile, social links, print CV)

## Setup
1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your credentials
4. Start MongoDB locally
5. Run `npm run dev`
6. Visit `http://localhost:5000`

## Environment Variables
See `.env.example` for required variables.

## Deployment
- All static files are in `public/`
- Place your profile image and CV in the correct locations

## Security
- `.env` is gitignored to protect your secrets

---
**Made by Chongtham Soumya** 