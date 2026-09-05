const players = Array.from(
    { length: 1000 },
    (_, index) => `player${index + 1}`
);

const API_URL = "http://localhost:3000";

function randomPoints() {
    return Math.floor(Math.random() * 10) + 1;
}

async function updatePlayerScore(playerId) {
    const points = randomPoints();

    try {
        const response = await fetch(
            `${API_URL}/leaderboard/increment`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    playerId,
                    points,
                }),
            }
        );

        const data = await response.json();

        console.log(
            `${playerId} +${points} → score: ${data.score}`
        );
    } catch (error) {
        console.error(
            `${playerId} request failed:`,
            error.message
        );
    }
}

async function simulateGame() {
    const player =
        players[Math.floor(Math.random() * players.length)];

    await updatePlayerScore(player);
}

// 10 score updates every second
setInterval(() => {
    for (let i = 0; i < 100; i++) {
        simulateGame();
    }
}, 1000);