/**
 * Sends a GraphQL request to the backend and fetches the response
 * @param query - GraphQL query string
 * @param variables - variables used in the GraphQL query definition
 * @param errorMsg - error message string in case of fetch failure
 * @returns an object having keys data which stores the data returned by the backend against the
 * GraphQL query, and errors which stores the array of error messages while retrieval (if any)
 */
export async function fetchGraphQLResponse(
    query: string,
    variables: { [key: string]: any },
    errorMsg: string
): Promise<{ data: any; errors: any } | undefined> {
    try {
        const response = await fetch('http://localhost:8000/api', {
            method: 'POST',
            body: JSON.stringify({ query, variables }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.status !== 200 && response.status !== 201) {
            throw new Error('HTTP ' + response.status + ': "' + errorMsg + '"');
        }

        const responseJSON = await response.json();
        return { data: responseJSON.data, errors: responseJSON.errors };
    } catch (e) {
        console.error(e);
    }
}
