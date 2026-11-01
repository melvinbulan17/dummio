import { loadFillOptions } from "@/src/storage/settings";
import { FILL_COMMAND } from "@/src/shortcut";
import { sendToTab } from "@/src/tab";

const FILL_FIELD_MENU = "fill-field";

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: FILL_FIELD_MENU,
      title: "Fill this field",
      contexts: ["editable"],
    });
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== FILL_FIELD_MENU || tab?.id === undefined) return;
    const tabId = tab.id;
    void loadFillOptions(tab.url).then((options) =>
      sendToTab(tabId, { type: "fill-focused", options }, info.frameId ?? 0),
    );
  });

  browser.commands.onCommand.addListener((command, tab) => {
    if (command !== FILL_COMMAND || tab?.id === undefined) return;
    const tabId = tab.id;
    void loadFillOptions(tab.url).then((options) =>
      sendToTab(tabId, { type: "fill-page", options }),
    );
  });
});
