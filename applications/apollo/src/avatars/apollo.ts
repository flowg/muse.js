/**
 * Internal imports
 */
import { Hermes } from 'tools/hermes';
import {
    ApolloAvatar,
    Question
} from './apollo-avatar';

/**
 * TypeScript entities and constants
 */
export const PLUGGABLE_QUESTION = 'workflowType';

export class Apollo extends ApolloAvatar {
    protected questions: Record<string, Question> = {
        [PLUGGABLE_QUESTION]: {
            type: 'select',
            name: PLUGGABLE_QUESTION,
            message: 'What would you like to do ?',
            choices: []
        }
    };

    constructor( private hermes: Hermes ) {
        super();
    }

    async getSummoned(): Promise<void> {
        this.hermes.introduceApollo();

        await this.askThisQuestion( PLUGGABLE_QUESTION );
    }
}
