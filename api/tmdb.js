const getIsoDate = (date) => {
  return date.toISOString().split('T')[0];
};

const getDateDaysAgo = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return getIsoDate(date);
};

const getReleasePeriodRange = (releasePeriod) => {
  const today = getIsoDate(new Date());

  const ranges = {
    any: {
      gte: null,
      lte: null,
    },
    'recent-90': {
      gte: getDateDaysAgo(90),
      lte: today,
    },
    'last-year': {
      gte: getDateDaysAgo(365),
      lte: today,
    },
    '2020s': {
      gte: '2020-01-01',
      lte: today,
    },
    '2010s': {
      gte: '2010-01-01',
      lte: '2019-12-31',
    },
    '2000s': {
      gte: '2000-01-01',
      lte: '2009-12-31',
    },
    '1990s': {
      gte: '1990-01-01',
      lte: '1999-12-31',
    },
    '1980s': {
      gte: '1980-01-01',
      lte: '1989-12-31',
    },
    classic: {
      gte: '1900-01-01',
      lte: '1979-12-31',
    },
  };

  return ranges[releasePeriod] || ranges.any;
};

export default async function handler(req, res) {
  const tmdbKey = process.env.TMDB_KEY;

  if (!tmdbKey) {
    return res.status(500).json({ error: 'TMDB key not set' });
  }

  const { genre, releasePeriod = 'any' } = req.query;

  const releaseRange = getReleasePeriodRange(releasePeriod);

  const queryParams = new URLSearchParams({
    api_key: tmdbKey,
    language: 'en-GB',
    include_adult: 'false',
    sort_by: 'popularity.desc',
  });

  if (genre) {
    queryParams.set('with_genres', genre);
  }

  if (releaseRange.gte) {
    queryParams.set('primary_release_date.gte', releaseRange.gte);
  }

  if (releaseRange.lte) {
    queryParams.set('primary_release_date.lte', releaseRange.lte);
  }

  const urlToFetch = `https://api.themoviedb.org/3/discover/movie?${queryParams.toString()}`;

  try {
    const response = await fetch(urlToFetch);

    if (!response.ok) {
      throw new Error(`TMDB request failed: ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error('Unable to fetch TMDB movies:', error);

    return res.status(500).json({
      error: 'Unable to fetch movies',
    });
  }
}