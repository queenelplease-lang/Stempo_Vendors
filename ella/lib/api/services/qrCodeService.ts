import { apiClient } from '../client';
import { QRCode, QRCodeType } from '@/types';

export interface GenerateQRRequest {
  programId: number;
  type: QRCodeType;
}

export const generateQRCode = async (data: GenerateQRRequest): Promise<QRCode> => {
  const response = await apiClient.post<QRCode>('/qr-codes/generate', data);
  
  if (response.error) {
    throw new Error(response.error.message || 'Failed to generate QR code');
  }
  
  if (!response.data) {
    throw new Error('No data received');
  }

  return response.data;
};

export const validateQRCode = async (code: string): Promise<QRCode> => {
  const response = await apiClient.get<QRCode>(`/qr-codes/validate/${code}`);
  
  if (response.error) {
    throw new Error(response.error.message || 'Failed to validate QR code');
  }
  
  if (!response.data) {
    throw new Error('No data received');
  }

  return response.data;
};

export const getQRCodesByProgram = async (programId: number): Promise<QRCode[]> => {
  const response = await apiClient.get<QRCode[]>(`/qr-codes/program/${programId}`);
  
  if (response.error) {
    throw new Error(response.error.message || 'Failed to get QR codes');
  }
  
  return Array.isArray(response.data) ? response.data : [];
};

export const getQRCodesByBusiness = async (businessId: number): Promise<QRCode[]> => {
  const response = await apiClient.get<QRCode[]>(`/qr-codes/business/${businessId}`);
  
  if (response.error) {
    throw new Error(response.error.message || 'Failed to get QR codes');
  }
  
  return Array.isArray(response.data) ? response.data : [];
};

export const deleteQRCode = async (id: number): Promise<void> => {
  const response = await apiClient.delete(`/qr-codes/${id}`);
  
  if (response.error) {
    throw new Error(response.error.message || 'Failed to delete QR code');
  }
};
