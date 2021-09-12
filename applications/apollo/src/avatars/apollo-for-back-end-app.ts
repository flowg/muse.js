/**
 * Internal imports
 */
import {
    ApolloAvatar,
    AvatarTrigger,
    Question
} from './apollo-avatar';
import { PLUGGABLE_QUESTION as A4PC_PLUGGABLE_QUESTION } from './apollo-for-workspace-creation';

export class ApolloForBackEndApp extends ApolloAvatar {
    static readonly trigger: AvatarTrigger = {
        question: A4PC_PLUGGABLE_QUESTION,
        answer: {
            name: 'backEndApp',
            message: 'Add a new Back-End application'
        }
    };
    protected questions: Record<string, Question> = {
        'backEndAppType': {
            type: 'select',
            name: 'backEndAppType',
            message: 'What kind of Back-End application would you like to create ?',
            choices: [
                {
                    name: 'nestSls',
                    message: 'A Nest application, served via AWS Lambda'
                },
                {
                    name: 'nest',
                    message: 'A Nest application'
                }
            ]
        },
        'backEndAppName': {
            type: 'input',
            name: 'backEndAppName',
            message: 'How would you like to call your new Back-End app ?',
            initial: () => {
                return this.oracle.usersWishes['workspaceName'] + '-api';
            }
        }
    };

    protected async getSummoned(): Promise<void> {
        await this.askThisQuestion( 'backEndAppType' );
        await this.askThisQuestion( 'backEndAppName' );
    }
}
