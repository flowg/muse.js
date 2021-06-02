/**
 * Internal imports
 */
import { MinimalSchema } from 'packages/schemas';

/**
 * TypeScript entities and constants
 */
export enum NativeScriptAppType {
    ANGULAR = 'angular',
    VUE = 'vue',
    TYPESCRIPT = 'typescript',
    JAVASCRIPT = 'javascript'
}

export interface NativeScriptAppGeneratorSchema extends MinimalSchema{
    type: NativeScriptAppType;
}
