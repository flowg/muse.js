/**
 * Node.js imports
 */
import {
    exec,
    ExecException,
    spawn,
    spawnSync
} from 'child_process';
import path from 'path';
import { writeFileSync } from 'fs';

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

/**
 * TypeScript entities and constants
 */
export type AvatarClass = typeof ApolloAvatar;
type NewableAvatarClass = new () => ApolloAvatar;

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
    protected questions: Record<string, Question> = {};
    protected triggers: Record<string, AvatarClass> = {};
    static readonly trigger: AvatarTrigger;

    constructor() {
        this.linkAvatars().then( () => this.getSummoned() );
    }

    private async linkAvatars(): Promise<void> {
        const avatars2LinkWith: AvatarImport[] = AVATARS_RELATIONSHIPS[this.constructor.name];

        if ( avatars2LinkWith ) {
            await Promise.all(
                avatars2LinkWith.map( ( avatarImport: AvatarImport ) => this.linkAvatar( avatarImport ) )
            );
        }
    }

    private async linkAvatar( avatarImport: AvatarImport ): Promise<void> {
        const avatarClass: AvatarClass = await avatarImport();
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

        console.log( answer );

        // TODO: Always save the answer to the shared state in the Oracle, THEN check for triggers
        // Checking first if the provided answer is a trigger
        const avatarClass: NewableAvatarClass = (this.triggers[answer[questionId]] as unknown) as NewableAvatarClass;
        if ( avatarClass ) {
            new avatarClass();
        }
    }

    protected executeCommand( command: string, cwd: string ): void {
        const ls = spawnSync( 'npx', [ 'create-nx-workspace' ], { stdio: 'inherit' } );

        console.log( `child process errored with error ${ls.error}` );

        console.log( `child process exited with code ${ls.status}` );
    }

    abstract getSummoned(): Promise<void>;
}
