export class Hermes {
    constructor( private debugAllowed: boolean ) {
    }

    introduceApollo(): void {
        console.log( 'Hello 🖖, I\'m Hermes 😁' );
    }

    debug( message: string ): void {
        if ( this.debugAllowed ) {
            console.log( message );
        }
    }
}
