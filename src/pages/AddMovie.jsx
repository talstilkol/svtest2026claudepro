import { useState, useEffect, useRef } from 'react';
import { addMovie, generateDescription, suggestMovies } from '../api/moviesApi.js';

// 10 הז׳אנרים הפופולריים — להשלמה אוטומטית
const GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi'];

export default function AddMovie() {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState(null);
  const [poster, setPoster] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const skipNext = useRef(false);

  // סוכן ההשלמה: כשמקלידים כותרת — שולף הצעות סרטים אמיתיים מ-TMDb (עם debounce)
  useEffect(() => {
    if (skipNext.current) { skipNext.current = false; return; }
    if (title.trim().length < 2) { setSuggestions([]); return; }
    const t = setTimeout(() => {
      suggestMovies(title).then((res) => setSuggestions(res.data)).catch(() => setSuggestions([]));
    }, 350);
    return () => clearTimeout(t);
  }, [title]);

  const pickSuggestion = (s) => {
    skipNext.current = true;
    setTitle(s.title);
    setGenre(s.genre);
    setDescription(s.description);
    setYear(s.year);
    setPoster(s.poster);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.length < 1 || title.length > 50) {
      alert('Title must be between 1 and 50 characters');
      return;
    }
    if (genre.length < 1) {
      alert('Genre is required');
      return;
    }
    if (!year || year < 1888 || year > 2030) {
      alert('Year must be a valid year (1888–2030)');
      return;
    }
    if (description.length > 1000) {
      alert('Description must be up to 1000 characters');
      return;
    }
    await addMovie({ title, genre, description, year, poster });
    setTitle(''); setGenre(''); setDescription(''); setYear(null); setPoster('');
    alert('Movie added!');
  };

  const handleGenerate = async () => {
    if (!title || !genre) {
      alert('Enter title and genre first');
      return;
    }
    try {
      const res = await generateDescription(title, genre);
      setDescription(res.data.description);
    } catch {
      alert('AI generation failed (AI Gateway may need billing enabled).');
    }
  };

  const inputClass =
    'w-full bg-[#1f1f1f] border border-white/10 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-yellow-400';

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold mb-2">Add Movie</h1>

      <div className="relative">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title — start typing for suggestions" className={inputClass} />
        {suggestions.length > 0 && (
          <ul className="absolute z-20 left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden shadow-xl">
            {suggestions.map((s, i) => (
              <li key={i} onClick={() => pickSuggestion(s)} className="flex gap-3 items-center p-2 hover:bg-white/10 cursor-pointer">
                {s.poster
                  ? <img src={s.poster} alt="" className="w-9 h-12 object-cover rounded" />
                  : <div className="w-9 h-12 bg-white/10 rounded" />}
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{s.title} {s.year && <span className="text-gray-500">({s.year})</span>}</p>
                  <p className="text-xs text-gray-500 truncate">{s.genre}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Genre" list="genres" className={inputClass} />
      <datalist id="genres">
        {GENRES.map((gg) => <option key={gg} value={gg} />)}
      </datalist>

      <input
        type="number"
        value={year ?? ''}
        onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)}
        placeholder="Year"
        className={inputClass}
      />

      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3} className={inputClass} />

      {poster && (
        <img src={poster} alt="poster preview" className="w-24 rounded-lg border border-white/10" />
      )}

      {!poster && (
        <button type="button" onClick={handleGenerate} className="w-full border border-yellow-400/60 text-yellow-400 hover:bg-yellow-400 hover:text-black font-semibold py-2.5 rounded-lg transition">
          ✨ Generate description with AI
        </button>
      )}
      <button type="submit" className="w-full bg-yellow-400 text-black font-bold py-2.5 rounded-lg hover:bg-yellow-300 transition">
        Add Movie
      </button>
    </form>
  );
}
