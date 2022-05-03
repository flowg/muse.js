module.exports = {
    displayName: 'nativescript-e2e',

    globals: {
        'ts-jest': {
            tsConfig: '<rootDir>/tsconfig.spec.json',
        },
    },
    transform: {
        '^.+\\.[tj]s$': 'ts-jest',
    },
    moduleFileExtensions: [ 'ts', 'js', 'html' ],
    coverageDirectory: '../../coverage/applications/nativescript-e2e',
    testTimeout: 10 * 60 * 1000,
    useStderr: true,
    preset: '../../jest.preset.ts',
};
