/**
 * Node.js imports
 */
import * as fs from 'fs';

fs.chmodSync(process.argv[2], 0o777);
