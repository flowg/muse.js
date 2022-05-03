/**
 * Nx imports
 */
import {
    checkFilesExist,
    ensureNxProject,
    readJson,
    runNxCommandAsync,
    uniq
} from '@nrwl/nx-plugin/testing';

/**
 * Helper that creates an empty Nx workspace and
 * runs the desired generator, for the desired plugin, in it
 *
 * @param pluginName : string, the name of the plugin we want to use in our E2E test
 * @param generatorName : string, the name of the generator we want to use in our E2E test
 * @param generatorOptions : string, the options for the requested generator
 * @return the name of the app created via the generator
 */
export async function runGeneratorForPlugin(
    pluginName: string,
    generatorName: string,
    generatorOptions: string = ''
): Promise<string> {
    const appName: string = uniq(pluginName);
    ensureNxProject(`@muse.js/${pluginName}`, `dist/libraries/${pluginName}`);
    const result: { stdout: string; stderr: string } = await runNxCommandAsync(
        `generate @muse.js/${pluginName}:${generatorName} ${appName} ${generatorOptions}`
    );
    // console.log(result);

    return appName;
}

/**
 * Helper that completes the expected files paths with
 * the newly generated app name
 *
 * @param filesPaths : string[], the paths of the files expected after
 * generation is complete, relative to the root of that new app
 * @param appName : string, this new app's name
 * @return the paths of the files expected after
 * generation is complete, relative to the root of the Nx workspace
 */
export function getExpectedFilesPaths(
    filesPaths: string[],
    appName: string
): string[] {
    return filesPaths.map(
        (filePath: string) => {
            return `apps/${appName}/${filePath}`;
        }
    );
}

/**
 * Helper that returns a test common to several plugins created within @muse.js.
 * This one tests the directory option for a generator within a plugin
 *
 * @param pluginName : string, the name of the plugin that we're testing
 * @param generatorName : string, the name of the generator that we're testing
 * within our plugin
 */
export function getTestForDirectoryOption(pluginName: string, generatorName: string): void {
    return describe('and the --directory option,', () => {
        it('should create src in the specified directory', async () => {
            const directory: string = 'subdir';
            const appName: string = await runGeneratorForPlugin(pluginName, generatorName, `--directory ${directory}`);
            // TODO: Change 'apps' into something generic
            expect(() =>
                       checkFilesExist(`apps/${directory}/${appName}/src/main.ts`)
            ).not.toThrow();
        });
    });
}

/**
 * Helper that returns a test common to several plugins created within @muse.js.
 * This one tests the tags option for a generator within a plugin
 *
 * @param pluginName : string, the name of the plugin that we're testing
 * @param generatorName : string, the name of the generator that we're testing
 * within our plugin
 */
export function getTestForTagsOption(pluginName: string, generatorName: string): void {
    return describe('and the --tags option', () => {
        it('should add tags to nx.json', async () => {
            const tags: string[] = ['e2etag', 'e2ePackage'];
            const appName: string = await runGeneratorForPlugin(pluginName, generatorName, `--tags ${tags.join(',')}`);
            const projectJson: any = readJson(`apps/${appName}/project.json`);
            expect(projectJson.tags).toEqual(['e2etag', 'e2ePackage']);
        });
    });
}
