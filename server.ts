import {createServer} from 'node:http';
import {Worker} from 'node:worker_threads';
import {fileURLToPath} from 'node:url';

const PORT = process.env.API_PORT || 3000;

const server = createServer(async (req, res) => {
    if (req.url === '/process-users' && req.method === 'GET') {
        try {
            // 1. Native Fetch API
            const response = await fetch('https://jsonplaceholder.typicode.com/users');
            const users = await response.json();

            // 2. Offloading CPU work to a Worker Thread to prevent blocking the Event Loop
            const workerPath = fileURLToPath(new URL('./worker.ts', import.meta.url));
            const worker = new Worker(workerPath, {workerData: users});

            worker.on('message', (result) => {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: true, computationalResult: result}));
            });

            worker.on('error', (err) => {
                res.writeHead(500, {'Content-Type': 'application/json'});

                // Check if 'err' is a standard Error object
                const errorMessage = err instanceof Error ? err.message : String(err);

                res.end(JSON.stringify({error: errorMessage}));
            });

        } catch (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Failed to fetch external data'}));
        }
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} using native TS and envs!`);
});