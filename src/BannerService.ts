
import axios from 'axios';
import { Banner } from './Banner';

const API_URL =
  process.env.NODE_ENV === 'production'
    ? `${process.env.URL}/banners`
    : 'http://localhost:5000/banners';



export const getBanners = async () => {
  const response = await axios.get(API_URL);
  return response.data.filter((banner:Banner)=> banner.status!=='Tạm dừng').sort((a:Banner, b:Banner) => b.order - a.order);
};

export const getBannerById = async (id: number) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createBanner = async (banner: Banner) => {
  const response = await axios.post(API_URL, banner);
  return response.data;
};

export const updateBanner = async (id: string, banner: Banner) => {
  const response = await axios.put(`${API_URL}/${id}`, banner);
  return response.data;
};

export const deleteBanner = async (id: string) => {
  console.log("🚀 ~ deleteBanner ~ id:", id)
  const response = await axios.delete(`${API_URL}/${id}`);
  console.log("🚀 ~ deleteBanner ~ response:", response)
  return response.data;
};
