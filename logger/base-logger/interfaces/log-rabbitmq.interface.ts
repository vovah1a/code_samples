export default interface ILogRabbitmq {
    queue?: string;
    exchange?: string;
    routingKey?: string;
    runtime?: number;
    body?: unknown;
}
