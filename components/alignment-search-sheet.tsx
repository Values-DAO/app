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
import {Loader, MessageCircleWarning, X} from "lucide-react";
import {useState, useRef} from "react";
import {Badge} from "./ui/badge";
import useValuesHook from "@/hooks/useValuesHook";

export function AlignmentSearchSheet({
                                       buttonVariant,
                                       buttonText,
                                     }: {
  buttonVariant?: "default" | "outline" | "secondary";
  buttonText?: string;
}) {
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [targetUsernameInput, setTargetUsernameInput] = useState<string>("");
  const [user, setUser] = useState<{username: string; fid: string} | null>(null);
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
      `${process.env.NEXT_PUBLIC_HOST}/user-alignment?viewer=${user.username}&target=${targetUser.username}`
    );
  };
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={buttonVariant || "default"} className="w-full">
          {buttonText || "Check with a different user"}
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
  selected: { username: string; fid: string } | null;
  setSelected: (value: { username: string; fid: string } | null) => void;
}) {
  const [searchResults, setSearchResults] = useState<{ username: string; fid: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { searchAllUsers } = useValuesHook();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const searchUser = async (username: string) => {
    if (!username || username.length < 1) return;
    setLoading(true)

    const response = await searchAllUsers({ username });

    if ("error" in response) {
      console.error(response.error);
      setLoading(false);
      return;
    }

    console.log(response)

    setSearchResults(response);
    setLoading(false)
  }

  const handleInputChange = (username: string) => {
    onChange(username);
    if (debounceTimer.current) { // if there is a pending debounce timer, clear it
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => { // and start a new one for 300ms after which the searchUser function will be called
      searchUser(username);
    }, 150);
  };

  return (
    <div className="flex flex-col gap-2 mb-4">
      <Label htmlFor="username" className="text-sm font-medium text-black">
        {labelText}
      </Label>
      {selected && (
        <Badge
          className="inline-flex items-center gap-2 py-1 px-2 bg-gray-100 text-black border border-gray-300 rounded-lg"
          style={{ maxWidth: "fit-content" }}
        >
          {selected.username} (fid:{selected.fid})
          <X
            onClick={() => setSelected(null)}
            className="hover:text-gray-600 cursor-pointer"
            size={16}
          />
        </Badge>
      )}
      <Input
        onChange={(e) => handleInputChange(e.target.value)}
        value={value}
        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-yellow-500"
        disabled={selected !== null}
        placeholder="Type username..."
      />
      {(searchResults.length > 0 || loading) && !selected && (
        <div
          className="border border-gray-300 bg-white rounded-b-lg overflow-hidden shadow-md mt-[-1px] transition-all duration-300 ease-in-out"
          style={{
            maxHeight: loading ? "3rem" : `${Math.min(searchResults.length * 3.5, 15)}rem`,
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <Loader className="animate-spin text-gray-500" size={20} />
              <p className="ml-2 text-black">Loading...</p>
            </div>
          ) : (
            searchResults.map((result) => (
              <div
                key={result.fid}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out"
                onClick={() => {
                  setSelected({ username: result.username, fid: result.fid });
                  setSearchResults([]);
                }}
              >
                <p className="text-black font-medium">{result.username}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default UserPicker;