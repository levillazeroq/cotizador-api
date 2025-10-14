import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class InventoryService {
  private readonly apiClient: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.apiClient = axios.create({
      baseURL: 'https://9gj5x92upk.execute-api.us-east-2.amazonaws.com/v1/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': '',
        'X-Organization-ID': '11111111-1111-1111-1111-111111111112'
      },
    });

    // Request interceptor
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`🚀 [Inventory API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ [Inventory API] Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.apiClient.interceptors.response.use(
      (response) => {
        console.log(`✅ [Inventory API] ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ [Inventory API] Response Error:', error.response?.status, error.response?.data);
        
        if (error.response) {
          const { status, data } = error.response;
          
          switch (status) {
            case 400:
              throw new HttpException(data.error || 'Solicitud inválida', HttpStatus.BAD_REQUEST);
            case 401:
              throw new HttpException('No autorizado', HttpStatus.UNAUTHORIZED);
            case 403:
              throw new HttpException('Acceso denegado', HttpStatus.FORBIDDEN);
            case 404:
              throw new HttpException('Recurso no encontrado', HttpStatus.NOT_FOUND);
            case 409:
              throw new HttpException(data.error || 'Conflicto', HttpStatus.CONFLICT);
            case 422:
              throw new HttpException(data.error || 'Datos de validación incorrectos', HttpStatus.UNPROCESSABLE_ENTITY);
            case 500:
              throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
            default:
              throw new HttpException(data.error || `Error ${status}`, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        } else if (error.request) {
          throw new HttpException('Sin respuesta del servidor', HttpStatus.SERVICE_UNAVAILABLE);
        } else {
          throw new HttpException(error.message || 'Error de conexión', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    );
  }

  // GET request
  async get<T = any>(url: string, params?: any): Promise<T> {
    const response = await this.apiClient.get(url, { params });
    return response.data;
  }

  // POST request
  async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.apiClient.post(url, data);
    return response.data;
  }

  // PUT request
  async put<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.apiClient.put(url, data, {
      headers: {
        'If-Match': new Date().getTime().toString(),
      },
    });
    return response.data;
  }

  // PATCH request
  async patch<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.apiClient.patch(url, data);
    return response.data;
  }

  // DELETE request
  async delete<T = any>(url: string): Promise<T> {
    const response = await this.apiClient.delete(url);
    return response.data;
  }
}
