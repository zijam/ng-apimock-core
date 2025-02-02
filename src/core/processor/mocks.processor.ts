import * as path from 'path';

import debug from 'debug';
import * as glob from 'glob';
import { inject, injectable } from 'inversify';

import { HttpHeaders, HttpStatusCode } from '../middleware/http';
import { Mock } from '../mock/mock';
import { State } from '../state/state';

import { FileLoader } from './file.loader';
import { ProcessingOptions } from './processing.options';

export const log = debug('ng-apimock:processor-mock');

/** Mocks processor. */
@injectable()
export class MocksProcessor {
    private readonly DEFAULT_DELAY = 0;
    private readonly DEFAULT_ECHO = false;
    private readonly PASS_THROUGH = 'passThrough';

    /**
     * Constructor.
     * @param {State} state The state.
     * @param {FileLoader} fileLoader The file loader.
     */
    constructor(@inject('State') public state: State, @inject('FileLoader') public fileLoader: FileLoader) {
    }

    /**
     * Initialize apimock by:
     * - processing the globs and processing all available mocks.
     * @param {ProcessingOptions} options The processing options.
     */
    async process(options: ProcessingOptions): Promise<void> {
        if (options.watches?.mocks) {
            // trigger deletion of files matching mock watches pattern from cache
            glob.sync(options.watches.mocks, {
                cwd: options.src,
                root: '/',
                nodir: true // prevents error if pattern matches a dir
            }).forEach((file) => {
                this.fileLoader.loadFile(path.join(options.src, file));
            });
        }

        let counter = 0;
        const { mocks, ignore } = options.patterns;

        await Promise.all(glob.sync(mocks, {
            cwd: options.src,
            root: '/',
            ignore
        }).map(async (file) => {
            const mockPath = path.join(options.src, file);
            const mock = await this.fileLoader.loadFile(mockPath) as Mock;
            const match = this.state.mocks.find((_mock: Mock) => _mock.name === mock.name);
            const index = this.state.mocks.indexOf(match);

            mock.path = path.dirname(mockPath);

            if (index > -1) { // exists so update mock
                log(`Mock with identifier '${mock.name}' already exists. Overwriting existing mock.`);
                this.state.mocks[index] = mock;
            } else { // add mock
                this.state.mocks.push(mock);
                counter++;
            }

            Object.keys(mock.responses).forEach((key) => {
                const response = mock.responses[key];
                if (response.status === undefined) {
                    response.status = HttpStatusCode.OK;
                }
                if (response.data === undefined) {
                    response.data = mock.isArray ? [] : {};
                }
                if (response.headers === undefined) {
                    response.headers = response.file !== undefined
                        ? HttpHeaders.CONTENT_TYPE_BINARY
                        : HttpHeaders.CONTENT_TYPE_APPLICATION_JSON;
                }
                return response;
            });

            const _default = Object.keys(mock.responses).find((key) => !!mock.responses[key].default);
            let state = {
                scenario: this.PASS_THROUGH,
                echo: this.DEFAULT_ECHO,
                delay: mock.delay || this.DEFAULT_DELAY,
                counter: 0
            };

            if (_default !== undefined) {
                state = {
                    scenario: _default,
                    echo: this.DEFAULT_ECHO,
                    delay: mock.delay || this.DEFAULT_DELAY,
                    counter: 0
                };
            }

            this.state.defaults[mock.name] = state;
            this.state.global.mocks[mock.name] = JSON.parse(JSON.stringify(state));
        }));

        log(`Processed ${counter} unique mocks.`);
    }
}
