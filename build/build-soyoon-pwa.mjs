import fs from 'fs';
import { fileURLToPath } from 'url';
const DIR = fileURLToPath(new URL('.', import.meta.url)).replace(/[\\/]$/, '');
const SRC = DIR + '/soyoon-quest.html';
const OUT = DIR + '/../index.html';

const raw = fs.readFileSync(SRC, 'utf8');
const i = raw.indexOf('</style>');
if (i < 0) throw new Error('no </style> found');
const head = raw.slice(0, i + '</style>'.length);
const body = raw.slice(i + '</style>'.length);

const pwaHead = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="초등 5학년 2학기 수학·과학·사회(한국사) 14일 완성표 — 유튜브로 배우고 확인문제로 복습, 용돈(원) 모으기.">
<meta name="theme-color" content="#E23B32" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#101216" media="(prefers-color-scheme: dark)">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="소윤 퀘스트">
<meta name="mobile-web-app-capable" content="yes">`;

const extraCss = `<style>
  html { background: var(--ground); }
  @supports (padding: max(0px)) {
    .container { padding-left: max(16px, env(safe-area-inset-left)); padding-right: max(16px, env(safe-area-inset-right)); }
    @media (display-mode: standalone) { .container { padding-top: max(22px, env(safe-area-inset-top)); } }
  }
</style>`;

const swReg = `<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (e) { console.warn('SW register failed', e); });
    });
  }
</script>`;

const out = `<!doctype html>
<html lang="ko">
<head>
${pwaHead}
${head}
${extraCss}
</head>
<body>
${body.trim()}
${swReg}
</body>
</html>
`;
fs.writeFileSync(OUT, out, 'utf8');
console.log('wrote', OUT, out.length, 'bytes');
