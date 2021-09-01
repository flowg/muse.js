/**
 * Internal imports
 */
import { AvatarClass } from './apollo-avatar';

console.log( 'AVATARS_RELATIONSHIPS' );

/**
 * TypeScript entities and constants
 */
export type AvatarImport = () => Promise<AvatarClass>;

export const AVATARS_RELATIONSHIPS: Record<string, AvatarImport[]> = {
    Apollo: [
        () => import('./apollo-for-app-creation').then( module => module.ApolloForAppCreation )
    ]
};
