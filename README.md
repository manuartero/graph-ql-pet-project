## GraphQL pet project

```bash
npm i && npm run dev
```


```html
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ hello }"}'

HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
content-length: 26
Date: Fri, 01 Aug 2025 11:04:54 GMT
Connection: close

{
  "data": {
    "hello": "world"
  }
}

```
