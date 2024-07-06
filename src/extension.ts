import * as vscode from 'vscode';
import debug from '@/utils/debug';
import RegisterCommands from '@/commands';
import { getStatus } from '@/utils/api';
import path from 'path';
import registerFeatures from './features';

globalThis.pid = '';
let initFinish: () => void;
globalThis.waitinit = new Promise(resolve => (initFinish = () => resolve()));

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  globalThis.version = context.extension.packageJSON.version;
  debug('initializing luogu-vscode.');
  RegisterCommands(context);
  console.log('init luogu-vscode success.');
  globalThis.resourcesPath = path.join(context.extensionPath, 'resources');
  globalThis.distPath = path.join(context.extensionPath, 'dist');
  getStatus();
  registerFeatures(context);
  initFinish();
}

export function deactivate(): void {}
