import { AxiosResponse } from 'axios';
import { apiClient } from '../../helpers/api.client';

export class BaseService {
  protected resource: string;

  constructor(resource: string) {
    this.resource = resource;
  }

  getAll(params: Record<string, unknown> = {}): Promise<AxiosResponse> {
    return apiClient.get(`/${this.resource}`, { params });
  }

  getById(id: number): Promise<AxiosResponse> {
    return apiClient.get(`/${this.resource}/${id}`);
  }

  create<T>(payload: T): Promise<AxiosResponse> {
    return apiClient.post(`/${this.resource}`, payload);
  }

  update<T>(id: number, payload: T): Promise<AxiosResponse> {
    return apiClient.put(`/${this.resource}/${id}`, payload);
  }

  patch<T>(id: number, payload: T): Promise<AxiosResponse> {
    return apiClient.patch(`/${this.resource}/${id}`, payload);
  }

  delete(id: number): Promise<AxiosResponse> {
    return apiClient.delete(`/${this.resource}/${id}`);
  }
}
