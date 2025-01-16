import { IncomingMessage } from 'node:http';

import * as http from '../middleware/http';

import { MockResponseThenClause } from './mock.response.then.clause';

export interface HTTPError extends Error {
    status: typeof http.HttpStatusCode | number;
    message: string;
}

/** Mock response. */
export interface MockResponse{
    // response status code (default: 200)
    status?: number;
    // response data
    data?: {} | [{}];
    // response as file
    file?: string;
    // response callback
    callback?: (fixture: any, request: IncomingMessage) =>
        {} | [{}] | HTTPError;
    // response headers
    headers?: { [key: string]: string };
    // response status text
    statusText?: string;
    // indicates this response is the default response
    default?: boolean;
    // chainable response
    then?: MockResponseThenClause;
    // override delay for the mock
    delay?: number;
}
