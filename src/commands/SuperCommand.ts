import * as vscode from 'vscode';

export default class {
  public readonly onCommand: string;
  readonly handle: () => void;
  readonly onactivate?: (context: vscode.ExtensionContext) => void;

  constructor(props: {
    onCommand: string;
    handle: () => void;
    onactivate?: (context: vscode.ExtensionContext) => void;
  }) {
    this.onCommand = props.onCommand;
    this.handle = props.handle;
    this.onactivate = props.onactivate;
  }
}
