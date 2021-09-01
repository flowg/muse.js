/**
 * 3rd-party imports
 */
import { prompt } from 'enquirer';

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
export const PLUGGABLE_QUESTION = 'A_Q_WORKFLOW_TYPE';

export class Apollo extends ApolloAvatar {
    protected questions: Record<string, Question> = {
        [PLUGGABLE_QUESTION]: {
            type: 'select',
            name: PLUGGABLE_QUESTION,
            message: 'What would you like to do ?',
            choices: [ {
                name: 'APPLE',
                message: 'apple'
            }, {
                name: 'CHERRY',
                message: 'cherry'
            }, {
                name: 'watermelon',
                message: 'watermelon'
            } ]
        }
    };

    constructor( private hermes: Hermes ) {
        super();
    }

    async getSummoned(): Promise<void> {
        this.hermes.introduceApollo();

        const response = await prompt( this.questions[PLUGGABLE_QUESTION] );

        console.log( response );
    }
}
