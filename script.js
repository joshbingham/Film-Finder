const tmdbBaseUrl = 'https://api.themoviedb.org/3';
const playBtn = document.getElementById('playBtn');

const getGenres = async () => {
    const urlToFetch = `/api/genres`;
    try {
        const response = await fetch(urlToFetch);
        if (response.ok) {
            const jsonResponse = await response.json();
            const genres = jsonResponse.genres;
            return genres;
        } else {
            console.error('Error fetching genres:', response.status);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
};


const getMovies = async () => {
  const selectedGenre = getSelectedGenre();
  const urlToFetch = `/api/tmdb?genre=${selectedGenre}`;

  try {
    const response = await fetch(urlToFetch);
    if (response.ok) {
      const jsonResponse = await response.json();
      const movies = jsonResponse.results;
      return movies;
    } else {
      console.error('Error fetching movies:', response.status);
    }
} catch (error) {
    console.error('Network error:', error);
  }
};

const getMovieInfo = async (movie) => {
    const movieId = movie.id;
    const urlToFetch = `/api/movie?id=${movieId}`;

    try {
        const response = await fetch(urlToFetch);
        if (response.ok) {
            const movieInfo = await response.json();
            return movieInfo;
        } else {
            console.error('Error fetching movie info:', response.status);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
};

// Gets a list of movies and ultimately displays the info of a random movie from the list
const showRandomMovie = async () => {
  const movieInfo = document.getElementById('movieInfo');
  if (movieInfo.childNodes.length > 0) {
    clearCurrentMovie();
  };
const movies = await getMovies();
const randomMovie = getRandomMovie(movies);
const info = await getMovieInfo(randomMovie);
displayMovie(info);
};

getGenres().then(populateGenreDropdown);
playBtn.onclick = showRandomMovie;