# Bmovie

### Stack
* Frontend: HTML, CSS, Vanilla JS, Nice UI (CDN)
* Backend: Node.js, Express
* Database: PostgreSQL
* Authentication: In-memory session, HTTP-only cookies, PBKDF2 hash

### Features
* Movie listing and details
* Movie rating (1 to 5 stars)
* User registration
* Session login/logout

### Database PostgreSQL
* Tables: `users`, `movie`, `score`

### Setup and Execution
1. Create `progIV` database in local PostgreSQL
2. Run `backend/schemaSQL.sql` script to create tables
3. Access `backend` directory
4. `npm install express pg cookie-parser`
5. `node main.js`
6. Access application at `http://localhost:8070/front`

### API Endpoints
* `GET /movies` - List movies
* `POST /movies` - Create movie
* `GET /movies/:id` - Get movie by ID
* `PUT /movies/:id` - Update movie
* `DELETE /movies/:id` - Delete movie
* `GET /users` - List users
* `POST /users` - Register user
* `POST /scores` - Rate movie (requires auth)
* `POST /login` - Authenticate user and generate cookie
* `POST /logout` - Remove server session
