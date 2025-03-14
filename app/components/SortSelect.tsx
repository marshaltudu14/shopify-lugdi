import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortOption } from "@/lib/SortConfig";

interface SortSelectProps {
  value: SortOption;
  onValueChange: (value: SortOption) => void;
}

export default function SortSelect({ value, onValueChange }: SortSelectProps) {
  const handleChange = (newValue: SortOption) => {
    onValueChange(newValue);
  };

  return (
    <div>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="relevance">Relevance</SelectItem>
          <SelectItem value="best-selling">Trending</SelectItem>
          <SelectItem value="new-arrivals">New Arrivals</SelectItem>
          <SelectItem value="price-low-to-high">Price: Low to High</SelectItem>
          <SelectItem value="price-high-to-low">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
