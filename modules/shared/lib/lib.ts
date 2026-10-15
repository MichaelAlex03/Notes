const withTimeout = <T>(promise: Promise<T>, ms = 5000): Promise<T> =>
    Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))])