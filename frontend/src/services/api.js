const API_BASE_URL = 'http://localhost:5000'; // Adjust this port if your backend runs elsewhere

/**
 * Fetches file metadata from the backend using a unique token.
 * @param {string} token - The file identifier from the URL.
 * @returns {Promise<Object>} - The file metadata (name, size, etc.)
 */
export const fetchFileMetadata = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/files/${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            // If the token is invalid or server is down, throw an error
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch metadata');
        }

        return await response.json();
    } catch (error) {
        console.error("Error in fetchFileMetadata:", error);
        throw error;
    }
};

/**
 * Generates the actual download URL for the file.
 * @param {string} token - The file identifier.
 * @returns {string} - The full URL to trigger the download.
 */
export const getDownloadUrl = (token) => {
    return `${API_BASE_URL}/download/${token}`;
};