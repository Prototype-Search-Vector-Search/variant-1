import Icon from "@leafygreen-ui/icon";
import { IconButton } from "@leafygreen-ui/icon-button";
import { Badge } from "@leafygreen-ui/badge";
import { Body, Link } from "@leafygreen-ui/typography";
import { palette } from "@leafygreen-ui/palette";
import type { ElectableRow } from "./types";
import { PROVIDER_NAMES } from "./types";
import { RegionDisplay } from "./RegionDisplay";
import "./ElectableNodesTable.css";

export interface ElectableNodesTableProps {
  rows: ElectableRow[];
  onChangeNodes: (id: string, n: number) => void;
  onChangeRegion: (id: string, region: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

const PRIORITIES = ["HIGHEST", "HIGH", "MEDIUM", "LOW", "LOWEST"];

export function ElectableNodesTable({ rows, onChangeNodes, onAdd, onRemove }: ElectableNodesTableProps) {
  return (
    <div className="electableNodesTable">
      {/* legend */}
      <div className="electableNodesTable-legend">
        <span className="electableNodesTable-legendItem">
          {/* @ts-ignore - React 19 polymorphic type mismatch */}
          <Icon glyph="Checkmark" size={12} fill={palette.green.dark1} />
          <span className="electableNodesTable-legendRecommended">Recommended region</span>
        </span>
        <span className="electableNodesTable-legendItem">
          <span className="electableNodesTable-legendX">✕</span> Not available during full region outage
        </span>
        <span className="electableNodesTable-legendItem">
          <span className="electableNodesTable-legendX">✕</span> Not available during a cloud provider outage
        </span>
      </div>
      {/* info */}
      {/* @ts-ignore - React 19 polymorphic type mismatch */}
      <Body className="electableNodesTable-info">
        Configure 3, 5, or 7 nodes across multiple regions to better withstand data center outages.
      </Body>
      <div className="electableNodesTable-recommendedRow">
        {/* @ts-ignore - React 19 polymorphic type mismatch */}
        <Icon glyph="Favorite" size={12} fill={palette.black} />
        <span className="electableNodesTable-recommendedText">Recommended region</span>
        {/* @ts-ignore - React 19 polymorphic type mismatch */}
        <Icon glyph="InfoWithCircle" size={12} fill={palette.gray.base} />
      </div>
      {/* table header */}
      <div className="electableNodesTable-header">
        <span>Provider</span>
        <span>Region</span>
        <span>Priority</span>
        <span className="electableNodesTable-right">Nodes</span>
        <span className="electableNodesTable-right">Action</span>
      </div>
      {rows.map((row, idx) => (
        <div key={row.id} className="electableNodesTable-row">
          <span className="electableNodesTable-provider">{PROVIDER_NAMES[row.provider]}</span>
          <RegionDisplay code={row.region} />
          <span>
            <Badge variant="blue">{PRIORITIES[Math.min(idx, PRIORITIES.length - 1)]}</Badge>
          </span>
          <div className="electableNodesTable-right">
            <input
              type="number"
              aria-label="Number of nodes"
              min={1}
              max={7}
              value={row.nodes}
              onChange={(e) => onChangeNodes(row.id, parseInt(e.target.value, 10) || 1)}
              className="electableNodesTable-nodesInput"
            />
          </div>
          <div className="electableNodesTable-right">
            {/* @ts-ignore - React 19 polymorphic type mismatch */}
            <IconButton
              aria-label="Remove region"
              disabled={rows.length === 1}
              onClick={() => onRemove(row.id)}
            >
              {/* @ts-ignore - React 19 polymorphic type mismatch */}
              <Icon glyph="Trash" />
            </IconButton>
          </div>
        </div>
      ))}
      {/* add row */}
      <div className="electableNodesTable-addRow">
        {/* @ts-ignore - React 19 polymorphic type mismatch */}
        <Link as="button" onClick={onAdd} hideExternalIcon>
          + Add a provider/region
        </Link>
      </div>
      <div className="electableNodesTable-total">
        Total: {rows.reduce((s, r) => s + r.nodes, 0)} Electable Nodes
      </div>
    </div>
  );
}
