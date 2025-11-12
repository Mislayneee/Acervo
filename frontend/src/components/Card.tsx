// src/components/Card.tsx
import { Link } from "react-router-dom";
import React, { useState } from "react";

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
  const [hover, setHover] = useState(false);

  return (
    <Link
      to={to}
      state={state}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`bib-card ${className ?? ""}`}
      style={{
        background: hover ? "var(--color-primary, #0b4e2f)" : "#fff",
        border: hover ? "1px solid var(--color-primary, #0b4e2f)" : "1px solid var(--gray-200)",
        borderRadius: 12,
        padding: 10,
        color: hover ? "#fff" : "inherit",
        textDecoration: "none",
        transition:
          "background-color .25s ease, box-shadow .25s ease, border-color .25s ease, color .25s ease, transform .2s ease",
        transform: hover ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hover
          ? "0 4px 10px rgba(0,0,0,0.12)"
          : "0 2px 4px rgba(0,0,0,0.05)",
        ...style,
      }}
    >
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
            transition: "transform .3s ease",
            transform: hover ? "scale(1.03)" : "scale(1)",
          }}
        />
      </div>

      <div>
        <div
          className="bib-title"
          title={title}
          style={{
            fontSize: 15,
            lineHeight: 1.25,
            marginBottom: 4,
            minHeight: 34,
            color: hover ? "#fff" : "var(--color-text)",
            transition: "color .25s ease",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            className="muted"
            style={{
              fontSize: 13,
              lineHeight: 1.2,
              color: hover ? "#fff" : "var(--gray-600)",
              transition: "color .25s ease",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </Link>
  );
}
