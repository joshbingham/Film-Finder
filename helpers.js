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
      setDropdownValue(dropdownId, option.dataset.value, option.textContent.trim());
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
};

const showGenreLoadError = () => {
  setDropdownOptions('genres', [
    {
      value: '',
      label: 'Genres unavailable',
    },
  ]);
};

const getSelectedGenre = () => {
  return document.getElementById('genres').value;
};

const getSelectedDateFilter = () => {
  return document.getElementById('dateFilter').value;
};

document.addEventListener('DOMContentLoaded', initialiseCustomDropdowns);