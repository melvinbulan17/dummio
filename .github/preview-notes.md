<p align="center">
  <img src="https://raw.githubusercontent.com/melvinbulan17/form-filler/main/public/icon/128.png" width="72" height="72" alt="Dummio icon">
</p>

<h2 align="center">Dummio preview</h2>

<p align="center">
  Realistic test data for any form, in one click.<br>
  Thanks for trying it early. This build updates whenever a fix lands.
</p>

---

### What to download

| Browser                    | File                   |
| -------------------------- | ---------------------- |
| Chrome, Edge, Brave, Opera | **dummio-chrome.zip**  |
| Firefox                    | **dummio-firefox.zip** |

Both are under **Assets** at the bottom of this page.

### Set it up in Chrome, Edge or Brave

About two minutes.

1. Download **dummio-chrome.zip** and unzip it somewhere you'll keep it, like your Documents folder.
2. Open `chrome://extensions` in the address bar. In Edge it's `edge://extensions`.
3. Switch on **Developer mode**, top right.
4. Click **Load unpacked** and choose the folder you just unzipped. Pick the folder that has `manifest.json` inside.
5. Click the puzzle piece in the toolbar and pin **Dummio** so it's always one click away.

> [!NOTE]
> Chrome may show a small banner about developer mode extensions. That's normal for anything installed outside the Chrome Web Store.

### Set it up in Firefox

1. Download **dummio-firefox.zip**. No need to unzip.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on** and pick the zip.

Firefox removes temporary add-ons when it restarts, so you'll repeat these steps after closing it.

### Try it

Open any page with a form. This public test form works well: https://www.selenium.dev/selenium/web/web-form.html

- **Fill the whole page:** click the Dummio icon, then **Fill page**. Or press **Alt+Shift+F**.
- **Fill one field:** right-click it and choose **Fill this field**.
- **Change how it fills:** open **Settings** from the popup. You can pick Philippine or US data, overwrite fields that already have values, and save fixed values per site, like your usual test email.

Everything happens inside your browser. Dummio has no account, no tracking, and never sends anything anywhere.

### Getting a newer build

1. Download the latest zip from this page.
2. Replace the old folder with the new one.
3. Open `chrome://extensions` and click the reload arrow on Dummio.

### If something's off

<details>
<summary><b>Alt+Shift+F does nothing</b></summary>

Another extension may already use that shortcut, so the browser left it blank. Open `chrome://extensions/shortcuts`, find Dummio, and set the keys you want. In Firefox, go to `about:addons`, click the gear icon, then **Manage Extension Shortcuts**.

</details>

<details>
<summary><b>"This page can't be filled"</b></summary>

Browsers keep extensions off their own pages, like settings, new tabs and the extension store. Try it on a regular website.

</details>

<details>
<summary><b>A field got the wrong kind of value</b></summary>

That's exactly the feedback I'm looking for. Please tell me the page and the field.

</details>

### Tell me what you think

Found a bug or have an idea? [Open an issue](https://github.com/melvinbulan17/form-filler/issues/new) or message me directly. Screenshots help a lot.
