import { readFile, access, mkdir, copyFile } from 'fs/promises';
import path from 'path';
import YAML from 'yaml';
import { configSchema, cvConfigSchema, cvRawConfigSchema, cvSchema, type Config, type Cv, type CvConfig, type CvRaw, type CvRawSubsection, type CvSubsection } from '../types/cv-schema';

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

//TODO: refactor this to validate and render Cv. This might remove the need of config by modifying the resume object
// therefore only Cv needs to be rendered. 
export async function getRenderedCvAndConfig(profile: string): Promise<Cv> {
    const cvFile = await loadCvFile(profile);
    const cvFileContent = cvRawConfigSchema.parse(yamlContentToMap(cvFile));
    const configContent = yamlContentToMap(await loadConfigFile());
    const config = configSchema.parse(configContent['config']);
    mergeObjectsRecursive(config, cvFileContent['config']);
    return renderCv(cvFileContent['cv'], config);
}

// add to the imports: type CvSubsection
type SectionConfig = NonNullable<Config['sections']>[string];
type FieldMap = NonNullable<SectionConfig['field_map']>;

const FIELD_KEYS = ['title', 'subtitle', 'rhsTop', 'rhsBottom', 'link', 'intro'] as const satisfies readonly (keyof FieldMap)[];
const PLACEHOLDER = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

// "{{start}} - {{end}}" -> "2020 - 2023". Returns undefined if no placeholder resolved.
function renderTemplate(template: string, fields: Record<string, string>): string {
    let resolved = 0;
    const output = template
        .replace(PLACEHOLDER, (_, name: string) => {
            const value = fields[name];
            if (value === undefined) return '';
            resolved++;
            return value;
        })
        .trim();

    return resolved > 0 ? output : '';
}

function resolveField(
    fields: Record<string, string>,
    mapping: string | undefined,
    targetKey: string,
): string {
    const source = mapping ?? targetKey;

    return source.includes('{{')
        ? renderTemplate(source, fields)
        : fields[source];
}

function renderSubsection(
    key: string,
    subSection: CvRawSubsection,
    fieldMap: FieldMap,
): CvSubsection {
    const { bullets, ...fields } = subSection;

    const mapped = Object.fromEntries(
        FIELD_KEYS.map((k) => [k, resolveField(fields, fieldMap[k], k)]),
    );

    return {
        subsection_key: key,
        ...mapped,
        bullets: bullets as CvSubsection['bullets'],
    };
}

export function renderCv(cv: CvRaw, config: Config): Cv {
    const contacts = cv.contacts
        ? Object.entries(cv.contacts).map(([key, value]) => {
            const contactConfig = config.contacts?.[key];
            return {
                contact_key: key,
                value,
                icon: contactConfig?.icon,
                color: contactConfig?.color,
            };
        })
        : undefined;

    const sections = Object.entries(cv.sections).map(([key, section]) => {
        const sectionConfig = config.sections?.[key];
        const fieldMap = sectionConfig?.field_map ?? {};

        return {
            section_key: key,
            title: section.title, // schema falls back to the title-cased key
            description: section.description,
            bullets: section.bullets,
            bullets_cols: sectionConfig?.bullets_cols,
            subsections: section.subsections
                ? Object.entries(section.subsections).map(([subKey, sub]) =>
                    renderSubsection(subKey, sub, fieldMap),
                )
                : undefined,
        };
    });

    // Final validation + defaults (icon, color, bullets_cols, title) + contact text/link transforms
    return cvSchema.parse({ name: cv.name, contacts, sections });
}