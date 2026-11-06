import { z } from "zod";
import { colord } from "colord";
import { formatToTitleCase, getLink, getText } from "#lib/utils/render_utils.ts";

const cssColor = z
    .string()
    .trim()
    .refine((v) => colord(v).isValid(), "Expected a valid CSS color")
    .brand<"CssColor">();

const nonEmptyString = z.string().trim().min(1);

const iconClass = z
    .string()
    .regex(/^(fas|far|fab|fa)\s+fa-[\w-]+$/, "Expected a Font Awesome class such as 'fas fa-phone-alt'")
    .brand<"IconClass">();

const fieldName = z
    .string()
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Expected a YAML field name");


const templateString = z
    .string()
    .min(1)
    .refine(
        (value) => {
            const open = (value.match(/\{\{/g) ?? []).length;
            const close = (value.match(/\}\}/g) ?? []).length;
            return open === close;
        },
        { message: "Unbalanced {{ }} template placeholders" },
    );


const contactConfigSchema = z.object({
    icon: iconClass,
    color: cssColor,
    text: z.string().optional()
});

const contactsConfigSchema = z.record(
    fieldName,
    contactConfigSchema,
);

const fieldMapValueSchema = z.union([
    fieldName,
    templateString,
]).optional();

const fieldMapKeySchema = z.enum([
    "title",
    "subtitle",
    "rhsTop",
    "rhsBottom",
    "link",
    "intro",
]);

const fieldMapSchema = z.partialRecord(fieldMapKeySchema, fieldMapValueSchema);
const bulletsColsSchema = z.number().int().min(1).max(3);

const sectionConfigSchema = z.object({
    field_map: fieldMapSchema.optional(),
    bullets_cols: bulletsColsSchema.prefault(1),
    sub_bullets_cols: bulletsColsSchema.prefault(1),
});

export const configSchema = z.object({
    contacts: contactsConfigSchema.optional(),

    sections: z.record(
        fieldName,
        sectionConfigSchema,
    ).optional(),
});

const bulletsSchema = z.union([z.array(nonEmptyString), z.record(fieldName, nonEmptyString)])

const cvContactValue = z.union([z.url(), z.string()])

const cvRawContactsSchema = z.record(
    fieldName,
    cvContactValue
);

const cvSubsectionSchema = z.object({
    subsection_key: fieldName,
    title: nonEmptyString.optional(),
    subtitle: nonEmptyString.optional(),
    rhsTop: nonEmptyString.optional(),
    rhsBottom: nonEmptyString.optional(),
    bullets: bulletsSchema.optional(),
    link: nonEmptyString.optional(),
    intro: nonEmptyString.optional(),
})

const cvRawSubsectionSchema = z.object({
    bullets: bulletsSchema.optional()
}).catchall(nonEmptyString)

const cvSectionSchema = z.object({
    section_key: fieldName,
    title: nonEmptyString.optional(),
    description: nonEmptyString.optional(),
    subsections: z.array(cvSubsectionSchema).optional(),
    bullets: bulletsSchema.optional(),
    bullets_cols: bulletsColsSchema.prefault(1),
}).transform((c) => ({ ...c, title: c.title ?? formatToTitleCase(c.section_key) }));

export const cvContactSchema = z.object({
    contact_key: fieldName,
    value: cvContactValue,
    icon: iconClass.prefault("fas fa-at"),
    color: cssColor.prefault("#333333"),
}).transform((c) => ({ ...c, text: getText(c.contact_key, c.value), link: getLink(c.contact_key, c.value) }));

export const cvSchema = z.object({
    name: nonEmptyString,
    contacts: z.array(cvContactSchema).optional(),
    sections: z.array(cvSectionSchema).optional(),
});


const cvRawSectionSchema = z.object({
    title: nonEmptyString.optional(),
    description: nonEmptyString.optional(),
    subsections: z.record(fieldName, cvRawSubsectionSchema).optional(),
    bullets: bulletsSchema.optional()
});

export const cvRawSchema = z.object({
    name: nonEmptyString,
    contacts: cvRawContactsSchema.optional(),
    sections: z.record(fieldName, cvRawSectionSchema),
});

export const cvConfigSchema = z.object({
    cv: cvSchema,
    config: configSchema,
});

export const cvRawConfigSchema = z.object({
    cv: cvRawSchema,
    config: configSchema,
});

export type CssColor = z.infer<typeof cssColor>;
export type IconClass = z.infer<typeof iconClass>;
export type ContactConfig = z.infer<typeof contactConfigSchema>;
export type ContactsConfig = z.infer<typeof contactsConfigSchema>;
export type Config = z.infer<typeof configSchema>;


export type CvContact = z.infer<typeof cvContactSchema>;
export type CvSubsection = z.infer<typeof cvSubsectionSchema>;
export type CvSection = z.infer<typeof cvSectionSchema>;
export type Cv = z.infer<typeof cvSchema>;
export type CvConfig = z.infer<typeof cvConfigSchema>;

export type CvRawContacts = z.infer<typeof cvRawContactsSchema>;
export type CvRawSubsection = z.infer<typeof cvRawSubsectionSchema>;
export type CvRawSection = z.infer<typeof cvRawSectionSchema>;
export type CvRaw = z.infer<typeof cvRawSchema>;
export type CvRawConfig = z.infer<typeof cvRawConfigSchema>;