/**
 * LLM Client
 * 
 * LLM API 클라이언트 (Gemini API 지원)
 */

export interface LLMConfig {
  /** API 키 */
  apiKey?: string;
  /** 모델 이름 */
  model?: string;
  /** 기본 프롬프트 */
  systemPrompt?: string;
  /** 온도 (0-1) */
  temperature?: number;
  /** 최대 토큰 수 */
  maxTokens?: number;
}

export interface LLMResponse {
  /** 생성된 텍스트 */
  text: string;
  /** 사용된 토큰 수 */
  tokensUsed?: number;
  /** 완료 여부 */
  finished: boolean;
}

/**
 * LLM 클라이언트 인터페이스
 */
export interface ILLMClient {
  /**
   * 텍스트를 생성합니다.
   */
  generate(prompt: string, config?: Partial<LLMConfig>): Promise<LLMResponse>;
  
  /**
   * 구조화된 출력을 생성합니다.
   */
  generateStructured<T>(
    prompt: string,
    schema: Record<string, unknown>,
    config?: Partial<LLMConfig>
  ): Promise<T>;
}

/**
 * Gemini API 클라이언트
 */
export class GeminiClient implements ILLMClient {
  private config: Required<LLMConfig>;
  private apiKey: string;
  
  constructor(config: LLMConfig = {}) {
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY || '';
    this.config = {
      apiKey: this.apiKey,
      model: config.model || 'gemini-pro',
      systemPrompt: config.systemPrompt || 'You are a helpful AI assistant.',
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens || 2048,
    };
  }
  
  /**
   * 텍스트를 생성합니다.
   */
  async generate(prompt: string, config?: Partial<LLMConfig>): Promise<LLMResponse> {
    const finalConfig = { ...this.config, ...config };
    
    if (!finalConfig.apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    // TODO: 실제 Gemini API 호출
    // 예시:
    // const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${finalConfig.model}:generateContent?key=${finalConfig.apiKey}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     contents: [{
    //       parts: [{ text: `${finalConfig.systemPrompt}\n\n${prompt}` }]
    //     }],
    //     generationConfig: {
    //       temperature: finalConfig.temperature,
    //       maxOutputTokens: finalConfig.maxTokens,
    //     },
    //   }),
    // });
    // const data = await response.json();
    // return { text: data.candidates[0].content.parts[0].text, finished: true };
    
    // 임시 구현
    return {
      text: `[Gemini API Response - ${finalConfig.model}]\n${prompt}`,
      finished: true,
    };
  }
  
  /**
   * 구조화된 출력을 생성합니다.
   */
  async generateStructured<T>(
    prompt: string,
    schema: Record<string, unknown>,
    config?: Partial<LLMConfig>
  ): Promise<T> {
    const structuredPrompt = `${prompt}\n\n응답은 다음 JSON 스키마를 따라야 합니다:\n${JSON.stringify(schema, null, 2)}`;
    
    const response = await this.generate(structuredPrompt, config);
    
    try {
      // JSON 파싱 시도
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as T;
      }
    } catch (error) {
      console.error('Failed to parse structured response:', error);
    }
    
    // 파싱 실패 시 기본값 반환
    return {} as T;
  }
}

/**
 * 기본 LLM 클라이언트 인스턴스
 */
export const llmClient = new GeminiClient();




