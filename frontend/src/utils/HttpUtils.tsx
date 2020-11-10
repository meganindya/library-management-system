export async function fetchGraphQLResponse(
  query: string,
  variables: {},
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
