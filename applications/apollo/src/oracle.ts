/**
 * TypeScript entities and constants
 */
export type Wishes = Record<string, string | boolean>;

export interface FulfillmentStep {
    command: string;
    args: string[];
    cwd?: string;
}

export class Oracle {
    private _usersWishes: Wishes = {};
    private _fulfillmentSteps: FulfillmentStep[] = [];

    get usersWishes(): Wishes {
        return this._usersWishes;
    }

    get fulfillmentSteps(): FulfillmentStep[] {
        return this._fulfillmentSteps;
    }

    addAWish( wish: Wishes ): void {
        this._usersWishes = {
            ...this._usersWishes,
            ...wish
        };
    }

    addAFulfillmentStep( step: FulfillmentStep ): void {
        this._fulfillmentSteps.push( step );
    }
}
