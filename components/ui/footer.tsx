import Link from "next/link";
import {Button} from "./button";

const Footer = () => {
  return (
    <div className="mt-auto pb-6 flex flex-row gap-4 justify-center">
      <Button asChild variant="link" className="md:text-md">
        <Link href="https://discord.gg/zRbGmWe4xN" target="_blank">
          Discord
        </Link>
      </Button>

      <Button variant="link" asChild className="md:text-md">
        <Link href="https://t.me/PareenL" target="_blank">
          Collab
        </Link>
      </Button>

      <Button variant="link" className="md:text-md" asChild>
        <Link href="https://twitter.com/valuesdao_" target="_blank">
          Twitter
        </Link>
      </Button>
      <Button variant="link" className="md:text-md" asChild>
        <Link href="https://warpcast.com/~/channel/valuesdao" target="_blank">
          Warpcast
        </Link>
      </Button>
    </div>
  );
};

export default Footer;
