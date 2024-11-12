const { default: React } = await import('react');
const { createRoot } = await import('react-dom/client');

import App from './app';

const { count } = JSON.parse(
  document.getElementById('lentille-context')!.innerText
) as { count: number };

createRoot(document.getElementById('app')!).render(<App total={count} />);
