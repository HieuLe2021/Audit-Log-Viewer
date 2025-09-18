// This service now handles fetching the token automatically.
let accessToken: string | null = null;
const TOKEN_FETCH_URL = 'https://de210e4bcd22e60591ca8e841aad4b.8e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/1db8c4d15497441287f7c888e8888ed4/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=yJt8b-T8Y5cybSXqjRjD4nziIvXhPV7F0IfNM-aV6Lg';

/**
 * Fetches the authentication token from the Power Automate endpoint
 * and stores it for use in subsequent API calls.
 */
export const fetchAndSetToken = async (): Promise<void> => {
  try {
    const response = await fetch(TOKEN_FETCH_URL, {
      method: 'POST',
      headers: {
        // Per instruction, the request to get a token should be treated as plain text.
        // An empty body with 'application/json' can be ambiguous for some triggers.
        'Content-Type': 'text/plain',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Authentication failed: ${response.status} ${errorText}`);
    }

    // The token is returned as a direct plain text response.
    // Using response.text() directly avoids the JSON parsing error.
    const token = await response.text();
    if (!token) {
        throw new Error("Received an empty token from the authentication endpoint.");
    }
    accessToken = token.trim(); // Trim any whitespace

  } catch (error) {
    console.error("Error fetching access token:", error);
    accessToken = null; // Ensure token is null on failure
    throw error; // Re-throw to be caught by the application's initialization logic
  }
};


export const getAccessToken = (): string | null => {
  return accessToken;
};