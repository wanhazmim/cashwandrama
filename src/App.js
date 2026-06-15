import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  'https://cxsyyyohhresbhffjgds.supabase.co',
  'sb_publishable_W_UkWjX1QUMpDxopuHP0lw_CPpLzcZF'
);

// ── Constants ─────────────────────────────────────────────────────────────────
const COINS_PER_AD   = 5;
const WITHDRAWAL_MIN = 100;
const COIN_TO_MYR   = 0.01;
const AD_DURATION    = 10;
const AD_SKIP_AFTER  = 5;

const SCREEN = { AUTH: 'auth', HOME: 'home', PLAYER: 'player', WALLET: 'wallet' };
const GENRES  = ['All', 'Romance', 'Action', 'Thriller'];

const DRAMAS = [
  { id: 1, title: 'FORBIDDEN LOVE',    episodes: 24, genre: 'Romance',  coinsPerEp: 10, badge: 'HOT' },
  { id: 2, title: 'DARK EMPIRE',       episodes: 32, genre: 'Action',   coinsPerEp: 15, badge: 'NEW' },
  { id: 3, title: 'SECRET MARRIAGE',   episodes: 18, genre: 'Romance',  coinsPerEp: 10, badge: null  },
  { id: 4, title: 'REVENGE OF QUEENS', episodes: 40, genre: 'Thriller', coinsPerEp: 20, badge: 'TOP' },
  { id: 5, title: "THE CEO'S WIFE",    episodes: 28, genre: 'Romance',  coinsPerEp: 10, badge: 'HOT' },
  { id: 6, title: 'BLOOD BROTHERS',    episodes: 36, genre: 'Action',   coinsPerEp: 15, badge: null  },
  { id: 7, title: 'BETRAYED HEART',    episodes: 20, genre: 'Thriller', coinsPerEp: 12, badge: 'NEW' },
  { id: 8, title: 'MIDNIGHT DESIRE',   episodes: 16, genre: 'Romance',  coinsPerEp:  8, badge: null  },
];

const GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fd7f6f,#b388eb)',
  'linear-gradient(135deg,#00c6fb,#005bea)',
];

// ── AuthScreen ────────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode]       = useState('login');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [info, setInfo]       = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) { setError('Please fill all fields'); return; }
    setLoading(true);
    setError('');
    setInfo('');
    try {
      if (mode === 'register') {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { coins: 50 } }, // welcome bonus
        });
        if (err) throw err;
        if (data.session) {
          onAuth(data.user, 50);
        } else {
          setInfo('Check your email to confirm your account, then log in.');
        }
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        onAuth(data.user, data.user.user_metadata?.coins ?? 0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-cash">CASH</span><span className="logo-drama">DRAMA</span>
        </div>
        <p className="auth-tagline">Watch. Earn. Cash Out.</p>

        <div className="auth-tabs">
          {['login', 'register'].map(m => (
            <button
              key={m}
              className={`auth-tab ${mode === m ? 'active' : ''}`}
              onClick={() => { setMode(m); setError(''); setInfo(''); }}
            >
              {m === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" autoComplete="email" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPass(e.target.value)} placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>
          {error && <p className="form-error">{error}</p>}
          {info  && <p className="form-info">{info}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        {mode === 'register' && (
          <p className="auth-bonus">🎁 New accounts start with 50 coins!</p>
        )}
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ screen, setScreen, coins, onLogout }) {
  const items = [
    { key: SCREEN.HOME,   icon: '🎬', label: 'Drama'  },
    { key: SCREEN.WALLET, icon: '👛', label: 'Wallet' },
  ];
  return (
    <nav className="navbar">
      {items.map(({ key, icon, label }) => (
        <button key={key} className={`nav-item ${screen === key ? 'active' : ''}`} onClick={() => setScreen(key)}>
          <span className="nav-icon">{icon}</span>
          <span>{label}</span>
        </button>
      ))}
      <div className="nav-coins">
        <span>🪙</span>
        <span>{coins}</span>
      </div>
      <button className="nav-item nav-logout" onClick={onLogout}>
        <span className="nav-icon">🚪</span>
        <span>Logout</span>
      </button>
    </nav>
  );
}

// ── DramaCard ─────────────────────────────────────────────────────────────────
function DramaCard({ drama, onClick }) {
  const idx = (drama.id - 1) % GRADIENTS.length;
  return (
    <div className="drama-card" onClick={() => onClick(drama)}>
      <div className="drama-thumb" style={{ background: GRADIENTS[idx] }}>
        {drama.badge && <span className="drama-badge">{drama.badge}</span>}
        <div className="play-circle">▶</div>
      </div>
      <div className="drama-info">
        <h3 className="drama-title">{drama.title}</h3>
        <div className="drama-meta">
          <span className="tag-genre">{drama.genre}</span>
          <span className="tag-coins">+{drama.coinsPerEp} 🪙</span>
        </div>
        <span className="drama-eps">{drama.episodes} eps</span>
      </div>
    </div>
  );
}

// ── HomeScreen ────────────────────────────────────────────────────────────────
function HomeScreen({ coins, onSelect }) {
  const [activeGenre, setActiveGenre] = useState('All');
  const featured = DRAMAS[3];
  const filtered = activeGenre === 'All' ? DRAMAS : DRAMAS.filter(d => d.genre === activeGenre);

  return (
    <div className="home-screen">
      <div className="home-header">
        <div className="home-logo">
          <span className="logo-cash">CASH</span><span className="logo-drama">DRAMA</span>
        </div>
        <div className="header-coins">🪙 {coins}</div>
      </div>

      {/* Featured banner */}
      <div className="featured-banner" onClick={() => onSelect(featured)}>
        <div className="featured-bg" style={{ background: GRADIENTS[(featured.id - 1) % GRADIENTS.length] }}>
          <div className="featured-overlay">
            <span className="featured-tag">FEATURED</span>
            <h2 className="featured-title">{featured.title}</h2>
            <p className="featured-sub">{featured.episodes} episodes · earn up to {featured.episodes * featured.coinsPerEp} 🪙</p>
            <button className="btn-watch">▶ Watch Now</button>
          </div>
        </div>
      </div>

      {/* Genre filter */}
      <div className="genre-tabs">
        {GENRES.map(g => (
          <button key={g} className={`genre-tab ${activeGenre === g ? 'active' : ''}`} onClick={() => setActiveGenre(g)}>
            {g}
          </button>
        ))}
      </div>

      {/* Drama grid */}
      <div className="drama-grid">
        {filtered.map(d => (
          <DramaCard key={d.id} drama={d} onClick={onSelect} />
        ))}
      </div>
    </div>
  );
}

// ── VideoPlayer ───────────────────────────────────────────────────────────────
function VideoPlayer({ drama, coins, onBack, onComplete }) {
  const [playing,   setPlaying]   = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [currentEp, setCurrentEp] = useState(1);
  const [done,      setDone]      = useState(false);
  const intervalRef  = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // 15 ticks × 500 ms = 7.5 s to "watch" an episode
  const TICKS    = 15;
  const INTERVAL = 500;

  useEffect(() => () => clearInterval(intervalRef.current), []);

  useEffect(() => {
    if (playing && !done) {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          const next = p + (100 / TICKS);
          if (next >= 100) {
            clearInterval(intervalRef.current);
            setPlaying(false);
            setDone(true);
            onCompleteRef.current(drama.coinsPerEp);
            return 100;
          }
          return next;
        });
      }, INTERVAL);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, done, drama.coinsPerEp]);

  function goToEpisode(ep) {
    setCurrentEp(ep);
    setProgress(0);
    setDone(false);
    setPlaying(false);
  }

  const gradient = GRADIENTS[(drama.id - 1) % GRADIENTS.length];
  const maxEpShown = Math.min(drama.episodes, 12);

  return (
    <div className="player-screen">
      <div className="player-topbar">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <div className="header-coins">🪙 {coins}</div>
      </div>

      {/* Simulated video */}
      <div className="player-video" style={{ background: gradient }}>
        <div className="ep-tag">EP {currentEp}</div>
        <div className="player-center">
          {!done ? (
            <button className="play-btn" onClick={() => setPlaying(p => !p)}>
              {playing ? '⏸' : '▶'}
            </button>
          ) : (
            <div className="complete-badge">
              <div className="complete-check">✓</div>
              <p>Episode {currentEp} complete</p>
              <p className="earned-coins">+{drama.coinsPerEp} 🪙 earned</p>
            </div>
          )}
        </div>
        {playing && (
          <div className="player-loading-dots">
            <span /><span /><span />
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Info */}
      <div className="player-info">
        <h2 className="player-title">{drama.title}</h2>
        <p className="player-sub">Episode {currentEp} of {drama.episodes} · {drama.genre}</p>
        <div className="reward-row">
          <span className="reward-label">Earn per episode</span>
          <span className="reward-amount">+{drama.coinsPerEp} 🪙</span>
        </div>
        {!playing && !done && (
          <p className="player-hint">Press ▶ to start watching and earn coins</p>
        )}
      </div>

      {done && currentEp < drama.episodes && (
        <button className="btn-next" onClick={() => goToEpisode(currentEp + 1)}>
          Next Episode →
        </button>
      )}

      {/* Episode selector */}
      <div className="ep-list">
        <h3 className="ep-list-title">Episodes</h3>
        <div className="ep-grid">
          {Array.from({ length: maxEpShown }, (_, i) => i + 1).map(ep => (
            <button
              key={ep}
              className={`ep-btn ${ep === currentEp ? 'active' : ''} ${ep < currentEp ? 'watched' : ''}`}
              onClick={() => goToEpisode(ep)}
            >
              {ep}
            </button>
          ))}
          {drama.episodes > maxEpShown && (
            <span className="ep-more">+{drama.episodes - maxEpShown}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── AdModal ───────────────────────────────────────────────────────────────────
function AdModal({ onSkip, onComplete }) {
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [canSkip,   setCanSkip]   = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const skipTimer = setTimeout(() => setCanSkip(true), AD_SKIP_AFTER * 1000);
    let count = AD_DURATION;
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
        clearTimeout(skipTimer);
        onCompleteRef.current();
      }
    }, 1000);
    return () => { clearInterval(timer); clearTimeout(skipTimer); };
  }, []);

  return (
    <div className="ad-overlay">
      <div className="ad-box">
        <div className="ad-label">ADVERTISEMENT</div>
        <div className="ad-visual">
          <div className="ad-creative">
            <span className="ad-emoji">🎯</span>
            <p className="ad-headline">SPECIAL OFFER</p>
            <p className="ad-body">Watch the full ad to earn +{COINS_PER_AD} bonus coins!</p>
          </div>
        </div>
        <div className="ad-footer">
          <span className="ad-reward">+{COINS_PER_AD} 🪙 bonus on completion</span>
          <div className="ad-actions">
            {canSkip ? (
              <button className="btn-skip" onClick={onSkip}>Skip Ad ×</button>
            ) : (
              <span className="ad-countdown">{countdown}s</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── WalletScreen ──────────────────────────────────────────────────────────────
const METHODS = ['Touch \'n Go', 'Boost', 'ShopeePay', 'Bank Transfer'];

function WalletScreen({ coins, onWithdraw }) {
  const [method,  setMethod]  = useState(METHODS[0]);
  const [account, setAccount] = useState('');
  const [amount,  setAmount]  = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [info,    setInfo]    = useState('');
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cd_tx') || '[]'); } catch { return []; }
  });

  const myrBalance = (coins * COIN_TO_MYR).toFixed(2);
  const progress   = Math.min((coins / WITHDRAWAL_MIN) * 100, 100);
  const unlocked   = coins >= WITHDRAWAL_MIN;

  async function handleWithdraw(e) {
    e.preventDefault();
    const rm = parseFloat(amount);
    if (!account.trim())     { setError('Account / phone number required'); return; }
    if (!rm || rm < 1)       { setError('Minimum withdrawal is RM 1.00'); return; }
    if (rm > parseFloat(myrBalance)) { setError('Insufficient balance'); return; }
    setLoading(true);
    setError('');
    setInfo('');
    await new Promise(r => setTimeout(r, 1500));
    const coinsUsed = Math.round(rm / COIN_TO_MYR);
    const tx = {
      id:     Date.now(),
      method,
      account: account.trim(),
      amount:  rm,
      coins:   coinsUsed,
      status: 'Pending',
      date:   new Date().toLocaleDateString('en-MY'),
    };
    const updated = [tx, ...history];
    setHistory(updated);
    localStorage.setItem('cd_tx', JSON.stringify(updated));
    onWithdraw(coinsUsed);
    setAmount('');
    setAccount('');
    setInfo(`RM ${rm.toFixed(2)} withdrawal submitted! Processing within 24h.`);
    setLoading(false);
  }

  return (
    <div className="wallet-screen">
      <div className="home-header">
        <h1 className="page-title">Wallet</h1>
      </div>

      {/* Balance card */}
      <div className="balance-card">
        <p className="balance-label">Total Balance</p>
        <div className="balance-amount">RM {myrBalance}</div>
        <div className="balance-coins">🪙 {coins} coins</div>
        {!unlocked && (
          <>
            <div className="unlock-bar-track">
              <div className="unlock-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="unlock-hint">{coins} / {WITHDRAWAL_MIN} coins to unlock withdrawal</p>
          </>
        )}
      </div>

      {/* Earn tips */}
      <div className="earn-tips">
        <div className="tip-item">🎬 <span>Watch episodes to earn coins</span></div>
        <div className="tip-item">📺 <span>Watch ads for +{COINS_PER_AD} bonus coins</span></div>
        <div className="tip-item">💸 <span>Withdraw when you reach {WITHDRAWAL_MIN} coins</span></div>
      </div>

      {/* Withdrawal form */}
      <div className="wallet-section">
        <h2 className="section-title">Withdraw</h2>
        {!unlocked ? (
          <div className="locked-msg">
            <span className="lock-icon">🔒</span>
            <p>Watch more dramas to unlock withdrawal</p>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="withdraw-form">
            <div className="field">
              <label>Payment Method</label>
              <div className="method-grid">
                {METHODS.map(m => (
                  <button
                    key={m} type="button"
                    className={`method-btn ${method === m ? 'active' : ''}`}
                    onClick={() => setMethod(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Phone / Account Number</label>
              <input type="text" value={account} onChange={e => setAccount(e.target.value)} placeholder="01X-XXXXXXXX" />
            </div>
            <div className="field">
              <label>Amount (RM)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1.00" min="1" step="0.01" max={myrBalance} />
              <span className="field-hint">Available: RM {myrBalance}</span>
            </div>
            {error && <p className="form-error">{error}</p>}
            {info  && <p className="form-info">{info}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing…' : 'Withdraw Now'}
            </button>
          </form>
        )}
      </div>

      {/* Transaction history */}
      {history.length > 0 && (
        <div className="wallet-section">
          <h2 className="section-title">History</h2>
          <div className="tx-list">
            {history.map(tx => (
              <div key={tx.id} className="tx-item">
                <div className="tx-left">
                  <span className="tx-method">{tx.method}</span>
                  <span className="tx-account">{tx.account}</span>
                  <span className="tx-date">{tx.date}</span>
                </div>
                <div className="tx-right">
                  <span className="tx-amount">-RM {tx.amount.toFixed(2)}</span>
                  <span className={`tx-status ${tx.status.toLowerCase()}`}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── App (root) ────────────────────────────────────────────────────────────────
export default function App() {
  const [user,    setUser]    = useState(null);
  const [coins,   setCoins]   = useState(0);
  const [screen,  setScreen]  = useState(SCREEN.HOME);
  const [drama,   setDrama]   = useState(null);
  const [showAd,  setShowAd]  = useState(false);
  const [pending, setPending] = useState(0); // coins waiting for ad
  const [booting, setBooting] = useState(true);

  // Restore session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setCoins(session.user.user_metadata?.coins ?? 0);
        setScreen(SCREEN.HOME);
      } else {
        setScreen(SCREEN.AUTH);
      }
      setBooting(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      if (!session) { setUser(null); setScreen(SCREEN.AUTH); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function persist(newCoins) {
    setCoins(newCoins);
    try {
      await supabase.auth.updateUser({ data: { coins: newCoins } });
    } catch {
      // best-effort; local state is already updated
    }
  }

  function handleAuth(authUser, startCoins) {
    setUser(authUser);
    setCoins(startCoins);
    setScreen(SCREEN.HOME);
  }

  function handleVideoComplete(earned) {
    setPending(earned);
    setShowAd(true);
  }

  async function handleAdComplete() {
    setShowAd(false);
    const total = pending + COINS_PER_AD;
    setPending(0);
    await persist(coins + total);
  }

  async function handleAdSkip() {
    setShowAd(false);
    const earned = pending;
    setPending(0);
    await persist(coins + earned);
  }

  async function handleWithdraw(coinsUsed) {
    await persist(coins - coinsUsed);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setCoins(0);
    setDrama(null);
    setScreen(SCREEN.AUTH);
  }

  if (booting) {
    return (
      <div className="splash">
        <div className="splash-logo">
          <span className="logo-cash">CASH</span><span className="logo-drama">DRAMA</span>
        </div>
        <p className="splash-sub">Watch. Earn. Cash Out.</p>
      </div>
    );
  }

  if (screen === SCREEN.AUTH || !user) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  return (
    <div className="app">
      {showAd && <AdModal onComplete={handleAdComplete} onSkip={handleAdSkip} />}

      <div className="screen-wrap">
        {screen === SCREEN.PLAYER && drama ? (
          <VideoPlayer
            drama={drama}
            coins={coins}
            onBack={() => setScreen(SCREEN.HOME)}
            onComplete={handleVideoComplete}
          />
        ) : screen === SCREEN.WALLET ? (
          <WalletScreen coins={coins} onWithdraw={handleWithdraw} />
        ) : (
          <HomeScreen
            coins={coins}
            onSelect={d => { setDrama(d); setScreen(SCREEN.PLAYER); }}
          />
        )}
      </div>

      {screen !== SCREEN.PLAYER && (
        <Navbar screen={screen} setScreen={setScreen} coins={coins} onLogout={handleLogout} />
      )}
    </div>
  );
}
