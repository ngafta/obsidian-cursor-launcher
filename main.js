const { Plugin, TFolder, Notice } = require("obsidian");
const { exec } = require("child_process");
const { promisify } = require("util");
const path = require("path");

const execAsync = promisify(exec);

module.exports = class CursorLauncherPlugin extends Plugin {
  async onload() {
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (file instanceof TFolder) {
          menu.addItem((item) => {
            item
              .setTitle("Open in Cursor")
              .setIcon("terminal")
              .onClick(async () => {
                await this.handleFolder(file);
              });
          });
        }
      })
    );
  }

  async handleFolder(folder) {
    try {
      const vaultPath = this.app.vault.adapter.basePath;
      const fullPath = path.join(vaultPath, folder.path);
      
      const command = 
        process.platform === "win32"
          ? `start /B cmd /C "cd /d "${fullPath}" && cursor ."`
          : `cd "${fullPath}" && cursor .`;

      const { stderr } = await execAsync(command);
      
      if (stderr) {
        new Notice("Error launching Cursor! Please make sure Cursor is installed.");
      } else {
        new Notice(`Cursor launched in\n${fullPath}`);
      }
    } catch (error) {
      new Notice("Failed to launch Cursor! Please make sure Cursor is installed.");
    }
  }
};