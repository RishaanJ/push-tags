import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { execFile } from 'child_process';

const SOUND_KEY = 'pushTags.selectedSound';
type SoundItem = {
	label: string;
	type: 'default' | 'custom';
	file: string;
};

type SoundState =
	| { type: 'disabled' }
	| { type: 'default' | 'custom'; file: string };

type PickerItem =
	| {
			label: string;
			type: 'sound';
			sound: SoundItem;
	  }
	| {
			label: string;
			type: 'upload';
	  }
	| {
			label: string;
			type: 'folder';
	  }
	| {
			label: string;
			type: 'disable';
	  };

export function activate(context: vscode.ExtensionContext) {
	console.log('EXTENSION ACTIVATED');

	const customDir = path.join(context.globalStorageUri.fsPath, 'custom');
	fs.mkdirSync(customDir, { recursive: true });

	context.subscriptions.push(
		vscode.commands.registerCommand('push-tags.selectSound', async () => {
			const sounds = await getAllSounds(context);

			const items: PickerItem[] = [
				...sounds.map(s => ({
					label: s.type === 'custom' ? `🔉 ${s.label}` : `🎵 ${s.label}`,
					type: 'sound' as const,
					sound: s
				})),

				{
					label: '➕ Upload Custom Sound',
					type: 'upload' as const
				},

				{
					label: '📁 Open Custom Sounds Folder',
					type: 'folder' as const
				},
				{
					label: '🚫 Disable Sound',
					type: 'disable' as const
				}
			];

			const pick = await vscode.window.showQuickPick<PickerItem>(items, {
				placeHolder: 'Select Push Sound'
			});

			if (!pick) return;

			switch (pick.type) {
				case 'upload':
					await handleUpload(context);
					return;

				case 'folder':
					openFolder(context);
					return;

				case 'sound':
					await context.globalState.update(SOUND_KEY, {
						type: pick.sound.type,
						file: pick.sound.file
					});

					vscode.window.showInformationMessage(
						`Sound set to ${pick.sound.label}`
					);
					return;
				case 'disable':
					await context.globalState.update(SOUND_KEY, {
						type: 'disabled'
					});
					vscode.window.showInformationMessage(`Sound disabled`);
					return;
			}
		})
	);


	const terminalListener =
		vscode.window.onDidStartTerminalShellExecution?.((e) => {
			const cmd = e.execution?.commandLine?.value;
			if (!cmd) return;

			if (cmd.includes('git push')) {
				playSound(context);
			}
		});

	if (terminalListener) context.subscriptions.push(terminalListener);
}


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



function openFolder(context: vscode.ExtensionContext) {
	const folder = path.join(context.globalStorageUri.fsPath, 'custom');

	if (process.platform === 'darwin') {
		execFile('open', [folder]);
	} else if (process.platform === 'win32') {
		execFile('explorer.exe', [folder]);
	} else {
		execFile('xdg-open', [folder]);
	}
}



function playSound(context: vscode.ExtensionContext) {
	const selected = context.globalState.get<SoundState>(SOUND_KEY);

	let soundPath: string;

	if (!selected || selected.type === 'disabled') return;

	if (selected.type === 'custom') {
		soundPath = path.join(
			context.globalStorageUri.fsPath,
			'custom',
			selected.file
		);
	} else {
		soundPath = path.join(
			context.extensionPath,
			'media',
			'default',
			selected.file
		);
	}

	const safePath = soundPath.replace(/"/g, '\\"');

	try {
		if (process.platform === 'darwin') {
			execFile('afplay', [soundPath]);
		} else if (process.platform === 'win32') {
			execFile('powershell', [
				'-c',
				`(New-Object Media.SoundPlayer "${safePath}").PlaySync();`
			]);
		} else {
			execFile('ffplay', ['-nodisp', '-autoexit', soundPath]);
		}
	} catch (err) {
		console.error('sound failed:', err);
	}
}

export function deactivate() {}