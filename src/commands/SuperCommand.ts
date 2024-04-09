import debug from '@/utils/debug';

export default class {
  public readonly onCommand: string;
  private handle!: () => void;

  constructor(props: { onCommand: string; handle: () => void }) {
    this.onCommand = props.onCommand;
    this.handle = props.handle;
  }

  public callback = () => {
    debug(`${this.onCommand} start.`);
    this.handle();
    debug(`${this.onCommand} end.`);
  };
}
