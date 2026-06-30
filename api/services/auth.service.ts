import { AxiosResponse } from 'axios';
import { apiClient } from '../../helpers/api.client';

export class AuthService {
  login(username: string, password: string): Promise<AxiosResponse> {
    return apiClient.post('/auth/login', { username, password });
  }
}
