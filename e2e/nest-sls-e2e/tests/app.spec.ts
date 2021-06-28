/**
 * Nx imports
 */
import {
    checkFilesExist,
    ensureNxProject,
    readJson,
    runNxCommandAsync,
    uniq,
} from '@nrwl/nx-plugin/testing';

/**
 * Internal imports
 */
import { runGeneratorForPlugin } from '../../common.utils';

/**
 * TypeScript entities and constants
 */
const generatorName = 'app';

describe(`The ${PLUGIN_NAME} plugin, with the ${generatorName} generator,`, () => {

    fit('should create a Nest app, served through AWS Lambda, by default', async () => {
        const appName: string = await runGeneratorForPlugin(pluginName, generatorName);
    });

    describe('--directory', () => {
        it('should create src in the specified directory', async (done) => {
            const plugin = uniq('nest-sls');
            ensureNxProject('@muse.js/nest-sls', 'dist/packages/nest-sls');
            await runNxCommandAsync(
                `generate @muse.js/nest-sls:nest-sls ${plugin} --directory subdir`
            );
            expect(() =>
                       checkFilesExist(`libs/subdir/${plugin}/src/index.ts`)
            ).not.toThrow();
            done();
        });
    });

    describe('--tags', () => {
        it('should add tags to nx.json', async (done) => {
            const plugin = uniq('nest-sls');
            ensureNxProject('@muse.js/nest-sls', 'dist/packages/nest-sls');
            await runNxCommandAsync(
                `generate @muse.js/nest-sls:nest-sls ${plugin} --tags e2etag,e2ePackage`
            );
            const nxJson = readJson('nx.json');
            expect(nxJson.projects[plugin].tags).toEqual(['e2etag', 'e2ePackage']);
            done();
        });
    });
});
