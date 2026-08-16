import fs from 'fs';
import { fileURLToPath } from 'url';
const DIR = fileURLToPath(new URL('.', import.meta.url)).replace(/[\\/]$/, '');
const SRC = DIR + '/quest-board.html';
const OUT = DIR + '/soyoon-quest.html';

// ---------- load & validate quiz JSON ----------
const files = { mat:'sy-mat.json', sci:'sy-sci.json', soc:'sy-soc.json' };
const Q = {}; const problems = [];
for (const [k, f] of Object.entries(files)) {
  const o = JSON.parse(fs.readFileSync(DIR + '/' + f, 'utf8'));
  Q[k] = o;
  const chk = (arr, label, n) => {
    if (!Array.isArray(arr) || arr.length !== n) { problems.push(`${k}.${label}: len ${arr && arr.length}!=${n}`); return; }
    arr.forEach((r, i) => {
      if (!Array.isArray(r) || r.length !== 4) problems.push(`${k}.${label}[${i}] not 4`);
      else {
        if (typeof r[0] !== 'string') problems.push(`${k}.${label}[${i}] q`);
        if (!Array.isArray(r[1]) || r[1].length !== 4) problems.push(`${k}.${label}[${i}] opts`);
        if (typeof r[2] !== 'number' || r[2] < 0 || r[2] > 3) problems.push(`${k}.${label}[${i}] idx`);
        if (typeof r[3] !== 'string' || !r[3]) problems.push(`${k}.${label}[${i}] exp`);
      }
    });
  };
  ['u1','u2','u3','u4'].forEach(u => chk(o[u], u, 10));
  chk(o.mock, 'mock', 20);
}
if (problems.length) { console.log('PROBLEMS:\n' + problems.join('\n')); process.exit(1); }

// ---------- deterministic option shuffle (fixes all-index-0) ----------
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
let seedCtr = 12345;
function shuffleRow(row){
  const rng = mulberry32(seedCtr++ * 2654435761 >>> 0);
  const idx = [0,1,2,3];
  for (let i = idx.length-1; i>0; i--){ const j = Math.floor(rng()*(i+1)); const t=idx[i]; idx[i]=idx[j]; idx[j]=t; }
  const opts = idx.map(i => row[1][i]);
  const ans = idx.indexOf(row[2]);
  return [row[0], opts, ans, row[3]];
}
for (const k of Object.keys(Q)) for (const u of ['u1','u2','u3','u4','mock']) Q[k][u] = Q[k][u].map(shuffleRow);
// sanity: answer distribution not all-0
const dist = [0,0,0,0];
for (const k of Object.keys(Q)) for (const u of ['u1','u2','u3','u4','mock']) Q[k][u].forEach(r=>dist[r[2]]++);
console.log('quiz OK · answer index distribution', dist);

// ---------- 14-day plans (초5 2학기) ----------
const REV = '#8A8A8A', FIN = '#6E48D0';
const d = (unit, uc, content, ytq) => ({ unit, uc, content, ytq });
const PLANS = {
  mat: { name:'수학', ytg:'초등 5학년 2학기 수학', days:[
    d('수의 범위와 어림','#E23B32','이상·이하·초과·미만','수의 범위 이상 이하 초과 미만 초등'),
    d('수의 범위와 어림','#E23B32','올림·버림·반올림','올림 버림 반올림 어림하기 초등'),
    d('수의 범위와 어림','#E23B32','수의 범위와 어림하기 정리','5학년 2학기 수의 범위와 어림하기'),
    d('분수의 곱셈','#2E6FE0','(분수)×(자연수), (자연수)×(분수)','분수의 곱셈 분수 자연수 초등'),
    d('분수의 곱셈','#2E6FE0','(분수)×(분수), 대분수의 곱셈','분수의 곱셈 대분수 초등'),
    d('분수의 곱셈','#2E6FE0','분수의 곱셈 정리','5학년 2학기 분수의 곱셈'),
    d('소수의 곱셈','#2E9E4F','(소수)×(자연수)','소수의 곱셈 소수 자연수 초등'),
    d('소수의 곱셈','#2E9E4F','(소수)×(소수), 곱의 소수점 위치','소수의 곱셈 소수점 위치 초등'),
    d('소수의 곱셈','#2E9E4F','소수의 곱셈 정리','5학년 2학기 소수의 곱셈'),
    d('도형과 자료','#C6961F','합동과 대칭(선대칭·점대칭)','합동 선대칭 점대칭 도형 초등'),
    d('도형과 자료','#C6961F','직육면체·정육면체(전개도·겨냥도)','직육면체 정육면체 전개도 겨냥도 초등'),
    d('도형과 자료','#C6961F','평균과 가능성','평균 구하기 가능성 초등'),
    d('복습',REV,'어려웠던 단원 다시 보기 + 오답노트','5학년 2학기 수학 총정리'),
    d('총정리',FIN,'수학 2학기 총정리 (모의 확인테스트)','초등 5학년 2학기 수학 총정리 문제') ]},
  sci: { name:'과학', ytg:'초등 5학년 2학기 과학', days:[
    d('생물과 환경','#2E9E4F','생태계와 먹이 관계','생태계 먹이 사슬 먹이 그물 초등'),
    d('생물과 환경','#2E9E4F','생산자·소비자·분해자, 환경 요인','생산자 소비자 분해자 비생물 요인 초등'),
    d('생물과 환경','#2E9E4F','생물의 적응과 환경 보전','생물의 적응 환경 오염 초등'),
    d('날씨와 우리 생활','#2E6FE0','습도, 이슬·안개·구름','습도 이슬 안개 구름 초등'),
    d('날씨와 우리 생활','#2E6FE0','비와 눈, 고기압과 저기압','고기압 저기압 비 눈 초등'),
    d('날씨와 우리 생활','#2E6FE0','바람 (해풍·육풍)','해풍 육풍 바람 초등'),
    d('물체의 운동','#E23B32','물체의 빠르기 비교','물체의 빠르기 비교 초등'),
    d('물체의 운동','#E23B32','속력 구하기','속력 구하기 초등 과학'),
    d('물체의 운동','#E23B32','속력과 안전','속력과 안전장치 초등'),
    d('산과 염기','#C6961F','용액 분류와 지시약','용액 분류 지시약 리트머스 초등'),
    d('산과 염기','#C6961F','산성·염기성 용액의 성질','산성 염기성 용액 성질 초등'),
    d('산과 염기','#C6961F','산과 염기를 섞을 때·생활 속 이용','산성 염기성 섞을 때 생활 속 이용 초등'),
    d('복습',REV,'어려웠던 단원 다시 보기 + 오답노트','5학년 2학기 과학 총정리'),
    d('총정리',FIN,'과학 2학기 총정리 (모의 확인테스트)','초등 5학년 2학기 과학 총정리 문제') ]},
  soc: { name:'사회', ytg:'초등 5학년 2학기 한국사', days:[
    d('고조선과 삼국','#C6961F','선사시대와 고조선','선사시대 고조선 단군왕검 초등'),
    d('고조선과 삼국','#C6961F','삼국(고구려·백제·신라)과 가야','삼국 고구려 백제 신라 가야 초등'),
    d('고조선과 삼국','#C6961F','삼국의 문화(불교·고분·첨성대)','삼국의 문화 첨성대 불교 초등'),
    d('통일신라·발해·고려','#2E9E4F','신라의 삼국 통일과 발해','신라 삼국통일 발해 대조영 초등'),
    d('통일신라·발해·고려','#2E9E4F','고려의 건국(왕건)과 통일','고려 건국 왕건 후삼국 통일 초등'),
    d('통일신라·발해·고려','#2E9E4F','고려의 문화(팔만대장경·고려청자·금속활자)','팔만대장경 고려청자 금속활자 초등'),
    d('조선의 건국과 세종','#E23B32','조선의 건국(이성계)과 한양','조선 건국 이성계 한양 초등'),
    d('조선의 건국과 세종','#E23B32','세종대왕의 업적(훈민정음·측우기)','세종대왕 훈민정음 측우기 초등'),
    d('조선의 건국과 세종','#E23B32','유교 나라 조선·집현전·4군 6진','세종대왕 집현전 4군6진 초등'),
    d('조선의 사회·전란','#2E6FE0','조선의 신분제와 생활','조선 신분제 양반 중인 상민 천민 초등'),
    d('조선의 사회·전란','#2E6FE0','임진왜란과 이순신','임진왜란 이순신 거북선 한산도 초등'),
    d('조선의 사회·전란','#2E6FE0','병자호란','병자호란 초등'),
    d('복습',REV,'어려웠던 단원 다시 보기 + 오답노트','5학년 2학기 한국사 총정리'),
    d('총정리',FIN,'한국사 총정리 (모의 확인테스트)','초등 5학년 2학기 한국사 총정리 문제') ]}
};

const order = ['mat','sci','soc'];
const SUBJECTS = order.map(key => {
  const p = PLANS[key], qd = Q[key];
  const days = p.days.map((dd, i) => {
    const n = i + 1;
    const o = { n, unit: dd.unit, uc: dd.uc, content: dd.content, ytq: dd.ytq };
    if (n===3) o.quiz = { kind:'unit', z: qd.u1 };
    else if (n===6) o.quiz = { kind:'unit', z: qd.u2 };
    else if (n===9) o.quiz = { kind:'unit', z: qd.u3 };
    else if (n===12) o.quiz = { kind:'unit', z: qd.u4 };
    else if (n===14) o.quiz = { kind:'mock', z: qd.mock };
    return o;
  });
  return { key, name: p.name, ytg: p.ytg, days };
});

function ser(v, ind){
  const pad = '  '.repeat(ind);
  if (Array.isArray(v)){
    if (v.length>=3 && typeof v[0]==='string' && Array.isArray(v[1]) && typeof v[2]==='number') return JSON.stringify(v);
    if (v.length===0) return '[]';
    return '[\n' + v.map(x => '  '.repeat(ind+1) + ser(x, ind+1)).join(',\n') + '\n' + pad + ']';
  }
  if (v && typeof v==='object') return '{\n' + Object.keys(v).map(k => '  '.repeat(ind+1) + JSON.stringify(k) + ': ' + ser(v[k], ind+1)).join(',\n') + '\n' + pad + '}';
  return JSON.stringify(v);
}

// ---------- reskin quest-board.html -> Roblox ----------
let html = fs.readFileSync(SRC, 'utf8');
const R = (a, b) => { if (!html.includes(a)) { console.log('MISS:', JSON.stringify(a.slice(0,60))); miss++; } html = html.split(a).join(b); };
let miss = 0;

// palette (each line-content appears twice: @media + [data-theme])
R('--paper: #F3EEDF; --paper-2: #EAE2CD; --ink: #23261C; --ink-soft: #4C503E;','--paper: #F1F3F6; --paper-2: #E6E9EF; --ink: #1A1C22; --ink-soft: #494D57;');
R('--ink-faint: #7A7C68; --line: #D6CCB0; --card: #FBF8EF; --flame: #EA5D24;','--ink-faint: #767A85; --line: #D8DCE3; --card: #FFFFFF; --flame: #E23B32;');
R('--flame-deep: #C7481A; --gold: #C8962B; --gold-bright: #E6B23E; --olive: #6E7B45;','--flame-deep: #BE2C24; --gold: #C6961F; --gold-bright: #EFC13B; --olive: #2E6FE0;');
R('--olive-deep: #55602F; --good: #4E7A3E; --bad: #C24A38; --steel: #5A6472; --ground: #F3EEDF;','--olive-deep: #2257B8; --good: #2E9E4F; --bad: #D64541; --steel: #5B6472; --ground: #EEF1F5;');
R('--paper: #17190F; --paper-2: #1E2115; --ink: #ECE7D4; --ink-soft: #BEB9A2;','--paper: #171A20; --paper-2: #1F232B; --ink: #ECEEF2; --ink-soft: #B9BEC8;');
R('--ink-faint: #8A8770; --line: #34381F; --card: #202315; --flame: #F4732F;','--ink-faint: #868C98; --line: #2E333D; --card: #1C2028; --flame: #FF5147;');
R('--flame-deep: #E05A1D; --gold: #E6B23E; --gold-bright: #F5C960; --olive: #8A9857;','--flame-deep: #E23B32; --gold: #EFC13B; --gold-bright: #FFD666; --olive: #5B9BFF;');
R('--olive-deep: #6E7B45; --good: #74A85E; --bad: #E27060; --steel: #8391A3; --ground: #12140B;','--olive-deep: #2E6FE0; --good: #52C878; --bad: #F0736E; --steel: #8894A6; --ground: #101216;');

// background glow olive -> flame (red)
R('color-mix(in srgb, var(--olive) 13%, transparent)','color-mix(in srgb, var(--flame) 13%, transparent)');
R('color-mix(in srgb, var(--olive) 22%, transparent)','color-mix(in srgb, var(--flame) 22%, transparent)');

// emblem -> Roblox rounded block
R('.rank-emblem { width: 72px; height: 72px; border-radius: 50%; display: grid; place-items: center; background: radial-gradient(circle at 50% 35%, var(--olive), var(--olive-deep)); border: 3px solid var(--gold-bright); box-shadow: inset 0 2px 6px rgba(255,255,255,.15), var(--shadow); font-size: 30px; position: relative; }',
  '.rank-emblem { width: 72px; height: 72px; border-radius: 20px; display: grid; place-items: center; background: linear-gradient(145deg, var(--flame), var(--flame-deep)); border: 3px solid var(--gold-bright); box-shadow: inset 0 2px 6px rgba(255,255,255,.2), var(--shadow); font-size: 30px; position: relative; transform: rotate(-4deg); }');
R('.rank-emblem .lv { position: absolute; bottom: -6px; right: -8px; background: var(--flame); color: #fff; font-weight: 900; font-size: 11px; padding: 2px 7px; border-radius: 20px; border: 2px solid var(--card); }',
  '.rank-emblem .lv { position: absolute; bottom: -6px; right: -8px; background: var(--olive); color: #fff; font-weight: 900; font-size: 11px; padding: 2px 7px; border-radius: 20px; border: 2px solid var(--card); transform: rotate(4deg); }');

// RANKS -> Roblox
R(`    { min:0,  ico:"🥄", name:"이등병 한윤재" },
    { min:6,  ico:"🍳", name:"일병 한윤재" },
    { min:12, ico:"🔪", name:"상병 한윤재" },
    { min:18, ico:"🍲", name:"병장 한윤재" },
    { min:24, ico:"👨‍🍳", name:"취사반장" },
    { min:30, ico:"🏆", name:"전설의 한윤재" }`,
`    { min:0,  ico:"🐣", name:"뉴비" },
    { min:6,  ico:"🎮", name:"초보 플레이어" },
    { min:12, ico:"🧱", name:"블록 빌더" },
    { min:19, ico:"⭐", name:"프로 플레이어" },
    { min:27, ico:"🚀", name:"마스터" },
    { min:34, ico:"👑", name:"로블록스 레전드" }`);

// titles / labels
R('<title>중1 2학기 완성 작전 · 한윤재 전설이 되다</title>','<title>소윤 로블록스 레전드 · 초5 2학기 공부 퀘스트</title>');
R('<h1>한윤재 <span class="flame">전설</span>이 되다</h1>','<h1>소윤 로블록스 <span class="flame">레전드</span></h1>');
R('🥄 한윤재 전설이 되다 (중1 2학기)','🎮 소윤 로블록스 레전드 (초5 2학기)');
R('<span id="rankIco">🥄</span>','<span id="rankIco">🐣</span>');
R('<div class="rank-name" id="rankName">이등병 한윤재</div>','<div class="rank-name" id="rankName">뉴비</div>');
R('<span class="rg-name">한윤재</span>','<span class="rg-name">소윤</span>');
R('(전부 완료 시 정확히 1000元)','(목표 20000원 · 모두 완료 시 21000원)');

// config
R('var FIREBASE_DB = "";','var FIREBASE_DB = "https://learning-soyun-default-rtdb.firebaseio.com";');
R('var KEY = "chwisabyeong_s2_v1";','var KEY = "soyoon_plan_v1";');
R('var ROLE_KEY = "chwisabyeong_role";','var ROLE_KEY = "soyoon_role";');
R('FIREBASE_DB.replace(/\\/+$/,"") + "/hanyunjae_s2.json"','FIREBASE_DB.replace(/\\/+$/,"") + "/soyoon.json"');
R('var DEF = { rDay:5, rQuiz:25, rMock:30, goal:1000 };','var DEF = { rDay:200, rQuiz:800, rMock:1000, goal:20000 };');
R('var REWARD_VERSION = 3;','var REWARD_VERSION = 2;');
R('return { name:"한윤재", days:{}','return { name:"소윤", days:{}');
R('if (!s.name) s.name="한윤재";','if (!s.name) s.name="소윤";');

// active tab default (소윤 has no 'kor')
R('var activeTab = "kor";','var activeTab = "mat";');

// stats denominators
R('id="doneCount">0</span> <span style="font-size:15px;color:var(--ink-faint)">/ 70일','id="doneCount">0</span> <span style="font-size:15px;color:var(--ink-faint)">/ 42일');
R('id="quizCount">0</span> <span style="font-size:15px;color:var(--ink-faint)">/ 25<','id="quizCount">0</span> <span style="font-size:15px;color:var(--ink-faint)">/ 15<');

// subject-specific copy (subtitle + note)
R('의 국어·과학·사회·국사·수학 <b>2학기</b> 완성표 — 매일 영상 보고 <b style="color:var(--good)">완료 체크</b>, 과목 끝엔 <b style="color:var(--flame)">확인문제 20문항</b>! 용돈 모아 목표 달성! 🎁',
  '의 수학·과학·사회(한국사) <b>초5 2학기</b> 완성표 — 매일 영상 보고 <b style="color:var(--good)">완료 체크</b>, 단원마다 <b style="color:var(--flame)">확인문제 10문항</b>! 용돈 모아 목표 달성! 🎁');
R('국어·과학·사회·국사(역사)·수학 — 중1 2학기, 가장 널리 쓰는 교과 기준(미래엔·비상 계열). 출판사에 따라 단원 순서가 조금 다를 수 있어요.',
  '수학·과학·사회(한국사) — 초5 2학기 전 범위. 초등 교육과정 기준이며, 교과서 출판사에 따라 단원 순서가 조금 다를 수 있어요.');

// SUBJECTS block
const s0 = html.indexOf('var SUBJECTS =');
const e0 = html.indexOf('var YT =');
html = html.slice(0, s0) + 'var SUBJECTS = ' + ser(SUBJECTS, 1) + ';\n\n  ' + html.slice(e0);

// global stragglers
html = html.split('중1 2학기').join('초5 2학기').split('한윤재').join('소윤').split('元').join('원');
if (miss) { console.log('MISSED', miss, 'replacements — aborting'); process.exit(1); }

fs.writeFileSync(OUT, html, 'utf8');
let days=0,unit=0,mock=0,q=0;
SUBJECTS.forEach(su=>su.days.forEach(x=>{days++;if(x.quiz){if(x.quiz.kind==='mock')mock++;else unit++;q+=x.quiz.z.length;}}));
console.log('wrote', OUT, html.length, 'bytes');
console.log('subjects', SUBJECTS.length, 'days', days, 'unitQuiz', unit, 'mockQuiz', mock, 'totalQ', q);
console.log('full-completion reward:', days*200 + unit*800 + mock*1000, '원 (goal 20000)');
console.log('stray 元:', (html.match(/元/g)||[]).length);
console.log('stray 한윤재:', (html.match(/한윤재/g)||[]).length, '· stray 취사:', (html.match(/취사/g)||[]).length, '· stray olive-hex F3EEDF:', html.includes('#F3EEDF'));
