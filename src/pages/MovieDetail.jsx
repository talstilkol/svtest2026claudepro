import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovie, getTmdbDetails } from '../api/moviesApi.js';

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [tmdb, setTmdb] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await getMovie(id);
        if (!alive) return;
        setMovie(data);
        const t = await getTmdbDetails(data.title, data.year);
        if (alive) setTmdb(t.data);
      } catch {
        /* ignore */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) return <p className="p-6 text-gray-400">Loading…</p>;
  if (!movie) return <p className="p-6 text-gray-400">Movie not found.</p>;

  const imdbUrl = `https://www.imdb.com/find/?q=${encodeURIComponent(movie.title)}`;

  return (
    <div className="text-gray-100">
      {/* Hero / backdrop */}
      <div className="relative">
        {tmdb?.backdrop && (
          <img src={tmdb.backdrop} alt="" className="w-full h-72 object-cover opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent" />
        <Link to="/all-movies" className="absolute top-4 left-4 bg-black/60 px-3 py-1.5 rounded-md text-sm hover:bg-black/80">← Back</Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-28 relative">
        <div className="flex flex-col sm:flex-row gap-6">
          {movie.poster && (
            <img src={movie.poster} alt={movie.title} className="w-44 rounded-xl shadow-2xl border border-white/10" />
          )}
          <div className="flex-1 pt-4">
            <h1 className="text-3xl font-black">
              {movie.title}{' '}
              {movie.year && <span className="text-gray-400 font-normal">({movie.year})</span>}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2 text-sm">
              <span className="bg-yellow-400 text-black font-bold px-2 py-0.5 rounded">{movie.genre}</span>
              {tmdb?.rating ? <span className="bg-white/10 px-2 py-0.5 rounded">⭐ {tmdb.rating.toFixed(1)} ({tmdb.votes})</span> : null}
              {tmdb?.runtime ? <span className="bg-white/10 px-2 py-0.5 rounded">⏱️ {tmdb.runtime} min</span> : null}
              {tmdb?.releaseDate ? <span className="bg-white/10 px-2 py-0.5 rounded">{tmdb.releaseDate}</span> : null}
            </div>
            {tmdb?.tagline && <p className="mt-3 italic text-gray-400">“{tmdb.tagline}”</p>}
            <p className="mt-3 text-gray-200">{movie.description}</p>
            <a href={imdbUrl} target="_blank" rel="noreferrer" className="inline-block mt-3 text-yellow-400 font-semibold hover:underline">View on IMDb ↗</a>
          </div>
        </div>

        {/* Trailer */}
        {tmdb?.trailerKey && (
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-3">🎬 Trailer</h2>
            <div className="aspect-video rounded-xl overflow-hidden border border-white/10">
              <iframe
                title="trailer"
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${tmdb.trailerKey}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Cast */}
        {tmdb?.cast?.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-3">🎭 Cast</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {tmdb.cast.map((c, i) => (
                <div key={i} className="text-center">
                  {c.photo
                    ? <img src={c.photo} alt={c.name} className="w-full aspect-[2/3] object-cover rounded-lg" />
                    : <div className="w-full aspect-[2/3] bg-white/10 rounded-lg" />}
                  <p className="text-xs font-semibold mt-1 line-clamp-1">{c.name}</p>
                  <p className="text-[11px] text-gray-500 line-clamp-1">{c.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar */}
        {tmdb?.similar?.length > 0 && (
          <section className="mt-10 mb-12">
            <h2 className="text-xl font-bold mb-3">🍿 Similar Movies</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {tmdb.similar.map((m, i) => (
                <div key={i} className="bg-[#1f1f1f] rounded-lg overflow-hidden border border-white/5">
                  {m.poster
                    ? <img src={m.poster} alt={m.title} className="w-full aspect-[2/3] object-cover" />
                    : <div className="w-full aspect-[2/3] bg-white/10" />}
                  <p className="text-xs font-semibold p-2 line-clamp-1">{m.title} {m.year && <span className="text-gray-500">({m.year})</span>}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
