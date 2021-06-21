/**
 * 3rd-party imports
 */
import { MinimalSchema } from '@muse.js/mneme';

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
