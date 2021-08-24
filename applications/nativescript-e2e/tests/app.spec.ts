/**
 * Nx imports
 */
import {
    checkFilesExist,
    runNxCommandAsync
} from '@nrwl/nx-plugin/testing';

/**
 * Internal imports
 */
import {
    getExpectedFilesPaths,
    getTestForDirectoryOption,
    getTestForTagsOption,
    runGeneratorForPlugin
} from '../../common.utils';
import {
    APP_RESOURCES_FILES,
    HOOKS_FILES
} from './apps-structures/common';
import {
    ANGULAR_ROOT_FILES,
    ANGULAR_SRC_FILES
} from './apps-structures/angular';
import { PLUGIN_NAME } from './plugin-name';

/**
 * TypeScript entities and constants
 */
const generatorName = 'app';

describe(`The ${PLUGIN_NAME} plugin, with the ${generatorName} generator,`, () => {
    getTestForDirectoryOption(PLUGIN_NAME, generatorName);
    getTestForTagsOption(PLUGIN_NAME, generatorName);

    /**
     * Helper that tests if the generated application is able to build
     * for the given mobile platform without error
     *
     * @param platform : 'ios' | 'android', the mobile platform you want to test
     * the build for
     */
    async function testBuildForPlatform(platform: 'ios' | 'android'): Promise<void> {
        const appName: string = await runGeneratorForPlugin(PLUGIN_NAME, generatorName);
        const result: { stdout: string; stderr: string } = await runNxCommandAsync(`build ${appName} -c ${platform}`);
        expect(result.stdout).toMatch('Project successfully built');
    }

    it('should create a Nativescript+Angular app by default', async () => {
        const appName: string = await runGeneratorForPlugin(PLUGIN_NAME, generatorName);

        // Computing expected files paths
        const rootFiles: string[] = getExpectedFilesPaths(ANGULAR_ROOT_FILES, appName);
        const srcFiles: string[] = getExpectedFilesPaths(ANGULAR_SRC_FILES, appName);
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
});
