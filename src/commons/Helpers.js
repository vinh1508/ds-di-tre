import moment from 'moment';

export const generateUUID = () => {
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
};

export const throttled = (delayIn, fn) => {
    let lastCall = 0;
    return (...args) => {
        const now = new Date().getTime();
        if (now - lastCall < delayIn) {
            return;
        }
        lastCall = now;
        return fn(...args);
    };
};

export const debounced = (delayIn, fn) => {
    let timerId;
    return function(...args) {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            fn(...args);
            timerId = null;
        }, delayIn);
    };
};

export const delay = (duration = 100) => {
    return new Promise((resolve) => setTimeout(resolve, duration));
};