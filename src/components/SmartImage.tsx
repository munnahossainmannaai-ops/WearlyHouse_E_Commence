import { useState } from "react";
import { cx } from "../lib/utils";
import { IconLogo } from "./icons";

/**
 * Image with a shimmer skeleton while loading, a soft fade-in on load,
 * and a branded gradient fallback if the asset fails. Drop-in for <img>.
 */
export default function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  eager,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={cx("relative overflow-hidden bg-panel", className)}>
      {!loaded && !failed && <div className="absolute inset-0 shimmer" aria-hidden />}
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-panel to-abyss">
          <IconLogo size={30} className="text-mist/40" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cx(
            "w-full h-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName
          )}
        />
      )}
    </div>
  );
}
