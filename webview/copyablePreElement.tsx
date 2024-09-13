import { useState } from 'react';

const { default: React } = await import('react');
const { FontAwesomeIcon } = await import('@fortawesome/react-fontawesome');
const { VSCodeButton } = await import('@vscode/webview-ui-toolkit/react');
const { createRoot } = await import('react-dom/client');
const { faCopy } = await import('@fortawesome/free-solid-svg-icons');

class CopyablePreElement extends HTMLPreElement {
  reactRoot?: import('react-dom/client').Root;
  constructor() {
    super();
  }
  connectedCallback() {
    const div = document.createElement('div');
    this.appendChild(div);

    const Compose = () => {
      const [animationType, setAnimationType] = useState(false);
      const copy = async () => {
        const text = this.childNodes[0].textContent ?? '';
        await navigator.clipboard.writeText(text);
        setAnimationType(true);
      };
      return (
        <VSCodeButton
          appearance="icon"
          onClick={copy}
          aria-label="Copy"
          onAnimationEnd={() => setAnimationType(false)}
        >
          <FontAwesomeIcon
            className={animationType ? 'animate' : undefined}
            icon={faCopy}
          />
        </VSCodeButton>
      );
    };
    (this.reactRoot = createRoot(div)).render(<Compose />);
  }
  disconnectedCallback() {
    this.reactRoot?.unmount();
  }
}
customElements.define('copyable-pre', CopyablePreElement, { extends: 'pre' });

export default {};
