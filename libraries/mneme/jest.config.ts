module.exports = {
    displayName: 'mneme',

    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
        },
    },
    transform: {
        '^.+\\.[tj]sx?$': 'ts-jest',
    },
    moduleFileExtensions: [ 'ts', 'tsx', 'js', 'jsx' ],
    coverageDirectory: '../../coverage/libraries/mneme',
    preset: '../../jest.preset.ts',
};
