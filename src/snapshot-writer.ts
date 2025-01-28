import path from 'path';
import { FileSystem } from './filesystem.js';

export interface SnapshotWriterInterface {
    updateSnapshot(snapshot: Buffer): void;
}

abstract class SnapshotWriter implements SnapshotWriterInterface {
    constructor(
        protected readonly fs: FileSystem,
        protected readonly snapshotPath: string,
    ) {}

    abstract updateSnapshot(snapshot: Buffer): void;

    protected writeSnapshot(content: Buffer): void {
        try {
            this.fs.mkdirp(path.dirname(this.snapshotPath));
            this.fs.writeFile(this.snapshotPath, content);
        } catch (error) {
            throw new Error(
                `Failed to write snapshot: ${error != null && typeof error === 'object' && 'message' in error ? error.message : error}`,
            );
        }
    }
}

// Concrete implementations extending the base class
class AlwaysWriteSnapshot extends SnapshotWriter {
    updateSnapshot(content: Buffer): void {
        this.writeSnapshot(content);
    }
}

class WriteNewSnapshotOnly extends SnapshotWriter {
    protected shouldWrite(snapshotExists: boolean): boolean {
        return !snapshotExists;
    }

    updateSnapshot(content: Buffer): void {
        if (this.shouldWrite(this.snapshotExists())) {
            this.writeSnapshot(content);
        }
    }

    private snapshotExists(): boolean {
        return this.fs.exists(this.snapshotPath);
    }
}

class NeverWriteSnapshot extends SnapshotWriter {
    updateSnapshot(_content: Buffer): void {
        // No-op as this strategy never writes snapshots
    }
}

/**
 * The mode for updating snapshots, as controlled by the testing framework.
 *
 * - `'all'`: Always write the snapshot.
 * - `'new'`: Write the snapshot only if it does not already exist.
 * - `'none'`: Never write the snapshot.
 */
export type UpdateSnapshotMode = 'all' | 'new' | 'none';

// Factory for creating the appropriate writer
export class SnapshotWriterFactory {
    static create(fs: FileSystem, mode: UpdateSnapshotMode, snapshotPath: string): SnapshotWriter {
        switch (mode) {
            case 'all':
                return new AlwaysWriteSnapshot(fs, snapshotPath);
            case 'new':
                return new WriteNewSnapshotOnly(fs, snapshotPath);
            case 'none':
                return new NeverWriteSnapshot(fs, snapshotPath);
            default:
                throw new Error(`Invalid snapshot mode: ${mode}`);
        }
    }
}
