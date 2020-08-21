import { promises } from 'fs';
import { join } from 'path';

export async function writeBuildId(
  distDir: string,
  buildId: string
): Promise<void> {
  const buildIdPath = join(distDir, 'BUILD_ID')
  await promises.writeFile(buildIdPath, buildId, 'utf-8')
}