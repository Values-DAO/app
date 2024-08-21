export const fetchUserTweets = async (twitter_userId: string) => {
  const tweets = [];
  let pagination_token: string | null = null;
  let pageCount = 0; // Initialize a page counter
  try {
    do {
      if (pageCount >= 3) break; // Stop if 10 pages have been fetched
      const queryParam: string = pagination_token
        ? `pagination_token=${pagination_token}`
        : "";
      const response = await fetch(
        `https://api.twitter.com/2/users/${twitter_userId}/tweets?max_results=100&${queryParam}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          },
        }
      );
      if (!response.ok) {
        const {data} = await response.json();
        return {
          error: data.error || "Error fetching user tweets",
        };
      }
      const {data, meta} = await response.json();
      if (data) {
        tweets.push(...data.map((tweet: any) => tweet.text));
      }
      pagination_token = meta.next_token ? meta.next_token : null;
      pageCount++; // Increment the page counter after each successful fetch
    } while (pagination_token);

    return tweets;
  } catch (error) {
    console.error("Error fetching user tweets:", error);
    return {
      error: error || "Error fetching user tweets",
    };
  }
};
