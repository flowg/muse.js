module.exports = {
    displayName: 'ng-sls-e2e',

    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
        },
    },
    transform: {
        '^.+\\.[tj]s$': 'ts-jest',
    },
    moduleFileExtensions: [ 'ts', 'js', 'html' ],
    coverageDirectory: '../../coverage/applications/ng-sls-e2e',
    testTimeout: 10 * 60 * 1000,
    preset: '../../jest.preset.js',
};
