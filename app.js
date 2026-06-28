const flagsMap = {
  'South Africa': '🇿🇦',
  'Canada': '🇨🇦',
  'Germany': '🇩🇪',
  'Paraguay': '🇵🇾',
  'Netherlands': '🇳🇱',
  'Morocco': '🇲🇦',
  'Brazil': '🇧🇷',
  'Japan': '🇯🇵',
  'France': '🇫🇷',
  'Sweden': '🇸🇪',
  'Ivory Coast': '🇨🇮',
  'Norway': '🇳🇴',
  'Mexico': '🇲🇽',
  'Ecuador': '🇪🇨',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Democratic Republic of the Congo': '🇨🇩',
  'DR Congo': '🇨🇩',
  'United States': '🇺🇸',
  'Bosnia and Herzegovina': '🇧🇦',
  'Belgium': '🇧🇪',
  'Senegal': '🇸🇳',
  'Portugal': '🇵🇹',
  'Croatia': '🇭🇷',
  'Spain': '🇪🇸',
  'Austria': '🇦🇹',
  'Switzerland': '🇨🇭',
  'Algeria': '🇩🇿',
  'Argentina': '🇦🇷',
  'Cape Verde': '🇨🇻',
  'Colombia': '🇨🇴',
  'Ghana': '🇬🇭',
  'Australia': '🇦🇺',
  'Egypt': '🇪🇬'
};

const timezoneOffsets = {
  // Mexico (UTC-6 year-round)
  '1': -6, '2': -6, '3': -6,
  // US Central (CDT, UTC-5)
  '4': -5, '5': -5, '6': -5,
  // US/Canada Eastern (EDT, UTC-4)
  '7': -4, '8': -4, '9': -4, '10': -4, '11': -4, '12': -4,
  // US/Canada Pacific (PDT, UTC-7)
  '13': -7, '14': -7, '15': -7, '16': -7
};

const teamTranslations = {
  'South Africa': '南非',
  'Canada': '加拿大',
  'Germany': '德国',
  'Paraguay': '巴拉圭',
  'Netherlands': '荷兰',
  'Morocco': '摩洛哥',
  'Brazil': '巴西',
  'Japan': '日本',
  'France': '法国',
  'Sweden': '瑞典',
  'Ivory Coast': '科特迪瓦',
  'Norway': '挪威',
  'Mexico': '墨西哥',
  'Ecuador': '厄瓜多尔',
  'England': '英格兰',
  'Democratic Republic of the Congo': '刚果金',
  'DR Congo': '刚果金',
  'United States': '美国',
  'Bosnia and Herzegovina': '波黑',
  'Belgium': '比利时',
  'Senegal': '塞内加尔',
  'Portugal': '葡萄牙',
  'Croatia': '克罗地亚',
  'Spain': '西班牙',
  'Austria': '奥地利',
  'Switzerland': '瑞士',
  'Algeria': '阿尔及利亚',
  'Argentina': '阿根廷',
  'Cape Verde': '佛得角',
  'Colombia': '哥伦比亚',
  'Ghana': '加纳',
  'Australia': '澳大利亚',
  'Egypt': '埃及'
};

function translateTeamName(name) {
  if (!name) return '';
  if (teamTranslations[name]) return teamTranslations[name];

  // Translate bracket placeholders
  const winnerMatch = name.match(/Winner Match (\d+)/i);
  if (winnerMatch) {
    return `第${winnerMatch[1]}场胜者`;
  }
  const loserMatch = name.match(/Loser Match (\d+)/i);
  if (loserMatch) {
    return `第${loserMatch[1]}场败者`;
  }

  return name;
}

function getFlag(teamName) {
  if (!teamName) return '⚽';
  for (const name in flagsMap) {
    if (teamName.includes(name) || teamName.includes(teamTranslations[name])) {
      return flagsMap[name];
    }
  }
  return '⚽';
}

// Global State
// 默认数据库配置 (可在此处填入您的 Supabase 凭证，方便好友访问时免去配置，Anon Key 可以公开提交至 GitHub)
const defaultSupabaseUrl = 'https://knyhqsviwufzxqwvajqe.supabase.co';
const defaultSupabaseKey = 'sb_publishable_8774b2tWJNsvgN9A6V8FHA_prPMWFrk';

let matches = [];
let userTips = {};
let username = '玩家 1';
let friends = [];
let activeView = 'list'; // 'list' or 'bracket'
let supabaseClient = null;

// DOM Elements
const matchesContainer = document.getElementById('matches-container');
const leaderboardList = document.getElementById('leaderboard-list');
const usernameInput = document.getElementById('username-input');
const btnSaveUsername = document.getElementById('btn-save-username');
const btnShareTips = document.getElementById('btn-share-tips');
const btnSyncResults = document.getElementById('btn-sync-results');
const viewToggleOptions = document.querySelectorAll('.toggle-option');
const rulesTrigger = document.getElementById('rules-trigger');
const rulesModal = document.getElementById('rules-modal');
const closeModal = document.getElementById('close-modal');

// Auth DOM Elements
const btnShowAuthModal = document.getElementById('btn-show-auth-modal');
const btnAuthLogout = document.getElementById('btn-auth-logout');
const authModal = document.getElementById('auth-modal');
const closeAuthModal = document.getElementById('close-auth-modal');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const btnAuthLogin = document.getElementById('btn-auth-login');
const btnAuthSignup = document.getElementById('btn-auth-signup');
const authErrorMsg = document.getElementById('auth-error-msg');
const authLoggedOut = document.getElementById('auth-logged-out');
const authLoggedIn = document.getElementById('auth-logged-in');
const userEmailDisplay = document.getElementById('user-email-display');
const btnSavePredictions = document.getElementById('btn-save-predictions');


// Load Data from Local Storage
function loadLocalStorage() {
  username = localStorage.getItem('wc2026_username') || '玩家 1';
  usernameInput.value = username;

  const savedTips = localStorage.getItem('wc2026_tips');
  if (savedTips) {
    userTips = JSON.parse(savedTips);
  }

  const savedFriends = localStorage.getItem('wc2026_friends');
  if (savedFriends) {
    friends = JSON.parse(savedFriends);
  }
}

// Initialize Supabase Client
function initSupabase() {
  const url = localStorage.getItem('wc2026_supabase_url') || defaultSupabaseUrl;
  const key = localStorage.getItem('wc2026_supabase_key') || defaultSupabaseKey;

  if (url && key) {
    try {
      if (typeof supabase !== 'undefined' && supabase.createClient) {
        supabaseClient = supabase.createClient(url, key);
        console.log('Supabase client initialized.');

        // Listen for authentication state changes
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            authLoggedOut.style.display = 'none';
            authLoggedIn.style.display = 'flex';
            userEmailDisplay.textContent = session.user.email;
            userEmailDisplay.title = session.user.email;

            // Set username automatically from email prefix if nickname is default
            const emailPrefix = session.user.email.split('@')[0];
            if (!localStorage.getItem('wc2026_username') || username === '玩家 1') {
              username = emailPrefix;
              usernameInput.value = username;
              localStorage.setItem('wc2026_username', username);
            }
          } else {
            authLoggedOut.style.display = 'flex';
            authLoggedIn.style.display = 'none';
            userEmailDisplay.textContent = '';
          }
          await syncFromSupabase();
          renderLeaderboard();
        });
      } else {
        console.warn('Supabase library not loaded.');
      }
    } catch (e) {
      console.error('Failed to init Supabase:', e);
      supabaseClient = null;
    }
  } else {
    supabaseClient = null;
  }
}

// Sync predictions from Supabase database
async function syncFromSupabase() {
  if (!supabaseClient) return;

  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const currentUserId = session?.user?.id;

    const { data, error } = await supabaseClient
      .from('predictions')
      .select('user_id, username, tips, updated_at');

    if (error) throw error;

    if (data) {
      const dbFriends = [];
      data.forEach(row => {
        const isSelf = currentUserId 
          ? (row.user_id === currentUserId)
          : (row.username === username);

        if (isSelf) {
          // Sync nickname if database has a different username
          if (row.username && row.username !== username) {
            username = row.username;
            usernameInput.value = username;
            localStorage.setItem('wc2026_username', username);
          }
          // If we have no local tips but DB has them, restore from DB
          if (Object.keys(userTips).length === 0 && row.tips) {
            userTips = row.tips;
            localStorage.setItem('wc2026_tips', JSON.stringify(userTips));
          }
        } else {
          // Add to friends list
          const serialized = serializeTips(row.tips);
          dbFriends.push({
            name: row.username,
            tips: serialized
          });
        }
      });

      friends = dbFriends;
      localStorage.setItem('wc2026_friends', JSON.stringify(friends));
    }
  } catch (e) {
    console.error('Supabase sync error:', e);
    showToast('同步数据库失败', true);
  }
}

// Save User Tips locally
function saveTipsLocal() {
  localStorage.setItem('wc2026_tips', JSON.stringify(userTips));
}

// Save User Tips both locally and to Supabase database
async function saveTips() {
  saveTipsLocal();

  if (supabaseClient) {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session?.user) {
        const oldText = btnSavePredictions ? btnSavePredictions.innerHTML : '💾 保存预测';
        if (btnSavePredictions) {
          btnSavePredictions.innerHTML = '💾 保存中...';
          btnSavePredictions.disabled = true;
        }

        const { error } = await supabaseClient
          .from('predictions')
          .upsert({
            user_id: session.user.id,
            username: username,
            tips: userTips,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (btnSavePredictions) {
          btnSavePredictions.innerHTML = oldText;
          btnSavePredictions.disabled = false;
        }

        if (error) {
          console.error('Failed to sync with Supabase:', error);
          showToast('同步数据库失败，请检查数据库配置与 RLS 权限', true);
        } else {
          showToast('预测数据已成功保存至云端数据库！');
        }
      } else {
        showToast('登录后才能保存到云端', true);
      }
    } catch (e) {
      console.error('Failed to get session for saveTips:', e);
      showToast('保存失败', true);
      if (btnSavePredictions) {
        btnSavePredictions.innerHTML = '💾 保存预测';
        btnSavePredictions.disabled = false;
      }
    }
  } else {
    showToast('本地数据已保存');
  }
}

// Fetch Results and Initialize
async function init() {
  loadLocalStorage();
  initSupabase();
  setupEventListeners();


  // Check URL parameters for shared friend tips
  await checkSharedUrl();

  await fetchMatches();

  if (supabaseClient) {
    await syncFromSupabase();
  }

  renderApp();
}

// Event Listeners
function setupEventListeners() {
  // Save username
  btnSaveUsername.addEventListener('click', () => {
    const val = usernameInput.value.trim();
    if (val) {
      const oldName = username;
      username = val;
      localStorage.setItem('wc2026_username', username);

      // If Supabase is running, write tips under the new name
      saveTips();

      renderLeaderboard();
      showToast('用户名已更新！');
    }
  });

  // Share tips
  btnShareTips.addEventListener('click', () => {
    const encoded = serializeTips(userTips);
    const shareUrl = `${window.location.origin}${window.location.pathname}?player=${encodeURIComponent(username)}&tips=${encoded}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('分享链接已复制！快发送给好友吧。');
    }).catch(err => {
      console.error('Failed to copy share link:', err);
      alert(`这是您的分享链接：\n${shareUrl}`);
    });
  });

  // Sync results from API
  btnSyncResults.addEventListener('click', async () => {
    btnSyncResults.disabled = true;
    const oldText = btnSyncResults.innerHTML;
    btnSyncResults.innerHTML = '⚡ 同步中...';

    try {
      const response = await fetch('https://worldcup26.ir/get/games');
      if (!response.ok) throw new Error('Network response not ok');
      const data = await response.json();

      const apiGames = data.games.filter(g => g.type !== 'group');
      const apiGamesMap = {};
      apiGames.forEach(g => apiGamesMap[g.id] = g);

      const nextMatchMap = {
        '73': { matchId: '90' }, '75': { matchId: '90' },
        '74': { matchId: '89' }, '77': { matchId: '89' },
        '76': { matchId: '91' }, '78': { matchId: '91' },
        '79': { matchId: '92' }, '80': { matchId: '92' },
        '83': { matchId: '93' }, '84': { matchId: '93' },
        '81': { matchId: '94' }, '82': { matchId: '94' },
        '85': { matchId: '96' }, '87': { matchId: '96' },
        '86': { matchId: '95' }, '88': { matchId: '95' },
        '89': { matchId: '97' }, '90': { matchId: '97' },
        '91': { matchId: '99' }, '92': { matchId: '99' },
        '93': { matchId: '98' }, '94': { matchId: '98' },
        '95': { matchId: '100' }, '96': { matchId: '100' },
        '97': { matchId: '101' }, '98': { matchId: '101' },
        '99': { matchId: '102' }, '100': { matchId: '102' },
        '101': { matchId: '104' }, '102': { matchId: '104' }
      };

      const updatedMatches = apiGames.map(g => {
        const homeTeam = translateTeamName(g.home_team_name_en || g.home_team_label);
        const awayTeam = translateTeamName(g.away_team_name_en || g.away_team_label);
        const finished = g.finished === 'TRUE';
        const score1 = finished ? parseInt(g.home_score) : null;
        const score2 = finished ? parseInt(g.away_score) : null;

        let winner = null;
        if (finished) {
          if (score1 > score2) {
            winner = homeTeam;
          } else if (score1 < score2) {
            winner = awayTeam;
          } else {
            const next = nextMatchMap[g.id];
            if (next) {
              const nextGame = apiGamesMap[next.matchId];
              if (nextGame) {
                const nextHome = translateTeamName(nextGame.home_team_name_en);
                const nextAway = translateTeamName(nextGame.away_team_name_en);
                if (nextHome === homeTeam || nextAway === homeTeam) {
                  winner = homeTeam;
                } else if (nextHome === awayTeam || nextAway === awayTeam) {
                  winner = awayTeam;
                }
              }
            }
          }
        }

        // Calculate kickoff ISO time
        let kickoffIso = null;
        let formattedDate = g.local_date;
        try {
          const parts = g.local_date.split(' ');
          const dateParts = parts[0].split('/');
          const timeParts = parts[1].split(':');

          const utcMs = Date.UTC(
            parseInt(dateParts[2]),
            parseInt(dateParts[0]) - 1,
            parseInt(dateParts[1]),
            parseInt(timeParts[0]),
            parseInt(timeParts[1])
          );

          const offsetHours = timezoneOffsets[g.stadium_id] || 0;
          const kickoffDate = new Date(utcMs - offsetHours * 60 * 60 * 1000);
          kickoffIso = kickoffDate.toISOString();

          formattedDate = kickoffDate.toLocaleString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'UTC'
          }) + ' UTC';
        } catch (e) {
          console.error(e);
        }

        return {
          id: g.id,
          type: g.type,
          stage: getStageName(g.type),
          date: formattedDate,
          kickoff: kickoffIso,
          team1: homeTeam,
          team2: awayTeam,
          score1,
          score2,
          winner,
          status: finished ? 'completed' : (g.time_elapsed === 'notstarted' ? 'scheduled' : 'live')
        };
      });

      updatedMatches.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      matches = updatedMatches;
      localStorage.setItem('wc2026_matches_cached', JSON.stringify(matches));

      // If database is active, pull friends tips too
      if (supabaseClient) {
        await syncFromSupabase();
      }

      renderApp();
      showToast('赛果同步成功！');
    } catch (e) {
      console.error('Failed to sync scores:', e);
      showToast('同步失败。正在使用本地缓存。', true);
    } finally {
      btnSyncResults.disabled = false;
      btnSyncResults.innerHTML = oldText;
    }
  });

  // Toggling Views
  viewToggleOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      viewToggleOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      activeView = opt.dataset.view;
      renderMatches();
    });
  });

  // Rules Modal
  rulesTrigger.addEventListener('click', () => rulesModal.classList.add('active'));
  closeModal.addEventListener('click', () => rulesModal.classList.remove('active'));

  // Auth Event Listeners
  if (btnShowAuthModal) {
    btnShowAuthModal.addEventListener('click', () => {
      authEmail.value = '';
      authPassword.value = '';
      authErrorMsg.style.display = 'none';
      authModal.classList.add('active');
    });
  }

  if (closeAuthModal) {
    closeAuthModal.addEventListener('click', () => {
      authModal.classList.remove('active');
    });
  }

  if (btnAuthLogin) {
    btnAuthLogin.addEventListener('click', async () => {
      authErrorMsg.style.display = 'none';
      const email = authEmail.value.trim();
      const password = authPassword.value;

      if (!email || !password) {
        authErrorMsg.textContent = '请填写邮箱和密码';
        authErrorMsg.style.display = 'block';
        return;
      }

      btnAuthLogin.disabled = true;
      btnAuthLogin.textContent = '登录中...';

      try {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showToast('登录成功！');
        authModal.classList.remove('active');
      } catch (err) {
        authErrorMsg.textContent = err.message || '登录失败，请检查输入';
        authErrorMsg.style.display = 'block';
      } finally {
        btnAuthLogin.disabled = false;
        btnAuthLogin.textContent = '登录';
      }
    });
  }

  if (btnAuthSignup) {
    btnAuthSignup.addEventListener('click', async () => {
      authErrorMsg.style.display = 'none';
      const email = authEmail.value.trim();
      const password = authPassword.value;

      if (!email || !password) {
        authErrorMsg.textContent = '请填写邮箱和密码';
        authErrorMsg.style.display = 'block';
        return;
      }

      if (password.length < 6) {
        authErrorMsg.textContent = '密码长度至少为 6 位';
        authErrorMsg.style.display = 'block';
        return;
      }

      btnAuthSignup.disabled = true;
      btnAuthSignup.textContent = '注册中...';

      try {
        const { data, error } = await supabaseClient.auth.signUp({ email, password });
        if (error) throw error;

        if (data?.session) {
          showToast('注册并登录成功！');
          authModal.classList.remove('active');
        } else {
          alert('注册成功！若开启了邮箱验证，请检查您的邮箱收件箱进行确认。');
          authModal.classList.remove('active');
        }
      } catch (err) {
        authErrorMsg.textContent = err.message || '注册失败';
        authErrorMsg.style.display = 'block';
      } finally {
        btnAuthSignup.disabled = false;
        btnAuthSignup.textContent = '注册';
      }
    });
  }

  if (btnAuthLogout) {
    btnAuthLogout.addEventListener('click', async () => {
      try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        showToast('已登出');
      } catch (err) {
        console.error('Logout failed:', err);
      }
    });
  }

  if (btnSavePredictions) {
    btnSavePredictions.addEventListener('click', () => {
      saveTips();
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === rulesModal) rulesModal.classList.remove('active');
    if (e.target === authModal) authModal.classList.remove('active');
  });
}



function getStageName(type) {
  switch (type) {
    case 'r32': return '32强赛';
    case 'r16': return '16强赛';
    case 'qf': return '1/4决赛';
    case 'sf': return '半决赛';
    case 'third': return '三四名决赛';
    case 'final': return '决赛';
    default: return type;
  }
}

// Fetch matches from results.json
async function fetchMatches() {
  const cached = localStorage.getItem('wc2026_matches_cached');
  if (cached) {
    matches = JSON.parse(cached);
  }

  try {
    const response = await fetch('./results.json');
    if (!response.ok) throw new Error('Local results.json not found');
    const data = await response.json();
    matches = data.matches;
    localStorage.setItem('wc2026_matches_cached', JSON.stringify(matches));
  } catch (e) {
    console.warn('Could not load results.json, using API or cache', e);
    if (matches.length === 0) {
      btnSyncResults.click();
    }
  }
}

// Check if loaded with shared link
async function checkSharedUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const sharedPlayer = urlParams.get('player');
  const sharedTips = urlParams.get('tips');

  if (sharedPlayer && sharedTips) {
    const confirmed = confirm(`是否将 “${sharedPlayer}” 添加到您的好友积分榜？`);
    if (confirmed) {
      friends = friends.filter(f => f.name !== sharedPlayer);
      friends.push({ name: sharedPlayer, tips: sharedTips });
      localStorage.setItem('wc2026_friends', JSON.stringify(friends));
      alert(`成功！已将 “${sharedPlayer}” 载入排行榜。`);
    }

    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// Serialize predictions
function serializeTips(tips) {
  const parts = [];
  for (const id in tips) {
    const tip = tips[id];
    if (tip && tip.score1 !== null && tip.score1 !== undefined && tip.score2 !== null && tip.score2 !== undefined) {
      const winnerMarker = tip.winner === 'team1' ? '1' : (tip.winner === 'team2' ? '2' : '0');
      parts.push(`${id}:${tip.score1}-${tip.score2}-${winnerMarker}`);
    }
  }
  return btoa(parts.join(','));
}

// Deserialize predictions
function deserializeTips(encoded) {
  const tips = {};
  try {
    const decoded = atob(encoded);
    if (!decoded) return tips;
    const parts = decoded.split(',');
    parts.forEach(part => {
      const [id, scoreStr] = part.split(':');
      if (id && scoreStr) {
        const [s1, s2, w] = scoreStr.split('-');
        tips[id] = {
          score1: parseInt(s1),
          score2: parseInt(s2),
          winner: w === '1' ? 'team1' : (w === '2' ? 'team2' : null)
        };
      }
    });
  } catch (e) {
    console.error('Failed to parse tips:', e);
  }
  return tips;
}

// Calculate scores for a player's tips
function calculatePlayerScore(playerTips) {
  let points = 0;
  let exactCount = 0;
  let correctCount = 0;

  matches.forEach(m => {
    if (m.status !== 'completed' || m.score1 === null || m.score2 === null) return;

    const tip = playerTips[m.id];
    if (!tip || tip.score1 === null || tip.score1 === undefined || tip.score2 === null || tip.score2 === undefined) return;

    const actual1 = m.score1;
    const actual2 = m.score2;
    const tip1 = tip.score1;
    const tip2 = tip.score2;

    if (actual1 === tip1 && actual2 === tip2) {
      points += 3;
      exactCount++;
    }
    else if ((actual1 - actual2 === tip1 - tip2) && Math.sign(actual1 - actual2) === Math.sign(tip1 - tip2)) {
      points += 2;
      correctCount++;
    }
    else if (Math.sign(actual1 - actual2) === Math.sign(tip1 - tip2)) {
      points += 1;
      correctCount++;
    }

    const actualWinner = m.winner;
    let tipWinnerName = null;
    if (tip.winner === 'team1') tipWinnerName = m.team1;
    else if (tip.winner === 'team2') tipWinnerName = m.team2;
    else {
      if (tip1 > tip2) tipWinnerName = m.team1;
      else if (tip1 < tip2) tipWinnerName = m.team2;
    }

    if (actualWinner && tipWinnerName && actualWinner === tipWinnerName) {
      points += 1;
    }
  });

  return { points, exactCount, correctCount };
}

// Render the application components
function renderApp() {
  renderLeaderboard();
  renderMatches();
}

// Render Leaderboard
function renderLeaderboard() {
  const leaderboard = [];

  // Add self
  const selfScore = calculatePlayerScore(userTips);
  leaderboard.push({
    name: username,
    points: selfScore.points,
    exactCount: selfScore.exactCount,
    correctCount: selfScore.correctCount,
    isSelf: true
  });

  // Add friends
  friends.forEach(f => {
    const friendTips = deserializeTips(f.tips);
    const friendScore = calculatePlayerScore(friendTips);
    leaderboard.push({
      name: f.name,
      points: friendScore.points,
      exactCount: friendScore.exactCount,
      correctCount: friendScore.correctCount,
      isSelf: false,
      tipsEncoded: f.tips
    });
  });

  leaderboard.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.exactCount !== a.exactCount) return b.exactCount - a.exactCount;
    return a.name.localeCompare(b.name);
  });

  leaderboardList.innerHTML = '';
  leaderboard.forEach((player, idx) => {
    const li = document.createElement('div');
    li.className = `leaderboard-item ${player.isSelf ? 'current-user' : ''}`;

    li.innerHTML = `
      <div class="player-info">
        <span class="player-rank">#${idx + 1}</span>
        <span class="player-name" title="${player.name}">${player.name}</span>
      </div>
      <div class="player-stats">
        <div class="player-points">${player.points} 分</div>
        <div class="player-accuracy">精准: ${player.exactCount} | 对方向: ${player.correctCount}</div>
      </div>
    `;

    if (!player.isSelf) {
      li.addEventListener('click', () => {
        renderFriendTips(player.name, deserializeTips(player.tipsEncoded));
      });
      li.style.cursor = 'pointer';
      li.title = `点击查看 ${player.name} 的比分预测`;
    } else {
      li.addEventListener('click', () => {
        renderMatches();
      });
      li.style.cursor = 'pointer';
      li.title = '正在查看您的预测';
    }

    leaderboardList.appendChild(li);
  });
}

// Render Friend's tips (Read-only view)
function renderFriendTips(friendName, friendTips) {
  showToast(`正在查看 ${friendName} 的预测（只读）`);
  renderMatches(friendTips, friendName);
}

// Render Matches
function renderMatches(displayTips = userTips, viewingPlayerName = null) {
  matchesContainer.innerHTML = '';

  const titleBar = document.createElement('div');
  titleBar.style.padding = '0 1rem 1rem 1rem';
  titleBar.style.display = 'flex';
  titleBar.style.justifyContent = 'space-between';
  titleBar.style.alignItems = 'center';

  const isViewingSelf = viewingPlayerName === null;
  const displayName = isViewingSelf ? '我的预测比分' : `${viewingPlayerName} 的预测`;

  titleBar.innerHTML = `
    <h2 style="font-size: 1.25rem; font-weight: 700; color: ${isViewingSelf ? 'var(--text-primary)' : 'var(--accent-blue)'}">
      ${displayName} ${isViewingSelf ? '' : '<span style="font-size: 0.85rem; font-weight: normal; color: var(--text-muted)">（只读模式）</span>'}
    </h2>
    ${isViewingSelf ? '' : '<button class="btn btn-primary" id="btn-back-self" style="width: auto; padding: 0.4rem 1rem; font-size: 0.8rem;">返回我的预测</button>'}
  `;

  matchesContainer.appendChild(titleBar);

  if (!isViewingSelf) {
    document.getElementById('btn-back-self').addEventListener('click', () => {
      renderMatches();
    });
  }

  if (activeView === 'list') {
    renderListView(displayTips, isViewingSelf);
  } else {
    renderBracketView(displayTips, isViewingSelf);
  }
}

// Render List View
function renderListView(displayTips, editable) {
  const container = document.createElement('div');
  container.className = 'list-view-container';

  const stages = {};
  matches.forEach(m => {
    if (!stages[m.stage]) stages[m.stage] = [];
    stages[m.stage].push(m);
  });

  for (const stageName in stages) {
    const section = document.createElement('div');
    section.className = 'round-section';
    section.innerHTML = `<h3 class="round-title">${stageName}</h3>`;

    const list = document.createElement('div');
    list.className = 'matches-list';
    stages[stageName].forEach(m => {
      const card = createMatchCard(m, displayTips, editable);
      list.appendChild(card);
    });

    section.appendChild(list);
    container.appendChild(section);
  }

  matchesContainer.appendChild(container);
}

// Render Bracket View
function renderBracketView(displayTips, editable) {
  const container = document.createElement('div');
  container.className = 'bracket-view-container';

  const bracketRounds = [
    { type: 'r32', name: '32强赛' },
    { type: 'r16', name: '16强赛' },
    { type: 'qf', name: '1/4决赛' },
    { type: 'sf', name: '半决赛' },
    { type: 'final_third', name: '决赛对阵' }
  ];

  bracketRounds.forEach(round => {
    const col = document.createElement('div');
    col.className = 'bracket-column';

    let roundMatches = [];
    if (round.type === 'final_third') {
      roundMatches = matches.filter(m => m.type === 'final' || m.type === 'third');
      roundMatches.sort((a, b) => b.type.localeCompare(a.type));
    } else {
      roundMatches = matches.filter(m => m.type === round.type);
    }

    const colTitle = document.createElement('div');
    colTitle.style.fontWeight = '800';
    colTitle.style.fontSize = '1.1rem';
    colTitle.style.textAlign = 'center';
    colTitle.style.borderBottom = '2px solid var(--border-color)';
    colTitle.style.paddingBottom = '0.5rem';
    colTitle.style.color = 'var(--text-secondary)';
    colTitle.textContent = round.name;
    col.appendChild(colTitle);

    roundMatches.forEach(m => {
      const card = createMatchCard(m, displayTips, editable);
      col.appendChild(card);
    });

    container.appendChild(col);
  });

  matchesContainer.appendChild(container);
}

// Create Match Card DOM element
function createMatchCard(match, displayTips, editable) {
  const card = document.createElement('div');
  card.className = `match-card ${match.status === 'completed' ? 'completed' : ''}`;
  card.dataset.id = match.id;

  const tip = displayTips[match.id] || { score1: null, score2: null, winner: null };
  const flag1 = getFlag(match.team1);
  const flag2 = getFlag(match.team2);

  const s1Val = (tip.score1 !== null && tip.score1 !== undefined) ? tip.score1 : '';
  const s2Val = (tip.score2 !== null && tip.score2 !== undefined) ? tip.score2 : '';

  const isDraw = s1Val !== '' && s2Val !== '' && parseInt(s1Val) === parseInt(s2Val);

  // Deadline check
  const isPastDeadline = match.kickoff ? (new Date() > new Date(match.kickoff)) : false;
  const canEdit = editable && match.status !== 'completed' && !isPastDeadline;

  let pointsBadgeHtml = '';
  let accuracyBadgeHtml = '';

  if (match.status === 'completed' && match.score1 !== null && match.score2 !== null) {
    const calc = calculateSingleMatchPoints(match, tip);
    pointsBadgeHtml = `<div class="score-earned-pts pts-${calc.points}">+${calc.points} 分</div>`;

    let accuracyClass = 'badge-wrong';
    let accuracyText = '错误';
    if (calc.exact) {
      accuracyClass = 'badge-exact';
      accuracyText = '精准';
    } else if (calc.points > 0) {
      accuracyClass = 'badge-correct';
      accuracyText = '对方向';
    }

    accuracyBadgeHtml = `<span class="score-badge ${accuracyClass}">${accuracyText}</span>`;
  }

  // Create status badge
  let statusBadge = '';
  if (match.status === 'completed') {
    statusBadge = `<span style="background: rgba(16,185,129,0.1); color: var(--accent-emerald); padding: 2px 6px; border-radius: 4px; font-weight: 600;">已结束</span>`;
  } else if (isPastDeadline) {
    statusBadge = `<span style="background: rgba(239,68,68,0.1); color: var(--score-wrong); padding: 2px 6px; border-radius: 4px; font-weight: 600;">🔒 已截止</span>`;
  } else {
    statusBadge = `<span style="background: rgba(59,130,246,0.1); color: var(--accent-blue); padding: 2px 6px; border-radius: 4px; font-weight: 600;">🕒 预测中</span>`;
  }

  const advSelectorVisibleStyle = isDraw ? 'display: flex;' : 'display: none;';
  const isW1Active = tip.winner === 'team1';
  const isW2Active = tip.winner === 'team2';

  card.innerHTML = `
    <div class="match-meta">
      <span class="match-stage">第 ${match.id} 场 &bull; ${match.stage}</span>
      <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem;">
        ${statusBadge}
        <span>${match.date}</span>
      </div>
    </div>
    
    ${pointsBadgeHtml}
    
    <div class="match-content">
      <div class="match-teams">
        <!-- Team 1 -->
        <div class="team-row">
          <div class="team-info-left">
            <span class="team-flag">${flag1}</span>
            <span class="team-name" title="${match.team1}">${match.team1}</span>
          </div>
          <div class="score-inputs-wrapper">
            <input type="number" min="0" class="score-input team1-input" 
              value="${s1Val}" placeholder="-" 
              ${!canEdit ? 'disabled' : ''}>
          </div>
        </div>
        
        <!-- Team 2 -->
        <div class="team-row">
          <div class="team-info-left">
            <span class="team-flag">${flag2}</span>
            <span class="team-name" title="${match.team2}">${match.team2}</span>
          </div>
          <div class="score-inputs-wrapper">
            <input type="number" min="0" class="score-input team2-input" 
              value="${s2Val}" placeholder="-" 
              ${!canEdit ? 'disabled' : ''}>
          </div>
        </div>
      </div>
      
      <!-- Advancing Selector -->
      <div class="advancing-section" style="${advSelectorVisibleStyle}">
        <span class="advancing-label">预测晋级球队：</span>
        <div class="advancing-selector">
          <button class="advancing-btn btn-team1 ${isW1Active ? 'active' : ''}" 
            ${!canEdit ? 'disabled' : ''}>
            ${match.team1.split(' ')[0]}
          </button>
          <button class="advancing-btn btn-team2 ${isW2Active ? 'active' : ''}" 
            ${!canEdit ? 'disabled' : ''}>
            ${match.team2.split(' ')[0]}
          </button>
        </div>
      </div>
      
      <!-- Actual match results if completed -->
      ${match.status === 'completed' ? `
        <div style="margin-top: 0.8rem; border-top: 1px solid var(--border-color); padding-top: 0.8rem; font-size: 0.85rem; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center;">
          <div>实际赛果：<strong style="color: var(--text-primary)">${match.score1} - ${match.score2}</strong> ${match.score1 === match.score2 ? `<span style="font-size: 0.75rem;">（${match.winner} 晋级）</span>` : ''}</div>
          ${accuracyBadgeHtml}
        </div>
      ` : ''}
    </div>
  `;

  if (canEdit) {
    const input1 = card.querySelector('.team1-input');
    const input2 = card.querySelector('.team2-input');
    const advSection = card.querySelector('.advancing-section');
    const btnAdv1 = card.querySelector('.btn-team1');
    const btnAdv2 = card.querySelector('.btn-team2');

    const updateTipState = () => {
      const v1 = input1.value !== '' ? parseInt(input1.value) : null;
      const v2 = input2.value !== '' ? parseInt(input2.value) : null;

      if (!userTips[match.id]) {
        userTips[match.id] = { score1: null, score2: null, winner: null };
      }

      userTips[match.id].score1 = v1;
      userTips[match.id].score2 = v2;

      if (v1 !== null && v2 !== null) {
        if (v1 === v2) {
          advSection.style.display = 'flex';
          if (!userTips[match.id].winner || (userTips[match.id].winner !== 'team1' && userTips[match.id].winner !== 'team2')) {
            userTips[match.id].winner = 'team1';
          }
          if (userTips[match.id].winner === 'team1') {
            btnAdv1.classList.add('active');
            btnAdv2.classList.remove('active');
          } else {
            btnAdv2.classList.add('active');
            btnAdv1.classList.remove('active');
          }
        } else {
          advSection.style.display = 'none';
          userTips[match.id].winner = v1 > v2 ? 'team1' : 'team2';
          btnAdv1.classList.remove('active');
          btnAdv2.classList.remove('active');
        }
      } else {
        advSection.style.display = 'none';
        userTips[match.id].winner = null;
        btnAdv1.classList.remove('active');
        btnAdv2.classList.remove('active');
      }

      saveTipsLocal();
      renderLeaderboard();
    };

    input1.addEventListener('input', updateTipState);
    input2.addEventListener('input', updateTipState);

    btnAdv1.addEventListener('click', () => {
      userTips[match.id].winner = 'team1';
      btnAdv1.classList.add('active');
      btnAdv2.classList.remove('active');
      saveTipsLocal();
      renderLeaderboard();
    });

    btnAdv2.addEventListener('click', () => {
      userTips[match.id].winner = 'team2';
      btnAdv2.classList.add('active');
      btnAdv1.classList.remove('active');
      saveTipsLocal();
      renderLeaderboard();
    });
  }

  return card;
}

// Calculate score for a single match prediction
function calculateSingleMatchPoints(match, tip) {
  if (match.status !== 'completed' || match.score1 === null || match.score2 === null) {
    return { points: 0, exact: false };
  }

  if (!tip || tip.score1 === null || tip.score1 === undefined || tip.score2 === null || tip.score2 === undefined) {
    return { points: 0, exact: false };
  }

  const actual1 = match.score1;
  const actual2 = match.score2;
  const tip1 = tip.score1;
  const tip2 = tip.score2;

  let points = 0;
  let exact = false;

  if (actual1 === tip1 && actual2 === tip2) {
    points += 3;
    exact = true;
  }
  else if ((actual1 - actual2 === tip1 - tip2) && Math.sign(actual1 - actual2) === Math.sign(tip1 - tip2)) {
    points += 2;
  }
  else if (Math.sign(actual1 - actual2) === Math.sign(tip1 - tip2)) {
    points += 1;
  }

  const actualWinner = match.winner;
  let tipWinnerName = null;
  if (tip.winner === 'team1') tipWinnerName = match.team1;
  else if (tip.winner === 'team2') tipWinnerName = match.team2;
  else {
    if (tip1 > tip2) tipWinnerName = match.team1;
    else if (tip1 < tip2) tipWinnerName = match.team2;
  }

  if (actualWinner && tipWinnerName && actualWinner === tipWinnerName) {
    points += 1;
  }

  return { points, exact };
}

// Toast Notifications helper
function showToast(message, isError = false) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.right = '2rem';
    toast.style.padding = '1rem 1.5rem';
    toast.style.borderRadius = '10px';
    toast.style.zIndex = '1000';
    toast.style.color = '#ffffff';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.transform = 'translateY(10px)';
    toast.style.opacity = '0';
    document.body.appendChild(toast);
  }

  toast.style.backgroundColor = isError ? 'var(--score-wrong)' : 'var(--bg-secondary)';
  toast.style.border = `1px solid ${isError ? 'transparent' : 'var(--accent-blue)'}`;
  toast.textContent = message;

  setTimeout(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  }, 50);

  setTimeout(() => {
    toast.style.transform = 'translateY(10px)';
    toast.style.opacity = '0';
  }, 3500);
}

window.addEventListener('DOMContentLoaded', init);
