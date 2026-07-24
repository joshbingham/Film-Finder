# Film Finder

A taste-based recommendation tool designed to reduce decision fatigue and help users find films that match their mood, interests and saved preferences.

[Live application](https://film-finder-khaki.vercel.app/) · [Portfolio](https://joshbingham.dev/) · [GitHub repository](https://github.com/joshbingham/Film-Finder)

## Overview

Film Finder turns data from The Movie Database into a guided discovery experience.

Users can choose a genre, release period and recommendation style, then receive a film selected through custom scoring rather than a purely random choice. They can save films, record whether they liked them and gradually build a lightweight taste profile.

The project focuses on a common problem: streaming catalogues offer an enormous amount of choice, but that choice can make deciding what to watch more difficult.

## Why I built it

I wanted to explore how interface design and transparent recommendation logic could make a familiar, information-heavy task feel simpler.

Rather than building a general movie catalogue, I focused on helping users reach a decision. The application narrows a large dataset through a small number of meaningful choices and learns from the films a user saves or rates.

The result is a product-like experience that combines:

- external API integration
- recommendation logic
- persistent user preferences
- accessible interaction states
- useful watchlist insights

## Key features

### Guided film discovery

Users can refine recommendations by:

- genre
- release period
- recommendation style
- saved taste preferences

Recommendation styles include:

- Surprise me
- Top-rated picks
- Crowd-pleasers
- Hidden gems
- Based on my taste

### Film information

Recommendations can include:

- poster
- title
- overview
- audience rating
- release year
- cast information

Loading, empty and error states help the interface remain understandable when data is still being requested or is unavailable.

### Watchlist

Users can save recommendations to a persistent watchlist and later:

- sort saved films
- filter the list
- review key watchlist insights
- remove films
- record their reaction to a film

Watchlist information is stored in `localStorage`, so it remains available after the browser is closed.

### Taste feedback

Users can mark a film as:

- Loved it
- Liked it
- Not for me

These reactions feed into the taste profile and influence later recommendations.

### Watchlist insights

The application summarises the saved collection with information such as:

- most common genre
- average rating
- strongest recommendation fit

### Repetition control

Previously shown or rated films can be excluded from later results, reducing repeated recommendations.

### Accessibility and responsive behaviour

The interface includes:

- visible keyboard focus states
- keyboard-friendly controls
- responsive layouts
- reduced-motion support

## Recommendation system

Film Finder uses custom scoring rather than selecting a film entirely at random.

Each candidate can receive positive or negative weight from:

- selected genre
- selected release period
- chosen recommendation style
- audience rating
- number of viewer ratings
- poster and overview availability
- previously saved films
- previous user reactions

The taste profile treats user actions as weighted signals:

| User action | Signal |
|---|---|
| Saved to watchlist | Light positive |
| Liked it | Medium positive |
| Loved it | Strong positive |
| Not for me | Light negative |

This creates gradual personalisation while keeping the logic simple enough to explain.

The system is intentionally lightweight. It does not claim to be machine learning; it is a transparent set of product rules that turns user choices into more relevant results.

## Technical decisions

### Using serverless functions for TMDB requests

TMDB requests pass through Vercel serverless functions rather than exposing the API key in client-side JavaScript.

### Treating recommendations as a product flow

The controls are designed around the decision the user is trying to make, rather than mirroring every filter available from the API.

### Keeping scoring explainable

A rule-based system makes each signal easier to inspect, adjust and explain.

### Persisting preferences locally

`localStorage` provides lightweight persistence without requiring user accounts or a database.

It stores:

- watchlist items
- reactions
- taste information
- previously presented recommendations

### Separating reusable UI helpers

Repeated rendering and data-handling tasks are organised into helper functions so that recommendation, watchlist and feedback behaviour share consistent logic.

## Architecture

```text
Browser interface
     |
     | discovery choices
     v
JavaScript recommendation and UI logic
     |
     | secure film-data request
     v
Vercel serverless functions
     |
     v
TMDB API

Browser localStorage
     |
     └── watchlist, reactions, taste profile and recommendation history
```

## Tech stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Vercel serverless functions
- TMDB API
- `localStorage`
- Git
- GitHub
- Vercel

## Repository structure

```text
Film-Finder/
├── api/
├── helpers.js
├── index.html
├── liked-movies.html
├── liked-movies.js
├── script.js
├── style.css
├── vercel.json
└── README.md
```

## Running locally

Because the project uses Vercel serverless functions, run it through the Vercel development server.

### 1. Clone the repository

```bash
git clone https://github.com/joshbingham/Film-Finder.git
cd Film-Finder
```

### 2. Install the Vercel CLI if required

```bash
npm install --global vercel
```

### 3. Set the TMDB key

PowerShell:

```powershell
$env:TMDB_KEY="your_tmdb_key_here"
```

macOS or Linux:

```bash
export TMDB_KEY="your_tmdb_key_here"
```

### 4. Start the local server

```bash
npx vercel dev
```

## What I focused on

This project explored how thoughtful interface design and transparent recommendation logic can help users make quicker, more confident viewing decisions.

The main development areas were:

- fetching and presenting third-party API data
- designing a clear recommendation journey
- balancing several scoring signals
- building reusable rendering helpers
- handling loading, empty and error states
- persisting user choices in `localStorage`
- creating useful watchlist analysis
- improving keyboard and motion accessibility
- protecting an external API key through serverless functions

## Key learnings

The project strengthened my understanding of:

- turning raw API responses into a focused product experience
- using user behaviour as a lightweight recommendation signal
- preventing stale or repeated recommendations
- keeping persisted data consistent with rendered UI
- designing for empty and failure states as well as success
- separating client-side responsibilities from serverless API handling
- making custom scoring transparent and maintainable

## Future improvements

Potential next steps include:

- optional user accounts and cloud synchronisation
- richer explanations for why a film was recommended
- more detailed genre-affinity insights
- import and export for watchlists
- additional accessibility testing
- automated tests for scoring and persistence logic
- sharing a recommendation or watchlist
- more nuanced handling of films with limited rating data

## TMDB attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.

Movie metadata and images are provided by [The Movie Database](https://www.themoviedb.org/).

## Author

**Joshua Bingham**  
Frontend & Full-Stack Developer

[Portfolio](https://joshbingham.dev/) · [GitHub](https://github.com/joshbingham) · [LinkedIn](https://www.linkedin.com/in/joshua-bingham-48961112b)
