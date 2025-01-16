import * as path from 'path';

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
    fixture?: () => {} | [{}]
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
