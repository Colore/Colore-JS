import { Logger, type IRequestAdapter } from '@colore/colore-js'

/**
 * The JokeExample class is an example class for remote calls.
 */
export class JokeExample {
    private readonly jokes = [
        `A programmer was found dead in the shower. The instructions read: lather, rise, repeat`,
        `!false - it's funny because it's true!`,
        `Why did the programmer quit his job? Because he couldn't get arrays...`,
        `A programmer's wife tells him "go to the store and get a gallon of milk, and if they have eggs, get a dozen". He returns with 13 gallons of milk`,
        `Why was the empty array stuck outside? It didn't have any keys`
    ]

    public randomJoke(requestObject: IRequestAdapter): void {
        const randomJoke = Math.floor(Math.random() * this.jokes.length)

        Logger.trace('randomJoke: %s', randomJoke)

        requestObject.setRenderProperty('joke', this.jokes[randomJoke])
    }

    public getJoke(requestObject: IRequestAdapter): void {
        let id = requestObject.getRequestArgument('id')

        if (id == null || Number.isNaN(id)) {
            id = Math.floor(Math.random() * this.jokes.length)
        }

        requestObject.setRenderProperty('joke', this.jokes[Number(id)])
    }
}

export default JokeExample
