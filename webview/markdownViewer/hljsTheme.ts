import hljsLightTheme from './hljsLightTheme.lazy.css';
import hljsDarkTheme from './hljsDarkTheme.lazy.css';

new MutationObserver(mutationList =>
  mutationList.forEach(mutation => {
    if (
      mutation.type !== 'attributes' ||
      mutation.attributeName !== 'data-vscode-theme-kind'
    )
      return;
    updateTheme();
  })
).observe(document.body, {
  attributes: true,
  attributeFilter: ['data-vscode-theme-kind']
});

function getTheme() {
  const s = document.body.getAttribute('data-vscode-theme-kind');
  if (s === 'vscode-high-contrast' || s === 'vscode-dark') return 'dark';
  else if (s === 'vscode-high-contrast-light' || s === 'vscode-light')
    return 'light';
  throw new Error('Unknown theme');
}

let oldTheme: typeof hljsDarkTheme | typeof hljsLightTheme | undefined;
function updateTheme() {
  const newTheme = getTheme() === 'dark' ? hljsDarkTheme : hljsLightTheme;
  if (newTheme === oldTheme) return;
  oldTheme?.unuse(), newTheme.use();
  oldTheme = newTheme;
}
updateTheme();
