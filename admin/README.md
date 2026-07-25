# Stempo Admin Panel

Admin panel for managing Stempo application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
VITE_API_URL=http://localhost:3000/api
VITE_ADMIN_EMAIL=admin@stempo.com
VITE_ADMIN_PASSWORD=admin123
```

3. Start development server:
```bash
npm run dev
```

## Features

- Business validation (approve/reject pending businesses)
- Business management (view, edit, delete)
- Bonus program validation (approve/reject pending programs)
- Dashboard with statistics

## Login

Use static admin credentials configured in `.env`:
- **Email:** `admin@stempo.com` (or value from `VITE_ADMIN_EMAIL`)
- **Password:** `admin123` (or value from `VITE_ADMIN_PASSWORD`)

The admin account is static and cannot be created through the API.
