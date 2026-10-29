# Gather

**A calmer way to plan a celebration.** Gather is a lightweight, responsive event-planning companion for weddings, birthdays, and community gatherings.

## What you can do

- Start a celebration plan and edit its name, type, date, location, and budget.
- Keep an eye on event spending and see what remains at a glance.
- Add planning milestones and update the vendor checklist.
- Ask the planning pal for tailored menu, guest-experience, budget, and styling ideas.
- Keep the plan on your device between visits (browser local storage).
- Use the app on desktop or mobile, with keyboard-accessible controls and visible focus states.

## Run it locally

Open `index.html` in a browser, or serve the folder with any static web server, such as:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish it

The app has no build step and can be hosted by GitHub Pages, Netlify, or any static host. Push this folder to a public GitHub repository (the source is comfortably under 10 MB) and enable Pages to get a public URL.

## About the planning pal

The assistant provides event-aware suggestions locally in the browser and does not send your plan to a service. Connect a language model API through a small server-side endpoint if you want open-ended generative responses; keep any API key on the server.

## Demo walkthrough (under 4 minutes)

1. Open Gather and introduce the wedding dashboard and countdown.
2. Edit the event details and adjust the budget to show the live progress bar.
3. Add a timeline milestone, then mark a vendor as booked.
4. Ask the planning pal for a budget-friendly idea and show the tailored response.
5. Resize to mobile view and wrap up with the saved plan.
