const fs = require('fs');
const path = require('path');

const nextMatchMap = {
  // Round of 32 to Round of 16
  '73': { matchId: '90', slot: 'home' },
  '75': { matchId: '90', slot: 'away' },
  '74': { matchId: '89', slot: 'home' },
  '77': { matchId: '89', slot: 'away' },
  '76': { matchId: '91', slot: 'home' },
  '78': { matchId: '91', slot: 'away' },
  '79': { matchId: '92', slot: 'home' },
  '80': { matchId: '92', slot: 'away' },
  '83': { matchId: '93', slot: 'home' },
  '84': { matchId: '93', slot: 'away' },
  '81': { matchId: '94', slot: 'home' },
  '82': { matchId: '94', slot: 'away' },
  '85': { matchId: '96', slot: 'home' },
  '87': { matchId: '96', slot: 'away' },
  '86': { matchId: '95', slot: 'home' },
  '88': { matchId: '95', slot: 'away' },

  // Round of 16 to Quarter-finals
  '89': { matchId: '97', slot: 'home' },
  '90': { matchId: '97', slot: 'away' },
  '91': { matchId: '99', slot: 'home' },
  '92': { matchId: '99', slot: 'away' },
  '93': { matchId: '98', slot: 'home' },
  '94': { matchId: '98', slot: 'away' },
  '95': { matchId: '100', slot: 'home' },
  '96': { matchId: '100', slot: 'away' },

  // Quarter-finals to Semi-finals
  '97': { matchId: '101', slot: 'home' },
  '98': { matchId: '101', slot: 'away' },
  '99': { matchId: '102', slot: 'home' },
  '100': { matchId: '102', slot: 'away' },

  // Semi-finals to Final / Third Place
  '101': { matchId: '104', slot: 'home', thirdPlaceId: '103', thirdPlaceSlot: 'home' },
  '102': { matchId: '104', slot: 'away', thirdPlaceId: '103', thirdPlaceSlot: 'away' },
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

async function updateResults() {
  try {
    console.log('Fetching live games from API...');
    const response = await fetch('https://worldcup26.ir/get/games');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const apiGames = data.games.filter(g => g.type !== 'group');

    // Create a lookup map of API games by their ID
    const apiGamesMap = {};
    apiGames.forEach(g => {
      apiGamesMap[g.id] = g;
    });

    const matches = apiGames.map(g => {
      const rawHome = g.home_team_name_en || g.home_team_label;
      const rawAway = g.away_team_name_en || g.away_team_label;
      
      const homeTeam = translateTeamName(rawHome);
      const awayTeam = translateTeamName(rawAway);
      
      const finished = g.finished === 'TRUE';
      const homeScore = finished ? parseInt(g.home_score) : null;
      const awayScore = finished ? parseInt(g.away_score) : null;
      
      let winner = null;
      if (finished) {
        if (homeScore > awayScore) {
          winner = homeTeam;
        } else if (homeScore < awayScore) {
          winner = awayTeam;
        } else {
          // It's a draw, check the next match to see who progressed
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

      // Parse local time to exact UTC date
      let kickoffIso = null;
      let formattedDate = g.local_date;
      try {
        const parts = g.local_date.split(' ');
        const dateParts = parts[0].split('/');
        const timeParts = parts[1].split(':');
        
        // Construct standard local date milliseconds as if it were UTC
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
        
        // Output date formatted in Chinese
        formattedDate = kickoffDate.toLocaleString('zh-CN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'UTC'
        }) + ' UTC';
      } catch (e) {
        console.error(`Failed to parse date for match ${g.id}:`, e);
      }

      return {
        id: g.id,
        type: g.type,
        stage: getStageName(g.type),
        date: formattedDate,
        kickoff: kickoffIso,
        team1: homeTeam,
        team2: awayTeam,
        score1: homeScore,
        score2: awayScore,
        winner: winner,
        status: finished ? 'completed' : (g.time_elapsed === 'notstarted' ? 'scheduled' : 'live')
      };
    });

    // Sort matches chronologically by ID (as match numbers)
    matches.sort((a, b) => parseInt(a.id) - parseInt(b.id));

    const resultsData = {
      lastUpdated: new Date().toISOString(),
      matches: matches
    };

    const resultsPath = path.join(__dirname, 'results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(resultsData, null, 2), 'utf8');
    console.log(`Successfully updated results.json at ${resultsPath}`);
  } catch (error) {
    console.error('Error updating results:', error);
    process.exit(1);
  }
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

updateResults();
