export const FILL_COMMAND = "fill-page";

type CommandsWithSettings = typeof browser.commands & {
  openShortcutSettings?: () => Promise<void>;
};

export async function fillShortcut(): Promise<string> {
  const commands = await browser.commands.getAll();
  return (
    commands.find((command) => command.name === FILL_COMMAND)?.shortcut ?? ""
  );
}

export async function openShortcutSettings(): Promise<void> {
  const commands = browser.commands as CommandsWithSettings;
  if (commands.openShortcutSettings) return commands.openShortcutSettings();
  await browser.tabs.create({ url: "chrome://extensions/shortcuts" });
}
