import { useCallback, useRef } from 'react';

const useDebounce = (delay = 500) => {
    const timeout: any = useRef<NodeJS.Timeout>(null);

    return useCallback(
        (callback: () => void, overideDelay?: number) => {
            clearTimeout(timeout.current);
            timeout.current = setTimeout(callback, overideDelay || delay);
        },
        [delay]
    );
};

export default useDebounce;
