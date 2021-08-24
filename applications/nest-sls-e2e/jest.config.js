module.exports = {
    displayName: 'nest-sls-e2e',
    preset: '../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsConfig: '<rootDir>/tsconfig.spec.json',
        },
    },
    transform: {
        '^.+\\.[tj]s$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/applications/nest-sls-e2e',
    testTimeout: 10 * 60 * 1000
};

/*
 * TODO: DEPRECATION WARNING: --with-deps is deprecated and it will be removed in v14.
 *  Configure target dependencies instead:
 *  https://nx.dev/latest/angular/core-concepts/configuration#target-dependencies.
 */
