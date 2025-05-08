// src/services/artApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = 'http://localhost:5000/api';  // Заміни на свій базовий URL API

export const artApi = createApi({
    reducerPath: 'artApi',  // Це ім’я для редюсера в Redux Store
    baseQuery: fetchBaseQuery({ baseUrl: API_URL }),  // Базовий URL для запитів
    endpoints: (builder) => ({
        // Описуємо ендпоінти для API

        // Запит на отримання всіх картин
        fetchArt: builder.query({
            query: () => '/art',  // Шлях до ресурсу
        }),

        // Запит на отримання певної картини
        fetchArtById: builder.query({
            query: (id: string) => `/art/${id}`,  // Параметр для отримання конкретної картини
        }),

        // Запит на створення нової картини
        createArt: builder.mutation({
            query: (newArt) => ({
                url: '/art',
                method: 'POST',
                body: newArt,
            }),
        }),

        // Запит на оновлення існуючої картини
        updateArt: builder.mutation({
            query: ({ id, updatedArt }) => ({
                url: `/art/${id}`,
                method: 'PUT',
                body: updatedArt,
            }),
        }),

        // Запит на видалення картини
        deleteArt: builder.mutation({
            query: (id: string) => ({
                url: `/art/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

// Автоматично генеруємо хуки для кожного ендпоінта
export const {
    useFetchArtQuery,
    useFetchArtByIdQuery,
    useCreateArtMutation,
    useUpdateArtMutation,
    useDeleteArtMutation,
} = artApi;
