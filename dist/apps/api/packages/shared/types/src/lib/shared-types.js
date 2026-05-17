"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_NOTIFICATION_PREFS = exports.LESSON_STATUS = exports.PRACTICE_SESSION_TYPE = exports.PROFILE_VOCABULARY_PROGRESS_EVENT = exports.VOCABULARY_WORD_STATUS_IDS = exports.VOCABULARY_WORD_STATUS_LABELS = exports.VOCABULARY_WORD_STATUS = exports.USER_ACCOUNT_STATUS_ID_LIST = exports.USER_ACCOUNT_STATUS = exports.TIME_ZONE_ID_LIST = exports.TIME_ZONE = exports.PROFICIENCY_LEVEL_ID_LIST = exports.PROFICIENCY_LEVEL = exports.USER_ROLE_ID_LIST = exports.USER_ROLE = void 0;
exports.getProficiencyLevelById = getProficiencyLevelById;
exports.getTimeZoneById = getTimeZoneById;
exports.formatTimeZoneOptionLabel = formatTimeZoneOptionLabel;
exports.getUserAccountStatusById = getUserAccountStatusById;
exports.vocabularyStatusLabel = vocabularyStatusLabel;
/** Role catalog: each entry has a stable id and a machine-friendly name (slug). */
exports.USER_ROLE = {
    student: { id: 1, name: 'student' },
    teacher: { id: 2, name: 'teacher' },
    admin: { id: 3, name: 'admin' },
    superAdmin: { id: 4, name: 'super-admin' },
};
/** All role ids in stable order (matrix, session, selects). */
exports.USER_ROLE_ID_LIST = [
    exports.USER_ROLE.student.id,
    exports.USER_ROLE.teacher.id,
    exports.USER_ROLE.admin.id,
    exports.USER_ROLE.superAdmin.id,
];
/** CEFR-style proficiency levels (users, lessons catalog, etc.). */
exports.PROFICIENCY_LEVEL = {
    a1: { id: 1, code: 'A1', label: 'Beginner' },
    a2: { id: 2, code: 'A2', label: 'Elementary' },
    b1: { id: 3, code: 'B1', label: 'Intermediate' },
    b2: { id: 4, code: 'B2', label: 'Upper intermediate' },
    c1: { id: 5, code: 'C1', label: 'Advanced' },
    c2: { id: 6, code: 'C2', label: 'Proficient' },
};
exports.PROFICIENCY_LEVEL_ID_LIST = [
    exports.PROFICIENCY_LEVEL.a1.id,
    exports.PROFICIENCY_LEVEL.a2.id,
    exports.PROFICIENCY_LEVEL.b1.id,
    exports.PROFICIENCY_LEVEL.b2.id,
    exports.PROFICIENCY_LEVEL.c1.id,
    exports.PROFICIENCY_LEVEL.c2.id,
];
function getProficiencyLevelById(id) {
    for (const key of Object.keys(exports.PROFICIENCY_LEVEL)) {
        const entry = exports.PROFICIENCY_LEVEL[key];
        if (entry.id === id)
            return entry;
    }
    return undefined;
}
/** IANA zones for calendar math; labels use country + capital for stable UX copy. */
exports.TIME_ZONE = {
    kyiv: { id: 1, iana: 'Europe/Kyiv', country: 'Ukraine', capital: 'Kyiv' },
    warsaw: { id: 2, iana: 'Europe/Warsaw', country: 'Poland', capital: 'Warsaw' },
    london: { id: 3, iana: 'Europe/London', country: 'United Kingdom', capital: 'London' },
    newYork: { id: 4, iana: 'America/New_York', country: 'United States', capital: 'New York' },
    tokyo: { id: 5, iana: 'Asia/Tokyo', country: 'Japan', capital: 'Tokyo' },
};
exports.TIME_ZONE_ID_LIST = [
    exports.TIME_ZONE.kyiv.id,
    exports.TIME_ZONE.warsaw.id,
    exports.TIME_ZONE.london.id,
    exports.TIME_ZONE.newYork.id,
    exports.TIME_ZONE.tokyo.id,
];
function getTimeZoneById(id) {
    for (const key of Object.keys(exports.TIME_ZONE)) {
        const entry = exports.TIME_ZONE[key];
        if (entry.id === id)
            return entry;
    }
    return undefined;
}
function formatTimeZoneOptionLabel(entry) {
    return `${entry.country} — ${entry.capital} (${entry.iana})`;
}
/** Student / account roster status (active, paused, left, blocked). */
exports.USER_ACCOUNT_STATUS = {
    active: { id: 1, name: 'active' },
    paused: { id: 2, name: 'paused' },
    leaved: { id: 3, name: 'leaved' },
    blocked: { id: 4, name: 'blocked' },
};
exports.USER_ACCOUNT_STATUS_ID_LIST = [
    exports.USER_ACCOUNT_STATUS.active.id,
    exports.USER_ACCOUNT_STATUS.paused.id,
    exports.USER_ACCOUNT_STATUS.leaved.id,
    exports.USER_ACCOUNT_STATUS.blocked.id,
];
function getUserAccountStatusById(id) {
    for (const key of Object.keys(exports.USER_ACCOUNT_STATUS)) {
        const entry = exports.USER_ACCOUNT_STATUS[key];
        if (entry.id === id)
            return entry;
    }
    return undefined;
}
/** Stable numeric ids + labels for per-word progress. */
exports.VOCABULARY_WORD_STATUS = {
    new: { id: 1, name: 'new', label: 'New' },
    repeated: { id: 2, name: 'repeated', label: 'Repeated' },
    mistakesWork: { id: 3, name: 'mistakes_work', label: 'Review' },
    learned: { id: 4, name: 'learned', label: 'Learned' },
};
exports.VOCABULARY_WORD_STATUS_LABELS = {
    new: exports.VOCABULARY_WORD_STATUS.new.label,
    repeated: exports.VOCABULARY_WORD_STATUS.repeated.label,
    mistakes_work: exports.VOCABULARY_WORD_STATUS.mistakesWork.label,
    learned: exports.VOCABULARY_WORD_STATUS.learned.label,
};
function vocabularyStatusLabel(status) {
    return exports.VOCABULARY_WORD_STATUS_LABELS[status] ?? status.replace(/_/g, ' ');
}
exports.VOCABULARY_WORD_STATUS_IDS = {
    new: exports.VOCABULARY_WORD_STATUS.new.id,
    repeated: exports.VOCABULARY_WORD_STATUS.repeated.id,
    mistakesWork: exports.VOCABULARY_WORD_STATUS.mistakesWork.id,
    learned: exports.VOCABULARY_WORD_STATUS.learned.id,
};
exports.PROFILE_VOCABULARY_PROGRESS_EVENT = {
    created: { id: 1, name: 'created' },
    statusChanged: { id: 2, name: 'status_changed' },
};
exports.PRACTICE_SESSION_TYPE = {
    vocabulary: { id: 1, name: 'vocabulary' },
    quiz: { id: 2, name: 'quiz' },
    speaking: { id: 3, name: 'speaking' },
    games: { id: 4, name: 'games' },
    challenges: { id: 5, name: 'challenges' },
    lesson: { id: 6, name: 'lesson' },
};
exports.LESSON_STATUS = {
    planned: { id: 1, name: 'planned' },
    completed: { id: 2, name: 'completed' },
    cancelled: { id: 3, name: 'cancelled' },
};
exports.DEFAULT_NOTIFICATION_PREFS = {
    lessonReminder: true,
    streakAlert: true,
    weeklyReport: true,
    newVocab: false,
    teacherMessages: true,
};
//# sourceMappingURL=shared-types.js.map