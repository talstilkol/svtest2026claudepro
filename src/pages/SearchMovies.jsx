import { useEffect, useState } from 'react';
import { searchMovies } from '../api/moviesApi.js';
import MovieCard from '../components/MovieCard.jsx';

export default function SearchMovies() {
  const [name, setName] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    searchMovies(name).then((res) => setResults(res.data));
  }, [name]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Search Movies</h1>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Search by title..."
        className="w-full bg-[#1f1f1f] border border-white/10 rounded-lg px-4 py-3 mb-6 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-yellow-400"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {results.map((m) => (
          <MovieCard key={m._id} movie={m} />
        ))}
      </div>
    </div>
  );
}
