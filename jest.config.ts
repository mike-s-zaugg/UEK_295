import type { Config } from 'jest';

const config: Config = {
  // Projekt-Root
  rootDir: '.',

  // Unit-Tests in src
  testMatch: ['<rootDir>/src/**/*.spec.ts'],

  // ts-jest Transform
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },

  moduleFileExtensions: ['ts', 'js', 'json'],

  testEnvironment: 'node',

  // Coverage nur aus src (ohne spec & entrypoints)
  collectCoverageFrom: [
    '<rootDir>/src/**/*.(t|j)s',

    // ❌ Tests & Entry Points
    '!<rootDir>/src/**/*.spec.ts',
    '!<rootDir>/src/main.ts',
    '!<rootDir>/src/**/index.ts',
    '!<rootDir>/src/**/*.controller.ts',

    // ❌ NestJS / Architektur
    '!<rootDir>/src/**/*.module.ts',
    '!<rootDir>/src/**/*.decorator.ts',
    '!<rootDir>/src/**/*.middleware.ts',
    '!<rootDir>/src/**/*.interceptor.ts',
    '!<rootDir>/src/**/*.guard.ts',

    // ❌ DTOs / Entities
    '!<rootDir>/src/**/*.dto.ts',
    '!<rootDir>/src/**/*.entity.ts',

    // ❌ konfigurationen
    '!<rootDir>/src/modules/typed-config/env.zod.ts',
    '!<rootDir>/src/modules/typed-config/configs/*',
    '!<rootDir>/src/informations/*',

    // ❌ seeds
    '!<rootDir>/src/modules/**/*-seed.service.ts',

    // ❌ exporter
    '!<rootDir>/src/*-export.ts',
  ],

  coverageDirectory: '<rootDir>/coverage',

  // ✅ Für GitLab: Cobertura
  // ✅ Für dich: Clover beibehalten
  // ✅ Für lokale Tools: lcov + text
  coverageReporters: ['text', 'lcov', 'clover', 'cobertura'],

  // Praktisch, damit Mocks nicht "leaken"
  clearMocks: true,
  restoreMocks: true,
};

export default config;
