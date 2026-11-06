export function getLink(contact_type: string, value: string): string {
    if (contact_type == 'phone') {
        return getPhoneLink(value);
    }

    if (contact_type == 'email') {
        return getEmailLink(value);
    }

    else return getWebLink(value);
}

export function getWebLink(url: string): string {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return `https://${url}`;
    }

    return url;
}

export function getEmailLink(email: string) {
    return `mailto:${email}`;
}

export function getPhoneLink(phone: string) {
    return `tel:${cleanPhoneNumber(phone)}`;
}

export function cleanPhoneNumber(phone: string): string {
    return phone
        .trim()
        .replace(/[^\d+]/g, '') // Remove non-numeric characters except '+'
        .replace(/^([^+])/, ''); // Ensure '+' is only valid at the start
}

export function getText(contact_type: string, value: string): string {
    if (contact_type !== 'phone' && contact_type !== 'email') {
        return getLinkWithoutWebPrefix(value);
    }
    return value;
}

export function getLinkWithoutWebPrefix(link: string) {
    return link.trim().replace(/^https?:\/\/(www\.)?/, '');
}

/**
 * converts input key to title case (from snake case or kebab case)
 * @param input 
 * @returns 
 */
export function formatToTitleCase(input: string): string {
    return input
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .replace(/\B\w+/g, (word) => word.toLowerCase());
}