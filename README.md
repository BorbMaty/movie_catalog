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

## 🖼 Példa adatbázis szerkezet

- users (id, name, email, password, role)
- movies (id, title_hu, title_en, year, duration, description, cover_image)
- reviews (id, user_id, movie_id, text, created_at)
- ratings (user_id, movie_id, rating)

## 🔒 Admin elérés

A `users` tábla `role` mezője alapján történik.  
Admin funkciók csak `role = 'admin'` esetén érhetők el.

