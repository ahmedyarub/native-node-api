import { parentPort, workerData } from 'node:worker_threads';

function processData(data: any[]) {
    let result = 0;
    // Simulate heavy CPU computation
    for (let i = 0; i < 10_000_000; i++) {
        result += Math.sqrt(i) * data.length;
    }
    return result;
}

if (parentPort) {
    const processedResult = processData(workerData);
    parentPort.postMessage(processedResult);
}
