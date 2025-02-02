import * as http from 'http';

import debug from 'debug';
import { inject, injectable } from 'inversify';

import { Configuration } from '../../../configuration';
import { State } from '../../../state/state';
import { HttpHeaders, HttpMethods, HttpStatusCode } from '../../http';
import { ApplicableHandler } from '../handler';

export const log = debug('ng-apimock:handler-get-mocks');

/**  Get mocks handler. */
@injectable()
export class GetMocksHandler implements ApplicableHandler {
    /**
     * Constructor.
     * @param {Configuration} configuration The configuration.
     * @param {State} state The state.
     */
    constructor(
@inject('Configuration') private readonly configuration: Configuration,
                @inject('State') private readonly state: State
    ) {
    }

    /** {@inheritDoc}. */
    handle(_request: http.IncomingMessage, response: http.ServerResponse, _next: Function, params: { id: string }): void {
        log('Get mocks');
        const state = this.state.getMatchingState(params.id);
        const result: any = {
            state: state.mocks,
            mocks: this.state.mocks
                .map((mock) => ({
                    name: mock.name, request: mock.request, responses: Object.keys(mock.responses)
                }))
        };
        response.writeHead(HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end(JSON.stringify(result));
    }

    /** {@inheritDoc}. */
    isApplicable(request: http.IncomingMessage): boolean {
        const urlMatches = request.url.startsWith(`${this.configuration.middleware.basePath}/mocks`);
        const methodMatches = request.method === HttpMethods.GET;
        return urlMatches && methodMatches;
    }
}
