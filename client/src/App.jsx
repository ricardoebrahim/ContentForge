import { useState, useEffect } from 'react'

function App() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState('')
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null)
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [authMode, setAuthMode] = useState('signin')
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [history, setHistory] = useState([])
  const [displayText, setDisplayText] = useState('')
  const fullText = 'Generate content instantly '

  useEffect(() => {
    setDisplayText('')
    let i = 0
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setDisplayText(fullText.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, 60)
    return () => clearInterval(timer)
  }, [token])

  useEffect(() => {
    if (token) fetchHistory()
  }, [token])

  const parseContent = (text) => {
    const clean = (str) => str ? str.replace(/\*\*/g, '').trim() : ''
    const summaryMatch = text.match(/SUMMARY:\n([\s\S]*?)(?=SOCIAL_POST:|$)/)
    const socialMatch = text.match(/SOCIAL_POST:\n([\s\S]*?)(?=SEO_DESCRIPTION:|$)/)
    const seoMatch = text.match(/SEO_DESCRIPTION:\n([\s\S]*?)$/)
    return {
      summary: clean(summaryMatch ? summaryMatch[1] : ''),
      social: clean(socialMatch ? socialMatch[1] : ''),
      seo: clean(seoMatch ? seoMatch[1] : '')
    }
  }

  const handleAuth = async () => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/signin'
      const response = await fetch(`contentforge-production-cd34.up.railway.app${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      })
      const data = await response.json()
      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setToken(data.token)
        setUser(data.user)
      } else {
        setAuthError(data.error)
      }
    } catch (err) {
      setAuthError('Connection failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken('')
    setUser(null)
    setResult(null)
    setHistory([])
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch('contentforge-production-cd34.up.railway.app/api/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) setHistory(data.history)
    } catch (err) {
      console.log(err)
    }
  }

  const deleteHistory = async (id) => {
    try {
      await fetch(`contentforge-production-cd34.up.railway.app/api/history/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setHistory(history.filter(item => item._id !== id))
    } catch (err) {
      console.log(err)
    }
  }

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await fetch('contentforge-production-cd34.up.railway.app/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic })
      })
      const data = await response.json()
      if (data.success) {
        const parsed = parseContent(data.content)
        setResult(parsed)
        await fetch('contentforge-production-cd34.up.railway.app/api/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            topic,
            summary: parsed.summary,
            social: parsed.social,
            seo: parsed.seo
          })
        })
        fetchHistory()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="min-h-screen bg-dark font-inter flex flex-col">
      {/* Header */}
      <header className=" py-6 px-8">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Content<span className="text-primary">Forge</span>
            </h1>
            <p className="text-text-secondary text-sm mt-1">AI-powered content generation</p>
          </div>
          <div className="flex items-center gap-4">
            {token && user && (
              <>
                <span className="text-text-secondary text-sm">
                  Welcome, <span className="text-white font-medium">{user.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-text-secondary hover:text-white text-sm
                    border border-border hover:border-primary/50 px-4 py-2
                    rounded-lg transition-all duration-300"
                >
                  Sign out
                </button>
              </>
            )}
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
          </div>
        </div>
      </header>

      {!token ? (
        <div className="flex-1 flex items-center justify-center px-8 py-16">
          <div className="w-full max-w-md">
            <div className="bg-surface border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">
                {authMode === 'signup' ? 'Create account' : 'Welcome back'}
              </h2>
              <p className="text-text-secondary text-center mb-8 text-sm">
                {authMode === 'signup' ? 'Start generating content today' : 'Sign in to your account'}
              </p>
              {authMode === 'signup' && (
                <input
                  type="text"
                  placeholder="Your name"
                  value={authData.name}
                  onChange={(e) => setAuthData({...authData, name: e.target.value})}
                  className="w-full bg-dark border border-border rounded-xl px-4 py-3
                    text-white placeholder-text-secondary outline-none
                    focus:border-primary transition-all duration-300 mb-4"
                />
              )}
              <input
                type="email"
                placeholder="Email address"
                value={authData.email}
                onChange={(e) => setAuthData({...authData, email: e.target.value})}
                className="w-full bg-dark border border-border rounded-xl px-4 py-3
                  text-white placeholder-text-secondary outline-none
                  focus:border-primary transition-all duration-300 mb-4"
              />
              <div className="relative mb-6">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={authData.password}
                  onChange={(e) => setAuthData({...authData, password: e.target.value})}
                  className="w-full bg-dark border border-border rounded-xl px-4 py-3
                    text-white placeholder-text-secondary outline-none
                    focus:border-primary transition-all duration-300"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-text-secondary hover:text-white
                    transition-colors text-sm"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {authError && (
                <p className="text-red-400 text-sm mb-4 text-center">{authError}</p>
              )}
              <button
                onClick={handleAuth}
                disabled={authLoading}
                className="w-full bg-primary hover:bg-primary-light text-white
                  font-semibold py-3 rounded-xl transition-all duration-300
                  hover:shadow-glow disabled:opacity-50 mb-4"
              >
                {authLoading ? 'Please wait...' : authMode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
              <p className="text-text-secondary text-sm text-center">
                {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
                  className="text-primary ml-1 hover:text-primary-light transition-colors"
                >
                  {authMode === 'signup' ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1">
          {/* Sidebar */}
          <aside className="w-56 px-6 py-8 shrink-0">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-6">
              Recent generations
            </h3>
            {history.length === 0 ? (
              <p className="text-text-secondary text-sm">No generations yet.</p>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item._id}
                    className="group bg-surface border border-border rounded-xl p-3
                      hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white text-sm font-medium capitalize leading-tight">
                        {item.topic}
                      </p>
                      <button
                        onClick={() => deleteHistory(item._id)}
                        className="text-text-secondary hover:text-red-400
                          transition-colors text-xs shrink-0 opacity-0 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-text-secondary text-xs mt-1">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className="flex-1 px-8 py-16">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-white mb-4">
                <span className="text-white">{displayText.slice(0, 16)}</span>
                <span className="text-primary">{displayText.slice(16)}</span>
                <span className="animate-pulse text-primary">|</span>
              </h2>
              <p className="text-text-secondary text-lg mb-12">
                Enter a topic and get a summary, social post, and SEO copy in seconds.
              </p>
              <div className="flex gap-4 max-w-2xl mx-auto">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="Enter a topic..."
                  className="flex-1 bg-surface border border-border rounded-xl px-6 py-4
                    text-white placeholder-text-secondary outline-none
                    focus:border-primary transition-all duration-300 focus:shadow-glow"
                />
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-primary hover:bg-primary-light text-white font-semibold
                    px-8 py-4 rounded-xl transition-all duration-300
                    hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 text-red-400 text-center">
                {error}
              </div>
            )}

            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-surface border border-border rounded-2xl p-6">
                    <div className="h-4 bg-border rounded animate-pulse mb-4 w-1/2"></div>
                    <div className="space-y-3">
                      <div className="h-3 bg-border rounded animate-pulse"></div>
                      <div className="h-3 bg-border rounded animate-pulse w-5/6"></div>
                      <div className="h-3 bg-border rounded animate-pulse w-4/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!result && !loading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {[
                  { label: 'Summary', icon: '📝', desc: 'A concise 3-sentence overview of your topic. Perfect for quick understanding.' },
                  { label: 'Social Post', icon: '📱', desc: 'An engaging post with hashtags ready to share on LinkedIn, Twitter, or Instagram.' },
                  { label: 'SEO Description', icon: '🔍', desc: 'A 150-word search-optimized description to rank higher on Google.' },
                ].map(({ label, icon, desc }) => (
                  <div
                    key={label}
                    className="bg-surface border border-border rounded-2xl p-6
                      hover:border-primary/30 transition-all duration-300 opacity-60"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span>{icon}</span>
                      <span className="text-primary font-semibold text-sm uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="text-text-secondary leading-relaxed text-sm">{desc}</p>
                  </div>
                ))}
              </div>
            )}

            {result && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {[
                  { label: 'Summary', key: 'summary', icon: '📝' },
                  { label: 'Social Post', key: 'social', icon: '📱' },
                  { label: 'SEO Description', key: 'seo', icon: '🔍' },
                ].map(({ label, key, icon }) => (
                  <div
                    key={label}
                    className="bg-surface border border-border rounded-2xl p-6
                      hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span>{icon}</span>
                        <span className="text-primary font-semibold text-sm uppercase tracking-wider">{label}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(result[key], label)}
                        className="text-text-secondary hover:text-white text-sm transition-colors duration-200"
                      >
                        {copied === label ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-text-secondary leading-relaxed text-sm">{result[key]}</p>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}

export default App