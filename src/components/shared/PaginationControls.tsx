"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  rowCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function PaginationControls({
  page,
  pageSize,
  rowCount,
  onPageChange,
  onPageSizeChange
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(rowCount / pageSize));

  const handlePageSizeChange = (newSize: string) => {
    onPageSizeChange(Number(newSize));
    onPageChange(0);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">Rows per page</p>
        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map(size => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm font-medium">
        Page {page + 1} of {totalPages}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
