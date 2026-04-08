import {describe, mock, test} from 'node:test';
import assert from 'node:assert/strict';

describe('API Core Logic Tests', () => {

    test('Should mock a successful fetch call', async () => {
        // Native mocking feature
        mock.method(global, 'fetch', () => {
            return Promise.resolve({
                json: () => Promise.resolve([{id: 1, name: 'Test User'}])
            });
        });

        const response = await fetch('https://dummy-url.com');
        const data = await response.json() as { name: string }[];

        // Native strict assertions
        assert.strictEqual(data.length, 1);
        assert.strictEqual(data[0].name, 'Test User');

        // Restore the original fetch
        mock.restoreAll();
    });
});