import axios from 'axios';
import { PatternSpec, GenerateRequest, GridRequest, CustomGridRequest } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const rudimentAPI = {

    generatePatterns: async (request: GenerateRequest): Promise<PatternSpec> => {
        try{
            const response = await api.post<PatternSpec>('/getBaseRudiment/', request);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)){
                throw new Error(error.response?.data?.detail || 'Failed to generate pattern');
            }
            throw error;
        }  
    },

    generate16thNoteGrid: async (request: GridRequest): Promise<PatternSpec> => {
        try {
            const response = await api.post<PatternSpec>('/generate-16th-note-grid/', request);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.detail || error.message || 'Failed to generate 16th note grid';
                console.error('API Error:', {
                    message: errorMessage,
                    status: error.response?.status,
                    data: error.response?.data,
                    url: error.config?.url
                });
                throw new Error(errorMessage);
            }
            throw error;
        }
    },

    generateCustomGrid: async (request: CustomGridRequest): Promise<PatternSpec> => {
        try {
            const response = await api.post<PatternSpec>('/generate-custom-grid/', request);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.detail || error.message || 'Failed to generate custom grid';
                console.error('API Error:', {
                    message: errorMessage,
                    status: error.response?.status,
                    data: error.response?.data,
                    url: error.config?.url
                });
                throw new Error(errorMessage);
            }
            throw error;
        }
    },
};

export default api;