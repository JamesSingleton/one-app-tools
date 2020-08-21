import chalk from 'chalk'
import path from 'path'

export async function verifyTypeScriptSetup(
  dir: string,
  pagesDir: string,
  typeCheckPreflight: boolean
): Promise<TypeCheckResult | boolean> {
  const tsConfigPath = path.join(dir, 'tsconfig.json')

  try {
    const intent = await getTypeScriptIntent(dir, pagesDir)
    if(!intent) {
      return false
    }

    const firstTimeSetup = intent.firstTimeSetup;

    const deps: NecessaryDependencies = await hasNecessaryDependencies(dir)

    const ts = (await import(
      deps.resolvedTypeScript
    )) as typeof import('typescript')

    await writeConfigurationDefaults(ts, tsConfigPath, firstTimeSetup)
    await writeAppTypeDeclarations(dir)

    if (typeCheckPreflight) {
      return await runTypeCheck(ts, dir, tsConfigPath)
    }
    return true
  } catch(err) {
    if (err instanceof TypeScriptCompileError) {
      console.error(chalk.red('Failed to compile.\n'))
      console.error(err.message)
      process.exit(1)
    } else if (err instanceof FatalTypeScriptError) {
      console.error(err.message)
      process.exit(1)
    }
    throw err
  }
}