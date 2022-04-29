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
        () => import('./apollo-for-workspace-creation').then( module => module.ApolloForWorkspaceCreation )
    ],
    ApolloForWorkspaceCreation: [
        () => import('./apollo-for-front-end-app').then( module => module.ApolloForFrontEndApp ),
        () => import('./apollo-for-back-end-app').then( module => module.ApolloForBackEndApp )
    ]
};
