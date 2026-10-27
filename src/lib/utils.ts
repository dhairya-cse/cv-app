import { readFile, access, mkdir, copyFile } from 'fs/promises';
import path from 'path';
import YAML from 'yaml';

export function mergeObjectsRecursive(defaultConfig: unknown, config: unknown) {
    if (config === null || config === undefined) return defaultConfig;
    if (defaultConfig === null || defaultConfig === undefined) return config;

    const bothAreObjects = isPlainObject(defaultConfig) && isPlainObject(config);

    if (!bothAreObjects) return config;

    Object.keys(config).forEach((key) => {
        const defaultValue = defaultConfig[key];
        const value = config[key];
        defaultConfig[key] = mergeObjectsRecursive(defaultValue, value);
    });

    return defaultConfig;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
    );
}

export async function loadFileContent(filePath: string) {
    filePath = path.join('./data', filePath);
    return await readFile(filePath, 'utf8');
}

export async function loadCvFile(username: string) {
    return await loadFileContent(path.join('profiles', username, 'cv.yaml'));
}

export async function loadConfigFile() {
    return await loadFileContent(path.join('config', 'config.yaml'));
}

export async function cvFileExists(username: string) {
    const fullPath = path.join('./data', 'profiles', username, 'cv.yaml');

    try {
        await access(fullPath);
        return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return false;
    }
}

export async function createNewCv(username: string) {
    const userFolderPath = path.join('./data', 'profiles', username);
    const defaultCvPath = path.join('./data', 'config', 'template-cv.yaml');
    const userCvPath = path.join(userFolderPath, 'cv.yaml');

    try {
        await mkdir(userFolderPath, { recursive: true });
        await copyFile(defaultCvPath, userCvPath);
        console.log(`cv.yaml copied to ${userFolderPath}`);
    } catch (error) {
        console.error('Error creating CV:', error);
    }
}

export function yamlContentToMap(content: string) {
    return YAML.parse(content);
}