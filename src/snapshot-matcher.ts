import path from 'path';
import { FileSystem } from './filesystem.js';
import { ImageComparator } from './image-comparator.js';
import { SnapshotWriterInterface, UpdateSnapshotMode } from './snapshot-writer.js';

abstract class SnapshotMatcher {
    constructor(
        protected readonly fs: FileSystem,
        protected readonly comparator: ImageComparator,
        protected readonly snapshotWriter: SnapshotWriterInterface,
        protected readonly snapshotPath: string,
        protected readonly received: Buffer,
    ) {}

    abstract matchImageSnapshot(): { pass: boolean; message: () => string };
}

class ExistingSnapshotMatcher extends SnapshotMatcher {
    constructor(
        protected readonly fs: FileSystem,
        protected readonly comparator: ImageComparator,
        protected readonly snapshotWriter: SnapshotWriterInterface,
        protected readonly snapshotPath: string,
        protected readonly received: Buffer,
        protected readonly diffImageName: string,
        protected readonly threshold = 0.1,
    ) {
        super(fs, comparator, snapshotWriter, snapshotPath, received);
    }

    matchImageSnapshot(): { pass: boolean; message: () => string } {
        const snapshot = this.fs.readFile(this.snapshotPath);
        if (snapshot == null) {
            throw new Error(`Failed to read snapshot: ${this.snapshotPath}`);
        }

        const { diffCount, diffImage } = this.comparator.compare(this.received, snapshot, {
            threshold: this.threshold,
        });

        if (diffImage) {
            this.fs.mkdirp(path.dirname(this.diffImageName));
            this.fs.writeFile(this.diffImageName, diffImage);
            this.snapshotWriter.updateSnapshot(this.received);
        }

        return {
            pass: diffCount === 0,
            message: () =>
                diffCount === 0
                    ? 'image matches snapshot'
                    : `Expected image to match snapshot but ${diffCount} pixels differed`,
        };
    }
}

class NewSnapshotMatcher extends SnapshotMatcher {
    matchImageSnapshot(): { pass: boolean; message: () => string } {
        this.snapshotWriter.updateSnapshot(this.received);

        return {
            pass: true,
            message: (): string => `snapshot created at ${this.snapshotPath}`,
        };
    }
}

class MissingSnapshotMatcher extends SnapshotMatcher {
    matchImageSnapshot(): { pass: boolean; message: () => string } {
        return {
            pass: false,
            message: (): string => `snapshot ${this.snapshotPath} is missing`,
        };
    }
}

// Factory for creating the appropriate matcher
export class SnapshotMatcherFactory {
    static create(
        fs: FileSystem,
        comparator: ImageComparator,
        snapshotWriter: SnapshotWriterInterface,
        snapshotPath: string,
        received: Buffer,
        updateSnapshotMode: UpdateSnapshotMode,
        diffImageName: string,
        threshold: number,
    ): SnapshotMatcher {
        if (fs.exists(snapshotPath)) {
            return new ExistingSnapshotMatcher(
                fs,
                comparator,
                snapshotWriter,
                snapshotPath,
                received,
                diffImageName,
                threshold,
            );
        } else if (updateSnapshotMode != 'none') {
            return new NewSnapshotMatcher(fs, comparator, snapshotWriter, snapshotPath, received);
        } else {
            return new MissingSnapshotMatcher(fs, comparator, snapshotWriter, snapshotPath, received);
        }
    }
}
