// Farcaster Frame SDK integration
let sdkInitialized = false;

export async function initializeFrameSDK() {
  if (sdkInitialized) return;
  
  try {
    const { sdk } = await import('@farcaster/frame-sdk');
    await sdk.actions.ready();
    sdkInitialized = true;
    console.log('Farcaster Frame SDK initialized successfully');
  } catch (error) {
    console.log('Frame SDK not available or failed to initialize:', error);
  }
}

// Initialize SDK when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initializeFrameSDK, 100);
    });
  } else {
    setTimeout(initializeFrameSDK, 100);
  }
}