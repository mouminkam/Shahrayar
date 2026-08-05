/**
 * Tests for Debounce utility
 */

import { debounce, createDebounced } from '../debounce';

describe('Debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('debounce', () => {
    it('should delay function execution', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 300);

      debouncedFunc();
      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous calls if called multiple times', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 300);

      debouncedFunc();
      debouncedFunc();
      debouncedFunc();

      jest.advanceTimersByTime(300);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments correctly', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 300);

      debouncedFunc('arg1', 'arg2');
      jest.advanceTimersByTime(300);

      expect(func).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should execute immediately if immediate is true', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 300, true);

      debouncedFunc();
      expect(func).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(300);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should use default wait time of 300ms', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func);

      debouncedFunc();
      jest.advanceTimersByTime(299);
      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(func).toHaveBeenCalledTimes(1);
    });
  });

  describe('createDebounced', () => {
    it('should create a debounced function', () => {
      const func = jest.fn();
      const debouncedFunc = createDebounced(func, 200);

      debouncedFunc();
      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(200);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('should use default delay of 300ms', () => {
      const func = jest.fn();
      const debouncedFunc = createDebounced(func);

      debouncedFunc();
      jest.advanceTimersByTime(300);
      expect(func).toHaveBeenCalledTimes(1);
    });
  });
});

