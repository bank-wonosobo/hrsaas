import { Search } from "lucide-react";

interface Props {
  onSearch: React.FormEventHandler<HTMLFormElement>;
  searchKey: string;
  setKey: (value: string) => void;
}
export default function SearchForm({ onSearch, searchKey, setKey }: Props) {
  return (
    <form onSubmit={onSearch} className="w-full max-w-xl">
      <div className="flex items-center rounded-xl border border-gray-300 px-4 py-3 focus-within:border-gray-400">
        <Search className="h-4 w-4 text-gray-400 mr-2" />
        <input
          placeholder="Search..."
          value={searchKey}
          onChange={(e) => setKey(e.target.value)}
          className="w-full bg-transparent outline-none text-sm"
        />
      </div>
    </form>
  );
}
