import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConversationsService {
  private readonly apiClient: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.apiClient = axios.create({
      baseURL: this.configService.get('CONVERSATIONS_API_URL'),
      headers: {
        Authorization: `Bearer ${this.configService.get('CONVERSATIONS_API_KEY')}`,
      },
    });
  }

  async updateConversationCustomStatus(
    conversationId: string,
    customStatus: string,
  ) {
    const response = await this.apiClient.patch(
      `/conversations/${conversationId}`,
      {
        customStatus,
      },
    );
    return response.data;
  }
}
