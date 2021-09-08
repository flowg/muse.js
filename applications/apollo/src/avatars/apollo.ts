/**
 * Internal imports
 */
import { Hermes } from 'tools/hermes';
import {
    ApolloAvatar,
    Question
} from './apollo-avatar';
import { Oracle } from '../oracle';

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

    constructor( private hermes: Hermes, protected oracle: Oracle ) {
        super( oracle );
        console.log('Inside constructor() for Apollo, AFTER super()')
    }

    protected async getSummoned(): Promise<void> {
        console.log('Inside getSummoned() for Apollo, before Hermes')
        this.hermes.introduceApollo();

        await this.askThisQuestion( PLUGGABLE_QUESTION );
        console.log('Inside getSummoned() for Apollo, AFTER askThisQuestion()')
    }
}
