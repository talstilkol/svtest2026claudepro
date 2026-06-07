// כרטיס סרט בסגנון IMDb. מציג פוסטר אמיתי אם קיים, אחרת גרדיאנט עם אות ראשונה.
import { Link } from 'react-router-dom';

const gradients = [
  'from-rose-500 to-orange-400',
  'from-indigo-500 to-purple-500',
  'from-emerald-500 to-teal-400',
  'from-sky-500 to-blue-600',
  'from-fuchsia-500 to-pink-500',
  'from-amber-500 to-yellow-400',
];

export default function MovieCard({ movie, onDelete }) {
  const g = gradients[(movie.title.charCodeAt(0) || 0) % gradients.length];
  const imdbUrl = `https://www.imdb.com/find/?q=${encodeURIComponent(movie.title)}`;

  return (
    <div className="bg-[#1f1f1f] rounded-xl overflow-hidden border border-white/5 hover:border-yellow-400/40 transition shadow-lg flex flex-col">
      <Link to={`/movie/${movie._id}`} className="relative h-56 block">
        {movie.poster ? (
          <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover" />
        ) : (
          <div className={`h-full bg-gradient-to-br ${g} flex items-center justify-center`}>
            <span className="text-6xl font-black text-white/90 drop-shadow">{movie.title.charAt(0)}</span>
          </div>
        )}
        <span className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded">
          ★ {movie.genre}
        </span>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/movie/${movie._id}`} className="font-bold text-base leading-tight line-clamp-1 hover:text-yellow-400">
          {movie.title}{' '}
          {movie.year && <span className="text-gray-500 font-normal">({movie.year})</span>}
        </Link>
        <p className="mt-1 text-sm text-gray-400 line-clamp-2 flex-1">{movie.description}</p>
        <a
          href={imdbUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 text-xs font-semibold text-yellow-400 hover:underline"
        >
          View on IMDb ↗
        </a>
        {onDelete && (
          <button
            onClick={() => onDelete(movie._id)}
            className="mt-3 w-full bg-white/5 hover:bg-red-600 text-gray-300 hover:text-white text-sm font-semibold py-1.5 rounded-md transition"
          >
            Delete Movie
          </button>
        )}
      </div>
    </div>
  );
}
