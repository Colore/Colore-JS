import type { IRequestAdapter } from '../Adapters/IRequestAdapter.js'

export interface IRenderProvider {
    dispatch: (cro: IRequestAdapter) => void
}
