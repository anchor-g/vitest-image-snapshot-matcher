import fs from 'fs';

export interface FileSystem {
    exists(path: string): boolean;
    readFile(path: string): Buffer | null;
    writeFile(path: string, content: Buffer): void;
    mkdirp(path: string): void;
}

export class NodeFileSystem implements FileSystem {
    exists(path: string): boolean {
        try {
            return fs.existsSync(path);
        } catch {
            return false;
        }
    }

    readFile(path: string): Buffer | null {
        try {
            return fs.readFileSync(path);
        } catch {
            return null;
        }
    }

    writeFile(path: string, content: Buffer): void {
        fs.writeFileSync(path, content, 'utf-8');
    }

    mkdirp(path: string): void {
        fs.mkdirSync(path, { recursive: true });
    }
}
