import { useState } from 'react'

function App() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState('')

  const parseContent = (text) => {
const summaryMatch = text.match(/SUMMARY:\n([\s\S]*?)(?=SOCIAL_POST:|$)/);
const socialMatch = text.match(/SOCIAL_POST:\n([\s\S]*?)(?=SEO_DESCRIPTION:|$)/);
const seoMatch = text.match(/SEO_DESCRIPTION:\n([\s\S]*?)$/);

return{
  summary: summaryMatch ? summaryMatch[1].trim() : '',
  social: socialMatch ? socialMatch[1].trim() : '',
  seo: seoMatch ? seoMatch[1].trim() : ''
};
  };
  
  const handleGenerate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        {/* Input Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            Generate content
            <span className="text-primary"> instantly</span>
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
</main>
</div>
  )
}
export default App