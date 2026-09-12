import type { CSSProperties } from "react";

export function QuadMark({
  size = 48,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="20 20 216 202"
      width={size}
      height={size}
      className={className}
      aria-label="Quad"
      role="img"
    >
      <g fill="currentColor">
        <path d="M24 24h88v34H96C75 58 58 75 58 96v16H24Z" />
        <path d="M130 24h88v88h-34V96c0-21-17-38-38-38h-16Z" />
        <path d="M24 130h34v16c0 21 17 38 38 38h16v34H24Z" />
      </g>
      <path
        d="M130 130h16c21 0 38 17 38 38v16h14l35 34h-50l-34-34h-19Z"
        fill="var(--accent, #d8573c)"
      />
    </svg>
  );
}

export function QuadLogo({
  height = 32,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  const w = Math.round((720 / 240) * height);
  return (
    <svg
      viewBox="0 0 720 240"
      width={w}
      height={height}
      className={className}
      aria-label="Quad"
      role="img"
    >
      <g fill="currentColor">
        <path d="M24 24h88v34H96C75 58 58 75 58 96v16H24Z" />
        <path d="M130 24h88v88h-34V96c0-21-17-38-38-38h-16Z" />
        <path d="M24 130h34v16c0 21 17 38 38 38h16v34H24Z" />
      </g>
      <path
        d="M130 130h16c21 0 38 17 38 38v16h14l35 34h-50l-34-34h-19Z"
        fill="var(--accent, #d8573c)"
      />
      <text
        x="270"
        y="162"
        fill="currentColor"
        fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
        fontSize="118"
        fontWeight="760"
        letterSpacing="-7"
      >
        Quad
      </text>
    </svg>
  );
}

export function QuadAnimatedMark({ size = 160 }: { size?: number }) {
  return (
    <svg
      viewBox="20 20 216 202"
      width={size}
      height={size}
      aria-label="Quad"
      role="img"
    >
      <path
        className="gate"
        style={{ "--gx": "-22px", "--gy": "-22px" } as CSSProperties}
        fill="currentColor"
        d="M24 24h88v34H96C75 58 58 75 58 96v16H24Z"
      />
      <path
        className="gate"
        style={
          {
            "--gx": "22px",
            "--gy": "-22px",
            animationDelay: ".12s",
          } as CSSProperties
        }
        fill="currentColor"
        d="M130 24h88v88h-34V96c0-21-17-38-38-38h-16Z"
      />
      <path
        className="gate"
        style={
          {
            "--gx": "-22px",
            "--gy": "22px",
            animationDelay: ".24s",
          } as CSSProperties
        }
        fill="currentColor"
        d="M24 130h34v16c0 21 17 38 38 38h16v34H24Z"
      />
      <path
        className="gate"
        style={
          {
            "--gx": "22px",
            "--gy": "22px",
            animationDelay: ".36s",
          } as CSSProperties
        }
        fill="#d8573c"
        d="M130 130h16c21 0 38 17 38 38v16h14l35 34h-50l-34-34h-19Z"
      />
    </svg>
  );
}
