# Gather

**A calmer way to plan a celebration.** Gather is a lightweight, responsive event-planning companion for weddings, birthdays, and community gatherings.

## What you can do

- Start a celebration plan and edit its name, type, date, location, expected guest count, and budget.
- Keep an eye on event spending and see what remains at a glance.
- Add planning milestones and update the vendor checklist.
- Mark milestones complete and see the completed-task count update.
- Ask the planning pal for event-aware menu, guest-experience, budget, and styling ideas for weddings, birthdays, or community gatherings.
- Keep the plan on your device between visits (browser local storage).
- Download a JSON backup of the current plan for safekeeping.
- Restore a plan from a Gather JSON backup, so plans can move between browsers or devices.
- Use the app on desktop or mobile, with keyboard-accessible controls and visible focus states.
- Start a fresh plan with a practical starter timeline and vendor checklist.

## Run it locally

Open `index.html` in a browser, or serve the folder with any static web server, such as:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Project structure

- `index.html` contains the page content and controls.
- `styles.css` contains the visual styles, responsive layouts, and focus states.
- `app.js` loads and saves the plan, renders the dashboard, and handles planner actions and local suggestions.

The app has no build step or server dependency. Plans stay in the current browser's local storage. Download a JSON backup to move a plan, then use **Import backup** in the other browser. The planning pal uses rules in `app.js`; it does not call an AI model or send event details over the network.

## Publish it

The app has no build step and can be hosted by GitHub Pages, Netlify, or any static host. Push this folder to a public GitHub repository (the source is comfortably under 10 MB) and enable Pages to get a public URL.

## About the planning pal

The planning pal uses local, rule-based suggestions in the browser and does not send your plan to a service. It is not connected to a GenAI service. Its recommendations use your event type, budget, date, and location where relevant. Connect a language model API through a small server-side endpoint if you want open-ended generative responses; keep any API key on the server.

Saved plans are checked and normalized when loaded. If browser storage is unavailable, the current session remains usable but changes may not persist. Avoid entering sensitive personal information into event details.

## Demo walkthrough (under 4 minutes)

1. Open Gather and introduce the wedding dashboard and countdown.
2. Edit the event details and adjust the budget to show the live progress bar.
3. Add a timeline milestone, then mark a vendor as booked.
4. Ask the planning pal for a budget-friendly idea and show the tailored response.
5. Resize to mobile view and wrap up with the saved plan.
