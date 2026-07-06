import { useState, useEffect } from 'react'
import { CreateClusterPage } from './components/CreateClusterPage'
import { ProjectOverviewPage } from './components/ProjectOverviewPage'
import { ProjectSettingsPage } from './components/ProjectSettingsPage'
import { ClustersPage } from './components/ClustersPage'
import { ClusterOverviewPage } from './components/ClusterOverviewPage'
import { SearchIndexesPage } from './components/SearchIndexesPage'
import { IndexOverviewPage } from './components/IndexOverviewPage'
import { StatusDetailsPage } from './components/StatusDetailsPage'
import { SearchTesterPage } from './components/SearchTesterPage'
import { AutoEmbeddingUsagePage } from './components/AutoEmbeddingUsagePage'
import { AutoEmbeddingRateLimitsPage } from './components/AutoEmbeddingRateLimitsPage'
import { RerankingUsagePage } from './components/RerankingUsagePage'
import { RerankingRateLimitsPage } from './components/RerankingRateLimitsPage'
import { ProfileInfoPage } from './components/ProfileInfoPage'
import { AllProjectsPage } from './components/AllProjectsPage'
import { OrganizationsPage } from './components/OrganizationsPage'
import { OrgSettingsPage } from './components/OrgSettingsPage'
import { ClusterMetricsPage } from './components/ClusterMetricsPage'

type View =
  | 'create-cluster'
  | 'project-overview'
  | 'project-settings'
  | 'clusters'
  | 'cluster-overview'
  | 'search-indexes'
  | 'index-overview'
  | 'status-details'
  | 'search-tester'
  | 'auto-embedding-usage'
  | 'auto-embedding-rate-limits'
  | 'reranking-usage'
  | 'reranking-rate-limits'
  | 'account-profile'
  | 'all-projects'
  | 'organizations'
  | 'org-settings'
  | 'cluster-metrics'

// Every view id is a valid ?view= value. A few external entry points (account
// tab, "All Clusters" in the account menu) use friendlier aliases, mapped here.
const VIEW_ALIASES: Record<string, View> = {
  account: 'account-profile',
}

const ALL_VIEWS: View[] = [
  'create-cluster',
  'project-overview',
  'project-settings',
  'clusters',
  'cluster-overview',
  'search-indexes',
  'index-overview',
  'status-details',
  'search-tester',
  'auto-embedding-usage',
  'auto-embedding-rate-limits',
  'reranking-usage',
  'reranking-rate-limits',
  'account-profile',
  'all-projects',
  'organizations',
  'org-settings',
  'cluster-metrics',
]

function viewFromLocation(): View {
  const param = new URLSearchParams(window.location.search).get('view')
  if (!param) return 'project-overview'
  if (VIEW_ALIASES[param]) return VIEW_ALIASES[param]
  if ((ALL_VIEWS as string[]).includes(param)) return param as View
  return 'project-overview'
}

function App() {
  const [view, setViewState] = useState<View>(viewFromLocation)

  // Push a history entry so the browser back/forward buttons move between pages.
  const setView = (next: View) => {
    setViewState(next)
    const url = `${import.meta.env.BASE_URL}?view=${next}`
    if (viewFromLocation() !== next) {
      window.history.pushState({ view: next }, '', url)
    }
  }

  // Sync state when the user navigates with the browser's back/forward buttons.
  useEffect(() => {
    const onPopState = () => setViewState(viewFromLocation())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Ensure the initial load has a matching history entry to return to.
  useEffect(() => {
    window.history.replaceState({ view }, '', `${import.meta.env.BASE_URL}?view=${view}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [previousView, setPreviousView] = useState<View>('project-overview')
  const [clusterBuilderMode, setClusterBuilderMode] = useState<'create' | 'edit'>('edit')

  if (view === 'account-profile') {
    return <ProfileInfoPage />
  }

  if (view === 'all-projects') {
    return <AllProjectsPage />
  }

  if (view === 'organizations') {
    return <OrganizationsPage />
  }

  if (view === 'org-settings') {
    return <OrgSettingsPage />
  }

  const openClusterBuilder = (mode: 'create' | 'edit' = 'edit') => {
    setClusterBuilderMode(mode)
    setPreviousView(view)
    setView('create-cluster')
  }

  const openProjectSettings = () => setView('project-settings')
  const openMetrics = () => setView('cluster-metrics')

  if (view === 'cluster-metrics') {
    return (
      <ClusterMetricsPage
        onBackToProjectOverview={() => setView('project-overview')}
        onBackToClusters={() => setView('clusters')}
        onOpenSearchIndexes={() => setView('search-indexes')}
        onOpenClusters={() => setView('clusters')}
        onOpenProjectSettings={openProjectSettings}
        onOpenClusterOverview={() => setView('cluster-overview')}
      />
    )
  }

  if (view === 'project-settings') {
    return (
      <ProjectSettingsPage
        onBackToProjectOverview={() => setView('project-overview')}
        onOpenSearchIndexes={() => setView('search-indexes')}
        onOpenClusters={() => setView('clusters')}
      />
    )
  }

  if (view === 'cluster-overview') {
    return (
      <ClusterOverviewPage
        onBackToProjectOverview={() => setView('project-overview')}
        onBackToClusters={() => setView('clusters')}
        onOpenSearchIndexes={() => setView('search-indexes')}
        onOpenClusters={() => setView('clusters')}
        onOpenClusterBuilder={openClusterBuilder}
        onOpenProjectSettings={openProjectSettings}
        onOpenMetrics={openMetrics}
      />
    )
  }

  if (view === 'clusters') {
    return (
      <ClustersPage
        onBackToProjectOverview={() => setView('project-overview')}
        onOpenSearchIndexes={() => setView('search-indexes')}
        onOpenClusterBuilder={openClusterBuilder}
        onOpenClusterOverview={() => setView('cluster-overview')}
        onOpenProjectSettings={openProjectSettings}
        onOpenMetrics={openMetrics}
      />
    )
  }

  if (view === 'auto-embedding-rate-limits') {
    return (
      <AutoEmbeddingRateLimitsPage
        onBackToProjectOverview={() => setView('project-overview')}
        onOpenSearchIndexes={() => setView('search-indexes')}
        onOpenIndexOverview={() => setView('index-overview')}
        onOpenStatusDetails={() => setView('status-details')}
        onOpenSearchTester={() => setView('search-tester')}
        onOpenAutoEmbeddingUsage={() => setView('auto-embedding-usage')}
        onOpenRerankingUsage={() => setView('reranking-usage')}
        onOpenRerankingRateLimits={() => setView('reranking-rate-limits')}
        onOpenClusters={() => setView('clusters')}
        onOpenProjectSettings={openProjectSettings}
      />
    )
  }

  if (view === 'auto-embedding-usage') {
    return (
      <AutoEmbeddingUsagePage
        onBackToProjectOverview={() => setView('project-overview')}
        onOpenSearchIndexes={() => setView('search-indexes')}
        onOpenIndexOverview={() => setView('index-overview')}
        onOpenStatusDetails={() => setView('status-details')}
        onOpenSearchTester={() => setView('search-tester')}
        onOpenAutoEmbeddingRateLimits={() => setView('auto-embedding-rate-limits')}
        onOpenRerankingUsage={() => setView('reranking-usage')}
        onOpenRerankingRateLimits={() => setView('reranking-rate-limits')}
        onOpenClusters={() => setView('clusters')}
        onOpenProjectSettings={openProjectSettings}
      />
    )
  }

  if (view === 'reranking-rate-limits') {
    return (
      <RerankingRateLimitsPage
        onBackToProjectOverview={() => setView('project-overview')}
        onOpenSearchIndexes={() => setView('search-indexes')}
        onOpenIndexOverview={() => setView('index-overview')}
        onOpenStatusDetails={() => setView('status-details')}
        onOpenSearchTester={() => setView('search-tester')}
        onOpenAutoEmbeddingUsage={() => setView('auto-embedding-usage')}
        onOpenAutoEmbeddingRateLimits={() => setView('auto-embedding-rate-limits')}
        onOpenRerankingUsage={() => setView('reranking-usage')}
        onOpenClusters={() => setView('clusters')}
        onOpenProjectSettings={openProjectSettings}
      />
    )
  }

  if (view === 'reranking-usage') {
    return (
      <RerankingUsagePage
        onBackToProjectOverview={() => setView('project-overview')}
        onOpenSearchIndexes={() => setView('search-indexes')}
        onOpenIndexOverview={() => setView('index-overview')}
        onOpenStatusDetails={() => setView('status-details')}
        onOpenSearchTester={() => setView('search-tester')}
        onOpenAutoEmbeddingUsage={() => setView('auto-embedding-usage')}
        onOpenAutoEmbeddingRateLimits={() => setView('auto-embedding-rate-limits')}
        onOpenRerankingRateLimits={() => setView('reranking-rate-limits')}
        onOpenClusters={() => setView('clusters')}
        onOpenProjectSettings={openProjectSettings}
      />
    )
  }

  if (view === 'index-overview') {
    return (
      <IndexOverviewPage
        onBackToProjectOverview={() => setView('project-overview')}
        onSelectSearchIndexes={() => setView('search-indexes')}
        onSelectStatusDetails={() => setView('status-details')}
        onSelectSearchTester={() => setView('search-tester')}
        onSelectAutoEmbeddingUsage={() => setView('auto-embedding-usage')}
        onSelectAutoEmbeddingRateLimits={() => setView('auto-embedding-rate-limits')}
        onSelectRerankingUsage={() => setView('reranking-usage')}
        onSelectRerankingRateLimits={() => setView('reranking-rate-limits')}
        onOpenClusters={() => setView('clusters')}
        onOpenProjectSettings={openProjectSettings}
      />
    )
  }

  if (view === 'status-details') {
    return (
      <StatusDetailsPage
        onBackToProjectOverview={() => setView('project-overview')}
        onSelectSearchIndexes={() => setView('search-indexes')}
        onSelectIndexOverview={() => setView('index-overview')}
        onSelectSearchTester={() => setView('search-tester')}
        onSelectAutoEmbeddingUsage={() => setView('auto-embedding-usage')}
        onSelectAutoEmbeddingRateLimits={() => setView('auto-embedding-rate-limits')}
        onSelectRerankingUsage={() => setView('reranking-usage')}
        onSelectRerankingRateLimits={() => setView('reranking-rate-limits')}
        onOpenClusters={() => setView('clusters')}
        onOpenProjectSettings={openProjectSettings}
      />
    )
  }

  if (view === 'search-tester') {
    return (
      <SearchTesterPage
        onBackToProjectOverview={() => setView('project-overview')}
        onSelectSearchIndexes={() => setView('search-indexes')}
        onSelectIndexOverview={() => setView('index-overview')}
        onSelectStatusDetails={() => setView('status-details')}
        onSelectAutoEmbeddingUsage={() => setView('auto-embedding-usage')}
        onSelectAutoEmbeddingRateLimits={() => setView('auto-embedding-rate-limits')}
        onSelectRerankingUsage={() => setView('reranking-usage')}
        onSelectRerankingRateLimits={() => setView('reranking-rate-limits')}
        onOpenClusters={() => setView('clusters')}
        onOpenProjectSettings={openProjectSettings}
      />
    )
  }

  if (view === 'search-indexes') {
    return (
      <SearchIndexesPage
        onBackToProjectOverview={() => setView('project-overview')}
        onOpenIndexOverview={() => setView('index-overview')}
        onOpenStatusDetails={() => setView('status-details')}
        onOpenSearchTester={() => setView('search-tester')}
        onOpenAutoEmbeddingUsage={() => setView('auto-embedding-usage')}
        onOpenAutoEmbeddingRateLimits={() => setView('auto-embedding-rate-limits')}
        onOpenRerankingUsage={() => setView('reranking-usage')}
        onOpenRerankingRateLimits={() => setView('reranking-rate-limits')}
        onOpenClusters={() => setView('clusters')}
        onOpenProjectSettings={openProjectSettings}
      />
    )
  }

  if (view === 'project-overview') {
    return (
      <ProjectOverviewPage
        onOpenClusterBuilder={openClusterBuilder}
        onOpenSearchIndexes={() => setView('search-indexes')}
        onOpenClusters={() => setView('clusters')}
        onOpenProjectSettings={openProjectSettings}
        onOpenMetrics={openMetrics}
      />
    )
  }

  return <CreateClusterPage mode={clusterBuilderMode} onCancel={() => setView(previousView)} />
}

export default App
