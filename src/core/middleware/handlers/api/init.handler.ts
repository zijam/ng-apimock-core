import * as http from 'http';

import debug from 'debug';
import { inject, injectable } from 'inversify';

import { Configuration } from '../../../configuration';
import { HttpHeaders, HttpMethods, HttpStatusCode } from '../../http';
import { ApplicableHandler } from '../handler';

export const log = debug('ng-apimock:handler-init');

/**  Init handler. */
@injectable()
export class InitHandler implements ApplicableHandler {
    /**
   * Constructor.
   * @param {Configuration} configuration The configuration.
   */
    constructor(
    @inject('Configuration') private readonly configuration: Configuration
    ) {}

    /** {@inheritDoc}. */
    handle(
        _request: http.IncomingMessage,
        response: http.ServerResponse,
        _next: Function,
        _params: { id: string }
    ): void {
        log('Initialize');
        response.writeHead(
            HttpStatusCode.OK,
            HttpHeaders.CONTENT_TYPE_APPLICATION_JSON
        );
        response.end();
    }

    /** {@inheritDoc}. */
    isApplicable(request: http.IncomingMessage): boolean {
        const urlMatches = request.url.startsWith(
            `${this.configuration.middleware.basePath}/init`
        );
        const methodMatches = request.method === HttpMethods.GET;
        return urlMatches && methodMatches;
    }
}
