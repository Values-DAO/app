"use client";

import {useState, useEffect} from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {Input} from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import {usePrivy} from "@privy-io/react-auth";
import {API_BASE_URL} from "@/constants";

interface User {
  userId: string;
  profileMinted: boolean;
  profileNft?: number;
  email?: string;
  fid?: number;
  twitterUsername?: string;
  twitterId?: string;
  wallets: string[];
  generatedValues: {
    twitter: string[];
    warpcast: string[];
  };
  generatedValuesWithWeights: {
    twitter: {[key: string]: number};
    warpcast: {[key: string]: number};
  };
  spectrum: {
    warpcast: Array<{name: string; description: string; score: number}>;
    twitter: Array<{name: string; description: string; score: number}>;
  };
  userContentRemarks: {
    warpcast?: string;
    twitter?: string;
  };
  mintedValues: Array<{value: string; weightage: number}>;
  balance: number;
  userTxHashes: Array<{txHash: string; createdAt: string}>;
  communitiesMinted: string[];
  attestations: string[];
  referrer?: string;
  socialValuesMinted: string[];
  createdAt: string;
  updatedAt: string;
}

export default function UserDataTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("userId");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(false);
  const {authenticated, user} = usePrivy();
  const fetchUsers = async () => {
    if (!authenticated) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/all-users?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&sortField=${sortField}&sortOrder=${sortOrder}&privyId=${
          user?.id.split(":")[2]
        }`
      );
      const data = await response.json();
      if (data.error) {
        console.error("Unauthorized");
        return;
      }
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortOrder]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleSort = (column: string) => {
    if (column === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const renderComplexData = (data: any) => {
    if (Array.isArray(data)) {
      return data.map((item, index) => (
        <div key={index}>{JSON.stringify(item)}</div>
      ));
    } else if (typeof data === "object" && data !== null) {
      return Object.entries(data).map(([key, value]) => {
        if (
          (key === "warpcast" || key === "twitter") &&
          typeof value === "object" &&
          value !== null
        ) {
          return Object.entries(value).map(([k, v]) => {
            if (typeof v === "object" && v !== null && v.name) {
              return (
                <div key={k} className="flex flex-col gap-1 my-1">
                  <strong>
                    {v.name}::{v.score}
                  </strong>

                  {v.description}
                </div>
              );
            }
            return (
              <div key={k}>
                <strong>{k}:</strong> {JSON.stringify(v)}
              </div>
            );
          });
        }
        return (
          <div key={key}>
            <strong>{key}:</strong> {JSON.stringify(value)}
          </div>
        );
      });
    } else {
      return JSON.stringify(data);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Input
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
        className="mb-4"
      />
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {Object.keys(users[0] || {}).map((key) => (
                <TableHead
                  key={key}
                  onClick={() => handleSort(key)}
                  className="cursor-pointer whitespace-nowrap"
                >
                  {key} {sortField === key && (sortOrder === "asc" ? "▲" : "▼")}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={Object.keys(users[0] || {}).length}
                  className="text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.userId}>
                  {Object.entries(user).map(([key, value]) => (
                    <TableCell key={key} className="whitespace-nowrap">
                      {typeof value === "object" || Array.isArray(value)
                        ? renderComplexData(value)
                        : String(value)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || isLoading}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || isLoading}
          >
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Show {itemsPerPage}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {[10, 20, 50, 100].map((number) => (
              <DropdownMenuCheckboxItem
                key={number}
                checked={number === itemsPerPage}
                onCheckedChange={() => {
                  setItemsPerPage(number);
                  setCurrentPage(1);
                }}
              >
                {number} per page
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
