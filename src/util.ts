// Purpose: The main file for the extension, containing the RPC init function, logging functions, and the RPC update function.
// This file is responsible for initializing the extension and updating the RPC.

//Import the necessary modules
import {
  ExtensionContext,
  window,
  workspace,
  TextDocument,
  version,
  commands,
} from "vscode";
import { extname, basename } from "path";
import { Client } from "@xhayper/discord-rpc";

let rpc = new Client({
  clientId: workspace.getConfiguration("vscoderpc").get("clientId") || "1147502929687875614",
});

//Idle checker
let date = new Date();
let idle = false;

//Discord RPC init function
/**
 * @param {ExtensionContext} context
 */
export async function init(context: ExtensionContext) {
  //Log that the extension is started
  logInfo("[init()] Registering events and commands.");

  //Register the events and commands
  registerEvents(context);
  registerCommands(context);

  //Log that the extension is activated
  logInfo("[init()] Login to Discord RPC, and update the RPC.");
  await rpc.login().then(() => {
    //Log that the extension is logged in to Discord RPC
    logInfo("[init()] Logged in to Discord RPC...");
    setTimeout(function () {
      //Update the RPC after 2 seconds
      updateRPC(window.activeTextEditor?.document);

      //Log that the extension is activated
      logInfo("[init()] Activate completed!");
    }, 2000);
  });
}

//Logging functions
export function logInfo(message: string) {
  console.log(`[INFO ${new Date()}] ${message}`);
}

function logError(message: string) {
  console.error(`[ERROR ${new Date()}] ${message}`);
}

//Update RPC
async function updateRPC(vscodeTextDocument: TextDocument | undefined) {
  try {
    const configuration = workspace.getConfiguration("vscoderpc");
    console.log(window.activeTextEditor?.document.uri.fsPath);
    if (vscodeTextDocument?.fileName && !configuration.get("privateMode")) {
      //If the file is not empty and private mode is not enabled
      rpc.user?.setActivity({
        details: workspace.name
          ? `In workspace "${workspace.name}".`
          : "There is no active workspace.",
        state: `Editing file "${basename(vscodeTextDocument.fileName)}".`,
        startTimestamp: date,
        largeImageKey: `https://raw.githubusercontent.com/LeonardSSH/vscord/main/assets/icons/${extname(
          vscodeTextDocument?.uri.fsPath
        ).replace(".", "")}.png`,
        largeImageText: `Extension: ${vscodeTextDocument.languageId}`,
      });
    } else if (
      vscodeTextDocument?.fileName &&
      !configuration.get("privateMode")
    ) {
      //If the file is empty and private mode is not enabled
      rpc.user?.setActivity({
        details: workspace.name
          ? `In workspace ${workspace.name}.`
          : "There is no active workspace.",
        state: `There are no active files.`,
        startTimestamp: date,
        largeImageKey: "vscode",
        largeImageText: `Visual Studio Code v${version}`,
      });
    } else {
      //If private mode is enabled
      rpc.user?.setActivity({
        state: `Private mode is enabled.`,
        startTimestamp: date,
        largeImageKey: "vscode",
        largeImageText: `Visual Studio Code v${version}`,
      });
    }
  } catch (e: any) {
    //If there is an error, log it and show an error message
    logError(e);
    if (e.toString().includes("reading 'fileName")) {
      rpc.user?.setActivity({
        details: workspace.name
          ? `In workspace ${workspace.name}.`
          : "There is no active workspace.",
        state: `There are no active files.`,
        startTimestamp: date,
        largeImageKey: "vscode",
        largeImageText: `Visual Studio Code v${version}`,
      });
      return;
    }
    const result = await window.showErrorMessage(
      `Error during Discord RPC connection: ${
        e.name
      } (Error Details: ${e.toString()})`,
      "Reconnect"
    );
    if (result === "Reconnect") {
      //If the user clicks "Reconnect", reconnect the RPC
      commands.executeCommand("vscoderpc.reconnectrpc");
      logInfo("Error -> Reconnected");
    }
  }
}

//Not focused RPC
async function notFocusedRPC() {
  try {
    if (window.activeTextEditor?.document.fileName) {
      //If the file is not empty and private mode is not enabled
      rpc.user?.setActivity({
        details: workspace.name
          ? `In workspace "${workspace.name}".`
          : "There is no active workspace.",
        state: `Away from the window. (File: "${basename(
          window.activeTextEditor?.document.fileName
        )}")`,
        startTimestamp: date,
        smallImageKey: "idle",
        smallImageText: "Away",
        largeImageKey: `https://raw.githubusercontent.com/LeonardSSH/vscord/main/assets/icons/${extname(
          window.activeTextEditor?.document.uri.fsPath
        ).replace(".", "")}.png`,
        largeImageText: `Extension: ${window.activeTextEditor?.document.languageId}`,
      });
    } else {
      //If the file is empty and private mode is not enabled
      rpc.user?.setActivity({
        details: workspace.name
          ? `In workspace ${workspace.name}.`
          : "There is no active workspace.",
        state: `Away from the window. (No Active files)`,
        startTimestamp: date,
        smallImageKey: "idle",
        smallImageText: "Away",
        largeImageKey: "vscode",
        largeImageText: `Visual Studio Code v${version}`,
      });
    }
    //Log the RPC update
    logInfo("--RPC Update--");
    logInfo(`mode: idle`);
    logInfo(`date: ${date}`);
    logInfo("==RPC Update==");
  } catch (e: any) {
    //If there is an error, log it and show an error message
    logError(e);
    const result = await window.showErrorMessage(
      `Error during Discord RPC connection: ${e.name}`,
      "Reconnect"
    );
    if (result === "Reconnect") {
      //If the user clicks "Reconnect", reconnect the RPC
      commands.executeCommand("vscoderpc.reconnectrpc");
      logInfo("Error -> Reconnected");
    }
  }
}

//Register Commands
async function registerCommands(context: ExtensionContext) {
  //Start RPC
  let startRPC = commands.registerCommand("vscoderpc.startrpc", async () => {
    try {
      //Destroy the current RPC
      rpc = new Client({
        clientId: workspace.getConfiguration("vscoderpc").get("clientId") || "1147502929687875614",
      });

      //Set the date to the current date
      date = new Date();

      //Login to the RPC
      await rpc.login().then(() => {
        updateRPC(window.activeTextEditor?.document);
      });
      window.showInformationMessage("RPC has been initiated.");
    } catch (e: any) {
      //If there is an error, log it and show an error message
      logError(e);
      const result = await window.showErrorMessage(
        `Error during Discord RPC connection: ${
          e.name
        } (Error Details: ${e.toString()})`,
        "Reconnect"
      );
      if (result === "Reconnect") {
        //If the user clicks "Reconnect", reconnect the RPC
        commands.executeCommand("vscoderpc.reconnectrpc");
        logInfo("Error -> Reconnected");
      }
    }
  });

  //Stop RPC
  let stopRPC = commands.registerCommand("vscoderpc.stoprpc", () => {
    //Destroy the current RPC
    rpc.destroy();
    window.showInformationMessage("RPC has been stopped.");
  });

  //Reload RPC
  let reloadRPC = commands.registerCommand(
    "vscoderpc.reconnectrpc",
    async () => {
      try {
        //Destroy the current RPC
        rpc.destroy();

        //Create a new RPC
        rpc = new Client({
          clientId:
            workspace.getConfiguration("vscoderpc").get("clientId") || "",
        });

        //Set the date to the current date
        date = new Date();

        //Login to the RPC
        await rpc.login().then(() => {
          updateRPC(window.activeTextEditor?.document);
        });
        window.showInformationMessage("RPC has been reconnected.");
        logInfo("RPC reconnected.");
      } catch (e: any) {
        //If there is an error, log it and show an error message
        logError(e);
        const result = await window.showErrorMessage(
          `Error during Discord RPC connection: ${e.name}`,
          "Reconnect"
        );
        if (result === "Reconnect") {
          //If the user clicks "Reconnect", reconnect the RPC
          commands.executeCommand("vscoderpc.reconnectrpc");
          logInfo("Error -> Reconnected");
        }
      }
    }
  );

  //Push the commands to the context
  context.subscriptions.push(startRPC, stopRPC, reloadRPC);
}

//Register Events
function registerEvents(context: ExtensionContext) {
  //On file changed
  const onFileChanged = workspace.onDidOpenTextDocument(async (ev) => {
    updateRPC(ev);
  });

  //On window state changed
  const onWindowStateChanged = window.onDidChangeWindowState(async (ev) => {
    if (!workspace.getConfiguration("vscoderpc").get("privateMode")) {
      //If private mode is not enabled
      if (ev.focused && idle) {
        //If the window is focused and the RPC is idle
        idle = false;
        updateRPC(window.activeTextEditor?.document);
      } else {
        //If the window is not focused and the RPC is not idle
        idle = true;
        notFocusedRPC();
      }
    }
  });

  //Push the events to the context
  context.subscriptions.push(onFileChanged, onWindowStateChanged);

  //Log the event registration
  logInfo("Event listeners have been registered.");
}
