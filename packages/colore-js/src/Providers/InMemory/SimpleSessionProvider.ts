import { v4 as uuidv4 } from 'uuid'
import { Logger } from '../../Logger.js'

interface SessionStore {
    data: Record<string, unknown>
    expiry: number
}

type SessionsStore = Record<string, SessionStore>

/**
 * Simple session provider
 *
 * @public
 */
export class SimpleSessionProvider {
    protected static gcInterval = 900
    protected static gcLastRun = 0

    protected static sessions: SessionsStore = {}

    private readonly sessionId: string

    private constructor(sessionId?: string) {
        sessionId = sessionId ?? uuidv4()

        if (!Object.keys(SimpleSessionProvider.sessions).includes(sessionId)) {
            SimpleSessionProvider.sessions[sessionId] = {
                data: {},
                expiry: SimpleSessionProvider.gcInterval + Date.now()
            }
        }

        this.sessionId = sessionId
    }

    public static getSession(sessionId?: string): SimpleSessionProvider {
        Logger.debug('sessionId: %s', sessionId ?? 'null')

        if (SimpleSessionProvider.gcLastRun < Date.now()) {
            SimpleSessionProvider.gcLastRun += SimpleSessionProvider.gcInterval
            SimpleSessionProvider.runGC()
        }

        return new SimpleSessionProvider(sessionId)
    }

    protected static runGC(): void {
        const runTime = Date.now()

        Object.entries(SimpleSessionProvider.sessions).forEach(([sessionId, sessionStore]) => {
            if (sessionStore.expiry < runTime) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete SimpleSessionProvider.sessions[sessionId]
            }
        })
    }

    public getSessionId(): string {
        return this.sessionId
    }

    public get(sessionVariable: string): unknown {
        return SimpleSessionProvider.sessions[this.sessionId].data[sessionVariable]
    }

    public set(sessionVariable: string, sessionVariableValue: unknown): void {
        SimpleSessionProvider.sessions[this.sessionId].data[sessionVariable] = sessionVariableValue
    }

    public has(sessionVariable: string): boolean {
        return SimpleSessionProvider.sessions[this.sessionId].data[sessionVariable] != null
    }

    public delete(sessionVariable: string): void {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete SimpleSessionProvider.sessions[this.sessionId].data[sessionVariable]
    }
}
