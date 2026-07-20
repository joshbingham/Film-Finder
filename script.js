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

const addMatchReason = (reasons, reason) => {
  if (!reasons.includes(reason)) {
    reasons.push(reason);
  }
};

const filterMoviesByMinimumRating = (movies) => {
  const minimumRating = getMinimumRating();

  if (!minimumRating) {
    return movies;
  }

  return movies.filter((movie) => {
    return typeof movie.vote_average === 'number' && movie.vote_average >= minimumRating;
  });
};

const calculateMatchInsights = (movie) => {
  const selectedGenre = getSelectedGenre();
  const selectedReleaseWindow = getSelectedDateFilter();
  const recommendationStyle = getRecommendationStyle();
  const recommendationStyleLabel = getRecommendationStyleLabel();
  const minimumRating = getMinimumRating();
  const minimumRatingLabel = getMinimumRatingLabel();
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

  if (selectedReleaseWindow !== 'random') {
    score += 10;
    addMatchReason(reasons, 'Falls within your chosen release window.');
  }

  if (
    minimumRating > 0 &&
    typeof movie.vote_average === 'number' &&
    movie.vote_average >= minimumRating
  ) {
    score += 12;
    addMatchReason(reasons, `Meets your ${minimumRating}+ rating preference.`);
  }

  if (movie.poster_path) {
    score += 5;
  } else {
    score -= 10;
    addMatchReason(reasons, 'Poster data is unavailable.');
  }

  if (movie.overview) {
    score += 5;
  } else {
    score -= 8;
    addMatchReason(reasons, 'Overview data is unavailable.');
  }

  if (recommendationStyle === 'balanced') {
    addMatchReason(
      reasons,
      'Balanced mode considers rating, audience data and saved preferences.'
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
        addMatchReason(reasons, 'Has a large number of audience votes.');
      } else if (movie.vote_count >= 250) {
        score += 8;
        addMatchReason(reasons, 'Has enough audience data to support the recommendation.');
      }
    }

    if (hasSavedPreferenceMatch) {
      score += 12;
      addMatchReason(reasons, 'Similar to genres you have previously saved.');
    }
  }

  if (recommendationStyle === 'quality') {
    addMatchReason(reasons, 'Highly rated mode prioritises stronger audience scores.');

    if (typeof movie.vote_average === 'number') {
      if (movie.vote_average >= 8) {
        score += 32;
        addMatchReason(reasons, 'Excellent audience rating for this mode.');
      } else if (movie.vote_average >= 7) {
        score += 24;
        addMatchReason(reasons, 'Strong audience rating for this mode.');
      } else if (movie.vote_average >= 6.5) {
        score += 12;
        addMatchReason(reasons, 'Solid rating, but not one of the strongest results.');
      }
    }

    if (typeof movie.vote_count === 'number' && movie.vote_count >= 250) {
      score += 8;
      addMatchReason(reasons, 'Rating is supported by a useful number of votes.');
    }

    if (hasSavedPreferenceMatch) {
      score += 8;
      addMatchReason(reasons, 'Also overlaps with genres you have saved before.');
    }
  }

  if (recommendationStyle === 'popular') {
    addMatchReason(reasons, 'Popular mode prioritises films with broader audience data.');

    if (typeof movie.vote_count === 'number') {
      if (movie.vote_count >= 3000) {
        score += 32;
        addMatchReason(reasons, 'Very high audience vote count.');
      } else if (movie.vote_count >= 1000) {
        score += 24;
        addMatchReason(reasons, 'High audience vote count.');
      } else if (movie.vote_count >= 250) {
        score += 12;
        addMatchReason(reasons, 'Moderate audience vote count.');
      }
    }

    if (typeof movie.vote_average === 'number' && movie.vote_average >= 6.5) {
      score += 10;
      addMatchReason(reasons, 'Popularity is supported by a solid rating.');
    }

    if (hasSavedPreferenceMatch) {
      score += 8;
      addMatchReason(reasons, 'Also overlaps with genres you have saved before.');
    }
  }

  if (recommendationStyle === 'hidden-gems') {
    addMatchReason(
      reasons,
      'Hidden gems mode looks for solid ratings without only favouring obvious blockbusters.'
    );

    if (
      typeof movie.vote_average === 'number' &&
      typeof movie.vote_count === 'number'
    ) {
      if (movie.vote_average >= 7 && movie.vote_count >= 50 && movie.vote_count <= 900) {
        score += 32;
        addMatchReason(reasons, 'Strong rating with a more modest audience count.');
      } else if (movie.vote_average >= 6.5 && movie.vote_count < 1200) {
        score += 20;
        addMatchReason(reasons, 'Good rating with less mainstream audience data.');
      } else if (movie.vote_count >= 3000) {
        score -= 10;
        addMatchReason(reasons, 'More mainstream than a typical hidden-gem result.');
      }
    }

    if (hasSavedPreferenceMatch) {
      score += 10;
      addMatchReason(reasons, 'Still reflects genres you have previously saved.');
    }
  }

  if (recommendationStyle === 'saved-preferences') {
    addMatchReason(
      reasons,
      'Saved preferences mode prioritises patterns from your shortlist.'
    );

    if (hasSavedPreferenceMatch) {
      score += 34;
      addMatchReason(reasons, 'Strong overlap with genres you have previously saved.');
    } else if (savedGenreIds.length === 0) {
      score += 8;
      addMatchReason(
        reasons,
        'Save more films to make this mode more personalised over time.'
      );
    }

    if (typeof movie.vote_average === 'number' && movie.vote_average >= 6.5) {
      score += 12;
      addMatchReason(reasons, 'Also has a solid audience rating.');
    }

    if (typeof movie.vote_count === 'number' && movie.vote_count >= 250) {
      score += 8;
      addMatchReason(reasons, 'Has enough audience data to support the recommendation.');
    }
  }

  const normalisedScore = Math.max(0, Math.min(100, score));

  if (reasons.length === 0) {
    reasons.push('Recommended from your current filter selection.');
  }

  return {
    score: normalisedScore,
    reasons: reasons.slice(0, 5),
    recommendationStyle,
    recommendationStyleLabel,
    minimumRating,
    minimumRatingLabel,
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

    const filteredMovies = filterMoviesByMinimumRating(movies);

    if (filteredMovies.length === 0) {
        showEmptyState();
        return;
    }

    const recommendation = getRecommendedMovie(filteredMovies);

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