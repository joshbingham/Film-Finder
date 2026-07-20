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
  playBtn.textContent = isLoading ? 'Finding a film...' : 'Find a film';
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
  const releasePeriod = getReleasePeriod();

  const queryParams = new URLSearchParams();

  if (selectedGenre) {
    queryParams.set('genre', selectedGenre);
  }

  queryParams.set('releasePeriod', releasePeriod);

  const urlToFetch = `/api/tmdb?${queryParams.toString()}`;

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

const addMatchReason = (reasons, reason) => {
  if (!reasons.includes(reason)) {
    reasons.push(reason);
  }
};

const recentRecommendationsStorageKey = 'recentlyRecommendedMovies';
const recentRecommendationLimit = 12;

const getSavedMovieIds = () => {
  return getLikedMovies().map((movie) => String(movie.id));
};

const getRecentlyRecommendedMovieIds = () => {
  try {
    const recentlyRecommended = localStorage.getItem(recentRecommendationsStorageKey);

    return recentlyRecommended ? JSON.parse(recentlyRecommended).map(String) : [];
  } catch (error) {
    console.error('Unable to read recently recommended movies:', error);
    return [];
  }
};

const saveRecentlyRecommendedMovie = (movieId) => {
  const movieIdAsString = String(movieId);

  const updatedRecentMovies = [
    movieIdAsString,
    ...getRecentlyRecommendedMovieIds().filter((id) => id !== movieIdAsString),
  ].slice(0, recentRecommendationLimit);

  localStorage.setItem(
    recentRecommendationsStorageKey,
    JSON.stringify(updatedRecentMovies)
  );
};

const getFreshRecommendationPool = (movies) => {
  const savedMovieIds = new Set(getSavedMovieIds());
  const recentlyRecommendedMovieIds = new Set(getRecentlyRecommendedMovieIds());

  return movies.filter((movie) => {
    const movieId = String(movie.id);

    return !savedMovieIds.has(movieId) && !recentlyRecommendedMovieIds.has(movieId);
  });
};

const calculateMatchInsights = (movie) => {
  const selectedGenre = getSelectedGenre();
  const releasePeriod = getReleasePeriod();
  const releasePeriodLabel = getReleasePeriodLabel();
  const recommendationStyle = getRecommendationStyle();
  const recommendationStyleLabel = getRecommendationStyleLabel();
  const savedGenreIds = getSavedGenreIds();

  let score = 35;
  const reasons = [];

  const hasSavedPreferenceMatch = savedGenreIds.some((genreId) => {
    return Array.isArray(movie.genre_ids) && movie.genre_ids.includes(genreId);
  });

  if (
    selectedGenre &&
    Array.isArray(movie.genre_ids) &&
    movie.genre_ids.includes(Number(selectedGenre))
  ) {
    score += 18;
    addMatchReason(reasons, 'Matches your selected genre.');
  }

  if (releasePeriod !== 'any') {
    score += 10;
    addMatchReason(
        reasons,
        `Fits your chosen time period: ${releasePeriodLabel}.`
    );
    }

  if (movie.poster_path) {
    score += 5;
  } else {
    score -= 10;
    addMatchReason(reasons, 'A poster is not available for this film.');
  }

  if (movie.overview) {
    score += 5;
  } else {
    score -= 8;
    addMatchReason(reasons, 'A description is not available for this film.');
  }

  if (recommendationStyle === 'balanced') {
    addMatchReason(
      reasons,
      'This balances rating, popularity and films you have saved.'
    );

    if (typeof movie.vote_average === 'number') {
      if (movie.vote_average >= 7.5) {
        score += 20;
        addMatchReason(reasons, 'Has a strong audience rating.');
      } else if (movie.vote_average >= 6.5) {
        score += 12;
        addMatchReason(reasons, 'Has a solid audience rating.');
      }
    }

    if (typeof movie.vote_count === 'number') {
      if (movie.vote_count >= 1000) {
        score += 14;
        addMatchReason(reasons, 'Lots of viewers have rated it.');
      } else if (movie.vote_count >= 250) {
        score += 8;
        addMatchReason(reasons, 'Enough viewers have rated it to make the score useful.');
      }
    }

    if (hasSavedPreferenceMatch) {
      score += 12;
      addMatchReason(reasons, 'Similar to genres you have previously saved.');
    }
  }

  if (recommendationStyle === 'quality') {
    addMatchReason(reasons, 'This mood favours films with stronger ratings.');

    if (typeof movie.vote_average === 'number') {
      if (movie.vote_average >= 8) {
        score += 32;
        addMatchReason(reasons, 'Excellent audience rating.');
      } else if (movie.vote_average >= 7) {
        score += 24;
        addMatchReason(reasons, 'Strong audience rating.');
      } else if (movie.vote_average >= 6.5) {
        score += 12;
        addMatchReason(reasons, 'Solid rating, with room for stronger picks.');
      }
    }

    if (typeof movie.vote_count === 'number' && movie.vote_count >= 250) {
      score += 8;
      addMatchReason(reasons, 'The rating is backed by a useful number of viewers.');
    }

    if (hasSavedPreferenceMatch) {
      score += 8;
      addMatchReason(reasons, 'Also overlaps with genres you have saved before.');
    }
  }

  if (recommendationStyle === 'popular') {
    addMatchReason(reasons, 'This mood favours films many viewers have already rated.');

    if (typeof movie.vote_count === 'number') {
      if (movie.vote_count >= 3000) {
        score += 32;
        addMatchReason(reasons, 'A very widely watched and rated film.');
      } else if (movie.vote_count >= 1000) {
        score += 24;
        addMatchReason(reasons, 'A widely rated film.');
      } else if (movie.vote_count >= 250) {
        score += 12;
        addMatchReason(reasons, 'A good number of viewers have rated it.');
      }
    }

    if (typeof movie.vote_average === 'number' && movie.vote_average >= 6.5) {
      score += 10;
      addMatchReason(reasons, 'Popular with viewers and still well rated.');
    }

    if (hasSavedPreferenceMatch) {
      score += 8;
      addMatchReason(reasons, 'Also overlaps with genres you have saved before.');
    }
  }

  if (recommendationStyle === 'hidden-gems') {
    addMatchReason(
      reasons,
      'This mood looks for well-rated films that are not just the obvious blockbusters.'
    );

    if (
      typeof movie.vote_average === 'number' &&
      typeof movie.vote_count === 'number'
    ) {
      if (movie.vote_average >= 7 && movie.vote_count >= 50 && movie.vote_count <= 900) {
        score += 32;
        addMatchReason(reasons, 'Well rated, but not one of the most obvious picks.');
      } else if (movie.vote_average >= 6.5 && movie.vote_count < 1200) {
        score += 20;
        addMatchReason(reasons, 'Good rating with a less mainstream feel.');
      } else if (movie.vote_count >= 3000) {
        score -= 10;
        addMatchReason(reasons, 'More widely known than a typical hidden gem.');
      }
    }

    if (hasSavedPreferenceMatch) {
      score += 10;
      addMatchReason(reasons, 'Still similar to films you have saved before.');
    }
  }

  if (recommendationStyle === 'saved-preferences') {
    addMatchReason(
      reasons,
      'This uses the kinds of films you have saved before.'
    );

    if (hasSavedPreferenceMatch) {
      score += 34;
      addMatchReason(reasons, 'Similar to films you have saved before.');
    } else if (savedGenreIds.length === 0) {
      score += 8;
      addMatchReason(
        reasons,
        'Save more films and this option will get more personal over time.'
      );
    }

    if (typeof movie.vote_average === 'number' && movie.vote_average >= 6.5) {
      score += 12;
      addMatchReason(reasons, 'It is also well rated.');
    }

    if (typeof movie.vote_count === 'number' && movie.vote_count >= 250) {
      score += 8;
      addMatchReason(reasons, 'Has enough audience data to support the recommendation.');
    }
  }

  const normalisedScore = Math.max(0, Math.min(100, score));

  if (reasons.length === 0) {
    reasons.push('Chosen from the options that match your selection.');
  }

  return {
    score: normalisedScore,
    reasons: reasons.slice(0, 5),
    recommendationStyle,
    recommendationStyleLabel,
    releasePeriod,
    releasePeriodLabel,
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

    const freshRecommendationPool = getFreshRecommendationPool(movies);

    if (freshRecommendationPool.length === 0) {
        showNoNewRecommendationsState();
        return;
    }

    const recommendation = getRecommendedMovie(freshRecommendationPool);

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
        match: {
            ...recommendation.match,
            reasons: [
            'New pick — not saved or recently shown.',
            ...recommendation.match.reasons,
            ].slice(0, 5),
        },
        };

        clearCurrentMovie();
        displayMovie(currentMovie);
        saveRecentlyRecommendedMovie(currentMovie.id);

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