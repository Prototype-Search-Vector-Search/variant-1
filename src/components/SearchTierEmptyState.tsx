import Icon from "@leafygreen-ui/icon";
import { palette } from "@leafygreen-ui/palette";
import { Button } from "@leafygreen-ui/button";
import { Body, Link } from "@leafygreen-ui/typography";
import "./SearchTierEmptyState.css";

export interface SearchTierEmptyStateProps {
  onAddSearchNodes: () => void;
}

const WITHOUT_ITEMS = [
  "Search traffic competes with database operations impacting reads, writes, and application performance",
  "Performance becomes unpredictable under load",
  "Scale the entire cluster to solve search bottlenecks",
  "Spend time firefighting traffic spikes",
];

const WITH_ITEMS = [
  "Search and database workloads stay isolated, and search spikes no longer cascade into transactional workloads",
  "Consistent search performance during peak traffic",
  "Scale search independently from your database",
  "Fewer alerts, fewer scaling events, and cleaner capacity planning",
];

export function SearchTierEmptyState({ onAddSearchNodes }: SearchTierEmptyStateProps) {
  return (
    <div className="searchTierEmptyState">
      <div className="searchTierEmptyState-heading">
        <p className="searchTierEmptyState-title">You have no Search Nodes</p>
        <p className="searchTierEmptyState-subtitle">
          Separate search workloads from your database to improve
          <br />
          performance, scalability, and operational confidence
        </p>
      </div>

      <div className="searchTierEmptyState-card">
        <div className="searchTierEmptyState-column">
          <p className="searchTierEmptyState-columnHeading searchTierEmptyState-columnHeading--without">
            Without Search Nodes
          </p>
          {WITHOUT_ITEMS.map((text) => (
            <div key={text} className="searchTierEmptyState-item">
              {/* @ts-ignore - React 19 polymorphic type mismatch */}
              <Icon glyph="ThumbsDown" fill={palette.gray.dark1} size={24} />
              {/* @ts-ignore - React 19 polymorphic type mismatch */}
              <Body className="searchTierEmptyState-itemText">{text}</Body>
            </div>
          ))}
        </div>
        <div className="searchTierEmptyState-column">
          <p className="searchTierEmptyState-columnHeading searchTierEmptyState-columnHeading--with">
            With Search Nodes
          </p>
          {WITH_ITEMS.map((text) => (
            <div key={text} className="searchTierEmptyState-item">
              {/* @ts-ignore - React 19 polymorphic type mismatch */}
              <Icon glyph="ThumbsUp" fill={palette.green.dark1} size={24} />
              {/* @ts-ignore - React 19 polymorphic type mismatch */}
              <Body className="searchTierEmptyState-itemText">{text}</Body>
            </div>
          ))}
        </div>
      </div>

      <div className="searchTierEmptyState-cta">
        {/* @ts-ignore - React 19 polymorphic type mismatch */}
        <Button variant="default" size="large" onClick={onAddSearchNodes} className="searchTierEmptyState-ctaButton">
          Add Search Nodes
        </Button>
        {/* @ts-ignore - React 19 polymorphic type mismatch */}
        <Link href="#" arrowAppearance="persist">
          Learn more about Search Nodes.
        </Link>
      </div>
    </div>
  );
}
