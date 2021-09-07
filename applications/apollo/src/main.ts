/**
 * Internal imports
 */
import { Hermes } from 'tools/hermes';
import { Apollo } from './avatars/apollo';
import { Oracle } from './oracle';

const hermes: Hermes = new Hermes();
const oracle: Oracle = new Oracle();
new Apollo( hermes, oracle );
