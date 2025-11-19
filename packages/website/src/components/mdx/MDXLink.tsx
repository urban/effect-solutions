"use client";

import Link from "next/link";
import { ArrowRight, ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import type { AnchorHTMLAttributes } from "react";
import { useLessonNavSfx } from "@/lib/useLessonNavSfx";
import { cn } from "@/lib/cn";

interface MDXLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
}

export function MDXLink({ children, className, href, ...props }: MDXLinkProps) {
  const { playHoverTone, playTapTone } = useLessonNavSfx();
  const isInternal = (href?.startsWith("/") && !href.startsWith("//")) || href?.startsWith("./");
  const isExternal =
    href?.startsWith("http://") || href?.startsWith("https://");
  const iconClassName = "text-blue-400/60 font-bold";

  const linkClassName = cn(
    "text-blue-400 hover:text-blue-300 no-underline cursor-pointer inline-flex items-center gap-1",
    className,
  );

  if (isInternal && href) {
    return (
      <Link
        href={href}
        className={linkClassName}
        onMouseEnter={playHoverTone}
        onClick={playTapTone}
        {...props}
      >
        {children}
        <ArrowRight size={16} weight="bold" className={iconClassName} />
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={linkClassName}
      onMouseEnter={playHoverTone}
      {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
      {...props}
    >
      {children}
      {isExternal && (
        <ArrowSquareOut size={16} weight="bold" className={iconClassName} />
      )}
    </a>
  );
}
