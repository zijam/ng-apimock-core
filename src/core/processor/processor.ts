import * as chokidar from 'chokidar';
import * as fs from 'fs-extra';
import { inject, injectable } from 'inversify';

import { State } from '../state/state';

import { MocksProcessor } from './mocks.processor';
import { PresetsProcessor } from './presets.processor';
import {
    DefaultProcessingOptions,
    GeneratedProcessingOptions,
    ProcessingOptions
} from './processing.options';

/** Mocks processor. */
@injectable()
export class Processor {
    private readonly processingOptions: ProcessingOptions;
    /**
     * Constructor.
     * @param {MocksProcessor} mocksProcessor The mocks processor.
     * @param {PresetsProcessor} presetsProcessor The presets processor.
     */
    constructor(
@inject('MocksProcessor') public mocksProcessor: MocksProcessor,
                @inject('State') private readonly state: State,
                @inject('PresetsProcessor') public presetsProcessor: PresetsProcessor
    ) {
    }

    /**
     * Initialize apimock by:
     * - processing all the available mocks.
     * - processing all the available presets.
     * @param {ProcessingOptions} options The processing options.
     */
    async process(options: ProcessingOptions): Promise<void> {
        const opts = this.getMergedOptions(options);
        this.state.setProcessingOptions(opts);
        await this.mocksProcessor.process(opts);
        await this.presetsProcessor.process(opts);

        fs.ensureDirSync(GeneratedProcessingOptions.src);
        this.presetsProcessor.process(GeneratedProcessingOptions);

        if (opts.watch) {
            const mocks = opts.watches?.mocks || opts.patterns?.mocks;
            chokidar.watch(Array.isArray(mocks)
                ? mocks.map((m) => `${opts.src}/${m}`)
                : `${opts.src}/${opts.watches?.mocks || opts.patterns.mocks}`, {
                ignoreInitial: true,
                usePolling: true,
                interval: 2000
            }).on('all', async () => this.mocksProcessor.process(opts));
            chokidar.watch(`${opts.src}/${opts.watches?.presets || opts.patterns.presets}`, {
                ignoreInitial: true,
                usePolling: true,
                interval: 2000
            }).on('all', () => this.presetsProcessor.process(opts));
        }

        chokidar.watch(`${GeneratedProcessingOptions.src}/${GeneratedProcessingOptions.patterns.presets}`, {
            ignoreInitial: true,
            usePolling: true,
            interval: 2000
        }).on('all', () => this.presetsProcessor.process(opts));
    }

    /**
     * Gets the merged options.
     * @param {ProcessingOptions} options The options.
     * @returns {ProcessingOptions} mergedOptions The merged options.
     */
    private getMergedOptions(options: ProcessingOptions): ProcessingOptions {
        return { ...DefaultProcessingOptions, ...options };
    }

    getProcessingOptions() {
        return this.processingOptions;
    }
}
