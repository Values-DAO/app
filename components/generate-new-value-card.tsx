import {generateImage} from "@/lib/generate-image";
import axios from "axios";
import React from "react";
import {Card} from "./ui/card";
import {Button} from "./ui/button";
import {Textarea} from "./ui/textarea";
import {toast} from "./ui/use-toast";

interface GenerateNewValueCardProps {
  value: string;
  mint({value, key}: {value: any; key: string}): Promise<void>;
}
const GenerateNewValueCard: React.FC<GenerateNewValueCardProps> = ({
  value,
  mint,
}) => {
  const [valuePrompt, setValuePrompt] = React.useState<string>("");
  const [generatedImage, setGeneratedImage] = React.useState<string | null>(
    null
  );
  const [loading, setLoading] = React.useState<{
    loading: boolean;
    text: string;
  }>({
    loading: false,
    text: "",
  });
  const generateImageFromOpenAI = async () => {
    setLoading({
      loading: true,
      text: "Generating image...",
    });
    const image = await generateImage(value, valuePrompt);
    if (image === null) {
      setLoading({loading: false, text: ""});
      toast({
        title: "There was an error generating the image",
        description: "Please try again later",
      });
      return;
    }
    const uploadImageToIPFS = await axios.post(
      "/api/pin",

      {
        imageUrl: image,
        name: value,
      }
    );

    if (uploadImageToIPFS.data.status === 200) {
      setGeneratedImage(
        `https://gateway.pinata.cloud/ipfs/${uploadImageToIPFS.data.cid}`
      );
    } else {
      setGeneratedImage(image);
    }
    setLoading({
      loading: false,
      text: "",
    });
  };

  const mintValue = async () => {
    setLoading({
      loading: true,
      text: "Prep'ing...",
    });

    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          pinataContent: {
            name: value,
            description: valuePrompt,
            image: generatedImage,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status !== 200) {
        throw new Error("Error uploading to IPFS");
        return;
      }
      const valueObject = {
        value: {
          metadata: {
            name: value,
            description: valuePrompt,
            image: generatedImage,
          },
          cid: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        },
        hasMintedValue: false,
      };
      const addNewvalue = await axios.post("/api/value", {
        name: valueObject.value.metadata.name,
        value: valueObject.value,
      });
      setLoading({
        loading: true,
        text: "Minting...",
      });
      await mint({value: valueObject.value, key: value});
      setLoading({
        loading: false,
        text: "",
      });
    } catch (error) {
      console.error("Error minting value:", error);
    }
  };

  return (
    <Card className="p-4 mt-1">
      <p className="font-light text-white/80 mb-2">
        What does {value} mean to you in one line. Be thoughtful. This Value
        will be minted with AI and become the cover for everyone who holds this.
      </p>
      <Textarea
        required
        placeholder="Enter your thoughts here"
        value={valuePrompt}
        onChange={(e) => setValuePrompt(e.target.value)}
      />
      {generatedImage !== null ? (
        <Button
          className="mt-4 w-full cursor-pointer"
          onClick={mintValue}
          disabled={loading.loading}
        >
          {loading.loading ? loading.text : "Mint Value"}
        </Button>
      ) : (
        <Button
          className="mt-4 w-full cursor-pointer"
          onClick={generateImageFromOpenAI}
          disabled={loading.loading}
        >
          {loading.loading ? loading.text : "Generate Image"}
        </Button>
      )}

      {generatedImage ? (
        <div className="mt-4">
          <img src={generatedImage} className="w-full" />
        </div>
      ) : null}
    </Card>
  );
};

export default GenerateNewValueCard;
