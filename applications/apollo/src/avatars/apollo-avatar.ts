/**
 * Node.js imports
 */
import { spawnSync } from 'child_process';

/**
 * 3rd-party imports
 */
import { prompt } from 'enquirer';

/**
 * Internal imports
 */
import {
    AvatarImport,
    AVATARS_RELATIONSHIPS
} from './avatars-relationships';
import { Oracle } from '../oracle';

/**
 * TypeScript entities and constants
 */
export type AvatarClass = typeof ApolloAvatar;
type NewableAvatarClass = new ( oracle: Oracle ) => ApolloAvatar;

interface Answer {
    name: string;
    message: string;
    value?: string;
    hint?: string;
    disabled?: boolean;
}

export interface Question {
    name: string;
    type: string;
    message: string;
    choices?: Answer[];
}

export interface AvatarTrigger {
    question: string;
    answer: Answer;
}

const pluggableQuestionsTypes: string[] = [ 'select', 'multiselect' ];

export abstract class ApolloAvatar {
    static readonly trigger: AvatarTrigger;
    protected questions: Record<string, Question> = {};
    private triggers: Record<string, AvatarClass> = {};
    private avatars2Trigger: NewableAvatarClass[] = [];

    constructor( protected oracle: Oracle ) {
        /*
         * TODO: Change the whole system to an event-driven one, based on Observables + Subjects.
         *  Proposed events:
         *  - avatarsLinked
         *  - workCompleted
         *  - triggerNewAvatar
         *  - allAvatarsTriggered
         */
        console.log( 'Initializing ApolloAvatar for ' + this.constructor.name );
        this.linkAvatars().then(async () => {
            console.log( 'AFTER linkAvatars() for ' + this.constructor.name + ', before getSummoned()' );
            await this.getSummoned();
            console.log( 'AFTER linkAvatars() for ' + this.constructor.name + ', before checkingAvatars2Trigger()' );
            await this.checkingAvatars2Trigger();
            console.log( 'AFTER linkAvatars() for ' + this.constructor.name + ', AFTER checkingAvatars2Trigger()' );
        });
        console.log( 'Inside ApolloAvatar constructor() for ' + this.constructor.name + ', AFTER linkAvatars(), without await' );
    }

    private async linkAvatars(): Promise<void> {
        console.log( 'Inside linkAvatars() for ' + this.constructor.name );
        const avatars2LinkWith: AvatarImport[] = AVATARS_RELATIONSHIPS[this.constructor.name];

        if ( avatars2LinkWith ) {
            await Promise.all(
                avatars2LinkWith.map( ( avatarImport: AvatarImport ) => this.linkAvatar( avatarImport ) )
            );
        }
        console.log( 'LEAVING linkAvatars() for ' + this.constructor.name );
    }

    private async linkAvatar( avatarImport: AvatarImport ): Promise<void> {
        console.log( 'Inside linkAvatar() for ' + this.constructor.name + ', BEFORE importing' );
        const avatarClass: AvatarClass = await avatarImport();
        console.log( 'Inside linkAvatar() for ' + this.constructor.name + ', linking ' + avatarClass.name );
        this.registerTriggerFor( avatarClass );
    }

    private registerTriggerFor( avatarClass: AvatarClass ): void {
        // 1) Adding triggering answer to possible choices of a pluggable question
        const trigger: AvatarTrigger = avatarClass.trigger;
        const question2Enrich = this.questions[trigger.question];

        if ( pluggableQuestionsTypes.includes( question2Enrich.type ) && question2Enrich.choices ) {
            question2Enrich.choices = question2Enrich.choices.concat( trigger.answer );
        } else {
            throw new Error(
                `It seems '${trigger.question}', from ${this.constructor.name}, is not a valid pluggable question`
            );
        }

        // 2) Registering the fact that when this answer is selected, the consequence is the avatar's instantiation
        this.triggers[trigger.answer.name] = avatarClass;
    }

    private async checkingAvatars2Trigger(): Promise<void> {
        for ( const avatar2Trigger of this.avatars2Trigger ) {
            new avatar2Trigger( this.oracle );
        }
    }

    protected async askThisQuestion( questionId: string ): Promise<void> {
        const question2Ask: Question = this.questions[questionId];

        if ( !question2Ask ) {
            throw new Error( `It seems '${questionId}' is not a question from ${this.constructor.name}` );
        }

        const answer: Record<string, string | string[]> = await prompt( {
                                                                            ...question2Ask,
                                                                            format( providedValue: string | string[] ): string {
                                                                                let value2Display = '';

                                                                                switch ( question2Ask.type ) {
                                                                                    case 'input':
                                                                                        value2Display = providedValue as string;
                                                                                        break;
                                                                                    case 'select':
                                                                                        value2Display = question2Ask.choices.find(
                                                                                            ( choice: Answer ) => choice.name === providedValue
                                                                                        )?.message;
                                                                                        break;
                                                                                    case 'multiselect':
                                                                                        value2Display = question2Ask.choices.filter(
                                                                                            ( choice: Answer ) => providedValue.includes( choice.name )
                                                                                        ).map( ( choice: Answer ) => choice.message ).join( ', ' );
                                                                                        break;
                                                                                }

                                                                                return this.styles.primary( value2Display );
                                                                            }
                                                                        } );

        console.log( { answer } );

        // Saving the answer in the state shared by all avatars
        this.oracle.addAWish( answer );
        console.log( this.oracle.usersWishes );
        // Checking if the provided answer is a trigger for an avatar
        const answersIds: string[] = Array.isArray( answer[questionId] ) ? (answer[questionId] as string[]) : [ answer[questionId] as string ];
        for ( const answerId of answersIds ) {
            const avatarClass: NewableAvatarClass = (this.triggers[answerId] as unknown) as NewableAvatarClass;
            if ( avatarClass ) {
                this.avatars2Trigger.push( avatarClass );
            }
        }
    }

    // TODO: Check if cwd arg is really useful
    protected fulfillUsersWishes(): void {
        for ( const fulfillmentStep of this.oracle.fulfillmentSteps ) {
            const childProcess = spawnSync(
                fulfillmentStep.command,
                fulfillmentStep.args,
                { stdio: 'inherit', cwd: fulfillmentStep.cwd }
            );

            console.log( `child process errored with error ${childProcess.error}` );

            console.log( `child process exited with code ${childProcess.status}` );
        }
    }

    abstract getSummoned(): Promise<void>;
}
