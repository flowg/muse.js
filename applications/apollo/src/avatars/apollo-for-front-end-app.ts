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
                    name: 'angular',
                    message: 'An Angular application'
                },
                {
                    name: 'angularSls',
                    message: 'An Angular application, served via AWS Lambda'
                }
            ]
        },
        'frontEndAppName': {
            type: 'input',
            name: 'frontEndAppName',
            message: 'How would you like to call your new Front-End app ?'
        }
    };

    protected async getSummoned(): Promise<void> {
        console.log( 'ApolloForFrontEndApp is being summoned !!! About to call fulfillUsersWishes()' );
        await this.askThisQuestion( 'frontEndAppType' );
        await this.askThisQuestion( 'frontEndAppName' );
        // TODO: What happens if that avatar is not the last one ?
        // this.fulfillUsersWishes();
        console.log('LEAVING getSummoned')
    }
}
