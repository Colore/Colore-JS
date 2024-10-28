import type { IRequestAdapter } from '../Adapters/IRequestAdapter.js'

export type ILogicCall = Record<string, (requestObject: IRequestAdapter) => unknown>
