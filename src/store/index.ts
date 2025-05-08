// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { artApi } from '../services/artApi';

const store = configureStore({
    reducer: {
        [artApi.reducerPath]: artApi.reducer,  // Підключаємо API
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(artApi.middleware),  // Підключаємо middleware для API
});

console.log('Redux Store State:', store.getState());  // Лог для перевірки стану Redux Store

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
