/**
 * Internal imports
 */
import { Hermes } from 'tools/hermes';
import {
    ApolloAvatar,
    Question
} from './apollo-avatar';
import { Oracle } from '../oracle';

/**
 * TypeScript entities and constants
 */
export const PLUGGABLE_QUESTION = 'workflowType';

export class Apollo extends ApolloAvatar {
    protected questions: Record<string, Question> = {
        [PLUGGABLE_QUESTION]: {
            type: 'select',
            name: PLUGGABLE_QUESTION,
            message: 'What would you like to do ?',
            choices: []
        }
    };

    constructor( protected hermes: Hermes, protected oracle: Oracle ) {
        super(
            hermes,
            oracle
        );
    }

    protected async getSummoned(): Promise<void> {
        this.hermes.introduceApollo();

        await this.askThisQuestion( PLUGGABLE_QUESTION );

        this.avatarDone
            .subscribe( {
                            next: () => {
                                this.hermes.debug( 'All linked avatars are DONE for Apollo, so we begin actually doing stuff' );
                                this.fulfillUsersWishes();
                            }
                        } );
    }

    private fulfillUsersWishes(): void {
        for ( const fulfillmentStep of this.oracle.fulfillmentSteps ) {
            fulfillmentStep();
        }
    }
}
