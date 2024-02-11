// Purpose: Entry point for the extension.
// This file is responsible for activating and deactivating the extension.

// Import the necessary modules
import {ExtensionContext} from 'vscode';
import {logInfo, init} from './util';

// This method is called when your extension is activated
export function activate(context: ExtensionContext) {
	// Log that the extension is started
	logInfo("[activate()] Extension started.");

	// Initialize the extension
	init(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
