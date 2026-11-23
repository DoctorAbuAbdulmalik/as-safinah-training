// Stage-2 interface text: the Ship's Key, About the Ship and the Welcome aboard tour.
// Kept apart from i18n.js because it is longer prose. Ship words lead, plain words stay beside them.

/** The Ship's Key: every symbol stands for one thing only. [symbol, name, meaning, where it appears] */
export const KEY = {
  en: [
    ["ship", "The ship", "The Centre itself: a vessel that carries people who could not cross alone", "Header; hub of every wheel"],
    ["porthole", "Porthole wheel", "One programme, seen from inside the ship", "Programme gallery; course screens"],
    ["compass", "Compass rose", "Direction, and values that do not change with the weather", "Main deck; breadcrumbs; loading"],
    ["pennant", "Pennant", "The flagship programmes", "Management and Leadership"],
    ["helm", "Ship's helm", "Command: the person answerable for the voyage", "Leadership programme"],
    ["anchor", "Anchor", "The Islamic foundation: what holds when the storm comes", "Opening of each module"],
    ["sounding", "Sounding line", "Taking honest measure now", "Ten tests"],
    ["knot", "Rope knot", "Practical skill learned by doing", "Practical exercise"],
    ["lighthouse", "Lighthouse", "A fixed light to steer by", "Learning outcomes"],
    ["log", "Ship's log", "The record of where you have been", "My voyage; marking a section complete"],
    ["flags", "Signal flags", "The shared words ships use to speak to each other", "Glossary"],
    ["chart", "Sea chart", "The whole voyage planned before you sail", "Course outline"],
    ["pass", "Boarding pass", "Asking for a place on board", "Application form"],
    ["bell", "Ship's bell", "Calling someone who can answer", "Questions and answers"],
    ["harbour", "Harbour", "Arrival and purpose", "Course completed; footer"],
    ["diamond", "Gold diamond", "Passage from one part to the next", "Dividers"],
  ],
  ar: [
    ["ship", "السفينة", "المركز نفسه: سفينة تحمل من لا يستطيع العبور وحده", "الترويسة؛ مركز كل عجلة"],
    ["porthole", "عجلة الكوّة", "برنامج واحد، يُرى من داخل السفينة", "معرض البرامج؛ صفحات الدورات"],
    ["compass", "وردة البوصلة", "الوجهة، والقيم التي لا تتغير بتغيّر الطقس", "السطح الرئيسي؛ مسار التنقل؛ التحميل"],
    ["pennant", "الراية", "البرامج الرائدة", "الإدارة والقيادة"],
    ["helm", "دفّة السفينة", "القيادة: الشخص المسؤول عن الرحلة", "برنامج القيادة"],
    ["anchor", "المرساة", "الأساس الإسلامي: ما يثبت حين تأتي العاصفة", "افتتاح كل وحدة"],
    ["sounding", "حبل السَّبر", "قياس صادق للحال الآن", "الاختبارات العشرة"],
    ["knot", "عقدة الحبل", "مهارة عملية تُتعلَّم بالممارسة", "التمرين العملي"],
    ["lighthouse", "المنارة", "نور ثابت يُهتدى به", "مخرجات التعلّم"],
    ["log", "سجل السفينة", "سجل المواضع التي مررت بها", "رحلتي؛ إتمام القسم"],
    ["flags", "رايات الإشارة", "الكلمات المشتركة التي تتخاطب بها السفن", "مسرد المصطلحات"],
    ["chart", "الخريطة البحرية", "الرحلة كلها مخطَّطة قبل الإبحار", "مخطط الدورة"],
    ["pass", "بطاقة الصعود", "طلب مكان على متن السفينة", "نموذج التقديم"],
    ["bell", "جرس السفينة", "استدعاء من يستطيع أن يجيب", "الأسئلة والأجوبة"],
    ["harbour", "الميناء", "الوصول والغاية", "إتمام الدورة؛ التذييل"],
    ["diamond", "المُعيَّن الذهبي", "العبور من جزء إلى الذي يليه", "الفواصل"],
  ],
  tr: [
    ["ship", "Gemi", "Merkezin kendisi: karşıya tek başına geçemeyecek insanları taşıyan bir tekne", "Başlık; her çarkın göbeği"],
    ["porthole", "Lomboz çarkı", "Bir program, geminin içinden görüldüğü hâliyle", "Program galerisi; kurs ekranları"],
    ["compass", "Pusula gülü", "Yön ve havaya göre değişmeyen değerler", "Ana güverte; gezinti yolu; yükleme"],
    ["pennant", "Flama", "Amiral programlar", "Yönetim ve Liderlik"],
    ["helm", "Dümen", "Komuta: yolculuktan sorumlu kişi", "Liderlik programı"],
    ["anchor", "Çapa", "İslami temel: fırtına geldiğinde tutan şey", "Her modülün açılışı"],
    ["sounding", "İskandil", "Şu anki durumu dürüstçe ölçmek", "On test"],
    ["knot", "Halat düğümü", "Yaparak öğrenilen uygulamalı beceri", "Uygulamalı alıştırma"],
    ["lighthouse", "Deniz feneri", "Yön bulmak için sabit bir ışık", "Öğrenme çıktıları"],
    ["log", "Seyir defteri", "Geçtiğiniz yerlerin kaydı", "Yolculuğum; bölümü tamamlamak"],
    ["flags", "İşaret bayrakları", "Gemilerin birbiriyle konuştuğu ortak kelimeler", "Sözlük"],
    ["chart", "Deniz haritası", "Yelken açmadan önce planlanan bütün yolculuk", "Kurs planı"],
    ["pass", "Biniş kartı", "Gemide bir yer istemek", "Başvuru formu"],
    ["bell", "Gemi çanı", "Cevap verebilecek birini çağırmak", "Sorular ve cevaplar"],
    ["harbour", "Liman", "Varış ve amaç", "Kurs tamamlandı; alt bilgi"],
    ["diamond", "Altın elmas", "Bir bölümden diğerine geçiş", "Ayırıcılar"],
  ],
};

/** The three decks of the larger vessel. */
export const DECKS = {
  en: [
    ["Train", "The seven programmes, taught in person at the centre in Aqrabat and continued on this site."],
    ["Research", "The handbooks, study guides and reading programme behind the courses."],
    ["Serve", "The centre's humanitarian work: water and energy, education and youth, Da'wah and Qur'an, masajid, sponsorship, rebuilding and emergency relief, with partners One Nation and Sadaka Gölgesi."],
  ],
  ar: [
    ["التدريب", "البرامج السبعة، تُدرَّس حضوريًا في المركز في عقربات وتُستكمل على هذا الموقع."],
    ["البحث", "الأدلة وكتيّبات الدراسة وبرنامج القراءة التي تقوم عليها الدورات."],
    ["الخدمة", "العمل الإنساني للمركز: المياه والطاقة، والتعليم والشباب، والدعوة والقرآن، والمساجد، والكفالة، وإعادة الإعمار والإغاثة الطارئة، مع الشريكين «ون نيشن» و«صدقة غولغيسي»."],
  ],
  tr: [
    ["Eğitim", "Akrabat’taki merkezde yüz yüze verilen ve bu sitede sürdürülen yedi program."],
    ["Araştırma", "Kursların arkasındaki el kitapları, çalışma kılavuzları ve okuma programı."],
    ["Hizmet", "Merkezin insani çalışmaları: su ve enerji, eğitim ve gençlik, davet ve Kur’an, mescitler, sponsorluk, yeniden inşa ve acil yardım; One Nation ve Sadaka Gölgesi ortaklığıyla."],
  ],
};

/** The three decks, shortened for the band on the main deck. */
export const DECKS_SHORT = {
  en: [
    "Seven programmes taught at the centre and continued here.",
    "The handbooks, study guides and reading programme behind the courses.",
    "Water, education, Qur’an, masajid, sponsorship, rebuilding and relief.",
  ],
  ar: [
    "سبعة برامج تُدرَّس في المركز وتُستكمل هنا.",
    "الأدلة وكتيّبات الدراسة وبرنامج القراءة التي تقوم عليها الدورات.",
    "المياه، والتعليم، والقرآن، والمساجد، والكفالة، وإعادة الإعمار، والإغاثة.",
  ],
  tr: [
    "Merkezde verilen ve burada sürdürülen yedi program.",
    "Kursların arkasındaki el kitapları, çalışma kılavuzları ve okuma programı.",
    "Su, eğitim, Kur’an, mescitler, sponsorluk, yeniden inşa ve yardım.",
  ],
};

/**
 * Questions and answers on the main deck. Only facts the centre has already stated are answered;
 * where the centre has not yet decided (fees, certificates, taught language) the answer says so.
 * Replace these answers with the centre's own wording when it is supplied.
 */
export const QA = {
  en: [
    ["Is the course free, or is there a fee?", "Every lesson on this site is free and open to all. Fees and intake dates for the taught course at the centre have not been announced yet; they will be published here once the centre confirms them."],
    ["Do I receive a certificate?", "The centre has not yet published its certificate arrangements. Ring the bell below and we will tell you what applies to your course."],
    ["Can I study online only?", "Yes. You can work through every section here online, at your own pace. The full course is taught in person at the centre in Aqrabat, and this site is its companion."],
    ["Which language is the course taught in?", "The lessons on this site are available in English, Arabic and Turkish; parts still being translated are shown in English until then. The language of the taught sessions will be confirmed by the centre."],
    ["Do I need to apply to use the online lessons?", "No. The online lessons are open to everyone without registration. An application is only needed for a place on the taught course."],
    ["Is my progress saved?", "Yes, on the device you are using. The sections you enter in the ship’s log are kept in this browser; they do not move to another phone or computer."],
  ],
  ar: [
    ["هل الدورة مجانية، أم هناك رسوم؟", "كل الدروس على هذا الموقع مجانية ومتاحة للجميع. أما رسوم الدورة الحضورية في المركز ومواعيد التسجيل فلم تُعلن بعد، وستُنشر هنا حين يؤكّدها المركز."],
    ["هل أحصل على شهادة؟", "لم ينشر المركز بعد ترتيبات الشهادات. اقرع الجرس أدناه وسنخبرك بما ينطبق على دورتك."],
    ["هل يمكنني الدراسة عبر الإنترنت فقط؟", "نعم. يمكنك أن تدرس كل قسم هنا عبر الإنترنت بالسرعة التي تناسبك. وتُدرَّس الدورة كاملة حضوريًا في المركز في عقربات، وهذا الموقع رفيقها."],
    ["بأي لغة تُدرَّس الدورة؟", "الدروس على هذا الموقع متاحة بالإنجليزية والعربية والتركية، وما زال بعضها قيد الترجمة فيُعرض بالإنجليزية حتى ذلك الحين. وسيؤكّد المركز لغة الجلسات الحضورية."],
    ["هل أحتاج إلى التقديم لأستخدم الدروس عبر الإنترنت؟", "لا. الدروس عبر الإنترنت متاحة للجميع دون تسجيل. ولا يلزم التقديم إلا لحجز مكان في الدورة الحضورية."],
    ["هل يُحفظ تقدّمي؟", "نعم، على الجهاز الذي تستخدمه. فالأقسام التي تسجّلها في سجل السفينة تُحفظ في هذا المتصفح، ولا تنتقل إلى هاتف أو حاسوب آخر."],
  ],
  tr: [
    ["Kurs ücretsiz mi, yoksa bir ücreti var mı?", "Bu sitedeki bütün dersler ücretsizdir ve herkese açıktır. Merkezdeki yüz yüze kursun ücretleri ve kayıt tarihleri henüz açıklanmadı; merkez teyit ettiğinde burada yayımlanacak."],
    ["Sertifika alacak mıyım?", "Merkez sertifika düzenlemelerini henüz yayımlamadı. Aşağıdaki çanı çalın, kursunuz için neyin geçerli olduğunu size bildirelim."],
    ["Yalnızca çevrimiçi okuyabilir miyim?", "Evet. Buradaki her bölümü kendi hızınızda çevrimiçi çalışabilirsiniz. Kursun tamamı Akrabat’taki merkezde yüz yüze verilir; bu site onun yol arkadaşıdır."],
    ["Kurs hangi dilde veriliyor?", "Bu sitedeki dersler İngilizce, Arapça ve Türkçe olarak sunuluyor; hâlâ çevrilen bölümler o zamana kadar İngilizce gösteriliyor. Yüz yüze derslerin dili merkez tarafından teyit edilecek."],
    ["Çevrimiçi dersleri kullanmak için başvurmam gerekiyor mu?", "Hayır. Çevrimiçi dersler kayıt olmadan herkese açıktır. Başvuru yalnızca yüz yüze kursta yer almak için gereklidir."],
    ["İlerlemem kaydediliyor mu?", "Evet, kullandığınız cihazda. Seyir defterine işlediğiniz bölümler bu tarayıcıda saklanır; başka bir telefona ya da bilgisayara geçmez."],
  ],
};
