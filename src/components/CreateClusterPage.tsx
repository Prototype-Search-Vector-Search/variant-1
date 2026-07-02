import { useRef, useState } from "react";
import Icon from "@leafygreen-ui/icon";
import { palette } from "@leafygreen-ui/palette";
import { Button } from "@leafygreen-ui/button";
import { IconButton } from "@leafygreen-ui/icon-button";
import { Card } from "@leafygreen-ui/card";
import { Toggle } from "@leafygreen-ui/toggle";
import { H2, H3, Link } from "@leafygreen-ui/typography";
import { TopNav } from "./TopNav";
import type { ClusterType, CloudProvider, NodeState, ElectableRow, WorkloadRow, DeleteTarget, Tag } from "./types";
import { PROVIDER_NAMES } from "./types";
import { ALL_REGIONS, REGION_GROUPS, regionByCode } from "./regionData";
import { ALL_TIERS } from "./tierData";
import { ProviderLogo } from "./ProviderLogo";
import { LeafIcon } from "./LeafIcon";
import { SectionRow } from "./SectionRow";
import { ElectableNodesTable } from "./ElectableNodesTable";
import { WorkloadNodeTable } from "./WorkloadNodeTable";
import { NodeRow } from "./NodeRow";
import { DeleteModal } from "./DeleteModal";
import { RemoveRegionsModal } from "./RemoveRegionsModal";
import { ClusterTierContent } from "./ClusterTierContent";
import { GlobalClusterConfigContent } from "./GlobalClusterConfigContent";
import { AdditionalSettingsContent } from "./AdditionalSettingsContent";
import { SupportPlanContent } from "./SupportPlanContent";
import { ClusterDetailsContent } from "./ClusterDetailsContent";
import "./CreateClusterPage.css";

let nextId = 1;
const uid = () => String(nextId++);

const CLUSTER_TYPES: ClusterType[] = ["flex", "dedicated", "free"];

const CLUSTER_INFO: Record<ClusterType, { desc: string; detail: string }> = {
  flex: {
    desc: "For getting started and building your first application.",
    detail: "Low cost, auto-scales with your workload. No upfront commitment.",
  },
  dedicated: {
    desc: "For production applications with sophisticated workload requirements. Advanced configuration controls.",
    detail:
      "Network isolation, end-to-end encryption, and fine-grained access controls. On-demand performance advice, including index and schema suggestions.",
  },
  free: {
    desc: "Try MongoDB Atlas with no credit card required.",
    detail: "512 MB storage, shared RAM & vCPU. Perfect for learning and small projects.",
  },
};

export interface CreateClusterPageProps {
  onCancel: () => void;
}

export function CreateClusterPage({ onCancel }: CreateClusterPageProps) {
  const [clusterType, setClusterType] = useState<ClusterType>("dedicated");
  const [provider, setProvider] = useState<CloudProvider>("aws");
  const [selectedRegion, setSelectedRegion] = useState("us-east-1");
  const [multiRegion, setMultiRegion] = useState(false);

  // multi-region electable nodes
  const [electableRows, setElectableRows] = useState<ElectableRow[]>([
    { id: uid(), provider: "aws", region: "us-east-1", nodes: 3, priority: "HIGHEST" },
  ]);

  // workload isolation – single-region
  const [readOnly, setReadOnly] = useState<NodeState>({ enabled: false, count: 0 });
  const [analytics, setAnalytics] = useState<NodeState>({ enabled: false, count: 0 });
  const [search, setSearch] = useState<NodeState>({ enabled: false, count: 0 });

  // workload isolation – multi-region (per-region rows)
  const [readOnlyRows, setReadOnlyRows] = useState<WorkloadRow[]>([]);
  const [analyticsRows, setAnalyticsRows] = useState<WorkloadRow[]>([]);
  const [searchRows, setSearchRows] = useState<WorkloadRow[]>([]);

  // accordion open states / scroll targets
  const workloadRef = useRef<HTMLDivElement>(null);
  const clusterTierRef = useRef<HTMLDivElement>(null);

  const [providerRegionOpen, setProviderRegionOpen] = useState(false);
  const [globalConfigOpen, setGlobalConfigOpen] = useState(false);
  const [globalWrites, setGlobalWrites] = useState(false);
  const [gccProvider, setGccProvider] = useState<CloudProvider>("aws");
  const [gccSharding, setGccSharding] = useState<"atlas" | "self">("atlas");
  const [workloadOpen, setWorkloadOpen] = useState(false);
  const [clusterTierOpen, setClusterTierOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState("M30");
  const [tierTab, setTierTab] = useState<"base" | "search">("base");
  const [mongoVersion, setMongoVersion] = useState("MongoDB 6.0");
  const [cloudBackup, setCloudBackup] = useState(true);
  const [additionalOpen, setAdditionalOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportPlan, setSupportPlan] = useState<"basic" | "developer">("basic");
  const [clusterDetailsOpen, setClusterDetailsOpen] = useState(false);
  const [clusterName, setClusterName] = useState("Cluster0");
  const [tags, setTags] = useState<Tag[]>([]);
  const addTag = () => setTags((rows) => [...rows, { id: uid(), key: "", value: "" }]);

  // modals
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const handleGoToSearchTier = () => {
    setClusterTierOpen(true);
    setTierTab("search");
    setTimeout(() => {
      if (clusterTierRef.current) {
        const top = clusterTierRef.current.getBoundingClientRect().top + window.scrollY - 16;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 150);
  };

  const handleAddSearchNodes = () => {
    // The Workload Isolation accordion is nested inside the Cloud Provider /
    // Region section, so that outer accordion must be open for workloadRef to
    // be mounted and scrollable.
    setProviderRegionOpen(true);
    setWorkloadOpen(true);
    // Retry the scroll a few times: when the outer accordion was collapsed the
    // workload content mounts fresh, so the ref may not be available on the
    // first tick.
    let attempts = 0;
    const tryScroll = () => {
      if (workloadRef.current) {
        const top = workloadRef.current.getBoundingClientRect().top + window.scrollY - 200;
        window.scrollTo({ top, behavior: "smooth" });
      } else if (attempts++ < 10) {
        setTimeout(tryScroll, 50);
      }
    };
    setTimeout(tryScroll, 100);
  };

  // ── Computed ──────────────────────────────────────────────────────────────
  const electableRegionCodes = electableRows.map((r) => r.region);
  const hasMultipleElectableRegions = electableRows.length > 1;

  const searchUnsupportedInCurrentElectable = electableRows.some((r) => regionByCode(r.region)?.noSearch);
  const readOnlyRegionMismatch = readOnlyRows.some((r) => !electableRegionCodes.includes(r.region));

  const nodeTypesWithMultiRows: string[] = [
    ...(readOnlyRows.length > 1 ? ["read-only nodes"] : []),
    ...(analyticsRows.length > 1 ? ["analytics nodes"] : []),
    ...(searchRows.length > 1 ? ["search nodes"] : []),
  ];

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleMultiRegionToggle = () => {
    if (multiRegion && hasMultipleElectableRegions && nodeTypesWithMultiRows.length > 0) {
      setShowRemoveModal(true);
    } else {
      setMultiRegion((v) => !v);
    }
  };

  const handleRemoveRegionsConfirm = () => {
    const keepRegion = electableRows[0].region;
    setElectableRows([electableRows[0]]);
    setReadOnlyRows((rows) => rows.slice(0, 1).map((r) => ({ ...r, region: keepRegion })));
    setAnalyticsRows((rows) => rows.slice(0, 1).map((r) => ({ ...r, region: keepRegion })));
    setSearchRows((rows) => rows.slice(0, 1).map((r) => ({ ...r, region: keepRegion })));
    setShowRemoveModal(false);
    setMultiRegion(false);
  };

  const addElectableRow = () => {
    const usedCodes = electableRows.map((r) => r.region);
    const available = ALL_REGIONS.find((r) => !usedCodes.includes(r.code));
    if (!available) return;
    setElectableRows((rows) => [...rows, { id: uid(), provider: "aws", region: available.code, nodes: 2, priority: "" }]);
  };

  const removeElectableRow = (id: string) => {
    if (electableRows.length <= 1) return;
    setElectableRows((rows) => rows.filter((r) => r.id !== id));
    const removed = electableRows.find((r) => r.id === id)?.region;
    if (removed) {
      setReadOnlyRows((rows) => rows.filter((r) => r.region !== removed));
      setAnalyticsRows((rows) => rows.filter((r) => r.region !== removed));
      setSearchRows((rows) => rows.filter((r) => r.region !== removed));
    }
  };

  const addWorkloadRow = (
    setter: React.Dispatch<React.SetStateAction<WorkloadRow[]>>,
    existingRows: WorkloadRow[],
  ) => {
    const usedRegions = existingRows.map((r) => r.region);
    const available = electableRows.find((e) => !usedRegions.includes(e.region));
    const region = available?.region ?? electableRows[0]?.region ?? "us-east-1";
    setter((rows) => [...rows, { id: uid(), provider: "aws", region, nodes: 2 }]);
  };

  const addSearchRow = () => {
    if (searchUnsupportedInCurrentElectable) return;
    const usedRegions = searchRows.map((r) => r.region);
    const available = electableRows.filter((e) => !regionByCode(e.region)?.noSearch).find((e) => !usedRegions.includes(e.region));
    const region = available?.region ?? searchRows[0]?.region ?? electableRows[0]?.region ?? "us-east-1";
    setSearchRows((rows) => [...rows, { id: uid(), provider: "aws", region, nodes: 2 }]);
  };

  // ── Derived display values ───────────────────────────────────────────────
  const currentRegionData = regionByCode(selectedRegion);
  const displayProvider = PROVIDER_NAMES[provider];
  const displayRegion = currentRegionData ? `${displayProvider} ${currentRegionData.name} (${currentRegionData.code})` : "";

  return (
    <div className="createClusterPage">
      {/* TopNav */}
      <TopNav organization="Leafy" project="Greenery" clusterName={clusterName} dimBreadcrumb />

      {/* Page header */}
      <div className="createClusterPage-headerWrap">
        {/* @ts-ignore - React 19 polymorphic type mismatch */}
        <H2 as="h1" className="createClusterPage-heading">
          Editing {clusterName}
        </H2>
      </div>

      {/* Content */}
      <div className="createClusterPage-content">
        {/* Cluster type */}
        <div className="createClusterPage-clusterTypeSection">
          <div className="createClusterPage-clusterTypeRow">
            {CLUSTER_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setClusterType(t)}
                className={`createClusterPage-clusterTypeButton ${clusterType === t ? "createClusterPage-clusterTypeButton--selected" : ""}`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          {/* @ts-ignore - React 19 polymorphic type mismatch */}
          <Card className="createClusterPage-infoCard">
            <div className="createClusterPage-infoCardInner">
              <div className="createClusterPage-infoCardTopBar" />
              <div className="createClusterPage-infoCardArrow" />
              <p className="createClusterPage-infoCardDesc">{CLUSTER_INFO[clusterType].desc}</p>
              <p className="createClusterPage-infoCardDetail">{CLUSTER_INFO[clusterType].detail}</p>
              {/* @ts-ignore - React 19 polymorphic type mismatch */}
              <IconButton aria-label="Dismiss" className="createClusterPage-infoCardClose">
                {/* @ts-ignore - React 19 polymorphic type mismatch */}
                <Icon glyph="X" />
              </IconButton>
            </div>
          </Card>
        </div>

        {/* Global Cluster Configuration */}
        <SectionRow
          title="Global Cluster Configuration"
          meta={
            globalWrites ? (
              <>
                <div className="createClusterPage-metaPrimary">Global Writes Enabled</div>
                <div className="createClusterPage-metaSecondary">{PROVIDER_NAMES[gccProvider]}, 1 Zone</div>
              </>
            ) : undefined
          }
          open={globalConfigOpen}
          onToggle={() => setGlobalConfigOpen((v) => !v)}
        >
          <GlobalClusterConfigContent
            enabled={globalWrites}
            setEnabled={setGlobalWrites}
            provider={gccProvider}
            setProvider={setGccProvider}
            sharding={gccSharding}
            setSharding={setGccSharding}
          />
        </SectionRow>

        {/* Cloud Provider, Region & Workload Isolation */}
        <SectionRow
          title="Cloud Provider, Region, & Workload Isolation"
          meta={<span className="createClusterPage-providerHeaderRegion">{displayRegion}</span>}
          open={providerRegionOpen}
          onToggle={() => setProviderRegionOpen((v) => !v)}
        >
          <div className="createClusterPage-providerCardInner">
            {/* Cloud provider pills */}
            <div className="createClusterPage-providerPillRow">
              {(["aws", "gcp", "azure"] as CloudProvider[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProvider(p)}
                  className={`createClusterPage-providerPill ${provider === p ? "createClusterPage-providerPill--selected" : ""}`}
                >
                  <ProviderLogo provider={p} size="lg" />
                </button>
              ))}
            </div>

            {/* Multi-Cloud & Multi-Region toggle row */}
            <div className="createClusterPage-multiRegionRow">
              <div className="createClusterPage-multiRegionInfo">
                <div className="createClusterPage-multiRegionIcon">
                  <svg width="36" height="26" viewBox="0 0 36 26" fill="none">
                    <path
                      d="M6 20C3 20 1 17.5 1 14.5c0-2.8 2-5.2 4.8-5.6C7 5.3 10.5 2.5 14.5 2.5c3.2 0 6 1.6 7.6 4 .4-.1.8-.1 1.2-.1C27 6.4 30 9.4 30 13c0 3.9-3.1 7-7 7H6z"
                      fill="#00ED64"
                    />
                    <path
                      d="M6 20C3 20 1 17.5 1 14.5c0-2.8 2-5.2 4.8-5.6C7 5.3 10.5 2.5 14.5 2.5c3.2 0 6 1.6 7.6 4 .4-.1.8-.1 1.2-.1C27 6.4 30 9.4 30 13c0 3.9-3.1 7-7 7H6z"
                      stroke="#001E2B"
                      strokeWidth="1"
                      fill="none"
                    />
                  </svg>
                </div>
                <div>
                  <p className="createClusterPage-multiRegionTitle">Multi-Cloud &amp; Multi-Region</p>
                  <p className="createClusterPage-multiRegionDesc">
                    Distribute data across clouds{" "}
                    <span className="createClusterPage-multiRegionLogos">
                      <ProviderLogo provider="aws" />
                      <ProviderLogo provider="gcp" />
                      <ProviderLogo provider="azure" />
                    </span>{" "}
                    or regions for improved availability and local read performance.{" "}
                    {/* @ts-ignore - React 19 polymorphic type mismatch */}
                    <Link as="button" hideExternalIcon>
                      Learn more
                    </Link>
                    .
                  </p>
                </div>
              </div>
              <Toggle checked={multiRegion} onChange={handleMultiRegionToggle} aria-label="Multi-Cloud & Multi-Region" />
            </div>

            {/* Single-region: region grid */}
            {!multiRegion && (
              <>
                <div className="createClusterPage-legend">
                  <span className="createClusterPage-legendItem">
                    {/* @ts-ignore - React 19 polymorphic type mismatch */}
                    <Icon glyph="Sparkle" fill={palette.black} size={12} /> Recommended region{" "}
                    {/* @ts-ignore - React 19 polymorphic type mismatch */}
                    <Icon glyph="InfoWithCircle" fill={palette.gray.base} size={12} />
                  </span>
                  <span className="createClusterPage-legendItem">
                    <LeafIcon /> Low carbon emissions region{" "}
                    {/* @ts-ignore - React 19 polymorphic type mismatch */}
                    <Icon glyph="InfoWithCircle" fill={palette.gray.base} size={12} />
                  </span>
                </div>
                <div className="createClusterPage-regionGrid">
                  {REGION_GROUPS.map((group) => (
                    <div key={group.label} className="createClusterPage-regionGroup">
                      <div className="createClusterPage-regionGroupLabel">
                        <span>{group.label}</span>
                      </div>
                      {group.codes.map((code) => {
                        const r = regionByCode(code);
                        if (!r) return null;
                        const isSelected = selectedRegion === code;
                        const isDimmed = search.enabled && !!r.noSearch;
                        return (
                          <button
                            key={code}
                            type="button"
                            disabled={isDimmed}
                            onClick={() => setSelectedRegion(code)}
                            className={`createClusterPage-regionButton ${isSelected ? "createClusterPage-regionButton--selected" : ""} ${isDimmed ? "createClusterPage-regionButton--dimmed" : ""}`}
                          >
                            <span className="createClusterPage-regionFlag">{r.flag}</span>
                            <span className="createClusterPage-regionName">{r.name}</span>
                            <span className="createClusterPage-regionCode">({r.code})</span>
                            {r.recommended && (
                              // @ts-ignore - React 19 polymorphic type mismatch
                              <Icon glyph="Sparkle" fill={palette.black} size={12} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Multi-region: electable nodes table */}
            {multiRegion && (
              <div className="createClusterPage-electableSection">
                {/* @ts-ignore - React 19 polymorphic type mismatch */}
                <H3 className="createClusterPage-electableHeading">
                  <span className="createClusterPage-bold">Electable nodes</span> for high availability
                </H3>
                <ElectableNodesTable
                  rows={electableRows}
                  onChangeNodes={(id, n) => setElectableRows((rows) => rows.map((r) => (r.id === id ? { ...r, nodes: n } : r)))}
                  onChangeRegion={(id, region) => setElectableRows((rows) => rows.map((r) => (r.id === id ? { ...r, region } : r)))}
                  onAdd={addElectableRow}
                  onRemove={removeElectableRow}
                />
              </div>
            )}

            {/* Workload Isolation accordion */}
            <div ref={workloadRef} className="createClusterPage-workloadAccordion">
              <button
                type="button"
                className="createClusterPage-workloadHeader"
                onClick={() => setWorkloadOpen((v) => !v)}
              >
                <div className="createClusterPage-workloadHeaderText">
                  <p className="createClusterPage-workloadTitle">
                    Workload Isolation: Read-only, Analytics, &amp; Search Nodes
                  </p>
                  <p className="createClusterPage-workloadDesc">
                    Use Read-only, Analytics, and Search Nodes to keep heavy queries from affecting primary
                    performance.
                  </p>
                </div>
                {/* @ts-ignore - React 19 polymorphic type mismatch */}
                <Icon glyph={workloadOpen ? "ChevronUp" : "ChevronDown"} fill={palette.gray.base} />
              </button>

              {workloadOpen && (
                <div className="createClusterPage-workloadBody">
                  {!multiRegion ? (
                    <>
                      <div className="createClusterPage-workloadTableHeader">
                        <div>Nodes Type</div>
                        <div className="createClusterPage-workloadTableHeaderRight">Nodes</div>
                        <div>Actions</div>
                      </div>
                      <NodeRow
                        label="Search Nodes for workload isolation"
                        description="Run search on dedicated nodes to prevent resource contention with your operational workloads. You must have search nodes in all regions where you have electable nodes."
                        state={search}
                        onAdd={() => setSearch({ enabled: true, count: 2 })}
                        onCountChange={(d) => setSearch((s) => ({ ...s, count: Math.max(1, s.count + d) }))}
                        onDelete={() => setDeleteTarget("search")}
                        nodeType="search"
                        showInfo
                        learnMore
                        onClusterTierLink={handleGoToSearchTier}
                      />
                      <NodeRow
                        label="Read-only Nodes for optimal local reads"
                        description="Add replicas in additional regions to optimize for local reads in any of your service areas."
                        state={readOnly}
                        onAdd={() => setReadOnly({ enabled: true, count: 2 })}
                        onCountChange={(d) => setReadOnly((s) => ({ ...s, count: Math.max(1, s.count + d) }))}
                        onDelete={() => setDeleteTarget("readOnly")}
                        nodeType="readOnly"
                      />
                      <NodeRow
                        label="Analytics Nodes for workload isolation"
                        description="Isolate analytics queries on nodes that will not contend with your operational workloads."
                        state={analytics}
                        onAdd={() => setAnalytics({ enabled: true, count: 2 })}
                        onCountChange={(d) => setAnalytics((s) => ({ ...s, count: Math.max(1, s.count + d) }))}
                        onDelete={() => setDeleteTarget("analytics")}
                        nodeType="analytics"
                        showInfo
                        learnMore
                      />
                    </>
                  ) : (
                    <div className="createClusterPage-workloadMultiRegion">
                      {/* Search */}
                      <div>
                        <p className="createClusterPage-workloadSectionTitle">
                          Search nodes <span className="createClusterPage-workloadSectionTitleNormal">for workload isolation</span>
                        </p>
                        <p className="createClusterPage-workloadSectionDesc">
                          Run search on dedicated nodes to prevent resource contention with your operational
                          workloads. You must have search nodes in all regions where you have electable nodes.{" "}
                          {/* @ts-ignore - React 19 polymorphic type mismatch */}
                          <Link as="button" hideExternalIcon>
                            Learn more
                          </Link>
                        </p>
                        <WorkloadNodeTable
                          rows={searchRows}
                          label="Search"
                          onChangeNodes={(id, n) => setSearchRows((rows) => rows.map((r) => (r.id === id ? { ...r, nodes: n } : r)))}
                          onAdd={addSearchRow}
                          onRemove={(id) => setSearchRows((rows) => rows.filter((r) => r.id !== id))}
                          addLabel="+ Add Search Nodes"
                          total={searchRows.reduce((s, r) => s + r.nodes, 0)}
                          onTierLink={handleGoToSearchTier}
                          workloadWord="search"
                          infoText={
                            searchRows.length > 0
                              ? `Continue to <span style='font-weight:600;color:#016bf8'>Cluster Tier</span> to select an appropriate tier for your search workload.`
                              : undefined
                          }
                          warningText={
                            searchUnsupportedInCurrentElectable && searchRows.length === 0
                              ? "Search Nodes are not supported on selected regions."
                              : readOnlyRows.length > 0 && readOnlyRows.some((r) => !electableRegionCodes.includes(r.region)) && searchRows.length === 0
                              ? "To add Search Nodes, each of your read-only regions must match an electable nodes region. Search Nodes are collocated with electable nodes, and cross-region search query routing is not supported."
                              : undefined
                          }
                        />
                      </div>

                      {/* Read-only */}
                      <div>
                        <p className="createClusterPage-workloadSectionTitle">
                          Read-only nodes <span className="createClusterPage-workloadSectionTitleNormal">for optimal local reads</span>
                        </p>
                        <p className="createClusterPage-workloadSectionDesc">
                          Add replicas in additional regions to optimize for local reads in any of your service areas.
                        </p>
                        <WorkloadNodeTable
                          rows={readOnlyRows}
                          label="Read-only"
                          onChangeNodes={(id, n) => setReadOnlyRows((rows) => rows.map((r) => (r.id === id ? { ...r, nodes: n } : r)))}
                          onAdd={() => addWorkloadRow(setReadOnlyRows, readOnlyRows)}
                          onRemove={(id) => setReadOnlyRows((rows) => rows.filter((r) => r.id !== id))}
                          total={readOnlyRows.reduce((s, r) => s + r.nodes, 0)}
                          infoText={
                            readOnlyRows.length > 0
                              ? `Continue to <span style='font-weight:600;color:#016bf8'>Cluster Tier</span> to select an appropriate tier for your read-only workload.`
                              : undefined
                          }
                          warningText={
                            readOnlyRegionMismatch
                              ? "Your read-only nodes' region must match an electable nodes region. Search nodes are collocated with electable nodes, and cross-region search query routing is not supported."
                              : undefined
                          }
                        />
                      </div>

                      {/* Analytics */}
                      <div>
                        <p className="createClusterPage-workloadSectionTitle">
                          Analytics nodes <span className="createClusterPage-workloadSectionTitleNormal">for workload isolation</span>
                        </p>
                        <p className="createClusterPage-workloadSectionDesc">
                          Isolate analytics queries on nodes that will not contend with your operational workloads.{" "}
                          {/* @ts-ignore - React 19 polymorphic type mismatch */}
                          <Link as="button" hideExternalIcon>
                            Learn more
                          </Link>
                        </p>
                        <WorkloadNodeTable
                          rows={analyticsRows}
                          label="Analytics"
                          onChangeNodes={(id, n) => setAnalyticsRows((rows) => rows.map((r) => (r.id === id ? { ...r, nodes: n } : r)))}
                          onAdd={() => addWorkloadRow(setAnalyticsRows, analyticsRows)}
                          onRemove={(id) => setAnalyticsRows((rows) => rows.filter((r) => r.id !== id))}
                          total={analyticsRows.reduce((s, r) => s + r.nodes, 0)}
                          infoText={
                            analyticsRows.length > 0
                              ? `Continue to <span style='font-weight:600;color:#016bf8'>Cluster Tier</span> to select an appropriate tier for your analytics workload.`
                              : undefined
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </SectionRow>

        {/* Cluster Tier */}
        <div ref={clusterTierRef}>
          <SectionRow
            title="Cluster Tier"
            meta={(() => {
              const t = ALL_TIERS.find((x) => x.name === selectedTier);
              return t ? (
                <>
                  <div className="createClusterPage-metaPrimary">
                    {t.name} ({t.ram} RAM, {t.storage} Storage)
                  </div>
                  <div className="createClusterPage-metaSecondary">{t.vcpu}, Encrypted, Auto-expand Storage</div>
                </>
              ) : null;
            })()}
            open={clusterTierOpen}
            onToggle={() => setClusterTierOpen((v) => !v)}
          >
            <ClusterTierContent
              selectedTier={selectedTier}
              setSelectedTier={setSelectedTier}
              onAddSearchNodes={handleAddSearchNodes}
              searchEnabled={search.enabled || (multiRegion && searchRows.length > 0)}
              tierTab={tierTab}
              setTierTab={setTierTab}
            />
          </SectionRow>
        </div>

        {/* Additional Settings */}
        <SectionRow
          title="Additional Settings"
          meta={
            <>
              <div className="createClusterPage-metaPrimary">
                {mongoVersion}
                {cloudBackup ? ", Backup" : ""}
              </div>
              <div className="createClusterPage-metaSecondary">{cloudBackup ? "Cloud Backup" : "No Backup"}</div>
            </>
          }
          open={additionalOpen}
          onToggle={() => setAdditionalOpen((v) => !v)}
        >
          <AdditionalSettingsContent
            mongoVersion={mongoVersion}
            setMongoVersion={setMongoVersion}
            cloudBackup={cloudBackup}
            setCloudBackup={setCloudBackup}
          />
        </SectionRow>

        {/* Support Plan */}
        <SectionRow
          title="Support Plan"
          meta={
            <>
              <div className="createClusterPage-metaPrimary">{supportPlan === "basic" ? "Basic Plan" : "Developer Plan"}</div>
              <div className="createClusterPage-metaSecondary">{supportPlan === "basic" ? "Included" : "$49/month"}</div>
            </>
          }
          open={supportOpen}
          onToggle={() => setSupportOpen((v) => !v)}
        >
          <SupportPlanContent plan={supportPlan} setPlan={setSupportPlan} />
        </SectionRow>

        {/* Cluster Details */}
        <SectionRow
          title="Cluster Details"
          meta={
            <>
              <div className="createClusterPage-metaPrimary">{clusterName || "Cluster0"}</div>
              <div className="createClusterPage-metaSecondary">
                {tags.length} Tag{tags.length === 1 ? "" : "s"}
              </div>
            </>
          }
          open={clusterDetailsOpen}
          onToggle={() => setClusterDetailsOpen((v) => !v)}
        >
          <ClusterDetailsContent name={clusterName} setName={setClusterName} tags={tags} setTags={setTags} addTag={addTag} />
        </SectionRow>
      </div>

      {/* Footer */}
      <div className="createClusterPage-footer">
        <div className="createClusterPage-footerInner">
          <div>
            <p className="createClusterPage-footerPrice">$0.54/hour</p>
            <p className="createClusterPage-footerHint">
              <span className="createClusterPage-bold">Pay-as-you-go!</span> You will be billed hourly and can
              terminate your cluster anytime.
            </p>
          </div>
          <div className="createClusterPage-footerActions">
            {/* @ts-ignore - React 19 polymorphic type mismatch */}
            <Button variant="default" size="large" onClick={onCancel}>
              Cancel
            </Button>
            {/* @ts-ignore - React 19 polymorphic type mismatch */}
            <Button variant="default" size="large">
              Save Draft
            </Button>
            {/* @ts-ignore - React 19 polymorphic type mismatch */}
            <Button variant="primary" size="large">
              Review Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {deleteTarget && (
        <DeleteModal
          target={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget === "readOnly") setReadOnly({ enabled: false, count: 0 });
            if (deleteTarget === "analytics") setAnalytics({ enabled: false, count: 0 });
            if (deleteTarget === "search") setSearch({ enabled: false, count: 0 });
            setDeleteTarget(null);
          }}
        />
      )}
      {showRemoveModal && (
        <RemoveRegionsModal
          electableRegion={electableRows[0]?.region ?? "us-east-1"}
          nodeTypes={nodeTypesWithMultiRows}
          onCancel={() => setShowRemoveModal(false)}
          onConfirm={handleRemoveRegionsConfirm}
        />
      )}
    </div>
  );
}
