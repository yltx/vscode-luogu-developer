import { submitCode } from '@/utils/api';
import {
  askForLanguage,
  askForPid,
  guessProblemId,
  processAxiosError
} from '@/utils/workspaceUtils';
import * as vscode from 'vscode';

export default function registerSubmitFeature(
  context: vscode.ExtensionContext
) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'luogu.sumbitCode',
      async (
        problem?:
          | import('@/features/history/historyItem').ProblemHistoryItem
          | { pid: string; cid?: number }
      ) => {
        let editor: vscode.TextEditor | undefined =
          vscode.window.activeTextEditor;

        if (!editor) {
          const selectedDocument = await selectOpenDocument();
          if (!selectedDocument) {
            vscode.window.showErrorMessage(
              '您没有选择任何文件，请选择一个文件后重试'
            );
            return false;
          }
          editor = selectedDocument;
        }
        if (!problem) {
          const guessed = guessProblemId(editor.document.fileName);
          if (
            guessed &&
            vscode.workspace
              .getConfiguration('luogu')
              .get('guessProblemID', false)
          )
            problem = guessed;
          else if (
            !(problem = await askForPid(
              guessProblemId(editor.document.fileName)
            ))
          )
            return false;
        }
        if ('type' in problem)
          problem = { pid: problem.pid, cid: problem.contest?.contestId };
        const lang = await askForLanguage(
          editor.document.fileName.split('.').pop()!
        );
        if (lang === undefined) return false;
        vscode.window.showInformationMessage('正在提交……');
        try {
          const rid = await submitCode(
            problem,
            editor.document.getText(),
            lang.id,
            lang.O2
          );
          vscode.commands.executeCommand('luogu.record', rid);
          return true;
        } catch (e) {
          processAxiosError('提交代码')(e);
          return new Error('Error when submit', { cause: e });
        }
      }
    )
  );
}

async function selectOpenDocument(): Promise<vscode.TextEditor | undefined> {
  // 添加选择本地文件和工作区文件的选项
  const fileOptions = [
    { label: '选择本地文件', kind: vscode.QuickPickItemKind.Separator },
    {
      label: '选择本地文件',
      description: '从文件系统中选择文件',
      type: 'local'
    },
    {
      label: '选择工作区文件',
      description: '从当前工作区中选择文件',
      type: 'workspace'
    },
    { label: '已打开的文件', kind: vscode.QuickPickItemKind.Separator }
  ];

  // 获取已打开的程序文件（过滤掉非程序文件，如题目详情界面）
  const openDocuments = vscode.workspace.textDocuments
    .filter(doc => {
      // 过滤掉已关闭的文档
      if (doc.isClosed) return false;

      // 只保留真实文件（有文件路径的文档）
      if (!doc.fileName || doc.fileName.length === 0) return false;

      // 过滤掉非程序文件（通过更底层的方法判断）
      const isProgramFile =
        doc.languageId &&
        doc.languageId !== 'plaintext' &&
        doc.languageId !== '``' &&
        doc.languageId !== 'json' &&
        doc.languageId !== 'log' &&
        doc.languageId !== 'code-runner-output' &&
        doc.languageId !== 'unknown';

      return isProgramFile;
    })
    .map(doc => {
      // 判断是否为已编辑但未保存的文档
      const isDirty = doc.isDirty && !doc.isUntitled;

      return {
        label: doc.fileName.split(/[/\\]/).pop() || doc.fileName,
        description: isDirty
          ? '已修改未保存'
          : doc.isUntitled
            ? '未命名文档'
            : doc.fileName,
        document: doc,
        isDirty: isDirty
      };
    });

  // 合并选项
  interface FileOptionItem extends vscode.QuickPickItem {
    type?: string;
  }

  interface OpenDocumentItem extends vscode.QuickPickItem {
    document: vscode.TextDocument;
    isDirty: boolean;
  }

  const allOptions: (
    | FileOptionItem
    | OpenDocumentItem
    | vscode.QuickPickItem
  )[] = [...fileOptions];
  openDocuments.forEach(doc => allOptions.push(doc));

  if (openDocuments.length === 0 && fileOptions.length === 4) {
    // 如果没有已打开的文件，则只显示文件选择选项
    const fileOnlyOptions = fileOptions.slice(0, 3); // 移除分割线"已打开的文件"
    const selected = await vscode.window.showQuickPick(fileOnlyOptions, {
      placeHolder: '选择要提交的文件'
    });

    if (selected && 'type' in selected && selected.type) {
      return await handleFileSelection(selected.type);
    }

    return undefined;
  }

  const selected = await vscode.window.showQuickPick(allOptions, {
    placeHolder: '选择要提交的文件'
  });

  if (selected) {
    // 如果选择了文件选项
    if ('type' in selected && selected.type) {
      return await handleFileSelection(selected.type);
    }
    // 如果选择了已打开的文档
    else if ('document' in selected && selected.document) {
      // 如果是已编辑但未保存的文档，显示提示框
      if ((selected as OpenDocumentItem).isDirty) {
        const saveChoice = await vscode.window.showWarningMessage(
          '您选择的文档已修改但未保存，是否要先保存?',
          '保存',
          '直接提交',
          '取消'
        );

        if (saveChoice === '保存') {
          // 保存文档
          const saved = await selected.document.save();
          if (!saved) {
            vscode.window.showErrorMessage('保存文档失败');
            return undefined;
          }
        } else if (saveChoice === '取消') {
          return undefined;
        }
        // 如果选择"直接提交"则继续执行
      }

      const editor = await vscode.window.showTextDocument(selected.document);
      return editor;
    }
  }

  return undefined;
}

async function handleFileSelection(
  type: string
): Promise<vscode.TextEditor | undefined> {
  let fileUri: vscode.Uri[] | undefined;

  if (type === 'local') {
    fileUri = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: '选择要提交的代码文件'
    });
  } else if (type === 'workspace') {
    // 使用const而不是let
    const quickPick: vscode.QuickPick<vscode.QuickPickItem> =
      vscode.window.createQuickPick();
    quickPick.placeholder = '正在搜索工作区文件...';
    quickPick.enabled = false;
    quickPick.show();

    try {
      const workspaceFiles = await vscode.workspace.findFiles(
        '**/*',
        '**/node_modules/**'
      );
      const filePickItems = workspaceFiles.map(uri => ({
        label: uri.path.split('/').pop() || uri.path,
        description: uri.path,
        uri: uri
      }));

      if (filePickItems.length === 0) {
        quickPick.placeholder = '在工作区中未找到文件';
        quickPick.items = [{ label: '未找到文件' }];
      } else {
        quickPick.placeholder = '从工作区选择文件';
        quickPick.items = filePickItems;
        quickPick.enabled = true;
      }

      const selected = await new Promise<vscode.QuickPickItem | undefined>(
        resolve => {
          quickPick.onDidAccept(() => {
            resolve(quickPick.selectedItems[0]);
          });
          quickPick.onDidHide(() => {
            resolve(undefined);
          });
        }
      );

      quickPick.dispose();

      if (selected && 'uri' in selected) {
        fileUri = [selected.uri as vscode.Uri];
      }
    } catch (error) {
      quickPick.dispose();
      vscode.window.showErrorMessage(
        '搜索工作区文件时出错: ' + (error as Error).message
      );
      return undefined;
    }
  }

  if (fileUri && fileUri[0]) {
    const document = await vscode.workspace.openTextDocument(fileUri[0]);
    const editor = await vscode.window.showTextDocument(document);
    return editor;
  }

  return undefined;
}
