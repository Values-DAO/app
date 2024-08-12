import {
  EAS,
  SchemaEncoder,
  TransactionSigner,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

export const EASContractAddress = "0x4200000000000000000000000000000000000021"; // Base v1.0.1

const eas = new EAS(EASContractAddress);

const chainId = {
  chainId: 8453,
};

const provider =
  ethers.getDefaultProvider("base-sepolia") ||
  new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC as string);
const signer = new ethers.Wallet(
  process.env.NEXT_PUBLIC_PRIVATE_KEY as string,
  provider
); // Private Key for the person who deployed the resolver contract

// using ethers to wagmi hooks here are problematic, best to use ethers or transfer the logic to the react component
// const provider = useProvider(chainId)
// const signer = useSigner(chainId);

/**
 * Creates a new attestation for a receipient address and returns the uid.
 *
 * @param recipient string
 * @param values string[]
 * @returns Promise<string>
 */
export const createAttestation = async (
  recipient: string,
  values: string[],
  desc: string
) => {
  eas.connect(signer as unknown as TransactionSigner);

  // Initialize SchemaEncoder with the schema string
  const schemaEncoder = new SchemaEncoder(
    "string[] values, string description, uint256 timestamp"
  );
  const encodedData = schemaEncoder.encodeData([
    { name: "values", value: values, type: "string[]" },
    { name: "description", value: desc, type: "string" },
    {
      name: "timestamp",
      value: Math.floor(Date.now() / 1000),
      type: "uint256",
    },
  ]);

  const schema = "0xffcc89cd66b714a36c328636735e3bda771adf5eba0e071f8b7f4be6098f7d50";

  const tx = await eas.attest({
    schema,
    data: {
      recipient,
      expirationTime: BigInt(0),
      revocable: true,
      data: encodedData,
    },
  });

  return await tx.wait();
};

/**
 * Returns the attestation data of the given uid.
 *
 * @param uid string
 * @returns Promise<string>
 */
export const getAttestation = async (uid: string) => {
  eas.connect(provider as unknown as any); // EAS has a type checking issue, this follows: https://docs.attest.org/docs/developer-tools/eas-sdk#using-the-eas-sdk

  const attestation = await eas.getAttestation(uid);

  return attestation;
};

/**
 * Revokes the attestation of the given uid.
 *
 * @param uid string
 */
export const revokeAttestation = async (uid: string) => {
  eas.connect(signer as unknown as TransactionSigner);
  const schema = "0xffcc89cd66b714a36c328636735e3bda771adf5eba0e071f8b7f4be6098f7d50";

  const tx = await eas.revoke({
    schema,
    data: {
      uid,
    },
  });

  // Optional: Wait for transaction to be validated
  await tx.wait();
};
