import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Only the pure logic is covered: reducers, url/array helpers and the API request parsers.
        // The YouTube iframe integration is deliberately out of scope - it needs a real browser and
        // a real player, and the /test sandbox is the harness for it.
        include: ['tests/**/*.test.ts'],
        environment: 'node',
    },
});
