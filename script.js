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

    const randomMovie = getRandomMovie(movies);

    if (!randomMovie) {
      showEmptyState();
      return;
    }

    const [info] = await Promise.all([
      getMovieInfo(randomMovie),
      wait(minimumLoadingTime),
    ]);

    if (!info || info.success === false) {
      throw new Error('Movie details could not be loaded');
    }

    currentMovie = info;
    clearCurrentMovie();
    displayMovie(info);
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