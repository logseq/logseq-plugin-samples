import 'bulma/css/bulma.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import '@logseq/libs'

interface Movie {
  name: string
  datePublished: string
  aggregateRating: {
    ratingValue: number
    ratingCount: number
  }
  genre: string[]
  director: Array<{ name: string }>
}

type GroupByOption = 'none' | 'year' | 'rating' | 'director' | 'decade'

const readTop250JsonData = async function (): Promise<Movie[]> {
  const response = await fetch('./top250.json')
  return await response.json()
}

const App: React.FC = () => {
  const [top250Data, setTop250Data] = React.useState<Movie[]>([])
  const [groupBy, setGroupBy] = React.useState<GroupByOption>('none')
  const [collapsedGroups, setCollapsedGroups] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    readTop250JsonData().then(data => {
      // Sort by rating (descending) to establish global rank
      const sortedData = [...data].sort((a, b) => {
        const ratingA = a.aggregateRating?.ratingValue ?? 0
        const ratingB = b.aggregateRating?.ratingValue ?? 0
        return ratingB - ratingA
      })
      setTop250Data(sortedData)
      console.log('Top 250 Movies Data (sorted by rating):', sortedData)
    })
  }, [])

  const getGroupKey = (movie: Movie): string => {
    switch (groupBy) {
      case 'year':
        return movie.datePublished ? new Date(movie.datePublished).getFullYear().toString() : 'Unknown'
      case 'decade': {
        const year = movie.datePublished ? new Date(movie.datePublished).getFullYear() : 0
        return year > 0 ? `${Math.floor(year / 10) * 10}s` : 'Unknown'
      }
      case 'rating': {
        const rating = movie.aggregateRating?.ratingValue ?? 0
        if (rating >= 9.0) return '9.0+'
        if (rating >= 8.5) return '8.5-8.9'
        if (rating >= 8.0) return '8.0-8.4'
        return 'Below 8.0'
      }
      case 'director':
        return movie.director?.[0]?.name ?? 'Unknown'
      default:
        return 'All Movies'
    }
  }

  const groupedData = React.useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Movies': top250Data }
    }

    const groups: Record<string, Movie[]> = {}
    top250Data.forEach(movie => {
      const key = getGroupKey(movie)
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(movie)
    })

    // Sort groups by key
    return Object.keys(groups).sort((a, b) => {
      if (groupBy === 'year' || groupBy === 'decade') {
        return b.localeCompare(a) // Descending order for years
      }
      return a.localeCompare(b)
    }).reduce((acc, key) => {
      acc[key] = groups[key]
      return acc
    }, {} as Record<string, Movie[]>)
  }, [top250Data, groupBy])

  // Auto-collapse all groups when groupBy changes (except 'none')
  React.useEffect(() => {
    if (groupBy !== 'none') {
      const allGroupNames = Object.keys(groupedData)
      setCollapsedGroups(new Set(allGroupNames))
    } else {
      setCollapsedGroups(new Set())
    }
  }, [groupBy])

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupName)) {
        newSet.delete(groupName)
      } else {
        newSet.add(groupName)
      }
      return newSet
    })
  }

  const collapseAll = () => {
    const allGroupNames = Object.keys(groupedData)
    setCollapsedGroups(new Set(allGroupNames))
  }

  const expandAll = () => {
    setCollapsedGroups(new Set())
  }

  const allCollapsed = Object.keys(groupedData).length > 0 &&
    Object.keys(groupedData).every(key => collapsedGroups.has(key))

  // SVG Icons
  const ChevronRightIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M4.5 2L8.5 6L4.5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )

  const ChevronDownIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )

  const ExpandIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }}>
      <path d="M1 1h6v2H3v4H1V1zm14 0h-6v2h4v4h2V1zM1 15h6v-2H3v-4H1v6zm14 0h-6v-2h4v-4h2v6z"/>
    </svg>
  )

  const CompressIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }}>
      <path d="M5 1v2H3v2H1V1h4zm6 0h4v4h-2V3H9V1zm0 14v-2h2v-2h2v4H11zM5 15H1v-4h2v2h2v2z"/>
    </svg>
  )

  return (
      <section className="section">
        <div className="container">
          <h1 className="title">IMDB Top 250 Movies</h1>

          <div className="field is-grouped is-flex is-justify-content-space-between">
            <div className="control">
              <label className="label">Group By:</label>
              <div className="select">
                <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupByOption)}>
                  <option value="none">None (Show All)</option>
                  <option value="decade">Decade</option>
                  <option value="year">Year</option>
                  <option value="rating">Rating Range</option>
                  <option value="director">Director</option>
                </select>
              </div>
            </div>

            {groupBy !== 'none' && (
              <div className="control" style={{ marginLeft: '1rem', display: 'flex', alignItems: 'flex-end' }}>
                <button
                  className="button"
                  onClick={allCollapsed ? expandAll : collapseAll}
                  title={allCollapsed ? "Expand all groups" : "Collapse all groups"}
                >
                  {allCollapsed ? <ExpandIcon /> : <CompressIcon />}
                  <span>{allCollapsed ? 'Expand All' : 'Collapse All'}</span>
                </button>
              </div>
            )}
          </div>

          {Object.entries(groupedData).map(([groupName, movies]) => {
            const isCollapsed = collapsedGroups.has(groupName)
            return (
              <div key={groupName} className="mb-6">
                {groupBy !== 'none' && (
                    <h2
                      className="subtitle is-4 mt-4 mb-3"
                      style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      onClick={() => toggleGroup(groupName)}
                    >
                      {isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
                      <span>{groupName}</span>
                      <span className="tag is-info">{movies.length} movies</span>
                    </h2>
                )}

                {!isCollapsed && (
                  <table className="table is-striped is-fullwidth is-hoverable">
                    <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Title</th>
                    <th>Year</th>
                    <th>Rating</th>
                    <th>Director</th>
                  </tr>
                  </thead>
                  <tbody>
                  {movies.map((movie, index) => {
                    const globalRank = top250Data.indexOf(movie) + 1
                    return (
                        <tr key={`${groupName}-${index}`}>
                          <td>{globalRank}</td>
                          <td>{movie.name}</td>
                          <td>{movie.datePublished ? new Date(movie.datePublished).getFullYear() : 'N/A'}</td>
                          <td>{movie.aggregateRating?.ratingValue ?? 'N/A'}</td>
                          <td>{movie.director?.[0]?.name ?? 'N/A'}</td>
                        </tr>
                    )
                  })}
                  </tbody>
                </table>
                )}
              </div>
            )
          })}
        </div>
      </section>
  )
}

const root = document.getElementById('app')
if (root) {
  createRoot(root).render(<App/>)
}

// Logseq plugin main entry
function main () {
  console.log('logseq-imdb-top250 plugin loaded')
}

// Bootstrap
logseq.ready(main).catch(console.error)

