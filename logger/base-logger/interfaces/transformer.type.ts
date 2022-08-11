import LoggerData from '../logger.data';

type TTransformer = (arg: LoggerData<unknown, unknown>) => unknown

export default TTransformer;
