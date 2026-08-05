/**
 * Tests for Toast Store (Zustand)
 */

import { renderHook, act } from '@testing-library/react';
import useToastStore from '../toastStore';

describe('Toast Store', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useToastStore.getState().clearToasts();
    });
  });

  it('should initialize with empty toasts array', () => {
    const { result } = renderHook(() => useToastStore());
    expect(result.current.toasts).toEqual([]);
  });

  it('should add a toast', () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.addToast('Test message', 'info');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Test message');
    expect(result.current.toasts[0].type).toBe('info');
  });

  it('should add toast with default type (info)', () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.addToast('Test message');
    });

    expect(result.current.toasts[0].type).toBe('info');
  });

  it('should remove a toast by id', () => {
    const { result } = renderHook(() => useToastStore());

    let toastId;
    act(() => {
      toastId = result.current.addToast('Test message');
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      result.current.removeToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('should clear all toasts', () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.addToast('Message 1');
      result.current.addToast('Message 2');
      result.current.addToast('Message 3');
    });

    expect(result.current.toasts).toHaveLength(3);

    act(() => {
      result.current.clearToasts();
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('should have convenience methods (success, error, info, warning)', () => {
    const { result } = renderHook(() => useToastStore());

    act(() => {
      result.current.success('Success message');
      result.current.error('Error message');
      result.current.info('Info message');
      result.current.warning('Warning message');
    });

    expect(result.current.toasts).toHaveLength(4);
    expect(result.current.toasts[0].type).toBe('success');
    expect(result.current.toasts[1].type).toBe('error');
    expect(result.current.toasts[2].type).toBe('info');
    expect(result.current.toasts[3].type).toBe('warning');
  });
});

