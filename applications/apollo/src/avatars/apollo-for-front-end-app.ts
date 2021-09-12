/**
 * Internal imports
 */
import {
    ApolloAvatar,
    AvatarTrigger,
    Question
} from './apollo-avatar';
import { PLUGGABLE_QUESTION as A4PC_PLUGGABLE_QUESTION } from './apollo-for-workspace-creation';

export class ApolloForFrontEndApp extends ApolloAvatar {
    static readonly trigger: AvatarTrigger = {
        question: A4PC_PLUGGABLE_QUESTION,
        answer: {
            name: 'frontEndApp',
            message: 'Add a new Front-End application'
        }
    };
    protected questions: Record<string, Question> = {
        'frontEndAppType': {
            type: 'select',
            name: 'frontEndAppType',
            message: 'What kind of Front-End application would you like to create ?',
            choices: [
                {
                    name: 'angularSls',
                    message: 'An Angular application, served via AWS Lambda'
                },
                {
                    name: 'angular',
                    message: 'An Angular application'
                }
            ]
        },
        'frontEndAppName': {
            type: 'input',
            name: 'frontEndAppName',
            message: 'How would you like to call your new Front-End app ?',
            initial: () => {
                return this.oracle.usersWishes['workspaceName'] + '-web';
            }
        }
    };

    protected async getSummoned(): Promise<void> {
        await this.askThisQuestion( 'frontEndAppType' );
        await this.askThisQuestion( 'frontEndAppName' );
    }
}
