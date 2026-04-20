import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';

let lastHashes = new Map<string, string>();

export function activate(context: vscode.ExtensionContext) {
	console.log('push-sound extension active');

	
	const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
	const git = gitExtension?.getAPI(1);

	if (!git) {
		console.log('Git API not found');
		return;
	}

	// attach to existing repos
	git.repositories.forEach((repo: any) => {
		watchRepo(repo, context);
	});

	// attach to newly opened repos
	git.onDidOpenRepository((repo: any) => {
		watchRepo(repo, context);
	});
}

function watchRepo(repo: any, context: vscode.ExtensionContext) {
	const id = repo.rootUri.toString();

	repo.state.onDidChange(() => {
		console.log('git change detected');
		handleGitChange(repo, id, context);
	});
}

function handleGitChange(repo: any, id: string, context: vscode.ExtensionContext) {
	const head = repo.state.HEAD;

	if (!head || !head.commit) return;

	const newHash = head.commit;
	const oldHash = lastHashes.get(id);

	// if HEAD changed → likely commit/push/remote sync
	if (oldHash && oldHash !== newHash) {
		playSound(context);
	}

	lastHashes.set(id, newHash);
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