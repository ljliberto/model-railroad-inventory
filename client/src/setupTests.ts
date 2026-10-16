import '@testing-library/jest-dom/vitest';

// Keep tests isolated from external script downloads (for example Google APIs).
window.happyDOM.settings.disableJavaScriptFileLoading = true;
