import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';

const SOUND_KEY = 'pushTags.selectedSound';

export function activate(context: vscode.ExtensionContext) {
	console.log('push-sound extension active');
	console.log('EXTENSION ACTIVATED');

	// register command to choose sound
	context.subscriptions.push(
		vscode.commands.registerCommand('push-tags.selectSound', async () => {
			const options = [
				'Maybach.mp3',
				'Pierre.mp3',
				'Ok.mp3'
			];

			const choice = await vscode.window.showQuickPick(options, {
				placeHolder: 'Pick your commit sound'
			});

			if (!choice) return;

			await context.globalState.update(SOUND_KEY, choice);

			vscode.window.showInformationMessage(`Sound set to ${choice}`);
		})
	);
	console.log("some bs");

	const terminalListener = vscode.window.onDidStartTerminalShellExecution?.(async (e) => {
		try {
			const commandLine = e.execution?.commandLine?.value;
			if (!commandLine) return;

			console.log('terminal command:', commandLine);

			if (commandLine.includes('git push')) {
				playSound(context);
			}
		} catch (err) {
			console.error('terminal hook error:', err);
		}
	});

	if (terminalListener) {
		context.subscriptions.push(terminalListener);
	}
}

function playSound(context: vscode.ExtensionContext) {
	const selected = context.globalState.get<string>('pushTags.selectedSound') || 'tagwmv.mp3';

	const soundPath = path.join(context.extensionPath, 'media', selected);

	try {
		if (process.platform === 'darwin') {
			exec(`afplay "${soundPath}"`);
		} 
		else if (process.platform === 'win32') {
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