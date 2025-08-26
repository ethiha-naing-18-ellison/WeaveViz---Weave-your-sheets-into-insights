import '@testing-library/jest-dom';

// Mock web workers
global.Worker = class Worker {
  constructor(stringUrl: string | URL) {
    this.url = stringUrl.toString();
  }
  
  url: string;
  onmessage: ((this: Worker, ev: MessageEvent) => any) | null = null;
  onerror: ((this: Worker, ev: ErrorEvent) => any) | null = null;
  
  postMessage(message: any): void {
    // Mock implementation
  }
  
  terminate(): void {
    // Mock implementation
  }
  
  addEventListener(type: string, listener: EventListener): void {
    // Mock implementation
  }
  
  removeEventListener(type: string, listener: EventListener): void {
    // Mock implementation
  }
  
  dispatchEvent(event: Event): boolean {
    return true;
  }
};
