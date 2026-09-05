# Redis Live Leaderboard

A simple **live leaderboard API** built with **Node.js, Express, and Redis Sorted Sets**.

The project demonstrates how Redis can efficiently handle player scores, leaderboard rankings, and counters.

## Tech Stack

* Node.js
* Express
* Redis
* Docker
* JavaScript (ES Modules)

## Redis Concepts

This project demonstrates:

| Redis Command | Purpose                 |
| ------------- | ----------------------- |
| `INCR`        | Increment view counters |
| `ZINCRBY`     | Increment player scores |
| `ZREVRANGE`   | Get leaderboard         |
| `ZREVRANK`    | Get player's rank       |

## API Endpoints

### Increment Player Score

```http
POST /leaderboard/increment
```

```json
{
  "playerId": "player1",
  "points": 10
}
```

### Get Top 10 Players

```http
GET /leaderboard/top
```

### Get Complete Leaderboard

```http
GET /leaderboard
```

### Get Player Rank

```http
GET /leaderboard/player1/rank
```

Example response:

```json
{
  "playerId": "player1",
  "rank": 4,
  "score": 100
}
```

### Increment Post Views

```http
POST /post123/view
```

Uses Redis `INCR` to maintain the view counter.

## Running the Project

### 1. Install dependencies

```bash
npm install
```

### 2. Start Redis

```bash
docker run -d --name redis-leaderboard -p 6380:6379 redis:8
```

### 3. Configure `.env`

```env
PORT=3000
REDIS_URL=redis://localhost:6380
```

### 4. Start the server

```bash
npm run dev
```

The API runs at:

```text
http://localhost:3000
```

## Testing

### Game Simulator

The simulator generates score updates for **1,000 players** to demonstrate a continuously changing leaderboard.

```bash
node src/simulator/gameSimulator.js
```

### Load Benchmark

The benchmark sends **10,000 requests** using a mixed workload:

* 70% → `ZINCRBY`
* 20% → `ZREVRANK`
* 10% → `ZREVRANGE`

```bash
node src/benchmark/leaderboardBenchmark.js
```

The benchmark measures:

* Requests/sec
* Average latency
* p50 latency
* p95 latency
* p99 latency
* Failed requests

## Performance Experiment

In local testing with 1,000 players:

```text
~3,000 requests/sec
0 failed requests
```

Increasing concurrency from 100 to 500 did not significantly increase throughput, but latency increased considerably.

These numbers represent the **local Node.js + Express + HTTP + Redis stack**, not Redis's maximum theoretical capacity.

## Project Structure

```text
src/
├── server.js
├── redis.js
├── routes/
│   ├── leaderboard.js
│   └── views.js
├── simulator/
│   └── gameSimulator.js
└── benchmark/
    └── leaderboardBenchmark.js
```

## Key Learning

The main idea is:

```text
Player earns points
       ↓
     ZINCRBY
       ↓
 Redis Sorted Set
       ↓
 ┌──────────────┬──────────────┐
 ↓              ↓              ↓
ZREVRANGE    ZREVRANK        ZSCORE
 ↓              ↓
Top players   Player rank
```

This project was built to understand the fundamentals of using Redis for a **real-time leaderboard system**.
