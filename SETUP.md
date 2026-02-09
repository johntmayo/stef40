# Setup Guide for The Redwood Portal

## Prerequisites

- Node.js 18+ installed
- A Google account with access to Google Sheets
- Basic knowledge of Google Apps Script

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Google Sheet

1. Create a new Google Sheet (or use your existing one).
2. Create three tabs with these **exact names**: **Guests**, **Itinerary**, **Wall**.

See **[SPREADSHEET_SETUP.md](./SPREADSHEET_SETUP.md)** for the exact column headers and examples for each tab. Summary:

- **Guests** – Column A header `Name`, then one guest name per row. This list powers the login dropdown.
- **Itinerary** – Events. Row 1: `id`, `name`, `date`, `time`, `endTime`, `location`, `description`, `isSecret`, `inviteList`, `responses`. One event per row from row 2.
- **Wall** – Guest notes and host posts. Row 1: `id`, `name`, `message`, `timestamp`, `isHost`. Notes are added by the site; you can leave it empty.
- **Logistics** (optional) – For the **Info** page. Row 1: `key` | `value`. Add rows like "When" / "June 14–16" so Stef can share basic logistics.

Optional tabs **MistLevel** and **UserMoods** are created by the script if missing.

## Step 3: Set Up Google Apps Script

1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Delete the default code and paste the contents of `google-apps-script-example.js`
3. Replace `YOUR_SPREADSHEET_ID` with your actual Google Sheet ID (found in the URL)
4. Save the script
5. Click **Deploy** → **New deployment**
6. Click the gear icon ⚙️ next to "Select type" and choose **Web app**
7. Configure:
   - **Execute as**: Me
   - **Who has access**: Anyone
8. Click **Deploy**
9. Copy the **Web App URL** (you'll need this for the environment variable)

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in the root directory
2. Add the following:

```env
NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
NEXT_PUBLIC_MAGIC_WORD=redwood
NEXT_PUBLIC_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID
# Optional: Stef's admin password (only she uses this to access Admin). Default: puddle
NEXT_PUBLIC_STEF_ADMIN_PASSWORD=puddle
```

Replace:
- `YOUR_SCRIPT_ID` with the ID from your Google Apps Script Web App URL
- `redwood` with your desired magic word for guests (or keep as "redwood")
- `YOUR_SHEET_ID` with your Google Sheet ID
- Stef logs in with her name and the admin password above; other guests use the magic word.

## Step 5: Guest names

Guest names are loaded from the **Guests** sheet (column A). Add one name per row under the header. No need to edit code.

## Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 7: Test the Application

1. Go to the entry page.
2. Select a name from the dropdown (filled from your Guests sheet).
3. Enter the magic word.
4. Click "Enter".
5. Use the **theme toggle** (paint palette icon in the nav) to switch Light / Dusk / Dark.
6. Navigate:
   - **Dashboard** – Set your mood.
   - **Info** – Basic logistics (from the Logistics sheet).
   - **RSVPs** – Say In/Out for each event.
   - **Itinerary** – View the schedule and mist level.
   - **Guestbook** – Leave a note; host posts show as "From the host".
7. **Admin (Stef only):** Log in with name **Stef** and her **admin password** (default: `puddle`). The nav then shows an Admin link. There she can:
   - Create events (with optional start/end time and location).
   - Make posts to the Guestbook.
   - See who has RSVP'd to each event.
   - Open the Google Sheet to edit data directly.

## Troubleshooting

### Google Apps Script Errors

- Make sure the script is deployed as a Web App (not just saved)
- Check that "Who has access" is set to "Anyone"
- Verify the Spreadsheet ID is correct
- Check the Apps Script execution logs for errors

### CORS Issues

- Google Apps Script Web Apps handle CORS automatically, but make sure your deployment is set to "Anyone"

### Data Not Loading

- Check browser console for errors
- Verify the Google Script URL is correct in `.env.local`
- Make sure the sheet names match exactly (case-sensitive)
- Verify column headers match the expected format

### Authentication Issues

- Clear localStorage: `localStorage.clear()` in browser console
- Verify the magic word matches in `.env.local`

## Production Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy to Vercel, Netlify, or your preferred hosting:
   - Make sure to add the environment variables in your hosting platform
   - The site is fully static and can be deployed anywhere

## Customization

### Colors
Edit `tailwind.config.js` to customize the color palette.

### Fonts
The site uses Google Fonts. To change fonts, update `app/globals.css` and `tailwind.config.js`.

### Images
Replace the background image URL in `components/EntryWay.tsx` with your own redwood image.

