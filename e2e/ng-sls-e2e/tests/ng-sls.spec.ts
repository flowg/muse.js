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
import { PLUGIN_NAME } from './plugin-name';
import {
  ROOT_FILES,
  SRC_FILES
} from './apps-structure/expected-files';

/**
 * TypeScript entities and constants
 */
const generatorName = 'app';

describe(`The ${PLUGIN_NAME} plugin, with the ${generatorName} generator,`, () => {
  getTestForDirectoryOption(PLUGIN_NAME, generatorName);
  getTestForTagsOption(PLUGIN_NAME, generatorName);

  it('should create an Angular app, served through AWS Lambda, by default', async () => {
    const appName: string = await runGeneratorForPlugin(PLUGIN_NAME, generatorName);

    // Computing expected files paths
    const rootFiles: string[] = getExpectedFilesPaths(ROOT_FILES, appName);
    const srcFiles: string[] = getExpectedFilesPaths(SRC_FILES, appName);

    // Checking the app has the proper files
    expect(() =>
               checkFilesExist(
                   ...rootFiles,
                   ...srcFiles
               )
    ).not.toThrow();
  });

  it('should create an Angular app, that we can deploy to AWS S3', async () => {
    const appName: string = await runGeneratorForPlugin(PLUGIN_NAME, generatorName);
    const result: { stdout: string; stderr: string } = await runNxCommandAsync(`deploy ${appName}`);

    /*
     * Making sure we don't create "ghost apps" on our AWS account
     * every time we run e2e tests
     */
    await runNxCommandAsync(`remove ${appName}`);

    expect(result.stdout).toMatch('Serverless › Success');
  });
});
