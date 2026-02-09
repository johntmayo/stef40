# Spreadsheet setup (Guests, Itinerary, Wall)

Your Google Sheet should have **at least** these three tabs. The Apps Script uses these exact names.

---

## 1. **Guests** tab

- **Row 1:** Put the header in cell **A1**: `Name`
- **From row 2:** One guest name per row in column A (e.g. A2: Stef, A3: Alex, A4: Jordan).

The site uses this list for the “Identify yourself in the grove” dropdown on the entry page.

---

## 2. **Itinerary** tab (events)

- **Row 1 (headers):**  
  `id` | `name` | `date` | `time` | `description` | `isSecret` | `inviteList` | `responses`

- **From row 2:** One event per row.

| Column       | Example                    | Notes |
|-------------|----------------------------|--------|
| id          | `event-001` or leave blank | Script can generate if blank |
| name        | Morning Coffee             | Event title |
| date        | 2025-06-15                 | YYYY-MM-DD works best |
| time        | 9:00 AM                    | Optional |
| description | Optional text              | Optional |
| isSecret    | FALSE                      | TRUE = only invited guests see it |
| inviteList  | Stef, Alex, Jordan         | Comma-separated names (for secret events) |
| responses   | `{}`                       | Leave as `{}`; script fills RSVPs |

**Example row 2:**  
`event-001` | `Welcome Dinner` | `2025-06-14` | `6:00 PM` | `Meet at the lodge` | FALSE | | `{}`

---

## 3. **Wall** tab (guest notes + host posts)

- **Row 1 (headers):**  
  `id` | `name` | `message` | `timestamp` | `isHost`

- **From row 2:** One note or post per row.  
  - Guest notes: `isHost` = FALSE (or leave blank).  
  - Host posts (from Admin): `isHost` = TRUE.

You can leave the Wall empty; the script (and “Leave note” / Admin “Make post”) will add rows. If you already have a “Wall” tab with only one column, add the other header columns (id, name, message, timestamp, isHost) in row 1.

---

## Optional tabs (created by the script if missing)

- **MistLevel** – Row 1: `level` | `message`. Row 2: e.g. `Medium` | `Dress in layers.`
- **UserMoods** – Row 1: `userName` | `mood`. Data rows are added when guests set their mood on the Canopy page.

If you don’t create these, the script will create them when needed.

---

## After editing the sheet

1. In the sheet: **Extensions → Apps Script**.
2. Paste the code from `google-apps-script-example.js` and set `SPREADSHEET_ID` to your sheet ID (from the URL: `https://docs.google.com/spreadsheets/d/ **SPREADSHEET_ID** /edit`).
3. **Deploy → New deployment → Web app** (Execute as: Me, Who has access: Anyone).
4. Copy the Web App URL into `.env.local` as `NEXT_PUBLIC_GOOGLE_SCRIPT_URL`.

Once the script is deployed and the URL is set, the site will use **Guests** for names, **Itinerary** for events, and **Wall** for notes and posts.
