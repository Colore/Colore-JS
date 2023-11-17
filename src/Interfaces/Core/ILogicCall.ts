import { type IRequestAdapter } from '../Adapters/IRequestAdapter'

export type ILogicCall = Record<string, (requestObject: IRequestAdapter) => unknown>
