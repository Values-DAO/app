"use client";
import Link from "next/link";
import {Button} from "./button";

const Footer = () => {
  return (
    <div className="mt-auto mb-2">
      <div className="flex flex-row gap-2 w-full justify-center">
        <Button asChild variant="link" className="md:text-md">
          <Link href="https://discord.gg/bdGJsAh2" target="_blank">
            Join Discord
          </Link>
        </Button>
        <Button variant="link" asChild className="md:text-md">
          <Link href="https://t.me/PareenL" target="_blank">
            Collab
          </Link>
        </Button>
        <Button variant="link" className="md:text-md" asChild>
          <Link href="http://twitter.com/valuesdao_" target="_blank">
            Follow on Twitter
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Footer;
