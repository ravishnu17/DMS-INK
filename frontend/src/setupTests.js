import '@testing-library/jest-dom';

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Assign mocks to global window
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock window.location
delete window.location;
window.location = {
  href: '',
  pathname: '/',
  hash: '#/',
  reload: vi.fn(),
};

// Mock FormData for testing
global.FormData = class FormData {
  constructor() {
    this.data = {};
  }

  append(key, value) {
    this.data[key] = value;
  }

  get(key) {
    return this.data[key];
  }

  getAll(key) {
    return [this.data[key]];
  }

  has(key) {
    return key in this.data;
  }
};

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

console.error = vi.fn();
console.log = vi.fn();

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Restore console methods after all tests
afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});
