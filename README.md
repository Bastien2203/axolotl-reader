<div style="display: flex; flex-direction: column; align-items: center; justify-content:center; border-bottom: 1px solid #ccc; padding-bottom: 1em; margin-bottom: 2em; width: 100%;">
    <img src="./.github/images/icon.png" alt="Logo" width="200"/> 
    <h1 style="border: none;">Axolotl Reader</h1>
</div>


## Getting started

Create directories that will be used to store the database and the books:

```sh
mkdir -p data/books
mkdir data/covers
touch data/comics.db
```


Create a `.env` file in the root of the project with the following content:

```sh
# JWT secret used to sign the JWT token (change it to something else)
JWT_TOKEN=your_jwt_secret

# The host of your APP
API_HOST=https://axolotl.bastiengrisvard.com

# Directory in the container where books, covers and database will be stored
BOOK_DIRECTORY=data 
COVER_DIRECTORY=covers
DATABASE_PATH=comics.db

# Environment variables
ENV=production
GIN_MODE=release
```


Run the lastest version of the docker image:

```sh
docker run -d \
  --env-file .env \
  -p 8888:8080 \
  -v $(pwd)/data/comics.db:/app/comics.db \
  -v $(pwd)/data/books:/app/data \
  -v $(pwd)/data/covers:/app/covers \
  --restart always \
  --name axolotl-reader \
  ghcr.io/bastien2203/axolotl-reader:latest
```


## Development

// TODO : Add a real dev environment



```sh
mkdir -p api/data
mkdir api/covers
touch api/comics.db
```

### Backend (Go + Gin + Gorm + Sqlite)

- Go 1.23.0
- Sqlite 3

```sh
cd api
go mod tidy
go run main.go
```

### Frontend (React + TS + Vite)

- Node >=22.15.0

```sh
cd app
npm install
npm run dev
```


---

## TODO

### Backend
- [ ] Remove facets route when frontend finished removing the usage
- [ ] Add reading progress in the API (should be also available offline in the app)
- [ ] Actually series cover is the first book cover, we should add a dedicated field for it
- [ ] Add Bulk import for series
- [ ] Actually its possible to add a book that is not part of a series, does we want to keep this ? (it needs to be fixed in the frontend too)


### Frontend
- [ ] Add delete modal for series
- [ ] In ImportBook instead of using facets routes, get all tags/seriesNames/authors from the REST Api routes
- [ ] Add downloads possibility 
- [ ] Fix the PWA (dont works offline for now)


### Ops
- [ ] Remove JWT_TOKEN env var from Dockerfile and get it from docker run 
- [ ] Build time for arm64 is too long 
- [ ] Add tags for release 