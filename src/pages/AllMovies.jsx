import { useEffect, useState } from 'react';
import { getMovies, deleteMovie } from '../api/moviesApi.js';
import MovieCard from '../components/MovieCard.jsx';

export default function AllMovies() {
  const [movies, setMovies] = useState([]);
  const [sortBy, setSortBy] = useState('title');

  const load = () => getMovies().then((res) => setMovies(res.data));

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    await deleteMovie(id);
    load();
  };

  const sorted = [...movies].sort((a, b) => {
    if (sortBy === 'year') return (b.year || 0) - (a.year || 0);
    if (sortBy === 'genre') return a.genre.localeCompare(b.genre);
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">
          Top Movies <span className="text-gray-500 text-base">({movies.length})</span>
        </h1>
        <label className="text-sm text-gray-400 flex items-center gap-2">
          Sort by
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#1f1f1f] border border-white/10 rounded-md px-3 py-1.5 text-gray-100 focus:outline-none focus:border-yellow-400"
          >
            <option value="title">Title (A–Z)</option>
            <option value="year">Year (newest)</option>
            <option value="genre">Genre</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {sorted.map((m) => (
          <MovieCard key={m._id} movie={m} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
