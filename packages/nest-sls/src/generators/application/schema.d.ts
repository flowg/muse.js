/**
 * Nx imports
 */
import { Schema } from '@nrwl/nest/src/schematics/application/schema';

/**
 * Internal imports
 */
import { MinimalSchema } from 'packages/schemas';

/**
 * TypeScript entities and constants
 */
export interface NestSlsAppGeneratorSchema extends Schema, MinimalSchema {
}
