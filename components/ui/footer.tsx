"use client";
import Link from "next/link";
import {Button} from "./button";
import Image from "next/image";

const Footer = () => {
  return (
    <div className="mt-auto pb-6 flex flex-col gap-4 justify-center">
      <div className="flex flex-col md:flex-row gap-2 w-full justify-center">
        <div className="flex flex-row gap-2 justify-center">
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
        </div>
        <div className="flex flex-row gap-2 justify-center">
          <Button variant="link" className="md:text-md" asChild>
            <Link href="https://twitter.com/valuesdao_" target="_blank">
              Follow on Twitter
            </Link>
          </Button>
          <Button variant="link" className="md:text-md" asChild>
            <Link
              href="https://warpcast.com/~/channel/valuesdao"
              target="_blank"
            >
              Follow on Warpcast
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Footer;
