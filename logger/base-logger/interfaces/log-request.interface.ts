export interface ILogRequest {
    body?: unknown;
    response?: unknown;
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    params?: Record<string, number | string>;
    query?: Record<string, string>;
    code?: number;
    runtime?: number;
}

export interface ILogInternalRequest extends ILogRequest {
    userIp?: string
}
