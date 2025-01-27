import path from 'path';
import { MatcherState } from '@vitest/expect';
import { SnapshotWriterFactory } from './snapshot-writer';
import { SnapshotMatcherFactory } from './snapshot-matcher';
import { NodeFileSystem } from './filesystem';
import { PNGComparator } from './image-comparator';

function snapshotName(testPath: string, snapshotsDir: string, testName: string): string {
    return path.join(path.dirname(testPath), snapshotsDir, `${testName}.png`);
}

export function createToMatchImageSnapshot({
    snapshotsDir = '__image_snapshots__',
    diffDir = '__image_diffs__',
    threshold = 0.1,
} = {}) {
    return function toMatchImageSnapshot(
        this: MatcherState,
        received: Buffer,
    ): { pass: boolean; message: () => string } {
        const { currentTestName, testPath, snapshotState } = this;

        if (currentTestName == null || testPath == null) {
            throw new Error('toMatchImageSnapshot must be called from within a test');
        }

        const cleanTestName = currentTestName.replace(/[ >]+/g, '-').replace(/'/g, '');
        const imageSnapshotName = snapshotName(testPath, snapshotsDir, cleanTestName);
        const diffImageName = snapshotName(testPath, diffDir, cleanTestName);
        const updateSnapshotMode = snapshotState['_updateSnapshot'];

        const fs = new NodeFileSystem();
        const comparator = new PNGComparator();
        const snapshotWriter = SnapshotWriterFactory.create(fs, updateSnapshotMode, imageSnapshotName);
        const snapshotMatcher = SnapshotMatcherFactory.create(
            fs,
            comparator,
            snapshotWriter,
            imageSnapshotName,
            received,
            updateSnapshotMode,
            diffImageName,
            threshold,
        );

        return snapshotMatcher.matchImageSnapshot();
    };
}
