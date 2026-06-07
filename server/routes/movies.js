import express from 'express';
import Movie from '../models/Movie.js';

const router = express.Router();

// עוטף handler אסינכרוני — מעביר שגיאות ל-error middleware (Express 4 לא עושה זאת לבד)
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
// בריחת תווים מיוחדים ל-regex (מונע שבירת חיפוש על קלט כמו "[" )
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// מיפוי ז׳אנרים מ-TMDb (cache רק אם הצליח)
let genreMap = null;
async function getGenreMap() {
  if (genreMap) return genreMap;
  const r = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}`);
  const d = await r.json();
  const m = Object.fromEntries((d.genres || []).map((g) => [g.id, g.name]));
  if (Object.keys(m).length) genreMap = m;
  return m;
}

// GET /suggest?query= — סוכן השלמה מ-TMDb
router.get('/suggest', ah(async (req, res) => {
  const query = req.query.query;
  if (!query) return res.json([]);
  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&api_key=${process.env.TMDB_API_KEY}`;
  const data = await (await fetch(url)).json();
  const map = await getGenreMap();
  res.json((data.results || []).slice(0, 6).map((m) => ({
    title: m.title,
    year: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
    genre: map[m.genre_ids?.[0]] || 'Unknown',
    description: m.overview || '',
    poster: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : '',
  })));
}));

// GET /search?name= — חיפוש לפי כותרת (regex מוגן)
router.get('/search', ah(async (req, res) => {
  const safe = escapeRegex(req.query.name || '');
  const movies = await Movie.find({ title: { $regex: safe, $options: 'i' } });
  res.json(movies);
}));

// GET /tmdb?title=&year= — העשרה מ-TMDb (טריילר, backdrop, דירוג, שחקנים, דומים)
router.get('/tmdb', ah(async (req, res) => {
  const { title, year } = req.query;
  const KEY = process.env.TMDB_API_KEY;
  const sd = await (await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title || '')}${year ? `&year=${year}` : ''}&api_key=${KEY}`)).json();
  const hit = sd.results?.[0];
  if (!hit) return res.json(null);
  const data = await (await fetch(`https://api.themoviedb.org/3/movie/${hit.id}?append_to_response=videos,credits,similar&api_key=${KEY}`)).json();
  const vids = data.videos?.results || [];
  const trailer = vids.find((v) => v.site === 'YouTube' && v.type === 'Trailer') || vids.find((v) => v.site === 'YouTube');
  res.json({
    backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : '',
    tagline: data.tagline || '',
    runtime: data.runtime || null,
    rating: data.vote_average || null,
    votes: data.vote_count || null,
    releaseDate: data.release_date || '',
    trailerKey: trailer?.key || '',
    cast: (data.credits?.cast || []).slice(0, 8).map((c) => ({
      name: c.name,
      character: c.character,
      photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : '',
    })),
    similar: (data.similar?.results || []).slice(0, 6).map((m) => ({
      title: m.title,
      year: m.release_date ? m.release_date.slice(0, 4) : '',
      poster: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : '',
    })),
  });
}));

// GET / — כל הסרטים
router.get('/', ah(async (_req, res) => {
  res.json(await Movie.find());
}));

// POST / — הוספת סרט (עם trim)
router.post('/', ah(async (req, res) => {
  const title = (req.body.title || '').trim();
  const genre = (req.body.genre || '').trim();
  const description = (req.body.description || '').trim();
  const { year, poster } = req.body;
  if (!title || !genre || !description) {
    return res.status(400).json({ error: 'title, genre and description are required' });
  }
  res.status(201).json(await Movie.create({ title, genre, description, year, poster }));
}));

// DELETE /:id — מחיקת סרט (404 אם לא נמצא)
router.delete('/:id', ah(async (req, res) => {
  const deleted = await Movie.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
}));

// POST /generate — תיאור ע"י AI דרך Vercel AI Gateway (שגיאות מפורשות)
router.post('/generate', ah(async (req, res) => {
  const { title, genre } = req.body;
  if (!title || !genre) {
    return res.status(400).json({ error: 'title and genre are required' });
  }
  if (!process.env.AI_GATEWAY_API_KEY) {
    return res.status(500).json({ error: 'AI key is not configured' });
  }
  const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'user', content: `Movie title: "${title}", genre: "${genre}". Return ONLY JSON in the format {"description": "a short movie description"}.` },
      ],
    }),
  });
  if (!response.ok) {
    return res.status(502).json({ error: 'AI request failed (check Vercel AI Gateway billing)' });
  }
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  const match = text.match(/\{[\s\S]*\}/);
  const description = JSON.parse(match ? match[0] : '{}').description;
  if (!description) return res.status(502).json({ error: 'AI returned no description' });
  res.json({ description });
}));

// GET /:id — סרט בודד (חייב אחרי כל ה-GET הליטרליים)
router.get('/:id', ah(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).json({ error: 'not found' });
  res.json(movie);
}));

export default router;
