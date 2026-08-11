/**
 * Static legal copy — Terms & Conditions and Privacy Policy, per locale.
 *
 * Plain module data resolved at build time, matching ./restaurant.ts and
 * ./menu.ts. The legal pages are the most static content on the site, so
 * fetching them at runtime would buy nothing.
 *
 * PRODUCTION: the integrated build served this HTML from the backend's
 * legal-content endpoint (`api.legal.getTermsConditions` /
 * `getPrivacyPolicy`) so non-developers could edit it in a CMS. That path
 * still exists and still feeds `LegalModal` — see `src/api/legal.ts`. The
 * standalone pages below read from this module instead so they can be
 * statically generated and indexed.
 *
 * The HTML is rendered through `LegalContentSection`, which sanitises it with
 * isomorphic-dompurify before injecting it — kept that way deliberately, since
 * in production the same markup arrives over the network and must be treated
 * as untrusted.
 *
 * ⚠️ This is realistic sample copy for a portfolio demo, not reviewed legal
 * advice. A real deployment must replace it with text from a lawyer.
 */

import type { Locale } from "../locales/i18n/config";
import type { LegalContentData } from "../components/pages/legal/LegalContentSection";

export type LegalDocumentType = "terms-conditions" | "privacy-policy";

/**
 * Extends the shape LegalContentSection renders, so a document from this module
 * can be handed straight to it — the same component the API-driven modal uses.
 */
export interface LegalDocument extends LegalContentData {
  title: string;
  /** Short summary used for the page's meta description. */
  description: string;
  /** ISO date; rendered through LegalContentSection's locale-aware formatter. */
  last_updated: string;
  /** Sanitised before rendering. */
  content: string;
}

const LAST_UPDATED = "2026-01-15";

const EN_TERMS = `
<h2>1. Agreement to these terms</h2>
<p>These terms govern your use of the Shahrayar website and your orders placed through it. By browsing the site, creating an account, or placing an order you accept them. If you do not accept them, please do not use the service.</p>

<h2>2. Ordering</h2>
<p>An order is an offer to buy. It is accepted only when the branch you selected confirms it — an on-screen confirmation or an email receipt is confirmation of receipt, not of acceptance. We may decline an order if an item is unavailable, the delivery address falls outside the branch's zone, or we cannot verify your contact details.</p>
<ul>
  <li>Menu photography is illustrative; plating and portion may vary.</li>
  <li>Prices include VAT unless stated otherwise. Delivery is quoted separately before you pay.</li>
  <li>We may change prices at any time, but never after an order is accepted.</li>
</ul>

<h2>3. Allergens and dietary information</h2>
<p>Our kitchens handle nuts, sesame, dairy, gluten, and eggs on shared surfaces. We cannot guarantee that any dish is free of a given allergen. If you have a serious allergy, call the branch before ordering so staff can advise you directly.</p>

<h2>4. Delivery and collection</h2>
<p>Delivery times are estimates that depend on traffic, weather, and kitchen load. Someone must be available at the address to receive the order. If a courier cannot reach you after reasonable attempts, the order may be treated as delivered and no refund will be due.</p>

<h2>5. Cancellations and refunds</h2>
<p>Because food is prepared to order, you may cancel free of charge only until the kitchen begins preparation. After that a cancellation may be charged in full. If an order arrives late, incomplete, or not as described, contact the branch within 24 hours and we will refund or remake it.</p>

<h2>6. Accounts</h2>
<p>You are responsible for keeping your account credentials confidential and for activity under your account. Tell us immediately if you believe someone else has access to it. We may suspend an account used for fraudulent or abusive orders.</p>

<h2>7. Acceptable use</h2>
<p>Do not misuse the service: no attempting to breach its security, no automated scraping of the menu or pricing, and no reselling our content. We may suspend access where we reasonably believe this clause has been broken.</p>

<h2>8. Intellectual property</h2>
<p>The site's text, photography, branding, and layout belong to Shahrayar or its licensors. You may not reproduce them commercially without written permission.</p>

<h2>9. Liability</h2>
<p>Nothing here limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot be limited by law. Subject to that, our liability for any order is limited to the amount you paid for it.</p>

<h2>10. Changes</h2>
<p>We may update these terms. The version in force is the one published here when you place your order; the date above shows when it last changed.</p>

<h2>11. Governing law and contact</h2>
<p>These terms are governed by Bulgarian law, and the courts of Sofia have exclusive jurisdiction. Questions go to <a href="mailto:downtown@shahrayar.example">downtown@shahrayar.example</a> or +359 2 555 0142.</p>
`;

const EN_PRIVACY = `
<h2>1. Who we are</h2>
<p>Shahrayar operates the restaurants listed on this site and is the data controller for the personal data described below. You can reach us at <a href="mailto:downtown@shahrayar.example">downtown@shahrayar.example</a> or 12 Vitosha Boulevard, Sofia, Bulgaria.</p>

<h2>2. What we collect</h2>
<ul>
  <li><strong>Account details</strong> — name, email address, phone number, and a hashed password.</li>
  <li><strong>Order details</strong> — items, delivery or collection address, delivery notes, and order history.</li>
  <li><strong>Payment data</strong> — handled entirely by our payment processor. Card numbers never reach our servers; we store only the result of the transaction and the last four digits.</li>
  <li><strong>Location</strong> — only the delivery coordinates you choose on the map, and only to quote a delivery fee and route the courier.</li>
  <li><strong>Technical data</strong> — IP address, device and browser type, and pages viewed, used to keep the service secure and working.</li>
</ul>

<h2>3. Why we use it</h2>
<p>To take and deliver your order (performance of a contract); to keep accounts and payments secure and to prevent fraud (legitimate interests); to meet tax and accounting duties (legal obligation); and to send marketing messages, which we do only with your consent and which you can withdraw at any time.</p>

<h2>4. Cookies</h2>
<p>We use cookies that are strictly necessary — your session, your selected branch, your language, and the contents of your cart. Non-essential analytics cookies are set only if you accept them, and you can change that choice whenever you like.</p>

<h2>5. Who we share it with</h2>
<p>Only with processors who need it to run the service: our payment provider, delivery couriers, and our hosting and email providers. They act on our instructions and cannot use your data for their own purposes. We never sell personal data.</p>

<h2>6. How long we keep it</h2>
<p>Order records are kept for as long as tax law requires. Account data is kept while your account is open and deleted within 30 days of you closing it, except where we must retain it longer by law.</p>

<h2>7. Your rights</h2>
<p>You may request a copy of your data, correct it, delete it, restrict or object to its processing, or receive it in a portable format. Email us and we will respond within one month. If you are unhappy with our response you can complain to the Bulgarian Commission for Personal Data Protection.</p>

<h2>8. Security</h2>
<p>Data is transmitted over TLS, passwords are stored hashed and salted, and access to production systems is restricted and logged. No system is perfectly secure, but we will notify you and the regulator of a breach where the law requires it.</p>

<h2>9. Children</h2>
<p>The service is not directed at children under 16, and we do not knowingly collect their data. Contact us if you believe a child has provided us with personal data and we will delete it.</p>

<h2>10. Changes</h2>
<p>We will post any change to this policy on this page and update the date above. Significant changes will be notified by email where we hold your address.</p>
`;

const AR_TERMS = `
<h2>١. قبول الشروط</h2>
<p>تحكم هذه الشروط استخدامك لموقع شهريار والطلبات التي تقدّمها من خلاله. بتصفّحك الموقع أو إنشائك حساباً أو تقديمك طلباً فإنك توافق عليها. إن كنت لا توافق عليها، فيُرجى عدم استخدام الخدمة.</p>

<h2>٢. الطلبات</h2>
<p>الطلب هو عرض للشراء، ولا يُعدّ مقبولاً إلا عند تأكيده من الفرع الذي اخترته. رسالة التأكيد على الشاشة أو الإيصال بالبريد الإلكتروني إقرارٌ باستلام الطلب لا بقبوله. ويحقّ لنا رفض الطلب إذا نفد أحد الأصناف، أو وقع عنوان التوصيل خارج نطاق الفرع، أو تعذّر علينا التحقّق من بيانات التواصل.</p>
<ul>
  <li>صور الأطباق للتوضيح فقط، وقد يختلف التقديم والحجم.</li>
  <li>الأسعار شاملة ضريبة القيمة المضافة ما لم يُذكر خلاف ذلك، وتُحتسب رسوم التوصيل بصورة منفصلة قبل الدفع.</li>
  <li>قد نغيّر الأسعار في أي وقت، لكن ليس بعد قبول الطلب.</li>
</ul>

<h2>٣. مسبّبات الحساسية</h2>
<p>تتعامل مطابخنا مع المكسّرات والسمسم والألبان والغلوتين والبيض على أسطح مشتركة، ولا يمكننا ضمان خلوّ أي طبق من مسبّب معيّن. إن كانت لديك حساسية شديدة فاتّصل بالفرع قبل الطلب ليرشدك الطاقم مباشرة.</p>

<h2>٤. التوصيل والاستلام</h2>
<p>أوقات التوصيل تقديرية وتتأثر بالحركة المرورية والطقس وضغط العمل في المطبخ. يجب توفّر شخص على العنوان لاستلام الطلب. وإذا تعذّر على المندوب الوصول إليك بعد محاولات معقولة، فقد يُعدّ الطلب مُسلَّماً دون استرداد.</p>

<h2>٥. الإلغاء والاسترداد</h2>
<p>لأن الطعام يُحضَّر عند الطلب، يمكنك الإلغاء مجاناً قبل بدء التحضير فقط، وبعد ذلك قد تُحتسب قيمة الطلب كاملة. وإذا وصل الطلب متأخراً أو ناقصاً أو مخالفاً للوصف، فتواصل مع الفرع خلال ٢٤ ساعة وسنعيد المبلغ أو نعيد تحضير الطلب.</p>

<h2>٦. الحسابات</h2>
<p>أنت مسؤول عن سرّية بيانات دخولك وعن أي نشاط يجري عبر حسابك. أبلغنا فوراً إن اعتقدت أن شخصاً آخر يملك صلاحية الوصول إليه. ويحقّ لنا تعليق أي حساب يُستخدم في طلبات احتيالية أو مسيئة.</p>

<h2>٧. الاستخدام المقبول</h2>
<p>لا تُسئ استخدام الخدمة: يُمنع محاولة اختراق أمنها، أو السحب الآلي لبيانات القائمة والأسعار، أو إعادة بيع محتوانا. ويحقّ لنا تعليق الوصول متى رأينا بصورة معقولة أن هذا البند قد خُرق.</p>

<h2>٨. الملكية الفكرية</h2>
<p>النصوص والصور والعلامة التجارية وتصميم الموقع مملوكة لشهريار أو للمرخّصين له، ولا يجوز استنساخها لأغراض تجارية دون إذن خطّي.</p>

<h2>٩. المسؤولية</h2>
<p>لا يحدّ أي مما ورد هنا من المسؤولية عن الوفاة أو الإصابة الشخصية الناتجة عن الإهمال، أو عن الاحتيال، أو عن أي أمر لا يجيز القانون تحديده. وفيما عدا ذلك، تقتصر مسؤوليتنا عن أي طلب على المبلغ الذي دفعته مقابله.</p>

<h2>١٠. التعديلات</h2>
<p>قد نحدّث هذه الشروط. والنسخة السارية هي المنشورة هنا وقت تقديمك للطلب، ويبيّن التاريخ أعلاه موعد آخر تعديل.</p>

<h2>١١. القانون الواجب التطبيق والتواصل</h2>
<p>تخضع هذه الشروط للقانون البلغاري، ولمحاكم صوفيا الاختصاص الحصري. للاستفسارات: <a href="mailto:downtown@shahrayar.example">downtown@shahrayar.example</a> أو ‎+359 2 555 0142.</p>
`;

const AR_PRIVACY = `
<h2>١. من نحن</h2>
<p>تُشغّل شهريار المطاعم المذكورة في هذا الموقع، وهي المتحكّم بالبيانات الشخصية الموضّحة أدناه. يمكنك مراسلتنا على <a href="mailto:downtown@shahrayar.example">downtown@shahrayar.example</a> أو زيارتنا في ١٢ شارع فيتوشا، صوفيا، بلغاريا.</p>

<h2>٢. البيانات التي نجمعها</h2>
<ul>
  <li><strong>بيانات الحساب</strong> — الاسم والبريد الإلكتروني ورقم الهاتف وكلمة مرور مُشفَّرة.</li>
  <li><strong>بيانات الطلب</strong> — الأصناف وعنوان التوصيل أو الاستلام وملاحظات التوصيل وسجلّ الطلبات.</li>
  <li><strong>بيانات الدفع</strong> — تُعالَج بالكامل لدى مزوّد الدفع. أرقام البطاقات لا تصل خوادمنا إطلاقاً، ولا نحتفظ إلا بنتيجة العملية وآخر أربعة أرقام.</li>
  <li><strong>الموقع الجغرافي</strong> — فقط إحداثيات التوصيل التي تحدّدها على الخريطة، ولغرض احتساب رسوم التوصيل وتوجيه المندوب.</li>
  <li><strong>بيانات تقنية</strong> — عنوان IP ونوع الجهاز والمتصفّح والصفحات المعروضة، لأغراض أمن الخدمة وسلامة عملها.</li>
</ul>

<h2>٣. لماذا نستخدمها</h2>
<p>لتنفيذ طلبك وتوصيله (تنفيذ عقد)؛ ولحماية الحسابات والمدفوعات ومنع الاحتيال (مصلحة مشروعة)؛ وللوفاء بالالتزامات الضريبية والمحاسبية (التزام قانوني)؛ ولإرسال الرسائل التسويقية، وهذه لا تتمّ إلا بموافقتك ويمكنك سحبها في أي وقت.</p>

<h2>٤. ملفات تعريف الارتباط</h2>
<p>نستخدم ملفات ضرورية تماماً: جلستك، والفرع الذي اخترته، ولغتك، ومحتويات سلّتك. أما ملفات التحليلات غير الضرورية فلا تُفعَّل إلا بقبولك، ويمكنك تغيير هذا الاختيار متى شئت.</p>

<h2>٥. مع من نشاركها</h2>
<p>فقط مع المعالِجين الذين يحتاجونها لتشغيل الخدمة: مزوّد الدفع، ومندوبو التوصيل، ومزوّدو الاستضافة والبريد. وهم يتصرّفون بناءً على تعليماتنا ولا يجوز لهم استخدام بياناتك لأغراضهم. ولا نبيع البيانات الشخصية إطلاقاً.</p>

<h2>٦. مدة الاحتفاظ</h2>
<p>تُحفظ سجلات الطلبات للمدة التي يفرضها القانون الضريبي. وتُحفظ بيانات الحساب ما دام حسابك مفتوحاً، وتُحذف خلال ٣٠ يوماً من إغلاقه، إلا حيث يُلزمنا القانون بمدة أطول.</p>

<h2>٧. حقوقك</h2>
<p>يحقّ لك طلب نسخة من بياناتك أو تصحيحها أو حذفها أو تقييد معالجتها أو الاعتراض عليها أو استلامها بصيغة قابلة للنقل. راسلنا وسنردّ خلال شهر. وإن لم يُرضِك ردّنا فيمكنك التقدّم بشكوى إلى اللجنة البلغارية لحماية البيانات الشخصية.</p>

<h2>٨. الأمان</h2>
<p>تُنقل البيانات عبر TLS، وتُخزَّن كلمات المرور مُشفَّرة ومُملَّحة، والوصول إلى أنظمة الإنتاج مقيَّد ومُسجَّل. ولا يوجد نظام آمن تماماً، لكننا سنبلغك ونبلغ الجهة الرقابية بأي خرق حيثما يوجب القانون ذلك.</p>

<h2>٩. الأطفال</h2>
<p>الخدمة ليست موجَّهة لمن هم دون السادسة عشرة، ولا نجمع بياناتهم عن علم. تواصل معنا إن كنت تعتقد أن طفلاً زوّدنا ببيانات شخصية وسنحذفها.</p>

<h2>١٠. التعديلات</h2>
<p>سننشر أي تعديل على هذه السياسة في هذه الصفحة ونحدّث التاريخ أعلاه. وسنُشعرك بالتعديلات الجوهرية عبر البريد الإلكتروني حيثما توفّر لدينا عنوانك.</p>
`;

const BG_TERMS = `
<h2>1. Приемане на условията</h2>
<p>Настоящите условия уреждат използването на сайта на Shahrayar и поръчките, направени чрез него. С разглеждането на сайта, създаването на профил или подаването на поръчка Вие ги приемате. Ако не сте съгласни с тях, моля не използвайте услугата.</p>

<h2>2. Поръчки</h2>
<p>Поръчката представлява предложение за покупка и се счита за приета едва след потвърждение от избрания от Вас обект. Потвърждението на екрана или имейлът с разписка удостоверяват получаването, но не и приемането. Можем да откажем поръчка, ако продукт е изчерпан, адресът за доставка е извън зоната на обекта или не можем да проверим данните Ви за контакт.</p>
<ul>
  <li>Снимките на ястията са илюстративни; сервирането и грамажът може да се различават.</li>
  <li>Цените са с включен ДДС, освен ако не е посочено друго. Доставката се калкулира отделно преди плащане.</li>
  <li>Можем да променяме цените по всяко време, но не и след приемане на поръчка.</li>
</ul>

<h2>3. Алергени</h2>
<p>В кухните ни се работи с ядки, сусам, млечни продукти, глутен и яйца върху общи повърхности. Не можем да гарантираме, че дадено ястие не съдържа конкретен алерген. При сериозна алергия се обадете в обекта преди да поръчате, за да Ви консултира персоналът.</p>

<h2>4. Доставка и вземане на място</h2>
<p>Времената за доставка са ориентировъчни и зависят от трафика, времето и натоварването на кухнята. На адреса трябва да има кой да приеме поръчката. Ако куриерът не успее да Ви открие след разумни опити, поръчката може да се счита за доставена без право на възстановяване.</p>

<h2>5. Отказ и възстановяване</h2>
<p>Тъй като храната се приготвя по поръчка, безплатен отказ е възможен само преди началото на приготвянето. След това може да Ви бъде начислена пълната стойност. Ако поръчката пристигне със закъснение, непълна или несъответстваща на описанието, свържете се с обекта в рамките на 24 часа и ще възстановим сумата или ще я приготвим отново.</p>

<h2>6. Профили</h2>
<p>Вие отговаряте за поверителността на данните си за достъп и за действията през Вашия профил. Уведомете ни незабавно, ако смятате, че друг има достъп до него. Можем да спрем профил, използван за измамни или злоупотребяващи поръчки.</p>

<h2>7. Допустимо ползване</h2>
<p>Не злоупотребявайте с услугата: забранени са опитите за пробив в сигурността ѝ, автоматизираното извличане на менюто и цените, както и препродажбата на съдържанието ни. Можем да ограничим достъпа, когато основателно преценим, че тази клауза е нарушена.</p>

<h2>8. Интелектуална собственост</h2>
<p>Текстовете, фотографиите, марката и оформлението на сайта принадлежат на Shahrayar или на неговите лицензодатели и не могат да се възпроизвеждат с търговска цел без писмено разрешение.</p>

<h2>9. Отговорност</h2>
<p>Нищо тук не ограничава отговорността при смърт или телесна повреда поради небрежност, при измама или в други случаи, в които законът не допуска ограничаване. Извън това отговорността ни по всяка поръчка е ограничена до платената за нея сума.</p>

<h2>10. Промени</h2>
<p>Можем да актуализираме тези условия. Приложима е версията, публикувана тук към момента на поръчката; датата по-горе показва кога са променени за последно.</p>

<h2>11. Приложимо право и контакт</h2>
<p>Настоящите условия се уреждат от българското право, а съдилищата в София имат изключителна компетентност. Въпроси: <a href="mailto:downtown@shahrayar.example">downtown@shahrayar.example</a> или +359 2 555 0142.</p>
`;

const BG_PRIVACY = `
<h2>1. Кои сме ние</h2>
<p>Shahrayar стопанисва ресторантите, посочени на този сайт, и е администратор на личните данни, описани по-долу. Може да се свържете с нас на <a href="mailto:downtown@shahrayar.example">downtown@shahrayar.example</a> или на бул. „Витоша“ 12, София, България.</p>

<h2>2. Какво събираме</h2>
<ul>
  <li><strong>Данни за профил</strong> — име, имейл адрес, телефонен номер и хеширана парола.</li>
  <li><strong>Данни за поръчката</strong> — продукти, адрес за доставка или вземане, бележки към доставката и история на поръчките.</li>
  <li><strong>Платежни данни</strong> — обработват се изцяло от нашия платежен доставчик. Номерата на картите никога не достигат до сървърите ни; съхраняваме само резултата от транзакцията и последните четири цифри.</li>
  <li><strong>Местоположение</strong> — само координатите за доставка, които избирате на картата, и единствено за калкулиране на такса и маршрут на куриера.</li>
  <li><strong>Технически данни</strong> — IP адрес, тип устройство и браузър и разгледани страници, използвани за сигурността и работата на услугата.</li>
</ul>

<h2>3. Защо ги използваме</h2>
<p>За приемане и доставка на поръчката Ви (изпълнение на договор); за сигурността на профилите и плащанията и предотвратяване на измами (легитимен интерес); за спазване на данъчни и счетоводни задължения (законово задължение); и за маркетингови съобщения, които изпращаме само с Ваше съгласие и които можете да оттеглите по всяко време.</p>

<h2>4. Бисквитки</h2>
<p>Използваме строго необходими бисквитки — за Вашата сесия, избрания обект, езика и съдържанието на количката. Аналитични бисквитки се задават само ако ги приемете и можете да промените избора си по всяко време.</p>

<h2>5. С кого ги споделяме</h2>
<p>Само с обработващи, на които са необходими за работата на услугата: платежния ни доставчик, куриерите и доставчиците на хостинг и имейл. Те действат по наши указания и не могат да използват данните Ви за собствени цели. Никога не продаваме лични данни.</p>

<h2>6. Колко дълго ги пазим</h2>
<p>Записите за поръчки се пазят за срока, изискван от данъчното законодателство. Данните за профил се пазят, докато профилът е активен, и се изтриват до 30 дни след закриването му, освен ако законът не изисква по-дълъг срок.</p>

<h2>7. Вашите права</h2>
<p>Имате право на копие от данните си, на коригиране, изтриване, ограничаване или възражение срещу обработването, както и на преносимост. Пишете ни и ще отговорим в едномесечен срок. Ако отговорът не Ви удовлетворява, може да подадете жалба до Комисията за защита на личните данни.</p>

<h2>8. Сигурност</h2>
<p>Данните се предават по TLS, паролите се съхраняват хеширани и осолени, а достъпът до производствените системи е ограничен и журналиран. Никоя система не е напълно защитена, но ще уведомим Вас и регулатора при нарушение, когато законът изисква това.</p>

<h2>9. Деца</h2>
<p>Услугата не е насочена към лица под 16 години и не събираме съзнателно техни данни. Свържете се с нас, ако смятате, че дете ни е предоставило лични данни, и ще ги изтрием.</p>

<h2>10. Промени</h2>
<p>Всяка промяна в тази политика ще бъде публикувана на тази страница с актуализиране на датата по-горе. За съществени промени ще Ви уведомим по имейл, когато разполагаме с адреса Ви.</p>
`;

const documents: Record<Locale, Record<LegalDocumentType, LegalDocument>> = {
  en: {
    "terms-conditions": {
      title: "Terms & Conditions",
      description:
        "The terms that govern ordering from Shahrayar — orders, allergens, delivery, cancellations, and liability.",
      last_updated: LAST_UPDATED,
      content: EN_TERMS,
    },
    "privacy-policy": {
      title: "Privacy Policy",
      description:
        "What personal data Shahrayar collects, why we use it, who we share it with, and the rights you have over it.",
      last_updated: LAST_UPDATED,
      content: EN_PRIVACY,
    },
  },
  ar: {
    "terms-conditions": {
      title: "الشروط والأحكام",
      description: "الشروط التي تحكم الطلب من شهريار — الطلبات ومسبّبات الحساسية والتوصيل والإلغاء والمسؤولية.",
      last_updated: LAST_UPDATED,
      content: AR_TERMS,
    },
    "privacy-policy": {
      title: "سياسة الخصوصية",
      description: "ما البيانات الشخصية التي تجمعها شهريار، ولماذا نستخدمها، ومع من نشاركها، وما حقوقك بشأنها.",
      last_updated: LAST_UPDATED,
      content: AR_PRIVACY,
    },
  },
  bg: {
    "terms-conditions": {
      title: "Условия и правила",
      description:
        "Условията за поръчка от Shahrayar — поръчки, алергени, доставка, отказ и отговорност.",
      last_updated: LAST_UPDATED,
      content: BG_TERMS,
    },
    "privacy-policy": {
      title: "Политика за поверителност",
      description:
        "Какви лични данни събира Shahrayar, защо ги използваме, с кого ги споделяме и какви права имате.",
      last_updated: LAST_UPDATED,
      content: BG_PRIVACY,
    },
  },
};

/** Returns the legal document for a locale, falling back to the default locale. */
export function getLegalDocument(type: LegalDocumentType, lang: Locale): LegalDocument {
  return documents[lang]?.[type] ?? documents.en[type];
}
