export interface IConfigDefaultsContexts {
    default: string
    error: string
}

export interface IConfigDefaultsRender {
    properties: Record<string, string>
}

export interface IConfigDefaults {
    contexts: IConfigDefaultsContexts
    render: IConfigDefaultsRender
}

export type IConfigHelpersTypes = string | { name: string; args: Record<string, unknown> }

export interface IConfigHelpers {
    context: IConfigHelpersTypes
    request: IConfigHelpersTypes
}

export interface IConfig {
    defaults: IConfigDefaults
    helpers: IConfigHelpers
}
