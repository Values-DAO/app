import {
  EAS,
  SchemaRegistry,
  TransactionSigner,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

const provider =
  ethers.getDefaultProvider("base") ||
  new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC as string);
const signer = new ethers.Wallet(
  process.env.NEXT_PUBLIC_PRIVATE_KEY as string,
  provider
); // Private Key for the person who deployed the resolver contract

// using ethers to wagmi hooks here are problematic, best to use ethers or transfer the logic to the react component
// const provider = useProvider(chainId)
// const signer = useSigner(chainId);

/**
 * Registers a new schema and returns the schema uid.
 * using wagmi won't also work for registering schema except you create an admin func on the client-side
 *
 * @returns Promise<string>
 */
const registerSchema = async () => {
  const schemaRegistryContractAddress =
    "0x4200000000000000000000000000000000000020"; // Base v1.0.1
  const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);

  schemaRegistry.connect(signer as unknown as TransactionSigner);

  const schema = "string[] values, string description, uint256 timestamp";
  const resolverAddress = "0xschema_resolver_address";
  const revocable = true;

  const tx = await schemaRegistry.register({
    schema,
    resolverAddress,
    revocable,
  });

  return await tx.wait();
};

const getSchemaInfo = async () => {
  const schemaRegistryContractAddress =
    "0x4200000000000000000000000000000000000020"; // Base v1.0.1
  const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);

  schemaRegistry.connect(provider as unknown as any); // EAS has a type checking issue, this follows: https://docs.attest.org/docs/developer-tools/eas-sdk#using-the-eas-sdk
  const schemaUID = "0xschema_resolver_address"; // Gotten after schema registration

  const schemaRecord = await schemaRegistry.getSchema({ uid: schemaUID });
  console.log(schemaRecord)

  return schemaRecord;
};

async function main() {
  try {
    const uid = await registerSchema();
    console.log(uid);
    // ... further actions after successful registration
  } catch (error) {
    console.error("Error registering schema:", error);
    // ... error handling
  }
}

main();
