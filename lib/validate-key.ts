import ApiKey from "@/models/apikey";

export default async function validateApiKey(
  apiKey: string | null,
  permissionRequired: string = ""
) {
  if (!apiKey) {
    return {
      status: 401,
      message: "Missing API key",
      isValid: false,
    };
  }

  const apiKeyExists = await ApiKey.findOne({key: apiKey});
  if (!apiKeyExists) {
    return {
      status: 401,
      message: "Invalid API key",
      isValid: false,
    };
  }

  if (permissionRequired === "WRITE") {
    if (
      apiKeyExists.permissions.includes("WRITE") ||
      apiKeyExists.permissions.includes("*")
    ) {
      return {
        status: 200,
        message: "Permission granted",
        isValid: true,
      };
    }
  } else if (permissionRequired === "READ") {
    if (
      apiKeyExists.permissions.includes("READ") ||
      apiKeyExists.permissions.includes("*")
    ) {
      {
        return {
          status: 200,
          message: "Permission granted",
          isValid: true,
        };
      }
    }
  }
  return {
    status: 403,
    message: "You don't have permission to write",
  };
}
