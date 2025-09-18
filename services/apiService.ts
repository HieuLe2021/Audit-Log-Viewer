import { getAccessToken } from './authService';

/**
 * A wrapper around the native fetch API that conditionally adds
 * the Authorization header for authenticated API calls.
 * @param url The URL to fetch.
 * @param options The fetch options.
 * @returns A Promise that resolves to the Response.
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});

  // Common headers for API calls
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');
  
  const isDynamicsApiCall = url.includes('.dynamics.com/');

  // The Authorization header should only be added for calls to the Dynamics API.
  // The Power Automate flow uses its own SAS token authentication via the URL.
  if (token && isDynamicsApiCall) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  // Add Dynamics-specific OData headers only for direct calls to the Dynamics Web API
  if (isDynamicsApiCall) {
    headers.append('OData-MaxVersion', '4.0');
    headers.append('OData-Version', '4.0');
    headers.append('Prefer', 'odata.include-annotations="*"');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let messageFromServer = response.statusText;

    if (errorText) {
        try {
            const errorJson = JSON.parse(errorText);
            messageFromServer = errorJson.message || (errorJson.error && errorJson.error.message) || errorText;
        } catch (e) {
            messageFromServer = errorText; // Not JSON
        }
    }
    
    console.error('API Error:', { status: response.status, message: messageFromServer });
    throw new Error(
      `API call to ${url} failed with status ${response.status}: ${messageFromServer}`
    );
  }


  return response;
};
