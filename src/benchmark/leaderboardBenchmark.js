// const API_URL = "http://localhost:3000";

// const players = Array.from(
//     { length: 100 },
//     (_, index) => `benchmark-player${index + 1}`
// );

// const TOTAL_REQUESTS = 10000;
// const CONCURRENCY = 100;

// let completed = 0;
// let failed = 0;

// const latencies = [];

// function randomPoints() {
//     return Math.floor(Math.random() * 10) + 1;
// }

// async function sendRequest() {
//     const playerId =
//         players[Math.floor(Math.random() * players.length)];

//     const points = randomPoints();

//     const start = performance.now();

//     try {
//         const response = await fetch(
//             `${API_URL}/leaderboard/increment`,
//             {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     playerId,
//                     points,
//                 }),
//             }
//         );

//         const end = performance.now();

//         latencies.push(end - start);

//         if (!response.ok) {
//             failed++;
//             return;
//         }

//         completed++;
//     } catch (error) {
//         failed++;
//     }
// }

// async function runBenchmark() {
//     console.log("Starting benchmark...");
//     console.log(`Players: ${players.length}`);
//     console.log(`Total requests: ${TOTAL_REQUESTS}`);
//     console.log(`Concurrency: ${CONCURRENCY}`);
//     console.log("--------------------------------");

//     const startTime = performance.now();

//     while (completed + failed < TOTAL_REQUESTS) {
//         const remaining =
//             TOTAL_REQUESTS - completed - failed;

//         const batchSize = Math.min(
//             CONCURRENCY,
//             remaining
//         );

//         const requests = [];

//         for (let i = 0; i < batchSize; i++) {
//             requests.push(sendRequest());
//         }

//         await Promise.all(requests);
//     }

//     const endTime = performance.now();

//     const duration = (endTime - startTime) / 1000;

//     latencies.sort((a, b) => a - b);

//     const totalRequests = completed + failed;

//     const averageLatency =
//         latencies.reduce((sum, value) => sum + value, 0) /
//         latencies.length;

//     const p50 =
//         latencies[Math.floor(latencies.length * 0.50)];

//     const p95 =
//         latencies[Math.floor(latencies.length * 0.95)];

//     const p99 =
//         latencies[Math.floor(latencies.length * 0.99)];

//     const requestsPerSecond =
//         totalRequests / duration;

//     console.log("\n========== RESULTS ==========");

//     console.log(`Total requests: ${totalRequests}`);
//     console.log(`Successful: ${completed}`);
//     console.log(`Failed: ${failed}`);

//     console.log(
//         `Duration: ${duration.toFixed(2)} seconds`
//     );

//     console.log(
//         `Requests/sec: ${requestsPerSecond.toFixed(2)}`
//     );

//     console.log(
//         `Average latency: ${averageLatency.toFixed(2)} ms`
//     );

//     console.log(
//         `p50 latency: ${p50.toFixed(2)} ms`
//     );

//     console.log(
//         `p95 latency: ${p95.toFixed(2)} ms`
//     );

//     console.log(
//         `p99 latency: ${p99.toFixed(2)} ms`
//     );
// }

// runBenchmark();
const API_URL = "http://localhost:3000";

const players = Array.from(
    { length: 1000 },
    (_, index) => `benchmark-player${index + 1}`
);

const TOTAL_REQUESTS = 10000;
const CONCURRENCY = 500;

let completed = 0;
let failed = 0;

const latencies = [];

function randomPlayer() {
    return players[
        Math.floor(Math.random() * players.length)
    ];
}

function randomPoints() {
    return Math.floor(Math.random() * 10) + 1;
}

async function incrementScore() {
    const playerId = randomPlayer();
    const points = randomPoints();

    return fetch(`${API_URL}/leaderboard/increment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            playerId,
            points,
        }),
    });
}

async function getRank() {
    const playerId = randomPlayer();

    return fetch(
        `${API_URL}/leaderboard/${playerId}/rank`
    );
}

async function getTop() {
    return fetch(`${API_URL}/leaderboard/top`);
}

async function sendRequest() {
    const random = Math.random();

    const start = performance.now();

    try {
        let response;

        if (random < 0.70) {
            // 70% ZINCRBY
            response = await incrementScore();
        } else if (random < 0.90) {
            // 20% ZREVRANK
            response = await getRank();
        } else {
            // 10% ZREVRANGE
            response = await getTop();
        }

        const end = performance.now();

        latencies.push(end - start);

        if (!response.ok) {
            failed++;

            const errorBody = await response.text();

            console.error(
                `HTTP ${response.status}: ${errorBody}`
            );

            return;
        }
        completed++;
    } catch (error) {
        failed++;

        console.error(
            `Request error: ${error.message}`
        );
    }
}

async function runBenchmark() {
    console.log("Starting mixed workload benchmark...");
    console.log(`Players: ${players.length}`);
    console.log(`Total requests: ${TOTAL_REQUESTS}`);
    console.log(`Concurrency: ${CONCURRENCY}`);
    console.log("--------------------------------");
    console.log("70% → ZINCRBY");
    console.log("20% → ZREVRANK");
    console.log("10% → ZREVRANGE");
    console.log("--------------------------------");

    const startTime = performance.now();

    while (completed + failed < TOTAL_REQUESTS) {
        const remaining =
            TOTAL_REQUESTS - completed - failed;

        const batchSize = Math.min(
            CONCURRENCY,
            remaining
        );

        const requests = [];

        for (let i = 0; i < batchSize; i++) {
            requests.push(sendRequest());
        }

        await Promise.all(requests);
    }

    const endTime = performance.now();

    const duration =
        (endTime - startTime) / 1000;

    latencies.sort((a, b) => a - b);

    const averageLatency =
        latencies.reduce(
            (sum, value) => sum + value,
            0
        ) / latencies.length;

    const p50 =
        latencies[
        Math.floor(latencies.length * 0.50)
        ];

    const p95 =
        latencies[
        Math.floor(latencies.length * 0.95)
        ];

    const p99 =
        latencies[
        Math.floor(latencies.length * 0.99)
        ];

    const totalRequests =
        completed + failed;

    const requestsPerSecond =
        totalRequests / duration;

    console.log("\n========== RESULTS ==========");

    console.log(`Total requests: ${totalRequests}`);
    console.log(`Successful: ${completed}`);
    console.log(`Failed: ${failed}`);

    console.log(
        `Duration: ${duration.toFixed(2)} seconds`
    );

    console.log(
        `Requests/sec: ${requestsPerSecond.toFixed(2)}`
    );

    console.log(
        `Average latency: ${averageLatency.toFixed(2)} ms`
    );

    console.log(
        `p50 latency: ${p50.toFixed(2)} ms`
    );

    console.log(
        `p95 latency: ${p95.toFixed(2)} ms`
    );

    console.log(
        `p99 latency: ${p99.toFixed(2)} ms`
    );
}

runBenchmark();