export default async function handler(req, res) {
  const movieId = req.query.id; // ?id=XXX
  const tmdbKey = process.env.TMDB_KEY;

  if (!tmdbKey) return res.status(500).json({ error: 'TMDB key not set' });
  if (!movieId) return res.status(400).json({ error: 'Movie ID not provided' });

  // Include credits to get cast
  const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbKey}&append_to_response=credits`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}