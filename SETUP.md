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

1. Create a new Google Sheet
2. Create the following sheets/tabs:

### Events Sheet
Columns (Row 1 headers):
- `id` - Unique identifier (e.g., UUID)
- `name` - Event name
- `date` - Event date (format: YYYY-MM-DD or readable format)
- `time` - Event time (optional)
- `description` - Event description (optional)
- `isSecret` - TRUE/FALSE (whether event is secret)
- `inviteList` - Comma-separated list of names (e.g., "Stef,Alex,Jordan")
- `responses` - JSON object string (e.g., `{"Stef":"in","Alex":"out"}`)

Example row:
```
id: event-001
name: Morning Meditation
date: 2024-06-15
time: 7:00 AM
description: Start the day with quiet reflection
isSecret: FALSE
inviteList: 
responses: {}
```

### GuestNotes Sheet
Columns (Row 1 headers):
- `id` - Unique identifier
- `name` - Guest name
- `message` - Note message (max 200 chars)
- `timestamp` - ISO timestamp

### MistLevel Sheet
Columns (Row 1 headers):
- `level` - Mist level (e.g., "High", "Medium", "Low")
- `message` - Message (e.g., "Bring a Sweater")

Example row:
```
level: High
message: Bring a Sweater
```

### UserMoods Sheet
Columns (Row 1 headers):
- `userName` - Guest name
- `mood` - Selected mood (e.g., "quiet-moss", "chaotic-squirrel", "ancient-burl")

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
```

Replace:
- `YOUR_SCRIPT_ID` with the ID from your Google Apps Script Web App URL
- `redwood` with your desired magic word (or keep it as "redwood")
- `YOUR_SHEET_ID` with your Google Sheet ID

## Step 5: Update Guest Names

Edit `components/EntryWay.tsx` and update the `GUEST_NAMES` array with your actual guest list:

```typescript
const GUEST_NAMES = [
  'Stef',
  'Alex',
  // ... add all guest names
]
```

Alternatively, you can fetch this from your Google Sheet by adding a new sheet and endpoint.

## Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 7: Test the Application

1. Go to the entry page
2. Select a name from the dropdown
3. Enter the magic word
4. Click "Enter"
5. Navigate through the different sections:
   - **Canopy**: Set your mood
   - **Root System**: Toggle event responses
   - **Forest Path**: View the itinerary
   - **Whispering Wall**: Leave a note

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

