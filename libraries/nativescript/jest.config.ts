module.exports = {
    displayName: 'nativescript',

    globals: {
        'ts-jest': {
            tsConfig: '<rootDir>/tsconfig.spec.json',
        },
    },
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest',
    },
    moduleFileExtensions: [ 'ts', 'tsx', 'js', 'jsx' ],
    coverageDirectory: '../../coverage/libraries/nativescript',
    preset: '../../jest.preset.ts',
};
