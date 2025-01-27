import { describe, it, expect, vi } from 'vitest';
import { FileSystem } from './filesystem';
import { ImageComparator } from './image-comparator';
import { SnapshotWriterInterface } from './snapshot-writer';
import { SnapshotMatcherFactory } from './snapshot-matcher';

describe('`SnapshotMatcher`', () => {
    describe('`all` mode', () => {
        it('should call `snapshotWriter.updateSnapshot` when comparison fails', () => {
            const mockFs = {
                readFile: vi.fn().mockReturnValue(Buffer.from('snapshot')),
                mkdirp: vi.fn(),
                writeFile: vi.fn(),
                exists: vi.fn().mockReturnValue(true),
            } as unknown as FileSystem;

            const mockComparator = {
                compare: vi.fn().mockReturnValue({
                    diffCount: 10,
                    diffImage: Buffer.from('diff'),
                }),
            } as unknown as ImageComparator;

            const mockSnapshotWriter = {
                updateSnapshot: vi.fn(),
            } as unknown as SnapshotWriterInterface;

            const snapshotPath = '/path/to/snapshot.png';
            const diffImageName = '/path/to/diff.png';
            const received = Buffer.from('received');
            const threshold = 0.1;

            const matcher = SnapshotMatcherFactory.create(
                mockFs,
                mockComparator,
                mockSnapshotWriter,
                snapshotPath,
                received,
                'all',
                diffImageName,
                threshold,
            );

            const result = matcher.matchImageSnapshot();

            expect(mockSnapshotWriter.updateSnapshot).toHaveBeenCalledExactlyOnceWith(received);
            expect(result.pass).toBeFalsy();
        });

        it('should not call `snapshotWriter.updateSnapshot` when comparison succeeds', () => {
            const mockFs = {
                readFile: vi.fn().mockReturnValue(Buffer.from('snapshot')),
                mkdirp: vi.fn(),
                writeFile: vi.fn(),
                exists: vi.fn().mockReturnValue(true),
            } as unknown as FileSystem;

            const mockComparator = {
                compare: vi.fn().mockReturnValue({
                    diffCount: 0,
                }),
            } as unknown as ImageComparator;

            const mockSnapshotWriter = {
                updateSnapshot: vi.fn(),
            } as unknown as SnapshotWriterInterface;

            const snapshotPath = '/path/to/snapshot.png';
            const diffImageName = '/path/to/diff.png';
            const received = Buffer.from('received');
            const threshold = 0.1;

            const matcher = SnapshotMatcherFactory.create(
                mockFs,
                mockComparator,
                mockSnapshotWriter,
                snapshotPath,
                received,
                'all',
                diffImageName,
                threshold,
            );

            const result = matcher.matchImageSnapshot();

            expect(mockSnapshotWriter.updateSnapshot).not.toHaveBeenCalled();
            expect(result.pass).toBeTruthy();
        });
    });

    describe('`new` mode', () => {
        it('should call `snapshotWriter.updateSnapshot` when a snapshot is missing', () => {
            const mockFs = {
                readFile: vi.fn().mockReturnValue(Buffer.from('snapshot')),
                mkdirp: vi.fn(),
                writeFile: vi.fn(),
                exists: vi.fn().mockReturnValue(false),
            } as unknown as FileSystem;

            const mockComparator = {
                compare: vi.fn().mockReturnValue({
                    diffCount: 0,
                }),
            } as unknown as ImageComparator;

            const mockSnapshotWriter = {
                updateSnapshot: vi.fn(),
            } as unknown as SnapshotWriterInterface;

            const snapshotPath = '/path/to/snapshot.png';
            const diffImageName = '/path/to/diff.png';
            const received = Buffer.from('received');
            const threshold = 0.1;

            const matcher = SnapshotMatcherFactory.create(
                mockFs,
                mockComparator,
                mockSnapshotWriter,
                snapshotPath,
                received,
                'new',
                diffImageName,
                threshold,
            );

            matcher.matchImageSnapshot();

            expect(mockSnapshotWriter.updateSnapshot).toHaveBeenCalledExactlyOnceWith(received);
        });

        it('should not call `snapshotWriter.updateSnapshot` when a snapshot exists', () => {
            const mockFs = {
                readFile: vi.fn().mockReturnValue(Buffer.from('snapshot')),
                mkdirp: vi.fn(),
                writeFile: vi.fn(),
                exists: vi.fn().mockReturnValue(true),
            } as unknown as FileSystem;

            const mockComparator = {
                compare: vi.fn().mockReturnValue({
                    diffCount: 0,
                }),
            } as unknown as ImageComparator;

            const mockSnapshotWriter = {
                updateSnapshot: vi.fn(),
            } as unknown as SnapshotWriterInterface;

            const snapshotPath = '/path/to/snapshot.png';
            const diffImageName = '/path/to/diff.png';
            const received = Buffer.from('received');
            const threshold = 0.1;

            const matcher = SnapshotMatcherFactory.create(
                mockFs,
                mockComparator,
                mockSnapshotWriter,
                snapshotPath,
                received,
                'new',
                diffImageName,
                threshold,
            );

            const result = matcher.matchImageSnapshot();

            expect(mockSnapshotWriter.updateSnapshot).not.toHaveBeenCalled();
            expect(result.pass).toBeTruthy();
        });
    });

    describe('`none` mode', () => {
        it('should not call `snapshotWriter.updateSnapshot`', () => {
            const mockFs = {
                readFile: vi.fn().mockReturnValue(Buffer.from('snapshot')),
                mkdirp: vi.fn(),
                writeFile: vi.fn(),
                exists: vi.fn().mockReturnValue(false),
            } as unknown as FileSystem;

            const mockComparator = {
                compare: vi.fn().mockReturnValue({
                    diffCount: 0,
                }),
            } as unknown as ImageComparator;

            const mockSnapshotWriter = {
                updateSnapshot: vi.fn(),
            } as unknown as SnapshotWriterInterface;

            const snapshotPath = '/path/to/snapshot.png';
            const diffImageName = '/path/to/diff.png';
            const received = Buffer.from('received');
            const threshold = 0.1;

            const matcher = SnapshotMatcherFactory.create(
                mockFs,
                mockComparator,
                mockSnapshotWriter,
                snapshotPath,
                received,
                'none',
                diffImageName,
                threshold,
            );

            const result = matcher.matchImageSnapshot();

            expect(mockSnapshotWriter.updateSnapshot).not.toHaveBeenCalled();
            expect(result.pass).toBeFalsy();
        });
    });
});
