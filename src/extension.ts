import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

const SOUND_KEY = 'pushTags.selectedSound';

type SoundItem = {
	label: string;
	type: 'default' | 'custom';
	file: string;
};

export function activate(context: vscode.ExtensionContext) {
	console.log('EXTENSION ACTIVATED');

	// ensure custom sound folder exists
	const customDir = path.join(context.globalStorageUri.fsPath, 'custom');
	fs.mkdirSync(customDir, { recursive: true });

	// register command
	context.subscriptions.push(
		vscode.commands.registerCommand('push-tags.selectSound', async () => {
			const sounds = await getAllSounds(context);

			const pick = await vscode.window.showQuickPick(
				[
					...sounds.map(s => ({
						label: s.type === 'custom' ? `📁 ${s.label}` : `🎵 ${s.label}`,
						description: s.type,
						sound: s
					})),

					{ label: '────────────', kind: vscode.QuickPickItemKind.Separator },

					{
						label: '➕ Upload Custom Sound',
						description: 'import mp3 from your computer',
						sound: null
					}
				],
				{ placeHolder: 'Select Push Sound' }
			);

			if (!pick) return;

			// HANDLE UPLOAD
			if (!pick.sound) {
				await handleUpload(context);
				return;
			}

			// SAVE SELECTION
			await context.globalState.update(SOUND_KEY, {
				type: pick.sound.type,
				file: pick.sound.file
			});

			vscode.window.showInformationMessage(`Sound set to ${pick.sound.label}`);
		})
	);

	// terminal hook
	const terminalListener = vscode.window.onDidStartTerminalShellExecution?.((e) => {
		const cmd = e.execution?.commandLine?.value;
		if (!cmd) return;

		if (cmd.includes('git push')) {
			playSound(context);
		}
	});

	if (terminalListener) context.subscriptions.push(terminalListener);
}

/* ---------------- SOUND LIST ---------------- */

async function getAllSounds(context: vscode.ExtensionContext): Promise<SoundItem[]> {
	const defaultDir = path.join(context.extensionPath, 'media', 'default');
	const customDir = path.join(context.globalStorageUri.fsPath, 'custom');

	const defaultSounds = fs.existsSync(defaultDir)
		? fs.readdirSync(defaultDir)
			.filter(f => f.endsWith('.mp3'))
			.map(f => ({
				label: f.replace('.mp3', ''),
				type: 'default' as const,
				file: f
			}))
		: [];

	const customSounds = fs.existsSync(customDir)
		? fs.readdirSync(customDir)
			.filter(f => f.endsWith('.mp3'))
			.map(f => ({
				label: f.replace('.mp3', ''),
				type: 'custom' as const,
				file: f
			}))
		: [];

	return [...defaultSounds, ...customSounds];
}

/* ---------------- UPLOAD ---------------- */

async function handleUpload(context: vscode.ExtensionContext) {
	const files = await vscode.window.showOpenDialog({
		canSelectMany: false,
		openLabel: 'Select Sound',
		filters: {
			Audio: ['mp3', 'wav', 'm4a']
		}
	});

	if (!files || files.length === 0) return;

	const file = files[0];

	const customDir = path.join(context.globalStorageUri.fsPath, 'custom');

	const fileName = `${Date.now()}-${path.basename(file.fsPath)}`;
	const dest = path.join(customDir, fileName);

	fs.copyFileSync(file.fsPath, dest);

	vscode.window.showInformationMessage('Custom sound added!');
}

/* ---------------- PLAY SOUND ---------------- */

function playSound(context: vscode.ExtensionContext) {
	const selected = context.globalState.get<any>(SOUND_KEY);

	let soundPath: string;

	// default fallback
	if (!selected) {
		soundPath = path.join(context.extensionPath, 'media', 'default', 'ok.mp3');
	} else if (selected.type === 'custom') {
		soundPath = path.join(context.globalStorageUri.fsPath, 'custom', selected.file);
	} else {
		soundPath = path.join(context.extensionPath, 'media', 'default', selected.file);
	}

	try {
		if (process.platform === 'darwin') {
			exec(`afplay "${soundPath}"`);
		} else if (process.platform === 'win32') {
			exec(`powershell -c (New-Object Media.SoundPlayer "${soundPath}").PlaySync();`);
		} else {
			exec(`ffplay -nodisp -autoexit "${soundPath}"`);
		}
	} catch (err) {
		console.error('sound failed:', err);
	}
}

export function deactivate() {}