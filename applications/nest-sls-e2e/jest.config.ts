module.exports = {
    displayName: 'nest-sls-e2e',

    globals: {
        'ts-jest': {
            tsConfig: '<rootDir>/tsconfig.spec.json',
        },
    },
    transform: {
        '^.+\\.[tj]s$': 'ts-jest',
    },
    moduleFileExtensions: [ 'ts', 'js', 'html' ],
    coverageDirectory: '../../coverage/applications/nest-sls-e2e',
    testTimeout: 10 * 60 * 1000,
    preset: '../../jest.preset.js',
};
