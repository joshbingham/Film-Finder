// Populate dropdown menu with all the available genres
const populateGenreDropdown = (genres) => {
    const select = document.getElementById('genres')

    for (const genre of genres) {
        let option = document.createElement("option");
        option.value = genre.id;
        option.text = genre.name;
        select.appendChild(option);
    }
};

// Returns the current genre selection from the dropdown menu
const getSelectedGenre = () => {
    const selectedGenre = document.getElementById('genres').value;
    return selectedGenre;
};

// Displays the like and dislike buttons on the page
const showBtns = () => {
    const btnDiv = document.getElementById('likeOrDislikeBtns');
    btnDiv.removeAttribute('hidden');
};

// Clear the current movie from the screen
const clearCurrentMovie = () => {
    const moviePosterDiv = document.getElementById('moviePoster');
    const movieTextDiv = document.getElementById('movieText');
    moviePosterDiv.innerHTML = '';
    movieTextDiv.innerHTML = '';
}

// After liking a movie, saves it to local storage, clears the current movie from the screen, and gets another random movie
const likeMovie = () => {
    const likedMovies = getLikedMovies();

    // Avoid duplicate likes
    if (!likedMovies.find(movie => movie.id === currentMovie.id)) {
        likedMovies.push(formatMovieForStorage(currentMovie));
        saveLikedMovies(likedMovies);
    }
    clearCurrentMovie();
    showRandomMovie();
};

// After disliking a movie, clears the current movie from the screen and gets another random movie
const dislikeMovie = () => {
    clearCurrentMovie();
    showRandomMovie();
};

// Create HTML for movie poster
const createMoviePoster = (posterPath) => {
    const moviePosterUrl = `https://image.tmdb.org/t/p/original/${posterPath}`;

    const posterImg = document.createElement('img');
    posterImg.setAttribute('src', moviePosterUrl);
    posterImg.setAttribute('id', 'moviePoster');
  
    return posterImg;
};

// Create HTML for movie title
const createMovieTitle = (title) => {
    const titleHeader = document.createElement('h1');
    titleHeader.setAttribute('id', 'movieTitle');
    titleHeader.innerHTML = title;
  
    return titleHeader;
};

// Create HTML for movie overview
const createMovieOverview = (overview) => {
    const overviewParagraph = document.createElement('p');
    overviewParagraph.setAttribute('id', 'movieOverview');
    overviewParagraph.innerHTML = overview;
  
    return overviewParagraph;
};

// Returns a random movie from the first page of movies
const getRandomMovie = (movies) => {
    const randomIndex = Math.floor(Math.random() * movies.length);
    const randomMovie = movies[randomIndex];
    return randomMovie;
};

// Uses the DOM to create HTML to display the movie
const displayMovie = (movieInfo) => {
    const moviePosterDiv = document.getElementById('moviePoster');
    const movieTextDiv = document.getElementById('movieText');
    const likeBtn = document.getElementById('likeBtn');
    const dislikeBtn = document.getElementById('dislikeBtn');
  
    // Create HTML content containing movie info
    const moviePoster = createMoviePoster(movieInfo.poster_path);
    const titleHeader = createMovieTitle(movieInfo.title);
    const overviewText = createMovieOverview(movieInfo.overview);
    const rating = createMovieRating(movieInfo.vote_average);
    const cast = createMovieCast(movieInfo.credits);
    

    // Create HTML for movie rating
    const createMovieRating = (rating) => {
        const ratingParagraph = document.createElement('p');
        ratingParagraph.setAttribute('id', 'movieRating');
        ratingParagraph.innerHTML = `⭐ Rating: ${rating.toFixed(1)} / 10`;
        return ratingParagraph;
    }

    // Create HTML for top cast
    const createMovieCast = (credits) => {
        const castParagraph = document.createElement('p');
        castParagraph.setAttribute('id', 'movieCast');

        // If no credits or cast information 
        if (!credits || !credits.cast) {
            castParagraph.textContent = "Cast information is not available";
            return castParagraph;
        }

        const topCast = credits.cast.slice(0, 5).map(actor => actor.name).join(', ');
        castParagraph.innerHTML = `🎭 Cast: ${topCast}`;
        return castParagraph;
    }
  
    // Append title, poster, overview, rating and top 5 cast
    moviePosterDiv.appendChild(moviePoster);
    movieTextDiv.appendChild(titleHeader);
    movieTextDiv.appendChild(overviewText);
    movieTextDiv.appendChild(rating);
    movieTextDiv.appendChild(cast);
  
    showBtns();
    likeBtn.onclick = likeMovie;
    dislikeBtn.onclick = dislikeMovie;
};

const getLikedMovies = () => {
    const liked = localStorage.getItem('likedMovies');
    return liked ? JSON.parse(liked) : [];
};

const saveLikedMovies = (movies) => {
    localStorage.setItem('likedMovies', JSON.stringify(movies));
};

const formatMovieForStorage = (movie) => ({
  id: movie.id,
  title: movie.title,
  poster_path: movie.poster_path,
  overview: movie.overview,
  release_date: movie.release_date,
  vote_average: movie.vote_average
});