# Smart Search Algorithm

## Overview

This project implements a smart search algorithm to extract entities from search terms and return them as structured data.

## Setup

### Prerequisites

- Docker
- Node.js (express)
- PostgreSQL

### Installation

Docker:
1. Clone the repository.
2. Run `docker-compose up` to start the containers. Docker-compose has been setup to migrate and seed data.

Development:
1. npm -i
2. docker-compose run db (Update config.js.  "host": "localhost")
3. npm run migrate
4. npm run seed
5. node index.js

### Testing

curl --request POST \
  --url http://localhost:3000/search \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/8.6.1' \
  --data '{
	"searchTerm":"McDonald'\''s"
}'


curl --request POST \
  --url http://localhost:3000/search \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/8.6.1' \
  --data '{
	"searchTerm":"McDonald'\''s in London"
}'

curl --request POST \
  --url http://localhost:3000/search \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/8.6.1' \
  --data '{
	"searchTerm":"vegan sushi in London"
}'

curl --request POST \
  --url http://localhost:3000/search \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/8.6.1' \
  --data '{
	"searchTerm":"Veg sushi"
}'

curl --request POST \
  --url http://localhost:3000/search \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/8.6.1' \
  --data '{
	"searchTerm":"McDonald'\''s in London or Manchester"
}'

curl --request POST \
  --url http://localhost:3000/search \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/8.6.1' \
  --data '{
	"searchTerm":"pizza in Middlesbrough and Cambridge"
}'
