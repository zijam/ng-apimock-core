import * as http from 'http';

import debug from 'debug';
import { inject, injectable } from 'inversify';

import { Configuration } from '../../../configuration';
import { State } from '../../../state/state';
import { HttpHeaders, HttpMethods, HttpStatusCode } from '../../http';
import { ApplicableHandler } from '../handler';

export const log = debug('ng-apimock:handler-set-variable');

/**  Handler for a variables. */
@injectable()
export class SetVariableHandler implements ApplicableHandler {
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
    handle(request: http.IncomingMessage, response: http.ServerResponse, next: Function, params: {
        id: string, body: { [key: string]: any }
    }): void {
        const state = this.state.getMatchingState(params.id);
        const { body } = params;
        try {
            if (Object.keys(body).length > 0) {
                Object.keys(body).forEach((key) => {
                    state.variables[key] = body[key];
                    log(`Set variable [${key}]`);
                });
            } else {
                throw new Error('A variable should have a key and value');
            }
            response.writeHead(HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            response.end();
        } catch (e) {
            log(e.message);
            response.writeHead(HttpStatusCode.CONFLICT, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
            response.end(JSON.stringify(e, ['message']));
        }
    }

    /** {@inheritDoc}. */
    isApplicable(request: http.IncomingMessage): boolean {
        const methodMatches = request.method === HttpMethods.PUT;
        const urlMatches = request.url.startsWith(`${this.configuration.middleware.basePath}/variables`);
        return urlMatches && methodMatches;
    }
}
