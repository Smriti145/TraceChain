import React from "react";
import Svg, {Circle, Line, Path, Polyline, Rect} from "react-native-svg";

type Props = {name: string; size?: number; color?: string};

export default function SvgIcon({name, size = 24, color = "#17201E"}: Props) {
  const icon = name.replace("-outline", "");
  const common = {stroke: color, strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none"};

  const content = (() => {
    switch (icon) {
      case "home": return <><Path {...common} d="M3 10.8 12 3l9 7.8"/><Path {...common} d="M5.5 9.5V21h13V9.5M9.5 21v-7h5v7"/></>;
      case "scan": return <><Path {...common} d="M8 3H4a1 1 0 0 0-1 1v4M16 3h4a1 1 0 0 1 1 1v4M21 16v4a1 1 0 0 1-1 1h-4M8 21H4a1 1 0 0 1-1-1v-4"/><Line {...common} x1="7" y1="12" x2="17" y2="12"/></>;
      case "time": return <><Circle {...common} cx="12" cy="12" r="9"/><Path {...common} d="M12 7v5l3.5 2"/></>;
      case "notifications": return <><Path {...common} d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><Path {...common} d="M10 21h4"/></>;
      case "person": return <><Circle {...common} cx="12" cy="8" r="4"/><Path {...common} d="M4.5 21a7.5 7.5 0 0 1 15 0"/></>;
      case "mail": return <><Rect {...common} x="3" y="5" width="18" height="14" rx="2"/><Path {...common} d="m4 7 8 6 8-6"/></>;
      case "lock-closed": return <><Rect {...common} x="5" y="10" width="14" height="11" rx="2"/><Path {...common} d="M8 10V7a4 4 0 0 1 8 0v3"/></>;
      case "git-network": case "git-branch": return <><Circle {...common} cx="6" cy="5" r="2"/><Circle {...common} cx="18" cy="8" r="2"/><Circle {...common} cx="6" cy="19" r="2"/><Path {...common} d="M6 7v10M8 11h5a5 5 0 0 0 5-5"/></>;
      case "server": return <><Rect {...common} x="3" y="4" width="18" height="6" rx="2"/><Rect {...common} x="3" y="14" width="18" height="6" rx="2"/><Circle fill={color} cx="7" cy="7" r="1"/><Circle fill={color} cx="7" cy="17" r="1"/></>;
      case "cloud-offline": return <><Path {...common} d="M5.2 17H4a3 3 0 0 1-.7-5.9A6.5 6.5 0 0 1 14.7 6a5 5 0 0 1 5.1 7.1"/><Line {...common} x1="3" y1="3" x2="21" y2="21"/></>;
      case "chevron-up": return <Polyline {...common} points="5,15 12,8 19,15"/>;
      case "chevron-down": return <Polyline {...common} points="5,9 12,16 19,9"/>;
      case "chevron-forward": return <Polyline {...common} points="9,5 16,12 9,19"/>;
      case "arrow-forward": return <><Line {...common} x1="4" y1="12" x2="20" y2="12"/><Polyline {...common} points="14,6 20,12 14,18"/></>;
      case "arrow-forward-circle": return <><Circle {...common} cx="12" cy="12" r="9"/><Line {...common} x1="7" y1="12" x2="17" y2="12"/><Polyline {...common} points="13,8 17,12 13,16"/></>;
      case "arrow-back": return <><Line {...common} x1="20" y1="12" x2="4" y2="12"/><Polyline {...common} points="10,6 4,12 10,18"/></>;
      case "shield-checkmark": return <><Path {...common} d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6z"/><Polyline {...common} points="8,12 11,15 16,9"/></>;
      case "search": return <><Circle {...common} cx="10.5" cy="10.5" r="6.5"/><Line {...common} x1="15.5" y1="15.5" x2="21" y2="21"/></>;
      case "options": return <><Line {...common} x1="4" y1="7" x2="20" y2="7"/><Circle fill={color} cx="9" cy="7" r="2"/><Line {...common} x1="4" y1="17" x2="20" y2="17"/><Circle fill={color} cx="15" cy="17" r="2"/></>;
      case "cube": return <><Path {...common} d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><Path {...common} d="m4 7.5 8 4.5 8-4.5M12 12v9"/></>;
      case "checkmark-circle": return <><Circle {...common} cx="12" cy="12" r="9"/><Polyline {...common} points="8,12 11,15 16.5,9"/></>;
      case "alert-circle": case "warning": return <><Circle {...common} cx="12" cy="12" r="9"/><Line {...common} x1="12" y1="7" x2="12" y2="13"/><Circle fill={color} cx="12" cy="17" r="1"/></>;
      case "close": return <><Line {...common} x1="5" y1="5" x2="19" y2="19"/><Line {...common} x1="19" y1="5" x2="5" y2="19"/></>;
      case "business": return <><Rect {...common} x="4" y="3" width="16" height="18" rx="1"/><Path {...common} d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3"/></>;
      case "help-circle": return <><Circle {...common} cx="12" cy="12" r="9"/><Path {...common} d="M9.7 9a2.5 2.5 0 1 1 3.6 2.3c-1 .5-1.3 1-1.3 2.2"/><Circle fill={color} cx="12" cy="17" r="1"/></>;
      case "log-out": return <><Path {...common} d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/><Line {...common} x1="10" y1="12" x2="21" y2="12"/><Polyline {...common} points="17,8 21,12 17,16"/></>;
      case "git-commit": return <><Line {...common} x1="3" y1="12" x2="8" y2="12"/><Circle {...common} cx="12" cy="12" r="4"/><Line {...common} x1="16" y1="12" x2="21" y2="12"/></>;
      case "calendar": return <><Rect {...common} x="3" y="5" width="18" height="16" rx="2"/><Line {...common} x1="7" y1="3" x2="7" y2="7"/><Line {...common} x1="17" y1="3" x2="17" y2="7"/><Line {...common} x1="3" y1="10" x2="21" y2="10"/></>;
      default: return <Circle {...common} cx="12" cy="12" r="8"/>;
    }
  })();

  return <Svg width={size} height={size} viewBox="0 0 24 24">{content}</Svg>;
}
