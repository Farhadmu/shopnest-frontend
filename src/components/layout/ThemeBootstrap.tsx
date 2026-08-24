export function ThemeBootstrap() {
  const script = `(() => { try { const saved = localStorage.getItem('shopnest-theme'); const dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches; document.documentElement.classList.toggle('dark', dark); } catch {} })()`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
