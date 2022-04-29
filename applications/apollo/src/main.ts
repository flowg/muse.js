/**
 * Internal imports
 */
import { Hermes } from 'tools/hermes';
import { Apollo } from './avatars/apollo';
import { Oracle } from './oracle';
import { environment } from './environments/environment';

const isDebugAllowed: boolean = !environment.production && process.argv.includes( '-d' );
const hermes: Hermes = new Hermes( isDebugAllowed );
const oracle: Oracle = new Oracle();
new Apollo(
    hermes,
    oracle
);
