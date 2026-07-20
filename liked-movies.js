const likedMoviesContainer = document.getElementById('likedMoviesContainer');
const savedMoviesSummary = document.getElementById('savedMoviesSummary');
const clearSavedMoviesBtn = document.getElementById('clearSavedMoviesBtn');

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

  return new Date(releaseDate).getFullYear();
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
    'Return to Film Finder, generate recommendations, and save films to build your shortlist.';

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

  saveLikedMovies([]);
  renderSavedMovies();
});

renderSavedMovies();