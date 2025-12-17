export default async function handler(req, res) {
  const genre = req.query.genre || '';
  const tmdbKey = process.env.TMDB_KEY;

  if (!tmdbKey) {
    return res.status(500).json({ error: 'TMDB key not set' });
  }

  let url = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbKey}&with_genres=${genre}`;

  if (days) {
    const today = new Date();
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - Number(days));

    const formatDate = (date) => date.toISOString().split('T')[0];

    url += `&primary_release_date.gte=${formatDate(fromDate)}&primary_release_date.lte=${formatDate(today)}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}