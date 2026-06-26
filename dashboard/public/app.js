/* ═══════════════════════════════════════════════════════════════════
   WC 2026 PREDICTION DASHBOARD — app.js
   All data hardcoded. Chart.js 4.x. Vanilla JS.
   ═══════════════════════════════════════════════════════════════════ */

/* ── GLOBAL CHART DEFAULTS ─────────────────────────────────────── */
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size   = 12;
Chart.defaults.color       = '#64748B';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.padding = 16;

const C = {
  orange:  '#E85D04',
  navy:    '#1E40AF',
  green:   '#10B981',
  red:     '#EF4444',
  gray:    '#94A3B8',
  gold:    '#F59E0B',
  purple:  '#8B5CF6',
  grid:    '#F1F5F9',
  tooltipBg: '#0F172A',
};

const tooltipDefaults = {
  backgroundColor: C.tooltipBg,
  titleColor: '#FFFFFF',
  bodyColor: '#CBD5E1',
  padding: 10,
  cornerRadius: 8,
  displayColors: true,
};

function baseScales(xTitle, yTitle) {
  return {
    x: {
      title: xTitle ? { display: true, text: xTitle, color: '#94A3B8', font: { size: 11 } } : undefined,
      grid: { color: C.grid, drawBorder: false },
      ticks: { color: '#64748B' },
    },
    y: {
      title: yTitle ? { display: true, text: yTitle, color: '#94A3B8', font: { size: 11 } } : undefined,
      grid: { color: C.grid, drawBorder: false },
      ticks: { color: '#64748B' },
      beginAtZero: true,
    }
  };
}

/* ── HARDCODED DATA ─────────────────────────────────────────────── */

const ELO_RANKINGS = [
  { team: 'Argentina',    elo: 2112, change: '+22' },
  { team: 'France',       elo: 2069, change: '+19' },
  { team: 'Spain',        elo: 2055, change: '-17' },
  { team: 'Brazil',       elo: 1999, change: '+19' },
  { team: 'Colombia',     elo: 1990, change: '+17' },
  { team: 'England',      elo: 1989, change: '+3'  },
  { team: 'Morocco',      elo: 1981, change: '+26' },
  { team: 'Mexico',       elo: 1975, change: '+17' },
  { team: 'Norway',       elo: 1963, change: '+25' },
  { team: 'Netherlands',  elo: 1962, change: '+1'  },
  { team: 'Portugal',     elo: 1943, change: '-11' },
  { team: 'Germany',      elo: 1943, change: '-16' },
  { team: 'Japan',        elo: 1932, change: '-6'  },
  { team: 'Switzerland',  elo: 1916, change: '+51' },
  { team: 'Croatia',      elo: 1902, change: '-1'  },
  { team: 'Ecuador',      elo: 1885, change: '+105'},
  { team: 'Paraguay',     elo: 1884, change: '+24' },
  { team: 'Italy',        elo: 1873, change: '—'   },
  { team: 'Australia',    elo: 1863, change: '+12' },
  { team: 'United States',elo: 1859, change: '-36' },
];

const FEATURES = [
  { name: 'elo_diff',  pct: 94 },
  { name: 'home_elo',  pct: 80 },
  { name: 'away_elo',  pct: 73 },
  { name: 'home_wr10', pct: 58 },
  { name: 'away_wr10', pct: 50 },
  { name: 'neutral_i', pct: 41 },
  { name: 'cat_enc',   pct: 33 },
];

const PREDICTIONS = [
  /* All 12 remaining group-stage matches — XGBoost predict_proba()
     ELO updated with all 60 finished WC2026 matches (neutral=True for all) */
  { group:'I', home:'Senegal',                           away:'Iraq',         result:'Home Win', ph:52, pd:26, pa:22 },
  { group:'L', home:'Panama',                            away:'England',      result:'Away Win', ph:8,  pd:20, pa:72 },
  { group:'K', home:'DR Congo',                          away:'Uzbekistan',   result:'Away Win', ph:17, pd:24, pa:60 },
  { group:'I', home:'Norway',                            away:'France',       result:'Away Win', ph:26, pd:25, pa:49 },
  { group:'G', home:'Egypt',                             away:'Iran',         result:'Away Win', ph:35, pd:30, pa:36 },
  { group:'H', home:'Cape Verde',                        away:'Saudi Arabia', result:'Home Win', ph:42, pd:28, pa:31 },
  { group:'H', home:'Uruguay',                           away:'Spain',        result:'Away Win', ph:13, pd:28, pa:59 },
  { group:'J', home:'Jordan',                            away:'Argentina',    result:'Away Win', ph:9,  pd:11, pa:79 },
  { group:'K', home:'Colombia',                          away:'Portugal',     result:'Home Win', ph:40, pd:29, pa:31 },
  { group:'L', home:'Croatia',                           away:'Ghana',        result:'Home Win', ph:58, pd:26, pa:16 },
  { group:'J', home:'Algeria',                           away:'Austria',      result:'Home Win', ph:36, pd:29, pa:35 },
  { group:'G', home:'New Zealand',                       away:'Belgium',      result:'Away Win', ph:15, pd:19, pa:66 },
];

const GROUP_WINNERS = [
  { group:'A', winner:'Mexico',       runner:'South Africa'  },
  { group:'B', winner:'Switzerland',  runner:'Canada'        },
  { group:'C', winner:'Brazil',       runner:'Morocco'       },
  { group:'D', winner:'United States',runner:'Australia'     },
  { group:'E', winner:'Germany',      runner:'Ivory Coast'   },
  { group:'F', winner:'Netherlands',  runner:'Japan'         },
  { group:'G', winner:'Iran',         runner:'Belgium'       },
  { group:'H', winner:'Spain',        runner:'Cape Verde'    },
  { group:'I', winner:'France',       runner:'Norway'        },
  { group:'J', winner:'Argentina',    runner:'Algeria'       },
  { group:'K', winner:'Colombia',     runner:'Portugal'      },
  { group:'L', winner:'England',      runner:'Croatia'       },
];

const CHAMP_PROBS = [
  /* 5,000 Monte Carlo simulations — ELO updated with 60 WC2026 group results,
     all treated as neutral (no home advantage for USA/Canada/Mexico) */
  { team:'Argentina',    pct:34.1 },
  { team:'France',       pct:18.4 },
  { team:'Spain',        pct:15.2 },
  { team:'Colombia',     pct:6.9  },
  { team:'Brazil',       pct:6.4  },
  { team:'England',      pct:4.4  },
  { team:'Morocco',      pct:4.1  },
  { team:'Mexico',       pct:2.2  },
  { team:'Portugal',     pct:2.1  },
  { team:'Norway',       pct:1.6  },
  { team:'Netherlands',  pct:1.4  },
  { team:'Germany',      pct:1.2  },
  { team:'Switzerland',  pct:0.5  },
  { team:'United States',pct:0.5  },
  { team:'Japan',        pct:0.3  },
  { team:'Croatia',      pct:0.3  },
];

const GROUP_STANDINGS = {
  /* Built from worldcup2026_clean.csv — actual results + XGBoost predictions */
  A: [
    { pos:1, team:'Mexico',         mp:3, w:3, d:0, l:0, gd:'+6',  pts:9 },
    { pos:2, team:'South Africa',   mp:3, w:1, d:1, l:1, gd:'-1',  pts:4 },
    { pos:3, team:'South Korea',    mp:3, w:1, d:0, l:2, gd:'-1',  pts:3 },
    { pos:4, team:'Czech Republic', mp:3, w:0, d:1, l:2, gd:'-4',  pts:1 },
  ],
  B: [
    { pos:1, team:'Switzerland',           mp:3, w:2, d:1, l:0, gd:'+4', pts:7 },
    { pos:2, team:'Canada',                mp:3, w:1, d:1, l:1, gd:'+5', pts:4 },
    { pos:3, team:'Bosnia and Herzegovina',mp:3, w:1, d:1, l:1, gd:'-1', pts:4 },
    { pos:4, team:'Qatar',                 mp:3, w:0, d:1, l:2, gd:'-8', pts:1 },
  ],
  C: [
    { pos:1, team:'Brazil',   mp:3, w:2, d:1, l:0, gd:'+6', pts:7 },
    { pos:2, team:'Morocco',  mp:3, w:2, d:1, l:0, gd:'+3', pts:7 },
    { pos:3, team:'Scotland', mp:3, w:1, d:0, l:2, gd:'-3', pts:3 },
    { pos:4, team:'Haiti',    mp:3, w:0, d:0, l:3, gd:'-6', pts:0 },
  ],
  D: [
    { pos:1, team:'United States', mp:3, w:2, d:0, l:1, gd:'+4', pts:6 },
    { pos:2, team:'Australia',     mp:3, w:1, d:1, l:1, gd:'+0', pts:4 },
    { pos:3, team:'Paraguay',      mp:3, w:1, d:1, l:1, gd:'-2', pts:4 },
    { pos:4, team:'Turkey',        mp:3, w:1, d:0, l:2, gd:'-2', pts:3 },
  ],
  E: [
    { pos:1, team:'Germany',     mp:3, w:2, d:0, l:1, gd:'+6',  pts:6 },
    { pos:2, team:'Ivory Coast', mp:3, w:2, d:0, l:1, gd:'+2',  pts:6 },
    { pos:3, team:'Ecuador',     mp:3, w:1, d:1, l:1, gd:'+0',  pts:4 },
    { pos:4, team:'Curaçao',     mp:3, w:0, d:1, l:2, gd:'-8',  pts:1 },
  ],
  F: [
    { pos:1, team:'Netherlands', mp:3, w:2, d:1, l:0, gd:'+6',  pts:7 },
    { pos:2, team:'Japan',       mp:3, w:1, d:2, l:0, gd:'+4',  pts:5 },
    { pos:3, team:'Sweden',      mp:3, w:1, d:1, l:1, gd:'+0',  pts:4 },
    { pos:4, team:'Tunisia',     mp:3, w:0, d:0, l:3, gd:'-10', pts:0 },
  ],
  G: [
    { pos:1, team:'Iran',        mp:3, w:1, d:2, l:0, gd:'+0',  pts:5 },
    { pos:2, team:'Belgium',     mp:3, w:1, d:2, l:0, gd:'+0',  pts:5 },
    { pos:3, team:'Egypt',       mp:3, w:1, d:1, l:1, gd:'+2',  pts:4 },
    { pos:4, team:'New Zealand', mp:3, w:0, d:1, l:2, gd:'-2',  pts:1 },
  ],
  H: [
    { pos:1, team:'Spain',        mp:3, w:2, d:1, l:0, gd:'+4', pts:7 },
    { pos:2, team:'Cape Verde',   mp:3, w:1, d:2, l:0, gd:'+0', pts:5 },
    { pos:3, team:'Uruguay',      mp:3, w:0, d:2, l:1, gd:'+0', pts:2 },
    { pos:4, team:'Saudi Arabia', mp:3, w:0, d:1, l:2, gd:'-4', pts:1 },
  ],
  I: [
    { pos:1, team:'France',   mp:3, w:3, d:0, l:0, gd:'+5', pts:9 },
    { pos:2, team:'Norway',   mp:3, w:2, d:0, l:1, gd:'+4', pts:6 },
    { pos:3, team:'Senegal',  mp:3, w:1, d:0, l:2, gd:'-3', pts:3 },
    { pos:4, team:'Iraq',     mp:3, w:0, d:0, l:3, gd:'-6', pts:0 },
  ],
  J: [
    { pos:1, team:'Argentina', mp:3, w:3, d:0, l:0, gd:'+5', pts:9 },
    { pos:2, team:'Algeria',   mp:3, w:2, d:0, l:1, gd:'-2', pts:6 },
    { pos:3, team:'Austria',   mp:3, w:1, d:0, l:2, gd:'+0', pts:3 },
    { pos:4, team:'Jordan',    mp:3, w:0, d:0, l:3, gd:'-3', pts:0 },
  ],
  K: [
    { pos:1, team:'Colombia',  mp:3, w:3, d:0, l:0, gd:'+3',  pts:9 },
    { pos:2, team:'Portugal',  mp:3, w:1, d:1, l:1, gd:'+5',  pts:4 },
    { pos:3, team:'Uzbekistan',mp:3, w:1, d:0, l:2, gd:'-7',  pts:3 },
    { pos:4, team:'DR Congo',  mp:3, w:0, d:1, l:2, gd:'-1',  pts:1 },
  ],
  L: [
    { pos:1, team:'England', mp:3, w:2, d:1, l:0, gd:'+2', pts:7 },
    { pos:2, team:'Croatia', mp:3, w:2, d:0, l:1, gd:'-1', pts:6 },
    { pos:3, team:'Ghana',   mp:3, w:1, d:1, l:1, gd:'+1', pts:4 },
    { pos:4, team:'Panama',  mp:3, w:0, d:0, l:3, gd:'-2', pts:0 },
  ],
};

const KO_BRACKET = {
  r32: [
    { t1:'Germany',       t2:'South Korea',              w:'Germany'       },
    { t1:'France',        t2:'Paraguay',                 w:'France'        },
    { t1:'South Africa',  t2:'Canada',                   w:'Canada'        },
    { t1:'Netherlands',   t2:'Morocco',                  w:'Morocco'       },
    { t1:'Brazil',        t2:'Japan',                    w:'Brazil'        },
    { t1:'Ivory Coast',   t2:'Norway',                   w:'Norway'        },
    { t1:'Mexico',        t2:'Ecuador',                  w:'Mexico'        },
    { t1:'England',       t2:'Austria',                  w:'England'       },
    { t1:'United States', t2:'Bosnia and Herzegovina',   w:'United States' },
    { t1:'Iran',          t2:'3rd Group',                w:'Iran'          },
    { t1:'Portugal',      t2:'Croatia',                  w:'Portugal'      },
    { t1:'Spain',         t2:'Algeria',                  w:'Spain'         },
    { t1:'Switzerland',   t2:'Sweden',                   w:'Switzerland'   },
    { t1:'Argentina',     t2:'Cape Verde',               w:'Argentina'     },
    { t1:'Colombia',      t2:'Ghana',                    w:'Colombia'      },
    { t1:'Australia',     t2:'Belgium',                  w:'Australia'     },
  ],
  r16: [
    { t1:'Germany',       t2:'France',        w:'France'        },
    { t1:'Canada',        t2:'Morocco',       w:'Morocco'       },
    { t1:'Brazil',        t2:'Norway',        w:'Brazil'        },
    { t1:'Mexico',        t2:'England',       w:'England'       },
    { t1:'Portugal',      t2:'Spain',         w:'Spain'         },
    { t1:'United States', t2:'Iran',          w:'United States' },
    { t1:'Argentina',     t2:'Australia',     w:'Argentina'     },
    { t1:'Switzerland',   t2:'Colombia',      w:'Colombia'      },
  ],
  qf: [
    { t1:'France',        t2:'Morocco',       w:'France'        },
    { t1:'Spain',         t2:'United States', w:'Spain'         },
    { t1:'Brazil',        t2:'England',       w:'Brazil'        },
    { t1:'Argentina',     t2:'Colombia',      w:'Argentina'     },
  ],
  sf: [
    { t1:'France',        t2:'Spain',         w:'France'        },
    { t1:'Brazil',        t2:'Argentina',     w:'Argentina'     },
  ],
  final: [
    { t1:'France', t2:'Argentina', w:'Argentina' },
  ],
};

const ELO_TRAJECTORY = {
  years: [1990,1992,1994,1996,1998,2000,2002,2004,2006,2008,2010,2012,2014,2016,2018,2020,2022,2024],
  teams: {
    Argentina:  [1890,1870,1920,1900,1960,1930,1950,1970,2010,1980,2000,1990,2060,2010,2020,2030,2090,2090],
    Spain:      [1840,1860,1870,1880,1900,1920,1930,1960,2000,2040,2080,2070,2050,2030,2010,2020,2050,2072],
    France:     [1850,1880,1900,1920,1960,2020,1990,1980,1960,1970,2010,1990,2000,2010,2050,2010,2040,2050],
    Brazil:     [1980,2000,2040,2010,2030,2010,2020,2040,2030,2000,2020,1990,2010,1990,1970,1960,1980,1980],
    Germany:    [1960,1950,1980,1970,1980,1960,1970,1960,2000,1980,2010,2000,2020,1980,1980,1960,1940,1958],
    England:    [1870,1880,1890,1900,1910,1880,1900,1920,1930,1940,1950,1960,1960,1970,1980,1960,1970,1986],
  }
};

/* ── NAVIGATION ─────────────────────────────────────────────────── */
const pageTitles = {
  dashboard:   'Dashboard',
  explorer:    'Data Explorer',
  predictions: 'Predictions',
  elo:         'ELO Rankings',
  wc2026:      'WC 2026',
};

let chartsInitialized = {};

function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.opacity = '0';
  });

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');

  const page = document.getElementById(`page-${pageId}`);
  if (page) {
    page.classList.add('active');
    requestAnimationFrame(() => { page.style.opacity = '1'; });
  }

  document.getElementById('topbar-title').textContent = pageTitles[pageId] || pageId;
  initPageCharts(pageId);
}

function initPageCharts(pageId) {
  if (chartsInitialized[pageId]) return;
  chartsInitialized[pageId] = true;

  switch (pageId) {
    case 'dashboard':   initDashboardCharts(); break;
    case 'explorer':    initExplorerCharts();   break;
    case 'predictions': initPredictionsCharts(); break;
    case 'elo':         initEloCharts();         break;
    case 'wc2026':      initWc2026Charts();      break;
  }
}

/* ── SIDEBAR TOGGLE (mobile) ────────────────────────────────────── */
document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

document.addEventListener('click', e => {
  const sidebar = document.getElementById('sidebar');
  const toggle  = document.getElementById('sidebar-toggle');
  if (window.innerWidth <= 768 && sidebar.classList.contains('open')
      && !sidebar.contains(e.target) && e.target !== toggle) {
    sidebar.classList.remove('open');
  }
});

/* ── NAV CLICK LISTENERS ────────────────────────────────────────── */
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    navigateTo(btn.dataset.page);
    if (window.innerWidth <= 768) {
      document.getElementById('sidebar').classList.remove('open');
    }
  });
});

/* ── HELPER: RANK BADGE ─────────────────────────────────────────── */
function rankBadge(rank) {
  const cls = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : 'rank-gray';
  return `<span class="rank-badge ${cls}">${rank}</span>`;
}

/* ── HELPER: ELO PROGRESS BAR ───────────────────────────────────── */
function eloBar(elo, max = 2090) {
  const pct = Math.round((elo / max) * 100);
  return `<div class="elo-bar-track"><div class="elo-bar-fill" style="width:${pct}%"></div></div>`;
}

/* ── HELPER: RESULT BADGE ────────────────────────────────────────── */
function resultBadge(result) {
  if (result === 'Home Win') return `<span class="badge badge-orange">Home Win</span>`;
  if (result === 'Away Win') return `<span class="badge badge-navy">Away Win</span>`;
  return `<span class="badge badge-gray">Draw</span>`;
}

/* ── POPULATE ELO TABLE (dashboard, top 10) ─────────────────────── */
function populateEloDash() {
  const tbody = document.getElementById('elo-table-dash');
  if (!tbody) return;
  ELO_RANKINGS.slice(0, 10).forEach((r, i) => {
    const rank = i + 1;
    const chg = r.change === '—' ? `<span class="elo-change same">—</span>`
      : r.change.startsWith('+') ? `<span class="elo-change up">${r.change}</span>`
      : `<span class="elo-change down">${r.change}</span>`;
    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td>${rankBadge(rank)}</td>
        <td style="font-weight:500">${r.team}</td>
        <td style="font-weight:700;color:var(--orange)">${r.elo}</td>
        <td>${eloBar(r.elo)}</td>
      </tr>`);
  });
}

/* ── POPULATE FEATURE BARS ──────────────────────────────────────── */
function populateFeatureBars() {
  const container = document.getElementById('feature-bars');
  if (!container) return;
  container.innerHTML = `<div class="feat-bars-list">
    ${FEATURES.map(f => `
      <div class="feat-bar-row">
        <span class="feat-bar-label">${f.name}</span>
        <div class="feat-bar-track">
          <div class="feat-bar-fill" style="width:${f.pct}%"></div>
        </div>
        <span class="feat-bar-val">${f.pct}%</span>
      </div>`).join('')}
  </div>`;
}

/* ── POPULATE PREDICTIONS TABLE ─────────────────────────────────── */
function populatePredictionsTable() {
  const tbody = document.getElementById('predictions-table');
  if (!tbody) return;
  PREDICTIONS.forEach(p => {
    const probBar = (val, color) =>
      `<div style="display:flex;align-items:center;gap:6px">
        <div style="width:50px;height:4px;background:#F1F5F9;border-radius:3px;overflow:hidden">
          <div style="width:${val}%;height:100%;background:${color};border-radius:3px"></div>
        </div>
        <span style="font-size:12px;font-weight:600">${val}%</span>
      </div>`;
    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td><span class="badge badge-gray">${p.group}</span></td>
        <td style="font-weight:500">${p.home}</td>
        <td class="match-vs">vs</td>
        <td style="font-weight:500">${p.away}</td>
        <td>${resultBadge(p.result)}</td>
        <td>${probBar(p.ph, '#E85D04')}</td>
        <td>${probBar(p.pd, '#94A3B8')}</td>
        <td>${probBar(p.pa, '#1E40AF')}</td>
      </tr>`);
  });
}

/* ── POPULATE GROUP WINNERS ─────────────────────────────────────── */
function populateGroupWinners() {
  const grid = document.getElementById('group-winners-grid');
  if (!grid) return;
  grid.innerHTML = GROUP_WINNERS.map(g => `
    <div class="group-winner-card">
      <span class="group-letter">Group ${g.group}</span>
      <div class="group-winner-name">🥇 ${g.winner}</div>
      <div class="group-runner-name">🥈 ${g.runner}</div>
    </div>`).join('');
}

/* ── POPULATE ELO FULL TABLE (page 4) ──────────────────────────── */
function populateEloFull() {
  const tbody = document.getElementById('elo-table-full');
  if (!tbody) return;
  ELO_RANKINGS.forEach((r, i) => {
    const rank = i + 1;
    const chg = r.change === '—' ? `<span class="elo-change same">—</span>`
      : r.change.startsWith('+') ? `<span class="elo-change up">${r.change}</span>`
      : `<span class="elo-change down">${r.change}</span>`;
    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td>${rankBadge(rank)}</td>
        <td style="font-weight:500">${r.team}</td>
        <td style="font-weight:700;color:var(--orange)">${r.elo}</td>
        <td>${eloBar(r.elo)}</td>
      </tr>`);
  });
}

/* ── POPULATE GROUP STANDINGS ────────────────────────────────────── */
function populateGroupStandings() {
  const grid = document.getElementById('group-standings-grid');
  if (!grid) return;

  Object.entries(GROUP_STANDINGS).forEach(([grp, rows]) => {
    const tableRows = rows.map((r, i) => `
      <tr class="${i < 2 ? 'advance' : ''}">
        <td class="pos-cell">${r.pos}</td>
        <td>${r.team}</td>
        <td>${r.mp}</td>
        <td>${r.w}</td>
        <td>${r.d}</td>
        <td>${r.l}</td>
        <td>${r.gd}</td>
        <td style="font-weight:700">${r.pts}</td>
      </tr>`).join('');

    grid.insertAdjacentHTML('beforeend', `
      <div class="standings-group-block">
        <h4>Group ${grp}</h4>
        <table class="standings-table">
          <thead>
            <tr>
              <th class="pos-cell">#</th>
              <th style="text-align:left">Team</th>
              <th>MP</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>PTS</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>`);
  });
}

/* ── BUILD KNOCKOUT BRACKET ─────────────────────────────────────── */
function buildKoBracket() {
  const container = document.getElementById('ko-bracket');
  if (!container) return;

  const rounds = [
    { key: 'r32',   label: 'Round of 32', matches: KO_BRACKET.r32   },
    { key: 'r16',   label: 'Round of 16', matches: KO_BRACKET.r16   },
    { key: 'qf',    label: 'Quarter-Finals', matches: KO_BRACKET.qf },
    { key: 'sf',    label: 'Semi-Finals', matches: KO_BRACKET.sf    },
    { key: 'final', label: '🏆 Final',    matches: KO_BRACKET.final, isFinal: true },
  ];

  rounds.forEach(round => {
    const matchesHtml = round.matches.map(m => `
      <div class="bracket-match">
        <div class="bracket-team ${m.w === m.t1 ? 'winner' : ''}">
          <span>${m.t1}</span>
        </div>
        <div class="bracket-team ${m.w === m.t2 ? 'winner' : ''}">
          <span>${m.t2}</span>
        </div>
      </div>`).join('');

    container.insertAdjacentHTML('beforeend', `
      <div class="bracket-round ${round.isFinal ? 'bracket-final' : ''}">
        <div class="bracket-round-title">${round.label}</div>
        <div class="bracket-matches">${matchesHtml}</div>
      </div>`);
  });
}

/* ── CALCULATE WC KPIs ───────────────────────────────────────────── */
function calcWcKpis() {
  let totalGoals = 0;
  let matchCount = 0;
  Object.values(GROUP_STANDINGS).forEach(rows => {
    rows.forEach(r => {
      totalGoals += parseInt(r.gd.replace('+','')) > 0 ? parseInt(r.gd.replace('+','')) : 0;
    });
  });
  // From worldcup2026_clean.csv — 60 finished group matches
  const goals = 177;
  const avg   = (177 / 60).toFixed(2);
  const el = document.getElementById('total-goals-kpi');
  const el2 = document.getElementById('avg-goals-kpi');
  if (el)  el.textContent  = goals;
  if (el2) el2.textContent = avg;
}

/* ── CHARTS: DASHBOARD ──────────────────────────────────────────── */
function initDashboardCharts() {
  populateEloDash();
  populateFeatureBars();

  /* Monte Carlo top 5 horizontal bar */
  new Chart(document.getElementById('chart-monte-carlo'), {
    type: 'bar',
    data: {
      labels: ['Argentina','Spain','France','England','Colombia'],
      datasets: [{
        label: 'Win %',
        data:  [31.7, 22.1, 11.6, 6.9, 6.8],
        backgroundColor: C.orange,
        borderRadius: 6,
        barThickness: 22,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { ...tooltipDefaults,
          callbacks: { label: ctx => ` ${ctx.parsed.x}%` }
        },
        datalabels: { display: false },
      },
      scales: {
        x: { grid: { color: C.grid, drawBorder: false }, ticks: { callback: v => v + '%' }, max: 35 },
        y: { grid: { display: false }, ticks: { color: '#0F172A', font: { weight: '500' } } },
      }
    }
  });
}

/* ── CHARTS: EXPLORER ───────────────────────────────────────────── */
function initExplorerCharts() {

  /* Goals per Decade — Line */
  const decades = ['1900','1910','1920','1930','1940','1950','1960','1970','1980','1990','2000','2010','2020'];
  const goalsData = [312,287,445,892,623,1205,2341,3456,4123,5678,7234,8901,6123];

  new Chart(document.getElementById('chart-goals-decade'), {
    type: 'line',
    data: {
      labels: decades,
      datasets: [{
        label: 'Total Goals',
        data: goalsData,
        borderColor: C.orange,
        backgroundColor: 'rgba(232,93,4,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: C.orange,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: tooltipDefaults },
      scales: baseScales('Decade', 'Goals'),
    }
  });

  /* Match Result Distribution — Donut */
  new Chart(document.getElementById('chart-results-donut'), {
    type: 'doughnut',
    data: {
      labels: ['Home Win','Draw','Away Win'],
      datasets: [{
        data: [46, 24, 30],
        backgroundColor: [C.orange, C.navy, C.gray],
        hoverOffset: 6,
        borderWidth: 2,
        borderColor: '#FFFFFF',
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { ...tooltipDefaults, callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` } },
      }
    },
    plugins: [{
      id: 'centerText',
      beforeDraw(chart) {
        const { ctx, chartArea: { left, top, right, bottom } } = chart;
        const cx = (left + right) / 2, cy = (top + bottom) / 2;
        ctx.save();
        ctx.font = 'bold 14px Inter';
        ctx.fillStyle = '#0F172A';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('47,912', cx, cy - 8);
        ctx.font = '11px Inter';
        ctx.fillStyle = '#64748B';
        ctx.fillText('matches', cx, cy + 10);
        ctx.restore();
      }
    }]
  });

  /* Top 10 Nations — Win Rate — Horizontal Bar */
  new Chart(document.getElementById('chart-winrate'), {
    type: 'bar',
    data: {
      labels: ['Brazil','Spain','Germany','Argentina','France','Netherlands','England','Portugal','Italy','Uruguay'],
      datasets: [{
        label: 'Win Rate',
        data:  [64, 62, 60, 59, 58, 56, 54, 53, 52, 51],
        backgroundColor: C.orange,
        borderRadius: 6,
        barThickness: 18,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { ...tooltipDefaults, callbacks: { label: ctx => ` ${ctx.parsed.x}%` } } },
      scales: {
        x: { grid: { color: C.grid, drawBorder: false }, ticks: { callback: v => v + '%' }, min: 40, max: 70 },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } },
      }
    }
  });

  /* Goal Type by Decade — Stacked Area */
  new Chart(document.getElementById('chart-goal-type'), {
    type: 'line',
    data: {
      labels: ['1900','1910','1920','1930','1940','1950','1960','1970','1980','1990','2000','2010','2020'],
      datasets: [
        {
          label: 'Normal',
          data: [290,265,415,830,575,1100,2150,3150,3700,5050,6400,7800,5400],
          backgroundColor: 'rgba(16,185,129,0.4)',
          borderColor: C.green,
          fill: true, tension: 0.4, pointRadius: 2,
        },
        {
          label: 'Penalty',
          data: [18,18,25,55,40,95,170,280,390,570,760,990,640],
          backgroundColor: 'rgba(232,93,4,0.5)',
          borderColor: C.orange,
          fill: true, tension: 0.4, pointRadius: 2,
        },
        {
          label: 'Own Goal',
          data: [4,4,5,7,8,10,21,26,33,58,74,111,83],
          backgroundColor: 'rgba(239,68,68,0.5)',
          borderColor: C.red,
          fill: true, tension: 0.4, pointRadius: 2,
        },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' }, tooltip: tooltipDefaults },
      scales: { ...baseScales('Decade', 'Goals'), x: { stacked: false, grid: { color: C.grid, drawBorder: false } }, y: { stacked: false, grid: { color: C.grid, drawBorder: false } } },
    }
  });

  /* Top 10 All-Time Scorers — Horizontal Bar */
  new Chart(document.getElementById('chart-scorers'), {
    type: 'bar',
    data: {
      labels: ['Ronaldo (CR)','Messi','Daei','Kane','Puskas','Lewandowski','Muller','Rooney','Klinsmann','Shearer'],
      datasets: [{
        label: 'Goals',
        data:  [123, 109, 109, 95, 84, 82, 68, 53, 47, 30],
        backgroundColor: C.orange,
        borderRadius: 6,
        barThickness: 18,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: tooltipDefaults },
      scales: {
        x: { grid: { color: C.grid, drawBorder: false } },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } },
      }
    }
  });

  /* ELO Distribution — Bar histogram */
  new Chart(document.getElementById('chart-elo-dist'), {
    type: 'bar',
    data: {
      labels: ['<1000','1000','1100','1200','1300','1400','1500','1600','1700','1800','1900','2000','>2000'],
      datasets: [{
        label: 'Teams',
        data:  [4, 8, 14, 22, 38, 62, 70, 54, 36, 20, 12, 8, 4],
        backgroundColor: C.navy,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: tooltipDefaults,
        annotation: {
          annotations: {
            startElo: {
              type: 'line',
              xMin: 6, xMax: 6,
              borderColor: C.orange,
              borderWidth: 2,
              borderDash: [5, 4],
              label: { content: 'Start ELO 1500', display: true, color: C.orange, font: { size: 10 } },
            }
          }
        }
      },
      scales: {
        x: { grid: { color: C.grid, drawBorder: false }, ticks: { font: { size: 10 } } },
        y: { grid: { color: C.grid, drawBorder: false }, title: { display: true, text: 'Teams' } },
      }
    }
  });
}

/* ── CHARTS: PREDICTIONS ────────────────────────────────────────── */
function initPredictionsCharts() {
  populatePredictionsTable();
  populateGroupWinners();

  const sorted = [...CHAMP_PROBS].sort((a, b) => b.pct - a.pct);

  new Chart(document.getElementById('chart-champ-probs'), {
    type: 'bar',
    data: {
      labels: sorted.map(d => d.team),
      datasets: [{
        label: 'Win Probability %',
        data:  sorted.map(d => d.pct),
        backgroundColor: sorted.map((_, i) => i === 0 ? C.orange : `rgba(232,93,4,${Math.max(0.2, 0.9 - i * 0.05)})`),
        borderRadius: 6,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { ...tooltipDefaults, callbacks: { label: ctx => ` ${ctx.parsed.x}%` } },
        subtitle: {
          display: true,
          text: 'Based on 5,000 Monte Carlo simulations — XGBoost predict_proba()',
          color: '#94A3B8', font: { size: 11 }, padding: { bottom: 10 }
        }
      },
      scales: {
        x: { grid: { color: C.grid, drawBorder: false }, ticks: { callback: v => v + '%' } },
        y: { grid: { display: false }, ticks: { font: { size: 12, weight: '500' } } },
      }
    }
  });
}

/* ── CHARTS: ELO ────────────────────────────────────────────────── */
function initEloCharts() {
  populateEloFull();

  const teamColors = [C.orange, C.navy, C.green, C.gold, C.purple, C.red];
  const datasets = Object.entries(ELO_TRAJECTORY.teams).map(([team, data], i) => ({
    label: team,
    data,
    borderColor: teamColors[i],
    backgroundColor: 'transparent',
    tension: 0.4,
    pointRadius: 3,
    pointHoverRadius: 5,
    borderWidth: 2.5,
  }));

  new Chart(document.getElementById('chart-elo-trajectory'), {
    type: 'line',
    data: { labels: ELO_TRAJECTORY.years, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { padding: 14, font: { size: 12 } } },
        tooltip: tooltipDefaults,
      },
      scales: {
        x: { grid: { color: C.grid, drawBorder: false } },
        y: { grid: { color: C.grid, drawBorder: false }, min: 1800, max: 2150, ticks: { stepSize: 50 } },
      }
    }
  });
}

/* ── CHARTS: WC 2026 ────────────────────────────────────────────── */
function initWc2026Charts() {
  calcWcKpis();
  populateGroupStandings();
  buildKoBracket();

  /* Goals per Group — Bar */
  /* Real totals from finished group-stage matches in worldcup2026_clean.csv */
  const groupGoals = { A:12, B:22, C:16, D:15, E:17, F:26, G:10, H:10, I:17, J:12, K:12, L:8 };
  const avgLine = Object.values(groupGoals).reduce((s,v) => s+v, 0) / 12;

  new Chart(document.getElementById('chart-goals-group'), {
    type: 'bar',
    data: {
      labels: Object.keys(groupGoals).map(g => `Group ${g}`),
      datasets: [
        {
          label: 'Goals',
          data: Object.values(groupGoals),
          backgroundColor: C.orange,
          borderRadius: 8,
        },
        {
          label: `Avg (${avgLine.toFixed(1)})`,
          data: Array(12).fill(avgLine),
          type: 'line',
          borderColor: C.navy,
          borderDash: [5, 4],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'top' }, tooltip: tooltipDefaults },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: C.grid, drawBorder: false }, beginAtZero: true },
      }
    }
  });

  /* Group Stage Result Split — Donut */
  new Chart(document.getElementById('chart-wc-results'), {
    type: 'doughnut',
    data: {
      labels: ['Home Win','Draw','Away Win'],
      datasets: [{
        data: [31, 16, 13],  /* actual: 31 home wins, 16 draws, 13 away wins from 60 finished */
        backgroundColor: [C.orange, C.navy, C.gray],
        borderWidth: 2,
        borderColor: '#FFFFFF',
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { ...tooltipDefaults, callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} matches` } },
      }
    }
  });
}

/* ── FILTER (cosmetic) ──────────────────────────────────────────── */
function applyFilters() {
  const btn = document.querySelector('.filter-btn');
  const orig = btn.textContent;
  btn.textContent = 'Applied ✓';
  btn.style.background = '#16A34A';
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.background = '';
  }, 1200);
}

/* ── INIT ───────────────────────────────────────────────────────── */
(function init() {
  /* Wrap page-container around all .page divs */
  const main = document.getElementById('main-content');
  const pages = main.querySelectorAll('.page');
  const container = document.createElement('div');
  container.id = 'page-container';
  const firstPage = pages[0];
  main.insertBefore(container, firstPage);
  pages.forEach(p => container.appendChild(p));

  navigateTo('dashboard');
})();
