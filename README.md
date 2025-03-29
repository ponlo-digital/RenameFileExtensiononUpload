Websites Acting Picky About File Types? Fight Back with the Rename File Extension on Upload extension! ✊

You crafted the perfect code (.js, .ts), tweaked that config (.yaml, .cfg), or saved essential logs (.log), but NOOOO! The website throws a digital tantrum: "ONLY .TXT FILES ALLOWED!" 😩

Don't let stubborn upload forms dictate your file life! Rename File Extension on Upload is your sneaky sidekick. It intercepts those files right before they leave your browser and whispers sweet .txt nothings into their names. ✨ Poof! ✨ The website is none the wiser, and your upload sails through.

How the Magic Happens:

You Make the Hit List: Head to Options and tell the Renamer which pesky extensions need a .txt disguise (no dots needed!).

Grant Site Access: Visit the picky website, click the Renamer's icon, and hit "Enable on This Site". You're the boss – it only works where you say so!

Upload Like Normal: Select your .ts, .log, or other text-based file.

Instant Makeover: The Renamer swaps the extension to .txt in a flash, locally in your browser. Your original file is untouched!

Awesome Perks:

✅ You Control the List: Rename only the extensions that annoy you.

🔒 Site-Specific Action: Enable the magic only on the websites you choose via the popup.

🚀 "Rename EVERYTHING" Mode: Feeling bold? A toggle lets you slap a .txt ending on any file you upload (use with gusto, or caution!).

👀 Manage Permissions: Easily see and revoke access for sites in the Options page.


![image](https://github.com/user-attachments/assets/6ba2ee65-5085-4f25-9cb7-203f18354011)


Okay, here's a manual "How to Use" guide specifically for until its accepted to the Chrome Extension Store:

**How to Install and Use Manually**

This guide assumes you have the extension code extracted in a folder on your computer.

**1. Install the Unpacked Extension:**

*   Open Google Chrome.
*   Navigate to the Extensions page by typing `chrome://extensions` in your address bar and pressing Enter.
*   **Enable Developer Mode:** In the top-right corner of the Extensions page, find the "Developer mode" toggle switch and make sure it's turned ON.
*   **Load the Extension:**
    *   Click the **"Load unpacked"** button that appears (usually top-left).
    *   A file browser dialog will open. Navigate to and select the **FOLDER** that contains your extension's files (the one with `manifest.json`, `content.js`, `popup.html`, `options.html`, etc.). **Do NOT select an individual file.** Click "Select Folder".
*   **Confirm Installation:** The extension ("Rename File Extension on Upload (OptPerm)" or similar name) should now appear in your list of extensions. You should also see its icon in your Chrome toolbar (you might need to click the puzzle piece icon 🧩 to find and pin it). If you see errors here, double-check your `manifest.json`.

**2. Configure Initial Settings:**

*   **Open Options:** Right-click the extension's icon in your toolbar and select **"Options"**. This will open the `options.html` page in a new tab.
*   **Set Extensions to Rename:** In the first text box, enter the file extensions (without the leading dot) that you want the extension to change to `.txt`. You can separate them with commas (e.g., `ts, js, css, log`) or put each on a new line. Leave this empty if you only plan to use the "Rename ALL" feature.
*   **Set "Rename ALL" (Optional):** If you want the extension to rename *any* file it processes to `.txt` (ignoring the list above), check the box next to "Rename ALL selected files to .txt".
*   **Review Enabled Sites List:** Notice the section "Sites Enabled via Popup". This will be empty initially.
*   **Save:** Click the **"Save Settings"** button.

**3. Enable on a Target Website:**

*   **Navigate:** Go to the website where you want to test the file renaming (e.g. `https://aistudio.google.com`).
*   **Click Icon:** Click the extension's icon in the Chrome toolbar.
*   **Check Popup:** A small popup window should appear. It will likely show:
    `❌ Disabled on: aistudio.google.com`
*   **Enable:** Click the green **"Enable on This Site"** button within the popup.
*   **Grant Permission:** Chrome will likely show a permission prompt asking if you want to allow the extension to "Read and change your data on aistudio.google.com". Click **"Allow"**.
*   **Verify Popup:** The popup should refresh and now show:
    `✅ Enabled on: aistudio.google.com`
    The "Disable on This Site" button should now be visible.

**4. Using the extension:**

*   **Stay on the Enabled Site:** Make sure you are still on the site where you just enabled the extension (e.g., `aistudio.google.com`).
*   **Initiate Upload:** Use the website's normal file upload mechanism (click an "Upload File" button, drag-and-drop, etc.).
*   **Select File:** Choose a file whose extension you added in the options (e.g., `mycode.ts`) OR any file if you checked "Rename ALL".
*   **Observe:**
    *   The file *should* be accepted by the website as if it were a `.txt` file.
    *   Check the website's UI – if it displays the filename after selection, it should show the `.txt` version (e.g., `mycode.txt`).

**5. Verify and Troubleshoot (If Needed):**

*   **Check Options Page:** Refresh the extension's Options tab. The website you enabled (e.g. `aistudio.google.com`) should now appear in the "Sites Enabled via Popup" list.
*   **Check Console:** If the renaming didn't work:
    *   On the `aistudio.google.com` page, press F12 to open Developer Tools and go to the "Console" tab.
    *   Look for any messages starting with `[RenameExt]`. You should see logs confirming the config loaded and, crucially, a log like `[RenameExt] ✅ Renaming "mycode.ts" to "mycode.txt"` if it worked.
    *   Look for any red error messages (`❌`).
*   **Re-check Settings:** Ensure the extensions are listed correctly in the options (no dots) and that you saved the settings.
*   **Reload Everything:** If things seem stuck, try removing the extension (`chrome://extensions`), reloading it ("Load unpacked"), hard-refreshing the target page (Ctrl+Shift+R), and re-enabling via the popup.

Repeat steps 3 and 4 for any other websites you need to use the extension on.
