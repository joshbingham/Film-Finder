export default async function handler(req, res) {
  const tmdbKey = process.env.TMDB_KEY;
  if (!tmdbKey) return res.status(500).json({ error: 'TMDB key not set' });

  const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${tmdbKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data); // send genres to frontend
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}