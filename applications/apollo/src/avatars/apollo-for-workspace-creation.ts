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
export const PLUGGABLE_QUESTION = 'workspaceComposition';

export class ApolloForWorkspaceCreation extends ApolloAvatar {
    static readonly trigger: AvatarTrigger = {
        question: A_PLUGGABLE_QUESTION,
        answer: {
            name: 'workspaceCreation',
            message: 'Create a new workspace'
        }
    };
    protected questions: Record<string, Question> = {
        [PLUGGABLE_QUESTION]: {
            type: 'multiselect',
            name: PLUGGABLE_QUESTION,
            message: 'What kind(s) of application would you like to add to your workspace ?',
            choices: []
        },
        'workspaceName': {
            type: 'input',
            name: 'workspaceName',
            message: 'How would you like to call your new workspace ?'
        }
    };

    protected async getSummoned(): Promise<void> {
        await this.askThisQuestion( PLUGGABLE_QUESTION );
        await this.askThisQuestion( 'workspaceName' );

        const workspaceName: string = this.oracle.usersWishes['workspaceName'] as string;
        const args: string[] = [
            'create-nx-workspace',
            `--name="${workspaceName}"`,
            `--preset="empty"`,
            `--nxCloud=false`
        ];
        this.oracle.addAFulfillmentStep(
            () => this.executeCommand(
                'npx',
                args
            )
        );
    }
}
