import type { ILogicCall } from './ILogicCall.js'

export interface ILogicClass extends ILogicCall {
    constructor: () => ILogicClass
}
