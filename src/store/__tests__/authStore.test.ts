/**
 * Tests for Auth Store (Zustand)
 */

import { renderHook, act } from '@testing-library/react';
import useAuthStore from '../authStore';

// Mock the API
jest.mock('../../api', () => ({
  auth: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    });
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should logout and clear user', async () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      useAuthStore.setState({
        user: { id: 1, name: 'Test User' },
        isAuthenticated: true,
      });
    });

    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should check if user is authenticated', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      useAuthStore.setState({
        user: { id: 1, name: 'Test User' },
        isAuthenticated: true,
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
  });
});

