import * as http from 'http';

import debug from 'debug';
import { inject, injectable } from 'inversify';

import { Configuration } from '../../../configuration';
import { State } from '../../../state/state';
import { HttpHeaders, HttpMethods, HttpStatusCode } from '../../http';
import { ApplicableHandler } from '../handler';

export const log = debug('ng-apimock:handler-delete-variable');

/**  Delete variable handler. */
@injectable()
export class DeleteVariableHandler implements ApplicableHandler {
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
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function, params: { id: string }): void {
        const state = this.state.getMatchingState(params.id);
        const { url } = request;
        const key = new RegExp(`${this.configuration.middleware.basePath}/variables/(.*)`).exec(url)[1];
        delete state.variables[key];

        log(`Delete variable: [${key}]`);
        response.writeHead(HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end();
    }

    /** {@inheritDoc}. */
    isApplicable(request: http.IncomingMessage): boolean {
        const methodMatches = request.method === HttpMethods.DELETE;
        const urlMatches = request.url.startsWith(`${this.configuration.middleware.basePath}/variables`);
        return urlMatches && methodMatches;
    }
}
