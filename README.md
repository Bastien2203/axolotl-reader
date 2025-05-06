# axolotl-reader


```
docker build -t comics-app .
docker run -d \
  -p 8080:8080 \
  -v $(pwd)/data/comics.db:/app/comics.db \
  -v $(pwd)/data/books:/app/data \
  -v $(pwd)/data/covers:/app/covers \
  --name comics-container \
  comics-app
```