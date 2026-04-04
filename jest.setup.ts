import "@testing-library/jest-dom";

// IntersectionObserver is not implemented in jsdom
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})) as unknown as typeof IntersectionObserver;
