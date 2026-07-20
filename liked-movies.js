const likedMoviesContainer = document.getElementById('likedMoviesContainer');
const savedMoviesSummary = document.getElementById('savedMoviesSummary');
const clearSavedMoviesBtn = document.getElementById('clearSavedMoviesBtn');

const savedInsightsPanel = document.getElementById('savedInsightsPanel');
const savedCountInsight = document.getElementById('savedCountInsight');
const averageRatingInsight = document.getElementById('averageRatingInsight');
const topGenreInsight = document.getElementById('topGenreInsight');
const strongestMatchInsight = document.getElementById('strongestMatchInsight');

const preferenceProfilePanel = document.getElementById('preferenceProfilePanel');
const preferenceProfileSummary = document.getElementById('preferenceProfileSummary');
const topGenresList = document.getElementById('topGenresList');

const genreNameMap = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

const getLikedMovies = () => {
  try {
    const liked = localStorage.getItem('likedMovies');
    return liked ? JSON.parse(liked) : [];
  } catch (error) {
    console.error('Unable to read saved movies:', error);
    return [];
  }
};

const saveLikedMovies = (movies) => {
  localStorage.setItem('likedMovies', JSON.stringify(movies));
};

const getPosterUrl = (posterPath) => {
  if (!posterPath) {
    return null;
  }

  return `https://image.tmdb.org/t/p/w500/${posterPath}`;
};

const formatRating = (rating) => {
  if (typeof rating !== 'number') {
    return 'Not rated';
  }

  return `${rating.toFixed(1)} / 10`;
};

const formatReleaseYear = (releaseDate) => {
  if (!releaseDate) {
    return 'Release date unavailable';
  }

  const year = new Date(releaseDate).getFullYear();

  return Number.isNaN(year) ? 'Release date unavailable' : year;
};

const formatSavedDate = (savedAt) => {
  if (!savedAt) {
    return null;
  }

  const date = new Date(savedAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getGenreName = (genreId) => {
  return genreNameMap[genreId] || 'Unknown genre';
};

const getGenreCounts = (movies) => {
  const genreCounts = {};

  movies.forEach((movie) => {
    if (!Array.isArray(movie.genre_ids)) {
      return;
    }

    movie.genre_ids.forEach((genreId) => {
      genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
    });
  });

  return Object.entries(genreCounts)
    .map(([genreId, count]) => ({
      id: Number(genreId),
      name: getGenreName(Number(genreId)),
      count,
    }))
    .sort((a, b) => b.count - a.count);
};

const calculateSavedInsights = (movies) => {
  const ratings = movies
    .map((movie) => movie.vote_average)
    .filter((rating) => typeof rating === 'number');

  const averageRating =
    ratings.length > 0
      ? ratings.reduce((total, rating) => total + rating, 0) / ratings.length
      : null;

  const genreCounts = getGenreCounts(movies);

  const matchScores = movies
    .map((movie) => movie.match_score)
    .filter((score) => typeof score === 'number');

  const strongestMatch =
    matchScores.length > 0 ? Math.max(...matchScores) : null;

  return {
    savedCount: movies.length,
    averageRating,
    topGenre: genreCounts[0] || null,
    topGenres: genreCounts.slice(0, 4),
    strongestMatch,
  };
};

const updateInsights = (movies) => {
  if (movies.length === 0) {
    savedInsightsPanel.hidden = true;
    preferenceProfilePanel.hidden = true;

    savedCountInsight.textContent = '0';
    averageRatingInsight.textContent = '—';
    topGenreInsight.textContent = '—';
    strongestMatchInsight.textContent = '—';

    preferenceProfileSummary.textContent =
      'Save films to build a preference profile.';

    topGenresList.innerHTML = '';

    return;
  }

  const insights = calculateSavedInsights(movies);

  savedInsightsPanel.hidden = false;
  preferenceProfilePanel.hidden = false;

  savedCountInsight.textContent = insights.savedCount;

  averageRatingInsight.textContent =
    insights.averageRating === null
      ? '—'
      : `${insights.averageRating.toFixed(1)} / 10`;

  topGenreInsight.textContent = insights.topGenre ? insights.topGenre.name : '—';

  strongestMatchInsight.textContent =
    insights.strongestMatch === null ? '—' : `${insights.strongestMatch}%`;

  if (insights.topGenre) {
    preferenceProfileSummary.textContent =
      `You are currently saving more ${insights.topGenre.name.toLowerCase()} films than anything else. Future recommendations can use this saved pattern to surface more relevant matches.`;
  } else {
    preferenceProfileSummary.textContent =
      'Save more films to build a clearer preference profile.';
  }

  topGenresList.innerHTML = '';

  if (insights.topGenres.length === 0) {
    const emptyGenreMessage = document.createElement('p');
    emptyGenreMessage.className = 'muted-note';
    emptyGenreMessage.textContent =
      'Genre data is not available for your saved films yet. Save a few new recommendations to build a stronger profile.';

    topGenresList.appendChild(emptyGenreMessage);
    return;
  }

  insights.topGenres.forEach((genre) => {
    const genreChip = document.createElement('span');
    genreChip.className = 'genre-insight-chip';
    genreChip.textContent = `${genre.name} × ${genre.count}`;
    topGenresList.appendChild(genreChip);
  });
};

const createSavedMatchPanel = (movie) => {
  if (typeof movie.match_score !== 'number' && !Array.isArray(movie.match_reasons)) {
    return null;
  }

  const panel = document.createElement('div');
  panel.className = 'saved-match-panel';

  if (typeof movie.match_score === 'number') {
    const score = document.createElement('span');
    score.className = 'saved-match-score';
    score.textContent = `${movie.match_score}% match`;
    panel.appendChild(score);
  }

  if (Array.isArray(movie.match_reasons) && movie.match_reasons.length > 0) {
    const reasons = document.createElement('ul');
    reasons.className = 'saved-match-reasons';

    movie.match_reasons.slice(0, 3).forEach((reason) => {
      const item = document.createElement('li');
      item.textContent = reason;
      reasons.appendChild(item);
    });

    panel.appendChild(reasons);
  }

  return panel;
};

const createSavedMovieCard = (movie) => {
  const card = document.createElement('article');
  card.className = 'saved-movie-card';

  const posterWrapper = document.createElement('div');
  posterWrapper.className = 'saved-movie-poster';

  const posterUrl = getPosterUrl(movie.poster_path);

  if (posterUrl) {
    const posterImage = document.createElement('img');
    posterImage.src = posterUrl;
    posterImage.alt = `${movie.title} poster`;
    posterWrapper.appendChild(posterImage);
  } else {
    const posterPlaceholder = document.createElement('p');
    posterPlaceholder.textContent = 'No poster available';
    posterWrapper.appendChild(posterPlaceholder);
  }

  const content = document.createElement('div');
  content.className = 'saved-movie-content';

  const title = document.createElement('h2');
  title.textContent = movie.title || 'Untitled film';

  const meta = document.createElement('p');
  meta.className = 'saved-movie-meta';
  meta.textContent = `${formatRating(movie.vote_average)} · ${formatReleaseYear(movie.release_date)}`;

  const savedDate = formatSavedDate(movie.saved_at);

  const savedMeta = document.createElement('p');
  savedMeta.className = 'saved-date-meta';
  savedMeta.textContent = savedDate ? `Saved ${savedDate}` : 'Saved to shortlist';

  const matchPanel = createSavedMatchPanel(movie);

  const overview = document.createElement('p');
  overview.className = 'saved-movie-overview';
  overview.textContent = movie.overview || 'No overview available.';

  const removeButton = document.createElement('button');
  removeButton.className = 'remove-saved-button';
  removeButton.type = 'button';
  removeButton.dataset.movieId = movie.id;
  removeButton.innerHTML = '<i class="fa-solid fa-trash"></i> Remove';

  content.appendChild(title);
  content.appendChild(meta);
  content.appendChild(savedMeta);

  if (matchPanel) {
    content.appendChild(matchPanel);
  }

  content.appendChild(overview);
  content.appendChild(removeButton);

  card.appendChild(posterWrapper);
  card.appendChild(content);

  return card;
};

const renderEmptyState = () => {
  likedMoviesContainer.innerHTML = '';

  const emptyState = document.createElement('div');
  emptyState.className = 'saved-empty-state';

  const heading = document.createElement('h2');
  heading.textContent = 'No saved films yet';

  const message = document.createElement('p');
  message.textContent =
    'Return to Film Finder, generate recommendations, and save films to build your shortlist and preference profile.';

  const link = document.createElement('a');
  link.className = 'primary-action';
  link.href = 'index.html';
  link.textContent = 'Find films';

  emptyState.appendChild(heading);
  emptyState.appendChild(message);
  emptyState.appendChild(link);

  likedMoviesContainer.appendChild(emptyState);

  savedMoviesSummary.textContent = 'Saved films will appear here after you add them.';
  clearSavedMoviesBtn.hidden = true;
  updateInsights([]);
};

const renderSavedMovies = () => {
  const likedMovies = getLikedMovies();

  likedMoviesContainer.innerHTML = '';

  if (likedMovies.length === 0) {
    renderEmptyState();
    return;
  }

  savedMoviesSummary.textContent =
    `${likedMovies.length} saved ${likedMovies.length === 1 ? 'film' : 'films'} in your shortlist.`;

  clearSavedMoviesBtn.hidden = false;
  updateInsights(likedMovies);

  likedMovies.forEach((movie) => {
    const card = createSavedMovieCard(movie);
    likedMoviesContainer.appendChild(card);
  });
};

const removeSavedMovie = (movieId) => {
  const likedMovies = getLikedMovies();
  const updatedMovies = likedMovies.filter((movie) => String(movie.id) !== String(movieId));

  saveLikedMovies(updatedMovies);
  renderSavedMovies();
};

likedMoviesContainer.addEventListener('click', (event) => {
  const removeButton = event.target.closest('.remove-saved-button');

  if (!removeButton) {
    return;
  }

  removeSavedMovie(removeButton.dataset.movieId);
});

clearSavedMoviesBtn.addEventListener('click', () => {
  const confirmed = window.confirm('Clear all saved films from your shortlist?');

  if (!confirmed) {
    return;
  }

  localStorage.removeItem('likedMovies');
  renderSavedMovies();
});

renderSavedMovies();