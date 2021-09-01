/**
 * Internal imports
 */
import { AvatarClass } from './apollo-avatar';

/**
 * TypeScript entities and constants
 */
export type AvatarImport = () => Promise<AvatarClass>;

export const AVATARS_RELATIONSHIPS: Record<string, AvatarImport[]> = {
    Apollo: [
        () => import('./apollo-for-project-creation').then( module => module.ApolloForProjectCreation )
    ]
};
