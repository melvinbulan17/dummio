import { DEFAULT_OPTIONS, sendToTab } from "@/src/tab";

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
    void sendToTab(
      tab.id,
      { type: "fill-focused", options: DEFAULT_OPTIONS },
      info.frameId ?? 0,
    );
  });

  browser.commands.onCommand.addListener((command, tab) => {
    if (command !== "fill-page" || tab?.id === undefined) return;
    void sendToTab(tab.id, { type: "fill-page", options: DEFAULT_OPTIONS });
  });
});
