# Film Finder

Film Finder is a movie discovery app that helps users find something to watch based on mood, genre, release period and a lightweight taste profile.

It uses the TMDB API to fetch film data, then applies custom recommendation scoring to suggest films that match the user's choices and saved preferences.

## Features

- Discover films by genre, time period and recommendation style
- Choose between moods such as Surprise me, Top-rated picks, Crowd-pleasers, Hidden gems and Based on my taste
- View film posters, overview, rating, release year and cast information
- Save films to a watchlist
- Mark films as Loved it, Liked it or Not for me
- Build a lightweight taste profile from saved and rated films
- Avoid repeated recommendations
- Review watchlist insights including top genre, average rating and best fit
- Sort and filter the watchlist
- Responsive interface with accessible focus states and reduced-motion support

## Recommendation system

Film Finder uses a custom scoring system rather than choosing films completely at random.

Each recommendation receives a match score based on:

- Selected genre
- Selected release period
- Recommendation style
- Audience rating
- Number of viewer ratings
- Availability of poster and overview data
- Saved films
- Films marked as Loved it, Liked it or Not for me

The taste profile uses weighted signals:

- Saved to watchlist: light positive signal
- Liked it: medium positive signal
- Loved it: strong positive signal
- Not for me: light negative signal

This allows the app to gradually adjust recommendations while keeping the logic transparent and easy to explain.

## Tech stack

- HTML
- CSS
- JavaScript
- Vercel serverless functions
- TMDB API
- LocalStorage

## What I focused on

This project was built to practise turning API data into a more product-like user experience.

The main focus areas were:

- Fetching and displaying third-party API data
- Designing a clear recommendation flow
- Building reusable UI helper functions
- Handling loading, empty and error states
- Persisting user choices in localStorage
- Creating a watchlist experience with useful insights
- Improving accessibility through focus states, keyboard support and reduced-motion handling

## Running locally

This project uses Vercel serverless functions, so it should be run with Vercel's local development server.

```powershell
$env:TMDB_KEY="your_tmdb_key_here"
npx vercel dev
