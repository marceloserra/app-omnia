import { OpenAIProvider } from '../openai';
import { OpenAICompatibleProvider } from '../openai-compatible';

describe('Providers Package', () => {
  describe('OpenAIProvider', () => {
    it('should be instantiable', () => {
      const provider = new OpenAIProvider();
      expect(provider).toBeDefined();
    });

    it('should throw error without api key', async () => {
      const provider = new OpenAIProvider();
      await expect(provider.listModels({ apiKey: '' })).rejects.toThrow();
    });
  });

  describe('OpenAICompatibleProvider', () => {
    it('should be instantiable', () => {
      const provider = new OpenAICompatibleProvider();
      expect(provider).toBeDefined();
    });

    it('should require baseUrl', async () => {
      const provider = new OpenAICompatibleProvider();
      await expect(provider.listModels({ baseUrl: '' })).rejects.toThrow();
    });
  });
});
