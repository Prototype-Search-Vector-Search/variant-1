import Icon from "@leafygreen-ui/icon";
import { palette } from "@leafygreen-ui/palette";
import { regionByCode } from "./regionData";
import "./RegionDisplay.css";

export interface RegionDisplayProps {
  code: string;
}

export function RegionDisplay({ code }: RegionDisplayProps) {
  const r = regionByCode(code);
  if (!r) {
    return <span className="regionDisplay-fallback">{code}</span>;
  }
  return (
    <span className="regionDisplay">
      <span>{r.flag}</span>
      <span className="regionDisplay-name">{r.name}</span>
      <span className="regionDisplay-code">({r.code})</span>
      {r.recommended && (
        // @ts-ignore - React 19 polymorphic type mismatch
        <Icon glyph="Favorite" size={12} fill={palette.black} />
      )}
    </span>
  );
}
