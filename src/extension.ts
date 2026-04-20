import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
	console.log('push-sound extension active');

	// listens to ANY terminal command execution
	const terminalListener = vscode.window.onDidStartTerminalShellExecution?.(async (e) => {
		try {
			const commandLine = e.execution?.commandLine?.value;

			if (!commandLine) return;

			console.log('terminal command:', commandLine);

			// detect git commit
			if (commandLine.includes('git commit')) {
				playSound(context);
			}
		} catch (err) {
			console.error('terminal hook error:', err);
		}
	});

	if (terminalListener) {
		context.subscriptions.push(terminalListener);
	} else {
		console.log('Terminal shell execution API not available in this VS Code version');
	}
}

function playSound(context: vscode.ExtensionContext) {
	const soundPath = path.join(context.extensionPath, 'media', 'tagwmv.mp3');

	const platform = process.platform;

	try {
		if (platform === 'darwin') {
			exec(`afplay "${soundPath}"`);
		} 
		else if (platform === 'win32') {
			exec(`powershell -c (New-Object Media.SoundPlayer "${soundPath}").PlaySync();`);
		} 
		else {
			exec(`ffplay -nodisp -autoexit "${soundPath}"`);
		}
	} catch (err) {
		console.error('sound failed:', err);
	}
}

export function deactivate() {}