export default async function handler(req, res) {
  const genre = req.query.genre || '';
  const tmdbKey = process.env.TMDB_KEY;

  if (!tmdbKey) {
    return res.status(500).json({ error: 'TMDB key not set' });
  }

  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbKey}&with_genres=${genre}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}