import * as path from 'path';

import * as http from '../middleware/http';

export interface HTTPError extends Error {
    status: typeof http.HttpStatusCode | number;
    message: string;
}

export interface ProcessingOptions {
    src: string;
    patterns?: {
        mocks?: string | string[];
        presets?: string;
        ignore?: string | string[];
    };
    watches?: {
        mocks?: string | string[];
        presets?: string;
    };
    watch?: boolean;
    callbackOptions?: () => object | HTTPError
}

export const DefaultProcessingOptions = {
    patterns: {
        presets: '**/*.preset.json',
        mocks: '**/*.mock.json'
    }
};

export const GeneratedProcessingOptions = {
    src: path.join(process.cwd(), '.ngapimock', 'generated'),
    patterns: {
        presets: '**/*.preset.json',
        mocks: '**/*.mock.json'
    },
    watch: true
};
