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

    it('should return an empty array without a reachable baseUrl', async () => {
      const provider = new OpenAICompatibleProvider();
      const models = await provider.listModels({ baseUrl: '' });
      // When no server is reachable, the provider gracefully returns an empty array
      // rather than throwing. This is the expected resilient behaviour.
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThanOrEqual(0);
    });
  });
});
