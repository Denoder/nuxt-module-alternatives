import {
    getPackageInfo,
    isPackageExists,
} from 'local-pkg'

export function kebabCase(key: string) {
    const result = key.replace(/([A-Z])/g, ' $1').trim()
    return result.split(' ').join('-').toLowerCase()
}

export async function getPkgVersion(pkgName: string, defaultVersion: string): Promise<string> {
    try {
        const isExist = isPackageExists(pkgName)
        if (isExist) {
            const pkg = await getPackageInfo(pkgName)
            return pkg?.version ?? defaultVersion
        }
        else {
            return defaultVersion
        }
    }
    catch (err) {
        console.error(err)
        return defaultVersion
    }
}