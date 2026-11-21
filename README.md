# Trafind

Trafind is a TypeScript market-data ingestion system for collecting and
repairing Binance cryptocurrency candles. It is a pnpm/Turborepo workspace
that stores raw OHLCV market data in PostgreSQL through Prisma and exposes an
Express API for health checks and market-data query validation.

The completed pipeline currently covers:

- Historical candle collection from Binance
- Closed-candle live WebSocket collection
- Candle mapping and validation
- PostgreSQL storage with duplicate protection
- Missing-candle detection and automatic repair
- Scheduled historical-data quality checks
- API request validation

Feature engineering, pattern discovery, hypothesis testing, and backtesting
are described in [docs/cycle.md](docs/cycle.md) but are not implemented yet.

## Project status

### Implemented

- Binance REST klines collection in batches of up to 1,000 candles
- REST request retries, retry filtering, and 10-second request timeouts
- Binance WebSocket collection for closed `SOLUSDT` 1-minute candles
- Conversion of Binance arrays and WebSocket messages into normalized candle
  objects
- Validation of prices, volume, OHLC relationships, dates, and closed status
- PostgreSQL persistence with a unique constraint for
  `(symbol, interval, openTime)`
- Historical, range, trailing-gap, and database-quality checks
- Automatic startup repair and a periodic repair scheduler
- Graceful worker shutdown for `SIGINT` and `SIGTERM`
- API health endpoint and market-candle query validation

### Current API and worker boundaries

- The market-candle endpoint validates input and echoes it; it does not yet
  query PostgreSQL.
- The worker's main entry point performs data repair. The Binance WebSocket
  client is implemented, but `connectBinanceWebSocket()` is not called by the
  main entry point.
- Live ingestion, recovery, and the repair scheduler are wired behind worker
  services and can be enabled or exercised separately.
- There is no configured end-to-end test runner yet. Source files under `tests`
  directories are manual TypeScript test scripts.

## Workspace

| Path | Purpose |
| --- | --- |
| `apps/api` | Express HTTP server, environment parsing, routes, middleware, and Zod validation |
| `apps/worker` | Binance REST/WebSocket clients, collectors, mappers, validators, quality checks, recovery, scheduling, and worker startup |
| `packages/database` | Prisma schema, PostgreSQL client, generated Prisma types, and candle repository |
| `docs/cycle.md` | Planned research pipeline from raw candles to trading strategies |

## Market Data Infrastructure

```mermaid
flowchart TD
    A[Binance] --> B[Historical Data Collection]
    B --> C[Live WebSocket Collection]
    C --> D[Data Validation]
    D --> E[(PostgreSQL)]
    E --> F[Missing Data Detection]
    F --> G[Data Recovery]
    G --> H[Reliable Market Data]
```

### Data flow

1. `getKlines()` requests a page of Binance REST klines.
2. `collectHistoricalKlines()` advances through the result pages using the
   last candle's open time.
3. `mapBinanceKline()` normalizes Binance values into a `MappedCandle`.
4. `validateCandle()` verifies OHLC, volume, price, and time constraints.
5. `saveMany()` inserts the validated candles and skips duplicates.
6. `checkDatabaseCandleQuality()` compares stored open times with the expected
   interval-aligned times and reports gaps.
7. `repairMissingCandles()` collects and resaves the affected range, then
   verifies that the gaps were repaired.

## Phase 2 — Quantitative Foundation

```mermaid
flowchart TD
    A[(PostgreSQL)] --> B[Quantitative Foundation]
    B --> C[Market Features]
    B --> D[Technical Indicators]
    B --> E[Math]
    B --> F[Data Alignment]
    C --> G[Quantitative Analysis]
    D --> G
    E --> G
    F --> G
```

## Roadmap

| Phase | Description | Status |
|---|---|---|
| 1 | Market Data Infrastructure | 🟢 Completed |
| 2 | Quantitative Foundation | 🔵 Next |
| 3 | Backtesting Engine | Pending |
| 4 | Strategy Development | Pending |
| 5 | Risk Management | Pending |
| 6 | Paper Trading | Pending |
| 7 | Live Trading | Pending |

## Database model

Prisma stores market candles in the `candles` table.

| Field | Description |
| --- | --- |
| `id` | Auto-incrementing database identifier |
| `symbol` | Market symbol, for example `SOLUSDT` |
| `interval` | Prisma enum: `M1`, `M5`, or `H1` |
| `openTime` | UTC candle opening timestamp |
| `closeTime` | UTC candle closing timestamp |
| `open`, `high`, `low`, `close` | Decimal OHLC prices |
| `volume` | Base-asset volume |
| `quoteAssetVolume` | Quote-asset volume |
| `numberOfTrades` | Number of trades in the candle |
| `takerBuyBaseVolume` | Taker-buy base volume |
| `takerBuyQuoteVolume` | Taker-buy quote volume |
| `createdAt` | Database insertion timestamp |

The unique constraint prevents duplicate candles for the same symbol,
interval, and open time. `saveMany()` additionally uses Prisma's
`skipDuplicates` option for idempotent batch inserts.

Supported interval mappings:

| Binance | Database | Duration |
| --- | --- | --- |
| `1m` | `M1` | 60 seconds |
| `5m` | `M5` | 5 minutes |
| `1h` | `H1` | 60 minutes |

## Worker functions

### Worker entry point

[apps/worker/src/index.ts](apps/worker/src/index.ts) provides `startWorker()`
and process-signal handling:

- Verifies 30 days of `SOLUSDT` `1m` history at startup.
- Throws if missing candles remain after the initial repair attempt.
- Starts a repair cycle every five minutes.
- Checks and repairs the latest 24 hours of data in each scheduled cycle.
- Stops the scheduler and disconnects Prisma when `SIGINT` or `SIGTERM` is
  received.

### Binance REST client

`getKlines()` in
[apps/worker/src/clients/binance.client.ts](apps/worker/src/clients/binance.client.ts):

- Calls Binance's public market-data endpoint.
- Builds symbol, interval, limit, start time, and end time query parameters.
- Defaults to a page limit of 1,000 candles.
- Uses a 10-second request timeout.
- Retries temporary failures up to two times.
- Retries HTTP 429 and 5xx responses, but does not retry other HTTP errors.
- Throws a typed `BinanceApiError` for a non-successful HTTP response.
- Rejects non-array Binance payloads.

### Historical collector

`collectHistoricalKlines()` in
[apps/worker/src/collectors/historical-data.collector.ts](apps/worker/src/collectors/historical-data.collector.ts):

- Uses an async generator to return one REST page at a time.
- Requests pages beginning after the current cursor.
- Stops at the requested end time or after an empty/short page.
- Advances based on the final candle open time and interval duration.
- Throws if Binance does not advance the collection cursor.

### Candle mappers

`mapBinanceKline()` in
[apps/worker/src/mappers/binance.mapper.ts](apps/worker/src/mappers/binance.mapper.ts)
converts a Binance REST array and symbol/interval metadata into a
`MappedCandle`.

`mapWebSocketMessageToKline()` in
[apps/worker/src/mappers/binance-websocket.mapper.ts](apps/worker/src/mappers/binance-websocket.mapper.ts)
converts a Binance WebSocket kline payload into the same array shape used by
the REST mapper.

### Candle validator

`validateCandle()` in
[apps/worker/src/validators/candle.validator.ts](apps/worker/src/validators/candle.validator.ts)
rejects candles with:

- Missing or non-finite numeric values
- Non-positive open, high, low, or close prices
- Negative volume
- A high price below the open or close
- A low price above the open or close
- A high price below the low
- A close time earlier than the open time

`isCandleClosed()` returns whether a candle's close time has already passed.

### Historical data service

`collectAndSaveHistoricalData()` in
[apps/worker/src/services/historical-data.service.ts](apps/worker/src/services/historical-data.service.ts):

- Finds the latest database candle for the requested symbol and interval.
- Resumes after that candle by default.
- Supports `resumeFromLatest: false` for forced range collection and repair.
- Maps, validates, and filters closed historical candles.
- Converts Binance interval names to Prisma interval names.
- Saves batches and reports received, valid, saved, and skipped totals.

### Live candle service

`processLiveCandle()` in
[apps/worker/src/services/live-candle.service.ts](apps/worker/src/services/live-candle.service.ts):

- Ignores non-final WebSocket updates.
- Maps a closed WebSocket kline and validates it.
- Converts the interval to the database enum.
- Saves through `retry()` with two retries and linear 1-second, 2-second
  delays.
- Logs the saved result and key candle information.

### WebSocket client

`connectBinanceWebSocket()` in
[apps/worker/src/clients/binance-websocket.client.ts](apps/worker/src/clients/binance-websocket.client.ts):

- Connects to the `SOLUSDT@kline_1m` Binance WebSocket stream.
- Runs data recovery after each connection opens.
- Buffers closed messages while recovery is running.
- Processes the buffered messages only after recovery completes.
- Sends a WebSocket ping every 30 seconds and terminates unresponsive peers.
- Reconnects with exponential backoff from 1 second to 30 seconds.
- Prevents outdated connection attempts and recovery tasks from affecting a
  newer connection.
- Provides `close()` for clearing timers and shutting down the socket.

### Data quality functions

[apps/worker/src/services/data-quality.service.ts](apps/worker/src/services/data-quality.service.ts)
provides:

- `detectMissingCandles(openTimes, intervalDuration)` — finds gaps between
  adjacent sorted candle open times.
- `areCandleTimesSorted(openTimes)` — rejects duplicate or descending times.
- `areCandleDatesValid(openTimes)` — verifies that every date is real and
  finite.
- `checkCandleData(openTimes, intervalDuration)` — validates date shape and
  sorting, then reports internal gaps.
- `checkDatabaseCandleQuality(params)` — loads open times from PostgreSQL and
  compares the full requested range with interval-aligned expected times.
- `detectTrailingMissingCandles(latestOpenTime, intervalDuration, now)` —
  finds missing closed candles after the latest stored open time.
- `detectMissingCandlesInRange(openTimes, startTime, endTime, duration)` —
  checks an exact aligned time range, excluding the current open candle.

### Recovery and repair functions

`recoverMissingCandles()` in
[apps/worker/src/services/data-recovery.service.ts](apps/worker/src/services/data-recovery.service.ts)
finds the latest candle in the database and collects from the next expected
open time through the present.

`repairMissingCandles()` in
[apps/worker/src/services/data-repair.service.ts](apps/worker/src/services/data-repair.service.ts)
performs a more complete repair:

1. Runs a database-quality check.
2. Collects the first-to-last affected historical range.
3. Forces collection instead of starting from the latest candle.
4. Runs the quality check again.
5. Returns repaired and remaining-candle counts.

### Scheduler and retry helpers

`startDataRepairScheduler()` in
[apps/worker/src/schedulers/data-repair.scheduler.ts](apps/worker/src/schedulers/data-repair.scheduler.ts):

- Runs an immediate first cycle.
- Repeats at the configured interval.
- Skips a cycle if the previous repair is still running.
- Catches and logs cycle failures without stopping future cycles.
- Stops the timer and waits for active work during shutdown.

`retry()` in [apps/worker/src/utils/retry.ts](apps/worker/src/utils/retry.ts)
runs an async operation repeatedly. Each failure waits longer than the previous
failure: `delay * (attempt + 1)`. An optional `shouldRetry(error)` predicate
decides whether an attempt is worth retrying; the final attempt's error is
always rethrown.

## Database package functions

### Prisma client

[packages/database/src/client.ts](packages/database/src/client.ts) creates a
Prisma PostgreSQL client using `@prisma/adapter-pg`. It requires
`DATABASE_URL` and sets the PostgreSQL timezone to UTC.

### Candle repository

[packages/database/src/repositories/candle.repository.ts](packages/database/src/repositories/candle.repository.ts)
provides:

- `saveMany(candles)` — inserts a batch while skipping duplicate rows.
- `findLatest(symbol, interval)` — returns the newest stored candle.
- `findCandleOpenTimes(symbol, interval, startTime, endTime)` — returns
  ascending open times for a database-quality check.

The package exports these functions and `prisma` through
[packages/database/src/index.ts](packages/database/src/index.ts).

## API functions and endpoints

### API health

`GET /api/health`

Returns:

- Service status
- A fixed success message
- An ISO-8601 timestamp

### Market candle validation

`GET /api/market/candles`

Example:

```text
GET /api/market/candles?symbol=SOLUSDT&interval=1h&limit=100
```

`candlesQuerySchema` in
[apps/api/src/schemas/validation-schema.ts](apps/api/src/schemas/validation-schema.ts)
validates and defaults:

- `symbol`: exactly `SOLUSDT`
- `interval`: `1m`, `5m`, or `1h`; defaults to `1h`
- `limit`: integer from 1 to 1000; coerced from the query string; defaults to
  100

`getCandles()` validates the request and returns the selected values. Invalid
input returns HTTP 400 with Zod issue details. This endpoint does not read
candles from PostgreSQL yet.

The API also includes:

- `notFoundHandler()` — returns HTTP 404 for unmatched routes.
- `errorHandler()` — logs unexpected errors and returns HTTP 500.
- Environment validation — validates `PORT` and `NODE_ENV`; the default port
  is `4000`.

## Requirements

- Node.js 20 or newer
- pnpm 12
- PostgreSQL 15 or newer

## Getting started

1. Install workspace dependencies:

   ```sh
   pnpm install
   ```

2. Create the database environment file:

   ```sh
   cp packages/database/.env.example packages/database/.env
   ```

   On Windows PowerShell, use:

   ```powershell
   Copy-Item packages/database/.env.example packages/database/.env
   ```

   Set `DATABASE_URL` to the PostgreSQL connection string.

3. Generate Prisma and apply migrations:

   ```sh
   pnpm --filter @trafind/database generate
   pnpm --filter @trafind/database migrate:dev
   ```

4. Start the API:

   ```sh
   pnpm --filter @trafind/api dev
   ```

5. Start the worker:

   ```sh
   pnpm --filter @trafind/worker dev
   ```

The API reads `PORT` and defaults to `4000`. The database process reads
`DATABASE_URL` from `packages/database/.env`.

## Development commands

```sh
# Build a package
pnpm --filter @trafind/database build
pnpm --filter @trafind/worker build
pnpm --filter @trafind/api build

# Generate Prisma
pnpm --filter @trafind/database generate

# Apply development migrations
pnpm --filter @trafind/database migrate:dev

# Run package development servers
pnpm --filter @trafind/api dev
pnpm --filter @trafind/worker dev

# Run built output
pnpm --filter @trafind/api start
pnpm --filter @trafind/worker start
```

Build ordering can also be coordinated with Turbo:

```sh
pnpm exec turbo build
pnpm exec turbo dev
```

## Manual worker tests

The worker contains manual scripts under `apps/worker/src/clients/tests`,
`apps/worker/src/services/tests`, and `apps/worker/src/utils/tests`. They cover
BINANCE REST/collector behavior, database and range quality, repair/recovery,
WebSocket behavior, and retry behavior. They are TypeScript files intended for
direct execution or future test-runner integration; they are not exposed as
workspace test scripts and should not be treated as an automated suite.
