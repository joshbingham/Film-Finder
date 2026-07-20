let currentMovie = null;

const playBtn = document.getElementById('playBtn');

const minimumLoadingTime = 650;

const wait = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

const setRecommendationButtonLoading = (isLoading) => {
  playBtn.disabled = isLoading;
  playBtn.textContent = isLoading ? 'Finding film...' : 'Get Recommendation';
};

const getGenres = async () => {
  const urlToFetch = '/api/genres';

  try {
    const response = await fetch(urlToFetch);

    if (!response.ok) {
      throw new Error(`Error fetching genres: ${response.status}`);
    }

    const jsonResponse = await response.json();
    return jsonResponse.genres || [];
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

const getMovies = async () => {
  const selectedGenre = getSelectedGenre();
  const dateFilter = getSelectedDateFilter();

  let urlToFetch = `/api/tmdb?genre=${selectedGenre}`;

  if (dateFilter !== 'random') {
    urlToFetch += `&days=${dateFilter}`;
  }

  try {
    const response = await fetch(urlToFetch);

    if (!response.ok) {
      throw new Error(`Error fetching movies: ${response.status}`);
    }

    const jsonResponse = await response.json();
    return jsonResponse.results || [];
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

const getMovieInfo = async (movie) => {
  const movieId = movie.id;
  const urlToFetch = `/api/movie?id=${movieId}`;

  try {
    const response = await fetch(urlToFetch);

    if (!response.ok) {
      throw new Error(`Error fetching movie info: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

const getSavedGenreIds = () => {
  const likedMovies = getLikedMovies();
  const genreCounts = {};

  likedMovies.forEach((movie) => {
    if (!Array.isArray(movie.genre_ids)) {
      return;
    }

    movie.genre_ids.forEach((genreId) => {
      genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
    });
  });

  return Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([genreId]) => Number(genreId));
};

const calculateMatchInsights = (movie) => {
  const selectedGenre = getSelectedGenre();
  const selectedReleaseWindow = getSelectedDateFilter();
  const savedGenreIds = getSavedGenreIds();

  let score = 35;
  const reasons = [];

  if (
    selectedGenre &&
    Array.isArray(movie.genre_ids) &&
    movie.genre_ids.includes(Number(selectedGenre))
  ) {
    score += 20;
    reasons.push('Matches your selected genre.');
  }

  if (selectedReleaseWindow !== 'random') {
    score += 12;
    reasons.push('Falls within your chosen release window.');
  }

  if (typeof movie.vote_average === 'number') {
    if (movie.vote_average >= 7.5) {
      score += 22;
      reasons.push('Has a strong audience rating.');
    } else if (movie.vote_average >= 6.5) {
      score += 14;
      reasons.push('Has a solid audience rating.');
    } else if (movie.vote_average < 5) {
      score -= 10;
      reasons.push('Lower-rated film, included for variety.');
    }
  }

  if (typeof movie.vote_count === 'number') {
    if (movie.vote_count >= 1000) {
      score += 16;
      reasons.push('Has a large number of audience votes.');
    } else if (movie.vote_count >= 250) {
      score += 10;
      reasons.push('Has enough audience data to support the recommendation.');
    } else if (movie.vote_count < 50) {
      score -= 8;
      reasons.push('Has limited audience data, so the match is less certain.');
    }
  }

  if (movie.poster_path) {
    score += 6;
  } else {
    score -= 10;
    reasons.push('Poster data is unavailable.');
  }

  if (movie.overview) {
    score += 6;
  } else {
    score -= 8;
    reasons.push('Overview data is unavailable.');
  }

  const savedPreferenceMatch = savedGenreIds.find((genreId) => {
    return Array.isArray(movie.genre_ids) && movie.genre_ids.includes(genreId);
  });

  if (savedPreferenceMatch) {
    score += 14;
    reasons.push('Similar to genres you have previously saved.');
  }

  const normalisedScore = Math.max(0, Math.min(100, score));

  if (reasons.length === 0) {
    reasons.push('Recommended from your current filter selection.');
  }

  return {
    score: normalisedScore,
    reasons,
  };
};

const getRecommendedMovie = (movies) => {
  const scoredMovies = movies
    .map((movie) => ({
      movie,
      match: calculateMatchInsights(movie),
    }))
    .sort((a, b) => b.match.score - a.match.score);

  const topMatches = scoredMovies.slice(0, 5);
  const randomTopMatchIndex = Math.floor(Math.random() * topMatches.length);

  return topMatches[randomTopMatchIndex];
};

const normaliseGenreIds = (movieInfo, fallbackMovie) => {
  if (Array.isArray(fallbackMovie.genre_ids)) {
    return fallbackMovie.genre_ids;
  }

  if (Array.isArray(movieInfo.genres)) {
    return movieInfo.genres.map((genre) => genre.id);
  }

  return [];
};

const showRandomMovie = async () => {
  showLoadingState();
  setRecommendationButtonLoading(true);

  try {
    const [movies] = await Promise.all([
      getMovies(),
      wait(minimumLoadingTime),
    ]);

    if (!Array.isArray(movies) || movies.length === 0) {
      showEmptyState();
      return;
    }

    const recommendation = getRecommendedMovie(movies);

    if (!recommendation) {
      showEmptyState();
      return;
    }

    const [info] = await Promise.all([
      getMovieInfo(recommendation.movie),
      wait(minimumLoadingTime),
    ]);

    if (!info || info.success === false) {
      throw new Error('Movie details could not be loaded');
    }

    currentMovie = {
      ...info,
      genre_ids: normaliseGenreIds(info, recommendation.movie),
      match: recommendation.match,
    };

    clearCurrentMovie();
    displayMovie(currentMovie);
  } catch (error) {
    console.error('Unable to show recommendation:', error);
    showErrorState();
  } finally {
    setRecommendationButtonLoading(false);
  }
};

getGenres()
  .then(populateGenreDropdown)
  .catch(() => {
    showGenreLoadError();
  });

playBtn.addEventListener('click', showRandomMovie);