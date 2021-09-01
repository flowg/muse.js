/**
 * Internal imports
 */
import { Hermes } from 'tools/hermes';
import { Apollo } from './avatars/apollo';

const hermes: Hermes = new Hermes();
const apollo: Apollo = new Apollo( hermes );
apollo.getSummoned().then();
