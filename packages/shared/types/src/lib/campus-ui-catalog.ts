/**
 * Campus UI chrome catalog (uk + en) — single SoT for CMS seed + Campus code fallbacks.
 * Keys: area.element.name
 */
export type CampusUiLocalePair = { en: string; uk: string };

export const CAMPUS_UI_STRINGS: Record<string, CampusUiLocalePair> = {
  // —— Nav ——
  'nav.section.learn': { en: 'Learn', uk: 'Навчання' },
  'nav.section.schedule': { en: 'Schedule', uk: 'Розклад' },
  'nav.section.connect': { en: 'Connect', uk: 'Звʼязок' },
  'nav.section.account': { en: 'Account', uk: 'Акаунт' },
  'nav.section.platform': { en: 'Platform', uk: 'Платформа' },
  'nav.dashboard': { en: 'Dashboard', uk: 'Дашборд' },
  'nav.lessons': { en: 'Lessons', uk: 'Уроки' },
  'nav.practice': { en: 'Practice', uk: 'Практика' },
  'nav.vocabulary': { en: 'Vocabulary', uk: 'Словник' },
  'nav.quizzes': { en: 'Quizzes', uk: 'Квізи' },
  'nav.materials': { en: 'Materials', uk: 'Матеріали' },
  'nav.calendar': { en: 'Calendar', uk: 'Календар' },
  'nav.chat': { en: 'Chat', uk: 'Чат' },
  'nav.students': { en: 'Students', uk: 'Учні' },
  'nav.studentsGroups': { en: 'Students & groups', uk: 'Учні та групи' },
  'nav.staff': { en: 'Staff', uk: 'Персонал' },
  'nav.payment': { en: 'Payment', uk: 'Оплата' },
  'nav.finance': { en: 'Finance', uk: 'Фінанси' },
  'nav.billing': { en: 'Subscription', uk: 'Підписка' },
  'nav.profile': { en: 'Profile & Settings', uk: 'Профіль і налаштування' },
  'nav.admin': { en: 'Admin', uk: 'Адмін' },
  'nav.system': { en: 'System', uk: 'Система' },
  'nav.aria.main': { en: 'Main navigation', uk: 'Головна навігація' },

  // —— Auth / login ——
  'login.title': { en: 'Sign in', uk: 'Увійти' },
  'login.subtitle': {
    en: 'Welcome back. Pick up your lessons, practice, and messages in one place.',
    uk: 'З поверненням. Уроки, практика та повідомлення — в одному місці.',
  },
  'login.google': { en: 'Continue with Google', uk: 'Продовжити з Google' },
  'login.or': { en: 'or', uk: 'або' },
  'login.email': { en: 'Email', uk: 'Ел. пошта' },
  'login.password': { en: 'Password', uk: 'Пароль' },
  'login.showPassword': { en: 'Show password', uk: 'Показати пароль' },
  'login.hidePassword': { en: 'Hide password', uk: 'Сховати пароль' },
  'login.forgot': { en: 'Forgot password?', uk: 'Забули пароль?' },
  'login.submit': { en: 'Sign in', uk: 'Увійти' },
  'login.submitting': { en: 'Signing in…', uk: 'Вхід…' },
  'login.footer': { en: 'Need an account?', uk: 'Немає акаунта?' },
  'login.footerHint': { en: 'Contact your administrator.', uk: 'Зверніться до адміністратора.' },
  'login.resetSuccess': {
    en: 'Password updated. You can now sign in with your new password.',
    uk: 'Пароль оновлено. Тепер можна увійти з новим паролем.',
  },
  'login.error.emailRequired': { en: 'Email is required', uk: 'Вкажіть email' },
  'login.error.emailInvalid': { en: 'Enter a valid email address', uk: 'Введіть коректний email' },
  'login.error.passwordRequired': { en: 'Password is required', uk: 'Вкажіть пароль' },
  'login.error.failed': { en: 'Login failed', uk: 'Не вдалося увійти' },
  'login.error.no_account': {
    en: 'No account exists for that Google email. Ask an administrator to create one.',
    uk: 'Немає акаунта для цього Google email. Попросіть адміністратора створити його.',
  },
  'login.error.account_paused': {
    en: 'Your account is paused. Contact your administrator to reactivate it.',
    uk: 'Акаунт призупинено. Зверніться до адміністратора.',
  },
  'login.error.account_leaved': {
    en: 'Your account is no longer active at this school. Contact your administrator if this is a mistake.',
    uk: 'Акаунт більше не активний у цій школі. Зверніться до адміністратора, якщо це помилка.',
  },
  'login.error.account_blocked': {
    en: 'Your account is blocked. Contact support or your administrator.',
    uk: 'Акаунт заблоковано. Зверніться в підтримку або до адміністратора.',
  },
  'login.logoAlt': { en: 'School logo', uk: 'Логотип школи' },

  // —— Signup ——
  'signup.title': { en: 'Create your school', uk: 'Створіть школу' },
  'signup.subtitle': {
    en: 'Start a 7-day trial. No card required.',
    uk: 'Почніть 7-денний пробний період. Картка не потрібна.',
  },
  'signup.schoolName': { en: 'School name', uk: 'Назва школи' },
  'signup.displayName': { en: 'Your name', uk: 'Ваше імʼя' },
  'signup.email': { en: 'Work email', uk: 'Робоча ел. пошта' },
  'signup.password': { en: 'Password', uk: 'Пароль' },
  'signup.submit': { en: 'Create school', uk: 'Створити школу' },
  'signup.submitting': { en: 'Creating…', uk: 'Створення…' },
  'signup.hasAccount': { en: 'Already have an account?', uk: 'Вже є акаунт?' },
  'signup.signIn': { en: 'Sign in', uk: 'Увійти' },
  'signup.error.captcha': {
    en: 'Please complete the security check.',
    uk: 'Пройдіть перевірку безпеки.',
  },
  'signup.error.failed': { en: 'Sign up failed', uk: 'Не вдалося зареєструватися' },

  // —— Forgot / reset ——
  'forgot.title': { en: 'Forgot password', uk: 'Забули пароль' },
  'forgot.subtitle': {
    en: 'Enter your email and we will send a reset link if an account exists.',
    uk: 'Введіть email — ми надішлемо посилання для скидання, якщо акаунт існує.',
  },
  'forgot.submit': { en: 'Send reset link', uk: 'Надіслати посилання' },
  'forgot.back': { en: 'Back to sign in', uk: 'Назад до входу' },
  'forgot.sending': { en: 'Sending…', uk: 'Надсилання…' },
  'forgot.successTitle': { en: 'Check your inbox', uk: 'Перевірте пошту' },
  'forgot.successBody': {
    en: "If an account exists for that address, you'll receive a reset link shortly. The link expires for your security.",
    uk: 'Якщо акаунт з цією адресою існує, незабаром надійде посилання для скидання. Воно має обмежений термін дії.',
  },
  'forgot.error.sendFailed': {
    en: 'Could not send reset email',
    uk: 'Не вдалося надіслати лист для скидання',
  },
  'reset.title': { en: 'Set a new password', uk: 'Новий пароль' },
  'reset.subtitle': { en: 'Choose a strong password for your account.', uk: 'Оберіть надійний пароль.' },
  'reset.submit': { en: 'Update password', uk: 'Оновити пароль' },
  'reset.updating': { en: 'Updating…', uk: 'Оновлення…' },
  'reset.password': { en: 'New password', uk: 'Новий пароль' },
  'reset.confirm': { en: 'Confirm password', uk: 'Підтвердіть пароль' },
  'reset.back': { en: 'Back to sign in', uk: 'Назад до входу' },
  'reset.missingTokenSubtitle': {
    en: 'This reset link is incomplete. Request a fresh one below.',
    uk: 'Посилання для скидання неповне. Запросіть нове нижче.',
  },
  'reset.missingTokenBody': {
    en: 'Open the full link from your email, or request a new reset from the sign-in page.',
    uk: 'Відкрийте повне посилання з листа або запросіть нове зі сторінки входу.',
  },
  'reset.requestNewLink': {
    en: 'Request a new reset link',
    uk: 'Запросити нове посилання',
  },
  'reset.error.missingToken': {
    en: 'Password reset link is missing or invalid.',
    uk: 'Посилання для скидання пароля відсутнє або недійсне.',
  },
  'reset.error.minLength': {
    en: 'New password must be at least 8 characters.',
    uk: 'Новий пароль має містити щонайменше 8 символів.',
  },
  'reset.error.mismatch': {
    en: 'Passwords do not match.',
    uk: 'Паролі не збігаються.',
  },
  'reset.error.failed': {
    en: 'Could not reset password',
    uk: 'Не вдалося скинути пароль',
  },

  // —— Status / privacy chrome ——
  'status.title': { en: 'System Status', uk: 'Статус системи' },
  'status.checking': { en: 'Checking…', uk: 'Перевірка…' },
  'status.operational': { en: 'Operational', uk: 'Працює' },
  'status.degraded': { en: 'Degraded', uk: 'Обмежено' },
  'status.error': { en: 'Error', uk: 'Помилка' },
  'status.refresh': { en: 'Refresh', uk: 'Оновити' },
  'privacy.title': { en: 'Privacy Policy', uk: 'Політика конфіденційності' },
  'privacy.lastUpdated': { en: 'Last updated: {date}', uk: 'Оновлено: {date}' },

  // —— Global chrome (shell / cookies / 404 / legal nav) ——
  'a11y.skipToMain': { en: 'Skip to main content', uk: 'Перейти до основного вмісту' },
  'cookie.aria': { en: 'Cookie consent', uk: 'Згода на cookies' },
  'cookie.body': {
    en: 'We use analytics cookies to improve the product.',
    uk: 'Ми використовуємо аналітичні cookies, щоб покращувати продукт.',
  },
  'cookie.privacyLink': { en: 'Privacy policy', uk: 'Політика конфіденційності' },
  'cookie.decline': { en: 'Decline', uk: 'Відхилити' },
  'cookie.accept': { en: 'Accept', uk: 'Прийняти' },
  'header.openNav': { en: 'Open navigation menu', uk: 'Відкрити меню' },
  'header.help': { en: 'Help', uk: 'Довідка' },
  'header.helpOff': {
    en: 'Turn on Learning mode in Profile → Account to use the help tour',
    uk: 'Увімкніть режим навчання в Профіль → Акаунт для туру-підказок',
  },
  'header.createLesson': { en: 'Create lesson', uk: 'Створити урок' },
  'header.createShort': { en: 'Create', uk: 'Створити' },
  'header.lessonsLeft': { en: 'lessons left', uk: 'уроків залишилось' },
  'header.planned': { en: '· {count} planned', uk: '· {count} заплановано' },
  'header.myToday': { en: 'My: {count} today', uk: 'Мої: {count} сьогодні' },
  'header.leftToday': { en: '· {count} left', uk: '· {count} лишилось' },
  'header.totalToday': {
    en: '· Total: {today} today / {left} left',
    uk: '· Усього: {today} сьогодні / {left} лишилось',
  },
  'header.badgeTitle.student': {
    en: 'Lesson balance — go to payment',
    uk: 'Баланс уроків — перейти до оплати',
  },
  'header.badgeTitle.staff': {
    en: 'Today lessons — open lessons',
    uk: 'Уроки сьогодні — відкрити список',
  },
  'notFound.title': { en: 'Page not found', uk: 'Сторінку не знайдено' },
  'notFound.body': {
    en: 'Arvi looked everywhere — this route does not exist.',
    uk: 'Arvi шукав скрізь — такого маршруту немає.',
  },
  'notFound.back': { en: 'Back to dashboard', uk: 'На дашборд' },
  'forgot.googleOnly': {
    en: "Sign in with Google only? You don't need a password — ask your administrator if you can't access your account.",
    uk: 'Входите лише через Google? Пароль не потрібен — зверніться до адміністратора, якщо не можете увійти.',
  },
  'status.subtitle': {
    en: 'Arvilio platform — live component health. Auto-refreshes every 60 seconds.',
    uk: 'Платформа Arvilio — стан компонентів. Автооновлення кожні 60 секунд.',
  },
  'status.api': { en: 'API', uk: 'API' },
  'status.database': { en: 'Database', uk: 'База даних' },
  'status.lastChecked': { en: 'Last checked: {time}', uk: 'Остання перевірка: {time}' },
  'legal.nav.aria': { en: 'Legal', uk: 'Юридичне' },
  'legal.nav.offer': { en: 'Offer', uk: 'Оферта' },
  'legal.nav.terms': { en: 'Terms', uk: 'Умови' },
  'legal.nav.paymentRefund': { en: 'Payment & refunds', uk: 'Оплата та повернення' },
  'legal.nav.contacts': { en: 'Contacts', uk: 'Контакти' },
  'legal.nav.privacy': { en: 'Privacy', uk: 'Конфіденційність' },
  'locale.switcher.aria': { en: 'Interface language', uk: 'Мова інтерфейсу' },
  'locale.en': { en: 'English', uk: 'English' },
  'locale.uk': { en: 'Українська', uk: 'Українська' },
  'locale.enShort': { en: 'EN', uk: 'EN' },
  'locale.ukShort': { en: 'UK', uk: 'UK' },
  'common.loading': { en: 'Loading…', uk: 'Завантаження…' },
  'common.saved': { en: 'Saved.', uk: 'Збережено.' },
  'common.saving': { en: 'Saving…', uk: 'Збереження…' },
  'common.saveFailed': { en: 'Save failed', uk: 'Не вдалося зберегти' },
  'common.save': { en: 'Save', uk: 'Зберегти' },
  'common.refresh': { en: 'Refresh', uk: 'Оновити' },
  'common.refreshing': { en: 'Refreshing…', uk: 'Оновлення…' },
  'common.on': { en: 'On', uk: 'Увімк.' },
  'common.off': { en: 'Off', uk: 'Вимк.' },
  'dashboard.dailyGoals': { en: 'Daily goals', uk: 'Щоденні цілі' },
  'dashboard.wordOfDay': { en: 'Word of the day', uk: 'Слово дня' },
  'dashboard.loadingLessons': { en: 'Loading lessons…', uk: 'Завантаження уроків…' },
  'dashboard.toReview': { en: '{count} to review', uk: '{count} на повторення' },
  'dashboard.thisWeek': { en: '{count} this week', uk: '{count} цього тижня' },
  'payment.subtitle': {
    en: 'Choose a package, pay securely online, or transfer to your school\'s bank account.',
    uk: 'Оберіть пакет, оплатіть онлайн або переказом на рахунок школи.',
  },
  'payment.subtitleOnlineOnly': {
    en: 'Choose a package and pay securely online.',
    uk: 'Оберіть пакет і оплатіть онлайн.',
  },
  'payment.subtitleManualOnly': {
    en: 'Choose a package and pay by bank transfer using the details below.',
    uk: 'Оберіть пакет і оплатіть банківським переказом за реквізитами нижче.',
  },
  'payment.balance.debt': {
    en: 'You have a lesson debt. Top up your balance to book new lessons.',
    uk: 'Є борг за уроки. Поповніть баланс, щоб бронювати нові.',
  },
  'payment.balance.empty': {
    en: 'No prepaid lessons left. Choose a package below or pay by bank transfer.',
    uk: 'Передоплачених уроків не лишилось. Оберіть пакет або банківський переказ.',
  },
  'payment.balance.oneLeft': {
    en: 'One lesson left on your balance — consider topping up soon.',
    uk: 'Лишився один урок — варто поповнити баланс.',
  },
  'payment.balance.ok': {
    en: 'Lessons remaining on your prepaid balance.',
    uk: 'Уроки на передоплаченому балансі.',
  },
  'payment.individualLessons': { en: 'Individual lessons', uk: 'Індивідуальні уроки' },
  'payment.groupLessons': { en: 'Group lessons', uk: 'Групові уроки' },
  'payment.individualRate': { en: 'Individual rate', uk: 'Індивідуальний тариф' },
  'payment.selectPackage': {
    en: 'Select how many lessons to add. Your total updates in the summary.',
    uk: 'Оберіть кількість уроків. Підсумок оновиться праворуч.',
  },
  'payment.confirmPackage': {
    en: 'Confirm the package below, then complete checkout on the right.',
    uk: 'Підтвердіть пакет нижче й завершіть оплату праворуч.',
  },
  'payment.confirmPackageManual': {
    en: 'Confirm the package below, then transfer using the bank details on this page.',
    uk: 'Підтвердіть пакет нижче й перекажіть кошти за реквізитами на цій сторінці.',
  },
  'payment.payByTransferHint': {
    en: 'Pay using the bank transfer details below. Your school will credit lessons after confirmation.',
    uk: 'Оплатіть за реквізитами нижче. Школа зарахує уроки після підтвердження.',
  },
  'payment.checkoutSummary': { en: 'Checkout summary', uk: 'Підсумок оплати' },
  'payment.noOptions.title': { en: 'No payment options yet', uk: 'Оплата ще недоступна' },
  'payment.noOptions.body': {
    en: 'Your school has not enabled self-serve top-up or bank transfer for your account. Please contact the administrator.',
    uk: 'Школа ще не ввімкнула самостійне поповнення або переказ. Зверніться до адміністратора.',
  },
  'payment.transfer.hint': {
    en: 'Use the account for your region. Include the reference and send your receipt to the school.',
    uk: 'Використайте реквізити для вашого регіону. Додайте призначення платежу й надішліть квитанцію школі.',
  },
  'payment.groupRate': { en: 'Group rate', uk: 'Груповий тариф' },
  'payment.yourBalance': { en: 'Your balance', uk: 'Ваш баланс' },
  'payment.loadingOptions': {
    en: 'Loading payment options…',
    uk: 'Завантаження варіантів оплати…',
  },
  'payment.alert.success': {
    en: 'Thank you — your payment is being processed. Lessons will appear on your balance shortly.',
    uk: 'Дякуємо — платіж обробляється. Уроки зʼявляться на балансі незабаром.',
  },
  'payment.alert.cancelled': {
    en: 'Payment was cancelled. You can choose a package and try again.',
    uk: 'Оплату скасовано. Оберіть пакет і спробуйте знову.',
  },
  'payment.error.checkoutFailed': { en: 'Checkout failed', uk: 'Не вдалося оформити оплату' },
  'payment.payInCurrency': { en: 'Pay in {currency}', uk: 'Оплата в {currency}' },
  'payment.noProviderForCurrency': {
    en: 'No online provider supports checkout in {currency} for this package. Use bank transfer below or contact your school.',
    uk: 'Жоден онлайн-провайдер не підтримує оплату в {currency} для цього пакета. Скористайтеся банківським переказом або зверніться до школи.',
  },
  'payment.noProviderForCurrencyOnlineOnly': {
    en: 'No online provider supports checkout in {currency} for this package. Contact your school.',
    uk: 'Жоден онлайн-провайдер не підтримує оплату в {currency} для цього пакета. Зверніться до школи.',
  },
  'payment.onlineDisabled': {
    en: 'Online checkout is not enabled for your account. Use bank transfer below or contact your school.',
    uk: 'Онлайн-оплата для вашого акаунта вимкнена. Скористайтеся банківським переказом або зверніться до школи.',
  },
  'payment.packagesManaged': {
    en: 'Lesson packages are managed by your school. Use the bank transfer details below and your balance will be updated after payment is confirmed.',
    uk: 'Пакети уроків керує школа. Скористайтеся реквізитами нижче — баланс оновлять після підтвердження платежу.',
  },
  'payment.orderSummary': { en: 'Order summary', uk: 'Підсумок замовлення' },
  'payment.orderLessonsCurrency': {
    en: '{count} lessons · {currency}',
    uk: '{count} уроків · {currency}',
  },
  'payment.orderAfterPayment': {
    en: 'After payment: {label}',
    uk: 'Після оплати: {label}',
  },
  'payment.balanceAfter': {
    en: '+{count} lesson(s) on your balance',
    uk: '+{count} урок(ів) на балансі',
  },
  'payment.selectPackageHint': {
    en: 'Select a package to see your total.',
    uk: 'Оберіть пакет, щоб побачити суму.',
  },
  'payment.payOnline': { en: 'Pay online', uk: 'Оплатити онлайн' },
  'payment.redirecting': { en: 'Redirecting…', uk: 'Перенаправлення…' },
  'payment.secureCheckout': {
    en: "Secure checkout via your school's payment provider",
    uk: 'Безпечна оплата через платіжного провайдера школи',
  },
  'payment.acceptedMethodsAria': {
    en: 'Accepted payment methods',
    uk: 'Прийняті способи оплати',
  },
  'payment.unavailable.currency': {
    en: '{provider} is not available for {currency} packages.',
    uk: '{provider} недоступний для пакетів у {currency}.',
  },
  'payment.mostPopular': { en: 'Most popular', uk: 'Найпопулярніший' },
  'payment.fixedSize': { en: 'Fixed size', uk: 'Фіксований розмір' },
  'payment.lessonsPrepaid': {
    en: '{count} lessons · prepaid credit',
    uk: '{count} уроків · передоплата',
  },
  'payment.groupLessonsPrepaid': {
    en: '{count} group lessons · prepaid credit',
    uk: '{count} групових уроків · передоплата',
  },
  'payment.lessonsPerLesson': {
    en: '{count} lessons · {rate} per lesson',
    uk: '{count} уроків · {rate} за урок',
  },
  'payment.perLesson': { en: '{rate} / lesson', uk: '{rate} / урок' },
  'payment.totalToPay': { en: 'Total to pay', uk: 'До сплати' },
  'payment.packageAria': {
    en: '{label}, {count} lessons',
    uk: '{label}, {count} уроків',
  },
  'payment.packageCardAria': {
    en: '{label}, {count} lessons, {amount}',
    uk: '{label}, {count} уроків, {amount}',
  },
  'payment.step.transferAmount': {
    en: 'Transfer {amount} using the details for your region.',
    uk: 'Перекажіть {amount} за реквізитами для вашого регіону.',
  },
  'payment.step.transferGeneric': {
    en: 'Transfer the package amount using the details for your region.',
    uk: 'Перекажіть суму пакета за реквізитами для вашого регіону.',
  },
  'payment.step.addReference': {
    en: 'Add the payment reference shown below (usually your name).',
    uk: 'Додайте призначення платежу нижче (зазвичай ваше імʼя).',
  },
  'payment.step.sendReceipt': {
    en: 'Send the receipt to your school — lessons are credited after confirmation.',
    uk: 'Надішліть квитанцію школі — уроки зарахують після підтвердження.',
  },
  'payment.kind.ibanSepa': { en: 'IBAN / SEPA', uk: 'IBAN / SEPA' },
  'payment.kind.swiftWire': { en: 'SWIFT wire', uk: 'SWIFT-переказ' },
  'payment.kind.cardTransfer': { en: 'Card transfer', uk: 'Переказ на картку' },
  'payment.kind.manualInvoice': { en: 'Manual invoice', uk: 'Рахунок вручну' },
  'payment.recommended': { en: 'Recommended', uk: 'Рекомендовано' },
  'payment.referenceLabel': { en: 'Payment reference', uk: 'Призначення платежу' },
  'payment.important': { en: 'Important', uk: 'Важливо' },
  'payment.manualEmpty': {
    en: 'No bank transfer templates are available for your account.',
    uk: 'Немає шаблонів банківського переказу для вашого акаунта.',
  },
  'payment.field.receiver': { en: 'Receiver', uk: 'Отримувач' },
  'payment.field.iban': { en: 'IBAN', uk: 'IBAN' },
  'payment.field.taxId': { en: 'Tax ID / EDRPOU', uk: 'ЄДРПОУ / ІПН' },
  'payment.field.purpose': { en: 'Payment purpose', uk: 'Призначення платежу' },
  'payment.field.bank': { en: 'Bank', uk: 'Банк' },
  'payment.field.country': { en: 'Country', uk: 'Країна' },
  'payment.field.bic': { en: 'BIC / SWIFT', uk: 'BIC / SWIFT' },
  'payment.field.swiftBic': { en: 'SWIFT / BIC', uk: 'SWIFT / BIC' },
  'payment.field.accountNumber': { en: 'Account number', uk: 'Номер рахунку' },
  'payment.field.intermediarySwift': { en: 'Intermediary SWIFT', uk: 'SWIFT посередника' },
  'payment.field.cardholder': { en: 'Cardholder', uk: 'Власник картки' },
  'payment.field.cardNumber': { en: 'Card number', uk: 'Номер картки' },
  'payment.field.bankAddress': { en: 'Bank address: {value}', uk: 'Адреса банку: {value}' },
  'payment.field.bankAddressLabel': { en: 'Bank address', uk: 'Адреса банку' },
  'payment.field.receiverAddress': {
    en: 'Receiver address: {value}',
    uk: 'Адреса отримувача: {value}',
  },
  'payment.field.receiverAddressLabel': { en: 'Receiver address', uk: 'Адреса отримувача' },
  'payment.field.intermediaryBank': {
    en: 'Intermediary bank: {value}',
    uk: 'Банк-посередник: {value}',
  },
  'payment.field.intermediaryBankLabel': { en: 'Intermediary bank', uk: 'Банк-посередник' },
  'payment.field.instructions': { en: 'Payment instructions', uk: 'Інструкція для оплати' },
  'payment.copy': { en: 'Copy', uk: 'Копіювати' },
  'payment.copyHint': { en: 'Click to copy', uk: 'Натисніть, щоб скопіювати' },
  'payment.copied': { en: 'Copied', uk: 'Скопійовано' },
  'payment.copyFieldAria': {
    en: 'Copy {label}: {value}',
    uk: 'Скопіювати {label}: {value}',
  },
  'payment.method.bank.title': { en: 'Bank transfer', uk: 'Банківський переказ' },
  'payment.method.bank.short': { en: 'Bank', uk: 'Банк' },
  'payment.method.bank.desc': {
    en: 'Pay by transfer using the details below, then send your receipt to the school.',
    uk: 'Оплатіть переказом за реквізитами нижче й надішліть квитанцію школі.',
  },
  'payment.method.stripe.title': { en: 'Card (Stripe)', uk: 'Картка (Stripe)' },
  'payment.method.stripe.desc': {
    en: 'Pay by card in a secure Stripe checkout.',
    uk: 'Оплата карткою в захищеному Stripe Checkout.',
  },
  'payment.method.liqpay.desc': {
    en: 'Pay with LiqPay (cards and local methods).',
    uk: 'Оплата через LiqPay (картки та локальні методи).',
  },
  'payment.method.wayforpay.desc': { en: 'Pay with WayForPay.', uk: 'Оплата через WayForPay.' },
  'payment.method.lemonsqueezy.desc': {
    en: 'Pay through Lemon Squeezy checkout.',
    uk: 'Оплата через Lemon Squeezy.',
  },
  'payment.method.paddle.desc': { en: 'Pay through Paddle checkout.', uk: 'Оплата через Paddle.' },
  'payment.method.monopay.desc': { en: 'Pay with MonoPay.', uk: 'Оплата через MonoPay.' },
  'payment.method.paypal.desc': {
    en: 'Pay with your PayPal account.',
    uk: 'Оплата через акаунт PayPal.',
  },
  'payment.ledger.title': { en: 'Recent balance activity', uk: 'Остання активність балансу' },
  'payment.ledger.subtitle': {
    en: 'Purchases, lesson charges, manual top-ups, and reversals on your prepaid balance.',
    uk: 'Покупки, списання уроків, ручні поповнення та сторно на передоплаченому балансі.',
  },
  'payment.ledger.empty': {
    en: 'No balance changes yet. Top up or complete a lesson to see activity here.',
    uk: 'Поки немає змін балансу. Поповніть або завершіть урок — активність зʼявиться тут.',
  },
  'payment.ledger.today': { en: 'Today', uk: 'Сьогодні' },
  'payment.ledger.yesterday': { en: 'Yesterday', uk: 'Вчора' },
  'payment.ledger.lesson': { en: 'lesson', uk: 'урок' },
  'payment.ledger.lessons': { en: 'lessons', uk: 'уроків' },
  'payment.ledger.left': { en: '{count} {unit} left', uk: 'залишилось {count} {unit}' },
  'payment.ledger.kind.PURCHASE.title': {
    en: 'Lesson package purchased',
    uk: 'Куплено пакет уроків',
  },
  'payment.ledger.kind.PURCHASE.desc': {
    en: 'Lessons added after a successful online payment.',
    uk: 'Уроки додано після успішної онлайн-оплати.',
  },
  'payment.ledger.kind.MANUAL_CREDIT.title': { en: 'Manual top-up', uk: 'Ручне поповнення' },
  'payment.ledger.kind.MANUAL_CREDIT.desc': {
    en: 'Lessons credited by your school.',
    uk: 'Уроки зараховано школою.',
  },
  'payment.ledger.kind.CONSUMPTION.title': { en: 'Lesson completed', uk: 'Урок завершено' },
  'payment.ledger.kind.CONSUMPTION.desc': {
    en: 'One lesson deducted from your prepaid balance.',
    uk: 'Один урок списано з передоплаченого балансу.',
  },
  'payment.ledger.kind.REVERSAL.title': {
    en: 'Lesson charge reversed',
    uk: 'Списання уроку скасовано',
  },
  'payment.ledger.kind.REVERSAL.desc': {
    en: 'A previously charged lesson was returned to your balance.',
    uk: 'Раніше списаний урок повернуто на баланс.',
  },
  'payment.ledger.kind.GROUP_CHARGE.title': {
    en: 'Group lesson charge',
    uk: 'Списання групового уроку',
  },
  'payment.ledger.kind.GROUP_CHARGE.desc': {
    en: 'Fixed group lesson fee recorded for your account.',
    uk: 'Зафіксовано плату за груповий урок.',
  },
  'payment.ledger.kind.GROUP_CHARGE_REVERSAL.title': {
    en: 'Group lesson charge reversed',
    uk: 'Списання групового уроку скасовано',
  },
  'payment.ledger.kind.GROUP_CHARGE_REVERSAL.desc': {
    en: 'A group lesson fee was reversed.',
    uk: 'Плату за груповий урок скасовано.',
  },
  'payment.ledger.kind.GROUP_PURCHASE.title': {
    en: 'Group lesson package purchased',
    uk: 'Куплено пакет групових уроків',
  },
  'payment.ledger.kind.GROUP_PURCHASE.desc': {
    en: 'Group lesson credits added after a successful online payment.',
    uk: 'Кредити групових уроків додано після онлайн-оплати.',
  },
  'payment.ledger.kind.GROUP_MANUAL_CREDIT.title': {
    en: 'Group lesson manual top-up',
    uk: 'Ручне поповнення групових уроків',
  },
  'payment.ledger.kind.GROUP_MANUAL_CREDIT.desc': {
    en: 'Group lesson credits added by your school.',
    uk: 'Кредити групових уроків додано школою.',
  },
  'payment.ledger.kind.GROUP_CONSUMPTION.title': {
    en: 'Group lesson completed',
    uk: 'Груповий урок завершено',
  },
  'payment.ledger.kind.GROUP_CONSUMPTION.desc': {
    en: 'One group lesson credit deducted from your prepaid balance.',
    uk: 'Один кредит групового уроку списано з балансу.',
  },
  'payment.ledger.kind.GROUP_REVERSAL.title': {
    en: 'Group lesson charge reversed',
    uk: 'Списання групового уроку скасовано',
  },
  'payment.ledger.kind.GROUP_REVERSAL.desc': {
    en: 'A previously charged group lesson was returned to your balance.',
    uk: 'Раніше списаний груповий урок повернуто на баланс.',
  },
  'payment.ledger.kind.fallback.title': { en: 'Balance adjustment', uk: 'Коригування балансу' },
  'payment.ledger.kind.fallback.desc': {
    en: 'Your lesson balance was updated.',
    uk: 'Баланс уроків оновлено.',
  },
  'lessons.subtitle': {
    en: 'Your course schedule — upcoming and past lessons in one place.',
    uk: 'Розклад курсу — майбутні й минулі уроки в одному місці.',
  },
  'profile.localeDescription': {
    en: 'Ukrainian or English for Campus chrome',
    uk: 'Українська або англійська для інтерфейсу Campus',
  },


  // —— Dashboard ——
  'dashboard.greeting': { en: 'Good morning', uk: 'Доброго ранку' },
  'dashboard.greetingAfternoon': { en: 'Good afternoon', uk: 'Добрий день' },
  'dashboard.greetingEvening': { en: 'Good evening', uk: 'Добрий вечір' },
  'dashboard.todayLessons': { en: "Today's lessons", uk: 'Уроки сьогодні' },
  'dashboard.reviewWords': { en: 'Review words', uk: 'Повторити слова' },
  'dashboard.hero.practiceNow': { en: 'Practice now', uk: 'Практикувати' },
  'dashboard.empty.noLessons': { en: 'No lessons today', uk: 'Сьогодні немає уроків' },
  'dashboard.subtitle.withStreak': {
    en: "{date} · You're on a {days}-day streak — keep it up!",
    uk: '{date} · У вас серія {days} дн. — так тримати!',
  },
  'dashboard.hero.todayLearning': { en: 'Today in your learning', uk: 'Сьогодні у навчанні' },
  'dashboard.hero.nextSchedule': { en: 'Next on your schedule', uk: 'Далі в розкладі' },
  'dashboard.hero.vocabFocus': { en: 'Vocabulary focus', uk: 'Фокус на словнику' },
  'dashboard.hero.quickAction': { en: 'Quick action', uk: 'Швидка дія' },
  'dashboard.hero.openLesson': { en: 'Open lesson', uk: 'Відкрити урок' },
  'dashboard.hero.goPractice': { en: 'Go to practice', uk: 'До практики' },
  'dashboard.hero.vocabReview': { en: 'Vocabulary review', uk: 'Повторення словника' },
  'dashboard.hero.wordsDue': { en: '{count} words due', uk: '{count} слів на повторення' },
  'dashboard.hero.wordDue': { en: '{count} word due', uk: '{count} слово на повторення' },
  'dashboard.hero.keepPracticing': { en: 'Keep practicing', uk: 'Продовжуйте практику' },
  'dashboard.hero.teachingDay': { en: 'Your teaching day', uk: 'Ваш навчальний день' },
  'dashboard.hero.practiceHint': {
    en: 'Build your streak with a quick session',
    uk: 'Підтримайте серію короткою сесією',
  },
  'dashboard.hero.staffPracticeHint': {
    en: 'Open practice tools and resources',
    uk: 'Відкрийте інструменти практики та матеріали',
  },
  'dashboard.date.today': { en: 'Today', uk: 'Сьогодні' },
  'dashboard.date.tomorrow': { en: 'Tomorrow', uk: 'Завтра' },
  'dashboard.lessonStatus.planned': { en: 'Planned', uk: 'Заплановано' },
  'dashboard.lessonStatus.completed': { en: 'Completed', uk: 'Завершено' },
  'dashboard.lessonStatus.cancelled': { en: 'Cancelled', uk: 'Скасовано' },
  'dashboard.lessonStatus.in_progress': { en: 'In progress', uk: 'Триває' },
  'dashboard.locked': { en: 'Locked', uk: 'Заблоковано' },
  'dashboard.goalTier.easy': { en: 'Easy', uk: 'Легко' },
  'dashboard.goalTier.medium': { en: 'Medium', uk: 'Середньо' },
  'dashboard.goalTier.hard': { en: 'Hard', uk: 'Складно' },
  'dashboard.goalTier.expert': { en: 'Expert', uk: 'Експерт' },
  'dashboard.vocabStatus.new': { en: 'New', uk: 'Нове' },
  'dashboard.vocabStatus.repeated': { en: 'Repeated', uk: 'Повторено' },
  'dashboard.vocabStatus.learned': { en: 'Learned', uk: 'Вивчено' },
  'dashboard.vocabStatus.mistakes_work': { en: 'Mistakes work', uk: 'Робота над помилками' },
  'header.searchPlaceholder': {
    en: 'Search lessons, words, students…',
    uk: 'Пошук уроків, слів, учнів…',
  },
  'students.status.active': { en: 'active', uk: 'активний' },
  'students.status.inactive': { en: 'inactive', uk: 'неактивний' },
  'students.status.archived': { en: 'archived', uk: 'в архіві' },
  'students.status.paused': { en: 'paused', uk: 'на паузі' },
  'students.status.leaved': { en: 'left', uk: 'вийшов' },
  'students.status.blocked': { en: 'blocked', uk: 'заблоковано' },
  'dashboard.hero.mastered': { en: '{pct}% mastered', uk: '{pct}% опановано' },
  'dashboard.stat.lessonsToday': { en: 'lessons today', uk: 'уроків сьогодні' },
  'dashboard.stat.thisWeek': { en: 'this week', uk: 'цього тижня' },
  'dashboard.stat.vocabCards': { en: 'vocab cards', uk: 'карток слів' },
  'dashboard.stat.upcoming': { en: 'upcoming', uk: 'надалі' },
  'dashboard.stat.students': { en: 'students', uk: 'учнів' },
  'dashboard.stat.dayStreak': { en: 'day streak', uk: 'днів поспіль' },
  'dashboard.stat.toReview': { en: 'to review', uk: 'на перевірку' },
  'dashboard.tile.vocabCards': { en: 'Vocabulary cards', uk: 'Картки слів' },
  'dashboard.tile.lessonsToday': { en: 'Lessons today', uk: 'Уроки сьогодні' },
  'dashboard.tile.lessonsCompleted': { en: 'Lessons completed', uk: 'Уроків завершено' },
  'dashboard.tile.allTime': { en: 'All-time, from backend', uk: 'За весь час' },
  'dashboard.tile.backendOffline': { en: 'Backend offline', uk: 'Бекенд недоступний' },
  'dashboard.tile.students': { en: 'Students', uk: 'Учні' },
  'dashboard.tile.onRoster': { en: 'On your roster', uk: 'У вашому списку' },
  'dashboard.tile.homeworkReview': { en: 'Homework to review', uk: 'ДЗ на перевірку' },
  'dashboard.tile.awaitingCheck': { en: 'Submitted, awaiting check', uk: 'Здано, очікує перевірки' },
  'dashboard.tile.allCaughtUp': { en: 'All caught up', uk: 'Усе перевірено' },
  'dashboard.calendarArrow': { en: 'Calendar →', uk: 'Календар →' },
  'dashboard.allWordsArrow': { en: 'All words →', uk: 'Усі слова →' },
  'dashboard.allLessonsArrow': { en: 'All lessons →', uk: 'Усі уроки →' },
  'dashboard.allArrow': { en: 'All →', uk: 'Усі →' },
  'dashboard.empty.fetching': { en: 'Fetching your schedule.', uk: 'Завантажуємо розклад.' },
  'dashboard.empty.clearToday': { en: 'Your calendar is clear for today.', uk: 'На сьогодні розклад порожній.' },
  'dashboard.empty.noWordsDue': { en: 'No words due for review right now.', uk: 'Зараз немає слів на повторення.' },
  'dashboard.scheduledLesson': { en: 'Scheduled lesson', uk: 'Запланований урок' },
  'dashboard.goals.loadError': { en: 'Could not load goals.', uk: 'Не вдалося завантажити цілі.' },
  'dashboard.goals.retry': { en: 'Retry', uk: 'Повторити' },
  'dashboard.goals.completedOf': {
    en: '{completed} of {total} completed',
    uk: '{completed} з {total} виконано',
  },
  'dashboard.goals.none': { en: 'No goals for today', uk: 'На сьогодні немає цілей' },
  'dashboard.goals.done': { en: 'Done', uk: 'Готово' },
  'dashboard.goals.completed': { en: 'Completed', uk: 'Виконано' },
  'dashboard.goals.inProgress': { en: 'In progress', uk: 'У процесі' },
  'dashboard.word.loadError': { en: 'Could not load word.', uk: 'Не вдалося завантажити слово.' },
  'dashboard.word.empty': {
    en: 'Add vocabulary cards to get a word of the day.',
    uk: 'Додайте картки слів, щоб зʼявилось слово дня.',
  },
  'dashboard.word.savedTitle': { en: 'Word saved', uk: 'Слово збережено' },
  'dashboard.word.savedBody': { en: 'Added to your vocabulary', uk: 'Додано до словника' },
  'dashboard.word.saveErrorTitle': { en: 'Could not save word', uk: 'Не вдалося зберегти' },
  'dashboard.word.tryAgain': { en: 'Try again', uk: 'Спробуйте ще' },
  'dashboard.word.alreadySaved': { en: 'Already saved', uk: 'Уже збережено' },
  'dashboard.word.saving': { en: 'Saving…', uk: 'Збереження…' },
  'dashboard.word.save': { en: 'Save', uk: 'Зберегти' },
  'dashboard.streak.loadError': { en: 'Could not load streak.', uk: 'Не вдалося завантажити серію.' },
  'dashboard.streak.days': { en: '{days}-day streak', uk: 'Серія {days} дн.' },
  'dashboard.streak.start': { en: 'Start your streak today', uk: 'Почніть серію сьогодні' },
  'dashboard.streak.viewCalendar': { en: 'View full calendar →', uk: 'Весь календар →' },
  'dashboard.verb.title': { en: 'Irregular verb of the day', uk: 'Неправильне дієслово дня' },
  'dashboard.verb.grammar': { en: 'Grammar', uk: 'Граматика' },
  'dashboard.verb.pastSimple': { en: 'Past simple', uk: 'Past simple' },
  'dashboard.verb.pastParticiple': { en: 'Past participle', uk: 'Past participle' },
  'dashboard.verb.practice': { en: 'Practice verbs', uk: 'Практикувати дієслова' },
  'dashboard.quick.newLesson': { en: 'New lesson', uk: 'Новий урок' },
  'dashboard.homework.title': { en: 'Homework to review', uk: 'ДЗ на перевірку' },
  'dashboard.homework.empty': {
    en: 'No submitted homework waiting for review.',
    uk: 'Немає зданого ДЗ на перевірку.',
  },
  'dashboard.students.title': { en: 'My students', uk: 'Мої учні' },
  'dashboard.students.empty': { en: 'No students assigned yet.', uk: 'Ще немає призначених учнів.' },
  'dashboard.students.total': { en: '{count} students total', uk: 'Усього учнів: {count}' },
  'dashboard.students.fallback': { en: 'Student', uk: 'Учень' },
  'dashboard.month.title': { en: 'Lessons this month', uk: 'Уроки цього місяця' },
  'dashboard.month.count': {
    en: '{count} lesson on your calendar',
    uk: '{count} урок у календарі',
  },
  'dashboard.month.countPlural': {
    en: '{count} lessons on your calendar',
    uk: '{count} уроків у календарі',
  },
  'dashboard.month.openCalendar': { en: 'Open calendar →', uk: 'Відкрити календар →' },
  'dashboard.week.title': { en: 'Coming up this week', uk: 'На цьому тижні' },
  'dashboard.reviewWordsTitle': { en: 'Review words', uk: 'Повторити слова' },
  'dashboard.openCalendar': { en: 'Open calendar', uk: 'Відкрити календар' },
  'dashboard.openVocabulary': { en: 'Open vocabulary', uk: 'Відкрити словник' },
  'dashboard.cal.mon': { en: 'M', uk: 'Пн' },
  'dashboard.cal.tue': { en: 'T', uk: 'Вт' },
  'dashboard.cal.wed': { en: 'W', uk: 'Ср' },
  'dashboard.cal.thu': { en: 'T', uk: 'Чт' },
  'dashboard.cal.fri': { en: 'F', uk: 'Пт' },
  'dashboard.cal.sat': { en: 'S', uk: 'Сб' },
  'dashboard.cal.sun': { en: 'S', uk: 'Нд' },
  'dashboard.lessonCount': { en: '{count} lesson', uk: '{count} урок' },
  'dashboard.lessonCountPlural': { en: '{count} lessons', uk: '{count} уроків' },
  'dashboard.min': { en: '{n} min', uk: '{n} хв' },

  // —— Practice hub ——
  'practice.title': { en: 'Practice', uk: 'Практика' },
  'practice.subtitle': {
    en: 'Pick an activity: build vocabulary like in the Vocabulary area, or run drills like in the Quiz — all from one place.',
    uk: 'Оберіть активність: словник, вікторини чи інші вправи — все в одному місці.',
  },
  'practice.activity.vocab.title': { en: 'Vocabulary', uk: 'Словник' },
  'practice.activity.vocab.description': {
    en: 'Search and organize your words, track new vs known, and flip through flashcards to memorize faster.',
    uk: 'Шукайте й упорядковуйте слова, відстежуйте нові та вивчені, повторюйте з картками.',
  },
  'practice.activity.vocab.tag': { en: 'Words', uk: 'Слова' },
  'practice.activity.quiz.title': { en: 'Quiz', uk: 'Вікторина' },
  'practice.activity.quiz.description': {
    en: 'Multiple-choice and fill-in questions on grammar and vocabulary with explanations after each answer.',
    uk: 'Тести з варіантами та заповненням пропусків з поясненнями після відповіді.',
  },
  'practice.activity.quiz.tag': { en: 'Grammar', uk: 'Граматика' },
  'practice.activity.speaking.title': { en: 'Speaking', uk: 'Говоріння' },
  'practice.activity.speaking.description': {
    en: 'Discussion topics with optional vocabulary prompts, voice recording, and teacher feedback.',
    uk: 'Теми для обговорення з підказками, записом голосу та фідбеком викладача.',
  },
  'practice.activity.speaking.tag': { en: 'Live', uk: 'Наживо' },
  'practice.activity.irregular.title': { en: 'Irregular verbs', uk: 'Неправильні дієслова' },
  'practice.activity.irregular.description': {
    en: 'Browse the full irregular verb table and run a Three Forms Drill on past simple and past participle.',
    uk: 'Таблиця неправильних дієслів і тренування трьох форм.',
  },
  'practice.activity.irregular.tag': { en: 'Grammar', uk: 'Граматика' },
  'practice.activity.games.title': { en: 'Games', uk: 'Ігри' },
  'practice.activity.games.description': {
    en: 'Learn through mini-games and timed challenges that reinforce vocabulary in context.',
    uk: 'Міні-ігри та таймерні челенджі для закріплення словника.',
  },
  'practice.activity.games.tag': { en: 'Soon', uk: 'Скоро' },
  'practice.activity.games.stat': { en: 'Coming soon', uk: 'Незабаром' },
  'practice.activity.challenges.title': { en: 'Challenges', uk: 'Челенджі' },
  'practice.activity.challenges.description': {
    en: 'Take weekly learning challenges and compare progress with your own best streaks.',
    uk: 'Тижневі челенджі та порівняння зі своїми найкращими серіями.',
  },
  'practice.activity.challenges.tag': { en: 'Soon', uk: 'Скоро' },
  'practice.activity.challenges.stat': { en: 'Coming soon', uk: 'Незабаром' },
  'practice.stat.allCaughtUp': { en: 'All caught up', uk: 'Усе зроблено' },
  'practice.stat.reviewOne': { en: '1 to review', uk: '1 на повторення' },
  'practice.stat.reviewMany': { en: '{count} to review', uk: '{count} на повторення' },
  'practice.stat.quizOne': { en: '1 quiz left', uk: '1 вікторина' },
  'practice.stat.quizMany': { en: '{count} quizzes left', uk: '{count} вікторин' },
  'practice.stat.topicOne': { en: '1 topic due', uk: '1 тема' },
  'practice.stat.topicMany': { en: '{count} topics due', uk: '{count} тем' },
  'practice.stat.topics': { en: 'Topics', uk: 'Теми' },
  'practice.stat.commonVerbs': { en: '{count} common verbs', uk: '{count} поширених дієслів' },
  'practice.statsTitle': { en: 'Stats', uk: 'Статистика' },
  'practice.fullDashboard': { en: 'Full dashboard →', uk: 'Весь дашборд →' },
  'practice.loadError': {
    en: 'Could not load practice stats.',
    uk: 'Не вдалося завантажити статистику практики.',
  },
  'practice.comingSoon': { en: 'Coming soon', uk: 'Незабаром' },
  'practice.focus.dueReview': { en: 'Due for review', uk: 'На повторення' },
  'practice.focus.vocabQueue': { en: 'Vocabulary queue', uk: 'Черга словника' },
  'practice.focus.quizzesOpen': { en: 'Quizzes open', uk: 'Відкриті вікторини' },
  'practice.focus.readyFinish': { en: 'Ready to finish', uk: 'Готові до завершення' },
  'practice.metric.newWords': { en: 'New words learned', uk: 'Нових слів вивчено' },
  'practice.metric.quizzesCompleted': { en: 'Quizzes completed', uk: 'Вікторин завершено' },
  'practice.metric.speakingSessions': { en: 'Speaking sessions', uk: 'Сесій говоріння' },
  'practice.metric.timePracticing': { en: 'Time practicing', uk: 'Час практики' },
  'practice.metric.hours': { en: '{h}h', uk: '{h} год' },
  'practice.metric.minutesShort': { en: '{m}m', uk: '{m} хв' },

  // —— Vocabulary / quiz ——
  'vocabulary.title': { en: 'Vocabulary', uk: 'Словник' },
  'vocabulary.readOnly': { en: '(read only)', uk: '(лише перегляд)' },
  'vocabulary.subtitle.loading': { en: 'Loading your word library…', uk: 'Завантажуємо словник…' },
  'vocabulary.subtitle.count': {
    en: '{count} words · list, flashcards, or practice quiz',
    uk: '{count} слів · список, картки або вікторина',
  },
  'vocabulary.subtitle.countOne': {
    en: '{count} word · list, flashcards, or practice quiz',
    uk: '{count} слово · список, картки або вікторина',
  },
  'vocabulary.backAria': { en: 'Back to practice', uk: 'Назад до практики' },
  'vocabulary.mode.aria': { en: 'Vocabulary mode', uk: 'Режим словника' },
  'vocabulary.mode.list': { en: 'List', uk: 'Список' },
  'vocabulary.mode.flashcards': { en: 'Flashcards', uk: 'Картки' },
  'vocabulary.mode.play': { en: 'Play', uk: 'Гра' },
  'vocabulary.stat.filterAria': { en: 'Filter words by status', uk: 'Фільтр слів за статусом' },
  'vocabulary.stat.total': { en: 'Total', uk: 'Усього' },
  'vocabulary.status.new': { en: 'New', uk: 'Нове' },
  'vocabulary.status.repeated': { en: 'Repeated', uk: 'Повторено' },
  'vocabulary.status.mistakes_work': { en: 'Review', uk: 'На перевірку' },
  'vocabulary.status.learned': { en: 'Learned', uk: 'Вивчено' },
  'vocabulary.filter.all': { en: 'All', uk: 'Усі' },
  'vocabulary.filter.posAria': { en: 'Part of speech', uk: 'Частина мови' },
  'vocabulary.filter.search': { en: 'Search words...', uk: 'Пошук слів…' },
  'vocabulary.filter.allLessons': { en: 'All lessons', uk: 'Усі уроки' },
  'vocabulary.filter.lesson': { en: 'Lesson', uk: 'Урок' },
  'vocabulary.category.general': { en: 'General', uk: 'Загальне' },
  'vocabulary.add.placeholder': {
    en: 'Add a word or phrase (English), e.g. touch base',
    uk: 'Додайте слово чи фразу (англійською), напр. touch base',
  },
  'vocabulary.add.submit': { en: 'Add word', uk: 'Додати слово' },
  'vocabulary.add.adding': { en: 'Adding…', uk: 'Додаємо…' },
  'vocabulary.add.failed': { en: 'Failed to add word', uk: 'Не вдалося додати слово' },
  'vocabulary.add.enterWord': { en: 'Enter a word or phrase.', uk: 'Введіть слово або фразу.' },
  'vocabulary.add.englishOnly': {
    en: 'Only English words and short phrases are supported (letters, spaces, hyphen, apostrophe).',
    uk: 'Підтримуються лише англійські слова й короткі фрази (літери, пробіли, дефіс, апостроф).',
  },
  'vocabulary.add.notFound': {
    en: 'No dictionary entry for this word or phrase. Check the spelling.',
    uk: 'Немає запису в словнику для цього слова чи фрази. Перевірте написання.',
  },
  'vocabulary.empty.noMatch': { en: 'No words match filters', uk: 'Немає слів за фільтрами' },
  'vocabulary.empty.noMatchHint': {
    en: 'Try a different filter or clear search.',
    uk: 'Спробуйте інший фільтр або очистіть пошук.',
  },
  'vocabulary.empty.flashNoMatchHint': {
    en: 'Try a different lesson, part of speech, or clear search.',
    uk: 'Спробуйте інший урок, частину мови або очистіть пошук.',
  },
  'vocabulary.empty.loading': { en: 'Loading vocabulary…', uk: 'Завантаження словника…' },
  'vocabulary.empty.fetching': { en: 'Fetching your words.', uk: 'Отримуємо ваші слова.' },
  'vocabulary.empty.noWords': { en: 'No words yet', uk: 'Ще немає слів' },
  'vocabulary.empty.noWordsHint': {
    en: 'Add your first word using the form above.',
    uk: 'Додайте перше слово у формі вище.',
  },
  'vocabulary.remove.title': { en: 'Remove word?', uk: 'Видалити слово?' },
  'vocabulary.remove.message': {
    en: 'This word will be removed from your vocabulary list.',
    uk: 'Слово буде видалено зі словника.',
  },
  'vocabulary.remove.confirm': { en: 'Remove', uk: 'Видалити' },
  'vocabulary.remove.error': { en: 'Could not remove word', uk: 'Не вдалося видалити слово' },
  'vocabulary.detailsAria': { en: 'All information', uk: 'Уся інформація' },
  'vocabulary.removeAria': { en: 'Remove word', uk: 'Видалити слово' },
  'vocabulary.fc.stillLearning': { en: 'Still learning', uk: 'Ще вчу' },
  'vocabulary.fc.gotIt': { en: 'Got it', uk: 'Зрозумів' },
  'vocabulary.fc.synonyms': { en: 'Synonyms', uk: 'Синоніми' },
  'vocabulary.fc.prev': { en: '← Prev', uk: '← Назад' },
  'vocabulary.fc.next': { en: 'Next', uk: 'Далі' },
  'vocabulary.fc.allDone': { en: 'All done!', uk: 'Готово!' },
  'vocabulary.fc.allDoneSub': {
    en: 'You went through all {count} words. Great work!',
    uk: 'Ви пройшли всі {count} слів. Чудова робота!',
  },
  'vocabulary.fc.restart': { en: 'Start over', uk: 'Спочатку' },
  'vocabulary.play.ready': { en: 'Ready to play', uk: 'Готові грати' },
  'vocabulary.play.descEmpty': {
    en: 'No words match your current filters. Add vocabulary or change the source below.',
    uk: 'Немає слів за поточними фільтрами. Додайте слова або змініть джерело нижче.',
  },
  'vocabulary.play.descNeedTwo': {
    en: 'Need at least two words with translations (or definitions) in this set to build answer choices. Add another word or switch the source filter.',
    uk: 'Потрібно щонайменше два слова з перекладами (або визначеннями), щоб зібрати варіанти. Додайте слово або змініть джерело.',
  },
  'vocabulary.play.descDefault': {
    en: 'You will see an English word and choose the correct translation from four options. New and mistakes work words are prioritized when using the default source.',
    uk: 'Побачите англійське слово й оберете правильний переклад з чотирьох варіантів. Нові слова та «на перевірку» мають пріоритет за замовчуванням.',
  },
  'vocabulary.play.wordsInSet': { en: '{count} words in this set', uk: '{count} слів у наборі' },
  'vocabulary.play.wordInSet': { en: '{count} word in this set', uk: '{count} слово в наборі' },
  'vocabulary.play.source': { en: 'Word source', uk: 'Джерело слів' },
  'vocabulary.play.sourceAria': { en: 'Play source', uk: 'Джерело для гри' },
  'vocabulary.play.withoutLesson': { en: 'Without lesson', uk: 'Без уроку' },
  'vocabulary.play.lastLesson': { en: 'Last lesson', uk: 'Останній урок' },
  'vocabulary.play.byLesson': { en: 'By lesson', uk: 'За уроком' },
  'vocabulary.play.selectLesson': { en: 'Select lesson', uk: 'Оберіть урок' },
  'vocabulary.play.play': { en: 'Play', uk: 'Грати' },
  'vocabulary.play.chooseTranslation': { en: 'Choose the correct translation', uk: 'Оберіть правильний переклад' },
  'vocabulary.play.correct': { en: 'Correct!', uk: 'Правильно!' },
  'vocabulary.play.notQuite': { en: 'Not quite', uk: 'Не зовсім' },
  'vocabulary.play.correctAnswer': { en: 'Correct answer: {answer}', uk: 'Правильна відповідь: {answer}' },
  'vocabulary.play.finish': { en: 'Finish game', uk: 'Завершити гру' },
  'vocabulary.play.check': { en: 'Check Answer', uk: 'Перевірити' },
  'vocabulary.play.seeResults': { en: 'See Results →', uk: 'Результати →' },
  'vocabulary.play.nextQuestion': { en: 'Next Question →', uk: 'Наступне →' },
  'vocabulary.play.roundComplete': { en: 'Round complete', uk: 'Раунд завершено' },
  'vocabulary.play.correctCount': { en: '{score} / {total} correct', uk: '{score} / {total} правильно' },
  'vocabulary.play.newRound': { en: 'New round', uk: 'Новий раунд' },
  'vocabulary.play.confirmBadge': { en: 'Confirmation', uk: 'Підтвердження' },
  'vocabulary.play.finishNow': { en: 'Finish game now?', uk: 'Завершити гру зараз?' },
  'vocabulary.play.finishBody': {
    en: 'Your current progress will be saved and results will be shown immediately.',
    uk: 'Поточний прогрес буде збережено, результати покажемо одразу.',
  },
  'vocabulary.play.continue': { en: 'Continue game', uk: 'Продовжити' },
  'vocabulary.play.saveFinish': { en: 'Save & finish', uk: 'Зберегти й завершити' },
  'quiz.title': { en: 'Quiz & Practice', uk: 'Вікторини та практика' },
  'quiz.subtitle': {
    en: 'Test your grammar and vocabulary knowledge',
    uk: 'Перевірте граматику та словник',
  },
  'quiz.backAria': { en: 'Back to practice', uk: 'Назад до практики' },
  'quiz.backOverviewAria': { en: 'Back to quiz overview', uk: 'Назад до вікторин' },
  'quiz.hero.noQuizzes': { en: 'No available quizzes yet', uk: 'Поки немає доступних вікторин' },
  'quiz.hero.meta': {
    en: '{count} questions · about {minutes} minutes.',
    uk: '{count} питань · близько {minutes} хв.',
  },
  'quiz.hero.metaEmpty': {
    en: 'Create a quiz in the grid below, then press Start Quiz.',
    uk: 'Створіть вікторину нижче, потім натисніть «Почати».',
  },
  'quiz.stat.questions': { en: 'Questions', uk: 'Питання' },
  'quiz.stat.minutes': { en: 'Minutes', uk: 'Хвилини' },
  'quiz.stat.quizzes': { en: 'Quizzes', uk: 'Вікторини' },
  'quiz.start': { en: 'Start quiz', uk: 'Почати вікторину' },
  'quiz.startCard': { en: 'Start Quiz', uk: 'Почати' },
  'quiz.yourQuizzes': { en: 'Your quizzes', uk: 'Ваші вікторини' },
  'quiz.manageQuizzes': { en: 'Manage quizzes', uk: 'Керування вікторинами' },
  'quiz.yourSub': {
    en: 'Complete assigned quizzes and review your scores',
    uk: 'Пройдіть призначені вікторини та перегляньте результати',
  },
  'quiz.manageSub': {
    en: 'Create, assign and track quiz progress',
    uk: 'Створюйте, призначайте й відстежуйте прогрес',
  },
  'quiz.empty.student': {
    en: 'No quizzes assigned yet. Check back after your next lesson.',
    uk: 'Ще немає призначених вікторин. Загляньте після наступного уроку.',
  },
  'quiz.empty.staff': {
    en: 'Generate a quiz from your vocabulary to get started.',
    uk: 'Згенеруйте вікторину зі словника, щоб почати.',
  },
  'quiz.empty.default': { en: 'No quizzes yet.', uk: 'Поки немає вікторин.' },
  'quiz.error.noQuestions': { en: 'This quiz has no questions.', uk: 'У цій вікторині немає питань.' },
  'quiz.error.notFound': {
    en: 'Quiz not found or has no questions.',
    uk: 'Вікторину не знайдено або в ній немає питань.',
  },
  'quiz.error.loadFailed': { en: 'Failed to load quiz', uk: 'Не вдалося завантажити вікторину' },
  'quiz.error.submitFailed': { en: 'Failed to submit quiz', uk: 'Не вдалося надіслати вікторину' },
  'quiz.delete.title': { en: 'Delete quiz?', uk: 'Видалити вікторину?' },
  'quiz.delete.message': {
    en: 'This quiz will be permanently deleted.',
    uk: 'Вікторину буде видалено назавжди.',
  },
  'quiz.delete.confirm': { en: 'Delete', uk: 'Видалити' },
  'quiz.delete.aria': { en: 'Delete quiz', uk: 'Видалити вікторину' },
  'quiz.source.vocabulary': { en: 'Vocabulary', uk: 'Словник' },
  'quiz.source.lesson': { en: 'Lesson', uk: 'Урок' },
  'quiz.source.mixed': { en: 'Mixed', uk: 'Змішане' },
  'quiz.source.manual': { en: 'Manual', uk: 'Вручну' },
  'quiz.diff.easy': { en: 'easy', uk: 'легка' },
  'quiz.diff.medium': { en: 'medium', uk: 'середня' },
  'quiz.diff.hard': { en: 'hard', uk: 'складна' },
  'quiz.card.questions': { en: '{count} questions', uk: '{count} питань' },
  'quiz.card.questionOne': { en: '{count} question', uk: '{count} питання' },
  'quiz.card.created': { en: 'Created {date}', uk: 'Створено {date}' },
  'quiz.card.yourScore': { en: 'Your score', uk: 'Ваш результат' },
  'quiz.card.studentScore': { en: 'Student score', uk: 'Результат учня' },
  'quiz.card.notCompleted': { en: 'Not completed yet', uk: 'Ще не пройдено' },
  'quiz.card.tryAgain': { en: 'Try again', uk: 'Спробувати знову' },
  'quiz.card.open': { en: 'Open', uk: 'Відкрити' },
  'quiz.card.preview': { en: 'Preview', uk: 'Перегляд' },
  'quiz.card.practice': { en: 'Practice', uk: 'Практика' },
  'quiz.play.cancel': { en: 'Cancel', uk: 'Скасувати' },
  'quiz.play.check': { en: 'Check Answer', uk: 'Перевірити' },
  'quiz.play.next': { en: 'Next Question →', uk: 'Наступне →' },
  'quiz.play.submit': { en: 'Submit quiz', uk: 'Надіслати' },
  'quiz.play.finishPractice': { en: 'Finish practice', uk: 'Завершити практику' },
  'quiz.play.typeAnswer': { en: 'Type your answer here...', uk: 'Введіть відповідь…' },
  'quiz.play.correct': { en: 'Correct!', uk: 'Правильно!' },
  'quiz.play.notQuite': { en: 'Not quite', uk: 'Не зовсім' },
  'quiz.play.correctLabel': { en: 'Correct: {answer}', uk: 'Правильно: {answer}' },
  'quiz.play.listen': { en: 'Listen', uk: 'Слухати' },
  'quiz.result.practiceComplete': { en: 'Practice complete', uk: 'Практику завершено' },
  'quiz.result.excellent': { en: 'Excellent work!', uk: 'Чудова робота!' },
  'quiz.result.good': { en: 'Good job!', uk: 'Добре!' },
  'quiz.result.keep': { en: 'Keep practicing!', uk: 'Продовжуйте практику!' },
  'quiz.result.pctCorrect': { en: '{pct}% correct', uk: '{pct}% правильно' },
  'quiz.result.practiceHint': {
    en: 'Practice runs are not saved for the student.',
    uk: 'Практичні спроби не зберігаються для учня.',
  },
  'quiz.result.mistakesHint': {
    en: '{count} mistakes added to your vocabulary review queue.',
    uk: '{count} помилок додано до черги повторення словника.',
  },
  'quiz.result.mistakeHintOne': {
    en: '{count} mistake added to your vocabulary review queue.',
    uk: '{count} помилку додано до черги повторення словника.',
  },
  'quiz.result.reviewMistakes': { en: 'Review mistakes', uk: 'Розбір помилок' },
  'quiz.result.yourAnswer': { en: 'Your answer: {answer}', uk: 'Ваша відповідь: {answer}' },
  'quiz.result.correctAnswer': { en: 'Correct: {answer}', uk: 'Правильно: {answer}' },
  'quiz.result.openWord': { en: 'Open word', uk: 'Відкрити слово' },
  'quiz.result.correct': { en: 'Correct', uk: 'Правильно' },
  'quiz.result.wrong': { en: 'Wrong', uk: 'Неправильно' },
  'quiz.result.accuracy': { en: 'Accuracy', uk: 'Точність' },
  'quiz.result.retry': { en: 'Try again', uk: 'Ще раз' },
  'quiz.result.close': { en: 'Back to quizzes', uk: 'До вікторин' },
  'quiz.result.allCorrect': {
    en: 'All answers correct — great recall!',
    uk: 'Усі відповіді правильні — чудова памʼять!',
  },
  'quiz.topic.tag': { en: 'Quiz', uk: 'Вікторина' },

  // —— Speaking practice ——
  'speaking.title': { en: 'Speaking practice', uk: 'Практика говоріння' },
  'speaking.subtitle': {
    en: 'Create discussion topics, use vocabulary prompts, record your voice, and get teacher feedback.',
    uk: 'Створюйте теми для обговорення, використовуйте підказки зі словника, записуйте голос і отримуйте зворотний звʼязок від викладача.',
  },
  'speaking.backAria': { en: 'Back to practice', uk: 'Назад до практики' },
  'speaking.newTopic': { en: 'New practice topic', uk: 'Нова тема для практики' },
  'speaking.createTopic': { en: 'Create speaking topic', uk: 'Створити тему говоріння' },
  'speaking.createTitle': { en: 'Create speaking topic', uk: 'Створити тему говоріння' },
  'speaking.createTitleStaff': {
    en: 'New speaking topic for student',
    uk: 'Нова тема говоріння для учня',
  },
  'speaking.assignedTopics': { en: 'Assigned topics', uk: 'Призначені теми' },
  'speaking.loadingTopics': { en: 'Loading topics…', uk: 'Завантаження тем…' },
  'speaking.empty.title': { en: 'No speaking topics yet', uk: 'Ще немає тем для говоріння' },
  'speaking.empty.student': {
    en: 'Create a topic for yourself or wait for your teacher to assign one.',
    uk: 'Створіть тему самостійно або зачекайте, доки викладач призначить.',
  },
  'speaking.empty.staff': {
    en: 'Create a topic above to practice speaking, or assign topics from a student profile.',
    uk: 'Створіть тему вище для практики або призначте теми з профілю учня.',
  },
  'speaking.reviewSection': { en: 'Recordings to review', uk: 'Записи на перевірку' },
  'speaking.loadingSubmissions': { en: 'Loading submissions…', uk: 'Завантаження відповідей…' },
  'speaking.empty.submissionsTitle': { en: 'No submissions yet', uk: 'Ще немає відповідей' },
  'speaking.empty.submissionsDesc': {
    en: 'When a student records a response, it will appear here for review.',
    uk: 'Коли учень запише відповідь, вона зʼявиться тут для перевірки.',
  },
  'speaking.delete.title': { en: 'Delete speaking topic?', uk: 'Видалити тему говоріння?' },
  'speaking.delete.message': {
    en: 'This topic and its submissions will be removed.',
    uk: 'Цю тему та всі відповіді буде видалено.',
  },
  'speaking.delete.confirm': { en: 'Delete', uk: 'Видалити' },
  'speaking.delete.aria': { en: 'Delete topic', uk: 'Видалити тему' },
  'speaking.form.title': { en: 'Title', uk: 'Назва' },
  'speaking.form.prompt': { en: 'Discussion prompt', uk: 'Підказка для обговорення' },
  'speaking.form.titlePlaceholder': { en: 'Weekend plans', uk: 'Плани на вихідні' },
  'speaking.form.promptPlaceholder': {
    en: 'Talk for one minute about how you usually spend your weekends.',
    uk: 'Поговоріть хвилину про те, як ви зазвичай проводите вихідні.',
  },
  'speaking.form.personalNote': { en: 'Personal note (optional)', uk: 'Особиста нотатка (необовʼязково)' },
  'speaking.form.dueDate': { en: 'Due date (optional)', uk: 'Дедлайн (необовʼязково)' },
  'speaking.form.cancel': { en: 'Cancel', uk: 'Скасувати' },
  'speaking.form.creating': { en: 'Creating…', uk: 'Створюємо…' },
  'speaking.form.create': { en: 'Create topic', uk: 'Створити тему' },
  'speaking.status.reviewed': { en: 'Reviewed', uk: 'Перевірено' },
  'speaking.status.submitted': { en: 'Submitted', uk: 'Надіслано' },
  'speaking.status.pending': { en: 'Pending', uk: 'Очікує' },
  'speaking.record': { en: 'Record', uk: 'Записати' },
  'speaking.reRecord': { en: 'Re-record', uk: 'Перезаписати' },
  'speaking.cancel': { en: 'Cancel', uk: 'Скасувати' },
  'speaking.yourRecording': { en: 'Your recording', uk: 'Ваш запис' },
  'speaking.teacherFeedback': { en: 'Teacher feedback', uk: 'Відгук викладача' },
  'speaking.words.label': { en: 'Words to use (optional)', uk: 'Слова для використання (необовʼязково)' },
  'speaking.words.empty': {
    en: 'No vocabulary cards yet — add words below or from the student deck.',
    uk: 'Ще немає карток словника — додайте слова нижче або з колоди учня.',
  },
  'speaking.words.lastLesson': { en: 'Last lesson', uk: 'Останній урок' },
  'speaking.words.addPlaceholder': { en: 'Add word via lookup…', uk: 'Додати слово через пошук…' },
  'speaking.words.add': { en: 'Add', uk: 'Додати' },
  'speaking.review.noAudio': { en: 'No audio uploaded yet.', uk: 'Аудіо ще не завантажено.' },
  'speaking.review.teacherComment': { en: 'Teacher comment', uk: 'Коментар викладача' },
  'speaking.review.commentPlaceholder': {
    en: 'Share pronunciation notes, grammar tips, or encouragement…',
    uk: 'Нотатки про вимову, граматику або заохочення…',
  },
  'speaking.review.saving': { en: 'Saving…', uk: 'Збереження…' },
  'speaking.review.save': { en: 'Save feedback', uk: 'Зберегти відгук' },
  'speaking.review.update': { en: 'Update feedback', uk: 'Оновити відгук' },
  'speaking.review.saveFailed': {
    en: 'Failed to save feedback',
    uk: 'Не вдалося зберегти відгук',
  },
  'speaking.session.ready': { en: 'Ready to record', uk: 'Готові до запису' },
  'speaking.session.recording': { en: 'Recording…', uk: 'Запис…' },
  'speaking.session.preview': { en: 'Preview', uk: 'Перегляд' },
  'speaking.session.uploading': { en: 'Uploading…', uk: 'Завантаження…' },
  'speaking.session.submitted': { en: 'Submitted', uk: 'Надіслано' },
  'speaking.session.start': { en: 'Start recording', uk: 'Почати запис' },
  'speaking.session.stop': { en: 'Stop', uk: 'Стоп' },
  'speaking.session.submit': { en: 'Submit', uk: 'Надіслати' },
  'speaking.session.done': { en: 'Done', uk: 'Готово' },
  'speaking.session.play': { en: 'Play', uk: 'Відтворити' },
  'speaking.session.pause': { en: 'Pause', uk: 'Пауза' },
  'speaking.session.playbackPosition': { en: 'Playback position', uk: 'Позиція відтворення' },
  'speaking.session.micDenied': {
    en: 'Microphone access denied',
    uk: 'Доступ до мікрофона заборонено',
  },
  'speaking.session.uploadFailed': { en: 'Upload failed', uk: 'Помилка завантаження' },

  // —— Irregular verbs ——
  'irregular.title': { en: 'Irregular verbs', uk: 'Неправильні дієслова' },
  'irregular.subtitle.table': {
    en: '{common} common · {total} total · study the table or start a drill',
    uk: '{common} поширених · {total} усього · вивчайте таблицю або почніть тренування',
  },
  'irregular.subtitle.drill': {
    en: 'Three Forms Drill — pick the missing past form',
    uk: 'Три форми — оберіть відсутню минулу форму',
  },
  'irregular.backAria': { en: 'Back to practice', uk: 'Назад до практики' },
  'irregular.tier.aria': { en: 'Verb list scope', uk: 'Обсяг списку дієслів' },
  'irregular.tier.common': { en: 'Common ({count})', uk: 'Поширені ({count})' },
  'irregular.tier.extended': { en: 'Extended ({count})', uk: 'Розширені ({count})' },
  'irregular.tierLabel.common': { en: 'common', uk: 'поширений' },
  'irregular.tierLabel.extended': { en: 'extended', uk: 'розширений' },
  'irregular.search': { en: 'Search verbs', uk: 'Пошук дієслів' },
  'irregular.searchPlaceholder': {
    en: 'Search base or past forms…',
    uk: 'Пошук базової чи минулої форми…',
  },
  'irregular.col.base': { en: 'Base form', uk: 'Базова форма' },
  'irregular.col.pastSimple': { en: 'Past simple', uk: 'Past simple' },
  'irregular.col.pastParticiple': { en: 'Past participle', uk: 'Past participle' },
  'irregular.empty.search': { en: 'No verbs match your search.', uk: 'Немає дієслів за пошуком.' },
  'irregular.play.ready': { en: 'Ready to practice?', uk: 'Готові практикувати?' },
  'irregular.play.sub': {
    en: 'Run a multiple-choice drill on the {tier} set ({count} verbs).',
    uk: 'Тест із варіантами на {tier} наборі ({count} дієслів).',
  },
  'irregular.play.button': { en: 'Play', uk: 'Грати' },
  'irregular.setup.title': { en: 'Three Forms Drill', uk: 'Три форми' },
  'irregular.setup.description': {
    en: 'See the base form and pick the correct past simple or past participle. After each answer you will see the full verb row from the table.',
    uk: 'Побачите базову форму й оберіть правильний past simple або past participle. Після відповіді зʼявиться повний рядок дієслова з таблиці.',
  },
  'irregular.setup.metaOne': { en: '{count} verb in this set', uk: '{count} дієслово в наборі' },
  'irregular.setup.metaMany': { en: '{count} verbs in this set', uk: '{count} дієслів у наборі' },
  'irregular.setup.formFocus': { en: 'Form focus', uk: 'Фокус форми' },
  'irregular.setup.formFocusAria': { en: 'Form focus', uk: 'Фокус форми' },
  'irregular.setup.mixed': { en: 'Mixed', uk: 'Змішано' },
  'irregular.setup.questions': { en: 'Questions', uk: 'Питання' },
  'irregular.setup.questionsAria': { en: 'Question count', uk: 'Кількість питань' },
  'irregular.setup.all': { en: 'All', uk: 'Усі' },
  'irregular.setup.back': { en: 'Back to table', uk: 'До таблиці' },
  'irregular.setup.start': { en: 'Start drill', uk: 'Почати тренування' },
  'irregular.session.empty': {
    en: 'Not enough verbs to build a drill. Try another set.',
    uk: 'Недостатньо дієслів для тренування. Спробуйте інший набір.',
  },
  'irregular.session.choose': { en: 'Choose the correct form', uk: 'Оберіть правильну форму' },
  'irregular.session.correctAnswer': {
    en: 'Correct answer: {answer}',
    uk: 'Правильна відповідь: {answer}',
  },
  'irregular.session.exit': { en: 'Exit drill', uk: 'Вийти з тренування' },
  'irregular.session.check': { en: 'Check answer', uk: 'Перевірити' },
  'irregular.session.next': { en: 'Next question →', uk: 'Наступне →' },
  'irregular.session.results': { en: 'See results →', uk: 'До результатів →' },
  'irregular.result.pctCorrect': { en: '{pct}% correct', uk: '{pct}% правильно' },
  'irregular.result.hint': {
    en: 'Practice runs are not saved to your vocabulary queue.',
    uk: 'Тренування не зберігаються в чергу словника.',
  },
  'irregular.result.reviewMistakes': { en: 'Review mistakes', uk: 'Розбір помилок' },
  'irregular.result.yourAnswer': { en: 'Your answer: {answer}', uk: 'Ваша відповідь: {answer}' },
  'irregular.result.correctAnswer': { en: 'Correct: {answer}', uk: 'Правильно: {answer}' },
  'irregular.result.back': { en: 'Back to table', uk: 'До таблиці' },
  'irregular.result.retry': { en: 'Play again', uk: 'Ще раз' },

  // —— Schedule / people ——
  'calendar.title': { en: 'Calendar', uk: 'Календар' },
  'calendar.subtitle.student': {
    en: 'Month and week views of your upcoming lessons',
    uk: 'Місячний і тижневий перегляд ваших майбутніх уроків',
  },
  'calendar.subtitle.week': {
    en: 'Week schedule · {count} student(s) on calendar',
    uk: 'Тижневий розклад · {count} учнів на календарі',
  },
  'calendar.subtitle.month': {
    en: 'Month overview · {count} student(s)',
    uk: 'Огляд місяця · {count} учнів',
  },
  'calendar.view.month': { en: 'Month', uk: 'Місяць' },
  'calendar.view.week': { en: 'Week', uk: 'Тиждень' },
  'calendar.view.aria': { en: 'Calendar view', uk: 'Вигляд календаря' },
  'calendar.weekScheduleAria': { en: 'Week schedule', uk: 'Тижневий розклад' },
  'calendar.audience.all': { en: 'All', uk: 'Усі' },
  'calendar.audience.myStudents': { en: 'My students', uk: 'Мої учні' },
  'calendar.audience.aria': { en: 'Calendar audience', uk: 'Аудиторія календаря' },
  'calendar.teacherFilter.aria': { en: 'Filter by teacher', uk: 'Фільтр за викладачем' },
  'calendar.teacherFilter.all': { en: 'All teachers', uk: 'Усі викладачі' },
  'calendar.requestLesson': { en: 'Request lesson', uk: 'Запросити урок' },
  'calendar.selectDate': { en: 'Select a date', uk: 'Оберіть дату' },
  'calendar.noLessons': { en: 'No lessons scheduled', uk: 'Немає запланованих уроків' },
  'calendar.openLesson': { en: 'Open lesson', uk: 'Відкрити урок' },
  'calendar.nav.prevAria': { en: 'Previous period', uk: 'Попередній період' },
  'calendar.nav.nextAria': { en: 'Next period', uk: 'Наступний період' },
  'calendar.defaultLessonTitle': { en: 'New lesson', uk: 'Новий урок' },
  'calendar.dialog.close': { en: 'Close', uk: 'Закрити' },
  'calendar.dialog.ok': { en: 'OK', uk: 'Гаразд' },
  'calendar.conflict.busyTitle': { en: 'Time slot is busy', uk: 'Час зайнятий' },
  'calendar.conflict.teacherBusy': {
    en: 'This teacher already has a lesson in this time slot.',
    uk: 'У цього викладача вже є урок у цьому слоті.',
  },
  'calendar.conflict.slotBusy': {
    en: 'Another lesson already exists for this time.',
    uk: 'На цей час уже є інший урок.',
  },
  'calendar.conflict.slotBusyCreate': {
    en: 'You cannot create or move a lesson to this time because another lesson already exists.',
    uk: 'Не можна створити або перенести урок на цей час — уже є інший урок.',
  },
  'calendar.conflict.seriesOverlap': {
    en: 'At least one lesson in this series would overlap another lesson.',
    uk: 'Принаймні один урок у серії перетинається з іншим уроком.',
  },
  'calendar.conflict.noRecurrenceSlots': {
    en: 'No open slots for this recurrence pattern.',
    uk: 'Немає вільних слотів для цього повторення.',
  },
  'calendar.conflict.pastTitle': {
    en: 'Cannot schedule in the past',
    uk: 'Не можна планувати в минулому',
  },
  'calendar.conflict.pastBody': {
    en: 'You cannot create or move a lesson to a past date or time.',
    uk: 'Не можна створити або перенести урок на минулу дату чи час.',
  },
  'calendar.conflict.pastMoveTitle': {
    en: 'Cannot move to past time',
    uk: 'Не можна перенести в минуле',
  },
  'calendar.conflict.pastMoveBody': {
    en: 'You cannot move a lesson to a past date or time.',
    uk: 'Не можна перенести урок на минулу дату чи час.',
  },
  'calendar.conflict.pastResizeTitle': {
    en: 'Cannot resize into past time',
    uk: 'Не можна змінити тривалість у минуле',
  },
  'calendar.conflict.pastResizeBody': {
    en: 'Lesson duration cannot be changed into a past time slot.',
    uk: 'Тривалість уроку не можна змінити так, щоб вона заходила в минулий час.',
  },
  'calendar.warning.couldNotSaveTime': {
    en: 'Could not save lesson time',
    uk: 'Не вдалося зберегти час уроку',
  },
  'calendar.warning.couldNotSave': {
    en: 'Could not save lesson',
    uk: 'Не вдалося зберегти урок',
  },
  'calendar.warning.couldNotDeleteSeries': {
    en: 'Could not delete series',
    uk: 'Не вдалося видалити серію',
  },
  'calendar.warning.couldNotDeleteLesson': {
    en: 'Could not delete lesson',
    uk: 'Не вдалося видалити урок',
  },
  'calendar.warning.couldNotUnlink': {
    en: 'Could not unlink lesson',
    uk: 'Не вдалося відʼєднати урок',
  },
  'calendar.warning.noTeacherTitle': {
    en: 'No teacher assigned',
    uk: 'Не призначено викладача',
  },
  'calendar.warning.noTeacherBody': {
    en: 'We could not find your teacher. Ask an administrator to assign a teacher to your account, or schedule a lesson first.',
    uk: 'Не вдалося знайти вашого викладача. Попросіть адміністратора призначити викладача або спочатку заплануйте урок.',
  },
  'calendar.warning.googleRequired': {
    en: 'Google Calendar required',
    uk: 'Потрібен Google Calendar',
  },
  'calendar.series.deletePlannedTitle': {
    en: 'Delete planned lessons in series?',
    uk: 'Видалити заплановані уроки в серії?',
  },
  'calendar.series.deletePlannedBody': {
    en: 'This will permanently delete {count} planned lesson(s). Completed and cancelled lessons stay.',
    uk: 'Буде остаточно видалено {count} запланованих уроків. Завершені та скасовані залишаться.',
  },
  'calendar.series.deleteAll': { en: 'Delete all', uk: 'Видалити всі' },
  'calendar.series.deleting': { en: 'Deleting…', uk: 'Видалення…' },
  'calendar.series.deleteLessonTitle': { en: 'Delete lesson?', uk: 'Видалити урок?' },
  'calendar.series.deleteLessonBody': {
    en: 'Are you sure you want to delete this lesson? This action cannot be undone.',
    uk: 'Ви впевнені, що хочете видалити цей урок? Цю дію не можна скасувати.',
  },
  'calendar.series.delete': { en: 'Delete', uk: 'Видалити' },
  'calendar.series.unlinkTitle': {
    en: 'Unlink this lesson from series?',
    uk: 'Відʼєднати цей урок від серії?',
  },
  'calendar.series.unlinkBody': {
    en: 'Only this lesson will be detached. Other lessons in series will remain unchanged.',
    uk: 'Відʼєднається лише цей урок. Інші уроки в серії залишаться без змін.',
  },
  'calendar.series.unlinkConfirm': { en: 'Unlink', uk: 'Відʼєднати' },
  'calendar.series.unlinking': { en: 'Unlinking…', uk: 'Відʼєднання…' },
  'lessons.title': { en: 'Lessons', uk: 'Уроки' },
  'lessons.openCalendar': { en: 'Open calendar', uk: 'Відкрити календар' },
  'lessons.highlights.aria': { en: 'Lesson highlights', uk: 'Підсумки уроків' },
  'lessons.highlights.title': { en: 'Highlights', uk: 'Підсумки' },
  'lessons.highlights.hint': {
    en: 'Next and previous checkpoints',
    uk: 'Наступний і попередній орієнтири',
  },
  'lessons.next.title': { en: 'Your next lesson', uk: 'Ваш наступний урок' },
  'lessons.prev.title': { en: 'Your previous lesson', uk: 'Ваш попередній урок' },
  'lessons.noNotes': { en: 'No lesson notes yet.', uk: 'Поки немає нотаток до уроку.' },
  'lessons.materials': { en: 'Materials:', uk: 'Матеріали:' },
  'lessons.homeworkStatus': { en: 'Homework status:', uk: 'Статус ДЗ:' },
  'lessons.hw.noneAssigned': { en: 'No homework assigned', uk: 'ДЗ не призначено' },
  'lessons.hw.opensAfter': { en: 'Opens after the lesson', uk: 'Відкриється після уроку' },
  'lessons.hw.pendingLesson': {
    en: 'Pending (lesson not completed)',
    uk: 'Очікує (урок не завершено)',
  },
  'lessons.hw.none': { en: 'No homework', uk: 'Без ДЗ' },
  'lessons.hw.accepted': { en: 'Accepted', uk: 'Прийнято' },
  'lessons.hw.submitted': { en: 'Submitted', uk: 'Надіслано' },
  'lessons.hw.needsRework': { en: 'Needs rework', uk: 'Потрібна доробка' },
  'lessons.hw.notSubmitted': { en: 'Not submitted', uk: 'Не надіслано' },
  'lessons.empty.nextTitle': { en: 'No upcoming lessons', uk: 'Немає майбутніх уроків' },
  'lessons.empty.nextHintStudent': {
    en: "Your teacher hasn't scheduled the next lesson yet. Check back soon.",
    uk: 'Викладач ще не запланував наступний урок. Загляньте пізніше.',
  },
  'lessons.empty.nextHintStaff': {
    en: 'Schedule the next lesson to keep the momentum going.',
    uk: 'Заплануйте наступний урок, щоб не втратити темп.',
  },
  'lessons.empty.scheduleCta': { en: 'Schedule a lesson', uk: 'Запланувати урок' },
  'lessons.empty.prevTitle': { en: 'No lessons yet', uk: 'Ще немає уроків' },
  'lessons.empty.prevHint': {
    en: 'Your first completed lesson will appear here.',
    uk: 'Тут зʼявиться ваш перший завершений урок.',
  },
  'lessons.durationMin': { en: '{duration} min', uk: '{duration} хв' },
  'lessons.overview.aria': { en: 'Lesson workspace overview', uk: 'Огляд робочого простору уроків' },
  'lessons.list.title': { en: 'All lessons', uk: 'Усі уроки' },
  'lessons.list.calendarView': { en: 'Calendar view →', uk: 'Календар →' },
  'lessons.list.searchPlaceholder': {
    en: 'Search title, teacher, or student...',
    uk: 'Пошук за назвою, викладачем або учнем…',
  },
  'lessons.list.searchAria': { en: 'Search lessons', uk: 'Пошук уроків' },
  'lessons.list.statusHeading': { en: 'Status', uk: 'Статус' },
  'lessons.list.filterAria': { en: 'Filter by status', uk: 'Фільтр за статусом' },
  'lessons.list.filterDone': { en: 'Done', uk: 'Готово' },
  'lessons.list.filterAll': { en: 'All', uk: 'Усі' },
  'lessons.list.showingLoaded': {
    en: 'Showing {count} loaded',
    uk: 'Показано {count} завантажених',
  },
  'lessons.list.showingLoadedMore': {
    en: 'Showing {count} loaded · scroll for more',
    uk: 'Показано {count} · гортайте далі',
  },
  'lessons.list.showingOf': {
    en: 'Showing {filtered} of {total}',
    uk: 'Показано {filtered} з {total}',
  },
  'lessons.list.loading': { en: 'Loading lessons…', uk: 'Завантаження уроків…' },
  'lessons.list.loadingMore': { en: 'Loading more lessons…', uk: 'Завантаження ще уроків…' },
  'lessons.list.allLoaded': { en: 'All lessons loaded', uk: 'Усі уроки завантажено' },
  'lessons.list.empty': { en: 'No lessons match your filters.', uk: 'Немає уроків за фільтрами.' },
  'lessons.list.openAria': { en: 'Open lesson: {title}', uk: 'Відкрити урок: {title}' },
  'lessons.list.editAria': { en: 'Edit lesson', uk: 'Редагувати урок' },
  'lessons.kind.group': { en: 'Group', uk: 'Група' },
  'lessons.kind.groupCount': { en: 'Group · {count}', uk: 'Група · {count}' },
  'lessons.kind.individual': { en: 'Individual', uk: 'Індивідуальний' },

  // —— Lesson detail (/lessons/[id]) ——
  'lessonDetail.backAria': { en: 'Back to lessons', uk: 'Назад до уроків' },
  'lessonDetail.hub.staff': { en: 'Lesson hub', uk: 'Кабінет уроку' },
  'lessonDetail.hub.student': { en: 'Materials & homework', uk: 'Матеріали та ДЗ' },
  'lessonDetail.identity': { en: 'Lesson identity', uk: 'Урок' },
  'lessonDetail.room': { en: 'Lesson room', uk: 'Кімната уроку' },
  'lessonDetail.titleLabel': { en: 'Lesson title', uk: 'Назва уроку' },
  'lessonDetail.schedulePeople': { en: 'Schedule & people', uk: 'Розклад і учасники' },
  'lessonDetail.actions': { en: 'Actions', uk: 'Дії' },
  'lessonDetail.brief': { en: 'Lesson brief', uk: 'Короткий опис' },
  'lessonDetail.briefPlaceholder': {
    en: 'Short summary for this lesson hub…',
    uk: 'Короткий опис для кабінету уроку…',
  },
  'lessonDetail.openCalendar': { en: 'Open in calendar', uk: 'Відкрити в календарі' },
  'lessonDetail.submitHomework': { en: 'Submit homework', uk: 'Надіслати ДЗ' },
  'lessonDetail.saving': { en: 'Saving…', uk: 'Збереження…' },
  'lessonDetail.submitting': { en: 'Submitting…', uk: 'Надсилання…' },
  'lessonDetail.savingAria': { en: 'Saving lesson', uk: 'Збереження уроку' },
  'lessonDetail.submittingAria': { en: 'Submitting response', uk: 'Надсилання відповіді' },
  'lessonDetail.statusAria': { en: 'Status: {status}', uk: 'Статус: {status}' },
  'lessonDetail.statusAriaChange': {
    en: 'Status: {status}. Click to change.',
    uk: 'Статус: {status}. Натисніть, щоб змінити.',
  },
  'lessonDetail.time': { en: 'Time', uk: 'Час' },
  'lessonDetail.yes': { en: 'Yes', uk: 'Так' },
  'lessonDetail.no': { en: 'No', uk: 'Ні' },
  'lessonDetail.workspace.badge': { en: 'Content workspace', uk: 'Робоча зона' },
  'lessonDetail.workspace.leadStaff': {
    en: 'Plan, materials, homework, and student response for this lesson.',
    uk: 'План, матеріали, ДЗ і відповідь учня для цього уроку.',
  },
  'lessonDetail.workspace.leadStudent': {
    en: 'Review materials and submit your homework when the lesson is complete.',
    uk: 'Перегляньте матеріали й надішліть ДЗ після завершення уроку.',
  },
  'lessonDetail.snapshot': { en: 'Lesson snapshot', uk: 'Знімок уроку' },
  'lessonDetail.prevContext': { en: 'Previous lesson context', uk: 'Контекст попереднього уроку' },
  'lessonDetail.prevHomeworkEmpty': {
    en: 'No homework notes in previous lesson.',
    uk: 'У попередньому уроці немає нотаток до ДЗ.',
  },
  'lessonDetail.prevResponseSubmitted': { en: 'Response submitted', uk: 'Відповідь надіслано' },
  'lessonDetail.prevResponsePending': { en: 'Response pending', uk: 'Відповідь очікується' },
  'lessonDetail.prevFiles': { en: 'Files: {count}', uk: 'Файли: {count}' },
  'lessonDetail.prevVocabEmpty': {
    en: 'No linked vocabulary in previous lesson.',
    uk: 'У попередньому уроці немає повʼязаного словника.',
  },
  'lessonDetail.prevEmpty': {
    en: 'No previous lesson found for this student.',
    uk: 'Попередній урок для цього учня не знайдено.',
  },
  'lessonDetail.toast.saveOk': { en: 'Lesson saved', uk: 'Урок збережено' },
  'lessonDetail.toast.saveFail': { en: 'Could not save lesson', uk: 'Не вдалося зберегти урок' },
  'lessonDetail.toast.notLinked': {
    en: 'Lesson is not linked to the server yet. Refresh and try again.',
    uk: 'Урок ще не повʼязано із сервером. Оновіть сторінку й спробуйте знову.',
  },
  'lessonDetail.toast.saveFailed': { en: 'Failed to save lesson', uk: 'Помилка збереження уроку' },
  'lessonDetail.toast.responseOk': { en: 'Response submitted', uk: 'Відповідь надіслано' },
  'lessonDetail.toast.responseFail': {
    en: 'Could not save response',
    uk: 'Не вдалося зберегти відповідь',
  },
  'lessonDetail.toast.responseFailed': {
    en: 'Failed to save response',
    uk: 'Помилка збереження відповіді',
  },
  'lessonDetail.video.joinGoogle': { en: 'Join Google Meet', uk: 'Приєднатися до Google Meet' },
  'lessonDetail.video.joinZoom': { en: 'Join Zoom', uk: 'Приєднатися до Zoom' },
  'lessonDetail.video.openMeeting': { en: 'Open meeting', uk: 'Відкрити зустріч' },
  'lessonDetail.video.joinMeeting': { en: 'Join meeting', uk: 'Приєднатися' },
  'lessonDetail.video.joinPending': { en: 'Join lesson call', uk: 'Приєднатися до уроку' },
  'lessonDetail.video.pending': { en: '(pending)', uk: '(очікує)' },
  'lessonDetail.video.pendingTitle': {
    en: 'The meeting is created when the lesson is saved.',
    uk: 'Зустріч створюється після збереження уроку.',
  },
  'lessonDetail.schedule.yourTime': { en: 'Your time', uk: 'Ваш час' },
  'lessonDetail.schedule.lessonTime': { en: 'Lesson time', uk: 'Час уроку' },
  'lessonDetail.schedule.teacherNamed': { en: 'Teacher · {name}', uk: 'Викладач · {name}' },
  'lessonDetail.schedule.studentNamed': { en: 'Student · {name}', uk: 'Учень · {name}' },
  'lessonDetail.schedule.teacher': { en: 'Teacher', uk: 'Викладач' },
  'lessonDetail.schedule.student': { en: 'Student', uk: 'Учень' },

  'students.title': { en: 'Students', uk: 'Учні' },
  'students.subtitle': { en: 'Manage learners and groups', uk: 'Учні та групи' },
  'students.subtitleTeacher': {
    en: 'Only students assigned to you',
    uk: 'Лише учні, призначені вам',
  },
  'students.subtitleAdminGroups': {
    en: 'Manage students and learning groups for your school',
    uk: 'Керуйте учнями та навчальними групами школи',
  },
  'students.subtitleAdmin': {
    en: 'All students and their assigned teachers',
    uk: 'Усі учні та їхні викладачі',
  },
  'students.tab.students': { en: 'Students', uk: 'Учні' },
  'students.tab.groups': { en: 'Groups', uk: 'Групи' },
  'students.viewAria': { en: 'Students page view', uk: 'Вигляд сторінки учнів' },
  'students.loading': { en: 'Loading students…', uk: 'Завантаження учнів…' },
  'students.loadError': { en: 'Could not load students', uk: 'Не вдалося завантажити учнів' },
  'students.unknownError': { en: 'Unknown error', uk: 'Невідома помилка' },
  'students.emptyTitle': { en: 'No students in this scope', uk: 'Немає учнів у цьому обсязі' },
  'students.emptyTeacher': {
    en: 'No students are currently assigned to you.',
    uk: 'Зараз вам не призначено учнів.',
  },
  'students.emptyAdmin': { en: 'No students found.', uk: 'Учнів не знайдено.' },
  'students.card.teacher': { en: 'Teacher: {name}', uk: 'Викладач: {name}' },
  'students.card.snapshotAria': { en: 'Learning snapshot', uk: 'Навчальний зріз' },
  'students.card.lessons': { en: 'Lessons', uk: 'Уроки' },
  'students.card.words': { en: 'Words', uk: 'Слова' },
  'students.card.streak': { en: 'Streak', uk: 'Серія' },
  'students.card.email': { en: 'Email', uk: 'Ел. пошта' },
  'students.card.openProfile': { en: 'Open profile', uk: 'Відкрити профіль' },
  'students.groups.adminOnlyTitle': {
    en: 'Groups are managed by admins',
    uk: 'Групами керують адміністратори',
  },
  'students.groups.adminOnlyDesc': {
    en: 'Your administrator configures learning groups, members, and group payment rules.',
    uk: 'Адміністратор налаштовує групи, учасників і правила оплати.',
  },
  'students.groups.intro': {
    en: 'Configure group billing and members. Teachers pick a group by name when scheduling — they do not set prices here.',
    uk: 'Налаштуйте оплату та учасників групи. Викладачі обирають групу за назвою під час планування — ціни тут не виставляють.',
  },
  'students.groups.countOne': { en: '1 group', uk: '1 група' },
  'students.groups.countMany': { en: '{count} groups', uk: '{count} груп' },
  'students.groups.new': { en: 'New group', uk: 'Нова група' },
  'students.groups.loading': { en: 'Loading groups…', uk: 'Завантаження груп…' },
  'students.groups.loadFailed': { en: 'Failed to load groups', uk: 'Не вдалося завантажити групи' },
  'students.groups.saveFailed': { en: 'Save failed', uk: 'Не вдалося зберегти' },
  'students.groups.deleteFailed': { en: 'Delete failed', uk: 'Не вдалося видалити' },
  'students.groups.deleteConfirm': { en: 'Delete this group?', uk: 'Видалити цю групу?' },
  'students.groups.emptyTitle': { en: 'No groups yet', uk: 'Поки немає груп' },
  'students.groups.emptyDesc': {
    en: 'Create a learning group so teachers can schedule shared lessons with the right members and billing defaults.',
    uk: 'Створіть навчальну групу, щоб викладачі могли планувати спільні уроки з потрібними учасниками та оплатою.',
  },
  'students.groups.noTeacher': { en: 'No teacher assigned', uk: 'Викладача не призначено' },
  'students.groups.membersCount': { en: '{count} students', uk: '{count} учнів' },
  'students.groups.perLesson': { en: ' / lesson', uk: ' / урок' },
  'students.groups.creditPerMember': { en: '1 credit / member', uk: '1 кредит / учасник' },
  'students.groups.moreMembers': { en: '+{count} more', uk: '+ще {count}' },
  'students.groups.edit': { en: 'Edit', uk: 'Редагувати' },
  'students.groups.delete': { en: 'Delete', uk: 'Видалити' },
  'students.groups.unknownStudent': { en: 'Unknown student', uk: 'Невідомий учень' },
  'students.groups.billing.perMember': { en: 'Per member', uk: 'За учасника' },
  'students.groups.billing.fixedTotal': { en: 'Fixed total', uk: 'Фіксована сума' },
  'students.groups.validation.nameRequired': {
    en: 'Group name is required.',
    uk: 'Потрібна назва групи.',
  },
  'students.groups.validation.minMembers': {
    en: 'Add at least two students to the group.',
    uk: 'Додайте щонайменше двох учнів до групи.',
  },
  'students.groups.validation.payerRequired': {
    en: 'Select a payer for single-payer billing.',
    uk: 'Оберіть платника для оплати одним учасником.',
  },
  'students.groups.validation.amountRequired': {
    en: 'Enter a fixed lesson amount greater than zero.',
    uk: 'Введіть фіксовану суму уроку більше нуля.',
  },
  'students.groups.editor.createTitle': { en: 'New learning group', uk: 'Нова навчальна група' },
  'students.groups.editor.editTitle': {
    en: 'Edit learning group',
    uk: 'Редагувати навчальну групу',
  },
  'students.groups.editor.subtitle': {
    en: 'Name the group, assign a teacher, set billing defaults, and add at least two students.',
    uk: 'Назвіть групу, призначте викладача, налаштуйте оплату та додайте щонайменше двох учнів.',
  },
  'students.groups.editor.basics': { en: 'Basics', uk: 'Основне' },
  'students.groups.editor.nameLabel': { en: 'Group name', uk: 'Назва групи' },
  'students.groups.editor.namePlaceholder': {
    en: 'e.g. B1 Evening cohort',
    uk: 'напр. вечірня група B1',
  },
  'students.groups.editor.teacherLabel': { en: 'Assigned teacher', uk: 'Призначений викладач' },
  'students.groups.editor.noTeacherOption': { en: '— No teacher —', uk: '— Без викладача —' },
  'students.groups.editor.billingTitle': { en: 'Billing defaults', uk: 'Оплата за замовчуванням' },
  'students.groups.editor.billingHint': {
    en: 'Copied onto new group lessons. Teachers cannot change prices when scheduling.',
    uk: 'Копіюється на нові групові уроки. Викладачі не можуть змінювати ціни під час планування.',
  },
  'students.groups.editor.billingModeLabel': { en: 'Billing mode', uk: 'Режим оплати' },
  'students.groups.editor.billingPerMemberOption': {
    en: '1 lesson credit per member',
    uk: '1 кредит уроку на учасника',
  },
  'students.groups.editor.billingFixedOption': {
    en: 'Fixed amount per lesson',
    uk: 'Фіксована сума за урок',
  },
  'students.groups.editor.amountLabel': { en: 'Amount (minor units)', uk: 'Сума (мінорні одиниці)' },
  'students.groups.editor.amountPlaceholder': {
    en: '45000 = 450.00',
    uk: '45000 = 450.00',
  },
  'students.groups.editor.currencyLabel': { en: 'Currency', uk: 'Валюта' },
  'students.groups.editor.splitLabel': { en: 'Split mode', uk: 'Режим розподілу' },
  'students.groups.editor.splitEqual': { en: 'Split equally', uk: 'Порівну' },
  'students.groups.editor.splitSinglePayer': { en: 'Single payer', uk: 'Один платник' },
  'students.groups.editor.payerLabel': { en: 'Payer', uk: 'Платник' },
  'students.groups.editor.payerPlaceholder': { en: 'Select payer', uk: 'Оберіть платника' },
  'students.groups.editor.searchMembersPlaceholder': {
    en: 'Search members…',
    uk: 'Пошук учасників…',
  },
  'students.groups.editor.membersTitle': { en: 'Members', uk: 'Учасники' },
  'students.groups.editor.membersHint': {
    en: 'Only students with group or mixed lesson format. Minimum two students.',
    uk: 'Лише учні з груповим або змішаним форматом уроків. Мінімум двоє учнів.',
  },
  'students.groups.editor.membersSelected': { en: '{count} selected', uk: 'Обрано: {count}' },
  'students.groups.editor.membersEmpty': {
    en: 'No students added yet.',
    uk: 'Ще не додано учнів.',
  },
  'students.groups.editor.addMemberPlaceholder': {
    en: 'Search and select a student…',
    uk: 'Знайдіть і оберіть учня…',
  },
  'students.groups.editor.searchStudentsPlaceholder': {
    en: 'Search students…',
    uk: 'Пошук учнів…',
  },
  'students.groups.editor.addMember': { en: 'Add student', uk: 'Додати учня' },
  'students.groups.editor.removeMemberAria': {
    en: 'Remove {name}',
    uk: 'Видалити {name}',
  },
  'students.groups.editor.cancel': { en: 'Cancel', uk: 'Скасувати' },
  'students.groups.editor.createAction': { en: 'Create group', uk: 'Створити групу' },
  'students.groups.editor.saveAction': { en: 'Save changes', uk: 'Зберегти зміни' },
  'students.groups.editor.saving': { en: 'Saving…', uk: 'Збереження…' },

  'students.detail.title': { en: 'Student profile', uk: 'Профіль учня' },
  'students.detail.subtitle': {
    en: 'Overview, progress, billing, and lesson history',
    uk: 'Огляд, прогрес, оплата та історія уроків',
  },
  'students.detail.backAria': { en: 'Back to students', uk: 'Назад до учнів' },
  'students.detail.notFoundTitle': { en: 'Student not found', uk: 'Учня не знайдено' },
  'students.detail.notFoundDesc': {
    en: 'Check the student link and try again.',
    uk: 'Перевірте посилання на учня та спробуйте знову.',
  },
  'students.detail.noPermissionTitle': { en: 'No permission', uk: 'Немає доступу' },
  'students.detail.noPermissionDesc': {
    en: 'You cannot manage this student.',
    uk: 'Ви не можете керувати цим учнем.',
  },
  'students.detail.openChatAria': { en: 'Open chat with {name}', uk: 'Відкрити чат з {name}' },
  'students.detail.openChatTitle': { en: 'Open chat', uk: 'Відкрити чат' },
  'students.detail.loadingPage': { en: 'Loading student page', uk: 'Завантаження сторінки учня' },
  'students.detail.loadingTab': { en: 'Loading tab content', uk: 'Завантаження вкладки' },
  'students.detail.tabsAria': { en: 'Student profile tabs', uk: 'Вкладки профілю учня' },
  'students.detail.tab.lessons': { en: 'Lessons', uk: 'Уроки' },
  'students.detail.tab.billing': { en: 'Billing', uk: 'Оплата' },
  'students.detail.tab.practice': { en: 'Practice', uk: 'Практика' },
  'students.detail.saveStudent': { en: 'Save student data', uk: 'Зберегти дані учня' },
  'students.detail.unavailable.title': { en: '{feature} unavailable', uk: '{feature} недоступно' },
  'students.detail.unavailable.linkBackend': {
    en: 'Link this student to a backend account first.',
    uk: 'Спочатку привʼяжіть учня до акаунта в системі.',
  },
  'students.detail.scheduleFixed': { en: 'Fixed schedule', uk: 'Фіксований розклад' },
  'students.detail.scheduleFlexible': { en: 'Flexible schedule', uk: 'Гнучкий розклад' },
  'students.detail.balanceIndividual': { en: 'Individual balance', uk: 'Індивідуальний баланс' },
  'students.detail.balanceIndividualRate': {
    en: 'Individual balance · {price}/lesson',
    uk: 'Індивідуальний баланс · {price}/урок',
  },
  'students.detail.balanceGroup': { en: 'Group billing', uk: 'Групова оплата' },
  'students.detail.debt': { en: 'debt', uk: 'борг' },
  'students.detail.perLesson': { en: '/lesson', uk: '/урок' },
  'students.detail.lessonFormat.individualOnly': {
    en: 'Individual only',
    uk: 'Лише індивідуальні',
  },
  'students.detail.lessonFormat.groupOnly': { en: 'Group only', uk: 'Лише групові' },
  'students.detail.lessonFormat.mixed': {
    en: 'Individual & group',
    uk: 'Індивідуальні та групові',
  },
  'students.detail.lessons.title': { en: 'Lessons', uk: 'Уроки' },
  'students.detail.lessons.intro': {
    en: 'Browse all lessons for this student. Individual and group lessons may use different billing rules.',
    uk: 'Усі уроки цього учня. Індивідуальні та групові уроки можуть мати різні правила оплати.',
  },
  'students.detail.lessons.emptyTitle': { en: 'No lessons yet', uk: 'Поки немає уроків' },
  'students.detail.lessons.emptyDesc': {
    en: 'Plan a lesson in the Schedule tab.',
    uk: 'Заплануйте урок у вкладці «Розклад».',
  },
  'students.detail.lessons.filterAria': {
    en: 'Filter lessons by format',
    uk: 'Фільтр уроків за форматом',
  },
  'students.detail.lessons.filterAll': { en: 'All', uk: 'Усі' },
  'students.detail.lessons.filterIndividual': { en: 'Individual', uk: 'Індивідуальні' },
  'students.detail.lessons.filterGroup': { en: 'Group', uk: 'Групові' },
  'students.detail.lessons.emptyFilter': {
    en: 'No lessons match your filters.',
    uk: 'Немає уроків за вашими фільтрами.',
  },
  'students.detail.lessons.emptyFilterKind': {
    en: 'No {kind} lessons for this student.',
    uk: 'Немає {kind} уроків для цього учня.',
  },
  'students.detail.statsIntro': {
    en: 'Lessons, vocabulary, practice, quizzes, speaking, and daily goals for the selected period.',
    uk: 'Уроки, лексика, практика, вікторини, говоріння та щоденні цілі за обраний період.',
  },
  'students.detail.practice.title': { en: 'Practice', uk: 'Практика' },
  'students.detail.practice.introStaff': {
    en: 'Vocabulary and quizzes for this student — generate assignments, track progress, and preview as staff.',
    uk: 'Лексика та вікторини учня — створюйте завдання, відстежуйте прогрес і переглядайте як персонал.',
  },
  'students.detail.practice.introStudent': {
    en: 'Your vocabulary and assigned quizzes in one place.',
    uk: 'Ваша лексика та призначені вікторини в одному місці.',
  },
  'students.detail.practice.areasAria': { en: 'Practice areas', uk: 'Розділи практики' },
  'students.detail.practice.vocabulary': { en: 'Vocabulary', uk: 'Лексика' },
  'students.detail.practice.quiz': { en: 'Quiz', uk: 'Вікторина' },
  'students.detail.practice.speaking': { en: 'Speaking', uk: 'Говоріння' },
  'students.detail.practice.badgeMistakes': {
    en: '{count} in mistakes work',
    uk: '{count} на виправлення',
  },
  'students.detail.practice.badgeIncomplete': {
    en: '{count} incomplete',
    uk: '{count} незавершених',
  },
  'students.detail.vocab.removeTitle': { en: 'Remove word?', uk: 'Видалити слово?' },
  'students.detail.vocab.removeMessage': {
    en: 'This word will be removed from the student vocabulary.',
    uk: 'Це слово буде видалено зі словника учня.',
  },
  'students.detail.vocab.removeConfirm': { en: 'Remove', uk: 'Видалити' },
  'students.detail.vocab.removeFailed': {
    en: 'Could not remove word',
    uk: 'Не вдалося видалити слово',
  },
  'students.detail.vocab.allLessons': { en: 'All lessons', uk: 'Усі уроки' },
  'students.detail.vocab.lessonLabel': { en: 'Lesson', uk: 'Урок' },
  'students.detail.quiz.deleteTitle': { en: 'Delete quiz?', uk: 'Видалити вікторину?' },
  'students.detail.quiz.deleteMessage': {
    en: 'This quiz will be permanently deleted for this student.',
    uk: 'Цю вікторину буде остаточно видалено для цього учня.',
  },
  'students.detail.quiz.loading': { en: 'Loading quizzes…', uk: 'Завантаження вікторин…' },
  'students.detail.quiz.emptyStaff': {
    en: 'No quizzes yet. Use the create card to generate one from this student’s vocabulary.',
    uk: 'Поки немає вікторин. Створіть їх із лексики учня.',
  },
  'students.detail.quiz.emptyStudent': { en: 'No quizzes assigned yet.', uk: 'Поки немає призначених вікторин.' },
  'students.detail.quiz.titleStaff': { en: 'Quizzes', uk: 'Вікторини' },
  'students.detail.quiz.titleStudent': { en: 'Your quizzes', uk: 'Ваші вікторини' },
  'students.detail.quiz.introStaff': {
    en: 'Generated from this student’s vocabulary. Scores appear after they complete a quiz.',
    uk: 'Згенеровано з лексики учня. Результати зʼявляться після проходження.',
  },
  'students.detail.quiz.introStudent': {
    en: 'Complete assigned quizzes and review your scores.',
    uk: 'Проходьте призначені вікторини та переглядайте результати.',
  },
  'students.detail.quiz.assignedAria': { en: 'Assigned quizzes', uk: 'Призначені вікторини' },
  'students.detail.speaking.deleteTitle': {
    en: 'Delete speaking topic?',
    uk: 'Видалити тему для говоріння?',
  },
  'students.detail.speaking.deleteMessage': {
    en: 'This topic will be removed for this student.',
    uk: 'Цю тему буде видалено для цього учня.',
  },
  'students.detail.speaking.assignedTopics': {
    en: 'Assigned topics',
    uk: 'Призначені теми',
  },
  'students.detail.speaking.loadingTopics': { en: 'Loading topics…', uk: 'Завантаження тем…' },
  'students.detail.speaking.emptyTopics': { en: 'No speaking topics', uk: 'Немає тем для говоріння' },
  'students.detail.speaking.emptyTopicsDesc': {
    en: 'Create a discussion topic with optional vocabulary words for this student.',
    uk: 'Створіть тему для обговорення з опційними словами з лексики учня.',
  },
  'students.detail.speaking.recordingsTitle': {
    en: 'Recordings to review',
    uk: 'Записи на перевірку',
  },
  'students.detail.speaking.loadingSubmissions': {
    en: 'Loading submissions…',
    uk: 'Завантаження відповідей…',
  },
  'students.detail.speaking.emptySubmissions': { en: 'No submissions yet', uk: 'Поки немає відповідей' },
  'students.detail.speaking.emptySubmissionsDesc': {
    en: 'When the student records a response, it will appear here for review.',
    uk: 'Коли учень запише відповідь, вона зʼявиться тут для перевірки.',
  },
  'students.detail.billing.loading': { en: 'Loading billing…', uk: 'Завантаження оплати…' },
  'students.detail.billing.loadFailed': {
    en: 'Failed to load billing',
    uk: 'Не вдалося завантажити оплату',
  },
  'students.detail.billing.eyebrow': {
    en: 'Student details → Billing',
    uk: 'Профіль учня → Оплата',
  },
  'students.detail.billing.workspaceTitle': { en: 'Billing workspace', uk: 'Робоча область оплати' },
  'students.detail.billing.workspaceDesc': {
    en: 'Manage how the student pays, which package options they see, and how offline invoice payments are credited into lesson balance.',
    uk: 'Керуйте оплатою учня, пакетами та зарахуванням офлайн-платежів на баланс уроків.',
  },
  'students.detail.billing.tagRules': { en: 'Rules', uk: 'Правила' },
  'students.detail.billing.tagPricing': { en: 'Pricing', uk: 'Ціни' },
  'students.detail.billing.tagPackages': { en: 'Packages', uk: 'Пакети' },
  'students.detail.billing.tagManualCredits': { en: 'Manual credits', uk: 'Ручні кредити' },
  'students.detail.billing.individualLessons': { en: 'Individual lessons', uk: 'Індивідуальні уроки' },
  'students.detail.billing.groupLessons': { en: 'Group lessons', uk: 'Групові уроки' },
  'students.detail.billing.lessonsCount': { en: '{count} lessons', uk: '{count} уроків' },
  'students.detail.billing.groupCredits': {
    en: '{count} group lesson credits',
    uk: '{count} групових кредитів',
  },
  'students.detail.billing.individualHint': {
    en: 'Prepaid credits consumed per completed individual lesson.',
    uk: 'Передплачені кредити списуються за кожен завершений індивідуальний урок.',
  },
  'students.detail.billing.groupHint': {
    en: 'Per-member groups consume group credits. Fixed-total groups bill via monetary charges on the ledger.',
    uk: 'Групи «за учасника» списують групові кредити. Групи з фіксованою сумою — через грошові записи.',
  },
  'students.detail.billing.rate': { en: 'Rate:', uk: 'Тариф:' },
  'students.detail.billing.rateHidden': { en: 'Hidden', uk: 'Приховано' },
  'students.detail.billing.perLesson': { en: 'per lesson', uk: 'за урок' },
  'students.detail.billing.perGroupLesson': {
    en: 'per group lesson (per-member)',
    uk: 'за груповий урок (за учасника)',
  },
  'students.detail.billing.lessonBalance': { en: 'Lesson balance', uk: 'Баланс уроків' },
  'students.detail.billing.lessonBalanceHint': {
    en: 'Manual credits and lesson consumption change this number.',
    uk: 'Ручні кредити та списання уроків змінюють це число.',
  },
  'students.detail.billing.billingMode': { en: 'Billing mode', uk: 'Режим оплати' },
  'students.detail.billing.pricePerLesson': { en: 'Price per lesson', uk: 'Ціна за урок' },
  'students.detail.billing.customRate': { en: 'Custom student rate', uk: 'Індивідуальний тариф учня' },
  'students.detail.billing.platformRate': { en: 'Platform default rate', uk: 'Тариф платформи за замовчуванням' },
  'students.detail.billing.selfServePackages': { en: 'Self-serve packages', uk: 'Пакети самообслуговування' },
  'students.detail.billing.packagesActive': { en: '{count} active', uk: '{count} активних' },
  'students.detail.billing.packagesHidden': { en: 'Hidden', uk: 'Приховано' },
  'students.detail.billing.minPackage': {
    en: 'Min package size: {count} lessons',
    uk: 'Мін. розмір пакета: {count} уроків',
  },
  'students.detail.billing.rulesSaved': { en: 'Billing rules saved.', uk: 'Правила оплати збережено.' },
  'students.detail.billing.rulesSaveFailed': {
    en: 'Save billing rules failed',
    uk: 'Не вдалося зберегти правила оплати',
  },
  'students.detail.billing.selectManualTemplate': {
    en: 'Select at least one manual invoice template for Manual invoice.',
    uk: 'Оберіть хоча б один шаблон рахунку для ручної оплати.',
  },
  'students.detail.billing.pricingSaved': { en: 'Pricing saved.', uk: 'Ціни збережено.' },
  'students.detail.billing.pricingSaveFailed': {
    en: 'Save pricing failed',
    uk: 'Не вдалося зберегти ціни',
  },
  'students.detail.billing.invalidPrice': {
    en: 'Enter a valid price per lesson or leave the field empty.',
    uk: 'Введіть коректну ціну за урок або залиште поле порожнім.',
  },
  'students.detail.billing.invalidGroupPrice': {
    en: 'Enter a valid group price per lesson or leave the field empty.',
    uk: 'Введіть коректну групову ціну за урок або залиште поле порожнім.',
  },
  'students.detail.billing.credited': { en: 'Lessons credited.', uk: 'Уроки зараховано.' },
  'students.detail.billing.adjustFailed': { en: 'Adjust failed', uk: 'Не вдалося скоригувати' },
  'profile.school.title': { en: 'School settings', uk: 'Налаштування школи' },
  'profile.school.hint': {
    en: 'Scheduling, lesson format, teacher assignment, and calendar color.',
    uk: 'Розклад, формат уроків, викладач і колір у календарі.',
  },
  'profile.school.assignedTeacher': { en: 'Assigned teacher', uk: 'Призначений викладач' },
  'profile.school.scheduleType': { en: 'Schedule type', uk: 'Тип розкладу' },
  'profile.school.scheduleFixed': { en: 'Fixed schedule', uk: 'Фіксований розклад' },
  'profile.school.scheduleFlexible': { en: 'Flexible schedule', uk: 'Гнучкий розклад' },
  'profile.school.lessonFormat': { en: 'Lesson format', uk: 'Формат уроків' },
  'profile.school.lessonFormatHintAdmin': {
    en: 'Which lesson types this student can take.',
    uk: 'Які типи уроків може відвідувати цей учень.',
  },
  'profile.school.lessonFormatHintViewer': {
    en: 'How this student participates in individual and group lessons.',
    uk: 'Як учень бере участь в індивідуальних і групових уроках.',
  },
  'profile.school.lessonFormatAria': { en: 'Lesson format', uk: 'Формат уроків' },
  'profile.school.formatIndividual': { en: 'Individual', uk: 'Індивідуальні' },
  'profile.school.formatGroup': { en: 'Group', uk: 'Групові' },
  'profile.school.formatBoth': { en: 'Both', uk: 'Обидва' },
  'profile.school.userColor': { en: 'User color', uk: 'Колір користувача' },

  'staff.title': { en: 'Staff', uk: 'Персонал' },
  'staff.subtitle': {
    en: 'Teachers and admins — open a profile to adjust compensation, review earnings, and view lesson statistics.',
    uk: 'Викладачі й адміни — відкрийте профіль, щоб керувати компенсацією, переглядати нарахування та статистику уроків.',
  },
  'staff.periodAria': { en: 'Staff period', uk: 'Період для персоналу' },
  'staff.refresh': { en: 'Refresh', uk: 'Оновити' },
  'staff.loadError': { en: 'Could not load staff roster', uk: 'Не вдалося завантажити список персоналу' },
  'staff.unknownError': { en: 'Unknown error', uk: 'Невідома помилка' },
  'staff.loading': { en: 'Loading staff…', uk: 'Завантаження персоналу…' },
  'staff.emptyTitle': { en: 'No staff members found', uk: 'Працівників не знайдено' },
  'staff.emptyDesc': { en: 'No other teachers or admins in this period.', uk: 'У цьому періоді немає інших викладачів чи адмінів.' },
  'staff.role.teacher': { en: 'Teacher', uk: 'Викладач' },
  'staff.role.admin': { en: 'Admin', uk: 'Адмін' },
  'staff.role.superAdmin': { en: 'Super admin', uk: 'Супер-адмін' },
  'staff.card.snapshotAria': { en: 'Compensation snapshot', uk: 'Зріз компенсації' },
  'staff.card.lessons': { en: 'Lessons', uk: 'Уроки' },
  'staff.card.accrued': { en: 'Accrued', uk: 'Нараховано' },
  'staff.card.due': { en: 'Due', uk: 'До виплати' },
  'staff.card.nextPay': { en: 'Next pay', uk: 'Наступна виплата' },
  'staff.card.openProfile': { en: 'Open profile', uk: 'Відкрити профіль' },
  'staff.compensation.perLesson': { en: 'Per lesson', uk: 'За урок' },
  'staff.compensation.salary': { en: 'Salary', uk: 'Оклад' },
  'staff.compensation.mixed': { en: 'Mixed', uk: 'Змішано' },
  'staff.compensation.frequency.weekly': { en: 'Weekly', uk: 'Щотижня' },
  'staff.compensation.frequency.monthly': { en: 'Monthly', uk: 'Щомісяця' },
  'staff.payout.onTrack': { en: 'On track', uk: 'За графіком' },
  'staff.payout.due': { en: 'Due', uk: 'До виплати' },
  'staff.payout.overdue': { en: 'Overdue', uk: 'Прострочено' },
  'stats.range.aria': { en: 'Statistics range', uk: 'Період статистики' },
  'stats.range.week': { en: 'Week', uk: 'Тиждень' },
  'stats.range.month': { en: 'Month', uk: 'Місяць' },
  'stats.range.quarter': { en: 'Quarter', uk: 'Квартал' },
  'stats.range.year': { en: 'Year', uk: 'Рік' },
  'stats.range.custom': { en: 'Custom', uk: 'Власний' },
  'stats.range.from': { en: 'From', uk: 'Від' },
  'stats.range.to': { en: 'To', uk: 'До' },
  'chat.title': { en: 'Chat', uk: 'Чат' },
  'chat.search.placeholder': {
    en: 'Search conversations...',
    uk: 'Пошук розмов…',
  },
  'chat.search.aria': { en: 'Search conversations', uk: 'Пошук розмов' },
  'chat.noMessagesYet': { en: 'No messages yet', uk: 'Ще немає повідомлень' },
  'chat.yesterday': { en: 'Yesterday', uk: 'Вчора' },
  'chat.newMessageAria': { en: 'New message', uk: 'Нове повідомлення' },
  'chat.createGroupAria': { en: 'Create group', uk: 'Створити групу' },
  'chat.empty.title': { en: 'Your messages', uk: 'Ваші повідомлення' },
  'chat.empty.hint': {
    en: 'Choose a conversation from the inbox to continue.',
    uk: 'Оберіть розмову зі списку, щоб продовжити.',
  },
  'chat.conversationAria': { en: 'Conversation', uk: 'Розмова' },
  'chat.withAria': { en: 'Chat with {name}', uk: 'Чат з {name}' },
  'chat.members': { en: '{count} members', uk: '{count} учасників' },
  'chat.backAria': { en: 'Back to conversations', uk: 'Назад до розмов' },
  'chat.retentionBanner': {
    en: 'Files shared in chat are deleted automatically after 24 hours.',
    uk: 'Файли в чаті автоматично видаляються через 24 години.',
  },
  'chat.loadingOlder': {
    en: 'Loading older messages…',
    uk: 'Завантаження старіших повідомлень…',
  },
  'chat.historyStart': {
    en: 'Beginning of conversation',
    uk: 'Початок розмови',
  },
  'chat.loadingMessages': { en: 'Loading messages…', uk: 'Завантаження повідомлень…' },
  'chat.attach.confirmTitle': { en: 'Attach a file?', uk: 'Прикріпити файл?' },
  'chat.attach.confirmBody': {
    en: 'Files sent in chat are automatically deleted after 24 hours. Everyone in this conversation will lose access after that.',
    uk: 'Файли в чаті автоматично видаляються через 24 години. Після цього доступ матиме ніхто в цій розмові.',
  },
  'chat.attach.confirmLabel': { en: 'Choose file', uk: 'Обрати файл' },
  'chat.attach.aria': { en: 'Attach file', uk: 'Прикріпити файл' },
  'chat.composer.placeholder': { en: 'Type a message...', uk: 'Напишіть повідомлення…' },
  'chat.composer.messageAria': { en: 'Message', uk: 'Повідомлення' },
  'chat.emoji.insertAria': { en: 'Insert emoji', uk: 'Вставити емодзі' },
  'chat.emoji.listAria': { en: 'Emoji', uk: 'Емодзі' },
  'chat.send.aria': { en: 'Send message', uk: 'Надіслати повідомлення' },
  'chat.sending': { en: 'Sending…', uk: 'Надсилання…' },
  'chat.error.sendTitle': {
    en: 'Could not send message',
    uk: 'Не вдалося надіслати повідомлення',
  },
  'chat.error.tryAgain': { en: 'Try again', uk: 'Спробуйте ще раз' },
  'chat.error.filesRejected': {
    en: 'Some files were rejected',
    uk: 'Деякі файли відхилено',
  },
  'chat.error.filesRejectedDetail': {
    en: 'Allowed types only, max {max} MB. Rejected: {files}',
    uk: 'Лише дозволені типи, макс. {max} МБ. Відхилено: {files}',
  },
  'chat.error.uploadTitle': {
    en: 'Could not upload file',
    uk: 'Не вдалося завантажити файл',
  },
  'chat.attachment.expired': {
    en: 'File expired — chat files are deleted after 24 hours.',
    uk: 'Файл прострочено — файли чату видаляються через 24 години.',
  },
  'chat.attachment.availableUntil': {
    en: 'Available until {when}',
    uk: 'Доступний до {when}',
  },
  'chat.dm.badge': { en: 'Direct message', uk: 'Особисте повідомлення' },
  'chat.dm.title': { en: 'New message', uk: 'Нове повідомлення' },
  'chat.dm.hint': {
    en: 'Start a 1:1 conversation with a student, teacher, or admin.',
    uk: 'Почніть діалог 1:1 з учнем, викладачем або адміном.',
  },
  'chat.dm.searchPlaceholder': { en: 'Search people...', uk: 'Пошук людей…' },
  'chat.dm.searchAria': { en: 'Search people', uk: 'Пошук людей' },
  'chat.dm.empty': {
    en: 'No people match your search.',
    uk: 'Нікого не знайдено за запитом.',
  },
  'chat.dm.cancel': { en: 'Cancel', uk: 'Скасувати' },
  'chat.group.badge': { en: 'Group chat', uk: 'Груповий чат' },
  'chat.group.title': { en: 'Create group chat', uk: 'Створити груповий чат' },
  'chat.group.hint': {
    en: 'Add a title and choose members. You can adjust participants later.',
    uk: 'Додайте назву й оберіть учасників. Склад можна змінити пізніше.',
  },
  'chat.group.nameLabel': { en: 'Group name', uk: 'Назва групи' },
  'chat.group.namePlaceholder': { en: 'e.g. Study group', uk: 'напр. Навчальна група' },
  'chat.group.selectMembers': { en: 'Select members', uk: 'Оберіть учасників' },
  'chat.group.selectMembersCount': {
    en: 'Select members ({count})',
    uk: 'Оберіть учасників ({count})',
  },
  'chat.group.emptyContacts': {
    en: 'No contacts available for a group yet.',
    uk: 'Поки немає контактів для групи.',
  },
  'chat.group.cancel': { en: 'Cancel', uk: 'Скасувати' },
  'chat.group.create': { en: 'Create', uk: 'Створити' },
  'materials.title': { en: 'Materials', uk: 'Матеріали' },
  'materials.subtitle': {
    en: 'School library of boards, presentations, books, and reusable lesson resources.',
    uk: 'Бібліотека школи: дошки, презентації, книги та ресурси для уроків.',
  },
  'materials.add': { en: 'Add material', uk: 'Додати матеріал' },
  'materials.stat.total': { en: 'Total', uk: 'Усього' },
  'materials.stat.boards': { en: 'Boards', uk: 'Дошки' },
  'materials.stat.presentations': { en: 'Presentations', uk: 'Презентації' },
  'materials.stat.books': { en: 'Books', uk: 'Книги' },
  'materials.searchPlaceholder': { en: 'Search materials…', uk: 'Пошук матеріалів…' },
  'materials.searchAria': { en: 'Search materials', uk: 'Пошук матеріалів' },
  'materials.viewModeAria': { en: 'View mode', uk: 'Режим перегляду' },
  'materials.view.grid': { en: 'Grid', uk: 'Сітка' },
  'materials.view.list': { en: 'List', uk: 'Список' },
  'materials.loading': { en: 'Loading materials…', uk: 'Завантаження матеріалів…' },
  'materials.refreshing': { en: 'Refreshing library…', uk: 'Оновлення бібліотеки…' },
  'materials.loadError': { en: 'Could not load materials', uk: 'Не вдалося завантажити матеріали' },
  'materials.unknownError': { en: 'Unknown error', uk: 'Невідома помилка' },
  'materials.emptyTitle': { en: 'No materials yet', uk: 'Поки немає матеріалів' },
  'materials.emptyDesc': {
    en: 'Add your first board, presentation, or book to build the school library.',
    uk: 'Додайте першу дошку, презентацію або книгу до бібліотеки школи.',
  },
  'materials.loadMore': { en: 'Load more', uk: 'Завантажити ще' },
  'materials.loadingShort': { en: 'Loading…', uk: 'Завантаження…' },
  'materials.recovery.title': { en: 'Interrupted upload', uk: 'Перерване завантаження' },
  'materials.recovery.body': {
    en: 'Saving “{title}” was not finished. Open the material and attach any remaining files.',
    uk: 'Збереження «{title}» не завершено. Відкрийте матеріал і додайте файли, що лишились.',
  },
  'materials.recovery.continue': { en: 'Continue editing', uk: 'Продовжити редагування' },
  'materials.recovery.dismiss': { en: 'Dismiss', uk: 'Закрити' },
  'materials.delete.title': { en: 'Delete material?', uk: 'Видалити матеріал?' },
  'materials.delete.message': {
    en: '“{title}” will be removed from the library. Lessons that already reference it keep the link until you detach it.',
    uk: '«{title}» буде видалено з бібліотеки. Уроки, що вже посилаються на нього, збережуть звʼязок, доки ви його не відʼєднаєте.',
  },
  'materials.delete.confirm': { en: 'Delete', uk: 'Видалити' },
  'materials.kind.board': { en: 'Board', uk: 'Дошка' },
  'materials.kind.presentation': { en: 'Presentation', uk: 'Презентація' },
  'materials.kind.book': { en: 'Book', uk: 'Книга' },
  'materials.kind.other': { en: 'Other', uk: 'Інше' },
  'materials.card.open': { en: 'Open', uk: 'Відкрити' },
  'materials.card.deleteAria': { en: 'Delete {title}', uk: 'Видалити {title}' },
  'materials.card.moreAssets': { en: '+{count} more', uk: '+ще {count}' },
  'materials.card.audio': { en: 'Audio', uk: 'Аудіо' },
  'materials.card.deleting': { en: 'Deleting…', uk: 'Видалення…' },
  'materials.card.fileOne': { en: '1 file', uk: '1 файл' },
  'materials.card.fileMany': { en: '{count} files', uk: '{count} файлів' },
  'materials.card.noFiles': { en: 'No files attached', uk: 'Файлів не додано' },
  'materials.form.createTitle': { en: 'Add material', uk: 'Додати матеріал' },
  'materials.form.editTitle': { en: 'Edit material', uk: 'Редагувати матеріал' },
  'materials.form.cancel': { en: 'Cancel', uk: 'Скасувати' },
  'materials.form.save': { en: 'Save changes', uk: 'Зберегти зміни' },
  'materials.form.createAction': { en: 'Create material', uk: 'Створити матеріал' },
  'materials.form.saving': { en: 'Saving…', uk: 'Збереження…' },
  'materials.form.closeAria': { en: 'Close', uk: 'Закрити' },
  'materials.form.overviewTitle': { en: 'Overview', uk: 'Огляд' },
  'materials.form.overviewHint': {
    en: 'Choose a type and give the material a clear title.',
    uk: 'Оберіть тип і дайте матеріалу зрозумілу назву.',
  },
  'materials.form.materialTypeAria': { en: 'Material type', uk: 'Тип матеріалу' },
  'materials.form.titleLabel': { en: 'Title', uk: 'Назва' },
  'materials.form.descriptionLabel': { en: 'Description', uk: 'Опис' },
  'materials.form.detailsTitle': { en: 'Details', uk: 'Деталі' },
  'materials.form.detailsHint': {
    en: 'Optional — helps teachers filter and find resources faster.',
    uk: 'Необовʼязково — допомагає вчителям швидше фільтрувати й знаходити ресурси.',
  },
  'materials.form.levelLabel': { en: 'Level', uk: 'Рівень' },
  'materials.form.publisherLabel': { en: 'Publisher', uk: 'Видавництво' },
  'materials.form.tagsLabel': { en: 'Tags', uk: 'Теги' },
  'materials.form.assetsTitle': { en: 'Assets', uk: 'Файли та посилання' },

  // —— Calendar series / lesson modal (from site-content) ——
  'calendar.series.detachTitle': { en: 'Detach from recurrence?', uk: 'Відʼєднати від серії?' },
  'calendar.series.detachBody': {
    en: 'Moving this lesson to another day will detach it from the series. Other lessons in the series stay on their dates.',
    uk: 'Перенесення уроку на інший день відʼєднає його від серії. Інші уроки залишаться на своїх датах.',
  },
  'calendar.series.detachConfirm': { en: 'Detach and move', uk: 'Відʼєднати й перенести' },
  'calendar.series.applyAllTitle': {
    en: 'Change all lessons in series?',
    uk: 'Змінити всі уроки в серії?',
  },
  'calendar.series.applyAllBody': {
    en: 'Are you sure you want to change the time for all scheduled lessons in this series?',
    uk: 'Змінити час для всіх запланованих уроків у серії?',
  },
  'calendar.series.applyAllConfirm': { en: 'Change all', uk: 'Змінити всі' },
  'calendar.series.cancel': { en: 'Cancel', uk: 'Скасувати' },
  'lessonModal.titleCreate': { en: 'Plan lesson', uk: 'Запланувати урок' },
  'lessonModal.titleEdit': { en: 'Edit lesson', uk: 'Редагувати урок' },
  'lessonModal.subtitle': {
    en: 'Configure lesson details, status and recurrence.',
    uk: 'Деталі уроку, статус і повторення.',
  },
  'lessonModal.section.setup': { en: 'Lesson planning', uk: 'Планування' },
  'lessonModal.section.content': { en: 'Lesson content', uk: 'Зміст уроку' },
  'lessonModal.field.title': { en: 'Title', uk: 'Назва' },
  'lessonModal.field.date': { en: 'Date', uk: 'Дата' },
  'lessonModal.field.startTime': { en: 'Start time', uk: 'Початок' },
  'lessonModal.field.duration': { en: 'Duration (min)', uk: 'Тривалість (хв)' },
  'lessonModal.field.recurrence': { en: 'Recurrence', uk: 'Повторення' },
  'lessonModal.field.status': { en: 'Status', uk: 'Статус' },
  'lessonModal.field.cancelReason': { en: 'Cancel reason', uk: 'Причина скасування' },
  'lessonModal.field.credited': { en: 'Credited', uk: 'Списано' },
  'lessonModal.field.weekDays': { en: 'Week days', uk: 'Дні тижня' },
  'lessonModal.field.lessonType': { en: 'Lesson type', uk: 'Тип уроку' },
  'lessonModal.field.studentGroup': { en: 'Learning group', uk: 'Група' },
  'lessonModal.field.students': { en: 'Students', uk: 'Учні' },
  'lessonModal.field.student': { en: 'Student', uk: 'Учень' },
  'lessonModal.field.lessonPlan': { en: 'Lesson plan', uk: 'План уроку' },
  'lessonModal.field.materials': { en: 'Materials', uk: 'Матеріали' },
  'lessonModal.field.homework': { en: 'Homework', uk: 'Домашнє завдання' },
  'lessonModal.field.studentResponse': { en: 'Student response', uk: 'Відповідь учня' },
  'lessonModal.field.homeworkReview': { en: 'Homework review', uk: 'Перевірка ДЗ' },
  'lessonModal.field.teacherHomeworkFeedback': { en: 'Teacher feedback', uk: 'Фідбек викладача' },
  'lessonModal.opt.noRepeat': { en: 'No repeat', uk: 'Без повторення' },
  'lessonModal.opt.daily': { en: 'Daily', uk: 'Щодня' },
  'lessonModal.opt.weekly': { en: 'Weekly', uk: 'Щотижня' },
  'lessonModal.opt.monthly': { en: 'Monthly', uk: 'Щомісяця' },
  'lessonModal.opt.planned': { en: 'Planned', uk: 'Заплановано' },
  'lessonModal.opt.completed': { en: 'Completed', uk: 'Завершено' },
  'lessonModal.opt.cancelled': { en: 'Cancelled', uk: 'Скасовано' },
  'lessonModal.opt.studentAbsent': { en: 'Student absent', uk: 'Учень відсутній' },
  'lessonModal.opt.studentRequestedCancel': {
    en: 'Student requested cancellation',
    uk: 'Учень просить скасувати',
  },
  'lessonModal.opt.teacherAbsent': { en: 'Teacher absent', uk: 'Викладач відсутній' },
  'lessonModal.opt.credited': { en: 'Credited', uk: 'Списано' },
  'lessonModal.opt.notCredited': { en: 'Not credited', uk: 'Не списано' },
  'lessonModal.opt.individual': { en: 'Individual', uk: 'Індивідуальний' },
  'lessonModal.opt.group': { en: 'Group', uk: 'Груповий' },
  'lessonModal.hint.recurrenceFixedOnly': {
    en: 'Recurrence is available only for students with a fixed schedule.',
    uk: 'Повторення доступне лише для учнів із фіксованим розкладом.',
  },
  'lessonModal.day.mon': { en: 'Mon', uk: 'Пн' },
  'lessonModal.day.tue': { en: 'Tue', uk: 'Вт' },
  'lessonModal.day.wed': { en: 'Wed', uk: 'Ср' },
  'lessonModal.day.thu': { en: 'Thu', uk: 'Чт' },
  'lessonModal.day.fri': { en: 'Fri', uk: 'Пт' },
  'lessonModal.day.sat': { en: 'Sat', uk: 'Сб' },
  'lessonModal.day.sun': { en: 'Sun', uk: 'Нд' },
  'lessonModal.material.text': { en: 'Text', uk: 'Текст' },
  'lessonModal.material.photo': { en: 'Photo', uk: 'Фото' },
  'lessonModal.material.test': { en: 'Test', uk: 'Тест' },
  'lessonModal.material.file': { en: 'File', uk: 'Файл' },
  'lessonModal.material.presentation': { en: 'Presentation', uk: 'Презентація' },
  'lessonModal.material.book': { en: 'Book', uk: 'Книга' },
  'lessonModal.material.board': { en: 'Board', uk: 'Дошка' },
  'lessonModal.action.addFile': { en: 'Add file', uk: 'Додати файл' },
  'lessonModal.action.saveMaterial': { en: 'Save material', uk: 'Зберегти матеріал' },
  'lessonModal.action.cancel': { en: 'Cancel', uk: 'Скасувати' },
  'lessonModal.action.saveLesson': { en: 'Save lesson', uk: 'Зберегти урок' },
  'lessonModal.action.updateLesson': { en: 'Update lesson', uk: 'Оновити урок' },
  'lessonModal.action.sendChangeRequest': { en: 'Send change request', uk: 'Надіслати запит' },
  'lessonModal.action.markHomeworkChecked': { en: 'Mark as checked', uk: 'Позначити перевіреним' },
  'lessonModal.action.openLessonPage': { en: 'Open lesson page', uk: 'Сторінка уроку' },
  'lessonModal.action.saving': { en: 'Saving…', uk: 'Збереження…' },
  'lessonModal.footer.student': {
    en: 'You can review lesson details and submit your response.',
    uk: 'Можете переглянути деталі уроку й надіслати відповідь.',
  },
  'lessonModal.footer.staff': {
    en: 'Changes are applied immediately after saving.',
    uk: 'Зміни застосовуються одразу після збереження.',
  },
  'lessonModal.error.titleRequired': { en: 'Title is required', uk: 'Вкажіть назву' },
  'lessonModal.error.dateRequired': { en: 'Date is required', uk: 'Вкажіть дату' },
  'lessonModal.error.startTimeRequired': { en: 'Start time is required', uk: 'Вкажіть час початку' },
  'lessonModal.placeholder.addText': { en: 'Add text...', uk: 'Додати текст…' },
  'lessonModal.msg.blockedUnsafeFiles': {
    en: 'Blocked unsafe files: {files}. Allowed: docs, slides, tables, text, images, pdf up to {max}MB.',
    uk: 'Заблоковано небезпечні файли: {files}. Дозволено: docs, slides, tables, text, images, pdf до {max}МБ.',
  },
  'lessonModal.msg.rejectedFiles': {
    en: 'Rejected: {files} (allowed up to {max}MB).',
    uk: 'Відхилено: {files} (до {max}МБ).',
  },
  'lessonModal.homeworkChecked': { en: 'Checked', uk: 'Перевірено' },
  'lessonModal.materialsHint': {
    en: 'Choose type, fill details and save',
    uk: 'Оберіть тип, заповніть і збережіть',
  },
  'lessonModal.hint.lessonPlan': {
    en: 'Keep this concise so student goals, activities, and expected outcomes are easy to scan.',
    uk: 'Коротко: цілі учня, активності та очікуваний результат мають бути зрозумілими.',
  },
  'lessonModal.hint.materials': {
    en: 'Add short context first, then attach files so students know why each resource matters.',
    uk: 'Спочатку короткий контекст, потім файли — щоб учні розуміли навіщо кожен ресурс.',
  },
  'lessonModal.hint.homework': {
    en: 'Focus on one clear action for the student and attach only files needed for completion.',
    uk: 'Одна чітка дія для учня й лише потрібні для виконання файли.',
  },
  'lessonModal.hint.studentResponse': {
    en: 'Track submission state and feedback in one place so review flow stays predictable.',
    uk: 'Статус здачі й фідбек в одному місці — щоб перевірка була передбачуваною.',
  },
  'lessonModal.opt.notSubmitted': { en: 'Not submitted', uk: 'Не надіслано' },
  'lessonModal.opt.submitted': { en: 'Submitted', uk: 'Надіслано' },
  'lessonModal.opt.needsRework': { en: 'Reopen (needs rework)', uk: 'На доробку' },
  'lessonModal.opt.accepted': { en: 'Accepted', uk: 'Прийнято' },
  'lessonModal.msg.opensAfterCompleted': {
    en: 'Opens after the lesson is completed',
    uk: 'Відкриється після завершення уроку',
  },
  'lessonModal.vocab.title': { en: 'Lesson vocabulary', uk: 'Словник уроку' },
  'lessonModal.vocab.remove': { en: 'Remove', uk: 'Прибрати' },
  'lessonModal.vocab.allInfo': { en: 'All information', uk: 'Уся інформація' },
  'lessonModal.vocab.hint': {
    en: "Type a word to look it up in our dictionary (or fetch from external sources). Then add it to this lesson and the student's vocabulary.",
    uk: 'Введіть слово для пошуку в словнику (або зовнішніх джерелах). Потім додайте його до уроку та словника учня.',
  },
  'lessonModal.vocab.placeholder': {
    en: 'English word or phrase, e.g. touch base',
    uk: 'Англійське слово або фраза, напр. touch base',
  },
  'lessonModal.vocab.add': { en: 'Add to lesson', uk: 'Додати до уроку' },
  'lessonModal.vocab.adding': { en: 'Adding…', uk: 'Додаємо…' },
  'lessonModal.vocab.lookingUp': { en: 'Looking up…', uk: 'Шукаємо…' },
  'lessonModal.vocab.inDictionary': { en: 'In dictionary', uk: 'У словнику' },
  'lessonModal.vocab.alreadyLinked': {
    en: 'This word is already linked to the lesson.',
    uk: 'Це слово вже привʼязане до уроку.',
  },
  'lessonModal.vocab.studentMissing': {
    en: 'Lesson student is not available yet. Refresh the page and try again.',
    uk: 'Учень уроку ще недоступний. Оновіть сторінку й спробуйте знову.',
  },
  'lessonModal.vocab.lookupFailed': { en: 'Lookup failed', uk: 'Помилка пошуку' },
  'lessonModal.action.addFromLibrary': { en: 'Add from library', uk: 'З бібліотеки' },
  'lessonModal.action.save': { en: 'Save', uk: 'Зберегти' },
  'lessonModal.noMaterials': { en: 'No materials added yet.', uk: 'Матеріалів ще немає.' },
  'lessonModal.fallbackMaterial': { en: 'Material', uk: 'Матеріал' },
  'lessonModal.aria.sections': { en: 'Lesson modal sections', uk: 'Розділи модалки уроку' },
  'lessonModal.aria.unlinkSeries': { en: 'Unlink lesson from series', uk: 'Відʼєднати від серії' },
  'lessonModal.aria.deleteSeries': { en: 'Delete all lessons in this series', uk: 'Видалити всю серію' },
  'lessonModal.aria.deleteLesson': { en: 'Delete lesson', uk: 'Видалити урок' },
  'lessonModal.aria.closeModal': { en: 'Close modal', uk: 'Закрити' },
  'lessonModal.aria.removeFile': { en: 'Remove file', uk: 'Видалити файл' },
  'lessonModal.aria.removeMaterial': { en: 'Remove material', uk: 'Видалити матеріал' },
  'lessonModal.aria.closeImagePreview': { en: 'Close image preview', uk: 'Закрити перегляд' },
  'lessonModal.imagePreviewAlt': { en: 'Material preview', uk: 'Перегляд матеріалу' },

  // —— Money / system ——
  'payment.title': { en: 'Payment', uk: 'Оплата' },
  'payment.packages': { en: 'Lesson packages', uk: 'Пакети уроків' },
  'payment.yourPackage': { en: 'Your lesson package', uk: 'Ваш пакет уроків' },
  'payment.bankTransfer': { en: 'Bank transfer', uk: 'Банківський переказ' },
  'payment.orBankTransfer': { en: 'Or pay by bank transfer', uk: 'Або банківським переказом' },
  'billing.title': { en: 'Subscription', uk: 'Підписка' },
  'entitlements.managePlan': { en: 'Manage plan', uk: 'Керувати планом' },
  'entitlements.storage': { en: 'Storage', uk: 'Сховище' },
  'entitlements.students': { en: 'Students', uk: 'Учні' },
  'entitlements.bytes.b': { en: 'B', uk: 'Б' },
  'entitlements.bytes.kb': { en: 'KB', uk: 'КБ' },
  'entitlements.bytes.mb': { en: 'MB', uk: 'МБ' },
  'entitlements.bytes.gb': { en: 'GB', uk: 'ГБ' },
  'entitlements.bytes.tb': { en: 'TB', uk: 'ТБ' },
  'billing.subtitle': {
    en: 'Your school plan, usage, and billing.',
    uk: 'План школи, використання та білінг.',
  },
  'billing.loading': { en: 'Loading…', uk: 'Завантаження…' },
  'billing.success': { en: 'Subscription updated — thank you!', uk: 'Підписку оновлено — дякуємо!' },
  'billing.checkoutCancelled': {
    en: 'Checkout cancelled — no changes were made.',
    uk: 'Оформлення скасовано — змін не внесено.',
  },
  'billing.loadError': { en: 'Failed to load billing', uk: 'Не вдалося завантажити дані підписки' },
  'billing.checkoutError': { en: 'Could not start checkout', uk: 'Не вдалося розпочати оформлення' },
  'billing.trialExtended': {
    en: 'Trial extended — your trial now runs until {date}.',
    uk: 'Пробний період продовжено — він триватиме до {date}.',
  },
  'billing.promoApplyError': { en: 'Could not apply promo code', uk: 'Не вдалося застосувати промокод' },
  'billing.portalError': { en: 'Could not open billing portal', uk: 'Не вдалося відкрити портал оплати' },
  'billing.currentPlan': { en: 'Current plan', uk: 'Поточний план' },
  'billing.legacyHint': { en: ' · legacy (not billed via Stripe)', uk: ' · legacy (не через Stripe)' },
  'billing.overQuota': {
    en: 'Storage quota exceeded — uploads are blocked. Upgrade to continue.',
    uk: 'Перевищено ліміт сховища — завантаження заблоковано. Оновіть план, щоб продовжити.',
  },
  'billing.unlimited': { en: ' (unlimited)', uk: ' (необмежено)' },
  'billing.openingPortal': { en: 'Opening…', uk: 'Відкриття…' },
  'billing.manageSubscription': { en: 'Manage subscription', uk: 'Керувати підпискою' },
  'billing.portalHint': {
    en: 'Change plan, update payment method, or cancel via the Stripe portal.',
    uk: 'Змініть план, спосіб оплати або скасуйте підписку через портал Stripe.',
  },
  'billing.trialPromoTitle': { en: 'Have a promo code?', uk: 'Є промокод?' },
  'billing.trialPromoHint': {
    en: 'Enter a trial-extension code to add more days to your free trial.',
    uk: 'Введіть код продовження пробного періоду, щоб додати дні до безкоштовного trial.',
  },
  'billing.trialExtensionCode': { en: 'Trial extension code', uk: 'Код продовження trial' },
  'billing.trialExtensionPlaceholder': { en: 'e.g. PARTNER30', uk: 'напр. PARTNER30' },
  'billing.applying': { en: 'Applying…', uk: 'Застосування…' },
  'billing.apply': { en: 'Apply', uk: 'Застосувати' },
  'billing.legacyNotice': {
    en: 'This school is on a legacy unlimited plan. Subscribe below to manage billing in Stripe (upgrade, invoices, cancel).',
    uk: 'Школа на legacy-плані без обмежень. Оформіть підписку нижче, щоб керувати оплатою в Stripe (апгрейд, рахунки, скасування).',
  },
  'billing.promoCode': { en: 'Promo code', uk: 'Промокод' },
  'billing.promoPlaceholder': { en: 'e.g. LAUNCH20', uk: 'напр. LAUNCH20' },
  'billing.plan.starter.name': { en: 'Starter', uk: 'Starter' },
  'billing.plan.starter.blurb': {
    en: 'Up to 50 students · 10 GB storage · lesson recordings',
    uk: 'До 50 учнів · 10 ГБ сховища · записи уроків',
  },
  'billing.plan.pro.name': { en: 'Pro', uk: 'Pro' },
  'billing.plan.pro.blurb': {
    en: 'Unlimited students · 100 GB storage · custom domain · AI assist',
    uk: 'Необмежена кількість учнів · 100 ГБ сховища · власний домен · AI assist',
  },
  'billing.redirecting': { en: 'Redirecting…', uk: 'Перенаправлення…' },
  'billing.subscribeTo': { en: 'Subscribe to {plan}', uk: 'Підписатися на {plan}' },
  'finance.title': { en: 'Finance', uk: 'Фінанси' },
  'finance.subtitle': {
    en: 'Track accrued pay, record manual payouts, and monitor outstanding balances for teachers and admins.',
    uk: 'Відстежуйте нарахування, фіксуйте ручні виплати та контролюйте заборгованість викладачів і адмінів.',
  },
  'finance.periodAria': { en: 'Finance period', uk: 'Фінансовий період' },
  'finance.refresh': { en: 'Refresh', uk: 'Оновити' },
  'finance.loadError': { en: 'Could not load finance data', uk: 'Не вдалося завантажити фінансові дані' },
  'finance.unknownError': { en: 'Unknown error', uk: 'Невідома помилка' },
  'finance.loading': { en: 'Loading finance overview…', uk: 'Завантаження фінансового огляду…' },
  'finance.kpi.accrued': { en: 'Accrued', uk: 'Нараховано' },
  'finance.kpi.paid': { en: 'Paid', uk: 'Виплачено' },
  'finance.kpi.outstanding': { en: 'Outstanding', uk: 'Залишок' },
  'finance.kpi.paidSubtext': { en: 'Recorded payouts in period', uk: 'Зафіксовані виплати за період' },
  'finance.kpi.outstandingSubtext': { en: 'Accrued minus paid (net)', uk: 'Нараховано мінус виплачено (нетто)' },
  'finance.chart.trendTitle': { en: 'Accrued vs paid trend', uk: 'Динаміка нарахувань і виплат' },
  'finance.chart.noTrend': { en: 'No trend data for this period.', uk: 'Немає даних динаміки за цей період.' },
  'finance.chart.breakdownTitle': { en: 'Staff breakdown (accrued)', uk: 'Розбивка по персоналу (нараховано)' },
  'finance.chart.noStaff': { en: 'No staff rows.', uk: 'Немає рядків персоналу.' },
  'finance.chart.accrued': { en: 'Accrued', uk: 'Нараховано' },
  'finance.chart.paid': { en: 'Paid', uk: 'Виплачено' },
  'finance.table.title': { en: 'Staff balances', uk: 'Баланси персоналу' },
  'finance.table.name': { en: 'Name', uk: "Ім'я" },
  'finance.table.role': { en: 'Role', uk: 'Роль' },
  'finance.table.mode': { en: 'Mode', uk: 'Режим' },
  'finance.table.lessons': { en: 'Lessons', uk: 'Уроки' },
  'finance.table.accrued': { en: 'Accrued', uk: 'Нараховано' },
  'finance.table.paid': { en: 'Paid', uk: 'Виплачено' },
  'finance.table.outstanding': { en: 'Outstanding', uk: 'Залишок' },
  'finance.table.nextPay': { en: 'Next pay', uk: 'Наступна виплата' },
  'finance.table.status': { en: 'Status', uk: 'Статус' },
  'finance.table.action': { en: 'Action', uk: 'Дія' },
  'finance.table.recordPayout': { en: 'Record payout', uk: 'Зафіксувати виплату' },
  'finance.error.positiveAmount': { en: 'Enter a positive payout amount.', uk: 'Введіть додатну суму виплати.' },
  'finance.error.recordFailed': { en: 'Failed to record payout', uk: 'Не вдалося зафіксувати виплату' },
  'staffPayout.record.title': { en: 'Record payout', uk: 'Зафіксувати виплату' },
  'staffPayout.record.subtitle': {
    en: 'Fix a manual payout for {name}',
    uk: 'Зафіксуйте ручну виплату для {name}',
  },
  'staffPayout.record.outstanding': { en: 'Outstanding {amount}', uk: 'Залишок {amount}' },
  'staffPayout.close': { en: 'Close', uk: 'Закрити' },
  'staffPayout.form.amount': { en: 'Amount ({currency})', uk: 'Сума ({currency})' },
  'staffPayout.form.paidOn': { en: 'Paid on', uk: 'Дата виплати' },
  'staffPayout.form.note': { en: 'Note (optional)', uk: 'Примітка (необовʼязково)' },
  'staffPayout.form.cancel': { en: 'Cancel', uk: 'Скасувати' },
  'staffPayout.form.saving': { en: 'Saving…', uk: 'Збереження…' },
  'staffPayout.form.save': { en: 'Save payout', uk: 'Зберегти виплату' },
  'staffPayout.form.recordingFor': {
    en: 'Recording payout for {name}.',
    uk: 'Фіксування виплати для {name}.',
  },
  'staffPayout.history.recentTitle': { en: 'Recent payouts', uk: 'Останні виплати' },
  'staffPayout.history.panelTitle': { en: 'Payout history', uk: 'Історія виплат' },
  'staffPayout.history.staffMember': { en: 'Staff member', uk: 'Працівник' },
  'staffPayout.history.allStaff': { en: 'All staff', uk: 'Увесь персонал' },
  'staffPayout.history.period': { en: 'Period: {label}', uk: 'Період: {label}' },
  'staffPayout.history.loading': { en: 'Loading payout history…', uk: 'Завантаження історії виплат…' },
  'staffPayout.history.empty': { en: 'No payouts recorded for this filter.', uk: 'За цим фільтром виплат не зафіксовано.' },
  'staffPayout.history.loadingMore': { en: 'Loading more…', uk: 'Завантаження…' },
  'staffPayout.history.by': { en: 'by {name}', uk: 'від {name}' },
  'staffPayout.history.loadError': { en: 'Failed to load payouts', uk: 'Не вдалося завантажити виплати' },
  'staffPayout.history.loadMoreError': { en: 'Failed to load more payouts', uk: 'Не вдалося завантажити більше виплат' },
  'offer.titleFallback': { en: 'Lesson packages', uk: 'Пакети уроків' },
  'offer.eyebrow': { en: 'Public offer', uk: 'Публічна оферта' },
  'offer.lead': {
    en: 'Prepaid language lesson credits. Digital delivery to your Campus balance — no physical shipping.',
    uk: 'Передплачені кредити на уроки. Цифрова доставка на баланс Campus — без фізичної доставки.',
  },
  'offer.loading': { en: 'Loading packages…', uk: 'Завантаження пакетів…' },
  'offer.empty': {
    en: 'No packages are published yet. Please check back later or contact the school.',
    uk: 'Пакети ще не опубліковано. Зайдіть пізніше або зверніться до школи.',
  },
  'offer.prepaidCredit': {
    en: '{lessons} lessons · prepaid credit',
    uk: '{lessons} уроків · передплачений кредит',
  },
  'offer.lessonsMeta': {
    en: '{lessons} lessons · {price} / lesson',
    uk: '{lessons} уроків · {price} / урок',
  },
  'offer.checkout': { en: 'Go to checkout', uk: 'Перейти до оплати' },
  'offer.termsLink': { en: 'Terms of offer', uk: 'Умови оферти' },
  'legal.loading': { en: 'Loading…', uk: 'Завантаження…' },
  'legal.contacts.meta': {
    en: 'Merchant details for {schoolName}',
    uk: 'Реквізити продавця для {schoolName}',
  },
  'legal.contacts.entityTitle': { en: 'Legal entity', uk: 'Юридична особа' },
  'legal.contacts.legalName': { en: 'Legal name:', uk: 'Юридична назва:' },
  'legal.contacts.address': { en: 'Address:', uk: 'Адреса:' },
  'legal.contacts.country': { en: 'Country:', uk: 'Країна:' },
  'legal.contacts.mcc': { en: 'MCC:', uk: 'MCC:' },
  'legal.contacts.mccNote': {
    en: '(Schools / Educational Services)',
    uk: '(Школи / освітні послуги)',
  },
  'legal.contacts.supportTitle': { en: 'Support', uk: 'Підтримка' },
  'legal.contacts.email': { en: 'Email:', uk: 'Ел. пошта:' },
  'legal.contacts.phone': { en: 'Phone:', uk: 'Телефон:' },
  'legal.contacts.schoolTitle': { en: 'School', uk: 'Школа' },
  'legal.contacts.notPublished': { en: 'Not published yet', uk: 'Ще не опубліковано' },
  'legal.contacts.schoolFallback': { en: 'this school', uk: 'цієї школи' },
  'legal.contacts.schoolUnavailable': {
    en: 'School name unavailable for this host.',
    uk: 'Назву школи для цього хоста недоступно.',
  },
  'profile.title': { en: 'Profile & Settings', uk: 'Профіль і налаштування' },
  'profile.subtitle': {
    en: 'Manage your account and preferences',
    uk: 'Керуйте акаунтом і налаштуваннями',
  },
  'profile.locale': { en: 'Interface language', uk: 'Мова інтерфейсу' },
  'profile.tab.profile': { en: 'Profile', uk: 'Профіль' },
  'profile.tab.statistics': { en: 'Statistics', uk: 'Статистика' },
  'profile.tab.notifications': { en: 'Notifications', uk: 'Сповіщення' },
  'profile.tab.connections': { en: 'Connections', uk: 'Підключення' },
  'profile.tab.appearance': { en: 'Appearance', uk: 'Оформлення' },
  'profile.tab.achievements': { en: 'Achievements', uk: 'Досягнення' },
  'profile.tab.account': { en: 'Account', uk: 'Акаунт' },
  'profile.tabsAria': { en: 'Profile tabs', uk: 'Вкладки профілю' },
  'profile.stat.words': { en: 'Words', uk: 'Слова' },
  'profile.stat.lessons': { en: 'Lessons', uk: 'Уроки' },
  'profile.stat.streak': { en: 'Streak', uk: 'Серія' },
  'profile.role.student': { en: 'Student', uk: 'Учень' },
  'profile.role.teacher': { en: 'Teacher', uk: 'Викладач' },
  'profile.role.admin': { en: 'Admin', uk: 'Адмін' },
  'profile.role.superAdmin': { en: 'Super admin', uk: 'Супер-адмін' },
  'profile.role.member': { en: 'Member', uk: 'Учасник' },
  'profile.role.staff': { en: 'Staff', uk: 'Персонал' },
  'profile.status.activeLearner': { en: 'Active learner', uk: 'Активний учень' },
  'profile.status.paused': { en: 'Paused', uk: 'Пауза' },
  'profile.status.left': { en: 'Left program', uk: 'Залишив програму' },
  'profile.status.blocked': { en: 'Blocked', uk: 'Заблоковано' },
  'profile.changeAvatarAria': { en: 'Change avatar', uk: 'Змінити аватар' },
  'profile.recentAchievements': { en: 'Recent achievements', uk: 'Останні досягнення' },
  'profile.hero.nextOnSchedule': { en: 'Next on schedule', uk: 'Далі в розкладі' },
  'profile.hero.vocabulary': { en: 'Vocabulary', uk: 'Словник' },
  'profile.hero.reviewDue': { en: 'Review due', uk: 'Час повторити' },
  'profile.hero.wordsToReview': {
    en: '{count} word(s) to review',
    uk: '{count} слів на повторення',
  },
  'profile.saveChanges': { en: 'Save changes', uk: 'Зберегти зміни' },
  'profile.saveProfile': { en: 'Save profile', uk: 'Зберегти профіль' },
  'profile.saving': { en: 'Saving…', uk: 'Збереження…' },
  'profile.changesSaved': { en: 'Changes saved', uk: 'Зміни збережено' },
  'profile.saved': { en: 'Saved', uk: 'Збережено' },
  'profile.overviewAria': { en: 'Profile overview', uk: 'Огляд профілю' },
  'profile.summary.timezone': { en: 'Timezone', uk: 'Часовий пояс' },
  'profile.summary.phone': { en: 'Phone', uk: 'Телефон' },
  'profile.summary.telegram': { en: 'Telegram', uk: 'Telegram' },
  'profile.summary.status': { en: 'Status', uk: 'Статус' },
  'profile.summary.level': { en: 'Level', uk: 'Рівень' },
  'profile.intro.self': {
    en: 'Your name, contact details, timezone, and learning preferences shown across Arvilio.',
    uk: 'Імʼя, контакти, часовий пояс і навчальні налаштування в Arvilio.',
  },
  'profile.intro.student': {
    en: 'Manage core student profile settings, contacts, native language, timezone, and user color.',
    uk: 'Основні дані учня, контакти, рідна мова, часовий пояс і колір.',
  },
  'profile.intro.staff': {
    en: 'Update contact details and account status for this staff member. Email is managed separately and cannot be changed here.',
    uk: 'Оновіть контакти та статус співробітника. Email змінюється окремо.',
  },
  'profile.section.identity': { en: 'Identity', uk: 'Особисті дані' },
  'profile.section.identityHint': {
    en: 'Name and login email shown across the platform.',
    uk: 'Імʼя та email для входу на платформі.',
  },
  'profile.section.contact': { en: 'Contact & timezone', uk: 'Контакти та часовий пояс' },
  'profile.section.contactHint': {
    en: 'How admins, teachers, and students reach this person.',
    uk: 'Як адміністратори, викладачі та учні можуть звʼязатися.',
  },
  'profile.section.learning': { en: 'Learning', uk: 'Навчання' },
  'profile.section.learningHint': {
    en: 'Native language and current proficiency level.',
    uk: 'Рідна мова та поточний рівень.',
  },
  'profile.section.accountBio': { en: 'Account & bio', uk: 'Акаунт і біо' },
  'profile.section.accountBioHint': {
    en: 'Access state and optional notes for internal reference.',
    uk: 'Статус доступу та нотатки для внутрішнього користування.',
  },
  'profile.field.fullName': { en: 'Full name', uk: 'Повне імʼя' },
  'profile.field.email': { en: 'Email', uk: 'Ел. пошта' },
  'profile.field.phone': { en: 'Phone', uk: 'Телефон' },
  'profile.field.telegram': { en: 'Telegram', uk: 'Telegram' },
  'profile.field.timezone': { en: 'Timezone', uk: 'Часовий пояс' },
  'profile.field.nativeLanguage': { en: 'Native language', uk: 'Рідна мова' },
  'profile.field.proficiency': { en: 'Proficiency', uk: 'Рівень' },
  'profile.field.level': { en: 'Level', uk: 'Рівень' },
  'profile.field.status': { en: 'Status', uk: 'Статус' },
  'profile.field.bio': { en: 'Bio', uk: 'Біо' },
  'profile.field.bioPlaceholder': {
    en: 'Tell us a bit about yourself…',
    uk: 'Розкажіть трохи про себе…',
  },
  'profile.field.bioPlaceholderStaff': {
    en: 'Short internal note about this staff member…',
    uk: 'Коротка внутрішня нотатка про співробітника…',
  },
  'profile.notif.title': { en: 'Notifications', uk: 'Сповіщення' },
  'profile.notif.saved': { en: 'Preferences saved', uk: 'Налаштування збережено' },
  'profile.notif.hint': {
    en: 'Email is sent when SMTP is configured. Telegram messages are sent when you connect Telegram under Connections (server needs TELEGRAM_BOT_TOKEN in .env).',
    uk: 'Email надсилається, коли налаштовано SMTP. Telegram — після підключення в розділі «Підключення» (потрібен TELEGRAM_BOT_TOKEN).',
  },
  'profile.notif.lessonReminder': { en: 'Lesson reminders', uk: 'Нагадування про уроки' },
  'profile.notif.lessonReminderDesc': {
    en: 'Get notified 30 minutes before each lesson',
    uk: 'Сповіщення за 30 хвилин до кожного уроку',
  },
  'profile.notif.streakAlert': { en: 'Streak alerts', uk: 'Нагадування про серію' },
  'profile.notif.streakAlertDesc': {
    en: 'Reminder to keep your daily streak alive',
    uk: 'Нагадування підтримувати щоденну серію',
  },
  'profile.notif.weeklyReport': { en: 'Weekly report', uk: 'Тижневий звіт' },
  'profile.notif.weeklyReportDesc': {
    en: 'Summary of your progress every Monday',
    uk: 'Підсумок прогресу щопонеділка',
  },
  'profile.notif.newVocab': { en: 'New vocabulary', uk: 'Нова лексика' },
  'profile.notif.newVocabDesc': {
    en: 'Daily word of the day notification',
    uk: 'Щоденне сповіщення про слово дня',
  },
  'profile.notif.teacherMessages': { en: 'Teacher messages', uk: 'Повідомлення викладача' },
  'profile.notif.teacherMessagesDesc': {
    en: 'Notifications when your teacher sends a message',
    uk: 'Сповіщення, коли викладач пише повідомлення',
  },
  'profile.appearance.theme': { en: 'Theme', uk: 'Тема' },
  'profile.appearance.themeAria': { en: 'Theme selector', uk: 'Вибір теми' },
  'profile.appearance.light': { en: 'Light', uk: 'Світла' },
  'profile.appearance.dark': { en: 'Dark', uk: 'Темна' },
  'profile.appearance.auto': { en: 'Auto', uk: 'Авто' },
  'profile.appearance.fontSize': { en: 'Font size', uk: 'Розмір шрифту' },
  'profile.appearance.fontAria': { en: 'Font size selector', uk: 'Вибір розміру шрифту' },
  'profile.appearance.small': { en: 'Small', uk: 'Малий' },
  'profile.appearance.medium': { en: 'Medium', uk: 'Середній' },
  'profile.appearance.large': { en: 'Large', uk: 'Великий' },
  'profile.account.session': { en: 'Session', uk: 'Сесія' },
  'profile.account.replayTitle': { en: 'Replay product tour', uk: 'Пройти тур знову' },
  'profile.account.replayDesc': {
    en: 'Return to the dashboard and walk through the full app guide with Arvi again',
    uk: 'Повернутися на головну й знову пройти повний гід додатком з Arvi',
  },
  'profile.account.learningModeTitle': { en: 'Learning mode', uk: 'Режим навчання' },
  'profile.account.learningModeDesc': {
    en: 'Show the Header help button (?) for page tips on the current screen. The first-login tour still runs once. Does not reset tour progress (unlike Replay).',
    uk: 'Кнопка «?» у хедері — підказки для поточної сторінки. Перший тур після реєстрації все одно показується. На відміну від Replay, прогрес туру не скидає.',
  },
  'profile.account.starting': { en: 'Starting…', uk: 'Запуск…' },
  'profile.account.logoutTitle': { en: 'Log out', uk: 'Вийти' },
  'profile.account.logoutDesc': {
    en: 'End your current session on this device',
    uk: 'Завершити поточну сесію на цьому пристрої',
  },
  'profile.account.loggingOut': { en: 'Logging out…', uk: 'Вихід…' },
  'profile.account.actions': { en: 'Account actions', uk: 'Дії з акаунтом' },
  'profile.account.actionsHint': {
    en: 'Sensitive changes for your sign-in credentials.',
    uk: 'Чутливі зміни для даних входу.',
  },
  'profile.account.changePassword': { en: 'Change password', uk: 'Змінити пароль' },
  'profile.account.changePasswordDesc': {
    en: 'Update your login password',
    uk: 'Оновіть пароль для входу',
  },
  'profile.account.change': { en: 'Change', uk: 'Змінити' },
  'profile.account.passwordOauthHint': {
    en: 'Your account signs in with {providers}. Set a password there or contact support.',
    uk: 'Акаунт входить через {providers}. Встановіть пароль там або зверніться в підтримку.',
  },
  'profile.account.passwordDisabled': {
    en: 'Password sign-in is not enabled for this account.',
    uk: 'Вхід за паролем для цього акаунта вимкнено.',
  },
  'profile.account.exportTitle': { en: 'Export my data', uk: 'Експорт моїх даних' },
  'profile.account.exportDesc': {
    en: 'Download a copy of all your personal data (GDPR DSAR).',
    uk: 'Завантажити копію всіх персональних даних (GDPR DSAR).',
  },
  'profile.account.exportDone': {
    en: 'Download started — check your downloads folder.',
    uk: 'Завантаження почалось — перевірте папку завантажень.',
  },
  'profile.account.export': { en: 'Export', uk: 'Експорт' },
  'profile.account.exporting': { en: 'Exporting…', uk: 'Експорт…' },
  'profile.account.deleteTitle': { en: 'Delete my account', uk: 'Видалити акаунт' },
  'profile.account.deleteDesc': {
    en: 'Permanently anonymize your account. Financial records are retained as required by law.',
    uk: 'Остаточно анонімізувати акаунт. Фінансові записи зберігаються згідно із законом.',
  },
  'profile.account.delete': { en: 'Delete', uk: 'Видалити' },
  'profile.account.deleting': { en: 'Deleting…', uk: 'Видалення…' },
  'profile.account.deleteConfirm': {
    en: 'This will permanently anonymize your account and cannot be undone. Continue?',
    uk: 'Акаунт буде остаточно анонімізовано. Цю дію не можна скасувати. Продовжити?',
  },
  'profile.stats.introStudent': {
    en: 'Key metrics and trends for the period you select. Hover info icons for definitions.',
    uk: 'Ключові метрики та тренди за обраний період. Наведіть на іконки підказок для визначень.',
  },
  'profile.stats.introTeacher': {
    en: 'Lessons and speaking reviews for your students.',
    uk: 'Уроки та перевірки говоріння ваших учнів.',
  },
  'profile.stats.introAdmin': {
    en: 'Switch roster view or student scope to compare operations vs learning activity.',
    uk: 'Перемикайте вигляд списку або обсяг учнів, щоб порівняти операції й навчальну активність.',
  },
  'profile.connections.title': { en: 'Connected accounts', uk: 'Підключені акаунти' },
  'profile.connections.intro': {
    en: 'Link accounts for notifications. Google must use the same email as your Arvilio account{emailSuffix} and enables Calendar + Meet. When Telegram is connected, site alerts are also sent to this chat if enabled under Notifications.',
    uk: 'Підключіть акаунти для сповіщень. Google має збігатися з email Arvilio{emailSuffix} і вмикає Calendar + Meet. Після підключення Telegram сповіщення сайту також йдуть у чат, якщо увімкнено в «Сповіщення».',
  },
  'profile.connections.verified': { en: 'Verified', uk: 'Підтверджено' },
  'profile.connections.notConnected': { en: 'Not connected', uk: 'Не підключено' },
  'profile.connections.connected': { en: 'Connected', uk: 'Підключено' },
  'profile.connections.disconnected': { en: 'Disconnected', uk: 'Відключено' },
  'profile.connections.calendarMissing': {
    en: 'Calendar access missing — connect again',
    uk: 'Немає доступу до календаря — підключіть знову',
  },
  'profile.connections.calendarReady': {
    en: 'Calendar & Meet enabled',
    uk: 'Calendar і Meet увімкнено',
  },
  'profile.connections.connectGoogle': { en: 'Connect Google', uk: 'Підключити Google' },
  'profile.connections.reconnectGoogle': { en: 'Reconnect Google', uk: 'Перевʼязати Google' },
  'profile.connections.connectFacebook': { en: 'Connect Facebook', uk: 'Підключити Facebook' },
  'profile.connections.reconnectFacebook': {
    en: 'Reconnect Facebook',
    uk: 'Перевʼязати Facebook',
  },
  'profile.connections.connectZoom': { en: 'Connect Zoom', uk: 'Підключити Zoom' },
  'profile.connections.reconnectZoom': { en: 'Reconnect Zoom', uk: 'Перевʼязати Zoom' },
  'profile.achievements.title': { en: 'Achievements', uk: 'Досягнення' },
  'profile.achievements.hint': {
    en: 'Milestones from lessons, practice, and streaks. Locked badges unlock as you progress.',
    uk: 'Віхи з уроків, практики та серій. Заблоковані бейджі відкриваються з прогресом.',
  },
  'profile.password.security': { en: 'Security', uk: 'Безпека' },
  'profile.password.title': { en: 'Change password', uk: 'Змінити пароль' },
  'profile.password.hint': {
    en: 'Enter your current password, then choose a new one (at least 8 characters).',
    uk: 'Введіть поточний пароль, потім новий (щонайменше 8 символів).',
  },
  'profile.password.current': { en: 'Current password', uk: 'Поточний пароль' },
  'profile.password.new': { en: 'New password', uk: 'Новий пароль' },
  'profile.password.confirm': { en: 'Confirm new password', uk: 'Підтвердіть новий пароль' },
  'profile.password.cancel': { en: 'Cancel', uk: 'Скасувати' },
  'profile.password.update': { en: 'Update password', uk: 'Оновити пароль' },
  'profile.password.closeAria': { en: 'Close password modal', uk: 'Закрити вікно пароля' },
  'profile.password.error.current': {
    en: 'Enter your current password.',
    uk: 'Введіть поточний пароль.',
  },
  'profile.password.error.length': {
    en: 'New password must be at least 8 characters.',
    uk: 'Новий пароль має містити щонайменше 8 символів.',
  },
  'profile.password.error.match': {
    en: 'New passwords do not match.',
    uk: 'Нові паролі не збігаються.',
  },
  'profile.password.error.failed': {
    en: 'Failed to change password',
    uk: 'Не вдалося змінити пароль',
  },
  'profile.password.toastTitle': { en: 'Password updated', uk: 'Пароль оновлено' },
  'profile.password.toastBody': {
    en: 'Use your new password next time you sign in.',
    uk: 'Наступного разу входьте з новим паролем.',
  },
  'profile.avatar.badge': { en: 'Profile media', uk: 'Медіа профілю' },
  'profile.avatar.title': { en: 'Profile avatar', uk: 'Аватар профілю' },
  'profile.avatar.hint': {
    en: 'Choose an image, move and scale square crop area, then apply compressed avatar.',
    uk: 'Оберіть зображення, змістіть і масштабуйте квадрат обрізки, потім застосуйте стиснутий аватар.',
  },
  'profile.avatar.closeAria': { en: 'Close avatar modal', uk: 'Закрити вікно аватара' },
  'profile.avatar.cropAria': { en: 'Avatar crop workspace', uk: 'Область обрізки аватара' },
  'profile.avatar.resizeAria': { en: 'Resize crop square', uk: 'Змінити розмір обрізки' },
  'profile.avatar.drag': { en: 'Drag', uk: 'Перетягніть' },
  'profile.avatar.choose': { en: 'Choose image', uk: 'Обрати зображення' },
  'profile.avatar.apply': { en: 'Apply crop', uk: 'Застосувати' },
  'profile.avatar.processing': { en: 'Processing…', uk: 'Обробка…' },
  'profile.avatar.remove': { en: 'Remove', uk: 'Видалити' },
  'admin.title': { en: 'Admin', uk: 'Адмін' },
  'admin.subtitle.super': {
    en: 'Create student, teacher and admin accounts. A temporary password is generated and emailed automatically. SUPER_ADMIN accounts use the CLI only.',
    uk: 'Створюйте акаунти учнів, викладачів та адмінів. Тимчасовий пароль генерується та надсилається на email. SUPER_ADMIN створюється лише через CLI.',
  },
  'admin.subtitle.studentOnly': {
    en: 'Create student accounts. Login credentials are emailed to the user.',
    uk: 'Створюйте акаунти учнів. Дані для входу надсилаються користувачу на email.',
  },
  'admin.accountsOverview': { en: 'Accounts overview', uk: 'Огляд акаунтів' },
  'admin.metric.allAccounts': { en: 'All accounts', uk: 'Усі акаунти' },
  'admin.metric.students': { en: 'Students', uk: 'Учні' },
  'admin.metric.activeAccounts': { en: 'Active accounts', uk: 'Активні акаунти' },
  'admin.metric.teachingUsers': {
    en: '{count} teaching users (teachers and admins)',
    uk: '{count} користувачів викладацьких ролей (викладачі й адміни)',
  },
  'admin.role.student': { en: 'Student', uk: 'Учень' },
  'admin.role.teacher': { en: 'Teacher', uk: 'Викладач' },
  'admin.role.admin': { en: 'Admin', uk: 'Адмін' },
  'admin.role.superAdmin': { en: 'Super admin', uk: 'Супер-адмін' },
  'admin.status.active': { en: 'Active', uk: 'Активний' },
  'admin.status.paused': { en: 'Paused', uk: 'На паузі' },
  'admin.status.leaved': { en: 'Left', uk: 'Вибув' },
  'admin.status.blocked': { en: 'Blocked', uk: 'Заблокований' },
  'admin.create.aria': { en: 'Create account', uk: 'Створити акаунт' },
  'admin.create.title': { en: 'Create account', uk: 'Створити акаунт' },
  'admin.create.subtitle': {
    en: 'Only email is required. Role defaults to Student. Password is generated and sent by email.',
    uk: 'Потрібен лише email. Роль за замовчуванням — Учень. Пароль генерується та надсилається на email.',
  },
  'admin.create.basics': { en: 'Account basics', uk: 'Основні дані акаунта' },
  'admin.create.details': { en: 'Profile details', uk: 'Дані профілю' },
  'admin.field.email': { en: 'Email *', uk: 'Email *' },
  'admin.field.role': { en: 'Role', uk: 'Роль' },
  'admin.field.status': { en: 'Account status', uk: 'Статус акаунта' },
  'admin.field.fullName': { en: 'Full name', uk: "Повне ім'я" },
  'admin.field.fullNamePlaceholder': {
    en: 'Optional — defaults from email',
    uk: 'Необовʼязково — береться з email',
  },
  'admin.field.assignedTeacher': { en: 'Assigned teacher', uk: 'Призначений викладач' },
  'admin.field.phone': { en: 'Phone', uk: 'Телефон' },
  'admin.field.telegram': { en: 'Telegram', uk: 'Telegram' },
  'admin.field.nativeLanguage': { en: 'Native language', uk: 'Рідна мова' },
  'admin.field.timezone': { en: 'Timezone', uk: 'Часовий пояс' },
  'admin.field.englishLevel': { en: 'English level', uk: 'Рівень англійської' },
  'admin.field.bio': { en: 'Bio', uk: 'Біо' },
  'admin.create.submit': { en: 'Create account', uk: 'Створити акаунт' },
  'admin.create.submitting': { en: 'Creating…', uk: 'Створення…' },
  'admin.success.created': {
    en: 'Created {role} {email}.{emailNote}',
    uk: 'Створено {role}: {email}.{emailNote}',
  },
  'admin.success.emailSent': {
    en: ' A welcome email with login credentials was sent.',
    uk: ' Привітальний email з даними входу надіслано.',
  },
  'admin.success.emailNotSent': {
    en: ' Welcome email was not sent (check SMTP settings in Platform / System → Email).',
    uk: ' Привітальний email не надіслано (перевірте SMTP у Platform / System → Email).',
  },
  'admin.error.createFailed': { en: 'Failed to create user', uk: 'Не вдалося створити користувача' },
  'admin.delete.title': { en: 'Delete this account?', uk: 'Видалити цей акаунт?' },
  'admin.delete.message': {
    en: 'Are you sure you want to delete {label}? This cannot be undone.{lessonNote}',
    uk: 'Ви впевнені, що хочете видалити {label}? Цю дію неможливо скасувати.{lessonNote}',
  },
  'admin.delete.lessonNote': {
    en: ' Their scheduled lessons will also be removed.',
    uk: ' Повʼязані заплановані уроки також будуть видалені.',
  },
  'admin.delete.confirm': { en: 'Delete account', uk: 'Видалити акаунт' },
  'admin.delete.cancel': { en: 'Cancel', uk: 'Скасувати' },
  'admin.error.deleteFailed': { en: 'Failed to delete user', uk: 'Не вдалося видалити користувача' },
  'admin.error.deleteToastTitle': { en: 'Could not delete user', uk: 'Не вдалося видалити користувача' },
  'admin.table.aria': { en: 'Users', uk: 'Користувачі' },
  'admin.table.title': { en: 'Existing accounts', uk: 'Наявні акаунти' },
  'admin.table.subtitle.super': {
    en: 'Showing all non-SUPER_ADMIN accounts. To manage SUPER_ADMIN use the `super-admin` CLI.',
    uk: 'Показано всі акаунти, крім SUPER_ADMIN. Для керування SUPER_ADMIN використовуйте CLI `super-admin`.',
  },
  'admin.table.subtitle.default': {
    en: 'Showing students, teachers, and admins (admins can be assigned as teachers).',
    uk: 'Показано учнів, викладачів і адмінів (адмінів можна призначати викладачами).',
  },
  'admin.table.refresh': { en: 'Refresh', uk: 'Оновити' },
  'admin.table.refreshing': { en: 'Refreshing…', uk: 'Оновлення…' },
  'admin.table.loading': { en: 'Loading…', uk: 'Завантаження…' },
  'admin.table.loadFailed': { en: 'Failed to load users: {error}', uk: 'Не вдалося завантажити користувачів: {error}' },
  'admin.table.noAccounts': { en: 'No accounts yet.', uk: 'Поки немає акаунтів.' },
  'admin.table.col.email': { en: 'Email', uk: 'Email' },
  'admin.table.col.name': { en: 'Name', uk: "Ім'я" },
  'admin.table.col.role': { en: 'Role', uk: 'Роль' },
  'admin.table.col.status': { en: 'Status', uk: 'Статус' },
  'admin.table.col.created': { en: 'Created', uk: 'Створено' },
  'admin.table.deleteAria': { en: 'Delete {email}', uk: 'Видалити {email}' },
  'studentImport.title': { en: 'Import students from CSV', uk: 'Імпорт учнів з CSV' },
  'studentImport.hint': {
    en: 'Upload a CSV with columns `email` and `fullName`. Existing accounts are skipped; welcome emails are sent to new accounts.',
    uk: 'Завантажте CSV зі стовпцями `email` і `fullName`. Існуючі акаунти пропускаються; новим акаунтам надсилаються welcome email.',
  },
  'studentImport.exampleTitle': { en: 'CSV format example', uk: 'Приклад формату CSV' },
  'studentImport.previewFailed': { en: 'Preview failed', uk: 'Не вдалося побудувати превʼю' },
  'studentImport.importFailed': { en: 'Import failed', uk: 'Не вдалося імпортувати' },
  'studentImport.parsing': { en: 'Parsing…', uk: 'Обробка…' },
  'studentImport.reupload': { en: 'Re-upload ({fileName})', uk: 'Завантажити знову ({fileName})' },
  'studentImport.chooseFile': { en: 'Choose CSV file', uk: 'Обрати CSV файл' },
  'studentImport.validRows': { en: '{count} valid', uk: '{count} валідних' },
  'studentImport.invalidRows': { en: '{count} invalid (will be skipped)', uk: '{count} невалідних (будуть пропущені)' },
  'studentImport.seatsRemaining': { en: '{count} seats remaining', uk: 'Залишилось місць: {count}' },
  'studentImport.capWarning': {
    en: 'Your plan has {remaining} seats remaining but the CSV has {rows} rows. Only the first {imported} will be imported. Upgrade your plan to import all rows.',
    uk: 'У вашому плані залишилось {remaining} місць, а в CSV {rows} рядків. Імпортуються лише перші {imported}. Оновіть план, щоб імпортувати всі рядки.',
  },
  'studentImport.preview.col.number': { en: '#', uk: '#' },
  'studentImport.preview.col.email': { en: 'Email', uk: 'Email' },
  'studentImport.preview.col.name': { en: 'Name', uk: "Ім'я" },
  'studentImport.moreRows': { en: '…and {count} more', uk: '…і ще {count}' },
  'studentImport.errorRowsSummary': { en: '{count} rows with errors (will be skipped)', uk: '{count} рядків з помилками (будуть пропущені)' },
  'studentImport.errorLine': { en: 'Line {line}: {email} — {error}', uk: 'Рядок {line}: {email} — {error}' },
  'studentImport.emptyEmail': { en: '(empty)', uk: '(порожньо)' },
  'studentImport.noValidRowsTitle': { en: 'No valid rows', uk: 'Немає валідних рядків' },
  'studentImport.noValidRowsDesc': { en: 'Fix the errors and upload again.', uk: 'Виправте помилки та завантажте знову.' },
  'studentImport.cancel': { en: 'Cancel', uk: 'Скасувати' },
  'studentImport.importCount': { en: 'Import {count} students', uk: 'Імпортувати {count} учнів' },
  'studentImport.importing': { en: 'Importing… please wait.', uk: 'Імпорт… зачекайте.' },
  'studentImport.createdCount': { en: '{count} students created', uk: 'Створено учнів: {count}' },
  'studentImport.skippedCount': { en: '{count} skipped (already exist or seat cap)', uk: 'Пропущено: {count} (вже існують або ліміт місць)' },
  'studentImport.failedCount': { en: '{count} failed', uk: 'Не вдалося: {count}' },
  'studentImport.importAnother': { en: 'Import another file', uk: 'Імпортувати інший файл' },
  'system.title': { en: 'System', uk: 'Система' },
  'system.subtitle': {
    en: 'School integrations, payments, and dictionaries.',
    uk: 'Інтеграції, оплати та словники школи.',
  },

  // —— System → Email ——
  'system.email.title': { en: 'Email (SMTP)', uk: 'Email (SMTP)' },
  'system.email.intro': {
    en: 'Platform-global transactional mail (welcome, resets, notifications). Same settings as Control Plane → Settings. Configure delivery, verify, then send a sample. Prefer Resend or Brevo if Mailtrap limits are exhausted.',
    uk: 'Платформна транзакційна пошта (welcome, скидання, нотифікації). Ті самі налаштування, що Control Plane → Settings. Налаштуйте доставку, перевірте й надішліть тест. Якщо ліміт Mailtrap вичерпано — Resend або Brevo.',
  },
  'system.email.loading': { en: 'Loading email settings…', uk: 'Завантаження налаштувань email…' },
  'system.email.loadError': { en: 'Failed to load email settings', uk: 'Не вдалося завантажити налаштування email' },
  'system.email.loadStatusError': { en: 'Failed to load mail status', uk: 'Не вдалося завантажити статус пошти' },
  'system.email.badge.ready': { en: 'Ready to send', uk: 'Готово до відправки' },
  'system.email.badge.notConfigured': { en: 'Not configured', uk: 'Не налаштовано' },
  'system.email.runtime.noHost': { en: 'No SMTP host', uk: 'Немає SMTP-хоста' },
  'system.email.runtime.meta': { en: '{mode} · From {mailFrom}', uk: '{mode} · Від {mailFrom}' },
  'system.email.mode.serverDefault': { en: 'Server default', uk: 'Сервер за замовчуванням' },
  'system.email.mode.custom': { en: 'Custom SMTP', uk: 'Власний SMTP' },
  'system.email.mode.aria': { en: 'SMTP mode', uk: 'Режим SMTP' },
  'system.email.refreshing': { en: 'Refreshing…', uk: 'Оновлення…' },
  'system.email.smtpConfig.title': { en: 'SMTP configuration', uk: 'Налаштування SMTP' },
  'system.email.smtpConfig.blurb': {
    en: 'Platform default for all campuses. Server default reads SMTP_* from the API host. Custom stores encrypted credentials (also editable in Control Plane → Settings).',
    uk: 'Дефолт платформи для всіх кампусів. Server default читає SMTP_* з API. Custom зберігає зашифровані облікові дані (також у Control Plane → Settings).',
  },
  'system.email.encryptionWarn': {
    en: 'Set PLATFORM_SECRETS_ENCRYPTION_KEY (or PAYMENT_SECRETS_ENCRYPTION_KEY) in the API .env and restart the API to save a custom password.',
    uk: 'Додайте PLATFORM_SECRETS_ENCRYPTION_KEY (або PAYMENT_SECRETS_ENCRYPTION_KEY) у .env API та перезапустіть API, щоб зберегти власний пароль.',
  },
  'system.email.envCallout': {
    en: 'Using deployment environment variables. Switch to Custom SMTP to override host, port, and credentials in platform settings (Resend, Brevo, SES, Mailtrap, …).',
    uk: 'Використовуються змінні середовища деплою. Перейдіть на власний SMTP, щоб перевизначити хост, порт і облікові дані (Resend, Brevo, SES, Mailtrap…).',
  },
  'system.email.field.fromAddress': { en: 'From address', uk: 'Адреса відправника' },
  'system.email.field.preset': { en: 'Provider preset', uk: 'Пресет провайдера' },
  'system.email.field.host': { en: 'Host', uk: 'Хост' },
  'system.email.field.port': { en: 'Port', uk: 'Порт' },
  'system.email.field.username': { en: 'Username', uk: "Ім'я користувача" },
  'system.email.field.password': { en: 'Password', uk: 'Пароль' },
  'system.email.field.tls': { en: 'Use TLS/SSL (typical for port 465)', uk: 'TLS/SSL (зазвичай для порту 465)' },
  'system.email.verifyConnection': { en: 'Verify connection', uk: 'Перевірити підключення' },
  'system.email.verifySuccess': { en: 'SMTP connection verified.', uk: 'SMTP-підключення перевірено.' },
  'system.email.verifyFailed': { en: 'Verification failed', uk: 'Перевірку не пройдено' },
  'system.email.saveSmtp': { en: 'Save SMTP', uk: 'Зберегти SMTP' },
  'system.email.saveSuccess': { en: 'SMTP settings saved.', uk: 'Налаштування SMTP збережено.' },
  'system.email.saveFailed': { en: 'Save failed', uk: 'Не вдалося зберегти' },
  'system.email.saving': { en: 'Saving…', uk: 'Збереження…' },
  'system.email.verifying': { en: 'Verifying…', uk: 'Перевірка…' },
  'system.email.test.title': { en: 'Test delivery', uk: 'Тестова доставка' },
  'system.email.test.blurb': {
    en: 'Sends the welcome-account template with sample password Example-Temp-Pass1.',
    uk: 'Надсилає шаблон welcome-account із прикладом пароля Example-Temp-Pass1.',
  },
  'system.email.test.step1': {
    en: 'Verify connection with the values in the form (does not send mail).',
    uk: 'Перевірте підключення зі значеннями у формі (лист не надсилається).',
  },
  'system.email.test.step2': {
    en: 'Save SMTP so the runtime banner matches your settings.',
    uk: 'Збережіть SMTP, щоб банер відповідав вашим налаштуванням.',
  },
  'system.email.test.step3': {
    en: 'Send a test message to your inbox (Resend, Brevo, SES, Mailtrap, …).',
    uk: 'Надішліть тестове повідомлення на пошту (Resend, Brevo, SES, Mailtrap…).',
  },
  'system.email.test.recipient': { en: 'Recipient', uk: 'Одержувач' },
  'system.email.test.send': { en: 'Send test welcome email', uk: 'Надіслати тестовий welcome-лист' },
  'system.email.test.sending': { en: 'Sending…', uk: 'Надсилання…' },
  'system.email.test.success': {
    en: 'Test email sent. Check your inbox (or provider dashboard).',
    uk: 'Тестовий лист надіслано. Перевірте пошту (або кабінет провайдера).',
  },
  'system.email.test.failed': { en: 'Failed to send test email', uk: 'Не вдалося надіслати тестовий лист' },
  'system.email.test.configureFirst': {
    en: 'Configure SMTP before sending a test message.',
    uk: 'Налаштуйте SMTP перед надсиланням тестового листа.',
  },

  // —— System → Connections ——
  'system.connections.title': { en: 'Connections', uk: 'Підключення' },
  'system.connections.intro': {
    en: 'Platform OAuth and Telegram bot. Hover the ? next to each label for where to find the value. Verify before saving when you change secrets.',
    uk: 'OAuth платформи та Telegram-бот. Наведіть на ? біля мітки, щоб дізнатися, де знайти значення. Перевіряйте перед збереженням після зміни секретів.',
  },
  'system.connections.loadError': {
    en: 'Failed to load connection settings',
    uk: 'Не вдалося завантажити налаштування підключень',
  },
  'system.connections.save': { en: 'Save', uk: 'Зберегти' },
  'system.connections.saving': { en: 'Saving…', uk: 'Збереження…' },
  'system.connections.verifyAll': { en: 'Verify all', uk: 'Перевірити все' },
  'system.connections.checking': { en: 'Checking…', uk: 'Перевірка…' },
  'system.connections.saveSuccess': {
    en: 'Saved. New credentials apply immediately.',
    uk: 'Збережено. Нові облікові дані застосовуються одразу.',
  },
  'system.connections.saveFailed': { en: 'Save failed', uk: 'Не вдалося зберегти' },
  'system.connections.verifyFailed': { en: 'Verification failed', uk: 'Перевірку не пройдено' },
  'system.connections.advanced.redirectUrls': { en: 'Redirect URLs (optional)', uk: 'Redirect URL (необовʼязково)' },
  'system.connections.docs': { en: 'Documentation', uk: 'Документація' },
  'system.connections.docsShort': { en: 'Docs', uk: 'Доки' },
  'system.connections.verify': { en: 'Verify', uk: 'Перевірити' },
  'system.connections.fieldHint.aria': { en: 'How to get {label}', uk: 'Де взяти {label}' },
  'system.connections.provider.google.title': { en: 'Google', uk: 'Google' },
  'system.connections.provider.google.blurb': {
    en: 'Sign-in, Calendar, and Meet for teachers.',
    uk: 'Вхід, Calendar і Meet для викладачів.',
  },
  'system.connections.provider.facebook.title': { en: 'Facebook', uk: 'Facebook' },
  'system.connections.provider.facebook.blurb': {
    en: 'Optional link in Profile → Connections.',
    uk: 'Необовʼязкове посилання в Профіль → Підключення.',
  },
  'system.connections.provider.zoom.title': { en: 'Zoom', uk: 'Zoom' },
  'system.connections.provider.zoom.blurb': {
    en: 'OAuth + Meeting API for video lessons.',
    uk: 'OAuth і Meeting API для відеоуроків.',
  },
  'system.connections.provider.telegram.title': { en: 'Telegram', uk: 'Telegram' },
  'system.connections.provider.telegram.blurb': {
    en: 'Bot linking for notifications and Profile → Connect via Telegram.',
    uk: 'Підключення бота для сповіщень і Профіль → Telegram.',
  },
  'system.connections.field.googleClientId': { en: 'Client ID', uk: 'Client ID' },
  'system.connections.field.googleClientSecret': { en: 'Client secret', uk: 'Client secret' },
  'system.connections.field.googleCallbackUrl': { en: 'Callback URL', uk: 'Callback URL' },
  'system.connections.field.googleSuccessRedirect': { en: 'Success redirect', uk: 'Redirect після успіху' },
  'system.connections.field.facebookAppId': { en: 'App ID', uk: 'App ID' },
  'system.connections.field.facebookAppSecret': { en: 'App secret', uk: 'App secret' },
  'system.connections.field.facebookCallbackUrl': { en: 'Callback URL', uk: 'Callback URL' },
  'system.connections.field.zoomClientId': { en: 'Client ID', uk: 'Client ID' },
  'system.connections.field.zoomClientSecret': { en: 'Client secret', uk: 'Client secret' },
  'system.connections.field.zoomWebhookSecret': { en: 'Webhook secret token', uk: 'Webhook secret token' },
  'system.connections.field.zoomCallbackUrl': { en: 'Callback URL', uk: 'Callback URL' },
  'system.connections.field.zoomUseServerToServer': { en: 'Use Server-to-Server OAuth', uk: 'Server-to-Server OAuth' },
  'system.connections.field.telegramBotToken': { en: 'Bot token', uk: 'Bot token' },
  'system.connections.field.telegramBotUsername': { en: 'Bot username', uk: 'Bot username' },
  'system.connections.field.telegramDevPolling': { en: 'Dev polling on localhost', uk: 'Dev polling на localhost' },
  'system.connections.placeholder.telegramBotUsername': { en: 'my_school_bot', uk: 'my_school_bot' },
  'system.connections.secret.notSet': { en: 'Not set', uk: 'Не задано' },
  'system.connections.secret.savedInPlatform': {
    en: 'Saved in platform settings',
    uk: 'Збережено в налаштуваннях платформи',
  },
  'system.connections.secret.fromEnv': {
    en: 'From server .env (fallback)',
    uk: 'З .env сервера (fallback)',
  },
  'system.connections.secret.placeholder': { en: 'Enter value to change', uk: 'Введіть нове значення' },

  // —— System → Dictionary ——
  'system.dictionary.title': { en: 'Word dictionary', uk: 'Словник слів' },
  'system.dictionary.intro': {
    en: 'English definitions and gloss translations when staff or students add vocabulary. Changes apply to new lookups; existing words keep stored data until re-enriched.',
    uk: 'Англійські визначення та переклади при додаванні слів. Зміни стосуються нових запитів; існуючі слова зберігають дані до повторного збагачення.',
  },
  'system.dictionary.loading': { en: 'Loading dictionary settings…', uk: 'Завантаження налаштувань словника…' },
  'system.dictionary.loadError': {
    en: 'Failed to load dictionary settings',
    uk: 'Не вдалося завантажити налаштування словника',
  },
  'system.dictionary.saveFailed': { en: 'Save failed', uk: 'Не вдалося зберегти' },
  'system.dictionary.providerUpdated': {
    en: 'Dictionary provider updated. New lookups use this source.',
    uk: 'Провайдера словника оновлено. Нові запити використовують це джерело.',
  },
  'system.dictionary.translationProviderUpdated': {
    en: 'Translation provider updated. New translations try this source first.',
    uk: 'Провайдера перекладу оновлено. Нові переклади спочатку використовують це джерело.',
  },
  'system.dictionary.languageSettingsSaved': { en: 'Language settings saved.', uk: 'Мовні налаштування збережено.' },
  'system.dictionary.contextTarget': { en: 'Context target: {lang}', uk: 'Цільовий контекст: {lang}' },
  'system.dictionary.source.dictionary.title': { en: 'Dictionary source', uk: 'Джерело словника' },
  'system.dictionary.source.dictionary.blurb': {
    en: 'Structured English entry for phonetics, part of speech, and definitions.',
    uk: 'Структурований англійський запис: фонетика, частина мови, визначення.',
  },
  'system.dictionary.source.dictionary.save': { en: 'Save provider', uk: 'Зберегти провайдера' },
  'system.dictionary.source.translation.title': { en: 'Translation source', uk: 'Джерело перекладу' },
  'system.dictionary.source.translation.blurb': {
    en: 'Primary translation provider; others follow in fixed fallback order when a request fails.',
    uk: 'Основний провайдер перекладу; інші йдуть у фіксованому fallback-порядку при помилці.',
  },
  'system.dictionary.source.translation.save': { en: 'Save translation provider', uk: 'Зберегти провайдера перекладу' },
  'system.dictionary.config.title': { en: 'Provider configuration', uk: 'Налаштування провайдера' },
  'system.dictionary.config.blurb': {
    en: 'Settings for {providerName}.',
    uk: 'Налаштування для {providerName}.',
  },
  'system.dictionary.config.selectedProvider': { en: 'selected provider', uk: 'обраного провайдера' },
  'system.dictionary.badge.active': { en: 'Active', uk: 'Активний' },
  'system.dictionary.badge.subscription': {
    en: 'Requires a paid service subscription',
    uk: 'Потрібна платна підписка на сервіс',
  },
  'system.dictionary.link.documentation': { en: 'Documentation', uk: 'Документація' },
  'system.dictionary.paidProviderWarning': {
    en: '{providerName} is not configured (missing API key on the server). This step will be skipped in the fallback chain until you save a key or set the env variable.',
    uk: '{providerName} не налаштовано (немає API-ключа на сервері). Цей крок пропускатиметься в fallback-ланцюгу, доки не збережете ключ або змінну середовища.',
  },
  'system.dictionary.field.apiUrl': { en: 'API URL', uk: 'API URL' },
  'system.dictionary.field.deeplAuthKey': { en: 'DeepL Auth Key', uk: 'DeepL Auth Key' },
  'system.dictionary.field.googleApiKey': { en: 'Google Cloud API key', uk: 'Google Cloud API key' },
  'system.dictionary.field.azureKey': { en: 'Azure subscription key', uk: 'Azure subscription key' },
  'system.dictionary.field.reversoTarget': { en: 'Context target (ISO)', uk: 'Цільовий контекст (ISO)' },
  'system.dictionary.field.reversoKey': { en: 'API key (optional)', uk: 'API key (необовʼязково)' },
  'system.dictionary.field.reversoContext': {
    en: 'Include contextual example sentences',
    uk: 'Додавати контекстні приклади речень',
  },
  'system.dictionary.field.myMemoryUrl': { en: 'MyMemory URL', uk: 'MyMemory URL' },
  'system.dictionary.field.myMemoryEmail': { en: 'MyMemory email', uk: 'MyMemory email' },
  'system.dictionary.field.myMemoryEmailPlaceholder': { en: 'Raises free quota', uk: 'Підвищує безкоштовну квоту' },
  'system.dictionary.field.libreTranslateUrl': { en: 'LibreTranslate URL', uk: 'LibreTranslate URL' },
  'system.dictionary.field.libreTranslateKey': { en: 'LibreTranslate API key', uk: 'LibreTranslate API key' },
  'system.dictionary.microsoft.envHint': {
    en: 'Set AZURE_TRANSLATOR_REGION in deployment env (e.g. eastus) together with the subscription key below.',
    uk: 'Додайте AZURE_TRANSLATOR_REGION у .env деплою (напр. eastus) разом із ключем підписки нижче.',
  },
  'system.dictionary.libretranslate.notConfigured': {
    en: 'LibreTranslate URL is not configured on the server. Add LIBRETRANSLATE_URL to deployment env to enable this step in the fallback chain.',
    uk: 'LibreTranslate URL не налаштовано на сервері. Додайте LIBRETRANSLATE_URL у .env деплою, щоб увімкнути цей крок у fallback-ланцюгу.',
  },
  'system.dictionary.gtx.noConfig': {
    en: 'Google Translate (GTX) has no configuration fields. It runs automatically as a fallback step when earlier providers in the chain fail.',
    uk: 'Google Translate (GTX) не має полів налаштування. Він автоматично працює як fallback, коли попередні провайдери не спрацювали.',
  },
  'system.dictionary.saveLanguageSettings': { en: 'Save language settings', uk: 'Зберегти мовні налаштування' },
  'system.dictionary.saving': { en: 'Saving…', uk: 'Збереження…' },
  'system.dictionary.setupGuide.aria': {
    en: 'Provider setup instructions',
    uk: 'Інструкції з налаштування провайдера',
  },
  'system.dictionary.setupGuide.pricing': { en: 'Pricing:', uk: 'Ціни:' },
  'system.dictionary.setupGuide.envVars': { en: 'Environment variables', uk: 'Змінні середовища' },

  // —— System → Dictionary → Media captions ——
  'system.dictionary.captions.title': {
    en: 'Media captions (audio / video)',
    uk: 'Субтитри для медіа (аудіо / відео)',
  },
  'system.dictionary.captions.hint': {
    en: 'Auto-generate subtitles after library audio/video upload. Use Local Whisper (whisper.cpp on the server, no API key) or OpenAI Whisper API. Translated tracks use the active translation provider above.',
    uk: 'Автогенерація субтитрів після завантаження аудіо/відео. Local Whisper (whisper.cpp на сервері, без API-ключа) або OpenAI Whisper API. Перекладені доріжки використовують активного провайдера перекладу вище.',
  },
  'system.dictionary.captions.enable': { en: 'Enable auto captions', uk: 'Увімкнути автосубтитри' },
  'system.dictionary.captions.sttProvider': { en: 'STT provider', uk: 'STT-провайдер' },
  'system.dictionary.captions.stt.localWhisper': {
    en: 'Local Whisper (whisper.cpp)',
    uk: 'Local Whisper (whisper.cpp)',
  },
  'system.dictionary.captions.stt.openaiWhisper': { en: 'OpenAI Whisper API', uk: 'OpenAI Whisper API' },
  'system.dictionary.captions.stt.disabled': { en: 'Disabled', uk: 'Вимкнено' },
  'system.dictionary.captions.whisperKey': { en: 'OpenAI Whisper API key', uk: 'OpenAI Whisper API key' },
  'system.dictionary.captions.localWhisperHint': {
    en: 'Requires whisper-cli and MATERIAL_WHISPER_MODEL in server .env (see .env.example). No API key needed.',
    uk: 'Потрібні whisper-cli і MATERIAL_WHISPER_MODEL у .env сервера (див. .env.example). API-ключ не потрібен.',
  },
  'system.dictionary.captions.sourceLanguage': { en: 'Source language (optional)', uk: 'Мова джерела (необовʼязково)' },
  'system.dictionary.captions.sourceLanguageHint': {
    en: 'Leave empty for auto-detect',
    uk: 'Залиште порожнім для автовизначення',
  },
  'system.dictionary.captions.targetLanguages': {
    en: 'Target languages (comma-separated ISO codes)',
    uk: 'Цільові мови (ISO-коди через кому)',
  },
  'system.dictionary.captions.save': { en: 'Save media captions', uk: 'Зберегти субтитри' },
  'system.dictionary.captions.saveSuccess': {
    en: 'Media captions settings saved.',
    uk: 'Налаштування субтитрів збережено.',
  },
  'system.dictionary.captions.saveFailed': {
    en: 'Failed to save media captions settings',
    uk: 'Не вдалося зберегти налаштування субтитрів',
  },
  'system.dictionary.captions.saving': { en: 'Saving…', uk: 'Збереження…' },
  'system.tabs.ariaLabel': { en: 'System sections', uk: 'Розділи системи' },
  'system.tab.general': { en: 'General', uk: 'Загальне' },
  'system.tab.email': { en: 'Email', uk: 'Email' },
  'system.tab.dictionary': { en: 'Word dictionary', uk: 'Словник слів' },
  'system.tab.connections': { en: 'Connections', uk: 'Підключення' },
  'system.tab.payments': { en: 'Payments', uk: 'Оплати' },
  'system.tab.payouts': { en: 'Payouts', uk: 'Виплати' },
  'system.tab.domains': { en: 'Domains', uk: 'Домени' },
  'system.tab.branding': { en: 'Branding', uk: 'Брендинг' },
  'system.tab.seller': { en: 'Seller & legal', uk: 'Продавець і юридичне' },
  'system.tab.ai': { en: 'AI assistant', uk: 'AI-помічник' },

  'system.ai.title': { en: 'Arvi AI assistant (LLM)', uk: 'AI-помічник Arvi (LLM)' },
  'system.ai.hint': {
    en: 'Connect any OpenAI-compatible endpoint (ChatGPT, Ollama, NVIDIA NIM, OpenRouter) or Anthropic. Used by the Arvi help chat (Pro plan feature aiAssist).',
    uk: 'Підключіть будь-який OpenAI-compatible endpoint (ChatGPT, Ollama, NVIDIA NIM, OpenRouter) або Anthropic. Використовується в чаті Arvi (фіча Pro: aiAssist).',
  },
  'system.ai.campusHint': {
    en: 'By default Arvi uses the model from Platform → Settings. On Pro you can override with your own provider, model, and API key.',
    uk: 'За замовчуванням Arvi бере модель з Platform → Settings. На Pro можна підключити власного провайдера, модель і API key.',
  },
  'system.ai.runtime': { en: 'Active now', uk: 'Зараз активне' },
  'system.ai.source.platform': { en: 'Platform default', uk: 'Дефолт Platform' },
  'system.ai.source.school': { en: 'School override', uk: 'Override школи' },
  'system.ai.source.env': { en: 'Environment', uk: 'Env' },
  'system.ai.status.on': { en: 'Enabled', uk: 'Увімкнено' },
  'system.ai.status.off': { en: 'Disabled', uk: 'Вимкнено' },
  'system.ai.key.label': { en: 'API key', uk: 'API key' },
  'system.ai.key.configured': { en: 'Key configured', uk: 'Ключ налаштовано' },
  'system.ai.key.missing': { en: 'Key missing', uk: 'Ключ відсутній' },
  'system.ai.platformDefaults': {
    en: 'Platform default',
    uk: 'Дефолт Platform',
  },
  'system.ai.platformDefaultsHint': {
    en: 'Set by platform operators. Read-only here — change it in the Platform console.',
    uk: 'Задає оператор Platform. Тут лише перегляд — змінюється в консолі Platform.',
  },
  'system.ai.schoolOverride': {
    en: 'School override',
    uk: 'Override школи',
  },
  'system.ai.schoolOverrideHint': {
    en: 'Optional BYOK for this campus. When off, Arvi inherits the Platform default.',
    uk: 'Опційний BYOK для цієї школи. Якщо вимкнено — успадковується дефолт Platform.',
  },
  'system.ai.effectiveLine': {
    en: 'Currently using: {source} · {provider} · {model}',
    uk: 'Зараз використовується: {source} · {provider} · {model}',
  },
  'system.ai.useSchoolOverride': {
    en: 'Use school override',
    uk: 'Використовувати override школи',
  },
  'system.ai.useSchoolOverrideHint': {
    en: 'Replace the Platform default with your own provider settings for this school.',
    uk: 'Замінити дефолт Platform власними налаштуваннями провайдера для цієї школи.',
  },
  'system.ai.proBadge': { en: 'Pro required', uk: 'Потрібен Pro' },
  'system.ai.proRequired': {
    en: 'Custom LLM keys require the Pro plan (aiAssist). Until then, the Platform default applies.',
    uk: 'Власний LLM доступний на тарифі Pro (aiAssist). Поки що діє дефолт Platform.',
  },
  'system.ai.enable': { en: 'Enable Arvi assistant', uk: 'Увімкнути помічника Arvi' },
  'system.ai.enableHint': {
    en: 'When disabled, Arvi chat returns unavailable even if keys are set.',
    uk: 'Якщо вимкнено — чат Arvi недоступний, навіть якщо ключі збережені.',
  },
  'system.ai.provider': { en: 'Provider', uk: 'Провайдер' },
  'system.ai.provider.openaiCompat': {
    en: 'OpenAI-compatible',
    uk: 'OpenAI-compatible',
  },
  'system.ai.provider.openaiCompatHint': {
    en: 'ChatGPT, Azure OpenAI (compat endpoint), Ollama, vLLM, NVIDIA NIM, OpenRouter, Groq, DeepSeek — set Base URL + model + API key.',
    uk: 'ChatGPT, Azure OpenAI (compat), Ollama, vLLM, NVIDIA NIM, OpenRouter, Groq, DeepSeek — Base URL + model + API key.',
  },
  'system.ai.provider.anthropic': { en: 'Anthropic', uk: 'Anthropic' },
  'system.ai.provider.anthropicHint': {
    en: 'Claude via Anthropic Messages API. Fixed API host — only model + Anthropic API key.',
    uk: 'Claude через Anthropic Messages API. Фіксований хост — лише model + Anthropic API key.',
  },
  'system.ai.baseUrl': { en: 'Base URL', uk: 'Base URL' },
  'system.ai.baseUrlHint': {
    en: 'e.g. https://api.openai.com/v1 or http://localhost:11434/v1',
    uk: 'напр. https://api.openai.com/v1 або http://localhost:11434/v1',
  },
  'system.ai.model': { en: 'Model', uk: 'Модель' },
  'system.ai.maxTokens': { en: 'Max tokens', uk: 'Макс. токенів' },
  'system.ai.temperature': { en: 'Temperature', uk: 'Temperature' },
  'system.ai.llmApiKey': { en: 'OpenAI-compatible API key', uk: 'API key (OpenAI-compatible)' },
  'system.ai.anthropicApiKey': { en: 'Anthropic API key', uk: 'Anthropic API key' },
  'system.ai.save': { en: 'Save AI assistant', uk: 'Зберегти AI-помічника' },
  'system.ai.saveSuccess': { en: 'AI assistant settings saved.', uk: 'Налаштування AI збережено.' },
  'system.ai.saveFailed': { en: 'Failed to save AI settings', uk: 'Не вдалося зберегти AI' },
  'system.ai.saving': { en: 'Saving…', uk: 'Збереження…' },
  'system.ai.test': { en: 'Test connection', uk: 'Перевірити зʼєднання' },
  'system.ai.testing': { en: 'Testing…', uk: 'Перевірка…' },
  'system.ai.testSuccess': { en: 'Connection OK', uk: 'Зʼєднання OK' },
  'system.ai.testFailed': { en: 'Connection failed', uk: 'Зʼєднання не вдалося' },


  'assistant.title': { en: 'Ask Arvi', uk: 'Запитай Arvi' },
  'assistant.subtitle': {
    en: 'Product help & navigation — not homework answers',
    uk: 'Довідка по продукту — не відповіді на ДЗ',
  },
  'assistant.subtitle.student': {
    en: 'Find Practice, Calendar, payments — I won’t do your homework',
    uk: 'Практика, Календар, оплата — ДЗ за тебе не зроблю',
  },
  'assistant.subtitle.teacher': {
    en: 'Scheduling, materials, students — not quiz answer keys',
    uk: 'Розклад, матеріали, студенти — не ключі до тестів',
  },
  'assistant.subtitle.admin': {
    en: 'System, Finance, Billing — never paste secrets in chat',
    uk: 'System, Finance, Billing — секрети в чат не пиши',
  },
  'assistant.open': { en: 'Open Arvi help chat', uk: 'Відкрити чат з Arvi' },
  'assistant.close': { en: 'Close chat', uk: 'Закрити чат' },
  'assistant.empty': {
    en: 'Ask how to find Calendar, Practice, payments, or any screen. I will not solve quizzes or homework.',
    uk: 'Запитай, де Календар, Практика чи оплата. Я не розвʼязую тести й ДЗ.',
  },
  'assistant.welcome.title': {
    en: 'Hi! I’m Arvi.',
    uk: 'Привіт! Я Arvi.',
  },
  'assistant.welcome.body': {
    en: 'I help you use Campus — ask in your own words.',
    uk: 'Я допомагаю користуватись Campus — пиши своїми словами.',
  },
  'assistant.welcome.can.navigate': {
    en: 'Find screens (Calendar, Practice, payments, chat, profile…)',
    uk: 'Знайти екрани (Календар, Практика, оплата, чат, профіль…)',
  },
  'assistant.welcome.can.explain': {
    en: 'Explain how a feature works for your role',
    uk: 'Пояснити, як працює функція для твоєї ролі',
  },
  'assistant.welcome.can.link': {
    en: 'Suggest a deep link so you can jump there in one tap',
    uk: 'Підказати посилання — відкриєш потрібну сторінку одним натиском',
  },
  'assistant.welcome.cannot': {
    en: 'I won’t solve homework, quizzes, or exercises — ask your teacher for that.',
    uk: 'Я не розвʼязую ДЗ, тести й вправи — для цього звернись до викладача.',
  },

  'assistant.welcome.student.body': {
    en: 'I’m your Campus guide for learning screens.',
    uk: 'Я гід по екранах навчання в Campus.',
  },
  'assistant.welcome.student.can.navigate': {
    en: 'Find Dashboard, Calendar, Practice, Vocabulary, Chat, Payment, Profile',
    uk: 'Знайти Dashboard, Календар, Практику, Словник, Чат, Оплату, Профіль',
  },
  'assistant.welcome.student.can.explain': {
    en: 'Explain how lessons, review, and payments work for you',
    uk: 'Пояснити уроки, повторення слів і оплату для тебе',
  },
  'assistant.welcome.student.can.link': {
    en: 'Jump you to the right student page in one tap',
    uk: 'Відкрити потрібну студентську сторінку одним натиском',
  },
  'assistant.welcome.student.cannot': {
    en: 'I won’t solve homework, quizzes, or speaking answers — ask your teacher. I also can’t open Finance or System.',
    uk: 'Не розвʼязую ДЗ, тести й speaking — питай викладача. Finance і System мені недоступні.',
  },

  'assistant.welcome.teacher.body': {
    en: 'I help with teaching workflows in Campus.',
    uk: 'Допомагаю з викладацькими сценаріями в Campus.',
  },
  'assistant.welcome.teacher.can.navigate': {
    en: 'Find Calendar, Materials, Students, Vocabulary, Chat, Profile',
    uk: 'Знайти Календар, Матеріали, Студентів, Словник, Чат, Профіль',
  },
  'assistant.welcome.teacher.can.explain': {
    en: 'Explain scheduling, lesson room, assigning materials (UI only)',
    uk: 'Пояснити розклад, кімнату уроку, призначення матеріалів (лише UI)',
  },
  'assistant.welcome.teacher.can.link': {
    en: 'Deep-link to teacher screens you can open',
    uk: 'Посилання на екрани викладача',
  },
  'assistant.welcome.teacher.cannot': {
    en: 'No student quiz/homework keys. No school Finance, System secrets, or Billing — ask an admin.',
    uk: 'Без ключів до ДЗ/тестів учнів. Без Finance, секретів System і Billing — це до адміна.',
  },

  'assistant.welcome.admin.body': {
    en: 'I help operate the school workspace.',
    uk: 'Допомагаю керувати шкільною робочою областю.',
  },
  'assistant.welcome.admin.can.navigate': {
    en: 'Find System, Finance, Billing, Students, Materials, Staff, and shared screens',
    uk: 'Знайти System, Finance, Billing, Студентів, Матеріали, Staff і спільні екрани',
  },
  'assistant.welcome.admin.can.explain': {
    en: 'Explain where integrations, LLM, email, and payments are configured',
    uk: 'Пояснити, де налаштовуються інтеграції, LLM, email і платежі',
  },
  'assistant.welcome.admin.can.link': {
    en: 'Deep-link to the admin screen you need',
    uk: 'Посилання на потрібний адмін-екран',
  },
  'assistant.welcome.admin.cannot': {
    en: 'I won’t invent balances or repeat API keys — never paste secrets here. I also won’t solve student homework.',
    uk: 'Не вигадую баланси й не повторюю API keys — секрети сюди не пиши. ДЗ учнів теж не розвʼязую.',
  },

  'assistant.placeholder': { en: 'How do I…?', uk: 'Як мені…?' },
  'assistant.send': { en: 'Send', uk: 'Надіслати' },
  'assistant.sending': { en: 'Thinking…', uk: 'Думаю…' },
  'assistant.openPage': { en: 'Open', uk: 'Відкрити' },
  'assistant.error': { en: 'Something went wrong', uk: 'Щось пішло не так' },
  'assistant.unavailable.title': {
    en: 'Assistant is not configured',
    uk: 'Асистента не налаштовано',
  },
  'assistant.unavailable.body': {
    en: 'Ask your school admin to enable Arvi AI under System → AI assistant (or Platform → Settings for the default model). Chat will stay off until a model and API key are set.',
    uk: 'Попросіть адміна школи увімкнути Arvi AI у System → AI assistant (або Platform → Settings для моделі за замовчуванням). Чат не працює, доки не задано модель і API key.',
  },
  'assistant.unavailable.placeholder': {
    en: 'Chat unavailable until AI is configured',
    uk: 'Чат недоступний, доки AI не налаштовано',
  },
  'assistant.proRequired': {
    en: 'AI assist requires the Pro plan. Ask your school admin to upgrade.',
    uk: 'AI-асистент потребує плану Pro. Попросіть адміна школи оновити план.',
  },

  'system.overview.aria': { en: 'System overview', uk: 'Огляд системи' },
  'system.overview.superAdmin.title': { en: 'Super-admin scope', uk: 'Область супер-адміна' },
  'system.overview.superAdmin.text': {
    en: 'Changes here affect the whole school workspace. Use controlled updates and verify each section after saving.',
    uk: 'Зміни тут впливають на всю робочу область школи. Оновлюйте обережно й перевіряйте кожен розділ після збереження.',
  },
  'system.overview.diagnostics.title': { en: 'Diagnostics first', uk: 'Спочатку діагностика' },
  'system.overview.diagnostics.text': {
    en: 'Start with Email test and Dictionary checks before editing payment providers to reduce integration drift.',
    uk: 'Спочатку перевірте Email і Словник, перш ніж змінювати платіжних провайдерів — це зменшить розбіжності інтеграцій.',
  },
  'system.general.title': { en: 'General', uk: 'Загальне' },
  'system.general.hint': {
    en: 'School-wide product settings. More sections will be grouped here as the control room grows.',
    uk: 'Загальні налаштування продукту школи. Інші розділи зʼявлятимуться тут у міру розширення кімнати керування.',
  },
  'system.general.features.aria': { en: 'Features', uk: 'Функції' },
  'system.general.features.title': { en: 'Features', uk: 'Функції' },
  'system.general.groupLessons.title': { en: 'Group lessons', uk: 'Групові уроки' },
  'system.general.groupLessons.hint': {
    en: 'Turns on learning groups, group scheduling, and group billing UI for teachers and admins. Default group payment rules live under Payments → Group payments.',
    uk: 'Увімкнює навчальні групи, групове планування та UI групової оплати для викладачів і адмінів. Правила групової оплати за замовчуванням — в Оплати → Групові оплати.',
  },
  'system.general.groupLessons.toggle': {
    en: 'Enable group lessons for this school',
    uk: 'Увімкнути групові уроки для цієї школи',
  },
  'system.general.videoMeetings.loading': {
    en: 'Loading video meetings…',
    uk: 'Завантаження відеозустрічей…',
  },
  'system.general.videoMeetings.title': { en: 'Video meetings', uk: 'Відеозустрічі' },
  'system.general.videoMeetings.hintIntro': {
    en: 'Pick the provider used to create video meeting links for new scheduled lessons. Zoom and Google Meet credentials are configured under ',
    uk: 'Оберіть провайдера для посилань на відеозустрічі в нових запланованих уроках. Облікові дані Zoom і Google Meet налаштовуються в ',
  },
  'system.general.videoMeetings.hintOutro': {
    en: '. Built-in (LiveKit) runs via Docker and requires no additional configuration here.',
    uk: '. Вбудований (LiveKit) працює через Docker і не потребує додаткового налаштування тут.',
  },
  'system.general.videoMeetings.providerAria': {
    en: 'Video meeting provider',
    uk: 'Провайдер відеозустрічей',
  },
  'system.general.videoMeetings.provider.livekit': {
    en: 'Built-in (LiveKit)',
    uk: 'Вбудований (LiveKit)',
  },
  'system.general.videoMeetings.notConfiguredLead': {
    en: 'is selected but not fully configured. Open the',
    uk: 'обрано, але не налаштовано повністю. Відкрийте вкладку',
  },
  'system.general.videoMeetings.notConfiguredTail': {
    en: 'and fill in the {provider} credentials so new lessons can create meeting links.',
    uk: 'та вкажіть облікові дані {provider}, щоб нові уроки могли створювати посилання на зустрічі.',
  },
  'system.general.languages.title': { en: 'Interface language', uk: 'Мова інтерфейсу' },
  'system.general.languages.hint': {
    en: 'Choose which languages this school offers and the default for new users.',
    uk: 'Оберіть, які мови пропонує ця школа, і мову за замовчуванням для нових користувачів.',
  },
  'system.general.languages.enabledLabel': {
    en: 'Available languages',
    uk: 'Доступні мови',
  },
  'system.general.languages.defaultLabel': {
    en: 'Default language',
    uk: 'Мова за замовчуванням',
  },
  'system.general.languages.defaultHint': {
    en: 'Applied to new users and when no other preference is set.',
    uk: 'Застосовується до нових користувачів і коли інші налаштування відсутні.',
  },
  'system.general.languages.defaultBadge': { en: 'Default', uk: 'За замовчуванням' },
  'system.general.languages.save': { en: 'Save languages', uk: 'Зберегти мови' },
  'system.general.languages.loadFailed': {
    en: 'Failed to load language settings',
    uk: 'Не вдалося завантажити налаштування мов',
  },
  'system.general.teaching.title': { en: 'Teaching', uk: 'Викладання' },
  'system.general.teaching.hint': {
    en: 'Languages you teach and default lesson delivery — set during signup, editable anytime.',
    uk: 'Мови викладання та формат уроків — з онбордингу, можна змінити будь-коли.',
  },
  'system.general.teaching.save': { en: 'Save teaching', uk: 'Зберегти викладання' },
  'system.general.teaching.loadFailed': {
    en: 'Could not load teaching preferences.',
    uk: 'Не вдалося завантажити налаштування викладання.',
  },
  'system.branding.title': { en: 'Branding', uk: 'Брендинг' },
  'system.branding.hint': {
    en: 'Override the accent color and logo for this school. Leave blank to use platform defaults.',
    uk: 'Перевизначте акцентний колір і логотип школи. Залиште порожнім для стандартних значень платформи.',
  },
  'system.branding.brandColor.label': { en: 'Brand color', uk: 'Колір бренду' },
  'system.branding.brandColor.hint': {
    en: 'Hex value, e.g. #159970. Controls buttons, links, and highlights.',
    uk: 'Hex-значення, напр. #159970. Керує кнопками, посиланнями та акцентами.',
  },
  'system.branding.brandColor.error': {
    en: 'Must be a hex color like #159970 or #1a9',
    uk: 'Має бути hex-колір, напр. #159970 або #1a9',
  },
  'system.branding.preview': { en: 'Preview', uk: 'Перегляд' },
  'system.branding.previewEmpty': {
    en: 'Enter a valid hex color to preview',
    uk: 'Введіть коректний hex-колір для перегляду',
  },
  'system.branding.logoUrl.label': { en: 'Logo URL', uk: 'URL логотипу' },
  'system.branding.logoUrl.hint': {
    en: 'Absolute URL to a PNG/SVG logo (recommended: 200×48 px).',
    uk: 'Абсолютний URL до PNG/SVG логотипу (рекомендовано: 200×48 px).',
  },
  'system.branding.save': { en: 'Save branding', uk: 'Зберегти брендинг' },
  'system.branding.error.save': {
    en: 'Failed to save branding settings',
    uk: 'Не вдалося зберегти налаштування брендингу',
  },
  'system.seller.title': { en: 'Seller & legal', uk: 'Продавець і юридичне' },
  'system.seller.hint': {
    en: 'Merchant details shown on public offer and legal pages. Required before enabling online card / PSP checkout methods.',
    uk: 'Реквізити продавця на публічній оферті та юридичних сторінках. Потрібні перед увімкненням онлайн-оплати карткою / PSP.',
  },
  'system.seller.incomplete': {
    en: 'Incomplete: add legal name, address, and support email before enabling online payments.',
    uk: 'Неповний профіль: додайте юридичну назву, адресу та email підтримки перед увімкненням онлайн-оплат.',
  },
  'system.seller.complete': {
    en: 'Seller profile is complete for online checkout.',
    uk: 'Профіль продавця готовий для онлайн-оплати.',
  },
  'system.seller.legalName.label': { en: 'Legal name', uk: 'Юридична назва' },
  'system.seller.legalName.hint': {
    en: 'Registered business or sole proprietor name shown to buyers.',
    uk: 'Зареєстрована назва бізнесу або ФОП, що показується покупцям.',
  },
  'system.seller.legalAddress.label': { en: 'Legal address', uk: 'Юридична адреса' },
  'system.seller.legalAddress.hint': {
    en: 'Registered address on controlled territory (shown on contacts / legal pages).',
    uk: 'Зареєстрована адреса на контрольованій території (на сторінках контактів / юридичних).',
  },
  'system.seller.country.label': { en: 'Country', uk: 'Країна' },
  'system.seller.country.hint': { en: 'ISO 3166-1 alpha-2 (e.g. UA).', uk: 'ISO 3166-1 alpha-2 (напр. UA).' },
  'system.seller.supportEmail.label': { en: 'Support email', uk: 'Email підтримки' },
  'system.seller.supportEmail.hint': {
    en: 'Buyer-facing contact for payment and refund questions.',
    uk: 'Контакт для покупців з питань оплати та повернень.',
  },
  'system.seller.supportPhone.label': { en: 'Support phone', uk: 'Телефон підтримки' },
  'system.seller.supportPhone.hint': { en: 'Optional phone number.', uk: 'Необовʼязковий номер телефону.' },
  'system.seller.mcc.label': { en: 'MCC', uk: 'MCC' },
  'system.seller.mcc.hint': {
    en: 'Merchant Category Code. Default 8299 — Schools / Educational Services.',
    uk: 'Merchant Category Code. За замовчуванням 8299 — школи / освітні послуги.',
  },
  'system.seller.termsOverride.label': { en: 'Terms override (markdown)', uk: 'Перевизначення умов (markdown)' },
  'system.seller.termsOverride.hint': {
    en: 'Leave blank to use the platform English template on /legal/terms.',
    uk: 'Залиште порожнім для англомовного шаблону платформи на /legal/terms.',
  },
  'system.seller.paymentRefundOverride.label': {
    en: 'Payment & refund override (markdown)',
    uk: 'Перевизначення оплати та повернень (markdown)',
  },
  'system.seller.paymentRefundOverride.hint': {
    en: 'Leave blank to use the platform English template on /legal/payment-refund.',
    uk: 'Залиште порожнім для англомовного шаблону платформи на /legal/payment-refund.',
  },
  'system.seller.save': { en: 'Save seller profile', uk: 'Зберегти профіль продавця' },
  'system.seller.error.load': {
    en: 'Failed to load seller profile',
    uk: 'Не вдалося завантажити профіль продавця',
  },
  'system.domains.title': { en: 'Custom Domains', uk: 'Власні домени' },
  'system.domains.hint': {
    en: 'Add a custom domain for your school (e.g. lessons.yourschool.com). After adding, create a DNS TXT record with the verification token shown below, then click Verify.',
    uk: 'Додайте власний домен школи (напр. lessons.yourschool.com). Після додавання створіть DNS TXT-запис із токеном нижче, потім натисніть Перевірити.',
  },
  'system.domains.loadError.title': { en: 'Could not load domains', uk: 'Не вдалося завантажити домени' },
  'system.domains.loadError.desc': { en: 'Please try again.', uk: 'Спробуйте ще раз.' },
  'system.domains.empty.title': { en: 'No custom domains yet', uk: 'Власних доменів ще немає' },
  'system.domains.empty.desc': {
    en: 'Add a domain below to let students access the platform via your own hostname.',
    uk: 'Додайте домен нижче, щоб учні заходили на платформу через ваш хост.',
  },
  'system.domains.badge.verified': { en: 'Verified', uk: 'Підтверджено' },
  'system.domains.badge.pending': { en: 'Pending', uk: 'Очікує' },
  'system.domains.badge.primary': { en: 'Primary', uk: 'Основний' },
  'system.domains.txtRecordPrefix': { en: 'Add TXT record:', uk: 'Додайте TXT-запис:' },
  'system.domains.verify': { en: 'Verify', uk: 'Перевірити' },
  'system.domains.verifying': { en: 'Verifying…', uk: 'Перевірка…' },
  'system.domains.remove': { en: 'Remove', uk: 'Видалити' },
  'system.domains.removing': { en: 'Removing…', uk: 'Видалення…' },
  'system.domains.hostname': { en: 'Hostname', uk: 'Хост' },
  'system.domains.add': { en: 'Add domain', uk: 'Додати домен' },
  'system.domains.adding': { en: 'Adding…', uk: 'Додавання…' },
  'system.domains.confirmRemove': { en: 'Remove this domain?', uk: 'Видалити цей домен?' },
  'system.domains.error.remove': { en: 'Failed to remove domain', uk: 'Не вдалося видалити домен' },
  'system.domains.planBlocked': {
    en: 'Custom domains require the Pro plan.',
    uk: 'Власні домени доступні на плані Pro.',
  },
  'system.payments.title': { en: 'Payments', uk: 'Оплати' },
  'system.payments.subtitle': {
    en: 'Configure billing infrastructure, checkout templates, and provider readiness.',
    uk: 'Налаштуйте інфраструктуру оплати, шаблони checkout і готовність провайдерів.',
  },
  'system.payments.sellerGateBefore': {
    en: 'Seller profile incomplete. Fill legal name, address, and support email under',
    uk: 'Профіль продавця неповний. Заповніть юридичну назву, адресу та email підтримки в',
  },
  'system.payments.sellerGateLink': { en: 'System → Seller & legal', uk: 'Система → Продавець і юридичне' },
  'system.payments.sellerGateAfter': {
    en: 'before enabling online card / PSP methods',
    uk: 'перш ніж увімкнути онлайн-картки / PSP-методи',
  },
  'system.payments.sellerGateOnlineSuffix': {
    en: ' (currently enabled online methods will fail to save until fixed)',
    uk: ' (увімкнені онлайн-методи не збережуться, доки це не виправлено)',
  },
  'system.payments.summaryAria': { en: 'Payments control summary', uk: 'Підсумок керування оплатами' },
  'system.payments.rail.operationsTitle': { en: 'Operations mode', uk: 'Режим експлуатації' },
  'system.payments.rail.operationsText': {
    en: 'Keep providers disabled until credentials and webhook endpoints are verified.',
    uk: 'Тримайте провайдерів вимкненими, доки не перевірите облікові дані та webhook-ендпоінти.',
  },
  'system.payments.rail.pricingTitle': { en: 'Pricing consistency', uk: 'Узгодженість цін' },
  'system.payments.rail.pricingText': {
    en: 'Match currency-specific lesson rates with package cards before saving live settings.',
    uk: 'Узгодьте тарифи за валютами з картками пакетів перед збереженням бойових налаштувань.',
  },
  'system.payments.overview.defaultLessonPrice': { en: 'Default lesson price', uk: 'Тариф уроку за замовчуванням' },
  'system.payments.overview.defaultLessonHint': {
    en: 'Applied unless a student has an override.',
    uk: 'Застосовується, якщо у учня немає індивідуального тарифу.',
  },
  'system.payments.overview.methodsLabel': { en: 'Payment methods', uk: 'Методи оплати' },
  'system.payments.overview.methodsEnabled': { en: '{enabled} / {total} enabled', uk: '{enabled} / {total} увімкнено' },
  'system.payments.overview.methodsConfigured': {
    en: '{count} configured for use right now.',
    uk: '{count} налаштовано для використання зараз.',
  },
  'system.payments.overview.packagesLabel': { en: 'Checkout packages', uk: 'Пакети checkout' },
  'system.payments.overview.packagesHint': {
    en: 'Student self-serve packages from {min} lessons.',
    uk: 'Пакети самообслуговування учнів від {min} уроків.',
  },
  'system.payments.overview.currenciesLabel': { en: 'Allowed currencies', uk: 'Дозволені валюти' },
  'system.payments.overview.defaultCurrency': { en: 'Default currency: {currency}', uk: 'Валюта за замовчуванням: {currency}' },
  'system.payments.ready.title': { en: 'Ready for students', uk: 'Готово для учнів' },
  'system.payments.ready.hint': {
    en: 'Review package templates and fix currency issues before saving.',
    uk: 'Перевірте шаблони пакетів і виправте проблеми з валютами перед збереженням.',
  },
  'system.payments.ready.packageLine': { en: '{lessons} lessons · {total}', uk: '{lessons} уроків · {total}' },
  'system.payments.ready.noPackages': {
    en: 'Add at least one package template for online checkout.',
    uk: 'Додайте щонайменше один шаблон пакета для онлайн-checkout.',
  },
  'system.payments.ready.configOk': {
    en: 'Configuration looks good for student checkout.',
    uk: 'Конфігурація готова для checkout учнів.',
  },
  'system.payments.save': { en: 'Save payment settings', uk: 'Зберегти налаштування оплати' },
  'system.payments.saving': { en: 'Saving…', uk: 'Збереження…' },
  'system.payments.saved': { en: 'Payment settings saved.', uk: 'Налаштування оплати збережено.' },
  'system.payments.error.save': { en: 'Save failed', uk: 'Не вдалося зберегти' },
  'system.payments.resolveCurrencyWarnings': {
    en: 'Resolve currency compatibility warnings before saving.',
    uk: 'Усуньте попередження про сумісність валют перед збереженням.',
  },
  'system.payments.pricing.title': { en: 'Currencies & lesson rates', uk: 'Валюти та тарифи уроків' },
  'system.payments.pricing.subtitle': {
    en: 'Set individual lesson prices per currency and default billing rules for new learning groups.',
    uk: 'Встановіть індивідуальні тарифи за валютами та правила оплати для нових навчальних груп.',
  },
  'system.payments.pricing.ratesTabAria': { en: 'Lesson rates', uk: 'Тарифи уроків' },
  'system.payments.pricing.groupTab': { en: 'Group payments', uk: 'Групові оплати' },
  'system.payments.pricing.defaultStudentRate': { en: 'Default student lesson rate', uk: 'Тариф індивідуального уроку за замовчуванням' },
  'system.payments.pricing.defaultStudentHint': {
    en: 'This amount is used everywhere until a student gets an individual override.',
    uk: 'Ця сума використовується всюди, доки учню не призначать індивідуальний тариф.',
  },
  'system.payments.pricing.minPackage': { en: 'Min package', uk: 'Мін. пакет' },
  'system.payments.pricing.eyebrow.pricing': { en: 'Pricing', uk: 'Ціни' },
  'system.payments.pricing.priceByCurrency': { en: 'Price per lesson by currency', uk: 'Ціна за урок за валютами' },
  'system.payments.pricing.priceByCurrencyHint': {
    en: 'Enter the lesson price in minor units. Example: `45000` = `450.00 UAH`',
    uk: 'Введіть ціну уроку в мінорних одиницях. Приклад: `45000` = `450.00 UAH`',
  },
  'system.payments.pricing.defaultBadge': { en: 'Default', uk: 'За замовчуванням' },
  'system.payments.pricing.eyebrow.currencies': { en: 'Currencies', uk: 'Валюти' },
  'system.payments.pricing.allowedCurrencies': { en: 'Allowed currencies', uk: 'Дозволені валюти' },
  'system.payments.pricing.eyebrow.rules': { en: 'Rules', uk: 'Правила' },
  'system.payments.pricing.packageRules': { en: 'Package rules', uk: 'Правила пакетів' },
  'system.payments.pricing.minLessons': { en: 'Min lessons', uk: 'Мін. уроків' },
  'system.payments.pricing.liveSummary': { en: 'Live summary', uk: 'Поточний підсумок' },
  'system.payments.pricing.whatStudentsSee': { en: 'What students see', uk: 'Що бачать учні' },
  'system.payments.pricing.packageTotalsHint': {
    en: 'Package totals are calculated as `lessons × lesson price`.',
    uk: 'Суми пакетів обчислюються як `уроки × ціна уроку`.',
  },
  'system.payments.pricing.quickPreview': { en: 'Quick preview', uk: 'Швидкий перегляд' },
  'system.payments.pricing.previewEmpty': { en: 'Add packages to preview totals.', uk: 'Додайте пакети для перегляду сум.' },
  'system.payments.pricing.defaultGroupBilling': { en: 'Default group billing', uk: 'Групова оплата за замовчуванням' },
  'system.payments.pricing.creditPerMemberLong': {
    en: '1 lesson credit per member',
    uk: '1 кредит уроку на учасника',
  },
  'system.payments.pricing.feature': { en: 'Feature', uk: 'Функція' },
  'system.payments.pricing.enabled': { en: 'Enabled', uk: 'Увімкнено' },
  'system.payments.pricing.disabled': { en: 'Disabled', uk: 'Вимкнено' },
  'system.payments.pricing.eyebrow.billing': { en: 'Billing', uk: 'Оплата' },
  'system.payments.pricing.howGroupCharges': { en: 'How group lessons charge', uk: 'Як оплачуються групові уроки' },
  'system.payments.pricing.perStudentOption': {
    en: 'Per student (lesson credit each)',
    uk: 'За учня (кредит уроку кожному)',
  },
  'system.payments.pricing.fixedTotalOption': { en: 'Fixed total per lesson', uk: 'Фіксована сума за урок' },
  'system.payments.pricing.eyebrow.amount': { en: 'Amount', uk: 'Сума' },
  'system.payments.pricing.fixedLessonTotal': { en: 'Fixed lesson total', uk: 'Фіксована сума уроку' },
  'system.payments.pricing.groupDisabledBefore': {
    en: 'Group lessons are turned off. Enable them in',
    uk: 'Групові уроки вимкнено. Увімкніть їх у',
  },
  'system.payments.pricing.groupDisabledLink': { en: 'System → General', uk: 'Система → Загальне' },
  'system.payments.pricing.groupDisabledAfter': { en: 'under Group lessons.', uk: 'у розділі Групові уроки.' },
  'system.payments.pricing.groupSummary': { en: 'Group summary', uk: 'Підсумок групи' },
  'system.payments.pricing.defaultCharge': { en: 'Default charge', uk: 'Тариф за замовчуванням' },
  'system.payments.pricing.status': { en: 'Status', uk: 'Статус' },
  'system.payments.pricing.featureDisabled': { en: 'Feature disabled', uk: 'Функцію вимкнено' },
  'system.payments.methods.title': { en: 'Payment methods', uk: 'Методи оплати' },
  'system.payments.methods.subtitle': {
    en: 'Enable providers and configure credentials. Checkout currencies per provider are listed below.',
    uk: 'Увімкніть провайдерів і налаштуйте облікові дані. Валюти checkout для кожного провайдера — нижче.',
  },
  'system.payments.methods.currencyMatrixTitle': { en: 'Checkout currency support', uk: 'Підтримка валют checkout' },
  'system.payments.methods.variantCurrency': { en: 'Variant: {currency}', uk: 'Варіант: {currency}' },
  'system.payments.methods.setVariantCurrency': {
    en: 'Set variant currency in method config',
    uk: 'Вкажіть валюту варіанта в налаштуваннях методу',
  },
  'system.payments.methods.currencyIncompatible': {
    en: 'Not compatible with all selected currencies',
    uk: 'Не сумісний з усіма обраними валютами',
  },
  'system.payments.method.enabled': { en: 'Enabled', uk: 'Увімкнено' },
  'system.payments.method.disabled': { en: 'Disabled', uk: 'Вимкнено' },
  'system.payments.method.configured': { en: 'Configured', uk: 'Налаштовано' },
  'system.payments.method.notConfigured': { en: 'Not configured', uk: 'Не налаштовано' },
  'system.payments.method.testMode': { en: 'Test mode', uk: 'Тестовий режим' },
  'system.payments.method.liveMode': { en: 'Live mode', uk: 'Бойовий режим' },
  'system.payments.method.configureAria': { en: 'Configure {provider}', uk: 'Налаштувати {provider}' },
  'system.payments.method.disable': { en: 'Disable', uk: 'Вимкнути' },
  'system.payments.method.enable': { en: 'Enable', uk: 'Увімкнути' },
  'system.payments.modal.eyebrow': { en: 'Payment method', uk: 'Метод оплати' },
  'system.payments.modal.titleSuffix': { en: 'settings', uk: 'налаштування' },
  'system.payments.modal.closeAria': { en: 'Close payment method settings', uk: 'Закрити налаштування методу оплати' },
  'system.payments.modal.save': { en: 'Save', uk: 'Зберегти' },
  'system.payments.modal.close': { en: 'Close', uk: 'Закрити' },
  'system.payments.packages.title': {
    en: 'Self-serve lesson packages (from {min} lessons)',
    uk: 'Пакети уроків самообслуговування (від {min} уроків)',
  },
  'system.payments.packages.subtitle': {
    en: 'Each template has its own currency. Students pick a ready-made card (e.g. 10 lessons · 4500 UAH vs 10 lessons · 120 USD).',
    uk: 'Кожен шаблон має свою валюту. Учні обирають готову картку (напр. 10 уроків · 4500 UAH чи 10 уроків · 120 USD).',
  },
  'system.payments.packages.add': { en: 'Add package', uk: 'Додати пакет' },
  'system.payments.packages.empty': {
    en: 'No packages yet. Add at least one for online checkout.',
    uk: 'Пакетів ще немає. Додайте щонайменше один для онлайн-checkout.',
  },
  'system.payments.packages.templates': { en: 'Package templates', uk: 'Шаблони пакетів' },
  'system.payments.packages.minimumSize': { en: 'Minimum size', uk: 'Мінімальний розмір' },
  'system.payments.packages.defaultCheckoutRate': { en: 'Default checkout rate', uk: 'Тариф checkout за замовчуванням' },
  'system.payments.packages.tone.starter': { en: 'Starter', uk: 'Стартовий' },
  'system.payments.packages.tone.premium': { en: 'Premium', uk: 'Преміум' },
  'system.payments.packages.tone.popular': { en: 'Popular choice', uk: 'Популярний вибір' },
  'system.payments.packages.fallbackLabel': { en: 'Package {index}', uk: 'Пакет {index}' },
  'system.payments.packages.recommended': { en: 'Recommended', uk: 'Рекомендовано' },
  'system.payments.packages.templateBadge': { en: 'Template #{index}', uk: 'Шаблон №{index}' },
  'system.payments.packages.checkoutFormula': {
    en: 'Student checkout total = lessons × lesson price ({currency})',
    uk: 'Сума checkout учня = уроки × ціна уроку ({currency})',
  },
  'system.payments.packages.labelField': { en: 'Package label', uk: 'Назва пакета' },
  'system.payments.packages.labelPlaceholder': { en: 'Label', uk: 'Назва' },
  'system.payments.packages.descriptionField': { en: 'Description (optional)', uk: 'Опис (необовʼязково)' },
  'system.payments.packages.descriptionPlaceholder': {
    en: 'e.g. Prepaid credit for individual lessons — no physical delivery',
    uk: 'напр. передплачений кредит на індивідуальні уроки — без фізичної доставки',
  },
  'system.payments.packages.descriptionHint': {
    en: 'Shown on the public offer and student checkout. Falls back to “N lessons · prepaid credit”.',
    uk: 'Показується в публічній оферті та checkout учня. За замовчуванням — «N уроків · передплачений кредит».',
  },
  'system.payments.packages.lessonsField': { en: 'Lessons in package', uk: 'Уроків у пакеті' },
  'system.payments.packages.lessonsPlaceholder': { en: 'Lessons', uk: 'Уроки' },
  'system.payments.packages.lessonsHint': {
    en: 'Must stay at or above the platform minimum.',
    uk: 'Має бути не нижче мінімуму платформи.',
  },
  'system.payments.packages.creditsBucket': { en: 'Credits bucket', uk: 'Кошик кредитів' },
  'system.payments.packages.creditsGroup': { en: 'Group lessons (per-member)', uk: 'Групові уроки (за учасника)' },
  'system.payments.packages.liveTotal': { en: 'Live total', uk: 'Поточна сума' },
  'system.payments.packages.removeAria': { en: 'Remove package', uk: 'Видалити пакет' },
  'system.payments.provider.merchantDetails': { en: 'School merchant details', uk: 'Дані мерчанта школи' },
  'system.payments.provider.secureSecrets': { en: 'School secure secrets', uk: 'Захищені секрети школи' },
  'system.payments.provider.selectCurrency': { en: 'Select currency', uk: 'Оберіть валюту' },
  'system.payments.config.environment': { en: 'Environment', uk: 'Середовище' },
  'system.payments.config.environmentAria': { en: 'Select payment environment', uk: 'Оберіть середовище оплати' },
  'system.payments.config.testMode': { en: 'Test mode', uk: 'Тестовий режим' },
  'system.payments.config.liveMode': { en: 'Live mode', uk: 'Бойовий режим' },
  'system.payments.config.moreInfoAria': { en: 'More info about {label}', uk: 'Докладніше про {label}' },
  'system.payments.config.secretPlaceholder': {
    en: 'Leave blank to keep current value',
    uk: 'Залиште порожнім, щоб зберегти поточне значення',
  },
  'system.payments.config.secretSaved': { en: 'Saved in this school', uk: 'Збережено в цій школі' },
  'system.payments.config.secretEnvFallback': { en: 'Using legacy env fallback', uk: 'Використовується legacy env fallback' },
  'system.payments.config.secretMissing': { en: 'Missing', uk: 'Відсутній' },
  'system.payments.config.officialDocs': { en: 'Official docs', uk: 'Офіційна документація' },
  'system.payments.config.setupTitle': { en: 'What you need to connect', uk: 'Що потрібно для підключення' },
  'system.payments.manualInvoice.title': { en: 'Manual invoice', uk: 'Ручний рахунок' },
  'system.payments.manualInvoice.description': {
    en: 'Bank transfer; admin credits lessons manually.',
    uk: 'Банківський переказ; адміністратор зараховує уроки вручну.',
  },
  'system.payments.manualInvoice.checklist.addMethods': {
    en: 'Add one or more manual methods such as IBAN / SEPA or SWIFT wire.',
    uk: 'Додайте один або кілька ручних методів, напр. IBAN / SEPA або SWIFT.',
  },
  'system.payments.manualInvoice.checklist.fillDetails': {
    en: 'Fill in the recipient details students need to complete a transfer.',
    uk: 'Заповніть реквізити отримувача, які потрібні учням для переказу.',
  },
  'system.payments.manualInvoice.checklist.creditManually': {
    en: 'After payment arrives, credit lessons manually in the student Billing tab.',
    uk: 'Після надходження оплати зарахуйте уроки вручну на вкладці Оплата учня.',
  },
  'system.payments.manualInvoice.kind.ibanSepa': { en: 'IBAN / SEPA', uk: 'IBAN / SEPA' },
  'system.payments.manualInvoice.kind.swiftWire': { en: 'SWIFT wire', uk: 'SWIFT переказ' },
  'system.payments.manualInvoice.kind.cardTransfer': { en: 'Card transfer', uk: 'Переказ на картку' },
  'system.payments.manualInvoice.kind.custom': { en: 'Manual invoice', uk: 'Ручний рахунок' },
  'system.payments.manualInvoice.toolbarHint': {
    en: 'Add one or more offline payment instructions. Students can later be restricted to specific manual methods in the student billing tab.',
    uk: 'Додайте одну або кілька офлайн-інструкцій оплати. Пізніше учнів можна обмежити конкретними ручними методами на вкладці оплати.',
  },
  'system.payments.manualInvoice.addIban': { en: 'Add IBAN / SEPA', uk: 'Додати IBAN / SEPA' },
  'system.payments.manualInvoice.addSwift': { en: 'Add SWIFT', uk: 'Додати SWIFT' },
  'system.payments.manualInvoice.addCard': { en: 'Add card transfer', uk: 'Додати переказ на картку' },
  'system.payments.manualInvoice.empty': {
    en: 'No manual invoice methods configured yet.',
    uk: 'Ручні методи оплати ще не налаштовано.',
  },
  'system.payments.manualInvoice.missingPrefix': { en: 'Missing:', uk: 'Відсутнє:' },
  'system.payments.manualInvoice.removeAria': { en: 'Remove {label}', uk: 'Видалити {label}' },
  'system.payments.manualInvoice.field.label': { en: 'Label', uk: 'Назва' },
  'system.payments.manualInvoice.field.paymentReferenceHint': { en: 'Payment reference hint', uk: 'Підказка для призначення платежу' },
  'system.payments.manualInvoice.field.paymentPurpose': { en: 'Payment purpose', uk: 'Призначення платежу' },
  'system.payments.manualInvoice.field.taxId': { en: 'Tax ID / EDRPOU', uk: 'Податковий ID / ЄДРПОУ' },
  'system.payments.manualInvoice.field.description': { en: 'Description', uk: 'Опис' },
  'system.payments.manualInvoice.field.importantNotes': { en: 'Important notes (one per line)', uk: 'Важливі примітки (по одній на рядок)' },
  'system.payments.manualInvoice.field.receiptHintUk': { en: 'Receipt hint (UK)', uk: 'Підказка для квитанції (UK)' },
  'system.payments.manualInvoice.field.beneficiaryName': { en: 'Beneficiary name', uk: 'Імʼя отримувача' },
  'system.payments.manualInvoice.field.bankNameOptional': { en: 'Bank name (optional)', uk: 'Назва банку (необовʼязково)' },
  'system.payments.manualInvoice.field.cardholderName': { en: 'Cardholder name', uk: 'Імʼя власника картки' },
  'system.payments.manualInvoice.field.bankName': { en: 'Bank name', uk: 'Назва банку' },
  'system.payments.manualInvoice.field.cardNumber': { en: 'Card number', uk: 'Номер картки' },
  'system.payments.manualInvoice.field.iban': { en: 'IBAN', uk: 'IBAN' },
  'system.payments.manualInvoice.field.bankCountryOptional': { en: 'Bank country (optional)', uk: 'Країна банку (необовʼязково)' },
  'system.payments.manualInvoice.field.bankCountryPlaceholder': {
    en: 'Ukraine, Germany, Poland...',
    uk: 'Україна, Німеччина, Польща...',
  },
  'system.payments.manualInvoice.field.bicOptional': { en: 'BIC / SWIFT (optional)', uk: 'BIC / SWIFT (необовʼязково)' },
  'system.payments.manualInvoice.field.accountNumber': { en: 'Account number', uk: 'Номер рахунку' },
  'system.payments.manualInvoice.field.ibanOptional': { en: 'IBAN (optional)', uk: 'IBAN (необовʼязково)' },
  'system.payments.manualInvoice.field.swiftBic': { en: 'SWIFT / BIC', uk: 'SWIFT / BIC' },
  'system.payments.manualInvoice.field.bankAddressOptional': { en: 'Bank address (optional)', uk: 'Адреса банку (необовʼязково)' },
  'system.payments.manualInvoice.field.beneficiaryAddressOptional': {
    en: 'Beneficiary address (optional)',
    uk: 'Адреса отримувача (необовʼязково)',
  },
  'system.payments.manualInvoice.field.intermediaryBankOptional': {
    en: 'Intermediary bank (optional)',
    uk: 'Банк-посередник (необовʼязково)',
  },
  'system.payments.manualInvoice.field.intermediarySwiftOptional': {
    en: 'Intermediary SWIFT (optional)',
    uk: 'SWIFT банку-посередника (необовʼязково)',
  },
  'system.payments.manualInvoice.field.instructions': { en: 'Instructions', uk: 'Інструкції' },
  'system.payments.hint.anyCurrency': { en: 'Any currency', uk: 'Будь-яка валюта' },
  'system.payments.hint.lemonVariantCurrency': {
    en: 'Variant currency in Lemon Squeezy',
    uk: 'Валюта варіанта в Lemon Squeezy',
  },
  'system.payments.hint.standardCurrencies': { en: 'UAH, USD, EUR', uk: 'UAH, USD, EUR' },
  'system.payouts.loading': {
    en: 'Loading payout defaults…',
    uk: 'Завантаження стандартних виплат…',
  },
  'system.payouts.summaryAria': {
    en: 'School payout defaults preview',
    uk: 'Перегляд стандартних виплат школи',
  },
  'system.payouts.title': { en: 'Staff payout defaults', uk: 'Стандартні виплати персоналу' },
  'system.payouts.summaryText': {
    en: 'School-wide baseline for teacher and admin compensation. Individual overrides live on each staff profile.',
    uk: 'Базова компенсація викладачів і адмінів для всієї школи. Індивідуальні перевизначення — у профілі кожного працівника.',
  },
  'system.payouts.mode': { en: 'Mode', uk: 'Режим' },
  'system.payouts.currency': { en: 'Currency', uk: 'Валюта' },
  'system.payouts.lessonRate': { en: 'Lesson rate', uk: 'Ставка за урок' },
  'system.payouts.salary': { en: 'Salary', uk: 'Оклад' },
  'system.payouts.payDay': { en: 'Pay day', uk: 'День виплати' },
  'system.payouts.gracePeriod': { en: 'Grace period', uk: 'Пільговий період' },
  'system.payouts.graceDay': { en: '{count} day', uk: '{count} день' },
  'system.payouts.graceDays': { en: '{count} days', uk: '{count} днів' },
  'system.payouts.introBefore': {
    en: 'Changes apply school-wide. Per-staff overrides are managed under ',
    uk: 'Зміни застосовуються для всієї школи. Індивідуальні перевизначення — у ',
  },
  'system.payouts.introLink': { en: 'Staff → Compensation', uk: 'Персонал → Компенсація' },
  'system.payouts.introAfter': { en: '.', uk: '.' },
  'system.payouts.save': { en: 'Save payout defaults', uk: 'Зберегти стандартні виплати' },
  'system.payouts.saved': { en: 'Payout defaults saved.', uk: 'Стандартні виплати збережено.' },
  'system.payouts.error.save': { en: 'Save failed', uk: 'Не вдалося зберегти' },
  'system.payouts.fields.defaultMode': { en: 'Default compensation mode', uk: 'Режим компенсації за замовчуванням' },
  'system.payouts.fields.defaultLessonRate': { en: 'Default per-lesson rate', uk: 'Ставка за урок за замовчуванням' },
  'system.payouts.fields.defaultSalary': { en: 'Default salary ({frequency})', uk: 'Оклад за замовчуванням ({frequency})' },
  'system.payouts.fields.payFrequency': { en: 'Pay frequency', uk: 'Частота виплат' },
  'system.payouts.fields.payDayWeek': { en: 'Pay day (week)', uk: 'День виплати (тиждень)' },
  'system.payouts.fields.payDayMonth': { en: 'Pay day of month (1–28)', uk: 'День виплати в місяці (1–28)' },
  'system.payouts.fields.payDayMonthOption': { en: 'Day {day}', uk: 'День {day}' },
  'system.payouts.fields.graceDays': { en: 'Grace days before overdue', uk: 'Пільгові дні до прострочення' },
  'system.payouts.section.payStructure.title': { en: 'Default pay structure', uk: 'Структура оплати за замовчуванням' },
  'system.payouts.section.payStructure.text': {
    en: 'Baseline mode, currency, and rates for new staff accrual calculations.',
    uk: 'Базовий режим, валюта та ставки для нарахувань новому персоналу.',
  },
  'system.payouts.section.schedule.title': { en: 'Default pay schedule', uk: 'Графік виплат за замовчуванням' },
  'system.payouts.section.schedule.text': {
    en: 'When outstanding balances become due unless a staff profile overrides this.',
    uk: 'Коли невиплачені суми стають до виплати, якщо профіль працівника не перевизначає це.',
  },
  'system.payouts.section.overdue.title': { en: 'Overdue rules', uk: 'Правила прострочення' },
  'system.payouts.section.overdue.text': {
    en: 'Grace period before due payouts appear as overdue on finance dashboards.',
    uk: 'Пільговий період до того, як виплати зʼявляться як прострочені на фінансових панелях.',
  },
  'system.domains.error.add': { en: 'Failed to add domain', uk: 'Не вдалося додати домен' },
  'system.domains.error.verify': { en: 'Verification failed', uk: 'Перевірку не пройдено' },
  'system.payments.pricing.individualTab': { en: 'Individual lessons', uk: 'Індивідуальні уроки' },
  'system.payments.pricing.currencyLabel': { en: 'Currency', uk: 'Валюта' },
  'system.payments.pricing.packagesCount': { en: 'Packages', uk: 'Пакети' },
  'system.payments.pricing.lessonsCount': { en: '{count} lessons', uk: '{count} уроків' },
  'system.payments.pricing.perLessonRate': { en: '{amount} per lesson', uk: '{amount} за урок' },
  'system.payments.pricing.defaultCurrencyField': { en: 'Default currency', uk: 'Валюта за замовчуванням' },
  'system.payments.pricing.priceMinorUnits': { en: 'Price (minor units)', uk: 'Ціна (мінорні одиниці)' },
  'system.payments.pricing.perLessonSuffix': { en: 'per lesson', uk: 'за урок' },
  'system.payments.pricing.splitMode': { en: 'Split mode', uk: 'Режим розподілу' },
  'system.payments.pricing.singlePayerGroupOption': {
    en: 'Single payer (set on group)',
    uk: 'Один платник (задається в групі)',
  },
  'system.payments.packages.currencyField': { en: 'Currency', uk: 'Валюта' },
  'system.payments.packages.creditsIndividual': { en: 'Individual lessons', uk: 'Індивідуальні уроки' },
  'system.payments.packages.perLessonSuffix': { en: 'per lesson', uk: 'за урок' },
  'system.payments.packages.lessonsBadge': { en: '{count} lessons', uk: '{count} уроків' },
  'legal.contacts.title': { en: 'Seller contacts', uk: 'Контакти продавця' },
  'legal.terms.title': { en: 'Terms', uk: 'Умови' },
  'legal.refund.title': { en: 'Payment & refund', uk: 'Оплата та повернення' },

  // —— Onboarding ——
  'onboarding.step.profile': { en: 'School profile', uk: 'Профіль школи' },
  'onboarding.step.teaching': { en: 'Teaching setup', uk: 'Налаштування викладання' },
  'onboarding.step.payments': { en: 'Payments', uk: 'Оплати' },
  'onboarding.step.invite': { en: 'Invite teammates', uk: 'Запросити команду' },
  'onboarding.step.sample-content': { en: 'Sample content', uk: 'Приклад контенту' },
  'onboarding.next': { en: 'Continue', uk: 'Далі' },
  'onboarding.back': { en: 'Back', uk: 'Назад' },
  'onboarding.finish': { en: 'Finish', uk: 'Завершити' },
  'onboarding.skip': { en: 'Skip', uk: 'Пропустити' },
  'onboarding.loadError': { en: 'Failed to load onboarding', uk: 'Не вдалося завантажити онбординг' },
  'onboarding.loading': { en: 'Loading…', uk: 'Завантаження…' },
  'onboarding.saving': { en: 'Saving…', uk: 'Збереження…' },
  'onboarding.saveError': { en: 'Could not save', uk: 'Не вдалося зберегти' },
  'onboarding.progress': {
    en: 'Step {current} of {total}',
    uk: 'Крок {current} з {total}',
  },
  'onboarding.profile.timezone': { en: 'Timezone', uk: 'Часовий пояс' },
  'onboarding.profile.locale': { en: 'Default language', uk: 'Мова інтерфейсу за замовчуванням' },
  'onboarding.profile.accent': { en: 'Accent color', uk: 'Акцентний колір' },
  'onboarding.teaching.languages': { en: 'Languages you teach', uk: 'Мови, які викладаєте' },
  'onboarding.teaching.languagesHint': {
    en: 'Comma-separated for now',
    uk: 'Поки що через кому',
  },
  'onboarding.teaching.format': { en: 'Default lesson format', uk: 'Формат уроків за замовчуванням' },
  'onboarding.teaching.format.online': { en: 'Online', uk: 'Онлайн' },
  'onboarding.teaching.format.inPerson': { en: 'In person', uk: 'Офлайн' },
  'onboarding.teaching.format.hybrid': { en: 'Hybrid', uk: 'Змішаний' },
  'onboarding.payments.intro': {
    en: 'Select which payment methods to enable. You can change this later in System → Payments (packages and provider secrets live there too).',
    uk: 'Оберіть методи оплати. Пізніше можна змінити в Система → Оплати (пакети та секрети провайдерів — також там).',
  },
  'onboarding.payments.loadError': {
    en: 'Could not load payment methods. You can enable them later in System → Payments.',
    uk: 'Не вдалося завантажити методи оплати. Увімкніть їх пізніше в Система → Оплати.',
  },
  'onboarding.payments.loading': {
    en: 'Loading payment options…',
    uk: 'Завантаження варіантів оплати…',
  },
  'onboarding.invite.label': { en: 'Invite teachers', uk: 'Запросити викладачів' },
  'onboarding.invite.hint': {
    en: 'One email per line — TEACHER invites are sent when you tap Continue. Verify your email first.',
    uk: 'Один email на рядок — запрошення з роллю TEACHER надсилаються після «Далі». Спочатку підтвердіть свій email.',
  },
  'onboarding.sample.label': {
    en: 'Add sample materials, a quiz, and a demo lesson?',
    uk: 'Додати зразкові матеріали, квіз і демо-урок?',
  },
  'onboarding.sample.yes': { en: 'Yes, add sample content', uk: 'Так, додати приклад контенту' },
  'onboarding.sample.no': { en: 'No thanks', uk: 'Ні, дякую' },

  // —— Tour chrome ——
  'tour.skip': { en: 'Skip', uk: 'Пропустити' },
  'tour.skipToActions': { en: 'Skip to actions', uk: 'До спроб' },
  'tour.next': { en: 'Next', uk: 'Далі' },
  'tour.back': { en: 'Back', uk: 'Назад' },
  'tour.finish': { en: 'Finish', uk: 'Готово' },
  'tour.replay': { en: 'Replay tour', uk: 'Пройти тур знову' },
  'tour.hub.title': { en: 'Try it yourself', uk: 'Спробуйте самі' },
  'tour.hub.body': {
    en: 'Pick a short scenario. Open the UI — saving is optional. Skip any chapter anytime.',
    uk: 'Оберіть короткий сценарій. Достатньо відкрити інтерфейс — зберігати не обовʼязково. Будь-який сценарій можна пропустити.',
  },
  'tour.hub.finishLater': { en: 'Finish later', uk: 'Пізніше' },
  'tour.hub.progress': {
    en: '{done} / {total} scenarios',
    uk: '{done} / {total} сценаріїв',
  },
  'tour.hub.status.todo': { en: 'Start', uk: 'Почати' },
  'tour.hub.status.done': { en: 'Done', uk: 'Готово' },
  'tour.hub.status.skipped': { en: 'Skipped', uk: 'Пропущено' },
  'tour.hub.replay': { en: 'Replay', uk: 'Повторити' },
  'tour.contextual.emptyTitle': { en: 'No tips for this screen', uk: 'Немає підказок для цього екрана' },
  'tour.contextual.emptyBody': {
    en: 'Try another page, or replay the full product tour from Profile → Account.',
    uk: 'Спробуйте іншу сторінку або повний тур у Профіль → Акаунт.',
  },
  'tour.helpProgress': {
    en: 'Help {current} / {total}',
    uk: 'Довідка {current} / {total}',
  },
  'tour.firstWordsProgress': {
    en: 'First words {current} / {total}',
    uk: 'Перші слова {current} / {total}',
  },
  'tour.chapter.skip': { en: 'Skip chapter', uk: 'Пропустити сценарій' },
  'tour.chapter.backToHub': { en: 'Back to list', uk: 'До списку' },
  'tour.questDetected': { en: 'Nice — detected!', uk: 'Є — спрацювало!' },
  'tour.tryItProgress': {
    en: 'Try it {current} / {total}',
    uk: 'Спробуйте {current} / {total}',
  },

  // —— Mascot ——
  'mascot.ariaLabel': { en: 'Arvi mascot', uk: 'Маскот Arvi' },
  'mascot.preview.title': { en: 'Arvi — mascot preview', uk: 'Arvi — попередній перегляд' },
  'mascot.preview.intro': {
    en: 'Drop public/mascot/arvi.glb to see the 3D model. Without it (or with reduced-motion / no WebGL) the 2D fallback shows. B7 poses: think, encourage, sleep, wave.',
    uk: 'Покладіть public/mascot/arvi.glb, щоб побачити 3D-модель. Без файлу (або з reduced-motion / без WebGL) показується 2D fallback. Пози B7: think, encourage, sleep, wave.',
  },
  'mascot.preview.posesHeading': { en: 'Poses @ 140px', uk: 'Пози @ 140px' },
  'mascot.preview.sizesHeading': { en: 'Sizes (idle)', uk: 'Розміри (idle)' },
};


/** Practice hub card structure — copy via practice.activity.* strings. */
export const CAMPUS_PRACTICE_ACTIVITIES = [
  {
    id: 'vocab',
    href: '/practice/vocabulary',
    icon: 'book-open',
    tagClass: 'tagGreen',
    accent: 'green',
  },
  {
    id: 'quiz',
    href: '/practice/quiz',
    icon: 'target',
    tagClass: 'tagBlue',
    accent: 'blue',
  },
  {
    id: 'speaking',
    href: '/practice/speaking',
    icon: 'mic',
    tagClass: 'tagAmber',
    accent: 'purple',
  },
  {
    id: 'irregular',
    href: '/practice/irregular-verbs',
    icon: 'repeat',
    tagClass: 'tagAmber',
    accent: 'amber',
  },
  {
    id: 'games',
    href: '#',
    icon: 'gamepad-2',
    tagClass: 'tagMuted',
    accent: 'amber',
    disabled: true,
  },
  {
    id: 'challenges',
    href: '#',
    icon: 'trophy',
    tagClass: 'tagMuted',
    accent: 'rose',
    disabled: true,
  },
] as const;

export const CAMPUS_UI_PAGES: Array<{
  slug: string;
  locales: Record<'uk' | 'en', { title: string; subtitle?: string; body?: string }>;
}> = [
  {
    slug: 'dashboard',
    locales: {
      en: { title: 'Dashboard', subtitle: 'Your daily learning hub' },
      uk: { title: 'Дашборд', subtitle: 'Ваш щоденний навчальний хаб' },
    },
  },
  {
    slug: 'practice',
    locales: {
      en: {
        title: 'Practice',
        subtitle:
          'Pick an activity: build vocabulary like in the Vocabulary area, or run drills like in the Quiz — all from one place.',
      },
      uk: {
        title: 'Практика',
        subtitle: 'Оберіть активність: словник, вікторини чи інші вправи — все в одному місці.',
      },
    },
  },
  {
    slug: 'login',
    locales: {
      en: {
        title: 'Sign in',
        subtitle: 'Welcome back. Pick up your lessons, practice, and messages in one place.',
      },
      uk: {
        title: 'Увійти',
        subtitle: 'З поверненням. Уроки, практика та повідомлення — в одному місці.',
      },
    },
  },
  {
    slug: 'privacy',
    locales: {
      en: { title: 'Privacy Policy', body: `## 1. Who we are

Arvilio ("we", "us") operates the Arvilio platform — a school management system for English-language schools. Your school admin manages your account within the platform.

## 2. What data we collect

- **Account data** — name, email address, password hash, role within your school.
- **Usage data** — lessons, vocabulary cards, quiz attempts, speaking submissions, chat messages, and related timestamps.
- **Technical data** — IP address, browser type, and server request logs (retained up to 90 days).
- **Analytics** — if you consent, we use PostHog (EU servers) to collect anonymised product-usage events. No personally identifiable data is sent to PostHog unless you are logged in and have consented.

## 3. How we use your data

- To provide and improve the platform.
- To send lesson reminders and school notifications (opt-out in profile settings).
- To calculate progress and generate vocabulary/quiz content.
- To comply with legal obligations (tax, financial records — retained 7 years).

## 4. Cookies and analytics

We use a strictly necessary session cookie to keep you logged in — this cookie does not require consent. We also offer optional analytics cookies (PostHog). You can accept or decline via the banner on your first visit.

## 5. Data sharing

We do not sell your data. We share data only with sub-processors necessary to operate the service:

- **Stripe** — payment processing (school billing only).
- **PostHog** — analytics (EU region; only if you consent).
- **Cloud hosting provider** — infrastructure (data stored in the EU).

## 6. Your rights (GDPR)

If you are located in the EEA or Ukraine, you have the right to access, correct, or erase your personal data. Use **Profile → Account → Export my data** or **Delete my account**. We will respond within 30 days.

## 7. Data retention

Account data is retained while your account is active. Upon deletion, personal identifiers are anonymised immediately; financial and audit records are retained for 7 years as required by law.

## 8. Contact

Questions? Email [privacy@arvilio.app](mailto:privacy@arvilio.app).
` },
      uk: {
        title: 'Політика конфіденційності',
        body: `## 1. Хто ми

Arvilio («ми») керує платформою Arvilio — системою управління школою. Адміністратор вашої школи керує акаунтом у межах платформи.

## 2. Які дані ми збираємо

- **Дані акаунта** — імʼя, email, хеш пароля, роль у школі.
- **Дані використання** — уроки, картки слів, вікторини, speaking, повідомлення чату та часові мітки.
- **Технічні дані** — IP, тип браузера, логи запитів (до 90 днів).
- **Аналітика** — за згодою PostHog (EU) збирає анонімізовані події використання.

## 3. Як використовуємо дані

- Щоб надавати й покращувати платформу.
- Для нагадувань про уроки та сповіщень школи (можна вимкнути в профілі).
- Для прогресу, словника та вікторин.
- Для виконання юридичних зобовʼязань (фінзаписи — до 7 років).

## 4. Cookies і аналітика

Необхідний session cookie для входу не потребує згоди. Опційні аналітичні cookies (PostHog) — через банер при першому візиті.

## 5. Передача даних

Ми не продаємо дані. Ділимось лише з підпроцесорами для роботи сервісу (Stripe, PostHog за згодою, хостинг у EU).

## 6. Ваші права (GDPR)

Доступ, виправлення чи видалення даних: **Профіль → Акаунт**. Відповідь протягом 30 днів.

## 7. Зберігання

Дані акаунта — поки акаунт активний. Після видалення ідентифікатори анонімізуються; фінзаписи — до 7 років.

## 8. Контакт

Питання: [privacy@arvilio.app](mailto:privacy@arvilio.app).
`,
      },
    },
  },
  {
    slug: 'legal-terms',
    locales: {
      en: { title: 'Terms', body: `# Public offer (buyer–seller terms)

**Last updated:** 11 July 2026

This public offer is made by **{{legalName}}** (“Seller”), operating the school **{{schoolName}}** on the Arvilio Campus platform, to any person (“Buyer”) who purchases prepaid language lesson credits.

## 1. Subject of the offer

The Seller offers prepaid **digital lesson credits** for language instruction delivered online. Credits are applied to the Buyer’s lesson balance in the school’s Campus account. There is **no physical shipping**.

## 2. Allowed products

The Seller sells **prepaid language lesson credits only**. The catalog does not include gambling, adult content, weapons, crypto assets, or other prohibited goods.

## 3. Price and payment

Prices are shown on the public offer page and at checkout in the stated currency. Amounts are greater than zero. Payment is processed by the school’s enabled payment providers. Completing checkout constitutes acceptance of this offer.

## 4. Delivery

After successful payment, lesson credits are credited to the Buyer’s account balance (digital delivery). Typical delivery is immediate after the payment provider confirms success.

## 5. Refunds and cancellation

Refund and cancellation terms are described in the [Payment & refund policy](/legal/payment-refund).

## 6. Seller details

- **Legal name:** {{legalName}}
- **Address:** {{legalAddress}}
- **Country:** {{legalCountry}}
- **MCC:** {{mcc}} (Schools / Educational Services unless otherwise stated)
- **Support:** {{supportEmail}}{{supportPhoneLine}}

## 7. Platform

Campus software is provided by Arvilio. The Seller is the merchant of record for lesson purchases unless otherwise stated at checkout.

## 8. Acceptance

By paying for a package, the Buyer accepts these terms. Questions: contact the Seller using the details above or via [Contacts](/legal/contacts).
` },
      uk: { title: 'Умови', body: `# Public offer (buyer–seller terms)

**Last updated:** 11 July 2026

This public offer is made by **{{legalName}}** (“Seller”), operating the school **{{schoolName}}** on the Arvilio Campus platform, to any person (“Buyer”) who purchases prepaid language lesson credits.

## 1. Subject of the offer

The Seller offers prepaid **digital lesson credits** for language instruction delivered online. Credits are applied to the Buyer’s lesson balance in the school’s Campus account. There is **no physical shipping**.

## 2. Allowed products

The Seller sells **prepaid language lesson credits only**. The catalog does not include gambling, adult content, weapons, crypto assets, or other prohibited goods.

## 3. Price and payment

Prices are shown on the public offer page and at checkout in the stated currency. Amounts are greater than zero. Payment is processed by the school’s enabled payment providers. Completing checkout constitutes acceptance of this offer.

## 4. Delivery

After successful payment, lesson credits are credited to the Buyer’s account balance (digital delivery). Typical delivery is immediate after the payment provider confirms success.

## 5. Refunds and cancellation

Refund and cancellation terms are described in the [Payment & refund policy](/legal/payment-refund).

## 6. Seller details

- **Legal name:** {{legalName}}
- **Address:** {{legalAddress}}
- **Country:** {{legalCountry}}
- **MCC:** {{mcc}} (Schools / Educational Services unless otherwise stated)
- **Support:** {{supportEmail}}{{supportPhoneLine}}

## 7. Platform

Campus software is provided by Arvilio. The Seller is the merchant of record for lesson purchases unless otherwise stated at checkout.

## 8. Acceptance

By paying for a package, the Buyer accepts these terms. Questions: contact the Seller using the details above or via [Contacts](/legal/contacts).
` },
    },
  },
  {
    slug: 'legal-payment-refund',
    locales: {
      en: { title: 'Payment & refunds', body: `# Payment, delivery & refund policy

**Last updated:** 11 July 2026

This policy applies to prepaid language lesson credits sold by **{{legalName}}** (“Seller”) for school **{{schoolName}}**.

## 1. Payment methods

Checkout may offer one or more of the payment methods enabled by the school (for example card processors or wallets). The Buyer pays through the school’s payment provider; Arvilio does not store full card numbers on Campus servers when a PSP is used.

## 2. Delivery (digital)

Products are **digital lesson credits**. There is no physical delivery or shipping. Credits appear on the Buyer’s lesson balance after the payment provider confirms a successful payment.

## 3. Pricing

Catalog and checkout prices are non-zero amounts in the currency shown. Taxes, if applicable, follow the Seller’s local rules and may be included in the displayed price.

## 4. Refunds

- Unused prepaid credits may be refunded at the Seller’s discretion when required by applicable law or the payment provider’s rules.
- Requests should be sent to **{{supportEmail}}** with the payment reference and account email.
- If a payment failed or was charged twice, contact support promptly so the Seller can work with the payment provider.
- Chargebacks are handled under the rules of the payment method used.

## 5. Cancellation

The Buyer may cancel an unpaid checkout at any time. After successful payment, cancellation means requesting a refund of unused credits as above.

## 6. Contact

- **Email:** {{supportEmail}}
- **Phone:** {{supportPhone}}
- **Address:** {{legalAddress}}, {{legalCountry}}

See also [Terms](/legal/terms) and [Contacts](/legal/contacts).
` },
      uk: { title: 'Оплата та повернення', body: `# Payment, delivery & refund policy

**Last updated:** 11 July 2026

This policy applies to prepaid language lesson credits sold by **{{legalName}}** (“Seller”) for school **{{schoolName}}**.

## 1. Payment methods

Checkout may offer one or more of the payment methods enabled by the school (for example card processors or wallets). The Buyer pays through the school’s payment provider; Arvilio does not store full card numbers on Campus servers when a PSP is used.

## 2. Delivery (digital)

Products are **digital lesson credits**. There is no physical delivery or shipping. Credits appear on the Buyer’s lesson balance after the payment provider confirms a successful payment.

## 3. Pricing

Catalog and checkout prices are non-zero amounts in the currency shown. Taxes, if applicable, follow the Seller’s local rules and may be included in the displayed price.

## 4. Refunds

- Unused prepaid credits may be refunded at the Seller’s discretion when required by applicable law or the payment provider’s rules.
- Requests should be sent to **{{supportEmail}}** with the payment reference and account email.
- If a payment failed or was charged twice, contact support promptly so the Seller can work with the payment provider.
- Chargebacks are handled under the rules of the payment method used.

## 5. Cancellation

The Buyer may cancel an unpaid checkout at any time. After successful payment, cancellation means requesting a refund of unused credits as above.

## 6. Contact

- **Email:** {{supportEmail}}
- **Phone:** {{supportPhone}}
- **Address:** {{legalAddress}}, {{legalCountry}}

See also [Terms](/legal/terms) and [Contacts](/legal/contacts).
` },
    },
  },
  {
    slug: 'status',
    locales: {
      en: { title: 'System Status', subtitle: 'Live health of Campus services' },
      uk: { title: 'Статус системи', subtitle: 'Стан сервісів Campus' },
    },
  },
];

export type CampusNavSeed = {
  sectionKey: string;
  sectionLabelKey: string;
  items: Array<{ href: string; labelKey: string; icon: string }>;
};

export const CAMPUS_NAV_SEED: CampusNavSeed[] = [
  {
    sectionKey: 'learn',
    sectionLabelKey: 'nav.section.learn',
    items: [
      { href: '/dashboard', labelKey: 'nav.dashboard', icon: 'grid' },
      { href: '/lessons', labelKey: 'nav.lessons', icon: 'lessons' },
      { href: '/practice', labelKey: 'nav.practice', icon: 'practice' },
      { href: '/materials', labelKey: 'nav.materials', icon: 'materials' },
    ],
  },
  {
    sectionKey: 'schedule',
    sectionLabelKey: 'nav.section.schedule',
    items: [{ href: '/calendar', labelKey: 'nav.calendar', icon: 'calendar' }],
  },
  {
    sectionKey: 'connect',
    sectionLabelKey: 'nav.section.connect',
    items: [
      { href: '/chat', labelKey: 'nav.chat', icon: 'chat' },
      { href: '/students', labelKey: 'nav.students', icon: 'students' },
      { href: '/staff', labelKey: 'nav.staff', icon: 'staff' },
    ],
  },
  {
    sectionKey: 'account',
    sectionLabelKey: 'nav.section.account',
    items: [
      { href: '/payment', labelKey: 'nav.payment', icon: 'payment' },
      { href: '/finance', labelKey: 'nav.finance', icon: 'finance' },
      { href: '/billing', labelKey: 'nav.billing', icon: 'billing' },
      { href: '/profile', labelKey: 'nav.profile', icon: 'profile' },
    ],
  },
  {
    sectionKey: 'platform',
    sectionLabelKey: 'nav.section.platform',
    items: [
      { href: '/admin', labelKey: 'nav.admin', icon: 'admin' },
      { href: '/system', labelKey: 'nav.system', icon: 'system' },
    ],
  },
];

/** Tour copy seed lives in [[campus-tour-seed]] — synced from Campus track files. */

export function campusUiFallbackMap(locale: 'uk' | 'en' = 'en'): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, pair] of Object.entries(CAMPUS_UI_STRINGS)) {
    out[key] = pair[locale] || pair.en;
  }
  return out;
}
