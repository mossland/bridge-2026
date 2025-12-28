import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LLMClient } from '@bridge-2026/agentic-consensus';

@Injectable()
export class LLMService {
  private llmClient: LLMClient;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not set, LLM features will be disabled');
    } else {
      this.llmClient = new LLMClient({
        apiKey,
        model: 'gemini-pro',
      });
    }
  }

  async generateText(prompt: string): Promise<string> {
    if (!this.llmClient) {
      throw new Error('LLM client not initialized. Please set GEMINI_API_KEY.');
    }

    return this.llmClient.generateText(prompt);
  }

  async generateStructured(prompt: string, schema: any): Promise<any> {
    if (!this.llmClient) {
      throw new Error('LLM client not initialized. Please set GEMINI_API_KEY.');
    }

    return this.llmClient.generateStructured(prompt, schema);
  }
}

