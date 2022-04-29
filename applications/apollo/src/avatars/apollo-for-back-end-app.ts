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
    NEST_SLS = 'nestSls',
    NEST = 'nest'
}

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

    private appType: AppType;
    private appName: string;
    private workspaceName: string;

    protected async getSummoned(): Promise<void> {
        await this.askThisQuestion( 'backEndAppType' );
        await this.askThisQuestion( 'backEndAppName' );

        this.appType = this.oracle.usersWishes['backEndAppType'] as AppType;
        this.appName = this.oracle.usersWishes['backEndAppName'] as string;
        this.workspaceName = this.oracle.usersWishes['workspaceName'] as string;

        this.installNxPlugins();
        this.createApp();
    }

    private installNxPlugins(): void {
        let plugins: string[];
        switch ( this.appType ) {
            case AppType.NEST_SLS:
                plugins = ['@nrwl/nest', '@muse.js/nest-sls'];
                break;
            case AppType.NEST:
                plugins = ['@nrwl/nest'];
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
            case AppType.NEST_SLS:
                plugin = '@muse.js/nest-sls';
                break;
            case AppType.NEST:
                plugin = '@nrwl/nest';
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
