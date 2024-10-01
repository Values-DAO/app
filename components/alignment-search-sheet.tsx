import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {MessageCircleWarning, X} from "lucide-react";
import {useState} from "react";
import {Badge} from "./ui/badge";
import useValuesHook from "@/hooks/useValuesHook";

export function AlignmentSearchSheet() {
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [targetUsernameInput, setTargetUsernameInput] = useState<string>("");
  const [user, setUser] = useState<{username: string; fid: string} | null>(
    null
  );
  const [targetUser, setTargetUser] = useState<{
    username: string;
    fid: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!user?.fid || !targetUser?.fid) {
      console.error("Please select a user to compare with.");
      setError("Please select a user to compare with.");
      return;
    }

    window.location.replace(
      `${process.env.NEXT_PUBLIC_HOST}/u/${targetUser.fid}?viewer=${user.fid}`
    );
  };
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="default" className="">
          Check with a different user
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>|| Aligned</SheetTitle>
          <SheetDescription>
            Search for a user to see how aligned you are with them.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 pt-12 pb-4">
          <UserPicker
            labelText="Your Warpcast username"
            value={usernameInput}
            onChange={setUsernameInput}
            selected={user}
            setSelected={setUser}
          />
          <UserPicker
            labelText="Username that you want to check with"
            value={targetUsernameInput}
            onChange={setTargetUsernameInput}
            selected={targetUser}
            setSelected={setTargetUser}
          />
        </div>
        <SheetFooter>
          {error && (
            <Alert variant="destructive" className="my-2">
              <MessageCircleWarning className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button onClick={handleSubmit}>Show me</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function UserPicker({
  labelText,
  value,
  onChange,
  selected,
  setSelected,
}: {
  labelText: string;
  value: string;
  onChange: (value: string) => void;
  selected: {username: string; fid: string} | null;
  setSelected: (value: {username: string; fid: string} | null) => void;
}) {
  const [searchResults, setSearchResults] = useState<
    {username: string; fid: string}[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const {searchFarcasterUser} = useValuesHook();
  const searchUser = async (username: string) => {
    if (!username || username.length < 1) return;
    setLoading(true);
    const response = await searchFarcasterUser({username});
    if ("error" in response) {
      console.error(response.error);
      return;
    }

    setSearchResults(response);
    setLoading(false);
  };
  return (
    <div className="flex flex-col">
      <Label htmlFor="username" className="mb-2">
        {labelText}
      </Label>
      {selected && setSelected && (
        <div className="flex flex-row gap-1 ">
          <Badge className="mb-2 w-fit">
            <p>
              {selected.username} (fid:{selected.fid})
            </p>
            <X
              onClick={() => {
                setSelected(null);
              }}
              size={"14px"}
              className="hover:cursor-pointer ml-1"
            />
          </Badge>
        </div>
      )}
      <Input
        onChange={(e) => {
          onChange(e.target.value);
          searchUser(e.target.value);
        }}
        value={value}
        className="col-span-3"
        disabled={selected !== null}
      />
      {(searchResults.length > 0 || loading) && (
        <div className="border-[1px] rounded-md">
          {loading && (
            <div className="px-2 py-1 bg-white border-[0.5px] border-gray-200 text-green-300">
              <p>Loading...</p>
            </div>
          )}
          {searchResults.map((result) => {
            return (
              <div
                key={result.fid}
                className="px-2 py-1 bg-gray-100 border-[0.5px] border-gray-200 hover:cursor-pointer"
                onClick={() => {
                  setSelected({username: result.username, fid: result.fid});

                  setSearchResults([]);
                }}
              >
                <p>{result.username}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
