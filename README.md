# 🎬 Filmkatalógus Webalkalmazás

Ez a projekt egy egyszerű, mégis stílusos webalkalmazás, ahol a felhasználók filmeket böngészhetnek, értékeléseket írhatnak, és kritikákat olvashatnak másoktól.

## 💡 Funkciók

- 🔍 Filmek listázása borítóképpel és magyar címmel
- 🔎 Cím alapú keresés
- 🎞 Egyedi filmoldalak leírással, szereplőkkel, értékelésekkel
- 📝 Kritika és értékelés írása (csak bejelentkezve)
- 🔐 Felhasználói regisztráció és bejelentkezés
- 🛡 Admin felület a kritikák moderálására

## 🛠 Technológiák

- Node.js + Express
- EJS sablonmotor
- MySQL adatbázis
- bcrypt + express-session (hitelesítés)
- HTML5 + CSS3 (sötét, reszponzív dizájn)

## 🚀 Telepítés

1. Klónozd a repót:

```bash
git clone https://github.com/<felhasznalonev>/filmkatalogus.git
cd filmkatalogus
```

2. Telepítsd a csomagokat:

```bash
npm install
```

3. Állítsd be a `.env` fájlt:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=db_name
```

4. Indítsd el a szervert:

```bash
node app.js
```

Az alkalmazás elérhető: [http://localhost:3000](http://localhost:3000)

## 📦 Adatbázis szerkezet

A `filmkatalogus` adatbázis a következő táblákat tartalmazza:

### `users`

- `id` — automatikusan növekvő elsődleges kulcs
- `email` — egyedi email cím, kötelező
- `password` — hashelt jelszó, kötelező
- `name` — felhasználó neve (nem kötelező)
- `role` — felhasználói szerep, `'user'` vagy `'admin'`, alapértelmezett `'user'`

### `movies`

- `id` — automatikusan növekvő elsődleges kulcs
- `title_hu` — film magyar címe, kötelező
- `title_en` — film angol címe (nem kötelező)
- `description` — film leírása
- `year` — megjelenési év
- `duration` — film hossza percben
- `cover_image` — a borítókép relatív útvonala

### `actors`

- `id` — automatikusan növekvő elsődleges kulcs
- `name` — színész neve, kötelező

### `movie_cast`

- `id` — automatikusan növekvő elsődleges kulcs
- `movie_id` — a film azonosítója (idegen kulcs a `movies` táblából)
- `actor_id` — a színész azonosítója (idegen kulcs az `actors` táblából)
- `role_name` — a színész szerepének neve a filmben

### `reviews`

- `id` — automatikusan növekvő elsődleges kulcs
- `user_id` — a felhasználó azonosítója (idegen kulcs a `users` táblából)
- `movie_id` — a film azonosítója (idegen kulcs a `movies` táblából)
- `text` — a kritika szövege
- `created_at` — a kritika létrehozásának dátuma és ideje (alapértelmezett a beszúrás ideje)

### `ratings`

- `id` — automatikusan növekvő elsődleges kulcs
- `user_id` — a felhasználó azonosítója (idegen kulcs a `users` táblából)
- `movie_id` — a film azonosítója (idegen kulcs a `movies` táblából)
- `rating` — értékelés 1 és 10 között (ellenőrzés a `CHECK` megkötéssel)

---

Ez a séma lehetővé teszi a **felhasználók, filmek, színészek, kritikák és értékelések kezelését** egy tiszta, relációs adatbázisban.


## 🔒 Admin elérés

A `users` tábla `role` mezője alapján történik.  
Admin funkciók csak `role = 'admin'` esetén érhetők el.

