import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
});

export interface Item {
  id: number;
  title: str;
  description: string;
  type: 'lost' | 'found';
  status: string;
  created_at: string;
  image_public_url?: string;
  zone?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

export const getItems = async (): Promise<Item[]> => {
  const response = await api.get('/items/');
  return response.data;
};

export const getItem = async (id: number): Promise<Item> => {
  const response = await api.get(`/items/${id}`);
  return response.data;
};

export const createItem = async (data: any): Promise<Item> => {
  const response = await api.post('/items/', data);
  return response.data;
};

export default api;
