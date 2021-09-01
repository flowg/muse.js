/**
 * 3rd-party imports
 */
import { prompt } from 'enquirer';

/**
 * Internal imports
 */
import { Hermes } from 'tools/hermes';
import { ApolloAvatar } from './apollo-avatar';

console.log(  'Apollo')

export const A_Q_WORKFLOW_TYPE = 'A_Q_WORKFLOW_TYPE';

export class Apollo extends ApolloAvatar {
    private questions: Record<string, any> = {
        [A_Q_WORKFLOW_TYPE]: {
            type: 'select',
            name: A_Q_WORKFLOW_TYPE,
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
        // TODO: link all avatars here
        console.log( this.constructor.name );
    }

    async getSummoned(): Promise<void> {
        this.hermes.introduceApollo();

        const response = await prompt( this.questions[A_Q_WORKFLOW_TYPE] );

        console.log( response );
    }

    private registerTrigger4Avatar(): void {
    }
}
