import { useState, useEffect } from 'react'

function App() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState('')
  const [user, setUser] = useState(null)
const [token, setToken] = useState(localStorage.getItem('token') || '')
const [authMode, setAuthMode] = useState('signin')
const [authData, setAuthData] = useState({ name: '', email: '', password: '' })
const [showPassword, setShowPassword] = useState(false)
const [authError, setAuthError] = useState('')
const [authLoading, setAuthLoading] = useState(false)
  const [displayText, setDisplayText] = useState('')
const fullText = 'Generate content instantly '

useEffect(() => {
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
}, [])

 const parseContent = (text) => {
  const clean = (str) => str ? str.replace(/\*\*/g, '').trim() : '';
  
  const summaryMatch = text.match(/SUMMARY:\n([\s\S]*?)(?=SOCIAL_POST:|$)/);
  const socialMatch = text.match(/SOCIAL_POST:\n([\s\S]*?)(?=SEO_DESCRIPTION:|$)/);
  const seoMatch = text.match(/SEO_DESCRIPTION:\n([\s\S]*?)$/);

  return {
    summary: clean(summaryMatch ? summaryMatch[1] : ''),
    social: clean(socialMatch ? socialMatch[1] : ''),
    seo: clean(seoMatch ? seoMatch[1] : '')
  };
};
  
const handleAuth = async () => {
  setAuthLoading(true)
  setAuthError('')
  
  try {
    const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/signin'
    const response = await fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authData)
    })
    const data = await response.json()
    
    if (data.success) {
      localStorage.setItem('token', data.token)
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
  setToken('')
  setUser(null)
  setResult(null)
}

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('http://localhost:5000/api/generate', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ topic })
})
      const data = await response.json()
      if (data.success) {
        setResult(parseContent(data.content))
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
    <div className="min-h-screen bg-dark font-inter">
      {/* Header */}
      <header className="border-b border-border py-6 px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Content<span className="text-primary">Forge</span>
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              AI-powered content generation
            </p>
          </div>
          <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-8 py-16">

{/* Auth Gate */}
{!token ? (
  <div className="max-w-md mx-auto">
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
) : (
  <>

        {/* Input Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
  <span className="text-white">
    {displayText.slice(0, 17)}
  </span>
  <span className="text-primary">
    {displayText.slice(17)}
  </span>
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
                focus:border-primary transition-all duration-300
                focus:shadow-glow"
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

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 text-red-400 text-center">
            {error}
          </div>
        )}
        
{/* Loading Skeleton */}
{loading && (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-surface border border-border rounded-2xl p-6">
        <div className="h-4 bg-border rounded animate-pulse mb-4 w-1/2"></div>
        <div className="space-y-3">
          <div className="h-3 bg-border rounded animate-pulse"></div>
          <div className="h-3 bg-border rounded animate-pulse w-5/6"></div>
          <div className="h-3 bg-border rounded animate-pulse w-4/6"></div>
          <div className="h-3 bg-border rounded animate-pulse w-5/6"></div>
        </div>
      </div>
    ))}
  </div>
)}

        {/* Placeholder Cards */}
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
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            {label}
          </span>
        </div>
        <p className="text-text-secondary leading-relaxed text-sm">
          {desc}
        </p>
      </div>
    ))}
  </div>
)}

        {/* Results */}
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
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              {label}
            </span>
          </div>
          <button
            onClick={() => handleCopy(result[key], label)}
            className="text-text-secondary hover:text-white text-sm
              transition-colors duration-200"
          >
            {copied === label ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <p className="text-text-secondary leading-relaxed text-sm">
          {result[key]}
        </p>
      </div>
    ))}
  </div>
)}
</>
)}
</main>
</div>
  )
}
export default App