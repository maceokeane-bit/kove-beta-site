# Kove Campus Beta Site

Standalone QR landing page for campus posters promoting the Kove beta.

## Stack

- React + Vite
- Firebase Hosting
- Firestore for contact form storage
- Firebase Functions + Resend for contact email notifications

## Local setup

1. Install root dependencies with `npm install`.
2. Install Cloud Functions dependencies with `npm install --prefix functions`.
3. Copy `.env.example` to `.env` and fill in the Firebase web config.
4. Copy `functions/.env.example` to `functions/.env` and set:
   - `RESEND_API_KEY`
   - `CONTACT_NOTIFICATION_EMAIL`
   - `CONTACT_FROM_EMAIL`
5. Update `.firebaserc` with the real Firebase project id.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`

## Firebase notes

- Form submissions are written to the `contactSubmissions` Firestore collection.
- The Cloud Function `notifyOnContactSubmission` emails the Kove team when a new submission is created.
- If Firebase config is missing in the frontend, the contact form shows a safe error state instead of failing silently.
