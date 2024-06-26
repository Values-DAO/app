import User, {IUser} from "@/models/user";
import {NextRequest, NextResponse} from "next/server";
import {headers} from "next/headers";
import validateApiKey from "@/lib/validate-key";
import connectToDatabase from "@/lib/connect-to-db";
import axios from "axios";
import {NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS} from "@/constants";
import {createWalletClient, http} from "viem";
import {baseSepolia} from "viem/chains";
import {privateKeyToAccount} from "viem/accounts";
import Value from "@/models/value";
const viemWalletClient = createWalletClient({
  chain: baseSepolia,
  transport: http(),
  account: privateKeyToAccount(
    process.env.NEXT_PUBLIC_ADMIN_WALLET_PRIVATE_KEY as `0x${string}`
  ),
});
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const apiKey = headers().get("x-api-key");
    const {isValid, message, status} = await validateApiKey(apiKey, "WRITE");

    if (!isValid) {
      return NextResponse.json({
        status: status,
        error: message,
      });
    }
    const {
      email,
      method,
      farcaster,
      wallets = [],
      values = [],
      type,
      communityId,
      twitter,
    } = await req.json();
    if (!method) {
      return NextResponse.json({error: "Method is required", status: 400});
    }
    if (!email && !farcaster) {
      return NextResponse.json({
        error: "Email or farcaster is required",
        status: 400,
      });
    }
    let user;
    if (email) {
      user = await User.findOne({email});
    } else if (farcaster) {
      user = await User.findOne({farcaster});
    }

    // Handle different methods
    switch (method) {
      case "create_user":
        if (user) {
          console.log("user exits");
          return NextResponse.json({error: "User already exists", status: 400});
        }

        // do mint the profile nft here
        try {
          let hash: string | undefined = undefined;
          let IPFS_CID: string | undefined = undefined;
          if (wallets.length > 0) {
            const {
              data: {cid},
            } = await axios.post(
              `${process.env.NEXT_PUBLIC_HOST}/api/v2/ipfs`,
              {
                values: [],
                tokenId: (await User.countDocuments()) + 1,
              },
              {
                headers: {
                  "x-api-key": apiKey,
                },
              }
            );
            IPFS_CID = cid;
            hash = await viemWalletClient.writeContract({
              abi: NFT_CONTRACT_ABI,
              address: NFT_CONTRACT_ADDRESS,

              functionName: "safeMint",
              args: [wallets[0], cid],
            });
          }

          const createdUser = await User.create({
            wallets,
            balance: 5,
            ...(email ? {email} : farcaster ? {farcaster} : {}),
            mintedValues: [],
            profileNft: Number(await User.countDocuments()) + 1,
            profileNftHash: hash,
            profileNftIpfs: IPFS_CID,
          });
          return NextResponse.json(createdUser);
        } catch (error) {
          console.error(error);
          return NextResponse.json({
            status: 500,
            error: error || "Internal server error.",
          });
        }
      case "mint_profile":
        if (!user) {
          return NextResponse.json({
            user: null,
            error: "User not found",
            status: 404,
          });
        }

        if (user.profileNftHash) {
          return NextResponse.json({
            user,
            message: "Profile NFT already minted",
            status: 200,
          });
        }
        let hash = "";
        let IPFS_CID = "";
        try {
          if (wallets.length > 0) {
            const {
              data: {cid},
            } = await axios.post(
              `${process.env.NEXT_PUBLIC_HOST}/api/v2/ipfs`,
              {
                values: values.length > 0 ? values : [],
                tokenId: (await User.countDocuments()) + 1,
              },
              {
                headers: {
                  "x-api-key": apiKey,
                },
              }
            );
            IPFS_CID = cid;
            hash = await viemWalletClient.writeContract({
              abi: NFT_CONTRACT_ABI,
              address: NFT_CONTRACT_ADDRESS,

              functionName: "safeMint",
              args: [wallets[0], cid],
            });

            user.profileNftHash = hash;
            user.profileNftIpfs = IPFS_CID;
            user.profileNft = Number(await User.countDocuments()) + 1;
            user.wallet = Array.from(new Set([...user.wallets, ...wallets]));

            await user.save();
            return NextResponse.json({
              user,
              message: "success",
              status: 200,
            });
          }
        } catch (error) {
          console.error(error);
          return NextResponse.json({
            status: 500,
            error: error || "Internal server error.",
          });
        }
      case "update_profile":
        console.log("update_profile");
        if (!user) {
          return NextResponse.json({
            user: null,
            error: "User not found",
            status: 404,
          });
        }
        const allValuesInDB = await Value.find(
          {},
          {
            _id: 0,
            __v: 0,
            createdAt: 0,
            updatedAt: 0,
          }
        );

        const allValues = allValuesInDB.map((value) => value.name);
        console.log("allValues", allValues);
        if (type === "manual" && user.balance < values.length) {
          return NextResponse.json({
            status: 400,
            user,
            message: "Insufficient balance",
          });
        }
        if (
          type === "community" &&
          user.communitiesMinted.includes(communityId)
        ) {
          return NextResponse.json({
            status: 200,
            user,
            message: "Community already minted",
          });
        }
        // values =[{name:"humility", weightage:1}]
        if (values) {
          console.log("values", values);
          for (const value of values) {
            if (!allValues.includes(value.name)) {
              await Value.create({name: value.name});
            }
            const existingValue = user.mintedValues?.find(
              (v: any) => v.value === value.name
            );
            if (existingValue) {
              existingValue.weightage =
                existingValue.weightage + Number(value.weightage);
            } else {
              user.mintedValues.push({
                value: value.name,
                weightage: value.weightage,
              });
            }
          }
          if (type === "manual") user.balance = user.balance - values.length;
          if (type === "community") user.communitiesMinted.push(communityId);
          console.log("user", user);
          const {
            data: {cid},
          } = await axios.post(
            `${process.env.NEXT_PUBLIC_HOST}/api/v2/ipfs`,
            {
              values: user.mintedValues.map((v: any) => ({
                name: v.value,
                newWeightage: v.weightage,
              })),
              tokenId: user.profileNft - 1,
            },
            {
              headers: {
                "x-api-key": apiKey,
              },
            }
          );
          console.log({
            abi: NFT_CONTRACT_ABI,
            address: NFT_CONTRACT_ADDRESS,
            functionName: "updateTokenURI",
            args: [user.profileNft - 1, cid],
          });
          const hash = await viemWalletClient.writeContract({
            abi: NFT_CONTRACT_ABI,
            address: NFT_CONTRACT_ADDRESS,
            functionName: "updateTokenURI",
            args: [user.profileNft - 1, cid],
          });

          user.profileNftHash = hash;
          user.profileNftIpfs = cid;
          await user.save();

          return NextResponse.json({
            user,
            message: "success",
            status: 200,
          });
        } else {
          return NextResponse.json({
            status: 404,
            user: null,
            message: "Values not provided or wrong format.",
          });
        }

      case "update_twitter":
        if (!user) {
          return NextResponse.json({
            user: null,
            error: "User not found",
            status: 404,
          });
        }

        if (twitter) {
          user.twitter = twitter;
          await user.save();

          return NextResponse.json({user, status: 200, message: "Success"});
        } else {
          return NextResponse.json({
            user: null,
            status: 404,
            message: "Twitter not provided",
          });
        }
      case "update_farcaster":
        if (!user) {
          return NextResponse.json({
            user: null,
            error: "User not found",
            status: 404,
          });
        }
        const {fid} = await req.json();
        if (fid) {
          user.farcaster = fid;
          await user.save();

          return NextResponse.json({user, status: 200, message: "Success"});
        } else {
          return NextResponse.json({
            user: null,
            status: 404,
            message: "FID not provided",
          });
        }
      case "update_balance":
        if (!user) {
          return NextResponse.json({
            user: null,
            error: "User not found",
            status: 404,
          });
        }
        const {side} = await req.json();
        if (side) {
          user.balance = side === "plus" ? user.balance + 1 : user.balance - 1;
          await user.save();

          return NextResponse.json({user, status: 200, message: "Success"});
        } else {
          return NextResponse.json({
            user: null,
            status: 404,
            message: "Side not provided",
          });
        }

      case "add_wallet":
        if (!user) {
          return NextResponse.json({
            user: null,
            error: "User not found",
            status: 404,
          });
        }
        const uniqueWallets = new Set(
          wallets.map((w: string) => w.toLowerCase())
        );
        for (const w of uniqueWallets) {
          if (
            !user.wallets.some((wallet: string) => wallet.toLowerCase() === w)
          ) {
            user.wallets.push(w);
          }
        }
        await user.save();
        return NextResponse.json({user, status: 200});
      //   case "update_minted_value":
      //     if (!user) {
      //       return NextResponse.json({
      //         user: null,
      //         error: "User not found",
      //         status: 404,
      //       });
      //     }

      //     const {value, weightage} = await req.json();
      //     const existingValue = mintedValues?.find((v: any) => v.value === value);
      //     if (existingValue) {
      //       existingValue.weightage = Number(weightage);
      //     }

      //     await user.save();
      //     return NextResponse.json({user, status: 200});
      default:
        return NextResponse.json({error: "Invalid method", status: 400});
    }
  } catch (error) {
    return NextResponse.json({
      error: error || "Internal Server Error",
      status: 500,
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const apiKey = headers().get("x-api-key");
    const {isValid, message, status} = await validateApiKey(apiKey, "READ");
    if (!isValid) {
      return NextResponse.json({
        status: status,
        error: message,
      });
    }
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get("email");
    const fid = searchParams.get("fid");

    if (!email && !fid) {
      return NextResponse.json({
        user: null,
        status: 404,
        message: "Provide atleast either of one: Email or FID",
      });
    }

    if (email) {
      const user = await User.findOne({email});
      if (!user) {
        return NextResponse.json({
          message: "User not found",
          status: 404,
          user: null,
        });
      }
      return NextResponse.json({user, status: 200, message: "Success"});
    }
    if (fid) {
      const user = await User.findOne({farcaster: fid});
      if (!user) {
        return NextResponse.json({
          message: "User not found",
          status: 404,
          user: null,
        });
      }
      return NextResponse.json({user, status: 200, message: "Success"});
    }
  } catch (error) {
    return NextResponse.json({
      error: error || "Internal Server Error",
      status: 500,
    });
  }
}
