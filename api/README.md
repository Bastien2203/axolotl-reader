
```sh
curl -X POST http://localhost:8080/opds/books \
  -F "title=Les Légendaires #1" \
  -F "author=Some Author" \
  -F "identifier=id:leslegendaires-1" \
  -F "cover=@LesLegendairesTome1-001.jpg" \
  -F "book=@LesLegendairesTome1.cbz"
```