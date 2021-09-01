/**
 * Internal imports
 */
import {
    AvatarImport,
    AVATARS_RELATIONSHIPS
} from './avatars-relationships';

/**
 * TypeScript entities and constants
 */
export type AvatarClass = typeof ApolloAvatar;

export class ApolloAvatar {
    constructor() {
        this.linkAvatars().then();
    }

    private async linkAvatars(): Promise<void> {
        const avatars2LinkWith: AvatarImport[] = AVATARS_RELATIONSHIPS[this.constructor.name];

        if(avatars2LinkWith) {
            for ( const avatarImport of avatars2LinkWith ) {
                this.linkAvatar(avatarImport);
            }
        }
    }

    private async linkAvatar(avatarImport: AvatarImport): Promise<void> {
        const avatarClass: AvatarClass = await avatarImport();
    }
}
