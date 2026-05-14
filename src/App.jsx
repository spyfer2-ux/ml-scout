import { useState, useEffect, useCallback } from 'react'
import styles from './App.module.css'

const BASE = 'https://api.mercadolibre.com'
const SITE = 'MLB'

function fBRL(price) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
}

function parseItemId(input) {
  const match = input.match(/MLB[\-_]?(\d+)/i)
  return match ? `MLB${match[1]}` : input.trim().toUpperCase()
}

function ltLabel(t) {
  return { gold_special: 'Ouro especial', gold_pro: 'Gold pro', silver: 'Prata', bronze: 'Bronze', free: 'Grátis' }[t] || t || '—'
}

// ─── Search tab ────────────────────────────────────────────────────────────────
function SearchTab({ initQuery }) {
  const [query, setQuery]   = useState(initQuery || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [total, setTotal]   = useState(0)

  const doSearch = useCallback(async (q) => {
    const term = q || query
    if (!term.trim()) return
    setLoading(true); setError(''); setResults([])
    try {
      const res = await fetch(`${BASE}/sites/${SITE}/search?q=${encodeURIComponent(term)}&sort=sold_quantity&limit=20`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setResults(data.results || [])
      setTotal(data.paging?.total || 0)
    } catch {
      setError('Erro ao buscar na API do Mercado Livre. Tente novamente.')
    }
    setLoading(false)
  }, [query])

  useEffect(() => { if (initQuery) { setQuery(initQuery); doSearch(initQuery) } }, [initQuery])

  return (
    <div>
      <div className={styles.row}>
        <input
          className={styles.input}
          placeholder="Ex: teclado mecânico, airfryer 5L..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
        />
        <button className={styles.btn} onClick={() => doSearch()} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar →'}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {results.length > 0 && (
        <p className={styles.meta}>
          Top 20 de <strong>{total.toLocaleString()}</strong> resultados · ordenado por mais vendidos
        </p>
      )}

      {loading && <div className={styles.loading}><span className={styles.spin} />Consultando API do Mercado Livre...</div>}

      <div className={styles.grid}>
        {results.map(item => (
          <a
            key={item.id}
            className={styles.card}
            href={item.permalink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className={styles.cardTitle}>{item.title}</p>
            <p className={styles.cardPrice}>{fBRL(item.price)}</p>
            <div className={styles.badges}>
              <span className={`${styles.badge} b-green`}>{item.sold_quantity || 0} vendidos</span>
              <span className={`${styles.badge} b-blue`}>{item.id}</span>
              {item.condition === 'new' && <span className={`${styles.badge} b-gray`}>Novo</span>}
              {item.shipping?.free_shipping && <span className={`${styles.badge} b-green`}>Frete grátis</span>}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ─── Spy tab ───────────────────────────────────────────────────────────────────
function SpyTab() {
  const [input, setInput]   = useState('')
  const [item, setItem]     = useState(null)
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const spy = async () => {
    const id = parseItemId(input)
    if (!id) return
    setLoading(true); setError(''); setItem(null); setSeller(null)
    try {
      const ir = await fetch(`${BASE}/items/${id}`)
      if (!ir.ok) throw new Error('Item não encontrado. Verifique o ID ou URL.')
      const it = await ir.json()
      setItem(it)
      if (it.seller_id) {
        const sr = await fetch(`${BASE}/users/${it.seller_id}`)
        setSeller(await sr.json())
      }
    } catch (e) {
      setError(e.message || 'Erro ao buscar item.')
    }
    setLoading(false)
  }

  return (
    <div>
      <div className={styles.row}>
        <input
          className={styles.input}
          placeholder="ID do anúncio (MLB123...) ou URL completa do produto"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && spy()}
        />
        <button className={styles.btn} onClick={spy} disabled={loading}>
          {loading ? 'Buscando...' : 'Espionar →'}
        </button>
      </div>
      <p className={styles.hint}>Cole o link do produto ou o ID (ex: MLB1234567890)</p>

      {error && <div className={styles.error}>{error}</div>}
      {loading && <div className={styles.loading}><span className={styles.spin} />Buscando dados do anúncio...</div>}

      {item && (
        <div className={styles.spyCard}>
          <div className={styles.spyTop}>
            {item.pictures?.[0] && <img className={styles.spyImg} src={item.pictures[0].url} alt="produto" />}
            <div>
              <p className={styles.spyName}>{item.title}</p>
              <p className={styles.spyPrice}>{fBRL(item.price)}</p>
              <div className={styles.badges}>
                <span className={`${styles.badge} b-green`}>{item.sold_quantity || 0} vendidos</span>
                <span className={`${styles.badge} b-blue`}>{ltLabel(item.listing_type_id)}</span>
                {item.condition === 'new' && <span className={`${styles.badge} b-gray`}>Novo</span>}
                {item.shipping?.free_shipping && <span className={`${styles.badge} b-green`}>Frete grátis</span>}
                <span className={`${styles.badge} b-gray`}>{item.id}</span>
              </div>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <StatBox value={item.sold_quantity || 0} label="Vendidos" />
            <StatBox value={item.available_quantity || 0} label="Em estoque" />
            <StatBox value={item.pictures?.length || 0} label="Fotos" />
            {seller && <>
              <StatBox value={seller.nickname} label="Vendedor" small />
              <StatBox value={seller.seller_reputation?.transactions?.completed || '—'} label="Vendas totais" />
              <StatBox value={(seller.seller_reputation?.level_id || '—').replace(/_/g, ' ')} label="Reputação" small />
            </>}
          </div>

          {item.attributes?.length > 0 && (
            <div className={styles.attrs}>
              <p className={styles.attrsLabel}>Atributos</p>
              <div className={styles.badges}>
                {item.attributes.slice(0, 16).map(a => (
                  <span key={a.id} className={`${styles.badge} b-gray`}>{a.name}: {a.value_name || '—'}</span>
                ))}
              </div>
            </div>
          )}

          {item.permalink && (
            <div style={{ marginTop: 16 }}>
              <a href={item.permalink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                Abrir anúncio no ML →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatBox({ value, label, small }) {
  return (
    <div style={{
      background: 'var(--bg2)',
      borderRadius: 'var(--radius)',
      padding: '12px',
      textAlign: 'center',
    }}>
      <span style={{ display: 'block', fontSize: small ? 14 : 22, fontWeight: 500, lineHeight: 1, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>
        {value}
      </span>
      <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  )
}

// ─── Trends tab ────────────────────────────────────────────────────────────────
function TrendsTab({ onSearch }) {
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/trends/${SITE}`)
      setTrends(await res.json() || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className={styles.trendsHeader}>
        <span className={styles.hint} style={{ margin: 0 }}>Termos mais buscados agora · clique para pesquisar</span>
        <button className={styles.btnSm} onClick={load} disabled={loading}>↻ Atualizar</button>
      </div>

      {loading && <div className={styles.loading}><span className={styles.spin} />Buscando tendências...</div>}

      <div className={styles.tGrid}>
        {trends.map((t, i) => (
          <div key={t.keyword || i} className={styles.tItem} onClick={() => onSearch(t.keyword)}>
            <span className={styles.tRank}>#{i + 1}</span>
            <span className={styles.tWord}>{t.keyword}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]         = useState('search')
  const [trendQuery, setTrendQuery] = useState(null)

  const handleTrendClick = (kw) => {
    setTrendQuery(kw)
    setTab('search')
  }

  const TABS = [
    { id: 'search',  label: 'Mais vendidos' },
    { id: 'spy',     label: 'Espionar concorrente' },
    { id: 'trends',  label: 'Tendências' },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.logo}>ML Scout</h1>
          <p className={styles.tagline}>Inteligência de mercado · Mercado Livre Brasil</p>
        </div>
      </header>

      <main className={styles.main}>
        <nav className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
              onClick={() => { setTab(t.id); if (t.id !== 'trends') setTrendQuery(null) }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'search'  && <SearchTab key={trendQuery} initQuery={trendQuery} />}
        {tab === 'spy'     && <SpyTab />}
        {tab === 'trends'  && <TrendsTab onSearch={handleTrendClick} />}
      </main>
    </div>
  )
}
