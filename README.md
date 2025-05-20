<div style="display: flex; flex-direction: column; align-items: center; justify-content:center; border-bottom: 1px solid #ccc; padding-bottom: 1em; margin-bottom: 2em; width: 100%;">
    <img src="./icon.png" alt="Logo" width="200"/> 
    <h1 style="border: none;">Axolotl Reader</h1>
</div>


## Run development

```sh
mkdir -p api/data
mkdir api/covers
touch api/comics.db
```

### Backend
```sh
cd api
go mod tidy
go run main.go
```

### Frontend
```sh
cd app
npm install
npm run dev
```




## Run Production (Docker)

```sh
mkdir -p data/books
mkdir data/covers
touch data/comics.db
```

```sh
docker build -t comics-app .
docker run -d \
  -p 8080:8080 \
  -v $(pwd)/data/comics.db:/app/comics.db \
  -v $(pwd)/data/books:/app/data \
  -v $(pwd)/data/covers:/app/covers \
  --name comics-container \
  comics-app
```

---

## TODO

- [ ] Add delete modal for series
- [ ] Pagnination for series (and favorites)
- [ ] Remove facets route (replace by real opds version)
- [ ] Repare downloads
- [ ] In upload route, add logic to set series cover to the first book cover