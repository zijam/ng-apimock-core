import * as http from 'http';

import { NextHandleFunction } from 'connect';
import { inject, injectable } from 'inversify';

import { Configuration } from '../configuration';
import { Mock } from '../mock/mock';
import { State } from '../state/state';

import { AddMockScenarioToPresetHandler } from './handlers/api/add-mockscenario-to-preset.handler';
import { CreateMockHandler } from './handlers/api/create-mock.handler';
import { CreatePresetHandler } from './handlers/api/create-preset.handler';
import { DefaultsHandler } from './handlers/api/defaults.handler';
import { DeleteVariableHandler } from './handlers/api/delete-variable.handler';
import { GetMocksHandler } from './handlers/api/get-mocks.handler';
import { GetPresetsHandler } from './handlers/api/get-presets.handler';
import { GetRecordedResponseHandler } from './handlers/api/get-recorded-response.handler';
import { GetRecordingsHandler } from './handlers/api/get-recordings.handler';
import { GetVariablesHandler } from './handlers/api/get-variables.handler';
import { HealthHandler } from './handlers/api/health.handler';
import { InformationHandler } from './handlers/api/information.handler';
import { InitHandler } from './handlers/api/init.handler';
import { PassThroughsHandler } from './handlers/api/pass-throughs.handler';
import { RecordHandler } from './handlers/api/record.handler';
import { SelectPresetHandler } from './handlers/api/select-preset.handler';
import { SetVariableHandler } from './handlers/api/set-variable.handler';
import { StateHandler } from './handlers/api/state.handler';
import { UpdateMocksHandler } from './handlers/api/update-mocks.handler';
import { ApplicableHandler } from './handlers/handler';
import { EchoRequestHandler } from './handlers/mock/echo.request.handler';
import { MockRequestHandler } from './handlers/mock/mock.request.handler';
import { RecordResponseHandler } from './handlers/mock/record.response.handler';

/** Middleware. */
@injectable()
export class Middleware {
    /**
     * Constructor
     * @param {AddMockScenarioToPresetHandler} addMockToPresetHandler The add mock to preset handler.
     * @param {Configuration} configuration The configuration object.
     * @param {CreateMockHandler} createMockHandler The create mocks handler.
     * @param {CreatePresetHandler} createPresetHandler The create presets handler.
     * @param {DefaultsHandler} defaultsHandler The defaults handler.
     * @param {DeleteVariableHandler} deleteVariableHandler The delete variables handler.
     * @param {EchoRequestHandler} echoRequestHandler The echo request handler.
     * @param {GetMocksHandler} getMocksHandler The get mocks handler.
     * @param {GetPresetsHandler} getPresetsHandler The get presets handler.
     * @param {GetRecordingsHandler} getRecordingsHandler The get recordings handler.
     * @param {GetRecordedResponseHandler} getRecordedResponseHandler The get recorded response handler.
     * @param {GetVariablesHandler} getVariablesHandler The get variables handler.
     * @param {HealthHandler} healthHandler The health handler.
     * @param {InformationHandler} informationHandler The information handler.
     * @param {InitHandler} initHandler The init handler.
     * @param {NextHandleFunction} jsonBodyParser The body parser that is responsible for parsing application/json.
     * @param {NextHandleFunction} urlEncodedBodyParser The body parser that is responsible for parsing application/x-www-form-urlencoded.
     * @param {NextHandleFunction} textBodyParser The body parser that is responsible for parsing text/*.
     * @param {MockRequestHandler} mockRequestHandler The mock request handler.
     * @param {PassThroughsHandler} passThroughsHandler The pass throughs handler.
     * @param {RecordHandler} recordHandler The record handler.
     * @param {RecordResponseHandler} recordResponseHandler The record response handler.
     * @param {SelectPresetHandler} selectPresetHandler The set preset handler.
     * @param {SetVariableHandler} setVariableHandler The set variables handler.
     * @param {State} apimockState The apimock state.
     * @param {UpdateMocksHandler} updateMocksHandler The update mocks handler.
     */
    constructor(
@inject('Configuration') private readonly configuration: Configuration,
                @inject('JsonBodyParser') private readonly jsonBodyParser: NextHandleFunction,
                @inject('UrlEncodedBodyParser') private readonly urlEncodedBodyParser: NextHandleFunction,
                @inject('TextBodyParser') private readonly textBodyParser: NextHandleFunction,
                @inject('State') private readonly apimockState: State,
                @inject('AddMockScenarioToPresetHandler') private readonly addMockToPresetHandler: AddMockScenarioToPresetHandler,
                @inject('CreateMockHandler') private readonly createMockHandler: CreateMockHandler,
                @inject('CreatePresetHandler') private readonly createPresetHandler: CreatePresetHandler,
                @inject('DefaultsHandler') private readonly defaultsHandler: DefaultsHandler,
                @inject('DeleteVariableHandler') private readonly deleteVariableHandler: DeleteVariableHandler,
                @inject('EchoRequestHandler') private readonly echoRequestHandler: EchoRequestHandler,
                @inject('GetMocksHandler') private readonly getMocksHandler: GetMocksHandler,
                @inject('GetPresetsHandler') private readonly getPresetsHandler: GetPresetsHandler,
                @inject('GetRecordingsHandler') private readonly getRecordingsHandler: GetRecordingsHandler,
                @inject('GetRecordedResponseHandler') private readonly getRecordedResponseHandler: GetRecordedResponseHandler,
                @inject('GetVariablesHandler') private readonly getVariablesHandler: GetVariablesHandler,
                @inject('HealthHandler') private readonly healthHandler: HealthHandler,
                @inject('InformationHandler') private readonly informationHandler: InformationHandler,
                @inject('InitHandler') private readonly initHandler: InitHandler,
                @inject('MockRequestHandler') private readonly mockRequestHandler: MockRequestHandler,
                @inject('PassThroughsHandler') private readonly passThroughsHandler: PassThroughsHandler,
                @inject('RecordHandler') private readonly recordHandler: RecordHandler,
                @inject('RecordResponseHandler') private readonly recordResponseHandler: RecordResponseHandler,
                @inject('SelectPresetHandler') private readonly selectPresetHandler: SelectPresetHandler,
                @inject('SetVariableHandler') private readonly setVariableHandler: SetVariableHandler,
                @inject('StateHandler') private readonly stateHandler: StateHandler,
                @inject('UpdateMocksHandler') private readonly updateMocksHandler: UpdateMocksHandler,
    ) {
        this.handlers = [
            addMockToPresetHandler,
            createMockHandler,
            createPresetHandler,
            defaultsHandler,
            deleteVariableHandler,
            getMocksHandler,
            getPresetsHandler,
            getRecordingsHandler,
            getRecordedResponseHandler,
            getVariablesHandler,
            healthHandler,
            informationHandler,
            initHandler,
            passThroughsHandler,
            recordHandler,
            setVariableHandler,
            selectPresetHandler,
            stateHandler,
            updateMocksHandler
        ];
    }

    private readonly handlers: ApplicableHandler[];

    /**
     * Apimock Middleware.
     * @param {http.IncomingMessage} request The request.
     * @param {http.ServerResponse} response The response.
     * @param {Function} next The next callback function.
     */
    middleware(request: http.IncomingMessage, response: http.ServerResponse, next: Function): void {
        const apimockId: string = this.getApimockId(request.headers);

        this.jsonBodyParser(request, response, () => {
            this.urlEncodedBodyParser(request, response, () => {
                this.textBodyParser(request, response, () => {
                    const { body } = request as any;
                    const handler = this.getMatchingApplicableHandler(request, body);
                    if (handler !== undefined) {
                        handler.handle(request, response, next, { id: apimockId, body });
                    } else {
                        const matchingMock: Mock = this.apimockState.getMatchingMock(request.url, request.method, request.headers, body);
                        if (matchingMock !== undefined) {
                            this.echoRequestHandler.handle(request, response, next, {
                                id: apimockId,
                                mock: matchingMock,
                                body
                            });
                            const matchingState = this.apimockState.getMatchingState(apimockId);
                            if (matchingState.record && request.headers.record === undefined) {
                                this.recordResponseHandler.handle(request, response, next, {
                                    id: apimockId,
                                    mock: matchingMock,
                                    body
                                });
                            } else {
                                this.mockRequestHandler.handle(request, response, next, {
                                    id: apimockId,
                                    mock: matchingMock
                                });
                            }
                        } else {
                            next();
                        }
                    }
                });
            });
        });
    }

    /**
     * Get the applicable handler.
     * @param {http.IncomingMessage} request The request.
     * @param body The body.
     * @return {ApplicableHandler} handler The applicable handler.
     */
    getMatchingApplicableHandler(request: http.IncomingMessage, body: any): ApplicableHandler {
        return this.handlers.find((handler: ApplicableHandler) => handler.isApplicable(request, body));
    }

    /**
     * Get the apimockId from the given cookies.
     * @param headers The headers.
     * @returns {string} id The apimock id.
     */
    getApimockId(headers: http.IncomingHttpHeaders): string {
        return this.configuration.middleware.useHeader
            ? this.getApimockIdFromHeader(headers)
            : this.getApimockIdFromCookie(headers);
    }

    /**
     * Gets the apimock identifier from the header.
     * @param { http.IncomingHttpHeaders} headers The headers.
     * @return {string} identifier The identifier.
     */
    getApimockIdFromHeader(headers: http.IncomingHttpHeaders): string {
        return headers[this.configuration.middleware.identifier] as string;
    }

    /**
     * Gets the apimock identifier from the cookie.
     * @param { http.IncomingHttpHeaders} headers The headers.
     * @return {string} identifier The identifier.
     */
    getApimockIdFromCookie(headers: http.IncomingHttpHeaders): string {
        return headers.cookie
            .split(';')
            .map((cookie) => {
                const parts = cookie.split('=');
                return {
                    key: parts.shift().trim(),
                    value: decodeURI(parts.join('='))
                };
            })
            .filter((cookie: { key: string, value: string }) => cookie.key === this.configuration.middleware.identifier)
            .map((cookie: { key: string, value: string }) => cookie.value)[0];
    }
}
