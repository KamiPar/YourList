export default {
  displayName: 'Frontend',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/apps/Frontend',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  roots: ['<rootDir>/src', '<rootDir>/../../libs/Frontend'],
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/../../libs/Frontend/**/*.spec.ts'
  ],
  moduleNameMapper: {
    '^@angular/animations/browser$': '<rootDir>/../../node_modules/@angular/animations/fesm2022/browser.mjs',
    '^@your-list/Frontend/features/feature-lists$': '<rootDir>/../../libs/Frontend/features/feature-lists/src/index.ts',
    '^@your-list/Frontend/features/feature-lists-details$': '<rootDir>/../../libs/Frontend/features/feature-lists-details/src/index.ts',
    '^@your-list/Frontend/features/feature-login$': '<rootDir>/../../libs/Frontend/features/feature-login/src/index.ts',
    '^@your-list/Frontend/features/feature-register$': '<rootDir>/../../libs/Frontend/features/feature-register/src/index.ts',
    '^@your-list/data-access-api-custom$': '<rootDir>/../../libs/shared/data-access/data-access-api-custom/src/index.ts',
    '^@your-list/shared/data-access/data-access-api$': '<rootDir>/../../libs/shared/data-access/data-access-api/src/lib/index.ts',
    '^@your-list/shared/ui$': '<rootDir>/../../libs/shared/ui/src/index.ts'
  },
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
