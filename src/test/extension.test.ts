// Description: This file contains the test cases for the extension.

// Import the necessary modules
import * as assert from 'assert';
import * as vscode from 'vscode';

// Defines a Mocha test suite to group tests of similar kind together
suite('Extension Test Suite', () => {
	// Defines a Mocha unit test
	vscode.window.showInformationMessage('Start all tests.');

	// Sample test
	test('Sample test', () => {
		// Test case
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});
