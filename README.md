## GraphQL pet project

```bash
npm i && npm run dev
```


Example:

```html
# 3. Get a specific spell by ID
POST http://localhost:4000/graphql
Content-Type: application/json

{
  "query": "{ spell(id: \"fireball\") { id name level action range type damage { dice damageType } url } }"
}

HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
content-length: 229
Date: Fri, 01 Aug 2025 14:28:07 GMT
Connection: close

{
  "data": {
    "spell": {
      "id": "fireball",
      "name": "Fireball",
      "level": 3,
      "action": "Action",
      "range": "18 m /  60ft 4m / 13ft (Radius)",
      "type": "DEX save",
      "damage": [
        {
          "dice": "8d6",
          "damageType": "Fire"
        }
      ],
      "url": "https://bg3.wiki/wiki/Fireball"
    }
  }
}
```
