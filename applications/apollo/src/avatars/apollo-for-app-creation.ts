/**
 * 3rd-party imports
 */
import { prompt } from 'enquirer';

/**
 * Internal imports
 */
import { A_Q_WORKFLOW_TYPE } from './apollo';
import { ApolloAvatar } from './apollo-avatar';

export class ApolloForAppCreation extends ApolloAvatar {
    async askSomething(): Promise<void> {
        const response = await prompt( {
                                           type: 'input',
                                           name: 'username',
                                           message: 'What is your username?'
                                       } );

        console.log( response );
    }

    static getAnswersForPluggableQuestions(): Map<string, string[]> {
        const answers: Map<string, string[]> = new Map<string, string[]>();

        answers.set( A_Q_WORKFLOW_TYPE, [ '' ] );
        console.log('Hello !!!!!!!!!!!!!!')

        return answers;
    }
}
