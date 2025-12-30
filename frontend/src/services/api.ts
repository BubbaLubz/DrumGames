import axios from 'axios';
import { PatternSpec, GenerateRequest } from '../types';

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
};

export default api;