import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
});

export interface User {
  id: number;
  name: string;
  email: string;
  department?: string;
  year?: string;
  role: string;
  karma: number;
  is_banned: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
}

export interface Zone {
  id: number;
  name: string;
  lat?: number;
  lng?: number;
}

export interface Claim {
  id: number;
  item_id: number;
  claimant_id: number;
  answers_json?: {
    proof_description?: string;
    contact_info?: string;
    [key: string]: any;
  };
  ai_confidence?: string;
  status: 'pending' | 'approved' | 'rejected' | 'handed_over';
  reviewed_by?: number;
  created_at: string;
  claimant?: User;
  item?: Item;
}

export interface Item {
  id: number;
  title: string;
  description?: string;
  type: 'lost' | 'found';
  status: 'lost' | 'found' | 'match_suggested' | 'claim_requested' | 'verified' | 'returned' | 'expired' | 'removed';
  created_at: string;
  category_id?: number;
  zone_id?: number;
  color?: string;
  brand?: string;
  custody_location?: string;
  reward_note?: string;
  image_public_url?: string;
  image_original_url?: string;
  user_id?: number;
  user?: User;
  zone?: Zone;
  category?: Category;
  claims?: Claim[];
}

export interface UserProfile extends User {
  items: Item[];
  claims: Claim[];
}

export interface GetItemsParams {
  type?: string;
  category_id?: number;
  zone_id?: number;
  search?: string;
  status?: string;
}

export const getItems = async (params?: GetItemsParams): Promise<Item[]> => {
  const response = await api.get('/items/', { params });
  return response.data;
};

export const getItem = async (id: number): Promise<Item> => {
  const response = await api.get(`/items/${id}`);
  return response.data;
};

export const createItem = async (data: Partial<Item>): Promise<Item> => {
  const response = await api.post('/items/', data);
  return response.data;
};

export const updateItemStatus = async (id: number, status: string): Promise<Item> => {
  const response = await api.patch(`/items/${id}/status`, { status });
  return response.data;
};

export const deleteItem = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/items/${id}`);
  return response.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/categories/');
  return response.data;
};

export const getZones = async (): Promise<Zone[]> => {
  const response = await api.get('/zones/');
  return response.data;
};

export const createClaim = async (itemId: number, data: { proof_description: string; contact_info?: string }): Promise<Claim> => {
  const response = await api.post(`/items/${itemId}/claims`, data);
  return response.data;
};

export const getItemClaims = async (itemId: number): Promise<Claim[]> => {
  const response = await api.get(`/items/${itemId}/claims`);
  return response.data;
};

export const getMyClaims = async (): Promise<Claim[]> => {
  const response = await api.get('/claims/my-claims');
  return response.data;
};

export const updateClaimStatus = async (claimId: number, status: string): Promise<Claim> => {
  const response = await api.patch(`/claims/${claimId}/status`, { status });
  return response.data;
};

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get('/users/me');
  return response.data;
};

export const uploadImage = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default api;
