// src/components/Card.tsx
import { Link } from "react-router-dom";
import React from "react";

type CardProps = {
  to: string;
  /** repassado para o <Link state={...}> (breadcrumb, etc.) */
  state?: any;
  imageUrl: string;
  title: string;
  subtitle?: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function Card({
  to,
  state,
  imageUrl,
  title,
  subtitle,
  className,
  style,
}: CardProps) {
  return (
    <Link
      to={to}
      state={state} // <— repassa o state para o Link
      className={`bib-card ${className ?? ""}`}
      style={{
        background: "#fff",
        border: "1px solid var(--gray-200)",
        borderRadius: 12,
        padding: 10,
        color: "inherit",
        textDecoration: "none",
        transition:
          "background-color .25s ease, box-shadow .25s ease, border-color .25s ease, transform .2s ease",
        ...style,
      }}
    >
      {/* thumb 1:1 como nos demais cards */}
      <div
        className="bib-thumb-wrap"
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 10,
          overflow: "hidden",
          background: "#f4f7f4",
          marginBottom: 8,
        }}
      >
        <img
          src={imageUrl}
          alt={title}
          className="bib-thumb"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/icon.png";
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      <div>
        <div
          className="bib-title"
          title={title}
          style={{ fontSize: 15, lineHeight: 1.25, marginBottom: 4, minHeight: 34 }}
        >
          {title}
        </div>
        {subtitle && (
          <div className="muted" style={{ fontSize: 13, lineHeight: 1.2 }}>
            {subtitle}
          </div>
        )}
      </div>
    </Link>
  );
}
