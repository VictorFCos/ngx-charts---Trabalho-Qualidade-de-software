/**
 * Throttle a function
 *
 */
/**
 * Throttle a function
 *
 */
export function throttle(
  func: (...args: unknown[]) => unknown,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
) {
  options = options || {};
  let context: unknown;
  let args: unknown[];
  let result: unknown;
  let timeout: any = null;
  let previous = 0;

  function later() {
    previous = options.leading === false ? 0 : +new Date();
    timeout = null;
    result = (func as Function).apply(context, args);
  }

  return function (this: unknown, ...params: unknown[]) {
    const now = +new Date();

    if (!previous && options.leading === false) {
      previous = now;
    }

    const remaining = wait - (now - previous);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    context = this;
    // eslint-disable-next-line prefer-rest-params
    args = params;

    if (remaining <= 0) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = (func as Function).apply(context, args);
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }

    return result;
  };
}

/**
 * Throttle decorator
 *
 *  class MyClass {
 *    throttleable(10)
 *    myFn() { ... }
 *  }
 */
export function throttleable(duration: number, options?: { leading?: boolean; trailing?: boolean }) {
  return function innerDecorator(target: any, key: string | symbol, descriptor: PropertyDescriptor) {
    return {
      configurable: true,
      enumerable: descriptor.enumerable,
      get: function getter() {
        Object.defineProperty(this, key, {
          configurable: true,
          enumerable: descriptor.enumerable,
          value: throttle(descriptor.value, duration, options)
        });

        return this[key];
      }
    };
  };
}
