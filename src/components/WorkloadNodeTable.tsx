import Icon from "@leafygreen-ui/icon";
import { Button } from "@leafygreen-ui/button";
import { Banner } from "@leafygreen-ui/banner";
import { Link } from "@leafygreen-ui/typography";
import type { WorkloadRow, CloudProvider } from "./types";
import { PROVIDER_NAMES } from "./types";
import { RegionDisplay } from "./RegionDisplay";
import "./WorkloadNodeTable.css";

export interface WorkloadNodeTableProps {
  rows: WorkloadRow[];
  label: string;
  onChangeNodes: (id: string, n: number) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  addLabel?: string;
  total: number;
  infoText?: string;
  warningText?: string;
  onTierLink?: () => void;
  workloadWord?: string;
  hideActions?: boolean;
  removeLink?: { label: string; onClick: () => void };
}

export function WorkloadNodeTable({
  rows,
  label,
  onChangeNodes,
  onAdd,
  onRemove,
  addLabel = "+ Add a provider/region",
  total,
  infoText,
  warningText,
  onTierLink,
  workloadWord,
  hideActions = false,
  removeLink,
}: WorkloadNodeTableProps) {
  const showTierBanner = onTierLink && rows.length > 0;

  return (
    <div className="workloadNodeTable">
      {showTierBanner ? (
        <Banner variant="info" className="workloadNodeTable-banner">
          Continue to{" "}
          {/* @ts-ignore - React 19 polymorphic type mismatch */}
          <Link as="button" onClick={onTierLink} hideExternalIcon className="workloadNodeTable-bannerLink">
            Cluster Tier
          </Link>{" "}
          to select an appropriate tier for your {workloadWord} workload.
        </Banner>
      ) : (
        infoText && (
          <Banner variant="info" className="workloadNodeTable-banner">
            <span dangerouslySetInnerHTML={{ __html: infoText }} />
          </Banner>
        )
      )}
      {warningText && (
        <Banner variant="warning" className="workloadNodeTable-banner">
          {warningText}
        </Banner>
      )}
      <div className={`workloadNodeTable-header${hideActions ? " workloadNodeTable-header--noAction" : ""}`}>
        <span>Provider</span>
        <span>Region</span>
        <span className="workloadNodeTable-right">Nodes</span>
        {!hideActions && <span className="workloadNodeTable-right">Action</span>}
      </div>
      {rows.length > 0 &&
        rows.map((row) => (
          <div key={row.id} className={`workloadNodeTable-row${hideActions ? " workloadNodeTable-row--noAction" : ""}`}>
            <span className="workloadNodeTable-provider">{PROVIDER_NAMES[row.provider as CloudProvider]}</span>
            <RegionDisplay code={row.region} />
            <div className="workloadNodeTable-right">
              <input
                type="number"
                aria-label="Number of nodes"
                min={1}
                max={7}
                value={row.nodes}
                onChange={(e) => onChangeNodes(row.id, parseInt(e.target.value, 10) || 1)}
                className="workloadNodeTable-nodesInput"
              />
            </div>
            {!hideActions && (
              <div className="workloadNodeTable-right">
                {/* @ts-ignore - React 19 polymorphic type mismatch */}
                <Button size="xsmall" aria-label="Remove row" onClick={() => onRemove(row.id)}>
                  {/* @ts-ignore - React 19 polymorphic type mismatch */}
                  <Icon glyph="Trash" />
                </Button>
              </div>
            )}
          </div>
        ))}
      {removeLink && rows.length > 0 ? (
        <div className="workloadNodeTable-addRow">
          {/* @ts-ignore - React 19 polymorphic type mismatch */}
          <Link as="button" onClick={removeLink.onClick} hideExternalIcon>
            {removeLink.label}
          </Link>
        </div>
      ) : (
        !warningText && (
          <div className="workloadNodeTable-addRow">
            {/* @ts-ignore - React 19 polymorphic type mismatch */}
            <Link as="button" onClick={onAdd} hideExternalIcon>
              {addLabel}
            </Link>
          </div>
        )
      )}
      <div className="workloadNodeTable-total">
        Total: {total} {label} Nodes
      </div>
    </div>
  );
}
