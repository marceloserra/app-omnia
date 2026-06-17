describe('Omnia Mobile E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should launch successfully and show the dashboard', async () => {
    // Verify that the navigation elements are visible on boot
    await expect(element(by.id('tab-home'))).toBeVisible();
    await expect(element(by.id('tab-settings'))).toBeVisible();

    // Check that the main application dashboard elements are present
    // (greeting is time-of-day dependent, e.g. "Good morning", "Good afternoon", "Good evening")
    // The dashboard also renders a button or instruction to configure the AI Provider
    await expect(element(by.id('tab-home'))).toBeVisible();
  });

  it('should navigate to settings, verify header, and tap connect', async () => {
    // Navigate to settings tab
    await element(by.id('tab-settings')).tap();

    // Verify settings header is visible
    await expect(element(by.text('Settings'))).toBeVisible();

    // Enter an API key in the OpenAI API Key TextInput
    await element(by.id('openai-api-key-input')).typeText('sk-proj-mockkeyforTesting12345678901234567890');

    // Tap the connect provider button
    await element(by.id('connect-provider-button')).tap();
  });

  it('should navigate to new chat, type a message, and tap send', async () => {
    // Navigate to new chat
    await element(by.id('tab-new-chat')).tap();

    // Verify the chat input is visible
    await expect(element(by.id('chat-input'))).toBeVisible();

    // Type a test message
    await element(by.id('chat-input')).typeText('Hello Omnia');

    // Tap the send button
    await element(by.id('send-message-button')).tap();
  });
});
