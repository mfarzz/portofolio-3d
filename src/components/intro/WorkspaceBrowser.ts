/** A welcome browser window projected onto the left display before entering the portfolio. */
export function createWorkspaceBrowser() {
  const element = document.createElement('div');
  element.className = 'workspace-browser-surface';
  element.setAttribute('aria-hidden', 'true');
  element.inert = true;
  const window = document.createElement('div');
  window.className = 'workspace-browser-window';
  const tabs = document.createElement('div');
  tabs.className = 'workspace-browser-tabs';
  tabs.textContent = '◉   Muhammad Fariz — Developer                         −   □   ×';
  const address = document.createElement('div');
  address.className = 'workspace-browser-address';
  address.textContent = '←   →   ↻       ◈  ' + location.host;
  const welcome = document.createElement('div');
  welcome.className = 'workspace-browser-welcome';
  welcome.textContent = 'WELCOME';
  const loaded = Promise.resolve();
  window.append(tabs, address, welcome);
  element.append(window);
  return { element, window, loaded };
}
