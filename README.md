# Kidbrooke ASB Report

Simple static web form for neighbours to report anti-social behaviour. Opens the device email app with a pre-filled report to local property managers.

## Features

- Single screen, clean mobile-first layout
- Name, address, date, time, building, ASB type
- Optional photo (attach manually in email app)
- No server storage

## Recipients

- zaykhan@lqgroup.org.uk
- concierge@kvmeridiangate.net
- Ruby.Frampton@rendallandrittner.co.uk

## Run locally

Open `index.html` in a browser, or:

```bash
cd kidbrooke-asb-report
python3 -m http.server 8080
```

Then visit http://localhost:8080

## GitHub Pages

1. Create a new public repo under **marketingstrategyapp** named `kidbrooke-asb-report`
2. Push this folder to `main`
3. Settings → Pages → Deploy from branch `main` / root
4. Share: `https://marketingstrategyapp.github.io/kidbrooke-asb-report/`

## Privacy

Nothing is stored on the website. Data only leaves the device when the user sends the email.
