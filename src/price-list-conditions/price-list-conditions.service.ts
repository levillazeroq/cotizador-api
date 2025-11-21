import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { PriceListCondition, PriceListConditionsResponse } from './price-list-conditions.types';

@Injectable()
export class PriceListConditionsService {
  private readonly apiClient: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.apiClient = axios.create({
      baseURL: this.configService.get('products.apiUrl'),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: '',
        'X-Organization-ID': 2,
      },
    });

    // Request interceptor
    this.apiClient.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        console.error('❌ [Price List Conditions API] Request Error:', error);
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.apiClient.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error(
          '❌ [Price List Conditions API] Response Error:',
          error.response?.status,
          error.response?.data,
        );

        if (error.response) {
          const { status, data } = error.response;

          switch (status) {
            case 400:
              throw new HttpException(
                data.error || 'Solicitud inválida',
                HttpStatus.BAD_REQUEST,
              );
            case 401:
              throw new HttpException('No autorizado', HttpStatus.UNAUTHORIZED);
            case 403:
              throw new HttpException('Acceso denegado', HttpStatus.FORBIDDEN);
            case 404:
              throw new HttpException(
                'Recurso no encontrado',
                HttpStatus.NOT_FOUND,
              );
            case 409:
              throw new HttpException(
                data.error || 'Conflicto',
                HttpStatus.CONFLICT,
              );
            case 422:
              throw new HttpException(
                data.error || 'Datos de validación incorrectos',
                HttpStatus.UNPROCESSABLE_ENTITY,
              );
            case 500:
              throw new HttpException(
                'Error interno del servidor',
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
            default:
              throw new HttpException(
                data.error || `Error ${status}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
          }
        } else if (error.request) {
          throw new HttpException(
            'Sin respuesta del servidor',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        } else {
          throw new HttpException(
            error.message || 'Error de conexión',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      },
    );
  }

  async getConditions(
    priceListId: string,
    organizationId: string,
    params?: any,
  ): Promise<PriceListConditionsResponse> {
    const response = await this.apiClient.get(`/price-lists/${priceListId}/conditions`, {
      params,
      headers: { 'X-Organization-ID': organizationId },
    });
    return response.data;
  }

  async getConditionById(
    priceListId: string,
    conditionId: string,
    organizationId: string,
  ): Promise<PriceListCondition> {
    const response = await this.apiClient.get(
      `/price-lists/${priceListId}/conditions/${conditionId}`,
      {
        headers: { 'X-Organization-ID': organizationId },
      },
    );
    return response.data;
  }

  // GET request
  async get<T = any>(
    url: string,
    params?: any,
    organizationId?: string,
  ): Promise<T> {
    const response = await this.apiClient.get(url, {
      params,
      headers: organizationId ? { 'X-Organization-ID': organizationId } : {},
    });
    return response.data;
  }

  // POST request
  async post<T = any>(
    url: string,
    data?: any,
    organizationId?: string,
  ): Promise<T> {
    const response = await this.apiClient.post(url, data, {
      headers: organizationId ? { 'X-Organization-ID': organizationId } : {},
    });
    return response.data;
  }

  // PUT request
  async put<T = any>(
    url: string,
    data?: any,
    organizationId?: string,
  ): Promise<T> {
    const response = await this.apiClient.put(url, data, {
      headers: {
        'If-Match': new Date().getTime().toString(),
        ...(organizationId ? { 'X-Organization-ID': organizationId } : {}),
      },
    });
    return response.data;
  }

  // DELETE request
  async delete<T = any>(url: string, organizationId?: string): Promise<T> {
    const response = await this.apiClient.delete(url, {
      headers: organizationId ? { 'X-Organization-ID': organizationId } : {},
    });
    return response.data;
  }
}

