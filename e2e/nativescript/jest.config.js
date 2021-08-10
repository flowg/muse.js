module.exports = {
    displayName: 'nativescript-e2e',
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
    coverageDirectory: '../../coverage/e2e/nativescript',
    testTimeout: 10 * 60 * 1000,
    useStderr: true
};
