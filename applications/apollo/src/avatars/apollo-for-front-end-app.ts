/**
 * Internal imports
 */
import {
    ApolloAvatar,
    AvatarTrigger,
    Question
} from './apollo-avatar';
import { PLUGGABLE_QUESTION as A4PC_PLUGGABLE_QUESTION } from './apollo-for-workspace-creation';

/**
 * TypeScript entities and constants
 */
const enum AppType {
    ANGULAR_SLS = 'angularSls',
    ANGULAR = 'angular'
}

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
                    name: AppType.ANGULAR_SLS,
                    message: 'An Angular application, served via AWS Lambda'
                },
                {
                    name: AppType.ANGULAR,
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

    private appType: AppType;
    private appName: string;
    private workspaceName: string;

    protected async getSummoned(): Promise<void> {
        await this.askThisQuestion( 'frontEndAppType' );
        await this.askThisQuestion( 'frontEndAppName' );

        this.appType = this.oracle.usersWishes['frontEndAppType'] as AppType;
        this.appName = this.oracle.usersWishes['frontEndAppName'] as string;
        this.workspaceName = this.oracle.usersWishes['workspaceName'] as string;

        this.installNxPlugins();
        this.createApp();
    }

    private installNxPlugins(): void {
        let plugins: string[];
        switch ( this.appType ) {
            case AppType.ANGULAR_SLS:
                plugins = ['@nrwl/angular', '@muse.js/ng-sls'];
                break;
            case AppType.ANGULAR:
                plugins = ['@nrwl/angular'];
                break;
        }
        this.oracle.addAFulfillmentStep(
            () => this.executeCommand(
                'npm',
                [ 'i', ...plugins ],
                './' + this.workspaceName
            )
        );
    }

    private createApp(): void {
        let plugin: string;
        switch ( this.appType ) {
            case AppType.ANGULAR_SLS:
                plugin = '@muse.js/ng-sls';
                break;
            case AppType.ANGULAR:
                plugin = '@nrwl/angular';
                break;
        }
        this.oracle.addAFulfillmentStep(
            () => this.executeCommand(
                'nx',
                ['generate', `${plugin}:app`, this.appName],
                './' + this.workspaceName
            )
        );
    }
}
