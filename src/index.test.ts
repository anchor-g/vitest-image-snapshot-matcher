import fs from 'fs';
import path from 'path';
import { describe, it, expect, beforeAll } from 'vitest';
import { rimrafSync } from 'rimraf';

describe('test image snapshot extension', () => {
    const benchmarkImage = fs.readFileSync(path.join(__dirname, '../test-assets/benchmark.png'));

    describe('when the image matches the snapshot', () => {
        beforeAll(async () => {
            const { createToMatchImageSnapshot } = await import('./index.js');

            expect.extend({
                toMatchImageSnapshot: createToMatchImageSnapshot(),
            });
        });

        it('should fulfill the expectation', () => {
            expect(benchmarkImage).toMatchImageSnapshot();
        });
    });

    describe('when the image and snapshot are different', () => {
        beforeAll(async () => {
            const { createToMatchImageSnapshot } = await import('./index.js');

            rimrafSync(path.join(__dirname, '__image_diffs__'));

            expect.extend({
                toMatchImageSnapshot: createToMatchImageSnapshot(),
            });
        });

        it('should throw', () => {
            expect(() => expect(benchmarkImage).toMatchImageSnapshot()).toThrow(
                'Expected image to match snapshot but 56 pixels differed',
            );
        });

        it('should write a diff image', () => {
            const diffImage = fs.readFileSync(
                path.join(
                    __dirname,
                    '__image_diffs__',
                    'test-image-snapshot-extension-when-the-image-and-snapshot-are-different-should-throw.png',
                ),
            );

            expect(diffImage).toMatchImageSnapshot();
        });
    });

    describe('when the snapshot does not exist (dev mode)', () => {
        beforeAll(async () => {
            const { createToMatchImageSnapshot } = await import('./index.js');

            rimrafSync(
                path.join(
                    __dirname,
                    '__image_snapshots__',
                    'test-image-snapshot-extension-when-the-snapshot-does-not-exist-(dev-mode)-should-write-a-snapshot.png',
                ),
            );

            expect.extend({
                toMatchImageSnapshot: createToMatchImageSnapshot(),
            });
        });

        it('should write a snapshot', () => {
            expect(benchmarkImage).toMatchImageSnapshot();

            const diffImageExists = fs.existsSync(
                path.join(
                    __dirname,
                    '__image_snapshots__',
                    'test-image-snapshot-extension-when-the-snapshot-does-not-exist-(dev-mode)-should-write-a-snapshot.png',
                ),
            );

            expect(diffImageExists).toBeTruthy();
        });
    });
});
