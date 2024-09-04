import {Button} from "./button";

const LinkWalletComponent = ({linkWallet}: {linkWallet: () => void}) => {
  return (
    <div className="my-4 border-2 px-2 border-yellow-400 py-4 flex flex-col gap-4 rounded-lg">
      <p className="text-lg font-medium">
        You haven't linked your wallet yet, link your wallet to mint Values.
      </p>
      <Button onClick={linkWallet} className="w-full">
        Link Wallet
      </Button>
    </div>
  );
};

export default LinkWalletComponent;
