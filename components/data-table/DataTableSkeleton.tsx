'use client';

import React from 'react';
import { Skeleton } from '../primitives/skeleton';
import type { DataTableColumn, DataTableSize } from './DataTable.types';
import { twMerge } from 'tailwind-merge';

interface DataTableRowsSkeletonProps {
  columns: DataTableColumn[];
  rowCount?: number;
  size?: DataTableSize;
  selectable?: boolean;
  hasExpandable?: boolean;
  hasActions?: boolean;
  striped?: boolean;
  animated?: boolean;
}

const sizePaddingMap: Record<DataTableSize, string> = {
  sm: 'py-2 px-3',
  md: 'py-3 px-4',
  lg: 'py-4 px-5',
};

function getShimmerWidth(colIndex: number, rowIndex: number): string {
  const widths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/6', 'w-2/5', 'w-4/5', 'w-3/5', 'w-1/3'];
  const index = (colIndex * 3 + rowIndex * 5) % widths.length;
  return widths[index];
}

function ShimmerCell({
  className,
  delayMs,
}: {
  className?: string;
  delayMs: number;
}) {
  return (
    <div
      className={twMerge('lopes-shimmer-bone rounded-md', className)}
      style={{ ['--shimmer-delay' as string]: `${delayMs}ms` }}
    />
  );
}

export function DataTableRowsSkeleton({
  columns,
  rowCount = 5,
  size = 'md',
  selectable = false,
  hasExpandable = false,
  hasActions = false,
  striped = false,
  animated = false,
}: DataTableRowsSkeletonProps) {
  const padding = sizePaddingMap[size];

  if (animated) {
    return (
      <>
        {Array.from({ length: rowCount }).map((_, rIdx) => (
          <tr
            key={`skeleton-row-animated-${rIdx}`}
            style={{ ['--row-enter-delay' as string]: `${Math.min(rIdx * 32, 320)}ms` }}
            className={twMerge(
              'lopes-skeleton-row-in border-b border-border/50 transition-colors',
              striped && rIdx % 2 === 1 ? 'bg-muted/20' : 'bg-surface',
            )}
          >
            {hasExpandable && (
              <td className={twMerge(padding, 'w-10 text-center')}>
                <ShimmerCell className="h-5 w-5 rounded-md mx-auto" delayMs={rIdx * 55} />
              </td>
            )}

            {selectable && (
              <td className={twMerge(padding, 'w-10 text-center')}>
                <ShimmerCell className="h-4 w-4 rounded-md mx-auto" delayMs={rIdx * 55 + 20} />
              </td>
            )}

            {columns.map((col, cIdx) => {
              const isRight = col.align === 'right';
              const isCenter = col.align === 'center';
              const widthClass = getShimmerWidth(cIdx, rIdx);
              const delayMs = rIdx * 55 + cIdx * 40;

              return (
                <td
                  key={`skeleton-col-${col.key || cIdx}`}
                  className={twMerge(padding, col.className)}
                  style={col.width ? { width: col.width } : undefined}
                >
                  <div
                    className={twMerge(
                      'flex items-center',
                      isRight ? 'justify-end' : isCenter ? 'justify-center' : 'justify-start',
                    )}
                  >
                    <ShimmerCell
                      delayMs={delayMs}
                      className={twMerge(
                        'h-3.5 rounded-full',
                        isCenter ? 'w-1/2' : isRight ? 'w-2/3' : widthClass,
                      )}
                    />
                  </div>
                </td>
              );
            })}

            {hasActions && (
              <td className={twMerge(padding, 'w-20 text-right')}>
                <div className="flex items-center justify-end gap-1.5">
                  <ShimmerCell className="h-6 w-6 rounded-lg" delayMs={rIdx * 55 + columns.length * 40} />
                  <ShimmerCell
                    className="h-6 w-6 rounded-lg hidden sm:inline-block"
                    delayMs={rIdx * 55 + columns.length * 40 + 35}
                  />
                </div>
              </td>
            )}
          </tr>
        ))}
      </>
    );
  }

  return (
    <>
      {Array.from({ length: rowCount }).map((_, rIdx) => (
        <tr
          key={`skeleton-row-${rIdx}`}
          className={twMerge(
            'border-b border-border/50 transition-colors',
            striped && rIdx % 2 === 1 ? 'bg-muted/20' : 'bg-surface',
          )}
        >
          {hasExpandable && (
            <td className={twMerge(padding, 'w-10 text-center')}>
              <Skeleton className="h-5 w-5 rounded-md mx-auto" />
            </td>
          )}

          {selectable && (
            <td className={twMerge(padding, 'w-10 text-center')}>
              <Skeleton className="h-4 w-4 rounded-md mx-auto" />
            </td>
          )}

          {columns.map((col, cIdx) => {
            const isRight = col.align === 'right';
            const isCenter = col.align === 'center';
            const widthClass = getShimmerWidth(cIdx, rIdx);

            return (
              <td
                key={`skeleton-col-${col.key || cIdx}`}
                className={twMerge(padding, col.className)}
                style={col.width ? { width: col.width } : undefined}
              >
                <div
                  className={twMerge(
                    'flex items-center',
                    isRight ? 'justify-end' : isCenter ? 'justify-center' : 'justify-start',
                  )}
                >
                  <Skeleton
                    className={twMerge(
                      'h-3.5 rounded-md',
                      isCenter ? 'w-1/2' : isRight ? 'w-2/3' : widthClass,
                    )}
                  />
                </div>
              </td>
            );
          })}

          {hasActions && (
            <td className={twMerge(padding, 'w-20 text-right')}>
              <div className="flex items-center justify-end gap-1.5">
                <Skeleton className="h-6 w-6 rounded-lg" />
                <Skeleton className="h-6 w-6 rounded-lg hidden sm:inline-block" />
              </div>
            </td>
          )}
        </tr>
      ))}
    </>
  );
}

interface DataTableMobileCardsSkeletonProps {
  cardCount?: number;
  animated?: boolean;
}

export function DataTableMobileCardsSkeleton({
  cardCount = 4,
  animated = false,
}: DataTableMobileCardsSkeletonProps) {
  if (animated) {
    return (
      <div className="divide-y divide-border/80 border-y border-border/80 bg-surface">
        {Array.from({ length: cardCount }).map((_, idx) => (
          <div
            key={`mobile-skeleton-card-animated-${idx}`}
            style={{ ['--row-enter-delay' as string]: `${idx * 45}ms` }}
            className="lopes-skeleton-row-in p-4 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <ShimmerCell className="h-4 w-1/2 rounded-full" delayMs={idx * 70} />
              <ShimmerCell className="h-5 w-16 rounded-full" delayMs={idx * 70 + 40} />
            </div>
            <div className="flex items-center gap-3">
              <ShimmerCell className="h-3 w-1/3 rounded-full" delayMs={idx * 70 + 80} />
              <ShimmerCell className="h-3 w-1/4 rounded-full" delayMs={idx * 70 + 120} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="-mx-4 sm:mx-0 divide-y divide-border/80 border-y border-border/80 bg-surface">
      {Array.from({ length: cardCount }).map((_, idx) => (
        <div key={`mobile-skeleton-card-${idx}`} className="p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-1/2 rounded-md" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface DataTableFullSkeletonProps {
  columnsCount?: number;
  rowCount?: number;
  hasToolbar?: boolean;
  hasTabs?: boolean;
  hasPagination?: boolean;
  className?: string;
}

export function DataTableFullSkeleton({
  columnsCount = 5,
  rowCount = 6,
  hasToolbar = true,
  hasTabs = false,
  hasPagination = true,
  className,
}: DataTableFullSkeletonProps) {
  return (
    <div
      className={twMerge(
        'w-full flex flex-col rounded-2xl border border-border/80 bg-surface shadow-2xs overflow-hidden',
        className,
      )}
    >
      {hasToolbar && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-44 rounded-xl" />
            <Skeleton className="h-8 w-28 rounded-xl" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-32 rounded-xl" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
        </div>
      )}

      {hasTabs && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50 bg-muted/10">
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-7 w-24 rounded-lg" />
          <Skeleton className="h-7 w-16 rounded-lg" />
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border/80 bg-muted/30">
              {Array.from({ length: columnsCount }).map((_, cIdx) => (
                <th key={`head-skeleton-${cIdx}`} scope="col" className="py-3 px-4">
                  <Skeleton className="h-3.5 w-3/4 rounded-md" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-surface">
            {Array.from({ length: rowCount }).map((_, rIdx) => (
              <tr key={`full-row-skeleton-${rIdx}`}>
                {Array.from({ length: columnsCount }).map((_, cIdx) => (
                  <td key={`full-cell-skeleton-${rIdx}-${cIdx}`} className="py-3.5 px-4">
                    <Skeleton
                      className={twMerge('h-3.5 rounded-md', getShimmerWidth(cIdx, rIdx))}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasPagination && (
        <div className="flex items-center justify-between p-3.5 border-t border-border/60 bg-muted/10">
          <Skeleton className="h-4 w-32 rounded-md" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
