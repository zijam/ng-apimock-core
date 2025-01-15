import * as path from 'path';

import { injectable } from 'inversify';

@injectable()
export class FileLoader {
    async loadFile(filePath: string): Promise<any> {
        const requireFilePath = path.relative(path.resolve(__dirname), path.resolve(filePath));
        return import(requireFilePath);
    }
}
