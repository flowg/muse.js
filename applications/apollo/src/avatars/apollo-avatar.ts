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
import {
    FulfillmentStep,
    Oracle
} from '../oracle';

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

const pluggableQuestionsTypes: string[] = [ 'select' ];

export abstract class ApolloAvatar {
    static readonly trigger: AvatarTrigger;
    protected questions: Record<string, Question> = {};
    private triggers: Record<string, AvatarClass> = {};
    private avatars2Trigger: NewableAvatarClass[] = [];

    constructor( protected oracle: Oracle ) {
        console.log('Initializing ApolloAvatar for ' + this.constructor.name)
        this.initializeAvatar().then();
        console.log('Inside ApolloAvatar constructor() for ' + this.constructor.name + ', AFTER initializeAvatar(), without await')
    }

    private async initializeAvatar(): Promise<void> {
        console.log('Inside initializeAvatar() for ' + this.constructor.name + ', before linkAvatars()')
        await this.linkAvatars();
        console.log('Inside initializeAvatar() for ' + this.constructor.name + ', before getSummoned()')
        await this.getSummoned();
        console.log('Inside initializeAvatar() for ' + this.constructor.name + ', before checkingAvatars2Trigger()')
        await this.checkingAvatars2Trigger();
        console.log('Inside initializeAvatar() for ' + this.constructor.name + ', AFTER checkingAvatars2Trigger()')
    }

    private async linkAvatars(): Promise<void> {
        console.log('Inside linkAvatars() for ' + this.constructor.name )
        const avatars2LinkWith: AvatarImport[] = AVATARS_RELATIONSHIPS[this.constructor.name];

        if ( avatars2LinkWith ) {
            await Promise.all(
                avatars2LinkWith.map( ( avatarImport: AvatarImport ) => this.linkAvatar( avatarImport ) )
            );
        }
        console.log('LEAVING linkAvatars() for ' + this.constructor.name )
    }

    private async linkAvatar( avatarImport: AvatarImport ): Promise<void> {
        console.log('Inside linkAvatar() for ' + this.constructor.name + ', BEFORE importing')
        const avatarClass: AvatarClass = await avatarImport();
        console.log('Inside linkAvatar() for ' + this.constructor.name + ', linking ' + avatarClass.name)
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
        // TODO: Check what happens to the order of execution when there are more than one element in this array
        for ( const avatar2Trigger of this.avatars2Trigger ) {
            new avatar2Trigger( this.oracle );
        }
    }

    protected async askThisQuestion( questionId: string ): Promise<void> {
        const question2Ask: Question = this.questions[questionId];

        if ( !question2Ask ) {
            throw new Error( `It seems '${questionId}' is not a question from ${this.constructor.name}` );
        }

        const answer: Record<string, string> = await prompt( {
                                                                 ...question2Ask,
                                                                 format( providedValue: string ): string {
                                                                     let value2Display: string = providedValue;
                                                                     if ( question2Ask.choices ) {
                                                                         value2Display = question2Ask.choices.find(
                                                                             ( choice: Answer ) => choice.name === providedValue
                                                                         )?.message;
                                                                     }

                                                                     return this.styles.primary( value2Display );
                                                                 }
                                                             } );

        console.log( { answer } );

        // Saving the answer in the state shared by all avatars
        this.oracle.addAWish( answer );
        console.log( this.oracle.usersWishes );
        // Checking if the provided answer is a trigger for an avatar
        // TODO: Make sure it works for multiselect prompts
        const avatarClass: NewableAvatarClass = (this.triggers[answer[questionId]] as unknown) as NewableAvatarClass;
        if ( avatarClass ) {
            this.avatars2Trigger.push( avatarClass );
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
