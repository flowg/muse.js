import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';
describe('nativescript e2e', () => {
  it('should create nativescript', async (done) => {
    const plugin = uniq('nativescript');
    ensureNxProject('@muse.js/nativescript', 'dist/packages/nativescript');
    await runNxCommandAsync(
      `generate @muse.js/nativescript:nativescript ${plugin}`
    );

    const result = await runNxCommandAsync(`build ${plugin}`);
    expect(result.stdout).toContain('Executor ran');

    done();
  });

  describe('--directory', () => {
    it('should create src in the specified directory', async (done) => {
      const plugin = uniq('nativescript');
      ensureNxProject('@muse.js/nativescript', 'dist/packages/nativescript');
      await runNxCommandAsync(
        `generate @muse.js/nativescript:nativescript ${plugin} --directory subdir`
      );
      expect(() =>
        checkFilesExist(`libs/subdir/${plugin}/src/index.ts`)
      ).not.toThrow();
      done();
    });
  });

  describe('--tags', () => {
    it('should add tags to nx.json', async (done) => {
      const plugin = uniq('nativescript');
      ensureNxProject('@muse.js/nativescript', 'dist/packages/nativescript');
      await runNxCommandAsync(
        `generate @muse.js/nativescript:nativescript ${plugin} --tags e2etag,e2ePackage`
      );
      const nxJson = readJson('nx.json');
      expect(nxJson.projects[plugin].tags).toEqual(['e2etag', 'e2ePackage']);
      done();
    });
  });
});
