import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { FileSystem } from './filesystem';
import { SnapshotWriterFactory } from './snapshot-writer';

describe('snapshotWriterFactory', () => {
    let mockFs: Mocked<FileSystem>;
    const testSnapshotPath = '/path/to/snapshot.png';
    const testContent = Buffer.from('test-image-content');

    beforeEach(() => {
        mockFs = {
            exists: vi.fn(),
            mkdirp: vi.fn(),
            writeFile: vi.fn(),
            readFile: vi.fn(),
        };
    });

    it('should create a writer that always writes snapshots when mode is "all"', () => {
        const writer = SnapshotWriterFactory.create(mockFs, 'all', testSnapshotPath);

        writer.updateSnapshot(testContent);

        expect(mockFs.exists).not.toHaveBeenCalledWith();
        expect(mockFs.writeFile).toHaveBeenCalledWith(testSnapshotPath, testContent);
    });

    it('should create a writer that only writes new snapshots when mode is "new" (snapshot missing)', () => {
        mockFs.exists.mockReturnValueOnce(false);
        const writer = SnapshotWriterFactory.create(mockFs, 'new', testSnapshotPath);

        writer.updateSnapshot(testContent);

        expect(mockFs.exists).toHaveBeenCalledWith(testSnapshotPath);
        expect(mockFs.writeFile).toHaveBeenCalledWith(testSnapshotPath, testContent);
    });

    it('should create a writer that only writes new snapshots when mode is "new" (snapshot exists)', () => {
        mockFs.exists.mockReturnValueOnce(true);
        const writer = SnapshotWriterFactory.create(mockFs, 'new', testSnapshotPath);

        writer.updateSnapshot(testContent);

        expect(mockFs.exists).toHaveBeenCalledWith(testSnapshotPath);
        expect(mockFs.writeFile).not.toHaveBeenCalledWith(testSnapshotPath, testContent);
    });

    it('should create a writer that never writes snapshots when mode is "none"', () => {
        const writer = SnapshotWriterFactory.create(mockFs, 'none', testSnapshotPath);

        writer.updateSnapshot(testContent);

        expect(mockFs.mkdirp).not.toHaveBeenCalled();
        expect(mockFs.writeFile).not.toHaveBeenCalled();
    });

    it('should throw error for invalid mode', () => {
        expect(() => {
            // @ts-expect-error Testing invalid mode
            SnapshotWriterFactory.create(mockFs, 'invalid', testSnapshotPath);
        }).toThrow('Invalid snapshot mode: invalid');
    });
});
