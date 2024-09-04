import connectToDatabase from "@/lib/connect-to-database";
import Users from "@/models/user";
import Values from "@/models/values";
import {NextRequest, NextResponse} from "next/server";
import {v4 as uuidv4} from "uuid";
import {createWalletClient, getAddress, http, isAddress} from "viem";
import {privateKeyToAccount} from "viem/accounts";
import {base, baseSepolia} from "viem/chains";
import axios from "axios";
import {NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS} from "@/constants";
import {getTotalProfileNFTsMintedCount} from "@/lib/get-total-profile-minted-count";
import {AnyError} from "mongodb";
import Communities from "@/models/community";
import {generateEmailHTML, sendMail} from "@/service/email";
const viemWalletClient = createWalletClient({
  chain: process.env.NEXT_PUBLIC_APP_ENV === "prod" ? base : baseSepolia,
  transport: http(),
  account: privateKeyToAccount(
    process.env.ADMIN_WALLET_PRIVATE_KEY as `0x${string}`
  ),
});

export async function POST(req: NextRequest) {
  const {
    fid,
    twitter,
    email,
    profileNftIpfs,
    referrer,
    wallets,
    method,
    userId,
    userDataToUpdate,
    sourceMintedValues,
    communityMint,
    profileMinted,
    profileNft,
  } = await req.json();

  let user;
  if (method !== "create_user" && !userId) {
    return NextResponse.json({
      error: "Please provide userId to update the user",
    });
  }

  await connectToDatabase();
  if (method !== "create_user" && userId) {
    user = await Users.findOne({
      userId,
    });
    if (!user) {
      return NextResponse.json({
        error: "User not found",
      });
    }
  }

  try {
    switch (method) {
      case "create_user":
        if (!fid && !email) {
          return NextResponse.json({
            error: "Please provide either fid or email",
          });
        }
        if (!referrer) {
          return NextResponse.json({
            error:
              "Please provide your app name as referrer in the request body",
          });
        }

        const userExists = await Users.findOne({
          ...(fid && {fid}),
          ...(email && {email}),
        });
        if (userExists) {
          return NextResponse.json({
            error: "User already exists",
          });
        }
        const createdUser = await Users.create({
          userId: `user_${uuidv4()}`,
          ...(fid && {fid}),
          ...(email && {email}),
          ...(twitter && {twitterUsername: twitter.username}),
          ...(twitter && {twitterId: twitter.id}),
          ...(wallets && Array.isArray(wallets) && {wallets}),
          ...(profileMinted && {profileMinted}),
          ...(profileNft && {profileNft}),
          referrer: referrer || "unknown",
        });

        await sendMail(
          `New User`,
          generateEmailHTML({
            action: "NEW_USER",
            ...(fid && {fid}),
            ...(email && {email}),
          })
        );
        return NextResponse.json({
          userId: createdUser.userId,
          ...(createdUser.fid && {fid: createdUser.fid}),
          ...(createdUser.twitterUsername && {
            twitterUsername: createdUser.twitterUsername,
          }),
          ...(createdUser.twitterId && {twitterId: createdUser.twitterId}),
          ...(createdUser.email && {email: createdUser.email}),
          ...(createdUser.wallets && {wallets: createdUser.wallets}),
          wallets: createdUser.wallets,
          profileMinted: createdUser.profileMinted,
          profileNft: createdUser.profileNft,
          balance: createdUser.balance,
          mintedValues: (
            await createdUser.populate({
              path: "mintedValues.value",
              model: "Values",
            })
          ).mintedValues.map((v: any) => ({
            name: v.value.name,
            weightage: v.weightage,
          })),
          generatedValues: createdUser.generatedValues,
          generatedValuesWithWeights: createdUser.generatedValuesWithWeights,
          spectrum: createdUser.spectrum,
          socialValuesMinted: createdUser.socialValuesMinted,
          communitiesMinted: createdUser.communitiesMinted,
        });

      case "update_user":
        const errors = [];
        if (!user) {
          return NextResponse.json({
            error: "User not found",
          });
        }
        if (userDataToUpdate) {
          if (userDataToUpdate.profileMinted) {
            if (typeof userDataToUpdate.profileMinted !== "boolean") {
              errors.push("profileMinted should be a boolean");
            } else user.profileMinted = userDataToUpdate.profileMinted;
          }
          if (userDataToUpdate.profileNft) {
            if (typeof userDataToUpdate.profileNft !== "number") {
              errors.push("profileNft should be a number");
            } else user.profileNft = userDataToUpdate.profileNft;
          }
          if (userDataToUpdate.email) {
            if (typeof userDataToUpdate.email !== "string") {
              errors.push("email should be a string");
            } else user.email = userDataToUpdate.email;
          }
          if (userDataToUpdate.fid) {
            if (typeof userDataToUpdate.fid !== "number") {
              errors.push("fid should be a number");
            } else user.fid = userDataToUpdate.fid;
          }
          if (userDataToUpdate.twitter) {
            if (typeof userDataToUpdate.twitter !== "string") {
              errors.push("twitter should be a string");
            } else user.twitter = userDataToUpdate.twitter;
          }
          if (userDataToUpdate.wallets) {
            if (!Array.isArray(userDataToUpdate.wallets)) {
              errors.push("wallets should be an array");
            } else user.wallets = userDataToUpdate.wallets;
            user.wallets = userDataToUpdate.wallets;
          }
          if (userDataToUpdate.referrer) {
            user.referrer = userDataToUpdate.referrer;
          }
        }
        if (errors.length) {
          return NextResponse.json({error: errors.join(", ")});
        }
        await user.save();
        return NextResponse.json({
          userId: user.userId,
          ...(user.fid && {fid: user.fid}),

          ...(user.twitterUsername && {twitterUsername: user.twitterUsername}),
          ...(user.twitterId && {twitterId: user.twitterId}),
          ...(user.email && {email: user.email}),
          ...(user.wallets && {wallets: user.wallets}),
          wallets: user.wallets,
          profileMinted: user.profileMinted,
          profileNft: user.profileNft,
          balance: user.balance,
          mintedValues: (
            await user.populate({
              path: "mintedValues.value",
              model: "Values",
            })
          ).mintedValues.map((v: any) => ({
            name: v.value.name,
            weightage: v.weightage,
          })),
          generatedValues: user.generatedValues,
          generatedValuesWithWeights: user.generatedValuesWithWeights,
          spectrum: user.spectrum,
          socialValuesMinted: user.socialValuesMinted,
          communitiesMinted: user.communitiesMinted,
        });

      case "mint_values":
        if (!user) {
          return NextResponse.json({
            error: "User not found",
          });
        }
        if (user.wallets.length === 0 || !isAddress(user.wallets[0])) {
          return NextResponse.json({
            error:
              "You have not added any wallets in your profile. Please add a wallet to mint values",
          });
        }

        // expect userDataToUpdate.values === ["valueId1", "valueId2", ...]
        if (!userDataToUpdate || !userDataToUpdate.values) {
          return NextResponse.json({
            error: "Please provide values to mint",
          });
        }
        if (
          !Array.isArray(userDataToUpdate.values) ||
          userDataToUpdate.values.length === 0
        ) {
          return NextResponse.json({
            error: "values should be an array with atleast one value",
          });
        }

        for (const value of userDataToUpdate.values) {
          let valueObjectId: any;
          const valueExists = await Values.findOne({
            name: value.toLowerCase(),
          });
          if (valueExists) {
            if (!valueExists.minters.includes(user._id)) {
              valueExists.minters.push(user._id);
            }
            valueObjectId = valueExists._id;
            await valueExists.save();
          }
          if (!valueExists) {
            const newValue = await Values.create({
              name: value,
              valueId: `value_${uuidv4()}`,
              minters: [user._id],
            });
            valueObjectId = newValue._id;
          }

          if (
            !user.mintedValues.find(
              (mintedValue: any) =>
                mintedValue.value.toString() === valueObjectId.toString()
            )
          ) {
            user.mintedValues.push({
              value: valueObjectId,
              weightage: 1,
            });
          } else {
            const mintedValue = user.mintedValues.find(
              (mintedValue: any) =>
                mintedValue.value.toString() === valueObjectId.toString()
            );
            mintedValue.weightage += 1;
          }
        }

        // need to check if the user has their profile nft minted else mint it here
        let userProfileNftId = user.profileMinted ? user.profileNft : null;
        if (!userProfileNftId) {
          const count = await getTotalProfileNFTsMintedCount();

          userProfileNftId = count;
        }

        const mintedValuesArray = await Promise.all(
          user.mintedValues.map(async (v: any) => {
            const value = await Values.findById(v.value);
            return {
              name: value.name,
              newWeightage: v.weightage,
            };
          })
        );

        if (user.profileMinted) {
          const {
            data: {cid},
          } = await axios.post(`${process.env.NEXT_PUBLIC_HOST}/api/ipfs`, {
            values: mintedValuesArray,
            tokenId: user.profileNft,
          });

          const hash = await viemWalletClient.writeContract({
            abi: NFT_CONTRACT_ABI,
            address: NFT_CONTRACT_ADDRESS,
            functionName: "updateTokenURI",
            args: [user.profileNft, cid],
          });

          user.userTxHashes.push({
            txHash: hash,
            createdAt: new Date(),
          });
        } else {
          const {
            data: {cid},
          } = await axios.post(`${process.env.NEXT_PUBLIC_HOST}/api/ipfs`, {
            values: mintedValuesArray,
            tokenId: userProfileNftId,
          });

          const hash = await viemWalletClient.writeContract({
            abi: NFT_CONTRACT_ABI,
            address: NFT_CONTRACT_ADDRESS,
            functionName: "safeMint",
            args: [user.wallets[0], cid],
          });

          user.userTxHashes.push({
            txHash: hash,
            createdAt: new Date(),
          });
          user.profileMinted = true;
          user.profileNft = userProfileNftId;
        }
        if (sourceMintedValues) {
          user.socialValuesMinted.push(sourceMintedValues);
        }
        if (communityMint) {
          const communityResponse = await Communities.findOneAndUpdate(
            {communityId: communityMint.communityId},
            {$push: {minters: user._id}},
            {new: true}
          );
          user.communitiesMinted.push(communityResponse._id);
        }

        await user.save();
        await sendMail(
          `Values Minted`,
          generateEmailHTML({
            action: "USER_VALUES_MINTED",
            ...(user.fid && {fid: user.fid}),
            ...(user.email && {email: user.email}),
            mintedValues: userDataToUpdate.values.map((v: any) => v),
          })
        );
        return NextResponse.json({
          userId: user.userId,
          ...(user.fid && {fid: user.fid}),
          ...(user.twitterUsername && {twitterUsername: user.twitterUsername}),
          ...(user.twitterId && {twitterId: user.twitterId}),
          ...(user.email && {email: user.email}),
          ...(user.wallets && {wallets: user.wallets}),
          wallets: user.wallets,
          profileMinted: user.profileMinted,
          profileNft: user.profileNft,
          balance: user.balance,
          mintedValues: (
            await user.populate({
              path: "mintedValues.value",
              model: "Values",
            })
          ).mintedValues.map((v: any) => ({
            name: v.value.name,
            weightage: v.weightage,
          })),
          generatedValues: user.generatedValues,
          generatedValuesWithWeights: user.generatedValuesWithWeights,
          spectrum: user.spectrum,
          socialValuesMinted: user.socialValuesMinted,
          communitiesMinted: user.communitiesMinted,
        });

      case "add_wallet":
        if (!user) {
          return NextResponse.json({
            error: "User not found",
          });
        }
        if (!userDataToUpdate || !userDataToUpdate.wallet) {
          return NextResponse.json({
            error: "Please provide wallet to add",
          });
        }

        const addressChecksummed = getAddress(userDataToUpdate.wallet);
        if (user.wallets.includes(addressChecksummed)) {
          return NextResponse.json({
            error: "Wallet already exists",
          });
        }
        if (isAddress(addressChecksummed))
          user.wallets.push(addressChecksummed);
        await user.save();

        return NextResponse.json({
          userId: user.userId,
          ...(user.fid && {fid: user.fid}),
          ...(user.twitterUsername && {twitterUsername: user.twitterUsername}),
          ...(user.twitterId && {twitterId: user.twitterId}),
          ...(user.email && {email: user.email}),
          ...(user.wallets && {wallets: user.wallets}),
          wallets: user.wallets,
          profileMinted: user.profileMinted,
          profileNft: user.profileNft,
          balance: user.balance,
          mintedValues: (
            await user.populate({
              path: "mintedValues.value",
              model: "Values",
            })
          ).mintedValues.map((v: any) => ({
            name: v.value.name,
            weightage: v.weightage,
          })),
          generatedValues: user.generatedValues,
          generatedValuesWithWeights: user.generatedValuesWithWeights,
          spectrum: user.spectrum,
          socialValuesMinted: user.socialValuesMinted,
          communitiesMinted: user.communitiesMinted,
        });

      case "link_twitter":
        if (!user) {
          return NextResponse.json({
            error: "User not found",
          });
        }
        if (user.twitterUsername && user.twitterId) {
          return NextResponse.json({
            error: "User already has a twitter account linked",
          });
        }

        if (
          !userDataToUpdate ||
          !userDataToUpdate.twitterUsername ||
          !userDataToUpdate.twitterId
        ) {
          return NextResponse.json({
            error: "Please provide twitterUsername and twitterId to link",
          });
        }
        user.twitterUsername = userDataToUpdate.twitterUsername;
        user.twitterId = userDataToUpdate.twitterId;
        await user.save();
        return NextResponse.json({
          userId: user.userId,
          ...(user.fid && {fid: user.fid}),
          ...(user.twitterUsername && {
            twitterUsername: user.twitterUsername,
          }),
          ...(user.twitterId && {twitterId: user.twitterId}),
          ...(user.email && {email: user.email}),
          ...(user.wallets && {wallets: user.wallets}),
          wallets: user.wallets,
          profileMinted: user.profileMinted,
          profileNft: user.profileNft,
          balance: user.balance,
          mintedValues: (
            await user.populate({
              path: "mintedValues.value",
              model: "Values",
            })
          ).mintedValues.map((v: any) => ({
            name: v.value.name,
            weightage: v.weightage,
          })),
          generatedValues: user.generatedValues,
          generatedValuesWithWeights: user.generatedValuesWithWeights,
          spectrum: user.spectrum,
          socialValuesMinted: user.socialValuesMinted,
          communitiesMinted: user.communitiesMinted,
        });

      case "link_farcaster":
        if (!user) {
          return NextResponse.json({
            error: "User not found",
          });
        }
        if (user.fid) {
          return NextResponse.json({
            error: "User already has a farcaster account linked",
          });
        }

        if (!userDataToUpdate || !userDataToUpdate.fid) {
          return NextResponse.json({
            error: "Please provide fid to link",
          });
        }
        user.fid = userDataToUpdate.fid;
        await user.save();
        return NextResponse.json({
          userId: user.userId,
          ...(user.fid && {fid: user.fid}),
          ...(user.twitterUsername && {
            twitterUsername: user.twitterUsername,
          }),
          ...(user.twitterId && {twitterId: user.twitterId}),
          ...(user.email && {email: user.email}),
          ...(user.wallets && {wallets: user.wallets}),
          wallets: user.wallets,
          profileMinted: user.profileMinted,
          profileNft: user.profileNft,
          balance: user.balance,
          mintedValues: (
            await user.populate({
              path: "mintedValues.value",
              model: "Values",
            })
          ).mintedValues.map((v: any) => ({
            name: v.value.name,
            weightage: v.weightage,
          })),
          generatedValues: user.generatedValues,
          generatedValuesWithWeights: user.generatedValuesWithWeights,
          spectrum: user.spectrum,
          socialValuesMinted: user.socialValuesMinted,
          communitiesMinted: user.communitiesMinted,
        });
    }

    return NextResponse.json({
      userId: user.userId,
      ...(user.fid && {fid: user.fid}),
      ...(user.twitterUsername && {twitterUsername: user.twitterUsername}),
      ...(user.twitterId && {twitterId: user.twitterId}),
      ...(user.email && {email: user.email}),
      ...(user.wallets && {wallets: user.wallets}),
      wallets: user.wallets,
      profileMinted: user.profileMinted,
      profileNft: user.profileNft,
      balance: user.balance,
      mintedValues: (
        await user.populate({
          path: "mintedValues.value",
          model: "Values",
        })
      ).mintedValues.map((v: any) => ({
        name: v.value.name,
        weightage: v.weightage,
      })),
      generatedValues: user.generatedValues,
      generatedValuesWithWeights: user.generatedValuesWithWeights,
      spectrum: user.spectrum,
      socialValuesMinted: user.socialValuesMinted,
      communitiesMinted: user.communitiesMinted,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return NextResponse.json({error: `${duplicateField} already exists`});
    } else {
      return NextResponse.json(error);
    }
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get("email");
  const fid = searchParams.get("fid");

  if (!email && !fid) {
    return NextResponse.json({
      error: "Please provide either email or fid",
    });
  }
  try {
    await connectToDatabase();
    const user = await Users.findOne({
      ...(email && {email}),
      ...(fid && {fid}),
    });
    if (!user) {
      return NextResponse.json({
        error: "User not found",
      });
    }
    return NextResponse.json({
      userId: user.userId,
      ...(user.fid && {fid: user.fid}),
      ...(user.twitterUsername && {twitterUsername: user.twitterUsername}),
      ...(user.twitterId && {twitterId: user.twitterId}),
      ...(user.email && {email: user.email}),
      ...(user.wallets && {wallets: user.wallets}),
      wallets: user.wallets,
      profileMinted: user.profileMinted,
      profileNft: user.profileNft,
      balance: user.balance,
      mintedValues: (
        await user.populate({
          path: "mintedValues.value",
          model: "Values",
        })
      ).mintedValues.map((v: any) => ({
        name: v.value.name,
        weightage: v.weightage,
      })),
      generatedValues: user.generatedValues,
      generatedValuesWithWeights: user.generatedValuesWithWeights,
      spectrum: user.spectrum,
      socialValuesMinted: user.socialValuesMinted,
      communitiesMinted: user.communitiesMinted,
    });
  } catch (error) {
    return NextResponse.json(error);
  }
}
