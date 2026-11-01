import type { FillOptions } from "./fill/fill";
import type { Message, Reply } from "./messages";

export const DEFAULT_OPTIONS: FillOptions = { locale: "ph", overwrite: false };

export async function sendToTab<M extends Message>(
  tabId: number,
  message: M,
  frameId = 0,
): Promise<Reply<M>> {
  await browser.scripting.executeScript({
    target: { tabId, frameIds: [frameId] },
    files: ["/content-scripts/content.js"],
  });
  return browser.tabs.sendMessage(tabId, message, { frameId });
}
