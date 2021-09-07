/**
 * Internal imports
 */
import { PLUGGABLE_QUESTION as A_PLUGGABLE_QUESTION } from './apollo';
import {
    ApolloAvatar,
    AvatarTrigger,
    Question
} from './apollo-avatar';

/**
 * TypeScript entities and constants
 */
export const PLUGGABLE_QUESTION = 'projectType';

export class ApolloForProjectCreation extends ApolloAvatar {
    static readonly trigger: AvatarTrigger = {
        question: A_PLUGGABLE_QUESTION,
        answer: {
            name: 'projectCreation',
            message: 'Create a new project in a new workspace'
        }
    };
    protected questions: Record<string, Question> = {
        [PLUGGABLE_QUESTION]: {
            type: 'select',
            name: PLUGGABLE_QUESTION,
            message: 'What kind of project would you like to create ?',
            choices: []
        },
        'projectName': {
            type: 'input',
            name: 'projectName',
            message: 'How would you like to call your new project ?'
        }
    };

    async getSummoned(): Promise<void> {
        console.log( 'ApolloForProjectCreation is being summoned !!!' );
        await this.askThisQuestion( PLUGGABLE_QUESTION );
        await this.askThisQuestion( 'projectName' );

        const projectName: string = this.oracle.usersWishes['projectName'] as string;
        const args: string[] = [
            'create-nx-workspace',
            `--name="${projectName}"`,
            `--preset="empty"`,
            `--nxCloud=false`
        ];
        this.oracle.addAFulfillmentStep( { command: 'npx', args } );
    }
}
