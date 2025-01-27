import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export interface ImageComparator {
    compare(
        received: Buffer,
        snapshot: Buffer,
        options: { threshold: number },
    ): {
        diffCount: number;
        diffImage?: Buffer;
    };
}

export class PNGComparator implements ImageComparator {
    compare(received: Buffer, snapshot: Buffer, options: { threshold: number }) {
        const receivedImage = PNG.sync.read(received);
        const snapshotImage = PNG.sync.read(snapshot);
        const diffImage = new PNG({ width: snapshotImage.width, height: snapshotImage.height });

        const diffCount = pixelmatch(
            receivedImage.data,
            snapshotImage.data,
            diffImage.data,
            snapshotImage.width,
            snapshotImage.height,
            { threshold: options.threshold },
        );

        return {
            diffCount,
            diffImage: diffCount > 0 ? this.composeDiffImage(diffImage, receivedImage, snapshotImage) : undefined,
        };
    }

    private composeDiffImage(diffImage: PNG, receivedImage: PNG, snapshotImage: PNG): Buffer {
        const width = snapshotImage.width;
        const height = snapshotImage.height;

        const comparisonImage = new PNG({ width: width * 3, height });

        [snapshotImage, diffImage, receivedImage].forEach((image, index) => {
            const x = index * width;
            const y = 0;

            PNG.bitblt(image, comparisonImage, 0, 0, width, height, x, y);
        });

        return PNG.sync.write(comparisonImage, { filterType: 4 });
    }
}
