"use client"

import React from "react"
import { sizeCharts } from "@/lib/sizeCharts"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ProductSizeChartProps {
  productType: string
  countryCode: string
  selectedSize: string | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductSizeChart({
  productType,
  countryCode,
  selectedSize,
  open,
  onOpenChange,
}: ProductSizeChartProps) {
  const countryCharts = sizeCharts[countryCode]
  const chart = countryCharts ? countryCharts[productType] : undefined

  if (!chart) {
    return null
  }

  const selectedEntry = chart.sizes.find((s) => s.size === selectedSize)

  return (
    <>
      {selectedEntry && (
        <div className="border rounded-md p-4 mt-4">
          <h3 className="font-semibold mb-2">Selected Size Details</h3>
          <div className="flex gap-6">
            <div>
              <span className="font-medium">Size:</span> {selectedEntry.size}
            </div>
            <div>
              <span className="font-medium">Chest (Inch):</span> {selectedEntry.chestInch}
            </div>
            <div>
              <span className="font-medium">Length (Inch):</span> {selectedEntry.lengthInch}
            </div>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{chart.title}</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                <TableHead>Chest (Inch)</TableHead>
                <TableHead>Length (Inch)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chart.sizes.map((entry) => (
                <TableRow key={entry.size}>
                  <TableCell>{entry.size}</TableCell>
                  <TableCell>{entry.chestInch}</TableCell>
                  <TableCell>{entry.lengthInch}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ProductSizeChart
