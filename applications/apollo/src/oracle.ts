/**
 * TypeScript entities and constants
 */
export type Wishes = Record<string, string | string[]>;

export type FulfillmentStep = () => void;

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
