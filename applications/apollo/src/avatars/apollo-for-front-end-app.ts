/**
 * Internal imports
 */
import {
    ApolloAvatar,
    AvatarTrigger
} from './apollo-avatar';
import { PLUGGABLE_QUESTION as A4PC_PLUGGABLE_QUESTION } from './apollo-for-project-creation';

export class ApolloForFrontEndApp extends ApolloAvatar {
    static readonly trigger: AvatarTrigger = {
        question: A4PC_PLUGGABLE_QUESTION,
        answer: {
            name: 'frontEndApp',
            message: 'Create a new Front-End application'
        }
    }

    async getSummoned(): Promise<void> {
        console.log('ApolloForFrontEndApp is being summoned !!!')
    }
}
