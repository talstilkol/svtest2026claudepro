import axios from 'axios';

// ריק = אותו origin (הבק רץ כ-serverless תחת /api באותו דומיין Vercel)
const API = import.meta.env.VITE_API_URL || '';

export const getMovies = () => axios.get(`${API}/api/movies`);
export const addMovie = (movie) => axios.post(`${API}/api/movies`, movie);
export const deleteMovie = (id) => axios.delete(`${API}/api/movies/${id}`);
export const searchMovies = (name) => axios.get(`${API}/api/movies/search?name=${encodeURIComponent(name)}`);
export const generateDescription = (title, genre) =>
  axios.post(`${API}/api/movies/generate`, { title, genre });
export const suggestMovies = (query) =>
  axios.get(`${API}/api/movies/suggest?query=${encodeURIComponent(query)}`);
