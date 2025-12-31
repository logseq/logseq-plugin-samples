import 'bulma/css/bulma.css'
import React from 'react'
import { createRoot, Root } from 'react-dom/client'
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
  description: string
  duration: string
  image: string
  url: string
  keywords: string
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
  const [importing, setImporting] = React.useState<boolean>(false)

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
  }, [groupBy, groupedData])

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

  // create item metadata logseq properties
  const createRelatedMetadataProperties = async () => {
    const covertProp = await logseq.Editor.upsertProperty('cover', { type: 'string' })
    const ratingProp = await logseq.Editor.upsertProperty('rating', { type: 'number' })
    const directorProp = await logseq.Editor.upsertProperty('director')
    const genreProp = await logseq.Editor.upsertProperty('genre', { cardinality: 'many' })
    const yearProp = await logseq.Editor.upsertProperty('year', { type: 'number' })
    const urlProp = await logseq.Editor.upsertProperty('url', { type: 'string' })
    const durationProp = await logseq.Editor.upsertProperty('duration', { type: 'string' })
    const keywordsProp = await logseq.Editor.upsertProperty('keywords', { type: 'string' })

    // create #movie tag
    const movieTag = await logseq.Editor.createTag('movie', {})

    if (!movieTag) {
      throw new Error('Failed to create or retrieve #movie tag.')
    }

    // add property to #movie tag
    await logseq.Editor.addTagProperty(movieTag?.uuid, 'cover')
    await logseq.Editor.addTagProperty(movieTag?.uuid, 'url')
    await logseq.Editor.addTagProperty(movieTag?.uuid, 'rating')
    await logseq.Editor.addTagProperty(movieTag?.uuid, 'director')
    await logseq.Editor.addTagProperty(movieTag?.uuid, 'genre')
    await logseq.Editor.addTagProperty(movieTag?.uuid, 'year')
    await logseq.Editor.addTagProperty(movieTag?.uuid, 'keywords')
    await logseq.Editor.addTagProperty(movieTag?.uuid, 'duration')

    console.log(
        'Ensured metadata properties:',
        {
          ratingProp, directorProp, genreProp, yearProp,
          covertProp, urlProp, durationProp, keywordsProp,
        },
    )
  }

  // import single item to Logseq (for DB only)
  const importItemToLogseq = async (movie: Movie, tipKey?: string) => {
    const pageTitle = movie.name
    const pageContent = `${movie.description || 'No description available.'}`

    try {
      const page = await logseq.Editor.createPage(pageTitle, {}, { createFirstBlock: true })

      // set page with #movie tag
      if (!page?.uuid) {
        throw new Error(`Failed to create page (${pageTitle}) in Logseq.`)
      }

      await logseq.Editor.addBlockTag(page?.uuid, 'movie')
      // set page properties value
      await logseq.Editor.upsertBlockProperty(page!.uuid, 'cover', movie.image || '')
      await logseq.Editor.upsertBlockProperty(page!.uuid, 'url', movie.url || '')
      await logseq.Editor.upsertBlockProperty(page!.uuid, 'rating', movie.aggregateRating?.ratingValue || 0)
      await logseq.Editor.upsertBlockProperty(page!.uuid, 'director',
          movie.director?.map(d => `[[${d.name}]]`).join(' ') || '')
      await logseq.Editor.upsertBlockProperty(page!.uuid, 'genre', movie.genre || [])
      const year = movie.datePublished ? new Date(movie.datePublished).getFullYear() : null
      await logseq.Editor.upsertBlockProperty(page!.uuid, 'year', year || '')
      await logseq.Editor.upsertBlockProperty(page!.uuid, 'duration', movie.duration || '')
      await logseq.Editor.upsertBlockProperty(page!.uuid, 'keywords', movie.keywords || '')

      // set first block content
      await logseq.Editor.appendBlockInPage(page!.uuid, pageContent)
      if (tipKey) {
        await logseq.UI.showMsg(`Importing "${pageTitle}"...`, 'info', { timeout: 0, key: tipKey })
      }
      console.log(`Imported "${pageTitle}" to Logseq.`)
    } catch (error: any) {
      console.error(`Failed to import "${pageTitle}":`, error)
      await logseq.UI.showMsg(`${error.toString()}`, 'error')
    }
  }

  // import all items to Logseq
  const importAllToLogseq = async () => {
    if (importing) return
    setImporting(true)
    let debugCounter = 0

    // Ensure metadata properties exist
    const tipKey = await logseq.UI.showMsg('Creating related metadata properties...', 'info', { timeout: 0 })
    await createRelatedMetadataProperties()

    try {
      for (const movie of top250Data) {
        // Debug: limit to 10 items
        if (++debugCounter > 10) break

        await importItemToLogseq(movie, tipKey)

        // Throttle to avoid overwhelming Logseq
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      await logseq.UI.showMsg(`Error during import: ${error}`, 'error')
    } finally {
      setImporting(false)
      logseq.UI.closeMsg(tipKey)
    }
  }

  const allCollapsed = Object.keys(groupedData).length > 0 &&
      Object.keys(groupedData).every(key => collapsedGroups.has(key))

  // SVG Icons
  const ChevronRightIcon = () => (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
           style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M4.5 2L8.5 6L4.5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              fill="none"/>
      </svg>
  )

  const ChevronDownIcon = () => (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
           style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              fill="none"/>
      </svg>
  )

  const ExpandIcon = () => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"
           style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }}>
        <path d="M1 1h6v2H3v4H1V1zm14 0h-6v2h4v4h2V1zM1 15h6v-2H3v-4H1v6zm14 0h-6v-2h4v-4h2v6z"/>
      </svg>
  )

  const CompressIcon = () => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"
           style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }}>
        <path d="M5 1v2H3v2H1V1h4zm6 0h4v4h-2V3H9V1zm0 14v-2h2v-2h2v4H11zM5 15H1v-4h2v2h2v2z"/>
      </svg>
  )

  const ImportIcon = () => (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"
           style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }}>
        <path d="M8 1v10M8 11l-4-4M8 11l4-4M3 13h10v2H3v-2z"/>
      </svg>
  )

  return (
      <section className="section">
        <div className="container">
          <div className={'field is-grouped is-flex is-justify-content-space-between'}
          >
            <h1 className="title">IMDB Top 250 Movies</h1>
            <div className={'is-flex is-align-items-center is-relative'}>
              <button className="button is-light is-position-absolute is-rounded" data-close title="Close"
                      style={{ top: -6, right: 0 }}
              >
                <span className="icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"
                       style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                          strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
            </div>
          </div>

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

            <div className="control is-flex is-align-items-center is-gap-2">
              {groupBy !== 'none' && (
                  <button
                      className="button"
                      onClick={allCollapsed ? expandAll : collapseAll}
                      title={allCollapsed ? 'Expand all groups' : 'Collapse all groups'}
                  >
                    {allCollapsed ? <ExpandIcon/> : <CompressIcon/>}
                    <span>{allCollapsed ? 'Expand All' : 'Collapse All'}</span>
                  </button>

              )}
              <button
                  className="button is-primary"
                  onClick={importAllToLogseq}
                  disabled={importing}
              >
                <ImportIcon/>
                <span>{importing ? 'Importing...' : 'Import All to Logseq'}</span>
              </button>
            </div>
          </div>

          {Object.entries(groupedData).map(([groupName, movies]) => {
            const isCollapsed = collapsedGroups.has(groupName)
            return (
                <div key={groupName} className="mb-6">
                  {groupBy !== 'none' && (
                      <h2
                          className="subtitle is-4 mt-4 mb-3"
                          style={{
                            cursor: 'pointer',
                            userSelect: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                          onClick={() => toggleGroup(groupName)}
                      >
                        {isCollapsed ? <ChevronRightIcon/> : <ChevronDownIcon/>}
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

// ------------------------
// Logseq Main UI mounting
// ------------------------

let reactRoot: Root | null = null

function mountAppIfNeeded () {
  const el = document.getElementById('app')
  if (!el) return

  if (!reactRoot) {
    reactRoot = createRoot(el)
  }
  reactRoot.render(<App/>)
}

// When Logseq injects the UI via provideUI, #app will exist. We mount after DOM is ready.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => mountAppIfNeeded())
} else {
  mountAppIfNeeded()
}

// ------------------------
// Logseq plugin main entry
// ------------------------

function openMainUI () {
  logseq.showMainUI({ autoFocus: true })
}

function hideMainUI () {
  logseq.hideMainUI({ restoreEditingCursor: true })
}

function toggleMainUI () {
  if (logseq.isMainUIVisible) {
    hideMainUI()
  } else {
    openMainUI()
  }
}

function main () {
  console.log('logseq-imdb-top250 plugin loaded')

  // Expose methods callable from UI (and other places)
  logseq.provideModel({
    imdbTop250Open: () => openMainUI(),
    imdbTop250Close: () => hideMainUI(),
    imdbTop250Toggle: () => toggleMainUI(),
  })

  // Toolbar button
  logseq.App.registerUIItem('toolbar', {
    key: 'imdb-top250-toolbar',
    template: `
<a class="button" data-on-click="imdbTop250Toggle" title="IMDb Top 250">
  <i class="ti ti-movie"></i>
</a>
`,
  })

  // Close behaviors: click overlay, click X, ESC
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null
    if (!target) return

    if (target.closest('[data-close]')) {
      hideMainUI()
      return
    }
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideMainUI()
    }
  })
}

// Bootstrap
logseq.ready(main).catch(console.error)

