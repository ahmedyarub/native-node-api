import {parentPort, workerData} from 'node:worker_threads';

// This simulates a heavy payload processing task (e.g., cryptographic hashing,
// complex GraphQL payload resolution, or massive array mapping).
function processData(data: any[]) {
    let result = 0;
    for (let i = 0; i < 50_000_000; i++) {
        result += Math.sqrt(i) * data.length;
    }
    return result;
}

// Ensure we are inside a worker thread
if (parentPort) {
    const processedResult = processData(workerData);
    // Send the result back to the main Event Loop
    parentPort.postMessage(processedResult);
}