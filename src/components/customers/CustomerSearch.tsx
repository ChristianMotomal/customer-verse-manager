
import { Search, FilterX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CustomerSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const CustomerSearch = ({ searchQuery, setSearchQuery }: CustomerSearchProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div className="flex-1 relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setSearchQuery("")}>
          <FilterX className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
