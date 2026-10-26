import type { ReactNode } from "react";

export type SFName =
  | "house"
  | "fork"
  | "bag"
  | "gift"
  | "person"
  | "bell"
  | "search"
  | "heart"
  | "heart.fill"
  | "plus"
  | "minus"
  | "xmark"
  | "chevron.left"
  | "chevron.right"
  | "chevron.down"
  | "star"
  | "star.fill"
  | "mappin"
  | "phone"
  | "envelope"
  | "clock"
  | "checkmark"
  | "checkmark.circle"
  | "slider"
  | "share"
  | "calendar"
  | "creditcard"
  | "apple"
  | "gear"
  | "question"
  | "doc"
  | "trash"
  | "pencil"
  | "lock"
  | "eye"
  | "eye.slash"
  | "info"
  | "exclamation"
  | "wifi.slash"
  | "arrow.clockwise"
  | "leaf"
  | "sparkles"
  | "takeout"
  | "party"
  | "location"
  | "moon"
  | "sun"
  | "person.badge"
  | "list"
  | "photo"
  | "ellipsis";

const filled = new Set<SFName>(["house", "bag", "gift", "person", "heart.fill", "star.fill", "checkmark.circle"]);

export function SFIcon({
  name,
  size = 22,
  className,
  weight = "regular",
}: {
  name: SFName;
  size?: number;
  className?: string;
  weight?: "regular" | "fill";
}) {
  const fillMode = filled.has(name);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill={fillMode ? "currentColor" : "none"}
      stroke={fillMode ? "none" : "currentColor"}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {glyph(name, fillMode)}
    </svg>
  );
}

function glyph(name: SFName, fill: boolean): ReactNode {
  switch (name) {
    case "house":
      return fill ? (
        <path d="M3.8 10.2 12 3.6l8.2 6.6V20a1.4 1.4 0 0 1-1.4 1.4h-4.2v-6.2H9.4v6.2H5.2A1.4 1.4 0 0 1 3.8 20v-9.8Z" />
      ) : (
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
      );
    case "fork":
      return (
        <>
          <path d="M8 3.5v6.2a2.2 2.2 0 0 0 1.4 2V20" />
          <path d="M6.2 3.5V8" />
          <path d="M9.8 3.5V8" />
          <path d="M15.2 3.5c1.6 2.2 2.2 4 1.6 6.2-.5 1.8-1.6 2.4-1.6 2.4V20" />
        </>
      );
    case "bag":
      return fill ? (
        <path d="M7 8.2V7.2A5 5 0 0 1 17 7.2v1H19.2A1.4 1.4 0 0 1 20.6 9.7l-1 10.2A1.6 1.6 0 0 1 18 21.2H6a1.6 1.6 0 0 1-1.6-1.3l-1-10.2A1.4 1.4 0 0 1 4.8 8.2H7Zm1.6 0h6.8V7.2a3.4 3.4 0 0 0-6.8 0v1Z" />
      ) : (
        <>
          <path d="M6.5 8h11l1 11.2a1 1 0 0 1-1 1.1H6.5a1 1 0 0 1-1-1.1L6.5 8Z" />
          <path d="M9 8V6.8a3 3 0 0 1 6 0V8" />
        </>
      );
    case "gift":
      return fill ? (
        <path d="M4 11h16v8.2A1.6 1.6 0 0 1 18.4 21H5.6A1.6 1.6 0 0 1 4 19.2V11Zm0-3.2A1.6 1.6 0 0 1 5.6 6.2H11V11H4V7.8Zm9 0h5.4A1.6 1.6 0 0 1 20 7.8V11h-7V6.2ZM9.2 6.2c0-1.5 1.2-2.7 2.8-2.7 1.2 1.6.2 2.7-1.4 2.7H9.2Zm5.6 0h-1.4c-1.6 0-2.6-1.1-1.4-2.7 1.6 0 2.8 1.2 2.8 2.7Z" />
      ) : (
        <>
          <rect x="4" y="8" width="16" height="4" rx="1" />
          <path d="M5 12v7.2A1 1 0 0 0 6 20.2h12a1 1 0 0 0 1-1V12" />
          <path d="M12 8v12" />
          <path d="M12 8c-1.2-2.2-4.2-2.4-4.2-.4S11 8 12 8c1.2-2.2 4.2-2.4 4.2-.4S13 8 12 8Z" />
        </>
      );
    case "person":
      return fill ? (
        <path d="M12 12.2a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-6.2 7.6a6.4 6.4 0 0 1 12.4 0A1.4 1.4 0 0 1 16.8 21H7.2a1.4 1.4 0 0 1-1.4-1.2Z" />
      ) : (
        <>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 19.2a6.5 6.5 0 0 1 13 0" />
        </>
      );
    case "bell":
      return (
        <>
          <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.2 1.6H4.8L6 16.5Z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </>
      );
    case "search":
      return (
        <>
          <circle cx="11" cy="11" r="6" />
          <path d="m15.5 15.5 4 4" />
        </>
      );
    case "heart":
      return <path d="M12 19.2s-6.4-3.8-6.4-8A3.6 3.6 0 0 1 12 8.2a3.6 3.6 0 0 1 6.4 3c0 4.2-6.4 8-6.4 8Z" />;
    case "heart.fill":
      return <path d="M12 19.4S5.2 15.4 5.2 10.8A3.8 3.8 0 0 1 12 8.4a3.8 3.8 0 0 1 6.8 2.4c0 4.6-6.8 8.6-6.8 8.6Z" />;
    case "plus":
      return (
        <>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </>
      );
    case "minus":
      return <path d="M5 12h14" />;
    case "xmark":
      return (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      );
    case "chevron.left":
      return <path d="M14.5 5.5 8 12l6.5 6.5" />;
    case "chevron.right":
      return <path d="M9.5 5.5 16 12l-6.5 6.5" />;
    case "chevron.down":
      return <path d="M5.5 9.5 12 16l6.5-6.5" />;
    case "star":
      return <path d="m12 3.8 2.1 4.6 5 .6-3.7 3.4.9 5-4.3-2.4L7.7 17.4l.9-5L4.9 9l5-.6L12 3.8Z" />;
    case "star.fill":
      return <path d="m12 3.4 2.3 4.9 5.3.6-4 3.6 1.1 5.3L12 15.4 7.3 17.8 8.4 12.5 4.4 8.9l5.3-.6L12 3.4Z" />;
    case "mappin":
      return (
        <>
          <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
          <circle cx="12" cy="11" r="2" />
        </>
      );
    case "phone":
      return (
        <path d="M8 4.5h2.2l1.2 3-1.6 1a12 12 0 0 0 5.7 5.7l1-1.6 3 1.2V16a2 2 0 0 1-2.2 2A14.5 14.5 0 0 1 6 7.7 2 2 0 0 1 8 4.5Z" />
      );
    case "envelope":
      return (
        <>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </>
      );
    case "clock":
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4.5l3 2" />
        </>
      );
    case "checkmark":
      return <path d="m5 12.5 4.2 4.2L19 7.5" />;
    case "checkmark.circle":
      return fill ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12.2 2.6 2.6L16.2 9" fill="none" stroke="#fff" strokeWidth="1.8" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="m8.2 12.2 2.5 2.5 5-5.2" />
        </>
      );
    case "slider":
      return (
        <>
          <path d="M4 8h16" />
          <path d="M4 16h16" />
          <circle cx="9" cy="8" r="2" fill="var(--background, #fff)" />
          <circle cx="15" cy="16" r="2" fill="var(--background, #fff)" />
        </>
      );
    case "share":
      return (
        <>
          <path d="M12 4v10" />
          <path d="m8 8 4-4 4 4" />
          <path d="M6 12.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-6.5" />
        </>
      );
    case "calendar":
      return (
        <>
          <rect x="4" y="5.5" width="16" height="14" rx="2" />
          <path d="M4 10h16" />
          <path d="M8 3.8v3.2" />
          <path d="M16 3.8v3.2" />
        </>
      );
    case "creditcard":
      return (
        <>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h4" />
        </>
      );
    case "apple":
      return (
        <path
          d="M16.2 12.6c0-2 1.6-3 1.7-3.1-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7c-1.4 0-2.7.8-3.4 2.1-1.5 2.6-.4 6.4 1 8.5.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7s1.6.7 2.7.7 1.9-1 2.6-2c.8-1.2 1.1-2.3 1.2-2.4-.1 0-2.2-.8-2.8-3.6Zm-2.6-6.6c.6-.7 1-1.7.9-2.6-1 .1-2.1.6-2.7 1.4-.6.7-1.1 1.7-.9 2.6 1 .1 2.1-.5 2.7-1.4Z"
          fill="currentColor"
          stroke="none"
        />
      );
    case "gear":
      return (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6" />
        </>
      );
    case "question":
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.7.4-1.1.9-1.1 1.7" />
          <path d="M12 17h.01" />
        </>
      );
    case "doc":
      return (
        <>
          <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
          <path d="M14 3.5V8h4" />
        </>
      );
    case "trash":
      return (
        <>
          <path d="M5 7.5h14" />
          <path d="M9 7.5V5.8A1 1 0 0 1 10 4.8h4a1 1 0 0 1 1 .9v1.7" />
          <path d="M7.5 7.5 8.2 19a1 1 0 0 0 1 .9h5.6a1 1 0 0 0 1-.9l.7-11.5" />
        </>
      );
    case "pencil":
      return (
        <>
          <path d="M4 20h4l11-11-4-4L4 16v4Z" />
          <path d="m13 7 4 4" />
        </>
      );
    case "lock":
      return (
        <>
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V8a4 4 0 0 1 8 0v2" />
        </>
      );
    case "eye":
      return (
        <>
          <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="2.4" />
        </>
      );
    case "eye.slash":
      return (
        <>
          <path d="M4 5.5 20 18.5" />
          <path d="M9.2 6.8A9 9 0 0 1 12 6.5c6 0 9.5 5.5 9.5 5.5a16 16 0 0 1-3.2 3.4" />
          <path d="M6.2 8.4C4 10 2.5 12 2.5 12S6 17.5 12 17.5a9 9 0 0 0 3.2-.6" />
        </>
      );
    case "info":
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 11v5" />
          <path d="M12 8h.01" />
        </>
      );
    case "exclamation":
      return (
        <>
          <path d="M12 4.5 21 19H3L12 4.5Z" />
          <path d="M12 10v4" />
          <path d="M12 16.5h.01" />
        </>
      );
    case "wifi.slash":
      return (
        <>
          <path d="M4 8.5a14 14 0 0 1 16.2.4" />
          <path d="M7 12a9 9 0 0 1 7.2.2" />
          <path d="M12 18h.01" />
          <path d="M4 5.5 20 18.5" />
        </>
      );
    case "arrow.clockwise":
      return (
        <>
          <path d="M20 12a8 8 0 1 1-2.2-5.5" />
          <path d="M20 4.5V9h-4.5" />
        </>
      );
    case "leaf":
      return <path d="M5 14.5C5 8 12 4 19.5 4 20 12 16 19 9.5 19 7 19 5 17 5 14.5Z" />;
    case "sparkles":
      return (
        <>
          <path d="M12 3.5 13.2 8 17.5 9.2 13.2 10.4 12 15l-1.2-4.6L6.5 9.2 10.8 8 12 3.5Z" />
          <path d="M18 14.5 18.6 16.4 20.5 17 18.6 17.6 18 19.5 17.4 17.6 15.5 17 17.4 16.4 18 14.5Z" />
        </>
      );
    case "takeout":
      return (
        <>
          <path d="M7 9h10l-.8 10.2a1 1 0 0 1-1 .8H8.8a1 1 0 0 1-1-.8L7 9Z" />
          <path d="M8 9c0-2.5 1.6-4 4-4s4 1.5 4 4" />
          <path d="M9 13h6" />
        </>
      );
    case "party":
      return (
        <>
          <path d="M4 20 9 8l7 7L4 20Z" />
          <path d="M14 6.5h.01M18 9h.01M16.5 4.5h.01" />
        </>
      );
    case "location":
      return (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2" />
        </>
      );
    case "moon":
      return <path d="M16 3.8A8 8 0 1 0 20.2 15 6.5 6.5 0 0 1 16 3.8Z" />;
    case "sun":
      return (
        <>
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18" />
        </>
      );
    case "person.badge":
      return (
        <>
          <circle cx="10" cy="8" r="3" />
          <path d="M4.5 19a6 6 0 0 1 9.2-3" />
          <path d="M17 11v6M14 14h6" />
        </>
      );
    case "list":
      return (
        <>
          <path d="M9 7h11" />
          <path d="M9 12h11" />
          <path d="M9 17h11" />
          <path d="M4.5 7h.01M4.5 12h.01M4.5 17h.01" />
        </>
      );
    case "photo":
      return (
        <>
          <rect x="3.5" y="5" width="17" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.4" />
          <path d="m4 16 4.2-3.2L12 16l2.2-1.6L20 18" />
        </>
      );
    case "ellipsis":
      return (
        <>
          <circle cx="6" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="18" cy="12" r="1" fill="currentColor" stroke="none" />
        </>
      );
    default:
      return null;
  }
}
