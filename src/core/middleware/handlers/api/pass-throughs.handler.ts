import * as http from 'http';

import debug from 'debug';
import { inject, injectable } from 'inversify';

import { Configuration } from '../../../configuration';
import { State } from '../../../state/state';
import { HttpHeaders, HttpStatusCode } from '../../http';
import { ApplicableHandler } from '../handler';

export const log = debug('ng-apimock:handler-pass-throughs');

/**  Pass throughs handler. */
@injectable()
export class PassThroughsHandler implements ApplicableHandler {
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
        log('Set to passThroughs');
        this.state.setToPassThroughs(params.id);
        response.writeHead(HttpStatusCode.OK, HttpHeaders.CONTENT_TYPE_APPLICATION_JSON);
        response.end();
    }

    /** {@inheritDoc}. */
    isApplicable(request: http.IncomingMessage, body: any): boolean {
        const urlMatches = request.url.startsWith(`${this.configuration.middleware.basePath}/actions`);
        const actionMatches = body !== undefined && body.action === 'passThroughs';
        return urlMatches && actionMatches;
    }
}
