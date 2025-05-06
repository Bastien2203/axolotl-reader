<div style="display: flex; flex-direction: column; align-items: center; justify-content:center; border-bottom: 1px solid #ccc; padding-bottom: 1em; margin-bottom: 2em; width: 100%;">
    <img src="./icon.png" alt="Logo" width="200"/> 
    <h1 style="border: none;">Axolotl Reader</h1>
</div>

## Run the app (Docker)

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