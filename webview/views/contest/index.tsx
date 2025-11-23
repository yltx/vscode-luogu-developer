const { default: React } = await import('react');
const { createRoot } = await import('react-dom/client');

import App from './app';

createRoot(document.getElementById('app')!).render(
  <App>
    {JSON.parse(document.getElementById('lentille-context')!.innerText)}
  </App>
);
