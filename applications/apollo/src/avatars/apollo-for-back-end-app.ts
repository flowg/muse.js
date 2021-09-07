/**
 * Internal imports
 */
import {
    ApolloAvatar,
    AvatarTrigger
} from './apollo-avatar';
import { PLUGGABLE_QUESTION as A4PC_PLUGGABLE_QUESTION } from './apollo-for-project-creation';

export class ApolloForBackEndApp extends ApolloAvatar {
    static readonly trigger: AvatarTrigger = {
        question: A4PC_PLUGGABLE_QUESTION,
        answer: {
            name: 'backEndApp',
            message: 'Create a new Back-End application'
        }
    };

    async getSummoned(): Promise<void> {
        console.log( 'ApolloForBackEndApp is being summoned !!! About to call fulfillUsersWishes()' );

        // TODO: What happens if that avatar is not the last one ?
        // this.fulfillUsersWishes();
    }
}
