import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 1000000
});

export const getStatus = async () => {
    const response = await api.get('/ahu/status');
    return response.data;
};

export const getHistorical = async (startDate, endDate, limit) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (limit) params.limit = limit;

    const response = await api.get('/ahu/historical', { params });
    return response.data;
};

export const getPrediction = async (days = 14) =>{
    const response = await api.get('/ahu/prediction', { params: { days } });
    return response.data;
}

export const getThresholds = async () => {
    const response = await api.get('/ahu/thresholds');
    return response.data;
};

export const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
};

export const getActiveModel = async () => {
    const response = await api.get('/ahu/model/active');
    return response.data;
};

export const switchModel = async (modelType) => {
    const response = await api.post('/ahu/model/switch', null, { params: { model_type: modelType } });
    return response.data;
};

export const getHistoricalByRange = async (startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await api.get('/ahu/historical', { params });
    return response.data;
};

export default api;