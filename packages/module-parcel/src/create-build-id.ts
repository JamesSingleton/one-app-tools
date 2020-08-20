export async function createBuildId(
  generate: () => string | null,
  fallback: () => string
): Promise<string> {
  let buildId = await generate()

  // Fallback if no buildId
  if (buildId === null) {
    while (!buildId) {
      buildId = fallback()
    }
  }
  if (typeof buildId !== 'string') {
    throw new Error(
      'createBuildId did not return a string'
    )
  }

  return buildId.trim()
}