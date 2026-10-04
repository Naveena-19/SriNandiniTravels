# Production deployment guide

This project is ready for a static website deployment and a secure driver dashboard flow.

## Recommended stack

- Domain: GoDaddy
- Frontend hosting: Vercel
- Database: Supabase
- Driver auth: Supabase Auth
- Booking storage: Supabase `trips` and `bookings` tables

## 1. Deploy frontend to Vercel

1. Push this project to GitHub.
2. Open Vercel.
3. Import the repository.
4. Choose static deployment.
5. Set the root to the project folder.
6. Deploy.

## 2. Add custom domain from GoDaddy

1. In Vercel, go to Project settings > Domains.
2. Add your custom domain such as `yourdomain.in`.
3. Copy the DNS values Vercel gives you.
4. In GoDaddy, update the DNS records.
5. Wait for DNS propagation.

Typical records:

- A record to Vercel IP or apex domain mapping
- CNAME record for www if needed

## 3. Set up Supabase

1. Create a new Supabase project.
2. Open SQL Editor.
3. Run the contents of `supabase/schema.sql`.
4. Save the project URL and anon key.

## 4. Connect driver login

Use Supabase Auth with a simple driver-only login system.

Suggested logic:

- Driver enters driver ID and password
- App authenticates with Supabase Auth
- Dashboard checks session before loading data
- Owner/admin has full access
- Driver only sees assigned trip data

## 5. Save bookings data

Use the booking form to send data to Supabase.

Example table:

- `bookings`
  - id
  - name
  - phone
  - pickup
  - destination
  - travel_date
  - car_type
  - notes
  - created_at

## 6. Driver dashboard requirements

Driver dashboard should support:

- Today tab
- Upcoming tab
- Completed tab
- Call-only tab
- Add direct call trip
- Update trip status to active/completed/upcoming
- Search by customer name or route

## 7. Google reviews

For live Google reviews, connect your Google Business Profile and use the Places or Business Profile API.

For a quick launch, the site can show a static review block first and then upgrade to live reviews later.

## 8. Final production checklist

- domain connected
- website live on Vercel
- booking form saves to Supabase
- dashboards protected by auth
- drivers can update trip status
- all trip data remains private
- Google reviews section active
- WhatsApp links verified

## 9. Simple launch cost estimate

- Domain: ₹300–₹800/year
- Vercel hosting: usually free or low cost
- Supabase: free or low cost initial usage
- Total: very affordable for a local travel business
