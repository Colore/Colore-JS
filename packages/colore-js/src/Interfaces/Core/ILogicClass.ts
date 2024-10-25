import { type IRequestAdapter } from '../Adapters/IRequestAdapter'

export interface ILogicClass extends Record<string, (cro: IRequestAdapter) => void> {
    constructor: () => ILogicClass
}
