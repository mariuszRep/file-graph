const ignoredNames = new Set(['.git', 'node_modules', 'dist', 'build', '.next', 'coverage', '.turbo', '.cache'])

export function shouldIgnorePath(name: string) {
  return ignoredNames.has(name)
}

export const defaultIgnoredNames = [...ignoredNames]
