export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    clearMocks: true,
    restoreMocks: true,
    setupFilesAfterEnv: ['./jest.setup.ts'],
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: 'tsconfig.test.json',
            },
        ],
    },
};
