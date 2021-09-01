/**
 * 3rd-party imports
 */
import { prompt } from 'enquirer';

/**
 * Internal imports
 */
import { PLUGGABLE_QUESTION } from './apollo';
import {
    ApolloAvatar,
    AvatarTrigger
} from './apollo-avatar';

export class ApolloForProjectCreation extends ApolloAvatar {
    static readonly trigger: AvatarTrigger = {
        question: PLUGGABLE_QUESTION,
        answer: {
            name: 'A4PC_A_PROJECT_CREATION',
            message: 'Create a new project in a new workspace'
        }
    }

    async getSummoned(): Promise<void> {
        return undefined;
    }
}
