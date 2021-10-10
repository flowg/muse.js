/**
 * Node.js imports
 */
import { spawnSync } from 'child_process';

/**
 * 3rd-party imports
 */
import { prompt } from 'enquirer';
import {
    BehaviorSubject,
    combineLatest,
    concatMap,
    filter,
    from,
    Observable,
    Subject,
    take,
    takeUntil,
} from 'rxjs';

/**
 * Internal imports
 */
import {
    AvatarImport,
    AVATARS_RELATIONSHIPS
} from './avatars-relationships';
import { Oracle } from '../oracle';
import { Hermes } from 'tools/hermes';

/**
 * TypeScript entities and constants
 */
export type AvatarClass = typeof ApolloAvatar;
type NewableAvatarClass = new ( hermes: Hermes, oracle: Oracle ) => ApolloAvatar;

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
    initial?: () => string | number | boolean;
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
    private triggeredAvatars: ApolloAvatar[] = [];

    /*
     * Events-related properties
     */
    private _initializationCompleted: Subject<void> = new Subject<void>();
    get initializationCompleted(): Observable<void> {
        return this._initializationCompleted.asObservable();
    }

    private _workCompleted: Subject<void> = new Subject<void>();
    get workCompleted(): Observable<void> {
        return this._workCompleted.asObservable();
    }

    private _triggerLinkedAvatar: Subject<NewableAvatarClass> = new Subject<NewableAvatarClass>();
    get triggerLinkedAvatar(): Observable<NewableAvatarClass> {
        return this._triggerLinkedAvatar.asObservable();
    }

    private noAvatar2Trigger: Subject<void> = new Subject<void>();

    private _avatarDone: BehaviorSubject<boolean> = new BehaviorSubject<boolean>( false );
    get avatarDone(): Observable<boolean> {
        return this._avatarDone.asObservable()
            .pipe(
                filter( ( isAvatarDone: boolean ) => isAvatarDone ),
                take( 1 )
            );
    }

    constructor( protected hermes: Hermes, protected oracle: Oracle ) {
        this.hermes.debug( 'Initializing ApolloAvatar for ' + this.constructor.name );

        // Instructing tha avatar how to react when certain events occur
        this.handleInitializationCompleted();
        this.handleWorkCompleted();

        this.linkAvatars();
        this.hermes.debug( 'LEAVING ApolloAvatar constructor() for ' + this.constructor.name );
    }

    private linkAvatars(): void {
        const avatars2LinkWith: AvatarImport[] = AVATARS_RELATIONSHIPS[this.constructor.name];

        if ( avatars2LinkWith ) {
            from( avatars2LinkWith ).pipe(
                concatMap( ( avatarImport: AvatarImport ) => from( avatarImport() ) )
            ).subscribe( {
                             next: ( avatarClass: AvatarClass ) => {
                                 this.hermes.debug( 'Inside linkAvatars() subscribe() for ' + this.constructor.name + ', linking ' + avatarClass.name );
                                 this.registerTriggerFor( avatarClass );
                             },
                             complete: () => {
                                 this.hermes.debug( 'Signaling INITIALIZATION COMPLETED for ' + this.constructor.name );
                                 this._initializationCompleted.next();
                             }
                         } );
        } else {
            this.hermes.debug( 'Signaling INITIALIZATION COMPLETED for ' + this.constructor.name + ' with 0 avatar to link' );
            /*
             * Necessary to make sure we have time enough to empty the stack
             * and therefore getting out of the constructors, so that the
             * avatars are instantiated properly when the handler for
             * initializationCompleted is run
             */
            setImmediate( () => this._initializationCompleted.next() );
        }
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

    /*******************************************************************************************************************\
     *                                                                                                                 *
     *                                               Events handling                                                   *
     *                                                                                                                 *
     \******************************************************************************************************************/

    private handleInitializationCompleted(): void {
        this.initializationCompleted
            .pipe( take( 1 ) )
            .subscribe( { next: () => this.onInitializationCompleted() } );
    }

    private async onInitializationCompleted(): Promise<void> {
        this.hermes.debug( 'On INITIALIZATION COMPLETED for ' + this.constructor.name + ', we call getSummoned' );
        await this.getSummoned();
        this.hermes.debug( 'Signaling WORK COMPLETED for ' + this.constructor.name );
        this._workCompleted.next();
    }

    private handleWorkCompleted(): void {
        this.workCompleted
            .pipe( take( 1 ) )
            .subscribe( { next: () => this.onWorkCompleted() } );
    }

    private onWorkCompleted(): void {
        this.hermes.debug( 'On WORK COMPLETED for ' + this.constructor.name + ', we check if there is an avatar to trigger' );
        if ( this.avatars2Trigger.length === 0 ) {
            this.hermes.debug( 'No avatar to trigger for ' + this.constructor.name + ', signaling this avatar is DONE' );
            this._avatarDone.next( true );
        } else {
            this.hermes.debug( 'At least one avatar 2 trigger, starting listening to TRIGGER LINKED AVATAR for ' + this.constructor.name );
            this.handleTriggerLinkedAvatar();
            this.checkingAvatar2Trigger();
        }
    }

    private handleTriggerLinkedAvatar(): void {
        this.triggerLinkedAvatar
            .pipe( takeUntil( this.noAvatar2Trigger ) )
            .subscribe( {
                            next: ( avatar2Trigger: NewableAvatarClass ) => this.onTriggerLinkedAvatar( avatar2Trigger )
                        } );
    }

    private onTriggerLinkedAvatar( avatar2Trigger: NewableAvatarClass ): void {
        this.hermes.debug( 'On TRIGGER LINKED AVATAR for ' + this.constructor.name + ', we instantiate ' + avatar2Trigger.name );
        const avatar: ApolloAvatar = new avatar2Trigger(
            this.hermes,
            this.oracle
        );
        this.triggeredAvatars.push( avatar );
        avatar.workCompleted
            .pipe( take( 1 ) )
            .subscribe( {
                            next: () => {
                                this.hermes.debug( 'On WORK COMPLETED for ' + avatar2Trigger.name + ', within ' + this.constructor.name );
                                this.checkingAvatar2Trigger();
                            }
                        } );
    }

    private checkingAvatar2Trigger(): void {
        const avatar2Trigger: NewableAvatarClass = this.avatars2Trigger.shift();
        if ( avatar2Trigger ) {
            this.hermes.debug( 'Signaling we need to TRIGGER ' + avatar2Trigger.name + ' for ' + this.constructor.name );
            this._triggerLinkedAvatar.next( avatar2Trigger );
        } else {
            /*
             * If we're here, then we know for sure that we've exhausted all avatars
             * that needed to be triggered AND that they've all completed their
             * work by now
             */
            this.hermes.debug( 'Signaling there is no need to listen to TRIGGER LINKED AVATAR anymore, for ' + this.constructor.name );
            this.noAvatar2Trigger.next();

            combineLatest(
                this.triggeredAvatars.map(
                    ( avatar: ApolloAvatar ) => avatar.avatarDone
                )
            ).subscribe( {
                             next: ( avatarsStatuses: boolean[] ) => {
                                 const allTriggeredAvatarsDone: boolean = avatarsStatuses.reduce(
                                     ( prev: boolean, cur: boolean ) => prev && cur,
                                     true
                                 );
                                 this.hermes.debug( 'All triggered avatars for ' + this.constructor.name + ' are now DONE' );
                                 if ( allTriggeredAvatarsDone ) {
                                     this._avatarDone.next( true );
                                 }
                             }
                         } );
        }
    }

    /*******************************************************************************************************************\
     *                                                                                                                 *
     *                                              Abstract methods                                                   *
     *                                                                                                                 *
     \******************************************************************************************************************/

    protected abstract getSummoned(): Promise<void>;

    /*******************************************************************************************************************\
     *                                                                                                                 *
     *                           Helpers called within the implementation of abstract methods                          *
     *                                                                                                                 *
     \******************************************************************************************************************/

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

        // Saving the answer in the state shared by all avatars
        this.oracle.addAWish( answer );

        // Checking if the provided answer is a trigger for an avatar
        const answersIds: string[] = Array.isArray( answer[questionId] ) ? (answer[questionId] as string[]) : [ answer[questionId] as string ];
        for ( const answerId of answersIds ) {
            const avatarClass: NewableAvatarClass = (this.triggers[answerId] as unknown) as NewableAvatarClass;
            if ( avatarClass ) {
                this.avatars2Trigger.push( avatarClass );
            }
        }
    }

    protected executeCommand( command: string, args: string[], cwd: string = undefined ): void {
        const childProcess = spawnSync(
            command,
            args,
            { stdio: 'inherit', cwd }
        );

        if ( childProcess.error ) {
            this.hermes.debug( `child process errored with error ${childProcess.error}` );
        }

        this.hermes.debug( `child process exited with code ${childProcess.status}` );
    }
}
