# Sri Nandini Travels website and driver dashboard

This project contains:

- a travel website landing page
- a driver dashboard for upcoming and active rides
- a low-cost setup suitable for deployment on Vercel or Netlify
- a path for adding Google reviews and real booking data later

## Files

- `index.html` – public website
- `dashboard.html` – driver dashboard mockup
- `styles.css` – website styling
- `dashboard.css` – dashboard styling
- `script.js` – website interactions and WhatsApp booking logic
- `dashboard.js` – dashboard ride data and filtering

## Local preview

Open the website directly in the browser or run a local static server:

```bash
python -m http.server 8000
```

Then visit:

- http://localhost:8000/index.html
- http://localhost:8000/dashboard.html

## Production deployment

This project is now prepared for a production-style launch path.

### Best stack

- Domain: GoDaddy
- Frontend hosting: Vercel
- Database: Supabase
- Driver auth: Supabase Auth
- Dashboard: private login and trip management

### Vercel
1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Deploy as a static frontend.
4. Add your GoDaddy custom domain.

### Netlify (alternative)
1. Push the project to GitHub.
2. Import in Netlify.
3. Deploy with default static settings.

## Driver dashboard backend

For real business use, connect the dashboard to Supabase:

- Create a `drivers` table
- Create a `trips` table
- Create a `bookings` table
- Add auth for driver login
- Add trip status updates and manual call entries

See `supabase/schema.sql` for the starting SQL.

## Google reviews

Use your Google Business profile and Google Places/Business Profile API to show live reviews. For the first launch, a static review block is acceptable and cheaper.

## Cost estimate

- Domain: ₹300–₹800/year
- Hosting: ₹0–₹1,200/month
- Supabase: free to low cost early on
- Total: very affordable for a small local business

## Example production stack

- Frontend: Vercel
- Database: Supabase
- Auth: Supabase Auth
- Real-time dashboard: Supabase Realtime
- Booking: form saves to Supabase
- WhatsApp: direct link or WhatsApp Business

## Business note

Demo login credentials and seeded demo rides have been removed. The dashboard stays unavailable until Supabase Auth and shared trip storage are connected; local browser storage must not be used for real customer bookings.

## Deployment details

See `DEPLOYMENT.md` for step-by-step GoDaddy, Vercel, and Supabase setup instructions.
