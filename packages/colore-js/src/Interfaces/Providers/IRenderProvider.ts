/**
 * @namespace Colore\Interfaces\Providers
 *
 * @use Colore\Interfaces\Adapters\IRequestAdapter
 */

import { type IRequestAdapter } from '../Adapters/IRequestAdapter'

export interface IRenderProvider {
    dispatch: (cro: IRequestAdapter) => void
}
