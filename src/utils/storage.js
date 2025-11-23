const STORAGE_KEY = 'satsuki_events';

export const saveEvent = (event) => {
    const events = getEvents();
    events[event.id] = event;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

export const getEvents = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
};

export const getEventById = (id) => {
    const events = getEvents();
    return events[id] || null;
};

export const updateEvent = (event) => {
    saveEvent(event);
};
