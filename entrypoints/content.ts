import { handleMessage, type Message } from "@/src/messages";

declare global {
  interface Window {
    dummioReady?: boolean;
  }
}

export default defineContentScript({
  registration: "runtime",
  main() {
    if (window.dummioReady) return;
    window.dummioReady = true;
    browser.runtime.onMessage.addListener(
      (message: Message, _sender, sendResponse) => {
        sendResponse(handleMessage(message));
      },
    );
  },
});
