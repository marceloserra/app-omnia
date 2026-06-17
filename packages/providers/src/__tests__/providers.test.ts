import { OpenAIProvider } from '../openai';
import { OpenAICompatibleProvider } from '../openai-compatible';

describe('Providers Package', () => {
  describe('OpenAIProvider', () => {
    it('should be instantiable', () => {
      const provider = new OpenAIProvider();
      expect(provider).toBeDefined();
    });

    it('should return empty array without api key', async () => {
      const provider = new OpenAIProvider();
      const models = await provider.listModels({ apiKey: '' });
      expect(models).toEqual([]);
    });
  });

  describe('OpenAICompatibleProvider', () => {
    it('should be instantiable', () => {
      const provider = new OpenAICompatibleProvider();
      expect(provider).toBeDefined();
    });

    it('should return fallback models without baseUrl', async () => {
      const provider = new OpenAICompatibleProvider();
      const models = await provider.listModels({ baseUrl: '' });
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });
  });
});
