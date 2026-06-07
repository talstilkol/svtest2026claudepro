# 🎬 Movie Watchlist — PRO

גרסת Pro מלאה (frontend + backend) על **Vercel בלבד**. הבק רץ כ-serverless functions תחת `/api`.

## ✨ פיצ'רים מעבר לבסיס
- עיצוב בסגנון IMDb (כהה + צהוב), גריד כרטיסים עם פוסטרים
- שדות `year` + `poster`
- 🤖 סוכן השלמה אוטומטית מ-**TMDb** (כותרת/שנה/ז׳אנר/תיאור/פוסטר)
- מיפוי ז׳אנרים דינמי מ-TMDb (`/genre/movie/list`)
- יצירת תיאור ע"י **AI** (Vercel AI Gateway)
- קישור ל-IMDb בכל כרטיס
- מיון לפי title / year / genre
- חיפוש חי + datalist ל-10 ז׳אנרים

## 🔗 ארכיטקטורה
```
Frontend (Vite/React)  →  /api/*  (Express serverless)  →  MongoDB Atlas
        הכל על אותו דומיין Vercel
```

## 📡 API (תחת /api)
`GET /api/movies` · `POST /api/movies` · `DELETE /api/movies/:id`
`GET /api/movies/search?name=` · `GET /api/movies/suggest?query=` · `POST /api/movies/generate`

## 🛠️ הרצה מקומית
```bash
npm install
vercel dev   # מריץ frontend + serverless יחד
```

### משתני סביבה (Vercel / .env)
```
MONGO_URI=<atlas>
TMDB_API_KEY=<tmdb>
AI_GATEWAY_API_KEY=<vercel ai gateway>
```

## 🤖 שימוש ב-AI
נעזרתי ב-AI לבניית האפליקציה (Express serverless, TMDb agent, רכיבי React, עיצוב). הבנתי והתאמתי את הקוד.

## 🧱 Stack
React (Vite) · Express (serverless) · Mongoose · MongoDB Atlas · Tailwind · TMDb · Vercel AI Gateway
