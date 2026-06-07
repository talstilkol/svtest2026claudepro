import { Routes, Route, NavLink } from 'react-router-dom';
import AllMovies from './pages/AllMovies.jsx';
import AddMovie from './pages/AddMovie.jsx';
import SearchMovies from './pages/SearchMovies.jsx';

const linkClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-md text-sm font-semibold transition ${
    isActive ? 'bg-yellow-400 text-black' : 'text-gray-200 hover:bg-white/10'
  }`;

export default function App() {
  return (
    <div className="min-h-screen bg-[#121212] text-gray-100">
      <nav className="sticky top-0 z-10 flex items-center gap-3 bg-[#1a1a1a] border-b border-white/10 px-5 py-3">
        <span className="bg-yellow-400 text-black font-black px-2 py-0.5 rounded text-lg tracking-tight">
          MovieDB
        </span>
        <div className="flex gap-1 ms-2">
          <NavLink to="/all-movies" className={linkClass}>Movies</NavLink>
          <NavLink to="/add-movie" className={linkClass}>Add</NavLink>
          <NavLink to="/search-movies" className={linkClass}>Search</NavLink>
        </div>
      </nav>
      <Routes>
        <Route path="/all-movies" element={<AllMovies />} />
        <Route path="/add-movie" element={<AddMovie />} />
        <Route path="/search-movies" element={<SearchMovies />} />
        <Route path="*" element={<AllMovies />} />
      </Routes>
    </div>
  );
}
