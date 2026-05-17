"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_COOKIE = exports.ACCESS_COOKIE = exports.AuthModule = exports.DashboardController = exports.AdminStudentsController = exports.LanguagesController = exports.UsersController = exports.AdminUsersController = exports.AuthController = exports.AuthService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const data_access_prisma_1 = require("../../../../data-access/data-access-prisma/src/index.js");
const bcrypt = tslib_1.__importStar(require("bcryptjs"));
const jwt = tslib_1.__importStar(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const current_user_1 = require("./current-user");
const auth_guard_1 = require("./auth.guard");
const gql_auth_guard_1 = require("./gql-auth.guard");
const module_mail_1 = require("../../../module-mail/src/index.js");
const daily_goals_service_1 = require("./daily-goals.service");
const dashboard_service_1 = require("./dashboard.service");
const practice_sessions_service_1 = require("./practice-sessions.service");
const languages_service_1 = require("./languages.service");
const students_admin_service_1 = require("./students-admin.service");
const users_service_1 = require("./users.service");
const auth_session_service_1 = require("./auth-session.service");
const auth_cookies_1 = require("./auth-cookies");
const facebook_oauth_1 = require("./facebook-oauth");
const oauth_link_redirect_1 = require("./oauth-link-redirect");
const telegram_1 = require("../../../module-notifications/src/lib/telegram-bot.client.js");
const delete_admin_user_1 = require("./delete-admin-user");
const link_telegram_account_1 = require("./link-telegram-account");
const telegram_link_service_1 = require("./telegram-link.service");
const telegram_auth_1 = require("./telegram-auth");
function getGoogleClient() {
    const clientId = process.env['GOOGLE_CLIENT_ID'];
    const clientSecret = process.env['GOOGLE_CLIENT_SECRET'];
    const callbackUrl = process.env['GOOGLE_CALLBACK_URL'] ?? 'http://localhost:3000/api/auth/google/callback';
    if (!clientId || !clientSecret)
        return null;
    return new google_auth_library_1.OAuth2Client({ clientId, clientSecret, redirectUri: callbackUrl });
}
const GOOGLE_OAUTH_SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar.events',
];
function buildGoogleAuthUrl() {
    const client = getGoogleClient();
    if (!client) {
        throw new common_1.BadRequestException('Google OAuth is not configured on the server');
    }
    return client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: GOOGLE_OAUTH_SCOPES,
    });
}
function mapUserToDto(user) {
    return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role.toLowerCase(),
        status: user.status.toLowerCase(),
        proficiencyLevel: user.proficiencyLevel ?? null,
        timezone: user.timezone,
        teacherId: user.teacherId,
        hasPassword: Boolean(user.passwordHash),
        linkedProviders: (user.oauthAccounts ?? []).map((account) => account.provider.toLowerCase()),
    };
}
const PROFICIENCY_LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const ACCOUNT_STATUSES = new Set(['ACTIVE', 'PAUSED', 'LEAVED', 'BLOCKED']);
let AuthService = class AuthService {
    constructor(prisma, sessionAuth, mail, languages) {
        this.prisma = prisma;
        this.sessionAuth = sessionAuth;
        this.mail = mail;
        this.languages = languages;
    }
    async issueTokens(userId, meta) {
        const accessToken = jwt.sign({ sub: userId }, (0, auth_cookies_1.getJwtSecret)(), {
            expiresIn: auth_cookies_1.ACCESS_TOKEN_TTL_SECONDS,
        });
        const refreshToken = (0, auth_cookies_1.generateRefreshToken)();
        await this.prisma.authRefreshToken.create({
            data: {
                userId,
                tokenHash: (0, auth_cookies_1.hashRefreshToken)(refreshToken),
                expiresAt: new Date(Date.now() + auth_cookies_1.REFRESH_TOKEN_TTL_SECONDS * 1000),
                userAgent: meta.userAgent?.slice(0, 256) ?? null,
                ipAddress: meta.ip?.slice(0, 64) ?? null,
            },
        });
        return { accessToken, refreshToken, accessTokenExpiresIn: auth_cookies_1.ACCESS_TOKEN_TTL_SECONDS };
    }
    async revokeRefreshToken(rawToken) {
        const tokenHash = (0, auth_cookies_1.hashRefreshToken)(rawToken);
        await this.prisma.authRefreshToken
            .updateMany({
            where: { tokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        })
            .catch(() => undefined);
    }
    rotateSessionFromRefreshToken(rawRefreshToken, meta) {
        return this.sessionAuth.rotateSessionFromRefreshToken(rawRefreshToken, meta);
    }
    async getUserWithProviders(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: { oauthAccounts: { select: { provider: true } } },
        });
    }
    async createUserAsAdmin(actor, body) {
        if (actor.role !== 'SUPER_ADMIN' && actor.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only admins can create accounts');
        }
        const roleSlug = body.role ?? 'student';
        const targetRole = roleSlug.toUpperCase();
        if (actor.role === 'ADMIN' && targetRole !== 'STUDENT') {
            throw new common_1.ForbiddenException('Admins can only create student accounts');
        }
        if (targetRole === 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('SUPER_ADMIN accounts can only be managed via CLI');
        }
        const email = body.email.trim().toLowerCase();
        if (!email || !email.includes('@')) {
            throw new common_1.BadRequestException('Invalid email');
        }
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new common_1.BadRequestException('Email already registered');
        }
        const displayName = body.displayName?.trim() || email.split('@')[0] || 'User';
        const timezone = body.timezone?.trim() || 'Europe/Kyiv';
        const proficiencyLevel = body.proficiencyLevel === undefined || body.proficiencyLevel === null
            ? null
            : body.proficiencyLevel;
        if (proficiencyLevel && !PROFICIENCY_LEVELS.has(proficiencyLevel)) {
            throw new common_1.BadRequestException('Invalid proficiency level');
        }
        const statusSlug = body.status ?? 'active';
        const status = statusSlug.toUpperCase();
        if (!ACCOUNT_STATUSES.has(status)) {
            throw new common_1.BadRequestException('Invalid account status');
        }
        let teacherId = null;
        if (body.teacherId) {
            if (targetRole !== 'STUDENT') {
                throw new common_1.BadRequestException('teacherId applies only to student accounts');
            }
            const teacher = await this.prisma.user.findUnique({
                where: { id: body.teacherId },
                select: { id: true, role: true },
            });
            const teachingRoles = new Set(['TEACHER', 'ADMIN', 'SUPER_ADMIN']);
            if (!teacher || !teachingRoles.has(teacher.role)) {
                throw new common_1.BadRequestException('Assigned teacher not found');
            }
            teacherId = teacher.id;
        }
        if (body.nativeLanguageId) {
            await this.languages.assertLanguageIds([body.nativeLanguageId]);
        }
        const plainPassword = (0, module_mail_1.generateTemporaryPassword)();
        const passwordHash = await bcrypt.hash(plainPassword, 12);
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                displayName,
                role: targetRole,
                status: status,
                timezone,
                proficiencyLevel,
                phone: body.phone === undefined ? null : this.normalizePhoneOptional(body.phone),
                telegram: body.telegram === undefined ? null : this.normalizeTelegramOptional(body.telegram),
                bio: body.bio === undefined ? null : this.trimOrNull(body.bio),
                nativeLanguageId: body.nativeLanguageId === undefined || body.nativeLanguageId === null
                    ? null
                    : body.nativeLanguageId,
                teacherId,
            },
            include: { oauthAccounts: { select: { provider: true } } },
        });
        if (targetRole === 'STUDENT') {
            const learningIds = body.learningLanguageIds?.length
                ? body.learningLanguageIds
                : [await this.languages.defaultLearningLanguageId()];
            await this.languages.assertLanguageIds(learningIds);
            await this.prisma.studentLearningLanguage.createMany({
                data: learningIds.map((languageId) => ({
                    userId: user.id,
                    languageId,
                })),
            });
        }
        const loginUrl = `${process.env['WEB_ORIGIN'] ?? 'http://localhost:4200'}/login`;
        const welcomeEmailSent = await this.mail.sendWelcomeAccount({
            to: email,
            displayName,
            email,
            password: plainPassword,
            loginUrl,
        });
        return { user, welcomeEmailSent };
    }
    trimOrNull(value) {
        if (value === null)
            return null;
        const trimmed = value.trim();
        return trimmed || null;
    }
    normalizePhoneOptional(value) {
        if (value === null)
            return null;
        const trimmed = value.trim();
        if (!trimmed)
            return null;
        const digits = trimmed.replace(/\D/g, '');
        if (!digits)
            return null;
        if (digits.length < 7 || digits.length > 15) {
            throw new common_1.BadRequestException('Phone number must contain 7–15 digits');
        }
        return `+${digits}`;
    }
    normalizeTelegramOptional(value) {
        if (value === null)
            return null;
        const trimmed = value.trim();
        if (!trimmed)
            return null;
        const handle = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
        if (!/^@[a-zA-Z0-9_]{5,32}$/.test(handle)) {
            throw new common_1.BadRequestException('Telegram username must be 5–32 characters (letters, numbers, underscore)');
        }
        return handle;
    }
    async login(body) {
        const email = body.email.trim().toLowerCase();
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { oauthAccounts: { select: { provider: true } } },
        });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const ok = await bcrypt.compare(body.password, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return user;
    }
    async upsertGoogleUser(payload) {
        const email = payload.email.toLowerCase();
        const existingByProvider = await this.prisma.oAuthAccount.findUnique({
            where: {
                provider_providerAccountId: { provider: 'GOOGLE', providerAccountId: payload.googleSub },
            },
            include: {
                user: {
                    include: { oauthAccounts: { select: { provider: true } } },
                },
            },
        });
        if (existingByProvider) {
            await this.prisma.oAuthAccount.update({
                where: { id: existingByProvider.id },
                data: {
                    accessToken: payload.accessToken ?? existingByProvider.accessToken,
                    refreshToken: payload.refreshToken ?? existingByProvider.refreshToken,
                    expiresAt: payload.expiryDate ? new Date(payload.expiryDate) : existingByProvider.expiresAt,
                    scopes: payload.scopes ?? existingByProvider.scopes,
                    providerEmail: email,
                },
            });
            await this.maybeUpsertCalendarConnection(existingByProvider.userId, payload);
            return existingByProvider.user;
        }
        const existingByEmail = await this.prisma.user.findUnique({
            where: { email },
            include: { oauthAccounts: { select: { provider: true } } },
        });
        if (existingByEmail) {
            await this.prisma.oAuthAccount.create({
                data: {
                    userId: existingByEmail.id,
                    provider: 'GOOGLE',
                    providerAccountId: payload.googleSub,
                    providerEmail: email,
                    accessToken: payload.accessToken ?? null,
                    refreshToken: payload.refreshToken ?? null,
                    expiresAt: payload.expiryDate ? new Date(payload.expiryDate) : null,
                    scopes: payload.scopes ?? null,
                },
            });
            await this.maybeUpsertCalendarConnection(existingByEmail.id, payload);
            return this.prisma.user.findUnique({
                where: { id: existingByEmail.id },
                include: { oauthAccounts: { select: { provider: true } } },
            });
        }
        throw new common_1.ForbiddenException('No account found for this Google email. Ask an administrator to create your account.');
    }
    async linkGoogleToUser(userId, payload) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException();
        const email = payload.email.trim().toLowerCase();
        if (email !== user.email.trim().toLowerCase()) {
            throw new common_1.BadRequestException(`Use the Google account that matches your SoEnglish email (${user.email}). You signed in as ${payload.email}.`);
        }
        const ownedByOther = await this.prisma.oAuthAccount.findUnique({
            where: {
                provider_providerAccountId: { provider: 'GOOGLE', providerAccountId: payload.googleSub },
            },
        });
        if (ownedByOther && ownedByOther.userId !== userId) {
            throw new common_1.BadRequestException('This Google account is already linked to another user.');
        }
        const existingForUser = await this.prisma.oAuthAccount.findFirst({
            where: { userId, provider: 'GOOGLE' },
        });
        if (existingForUser && existingForUser.providerAccountId !== payload.googleSub) {
            throw new common_1.BadRequestException('Another Google account is already linked. Sign in with that Google account or contact support.');
        }
        await this.prisma.oAuthAccount.upsert({
            where: {
                provider_providerAccountId: { provider: 'GOOGLE', providerAccountId: payload.googleSub },
            },
            create: {
                userId,
                provider: 'GOOGLE',
                providerAccountId: payload.googleSub,
                providerEmail: email,
                accessToken: payload.accessToken ?? null,
                refreshToken: payload.refreshToken ?? null,
                expiresAt: payload.expiryDate ? new Date(payload.expiryDate) : null,
                scopes: payload.scopes ?? null,
            },
            update: {
                userId,
                providerEmail: email,
                accessToken: payload.accessToken ?? undefined,
                refreshToken: payload.refreshToken ?? undefined,
                expiresAt: payload.expiryDate ? new Date(payload.expiryDate) : undefined,
                scopes: payload.scopes ?? undefined,
            },
        });
        await this.maybeUpsertCalendarConnection(userId, payload);
        if (!(payload.scopes ?? '').includes('calendar')) {
            throw new common_1.BadRequestException('Google Calendar access was not granted. Try again and allow Calendar when Google asks.');
        }
        const connection = await this.prisma.googleCalendarConnection.findUnique({ where: { userId } });
        if (!connection?.refreshToken) {
            throw new common_1.BadRequestException('Google did not return a Calendar refresh token. Remove SoEnglish from your Google Account permissions, then connect again.');
        }
    }
    async upsertOAuthAccount(userId, provider, providerAccountId, data) {
        const ownedByOther = await this.prisma.oAuthAccount.findUnique({
            where: { provider_providerAccountId: { provider, providerAccountId } },
        });
        if (ownedByOther && ownedByOther.userId !== userId) {
            throw new common_1.BadRequestException(`This ${provider.toLowerCase()} account is already linked to another user.`);
        }
        const existingForUser = await this.prisma.oAuthAccount.findFirst({
            where: { userId, provider },
        });
        if (existingForUser && existingForUser.providerAccountId !== providerAccountId) {
            throw new common_1.BadRequestException(`Another ${provider.toLowerCase()} account is already linked to your profile.`);
        }
        await this.prisma.oAuthAccount.upsert({
            where: { provider_providerAccountId: { provider, providerAccountId } },
            create: {
                userId,
                provider,
                providerAccountId,
                providerEmail: data.providerEmail ?? null,
                accessToken: data.accessToken ?? null,
                refreshToken: data.refreshToken ?? null,
                expiresAt: data.expiresAt ?? null,
                scopes: data.scopes ?? null,
            },
            update: {
                userId,
                providerEmail: data.providerEmail ?? undefined,
                accessToken: data.accessToken ?? undefined,
                refreshToken: data.refreshToken ?? undefined,
                expiresAt: data.expiresAt ?? undefined,
                scopes: data.scopes ?? undefined,
            },
        });
    }
    async linkFacebookToUser(userId, payload) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException();
        await this.upsertOAuthAccount(userId, 'FACEBOOK', payload.facebookId, {
            providerEmail: payload.email?.trim().toLowerCase() ?? payload.name ?? null,
            accessToken: payload.accessToken,
        });
    }
    async linkTelegramToUser(userId, payload) {
        (0, telegram_auth_1.verifyTelegramLogin)(payload);
        await (0, link_telegram_account_1.linkTelegramAccount)(this.prisma, userId, {
            id: payload.id,
            username: payload.username,
            first_name: payload.first_name,
            last_name: payload.last_name,
        });
    }
    async deleteUserAsAdmin(actor, targetId) {
        return (0, delete_admin_user_1.deleteAdminUserAccount)(this.prisma, actor, targetId);
    }
    async maybeUpsertCalendarConnection(userId, payload) {
        const scopes = payload.scopes ?? '';
        if (!scopes.includes('calendar'))
            return;
        await this.prisma.googleCalendarConnection.upsert({
            where: { userId },
            update: {
                accessToken: payload.accessToken ?? null,
                refreshToken: payload.refreshToken ?? undefined,
                expiresAt: payload.expiryDate ? new Date(payload.expiryDate) : null,
                scopes,
            },
            create: {
                userId,
                accessToken: payload.accessToken ?? null,
                refreshToken: payload.refreshToken ?? null,
                expiresAt: payload.expiryDate ? new Date(payload.expiryDate) : null,
                scopes,
            },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [data_access_prisma_1.PrismaService,
        auth_session_service_1.AuthSessionService,
        module_mail_1.MailService,
        languages_service_1.LanguagesService])
], AuthService);
let AuthController = class AuthController {
    constructor(authService, telegramLinkService) {
        this.authService = authService;
        this.telegramLinkService = telegramLinkService;
    }
    async login(body, req, res) {
        const user = await this.authService.login(body);
        const tokens = await this.authService.issueTokens(user.id, {
            userAgent: req.headers['user-agent'] ?? undefined,
            ip: req.ip,
        });
        (0, auth_cookies_1.setAuthCookies)(res, tokens);
        return { user: mapUserToDto(user) };
    }
    async refresh(req, res) {
        const rawRefresh = req.cookies?.[auth_cookies_1.REFRESH_COOKIE];
        if (!rawRefresh)
            throw new common_1.UnauthorizedException();
        const rotated = await this.authService.rotateSessionFromRefreshToken(rawRefresh, {
            userAgent: req.headers['user-agent'] ?? undefined,
            ip: req.ip,
        });
        if (!rotated)
            throw new common_1.UnauthorizedException();
        (0, auth_cookies_1.setAuthCookies)(res, {
            accessToken: rotated.accessToken,
            refreshToken: rotated.refreshToken,
        });
        const user = await this.authService.getUserWithProviders(rotated.userId);
        if (!user)
            throw new common_1.UnauthorizedException();
        return { user: mapUserToDto(user) };
    }
    async logout(req, res) {
        const refresh = req.cookies?.[auth_cookies_1.REFRESH_COOKIE];
        if (refresh) {
            await this.authService.revokeRefreshToken(refresh);
        }
        (0, auth_cookies_1.clearAuthCookies)(res);
        return { ok: true };
    }
    async me(userId) {
        const user = await this.authService.getUserWithProviders(userId);
        if (!user)
            throw new common_1.UnauthorizedException();
        return { user: mapUserToDto(user) };
    }
    google(res) {
        try {
            (0, auth_cookies_1.clearGoogleOAuthCookies)(res);
            res.redirect(buildGoogleAuthUrl());
        }
        catch {
            res.status(500).json({ error: 'Google OAuth is not configured' });
        }
    }
    googleLink(userId, res) {
        try {
            (0, auth_cookies_1.setGoogleLinkCookies)(res, userId);
            res.redirect(buildGoogleAuthUrl());
        }
        catch {
            res.status(500).json({ error: 'Google OAuth is not configured' });
        }
    }
    async googleCallback(code, req, res) {
        const linkUserId = (0, auth_cookies_1.readGoogleLinkUserId)(req);
        const isLinkFlow = Boolean(linkUserId);
        const client = getGoogleClient();
        if (!client || !code) {
            (0, auth_cookies_1.clearGoogleOAuthCookies)(res);
            if (isLinkFlow) {
                res.redirect((0, oauth_link_redirect_1.profileConnectionsRedirect)({ google_link_error: 'missing_code' }));
                return;
            }
            res.status(400).json({ error: 'Google OAuth callback is missing code or configuration' });
            return;
        }
        let tokens;
        let payload;
        try {
            const tokenResponse = await client.getToken(code);
            tokens = tokenResponse.tokens;
            const idToken = tokens.id_token;
            if (!idToken) {
                throw new common_1.BadRequestException('Google did not return id_token');
            }
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env['GOOGLE_CLIENT_ID'],
            });
            const verified = ticket.getPayload();
            if (!verified?.sub || !verified.email) {
                throw new common_1.BadRequestException('Google profile is missing identifier or email');
            }
            payload = {
                sub: verified.sub,
                email: verified.email,
                name: verified.name,
                picture: verified.picture,
            };
        }
        catch (err) {
            (0, auth_cookies_1.clearGoogleOAuthCookies)(res);
            if (isLinkFlow) {
                const message = err instanceof Error ? err.message : 'Google sign-in failed';
                res.redirect((0, oauth_link_redirect_1.profileConnectionsRedirect)({ google_link_error: message.slice(0, 240) }));
                return;
            }
            throw err;
        }
        const googlePayload = {
            googleSub: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            accessToken: tokens.access_token ?? null,
            refreshToken: tokens.refresh_token ?? null,
            expiryDate: tokens.expiry_date ?? null,
            scopes: tokens.scope ?? null,
        };
        if (isLinkFlow && linkUserId) {
            (0, auth_cookies_1.clearGoogleOAuthCookies)(res);
            try {
                await this.authService.linkGoogleToUser(linkUserId, googlePayload);
            }
            catch (err) {
                const message = err instanceof common_1.BadRequestException || err instanceof common_1.ForbiddenException
                    ? err.message
                    : 'Could not link Google account';
                res.redirect((0, oauth_link_redirect_1.profileConnectionsRedirect)({ google_link_error: message.slice(0, 240) }));
                return;
            }
            res.redirect((0, oauth_link_redirect_1.profileConnectionsRedirect)({ google_linked: '1' }));
            return;
        }
        (0, auth_cookies_1.clearGoogleOAuthCookies)(res);
        let user;
        try {
            user = await this.authService.upsertGoogleUser(googlePayload);
        }
        catch (err) {
            if (err instanceof common_1.ForbiddenException) {
                const redirectUrl = process.env['GOOGLE_FAILURE_REDIRECT'] ??
                    `${(0, oauth_link_redirect_1.webOrigin)()}/login?error=no_account`;
                res.redirect(redirectUrl);
                return;
            }
            throw err;
        }
        if (!user) {
            res.status(500).json({ error: 'Failed to upsert Google user' });
            return;
        }
        const issued = await this.authService.issueTokens(user.id, {
            userAgent: req.headers['user-agent'] ?? undefined,
            ip: req.ip,
        });
        (0, auth_cookies_1.setAuthCookies)(res, issued);
        const redirectUrl = process.env['GOOGLE_SUCCESS_REDIRECT'] ?? `${(0, oauth_link_redirect_1.webOrigin)()}/dashboard`;
        res.redirect(redirectUrl);
    }
    facebookLink(userId, res) {
        try {
            (0, auth_cookies_1.setFacebookLinkCookies)(res, userId);
            res.redirect((0, facebook_oauth_1.buildFacebookAuthUrl)());
        }
        catch {
            res.status(500).json({ error: 'Facebook OAuth is not configured' });
        }
    }
    async facebookCallback(code, req, res) {
        const linkUserId = (0, auth_cookies_1.readFacebookLinkUserId)(req);
        const isLinkFlow = Boolean(linkUserId);
        if (!code) {
            (0, auth_cookies_1.clearFacebookOAuthCookies)(res);
            if (isLinkFlow) {
                res.redirect((0, oauth_link_redirect_1.profileConnectionsRedirect)({ facebook_link_error: 'missing_code' }));
                return;
            }
            res.status(400).json({ error: 'Facebook OAuth callback is missing code' });
            return;
        }
        try {
            const { accessToken, profile } = await (0, facebook_oauth_1.exchangeFacebookCode)(code);
            if (isLinkFlow && linkUserId) {
                (0, auth_cookies_1.clearFacebookOAuthCookies)(res);
                await this.authService.linkFacebookToUser(linkUserId, {
                    facebookId: profile.id,
                    name: profile.name ?? null,
                    email: profile.email ?? null,
                    accessToken,
                });
                res.redirect((0, oauth_link_redirect_1.profileConnectionsRedirect)({ facebook_linked: '1' }));
                return;
            }
            (0, auth_cookies_1.clearFacebookOAuthCookies)(res);
            res.status(400).json({
                error: 'Facebook sign-in is only available when linking from Profile → Connections',
            });
        }
        catch (err) {
            (0, auth_cookies_1.clearFacebookOAuthCookies)(res);
            if (isLinkFlow) {
                const message = err instanceof common_1.BadRequestException || err instanceof common_1.ForbiddenException
                    ? err.message
                    : 'Could not link Facebook account';
                res.redirect((0, oauth_link_redirect_1.profileConnectionsRedirect)({ facebook_link_error: message.slice(0, 240) }));
                return;
            }
            throw err;
        }
    }
    async telegramWidgetConfig() {
        return (0, telegram_1.getTelegramWidgetConfig)();
    }
    async telegramLinkStart(userId) {
        return this.telegramLinkService.startBotLink(userId);
    }
    async telegramLinkStatus(userId, code) {
        if (!code?.trim())
            throw new common_1.BadRequestException('code is required');
        return this.telegramLinkService.getLinkStatusForUser(userId, code.trim());
    }
    async linkTelegramFromWidget(userId, body) {
        await this.authService.linkTelegramToUser(userId, body);
        return { ok: true };
    }
};
exports.AuthController = AuthController;
tslib_1.__decorate([
    (0, common_1.Post)('login'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__param(2, (0, common_1.Res)({ passthrough: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
tslib_1.__decorate([
    (0, common_1.Post)('refresh'),
    tslib_1.__param(0, (0, common_1.Req)()),
    tslib_1.__param(1, (0, common_1.Res)({ passthrough: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
tslib_1.__decorate([
    (0, common_1.Post)('logout'),
    tslib_1.__param(0, (0, common_1.Req)()),
    tslib_1.__param(1, (0, common_1.Res)({ passthrough: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('me'),
    tslib_1.__param(0, (0, current_user_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
tslib_1.__decorate([
    (0, common_1.Get)('google'),
    tslib_1.__param(0, (0, common_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AuthController.prototype, "google", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('google/link'),
    tslib_1.__param(0, (0, current_user_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AuthController.prototype, "googleLink", null);
tslib_1.__decorate([
    (0, common_1.Get)('google/callback'),
    tslib_1.__param(0, (0, common_1.Query)('code')),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__param(2, (0, common_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "googleCallback", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('facebook/link'),
    tslib_1.__param(0, (0, current_user_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AuthController.prototype, "facebookLink", null);
tslib_1.__decorate([
    (0, common_1.Get)('facebook/callback'),
    tslib_1.__param(0, (0, common_1.Query)('code')),
    tslib_1.__param(1, (0, common_1.Req)()),
    tslib_1.__param(2, (0, common_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "facebookCallback", null);
tslib_1.__decorate([
    (0, common_1.Get)('telegram/widget-config'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "telegramWidgetConfig", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('telegram/link/start'),
    tslib_1.__param(0, (0, current_user_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "telegramLinkStart", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('telegram/link/status'),
    tslib_1.__param(0, (0, current_user_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Query)('code')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "telegramLinkStatus", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('telegram/link'),
    tslib_1.__param(0, (0, current_user_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "linkTelegramFromWidget", null);
exports.AuthController = AuthController = tslib_1.__decorate([
    (0, common_1.Controller)('auth'),
    tslib_1.__metadata("design:paramtypes", [AuthService,
        telegram_link_service_1.TelegramLinkService])
], AuthController);
let AdminUsersController = class AdminUsersController {
    constructor(authService, prisma) {
        this.authService = authService;
        this.prisma = prisma;
    }
    async list(userId) {
        const actor = await this.requireAdmin(userId);
        const users = await this.prisma.user.findMany({
            where: actor.role === 'ADMIN'
                ? { role: { in: ['STUDENT', 'TEACHER', 'ADMIN'] } }
                : { role: { not: 'SUPER_ADMIN' } },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });
        return users.map((user) => ({
            ...user,
            role: user.role.toLowerCase(),
            status: user.status.toLowerCase(),
            createdAt: user.createdAt.toISOString(),
        }));
    }
    async create(userId, body) {
        const actor = await this.requireAdmin(userId);
        const { user, welcomeEmailSent } = await this.authService.createUserAsAdmin(actor, body);
        return { user: mapUserToDto(user), welcomeEmailSent };
    }
    async remove(userId, targetId) {
        const actor = await this.requireAdmin(userId);
        await this.authService.deleteUserAsAdmin(actor, targetId);
        return { ok: true };
    }
    async requireAdmin(userId) {
        const actor = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true },
        });
        if (!actor)
            throw new common_1.UnauthorizedException();
        if (actor.role !== 'SUPER_ADMIN' && actor.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only admins can manage accounts');
        }
        return { id: actor.id, role: actor.role };
    }
};
exports.AdminUsersController = AdminUsersController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, current_user_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminUsersController.prototype, "list", null);
tslib_1.__decorate([
    (0, common_1.Post)(),
    tslib_1.__param(0, (0, current_user_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminUsersController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    tslib_1.__param(0, (0, current_user_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminUsersController.prototype, "remove", null);
exports.AdminUsersController = AdminUsersController = tslib_1.__decorate([
    (0, common_1.Controller)('admin/users'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    tslib_1.__metadata("design:paramtypes", [AuthService,
        data_access_prisma_1.PrismaService])
], AdminUsersController);
let UsersController = class UsersController {
    constructor(users) {
        this.users = users;
    }
    async students(userId) {
        return this.users.listStudents(userId);
    }
    async getMyProfile(userId) {
        return this.users.getMyProfile(userId);
    }
    async updateMyProfile(userId, body) {
        return this.users.updateMyProfile(userId, body);
    }
    async changeMyPassword(userId, body) {
        return this.users.changeMyPassword(userId, body);
    }
};
exports.UsersController = UsersController;
tslib_1.__decorate([
    (0, common_1.Get)('students'),
    tslib_1.__param(0, (0, current_user_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "students", null);
tslib_1.__decorate([
    (0, common_1.Get)('me/profile'),
    tslib_1.__param(0, (0, current_user_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "getMyProfile", null);
tslib_1.__decorate([
    (0, common_1.Post)('me/profile'),
    tslib_1.__param(0, (0, current_user_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "updateMyProfile", null);
tslib_1.__decorate([
    (0, common_1.Post)('me/password'),
    tslib_1.__param(0, (0, current_user_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UsersController.prototype, "changeMyPassword", null);
exports.UsersController = UsersController = tslib_1.__decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    tslib_1.__metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
let LanguagesController = class LanguagesController {
    constructor(languages) {
        this.languages = languages;
    }
    list() {
        return this.languages.listActive();
    }
};
exports.LanguagesController = LanguagesController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], LanguagesController.prototype, "list", null);
exports.LanguagesController = LanguagesController = tslib_1.__decorate([
    (0, common_1.Controller)('languages'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    tslib_1.__metadata("design:paramtypes", [languages_service_1.LanguagesService])
], LanguagesController);
let AdminStudentsController = class AdminStudentsController {
    constructor(prisma, studentsAdmin) {
        this.prisma = prisma;
        this.studentsAdmin = studentsAdmin;
    }
    async update(userId, studentId, body) {
        const actor = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if (!actor || (actor.role !== 'SUPER_ADMIN' && actor.role !== 'ADMIN')) {
            throw new common_1.ForbiddenException('Only admins can update student languages');
        }
        return this.studentsAdmin.updateStudent(actor.role, studentId, body);
    }
};
exports.AdminStudentsController = AdminStudentsController;
tslib_1.__decorate([
    (0, common_1.Patch)(':id'),
    tslib_1.__param(0, (0, current_user_1.CurrentUser)()),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__param(2, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminStudentsController.prototype, "update", null);
exports.AdminStudentsController = AdminStudentsController = tslib_1.__decorate([
    (0, common_1.Controller)('admin/students'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    tslib_1.__metadata("design:paramtypes", [data_access_prisma_1.PrismaService,
        students_admin_service_1.StudentsAdminService])
], AdminStudentsController);
let DashboardController = class DashboardController {
    constructor(dashboard) {
        this.dashboard = dashboard;
    }
    async summary(userId) {
        return this.dashboard.summaryFor(userId);
    }
};
exports.DashboardController = DashboardController;
tslib_1.__decorate([
    (0, common_1.Get)('summary'),
    tslib_1.__param(0, (0, current_user_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], DashboardController.prototype, "summary", null);
exports.DashboardController = DashboardController = tslib_1.__decorate([
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    tslib_1.__metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = tslib_1.__decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [data_access_prisma_1.PrismaModule, module_mail_1.MailModule],
        controllers: [
            AuthController,
            AdminUsersController,
            AdminStudentsController,
            LanguagesController,
            UsersController,
            DashboardController,
        ],
        providers: [
            AuthService,
            auth_session_service_1.AuthSessionService,
            dashboard_service_1.DashboardService,
            daily_goals_service_1.DailyGoalsService,
            practice_sessions_service_1.PracticeSessionsService,
            languages_service_1.LanguagesService,
            students_admin_service_1.StudentsAdminService,
            users_service_1.UsersService,
            telegram_link_service_1.TelegramLinkService,
            auth_guard_1.AuthGuard,
            auth_guard_1.OptionalAuthGuard,
            gql_auth_guard_1.GqlAuthGuard,
        ],
        exports: [
            AuthService,
            auth_session_service_1.AuthSessionService,
            dashboard_service_1.DashboardService,
            daily_goals_service_1.DailyGoalsService,
            practice_sessions_service_1.PracticeSessionsService,
            languages_service_1.LanguagesService,
            students_admin_service_1.StudentsAdminService,
            users_service_1.UsersService,
            auth_guard_1.AuthGuard,
            auth_guard_1.OptionalAuthGuard,
            gql_auth_guard_1.GqlAuthGuard,
            telegram_link_service_1.TelegramLinkService,
        ],
    })
], AuthModule);
var auth_cookies_2 = require("./auth-cookies");
Object.defineProperty(exports, "ACCESS_COOKIE", { enumerable: true, get: function () { return auth_cookies_2.ACCESS_COOKIE; } });
Object.defineProperty(exports, "REFRESH_COOKIE", { enumerable: true, get: function () { return auth_cookies_2.REFRESH_COOKIE; } });
//# sourceMappingURL=auth.js.map