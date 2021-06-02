/**
 * Nx imports
 */
import {
    checkFilesExist,
    readJson,
    runNxCommandAsync
} from '@nrwl/nx-plugin/testing';

/**
 * Internal imports
 */
import {
    APP_RESOURCES_FILES,
    HOOKS_FILES,
    ROOT_FILES,
    SRC_FILES
} from './apps-structures/angular';
import { runGeneratorForPlugin } from '../../common.utils';

/**
 * TypeScript entities and constants
 */
const pluginName = 'nativescript';

describe('The nativescript plugin, with the app generator,', () => {
    const generatorName = 'app';

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
    const getExpectedFilesPaths: (
        filesPaths: string[],
        appName: string
    ) => string[] =
        (
            filesPaths: string[],
            appName: string
        ) => {
            return filesPaths.map(
                (filePath: string) => {
                    return `apps/${appName}/${filePath}`;
                }
            );
        };

    /**
     * Helper that tests if the generated application is able to build
     * for the given mobile platform without error
     *
     * @param platform : 'ios' | 'android', the mobile platform you want to test
     * the build for
     */
    const testBuildForPlatform: (platform: 'ios' | 'android') => Promise<void> = async (platform: 'ios' | 'android') => {
        const appName: string = await runGeneratorForPlugin(pluginName, generatorName);
        const result: { stdout: string; stderr: string } = await runNxCommandAsync(`build ${appName} -c ${platform}`);
        expect(result.stdout).toContain('Project successfully built');
    };

    it('should create a Nativescript+Angular app by default', async () => {
        const appName: string = await runGeneratorForPlugin(pluginName, generatorName);

        // Computing expected files paths
        const rootFiles: string[] = getExpectedFilesPaths(ROOT_FILES, appName);
        const srcFiles: string[] = getExpectedFilesPaths(SRC_FILES, appName);
        const hooksFiles: string[] = getExpectedFilesPaths(HOOKS_FILES, appName);
        const appResourcesFiles: string[] = getExpectedFilesPaths(APP_RESOURCES_FILES, appName);

        // Checking the app has the proper files
        expect(() =>
                   checkFilesExist(
                       ...rootFiles,
                       ...srcFiles,
                       ...hooksFiles,
                       ...appResourcesFiles
                   )
        ).not.toThrow();
    });

    it('should create a Nativescript app that we can build for iOS', async () => {
        await testBuildForPlatform('ios');
    });

    it('should create a Nativescript app that we can build for Android', async () => {
        await testBuildForPlatform('android');
    });

    describe('and the --directory option,', () => {
        it('should create src in the specified directory', async () => {
            const directory: string = 'subdir';
            const appName: string = await runGeneratorForPlugin(pluginName, generatorName, `--directory ${directory}`);
            expect(() =>
                       checkFilesExist(`apps/${directory}/${appName}/src/main.ts`)
            ).not.toThrow();
        });
    });

    describe('and the --tags option', () => {
        it('should add tags to nx.json', async () => {
            const tags: string[] = ['e2etag', 'e2ePackage'];
            const appName: string = await runGeneratorForPlugin(pluginName, generatorName, `--tags ${tags.join(',')}`);
            const nxJson: any = readJson('nx.json');
            expect(nxJson.projects[appName].tags).toEqual(['e2etag', 'e2ePackage']);
        });
    });
});
