export enum NativeScriptAppType {
    ANGULAR = 'angular',
    VUE = 'vue',
    TYPESCRIPT = 'typescript',
    JAVASCRIPT = 'javascript'
}

export interface NativeScriptAppGeneratorSchema {
    name: string;
    tags?: string;
    directory?: string;
    type: NativeScriptAppType;
}
