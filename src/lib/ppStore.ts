// src/lib/persistStore.js
import { writable } from 'svelte/store';

export function persistStore(key:string, initialValue:number) {
  // Ensure this runs only in the browser (localStorage is not available on the server)
  const storedValue = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  const data = storedValue ? JSON.parse(storedValue) : initialValue;

  const store = writable(data);

  store.subscribe((value) => {
    // Save the store value in localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  });

  return store;
}
