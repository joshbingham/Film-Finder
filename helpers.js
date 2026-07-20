const closeAllDropdowns = () => {
  const dropdowns = document.querySelectorAll('.custom-select');

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('.custom-select-trigger');

    dropdown.classList.remove('is-open');

    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
};

const setDropdownDisabled = (dropdownId, isDisabled) => {
  const dropdown = document.querySelector(`[data-dropdown-id="${dropdownId}"]`);
  const trigger = dropdown?.querySelector('.custom-select-trigger');

  if (!dropdown || !trigger) {
    return;
  }

  dropdown.classList.toggle('is-disabled', isDisabled);
  trigger.disabled = isDisabled;
};

const setDropdownValue = (dropdownId, value, label) => {
  const dropdown = document.querySelector(`[data-dropdown-id="${dropdownId}"]`);
  const input = document.getElementById(dropdownId);
  const selectedText = document.getElementById(`${dropdownId}SelectedText`);

  if (!dropdown || !input || !selectedText) {
    return;
  }

  input.value = value;
  selectedText.textContent = label;

  const options = dropdown.querySelectorAll('.custom-select-option');

  options.forEach((option) => {
    const isSelected = option.dataset.value === value;

    option.classList.toggle('is-selected', isSelected);
    option.setAttribute('aria-selected', String(isSelected));
  });
};

const setDropdownOptions = (dropdownId, options) => {
  const dropdown = document.querySelector(`[data-dropdown-id="${dropdownId}"]`);
  const menu = dropdown?.querySelector('.custom-select-menu');

  if (!dropdown || !menu) {
    return;
  }

  menu.innerHTML = '';

  options.forEach((option) => {
    const optionButton = document.createElement('button');

    optionButton.className = 'custom-select-option';
    optionButton.type = 'button';
    optionButton.setAttribute('role', 'option');
    optionButton.setAttribute('aria-selected', 'false');
    optionButton.dataset.value = option.value;
    optionButton.textContent = option.label;

    menu.appendChild(optionButton);
  });

  const firstOption = options[0];

  if (firstOption) {
    setDropdownValue(dropdownId, firstOption.value, firstOption.label);
  }
};

const initialiseCustomDropdowns = () => {
  const dropdowns = document.querySelectorAll('.custom-select');

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('.custom-select-trigger');
    const menu = dropdown.querySelector('.custom-select-menu');

    if (!trigger || !menu) {
      return;
    }

    trigger.addEventListener('click', () => {
        if (dropdown.classList.contains('is-disabled')) {
            return;
        }

        const isOpen = dropdown.classList.contains('is-open');

        closeAllDropdowns();

        if (!isOpen) {
            dropdown.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
        }
        });

    menu.addEventListener('click', (event) => {
      const option = event.target.closest('.custom-select-option');

      if (!option) {
        return;
      }

      const dropdownId = dropdown.dataset.dropdownId;

      setDropdownValue(
        dropdownId,
        option.dataset.value,
        option.textContent.trim()
      );

      closeAllDropdowns();
    });

    dropdown.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeAllDropdowns();
        trigger.focus();
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.custom-select')) {
      closeAllDropdowns();
    }
  });
};

const populateGenreDropdown = (genres) => {
  const genreOptions = [
    {
      value: '',
      label: 'Any genre',
    },
  ];

  if (Array.isArray(genres)) {
    genres.forEach((genre) => {
      genreOptions.push({
        value: String(genre.id),
        label: genre.name,
      });
    });
  }

  setDropdownOptions('genres', genreOptions);
  setDropdownDisabled('genres', false);
};

const showGenreLoadError = () => {
  setDropdownOptions('genres', [
    {
      value: '',
      label: 'Genres unavailable',
    },
  ]);

  setDropdownDisabled('genres', true);
};

const getSelectedGenre = () => {
  return document.getElementById('genres').value;
};

const getSelectedDateFilter = () => {
  return document.getElementById('dateFilter').value;
};

const hideDecisionButtons = () => {
  const btnDiv = document.getElementById('likeOrDislikeBtns');
  btnDiv.setAttribute('hidden', '');
};

const showBtns = () => {
  const btnDiv = document.getElementById('likeOrDislikeBtns');
  btnDiv.removeAttribute('hidden');
};

const setMovieMessage = (message, className = 'status-message') => {
  const moviePosterDiv = document.getElementById('moviePoster');
  const movieTextDiv = document.getElementById('movieText');

  moviePosterDiv.innerHTML = '';
  movieTextDiv.innerHTML = '';

  const messageParagraph = document.createElement('p');
  messageParagraph.className = className;
  messageParagraph.textContent = message;

  movieTextDiv.appendChild(messageParagraph);
  hideDecisionButtons();
};

const showLoadingState = () => {
  const moviePosterDiv = document.getElementById('moviePoster');
  const movieTextDiv = document.getElementById('movieText');

  moviePosterDiv.innerHTML = '';
  movieTextDiv.innerHTML = '';

  const posterSkeleton = document.createElement('div');
  posterSkeleton.className = 'poster-skeleton';
  posterSkeleton.setAttribute('aria-hidden', 'true');

  const loadingContent = document.createElement('div');
  loadingContent.className = 'loading-content';
  loadingContent.setAttribute('role', 'status');
  loadingContent.setAttribute('aria-live', 'polite');

  const loadingEyebrow = document.createElement('p');
  loadingEyebrow.className = 'loading-eyebrow';
  loadingEyebrow.textContent = 'Finding a recommendation';

  const loadingTitle = document.createElement('div');
  loadingTitle.className = 'skeleton-line skeleton-title';

  const loadingMeta = document.createElement('div');
  loadingMeta.className = 'skeleton-line skeleton-meta';

  const loadingMetaTwo = document.createElement('div');
  loadingMetaTwo.className = 'skeleton-line skeleton-meta short';

  const loadingBody = document.createElement('div');
  loadingBody.className = 'skeleton-stack';

  for (let index = 0; index < 4; index += 1) {
    const line = document.createElement('div');
    line.className = 'skeleton-line';
    loadingBody.appendChild(line);
  }

  loadingContent.appendChild(loadingEyebrow);
  loadingContent.appendChild(loadingTitle);
  loadingContent.appendChild(loadingMeta);
  loadingContent.appendChild(loadingMetaTwo);
  loadingContent.appendChild(loadingBody);

  moviePosterDiv.appendChild(posterSkeleton);
  movieTextDiv.appendChild(loadingContent);

  hideDecisionButtons();
};

const showEmptyState = () => {
  setMovieMessage(
    'No films found for those filters. Try a wider release window or choose another genre.',
    'status-message'
  );
};

const showErrorState = () => {
  setMovieMessage(
    'Something went wrong while loading a recommendation. Please try again.',
    'error-message'
  );
};

const clearCurrentMovie = () => {
  const moviePosterDiv = document.getElementById('moviePoster');
  const movieTextDiv = document.getElementById('movieText');

  moviePosterDiv.innerHTML = '';
  movieTextDiv.innerHTML = '';
};

const likeMovie = () => {
  if (!currentMovie) {
    return;
  }

  const likedMovies = getLikedMovies();

  if (!likedMovies.find((movie) => movie.id === currentMovie.id)) {
    likedMovies.push(formatMovieForStorage(currentMovie));
    saveLikedMovies(likedMovies);
  }

  showRandomMovie();
};

const dislikeMovie = () => {
  showRandomMovie();
};

const createMoviePoster = (posterPath, title) => {
  if (!posterPath) {
    const placeholder = document.createElement('p');
    placeholder.className = 'poster-placeholder';
    placeholder.textContent = 'No poster available';
    return placeholder;
  }

  const moviePosterUrl = `https://image.tmdb.org/t/p/w780/${posterPath}`;

  const posterImg = document.createElement('img');
  posterImg.setAttribute('src', moviePosterUrl);
  posterImg.setAttribute('alt', `${title} poster`);

  return posterImg;
};

const createMovieTitle = (title) => {
  const titleHeader = document.createElement('h2');
  titleHeader.setAttribute('id', 'movieTitle');
  titleHeader.textContent = title || 'Untitled film';

  return titleHeader;
};

const createMovieOverview = (overview) => {
  const overviewParagraph = document.createElement('p');
  overviewParagraph.setAttribute('id', 'movieOverview');
  overviewParagraph.textContent = overview || 'No overview available.';

  return overviewParagraph;
};

const getRandomMovie = (movies) => {
  if (!Array.isArray(movies) || movies.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * movies.length);
  return movies[randomIndex];
};

const createMovieRating = (rating) => {
  const ratingParagraph = document.createElement('p');
  ratingParagraph.setAttribute('id', 'movieRating');

  const formattedRating =
    typeof rating === 'number' ? rating.toFixed(1) : 'Not rated';

  ratingParagraph.textContent = `Rating: ${formattedRating} / 10`;

  return ratingParagraph;
};

const createMovieCast = (credits) => {
  const castParagraph = document.createElement('p');
  castParagraph.setAttribute('id', 'movieCast');

  if (!credits || !credits.cast || credits.cast.length === 0) {
    castParagraph.textContent = 'Cast information is not available.';
    return castParagraph;
  }

  const topCast = credits.cast
    .slice(0, 5)
    .map((actor) => actor.name)
    .join(', ');

  castParagraph.textContent = `Cast: ${topCast}`;

  return castParagraph;
};

const createMatchPanel = (match) => {
  if (!match) {
    return null;
  }

  const panel = document.createElement('div');
  panel.className = 'match-panel';

  const header = document.createElement('div');
  header.className = 'match-panel-header';

  const heading = document.createElement('h3');
  heading.textContent = 'Why this recommendation?';

  const score = document.createElement('span');
  score.className = 'match-score';
  score.textContent = `${match.score}% match`;

  header.appendChild(heading);
  header.appendChild(score);

  const list = document.createElement('ul');
  list.className = 'match-reasons';

  match.reasons.forEach((reason) => {
    const item = document.createElement('li');
    item.textContent = reason;
    list.appendChild(item);
  });

  panel.appendChild(header);
  panel.appendChild(list);

  return panel;
};

const displayMovie = (movieInfo) => {
  const moviePosterDiv = document.getElementById('moviePoster');
  const movieTextDiv = document.getElementById('movieText');
  const likeBtn = document.getElementById('likeBtn');
  const dislikeBtn = document.getElementById('dislikeBtn');

  const moviePoster = createMoviePoster(movieInfo.poster_path, movieInfo.title);
  const titleHeader = createMovieTitle(movieInfo.title);
  const rating = createMovieRating(movieInfo.vote_average);
  const cast = createMovieCast(movieInfo.credits);
  const matchPanel = createMatchPanel(movieInfo.match);
  const overviewText = createMovieOverview(movieInfo.overview);

  moviePosterDiv.appendChild(moviePoster);
  movieTextDiv.appendChild(titleHeader);
  movieTextDiv.appendChild(rating);
  movieTextDiv.appendChild(cast);

  if (matchPanel) {
    movieTextDiv.appendChild(matchPanel);
  }

  movieTextDiv.appendChild(overviewText);

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
  vote_average: movie.vote_average,
  genre_ids: Array.isArray(movie.genre_ids) ? movie.genre_ids : [],
  match_score: movie.match?.score ?? null,
  match_reasons: movie.match?.reasons ?? [],
  saved_at: new Date().toISOString(),
});

document.addEventListener('DOMContentLoaded', initialiseCustomDropdowns);