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

export abstract class ApolloAvatar {
    protected questions: Record<string, Question> = {};
    protected triggers: Record<string, AvatarClass> = {};
    static readonly trigger: AvatarTrigger;

    constructor() {
        this.linkAvatars().then(() => this.getSummoned());
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

        if ( question2Enrich.choices ) {
            question2Enrich.choices = question2Enrich.choices.concat( trigger.answer );
        }

        // 2) Registering the fact that when this answer is selected, the consequence is the avatar's instantiation
        this.triggers[trigger.answer.name] = avatarClass;
    }

    abstract getSummoned(): Promise<void>;
}
