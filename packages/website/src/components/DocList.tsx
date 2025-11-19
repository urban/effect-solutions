"use client";

import Link from "next/link";
import { type FocusEvent, useCallback } from "react";
import { useLessonSfxHandlers } from "@/lib/useLessonNavSfx";

interface DocListProps {
  docs: Array<{
    slug: string;
    title: string;
    description?: string;
    draft?: boolean;
  }>;
}

export function DocList({ docs }: DocListProps) {
  const {
    handleHover: playHoverSfx,
    handleClick: playClickSfx,
    handleFocusVisible,
  } = useLessonSfxHandlers();

  const handleMouseEnter = useCallback(() => {
    playHoverSfx();
  }, [playHoverSfx]);

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLAnchorElement>) => {
      if (event.currentTarget.matches(":focus-visible")) {
        handleFocusVisible();
      }
    },
    [handleFocusVisible],
  );

  const handleClick = useCallback(() => {
    playClickSfx();
  }, [playClickSfx]);

  return (
    <section>
      {docs.map((doc) => (
        <div key={doc.slug}>
          <Link
            href={`/${doc.slug}`}
            className="block px-6 py-8 hover:bg-neutral-900/50 cursor-default"
            onClick={handleClick}
            onFocus={handleFocus}
            onMouseEnter={handleMouseEnter}
          >
            <article>
              <div className="flex items-center gap-3">
                <h2 className="text-[1.05rem] font-semibold uppercase leading-snug text-neutral-100">
                  {doc.title}
                </h2>
                {doc.draft && (
                  <span className="px-2 py-0.5 text-xs font-medium uppercase tracking-wide bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    Draft
                  </span>
                )}
              </div>

              {doc.description && (
                <p className="mt-3 text-[1.05rem] leading-relaxed text-neutral-300">
                  {doc.description}
                </p>
              )}
            </article>
          </Link>
          <hr className="border-t border-neutral-800" />
        </div>
      ))}
    </section>
  );
}
