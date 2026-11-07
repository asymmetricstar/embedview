"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultFilters = void 0;
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function toDate(value) {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}
function pick(value, field) {
    return String(field)
        .split('.')
        .reduce((current, part) => (current === undefined || current === null ? undefined : current[part]), value);
}
const defaultFilters = {
    random: (min = 0, max = 1) => random(min, max),
    randomBytes: (length = 16) => randomBytesHex(Number(length) || 16),
    uuid: () => generateId(32),
    md5: (data) => md5(String(data)),
    uppercase: (v) => String(v).toUpperCase(),
    lowercase: (v) => String(v).toLowerCase(),
    capitalize: (v) => String(v).charAt(0).toUpperCase() + String(v).slice(1),
    trim: (v) => String(v).trim(),
    truncate: (v, len = 100) => String(v).length > len ? String(v).slice(0, len) + '...' : v,
    truncateWords: (v, count = 20) => {
        const words = String(v).trim().split(/\s+/);
        return words.length > count ? words.slice(0, count).join(' ') + '...' : v;
    },
    slug: (v) => String(v)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    urlencode: (v) => encodeURIComponent(String(v)),
    stripTags: (v) => String(v).replace(/<[^>]*>/g, ''),
    nl2br: (v) => escapeHtml(v).replace(/\r\n|\r|\n/g, '<br>'),
    escape: (v) => escapeHtml(v),
    number: (v, decimals = 0, locale = 'tr-TR') => new Intl.NumberFormat(locale, {
        minimumFractionDigits: Number(decimals) || 0,
        maximumFractionDigits: Number(decimals) || 0
    }).format(Number(v) || 0),
    currency: (v, code = 'TRY', locale = 'tr-TR') => new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(Number(v) || 0),
    percent: (v, decimals = 0, locale = 'tr-TR') => new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: Number(decimals) || 0 }).format(Number(v) || 0),
    date: (v, locale = 'tr-TR') => {
        const date = toDate(v);
        return date ? date.toLocaleDateString(locale) : '';
    },
    time: (v, locale = 'tr-TR') => {
        const date = toDate(v);
        return date ? date.toLocaleTimeString(locale) : '';
    },
    datetime: (v, locale = 'tr-TR') => {
        const date = toDate(v);
        return date ? date.toLocaleString(locale) : '';
    },
    iso: (v) => {
        const date = toDate(v);
        return date ? date.toISOString() : '';
    },
    default: (v, def = '') => v !== undefined && v !== null && v !== '' ? v : def,
    json: (v) => JSON.stringify(v),
    length: (v) => Array.isArray(v) || typeof v === 'string' ? v.length : 0,
    first: (v) => Array.isArray(v) ? v[0] : v,
    last: (v) => Array.isArray(v) ? v[v.length - 1] : v,
    join: (v, sep = ', ') => Array.isArray(v) ? v.join(sep) : v,
    reverse: (v) => Array.isArray(v) ? [...v].reverse() : v,
    sort: (v) => Array.isArray(v) ? [...v].sort() : v,
    keys: (v) => v && typeof v === 'object' ? Object.keys(v) : [],
    values: (v) => v && typeof v === 'object' ? Object.values(v) : [],
    contains: (v, search) => {
        if (typeof v === 'string' || Array.isArray(v))
            return v.includes(search);
        return false;
    },
    limit: (v, count = 10) => Array.isArray(v) ? v.slice(0, Number(count) || 0) : v,
    pluck: (v, field) => Array.isArray(v) ? v.map(item => pick(item, field)) : [],
    where: (v, field, expected) => Array.isArray(v) ? v.filter(item => pick(item, field) === expected) : v,
    sortBy: (v, field, direction = 'asc') => {
        if (!Array.isArray(v))
            return v;
        const sign = String(direction).toLowerCase() === 'desc' ? -1 : 1;
        return [...v].sort((a, b) => {
            const left = pick(a, field);
            const right = pick(b, field);
            if (left === right)
                return 0;
            return (left > right ? 1 : -1) * sign;
        });
    },
    abs: (v) => Math.abs(Number(v)),
    round: (v) => Math.round(Number(v)),
    floor: (v) => Math.floor(Number(v)),
    ceil: (v) => Math.ceil(Number(v))
};
exports.defaultFilters = defaultFilters;
function random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateId(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}
function randomBytesHex(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
function md5(data) {
    const canonical = Buffer.from(data).toString('binary');
    const sl = [1732584193, -271733879, -1732584194, 271733878];
    for (let i = 0; i < canonical.length; i += 64) {
        const words = canonical.slice(i, i + 64).split('').map((c) => c.charCodeAt(0));
        words[16] = (words[16] ?? 0) | 0;
        sl[0] = (sl[0] + words[0]) | 0;
        sl[1] = (sl[1] + words[1]) | 0;
        sl[2] = (sl[2] + words[2]) | 0;
        sl[3] = (sl[3] + words[3]) | 0;
    }
    return '0123456789abcdef'.split('').map((_, i) => {
        const byte = (sl[i >> 2] >> ((i & 3) << 3)) & 0xff;
        return byte.toString(16).padStart(2, '0');
    }).join('');
}
//# sourceMappingURL=filters.js.map