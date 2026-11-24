// Writes the translated opening pages (front matter), figure captions and the Task Sheet table
// into data/management/<lang>.json. Draft translations — to be read by a fluent speaker.
//   node tools/front-translations.mjs
import fs from "node:fs";

const en = JSON.parse(fs.readFileSync("data/management/en.json", "utf8"));
const clone = (x) => JSON.parse(JSON.stringify(x));

const T = {
  ar: {
    word: { section: "القسم", sections: "الأقسام", module: "الوحدة", comma: "، " },
    modules: ["الأسس", "ممارسة المدير الذاتية", "الحل والتحسين", "الأنظمة التي تُمسك بالعمل", "أنماط التجدّد", "الالتزام والغاية"],
    pathways: ["الأسس", "قيادة الناس", "تطوير الفريق", "التفويض", "التواصل", "الأداء", "اتخاذ القرار", "إدارة التغيير", "حلّ النزاعات", "التخطيط والأولويات", "الميزانيات والموارد", "التدريب والإشراف"],
    cover: { title: "دليل الإدارة", subtitle: "النص المرجعي للمشاركين في برنامج التطوير الإداري", version: "الإصدار ٢ · تشرين الثاني/نوفمبر ٢٠٢٦", includes: "يتضمّن الوحدتين المشتركتين ٥ و٦ — أنماط التجدّد، والالتزام والغاية" },
    contents: { title: "المحتويات" },
    how: {
      title: "كيف تستخدم هذا الدليل",
      intro: ["كُتب هذا الدليل ليُعمَل به لا ليُقرأ فقط. وهو منظَّم في اثني عشر قسمًا، يتناول كلٌّ منها مجالًا من ممارسة الإدارة، وينتهي كلٌّ منها بمراجعة القسم المؤلَّفة من ثلاثة أجزاء.", "قسمٌ يُقرأ ولا يُراجَع لن يغيّر إلا القليل."],
      cards: [
        { title: "السفينة", text: "لوحة قصيرة تفتتح كل قسم، فتضع موضوعه بمصطلحات السفينة، مع سؤال واحد تعود به إلى عملك." },
        { title: "عشرة اختبارات", text: "اختبارات ذاتية في نهاية كل قسم. إجابة «لا» أنفع من إجابة «نعم»." },
        { title: "أسئلة للنقاش", text: "للجلسة الجماعية، أو لزميل." },
        { title: "تمرين عملي", text: "مهمة واحدة تحملها إلى العمل الحقيقي قبل الجلسة التالية." },
      ],
    },
    who: {
      title: "لمن هذا الدليل",
      intro: "كُتب لكل من هو مسؤول عن عمل يؤدّيه آخرون، أو على وشك أن يكون كذلك. لا يُفترض أي دراسة سابقة للإدارة، ولا يلزم أي مؤهّل لاستخدامه. الأمثلة مأخوذة من العمل الخيري والتعليمي والإداري، لكن المبادئ ليست خاصة بقطاع بعينه.",
      head: ["القارئ", "ما يقدّمه له هذا الدليل"],
      rows: [
        ["المديرون الجدد ومن يتولّون الإدارة لأول مرة", "تأسيس كامل أول — ما الذي تتألف منه الوظيفة فعلًا، وماذا يُفعل في الأشهر الأولى"],
        ["المديرون ذوو الخبرة بلا تدريب رسمي", "بنية ومفردات لما يفعلونه بالفطرة، مع إظهار الثغرات"],
        ["الإداريون وموظفو الدعم", "نصف الأنظمة من العمل: التوثيق والرقابة والانضباط والسياسات"],
        ["قادة الفرق والمشرفون", "التفويض والقرارات والاجتماعات والإرشاد ومعالجة الأداء الضعيف"],
        ["كبار المديرين والمديرون العامّون", "السياسات ومستويات الصلاحية والهيكل التنظيمي"],
        ["أعضاء مجلس الأمناء والإدارة", "ما يُنتظر من المديرين الذين يعيّنونهم، وأين يقع خطّ المجلس نفسه"],
        ["المعلّمون والمدرّبون والميسّرون", "نص جاهز للمشاركين في دورة من ستّ عشرة جلسة، مع اختبارات ذاتية وتمارين"],
        ["طلاب الجامعات والخرّيجون الجدد", "واقع الإدارة العملي لا نظريتها، قبل تولّي أول منصب"],
        ["المتطوعون ومنسّقو التطوع", "كيف تعمل المسؤولية والصلاحية والمساءلة في بيئة غير مأجورة"],
      ],
      outro: "وسيكون أقلّ نفعًا لمن يبحث عن مرجع سريع يطّلع عليه عند الحاجة. فالأقسام تراكمية: كلٌّ منها يفترض ما قبله.",
    },
    taught: {
      title: "بوصفه دورة تدريبية",
      intro: "الدليل هو أيضًا النص المرجعي للمشاركين في برنامج تطوير إداري من ست عشرة جلسة، مقسّمة إلى ست وحدات:",
      head: ["الوحدة", "الأقسام", "الجلسات", "ما تتناوله"],
      cover: [
        "ما الإدارة، وكيف تُرتَّب المؤسسة، والمبادئ الستة",
        "التفويض، والقرارات، والوقت، والاجتماعات، والمحاسبة الصادقة للنفس، والإرشاد والتدريب",
        "المشكلات والفشل والتغيير، وتشخيص ضعف النتائج، وسياق المؤسسة",
        "الانضباط الإداري، والسياسات، والتوثيق والرقابة",
        "الجاهزية، والمراحل التي يمر بها الفريق، والتنازع، والاستعداد لتبدّل الأحوال",
        "الغاية من العمل، وبناء مؤسسات تدوم",
      ],
      figure: {
        title: "الرحلة — ست عشرة جلسة، ست وحدات", module: "الوحدة",
        note: "الوحدات ١–٤ هي المسارات الاثنا عشر الخاصة بهذه القاعة. أما الوحدتان ٥ و٦ — أنماط التجدّد، والالتزام والغاية — فتشترك فيهما كل برامج السفينة.",
        own: "جلسة خاصة بالقاعة", shared: "جلسة مشتركة",
        caption: "الشكل ١. الدورة في لمحة: أربع وحدات لهذه القاعة، ثم الوحدتان المشتركتان.",
      },
    },
    ship: {
      title: "السفينة",
      card: { ar: "السفينة", title: "السفينة", caption: "مركبٌ يحمل أناسًا لم يكن في وسعهم عبور البحر وحدهم." },
      paras: [
        "بُني البرنامج حول صورة واحدة، وهي الصورة التي سُمّي المركز باسمها. السفينة — As Safinah — هي السفينة.",
        "السفينة أقدم مثال عملي على موضوع هذا الدليل: جماعة من الناس، ومخزون محدود من الموارد، وبيئة قاسية، ووجهة، وشخص واحد مسؤول عن وصولهم. وكل ما تفعله الإدارة له نظير على متن السفينة. التخطيط هو رسم المسار. الهيكل هو طاقم السفينة. الانضباط هو المناوبة والجرس. السياسة هي الأوامر الدائمة. والرقابة هي حبل السبر.",
        "يفتتح كل قسم بلوحة قصيرة عنوانها «السفينة»، تضع موضوع القسم بهذه المصطلحات وتنتهي بسؤال واحد تعود به إلى سفينتك. اللوحات ليست زينة. فإن استطعت أن تشرح قسمًا لغيرك بلغة السفينة فقد فهمته؛ وإن لم تستطع فارجع إليه.",
        "وتحمل الصورة معنى آخر. السفينة مركبٌ يحمل أناسًا لم يكن في وسعهم عبور البحر وحدهم. وهذا هو العمل.",
      ],
    },
    room: {
      title: "قاعة الإدارة: اثنا عشر مسارًا",
      paras: [
        "هذه العجلة معلّقة في قاعة الإدارة في السفينة. وهي تُظهر المسارات الاثني عشر — الدورات والممارسة والدعم — المتاحة في القاعة، من «الأسس» في الأعلى، وتُقرأ في اتجاه عقارب الساعة.",
        "وتستمد المسارات من أقسام هذا الدليل في مجملها: الأسس من القسم ١، والتخطيط والأولويات من القسم ٣، والتفويض من القسم ٤، والتدريب والإشراف من القسم ٥، وهكذا. استعمل العجلة لتجد طريقك من القاعة إلى الدليل، واستعمل الدليل لتتعمّق أكثر مما تتيحه أي جلسة.",
      ],
      alt: "عجلة الإدارة: اثنا عشر مسارًا تُقرأ باتجاه عقارب الساعة بدءًا من «الأسس» في الأعلى",
      caption: "عجلة الإدارة كما هي معلّقة في القاعة — اثنا عشر مسارًا، تُقرأ باتجاه عقارب الساعة من الأعلى.",
      finding: {
        title: "أين تجد كل مسار في هذا الدليل", head: ["على العجلة", "المسار", "أين يُدرَّس", "الوحدة"],
        note: "تسمّي عجلة الإدارة المسارات الاثني عشر المتاحة في القاعة. أما أقسام الدليل فمرتّبة على هيئة دورة، لذلك قد يستند المسار الواحد إلى أكثر من قسم.",
      },
    },
    figures: {
      "fig-cycle.webp": { alt: "المبادئ الستة دورةً واحدة متصلة: التخطيط، التنظيم، التوظيف، التوجيه والقيادة، التنسيق، الرقابة، حول نظام إداري متكامل", caption: "الدورة نفسها، مرسومة كإحدى اللوحات الثماني المُعدّة لجدار السفينة." },
      "fig-steps.webp": { alt: "حين تكون النتائج غير مرضية، اعمل بالترتيب: وضّح النتيجة المطلوبة، حدّد الأنشطة الأساسية، صمّم الهيكل، طوّر الإدارة، فوّض الإشراف، درّب الناس، بسّط الإجراءات" },
      "fig-patterns.webp": { alt: "أربعة أنماط للتجدّد: الجاهزية، والطبقات، والتنازع، ونقطة التحوّل، حول سؤال: ما الذي لا تُظهره الرسوم البيانية؟", caption: "أنماط هذا القسم الأربعة، لكل منها لوحة السفينة وسؤالها." },
      "fig-layers.webp": { alt: "ثلاث طبقات، ثلاثة أمزجة: طبقة البدء، وطبقة الدفع، وطبقة البناء" },
      "fig-formula.webp": { alt: "صيغة النجاح الأسمى على هيئة عجلة: أربع ثلاثيات، اثنا عشر جزءًا", caption: "صيغة النجاح الأسمى على هيئة عجلة: أربع ثلاثيات، اثنا عشر جزءًا — مرسومة لتُعلَّق بجانب نافذة القاعة الدائرية." },
    },
    task: { caption: "نموذج ورقة المهام", head: ["الرقم", "المهمة", "التاريخ المطلوب", "المشروع", "طالب المهمة", "الموعد النهائي", "الإنجاز", "الرابط", "الشخص"] },
  },

  tr: {
    word: { section: "Bölüm", sections: "Bölümler", module: "Modül", comma: ", " },
    modules: ["Temeller", "Yöneticinin Kendi Uygulaması", "Çözmek ve İyileştirmek", "Her Şeyi Bir Arada Tutan Sistemler", "Yenilenmenin Örüntüleri", "Yükümlülük ve Amaç"],
    pathways: ["Temeller", "İnsanları Yönetmek", "Ekip Geliştirme", "Yetki Devri", "İletişim", "Performans", "Karar Verme", "Değişimi Yönetmek", "Çatışma Çözümü", "Planlama ve Öncelikler", "Bütçeler ve Kaynaklar", "Koçluk ve Gözetim"],
    cover: { title: "Yönetim El Kitabı", subtitle: "Yönetim Geliştirme Programı katılımcı metni", version: "Sürüm 2 · Kasım 2026", includes: "Ortak 5. ve 6. modülleri içerir — Yenilenmenin Örüntüleri ile Yükümlülük ve Amaç" },
    contents: { title: "İçindekiler" },
    how: {
      title: "Bu El Kitabı Nasıl Kullanılır",
      intro: ["Bu el kitabı yalnızca okunmak için değil, üzerinde çalışılmak için yazıldı. Her biri yönetim pratiğinin bir alanını ele alan on iki bölümden oluşur ve her bölüm üç parçalı bir Bölüm Değerlendirmesiyle biter.", "Okunup değerlendirilmeyen bir bölüm çok az şey değiştirir."],
      cards: [
        { title: "Gemi", text: "Her bölümü açan kısa bir pano: konuyu geminin diliyle anlatır ve kendi işinize götüreceğiniz tek bir soruyla biter." },
        { title: "On sınama", text: "Her bölümün sonunda öz sınamalar. Bir “hayır”, bir “evet”ten daha yararlıdır." },
        { title: "Tartışma soruları", text: "Grup oturumu ya da bir iş arkadaşı için." },
        { title: "Uygulamalı alıştırma", text: "Bir sonraki oturumdan önce gerçek işe taşıyacağınız tek bir görev." },
      ],
    },
    who: {
      title: "Bu El Kitabı Kimler İçin",
      intro: "Başkalarının yaptığı işten sorumlu olan ya da yakında olacak herkes için yazıldı. Önceden yönetim eğitimi almış olmak gerekmez, kullanmak için herhangi bir yeterlilik aranmaz. Örnekler hayır kurumu, eğitim ve idari ortamlardan alınmıştır, ancak ilkeler belirli bir sektöre özgü değildir.",
      head: ["Okur", "Bu el kitabı onlara ne sağlar"],
      rows: [
        ["Yeni ve ilk kez yönetici olanlar", "Eksiksiz bir ilk temel — işin gerçekte nelerden oluştuğu ve ilk aylarda neler yapılacağı"],
        ["Resmî eğitimi olmayan deneyimli yöneticiler", "Zaten içgüdüyle yaptıkları şey için bir yapı ve bir söz dağarcığı; eksikler de görünür olur"],
        ["Ofis yöneticileri ve destek personeli", "İşin sistemler yarısı: belgeleme, denetim, disiplin ve politika"],
        ["Ekip liderleri ve süpervizörler", "Yetki devri, kararlar, toplantılar, mentorluk ve zayıf performansla başa çıkma"],
        ["Üst düzey yöneticiler ve direktörler", "Politika, yetki düzeyleri ve kurumsal yapı"],
        ["Mütevelli ve yönetim kurulu üyeleri", "Atadıkları yöneticilerden ne bekleyecekleri ve kurulun kendi çizgisinin nerede olduğu"],
        ["Öğretmenler, eğitmenler ve kolaylaştırıcılar", "On altı oturumluk bir kurs için hazır katılımcı metni; öz sınamalar ve alıştırmalarla"],
        ["Üniversite öğrencileri ve yeni mezunlar", "İlk göreve başlamadan önce yönetimin kuramı değil, çalışma gerçekliği"],
        ["Gönüllüler ve gönüllü koordinatörleri", "Sorumluluk, yetki ve hesap verebilirliğin ücretsiz bir ortamda nasıl işlediği"],
      ],
      outro: "Bakıp geçmek için hızlı bir başvuru kaynağı arayanlara en az yarar sağlar. Bölümler birikimlidir: her biri bir öncekini varsayar.",
    },
    taught: {
      title: "Bir Kurs Olarak",
      intro: "El kitabı aynı zamanda on altı oturumluk bir yönetim geliştirme programının katılımcı metnidir ve altı modül olarak gruplanmıştır:",
      head: ["Modül", "Bölümler", "Oturumlar", "Kapsam"],
      cover: [
        "Yönetim nedir, kurum nasıl düzenlenir, altı ilke",
        "Yetki devri, kararlar, zaman, toplantılar, dürüst bir durum değerlendirmesi, mentorluk ve koçluk",
        "Sorunlar, başarısızlık, değişim, kötü sonuçların teşhisi, kurumsal bağlam",
        "İdari disiplin, politika, belgeleme ve denetim",
        "Hazırlık, bir ekibin geçtiği aşamalar, çekişme ve talih değişimine hazırlanma",
        "İşin ne için olduğu ve kalıcı kurumlar inşa etmek",
      ],
      figure: {
        title: "Yolculuk — on altı oturum, altı modül", module: "Modül",
        note: "1–4. modüller bu odanın kendi on iki yoludur. 5 ve 6. modüller — Yenilenmenin Örüntüleri ile Yükümlülük ve Amaç — As Safinah’ın tüm programlarında ortaktır.",
        own: "Odaya özgü oturum", shared: "Ortak oturum",
        caption: "Şekil 1. Kursa bir bakış: bu oda için dört modül, ardından iki ortak modül.",
      },
    },
    ship: {
      title: "Gemi",
      card: { ar: "السفينة", title: "Gemi", caption: "Tek başına karşıya geçemeyecek insanları taşıyan bir tekne." },
      paras: [
        "Program tek bir imge etrafında kurulmuştur ve merkez de adını ondan alır. As Safinah — السفينة — gemidir.",
        "Gemi, bu el kitabının konusunun en eski çalışan örneğidir: bir grup insan, sınırlı bir kaynak stoku, düşmanca bir ortam, bir varış noktası ve varıp varamayacaklarından sorumlu tek bir kişi. Yönetimin yaptığı her şeyin gemide bir karşılığı vardır. Planlama, rota çizmektir. Yapı, geminin tayfasıdır. Disiplin, nöbet ve çandır. Politika, sürekli emirlerdir. Denetim, iskandil halatıdır.",
        "Her bölüm Gemi adlı kısa bir panoyla açılır; pano bölümün konusunu bu terimlerle ifade eder ve kendi geminize götüreceğiniz tek bir soruyla biter. Panolar süs değildir. Bir bölümü birine geminin diliyle anlatabiliyorsanız anlamışsınız demektir; anlatamıyorsanız geri dönün.",
        "İmge bir şey daha taşır. Gemi, tek başına karşıya geçemeyecek insanları taşıyan bir teknedir. İş budur.",
      ],
    },
    room: {
      title: "Yönetim Odası: On İki Yol",
      paras: [
        "Bu çark, As Safinah’taki Yönetim odasında asılıdır. Odada sunulan on iki yolu — kursları, uygulamayı ve desteği — saat yönünde okunmak üzere, en üstteki Temeller’den başlayarak gösterir.",
        "Yollar baştan sona bu el kitabının bölümlerinden beslenir: Temeller 1. Bölümden, Planlama ve Öncelikler 3. Bölümden, Yetki Devri 4. Bölümden, Koçluk ve Gözetim 5. Bölümden ve böyle devam eder. Odadan el kitabına yol bulmak için çarkı, tek bir oturumun gidebileceğinden daha derine inmek için el kitabını kullanın.",
      ],
      alt: "Yönetim çarkı: en üstte Temeller’den başlayarak saat yönünde okunan on iki yol",
      caption: "Yönetim çarkı, odada asıldığı hâliyle — saat yönünde, üstten başlayarak okunan on iki yol.",
      finding: {
        title: "Her yolu bu el kitabında bulmak", head: ["Çarktaki sıra", "Yol", "Nerede işlenir", "Modül"],
        note: "Yönetim çarkı, odada sunulan on iki yolu adlandırır. El kitabının bölümleri bir kurs olarak düzenlenmiştir; bu yüzden bir yol birden fazla bölümden yararlanabilir.",
      },
    },
    figures: {
      "fig-cycle.webp": { alt: "Tek bir sürekli döngü olarak altı ilke: planlama, örgütleme, kadrolama, yönlendirme ve liderlik, eşgüdüm, denetim; bütünleşik bir yönetim sisteminin çevresinde", caption: "Aynı döngü, As Safinah’ın duvarı için hazırlanan sekiz madalyondan biri olarak çizilmiş." },
      "fig-steps.webp": { alt: "Sonuçlar tatmin edici olmadığında sırayla ilerleyin: istenen sonucu açıklığa kavuşturun, temel faaliyetleri belirleyin, yapıyı tasarlayın, yönetimi geliştirin, gözetimi devredin, insanları eğitin, işlemleri sadeleştirin" },
      "fig-patterns.webp": { alt: "Yenilenmenin dört örüntüsü: hazırlık, katmanlar, çekişme ve dönüm noktası; çizelgelerin göstermediği şey sorusunun çevresinde", caption: "Bu bölümün dört örüntüsü; her birinin Gemi panosu ve sorduğu soruyla." },
      "fig-layers.webp": { alt: "Üç katman, üç mizaç: başlatan katman, sürükleyen katman ve inşa eden katman" },
      "fig-formula.webp": { alt: "Nihai Başarı Formülü bir çark olarak: dört üçlü, on iki parça", caption: "Nihai Başarı Formülü bir çark olarak: dört üçlü, on iki parça — odanın kendi lombasının yanına asılmak üzere çizilmiştir." },
    },
    task: { caption: "Görev Çizelgesi şablonu", head: ["No.", "Görev", "İstenen tarih", "Proje", "Görevi veren", "Son tarih", "Tamamlanma", "Bağlantı", "Kişi"] },
  },

  ru: {
    word: { section: "Раздел", sections: "Разделы", module: "Модуль", comma: ", " },
    modules: ["Основы", "Собственная практика руководителя", "Решать и улучшать", "Системы, которые всё удерживают", "Образцы обновления", "Долг и назначение"],
    pathways: ["Основы", "Руководство людьми", "Развитие команды", "Делегирование", "Коммуникация", "Результативность", "Принятие решений", "Управление изменениями", "Разрешение конфликтов", "Планирование и приоритеты", "Бюджеты и ресурсы", "Наставничество и контроль"],
    cover: { title: "Пособие по менеджменту", subtitle: "Текст для участников Программы развития управленческих навыков", version: "Версия 2 · ноябрь 2026", includes: "Включает общие Модули 5 и 6 — «Образцы обновления» и «Долг и назначение»" },
    contents: { title: "Содержание" },
    how: {
      title: "Как пользоваться этим пособием",
      intro: ["Это пособие написано для того, чтобы его прорабатывать, а не только читать. Оно состоит из двенадцати разделов, каждый из которых охватывает одну область управленческой практики и завершается обзором раздела из трёх частей.", "Раздел, который прочитан, но не пройден в обзоре, изменит очень немногое."],
      cards: [
        { title: "Корабль", text: "Короткая панель в начале каждого раздела: она излагает тему языком корабля и заканчивается одним вопросом, который стоит взять с собой в свою работу." },
        { title: "Десять проверок", text: "Самопроверки в конце каждого раздела. Ответ «нет» полезнее ответа «да»." },
        { title: "Вопросы для обсуждения", text: "Для групповой встречи или для коллеги." },
        { title: "Практическое задание", text: "Одно задание, которое нужно перенести в реальную работу до следующей встречи." },
      ],
    },
    who: {
      title: "Для кого это пособие",
      intro: "Оно написано для всех, кто отвечает за работу, которую делают другие люди, или вот-вот станет таким человеком. Предварительное изучение менеджмента не предполагается, никакой квалификации для работы с пособием не требуется. Примеры взяты из благотворительной, образовательной и административной сфер, но принципы не привязаны к конкретному сектору.",
      head: ["Читатель", "Что пособие даёт ему"],
      rows: [
        ["Новые руководители и те, кто управляет впервые", "Полную первичную основу — из чего на самом деле состоит работа и что делать в первые месяцы"],
        ["Опытные руководители без формальной подготовки", "Структуру и словарь для того, что они уже делают по наитию, и видимые пробелы"],
        ["Офисные администраторы и вспомогательный персонал", "Системную половину работы: документацию, контроль, дисциплину и политику"],
        ["Руководители групп и супервайзеры", "Делегирование, решения, совещания, наставничество и работу со слабой результативностью"],
        ["Старшие руководители и директора", "Политику, уровни полномочий и структуру организации"],
        ["Попечители и члены совета", "Чего ждать от назначаемых ими руководителей и где проходит граница самого совета"],
        ["Преподаватели, тренеры и фасилитаторы", "Готовый текст для участников шестнадцатизанятийного курса с самопроверками и заданиями"],
        ["Студенты университетов и недавние выпускники", "Рабочую реальность управления, а не его теорию, до первой должности"],
        ["Волонтёры и координаторы волонтёров", "Как ответственность, полномочия и подотчётность работают там, где труд не оплачивается"],
      ],
      outro: "Меньше всего оно пригодится тому, кто ищет краткий справочник, чтобы заглядывать в него время от времени. Разделы кумулятивны: каждый опирается на предыдущий.",
    },
    taught: {
      title: "Как учебный курс",
      intro: "Пособие — это ещё и текст для участников программы развития управленческих навыков из шестнадцати занятий, сгруппированных в шесть модулей:",
      head: ["Модуль", "Разделы", "Занятия", "Содержание"],
      cover: [
        "Что такое управление, как устроена организация, шесть принципов",
        "Делегирование, решения, время, совещания, честная инвентаризация, наставничество и коучинг",
        "Проблемы, неудачи, перемены, диагностика плохих результатов, контекст организации",
        "Административная дисциплина, политика, документация и контроль",
        "Готовность, этапы, которые проходит команда, соперничество и подготовка к перемене судьбы",
        "Для чего нужна работа и как строить организации, которые выстоят",
      ],
      figure: {
        title: "Путь — шестнадцать занятий, шесть модулей", module: "Модуль",
        note: "Модули 1–4 — это двенадцать собственных направлений этого зала. Модули 5 и 6 — «Образцы обновления» и «Долг и назначение» — общие для всех программ «Ас-Сафина».",
        own: "Занятие этого зала", shared: "Общее занятие",
        caption: "Рисунок 1. Курс одним взглядом: четыре модуля этого зала, затем два общих модуля.",
      },
    },
    ship: {
      title: "Корабль",
      card: { ar: "السفينة", title: "Корабль", caption: "Судно, которое несёт людей, не сумевших бы переправиться в одиночку." },
      paras: [
        "Программа построена вокруг одного образа, и именно в его честь назван центр. «Ас-Сафина» — السفينة — это корабль.",
        "Корабль — древнейший действующий пример того, о чём это пособие: группа людей, ограниченный запас ресурсов, враждебная среда, пункт назначения и один человек, отвечающий за то, дойдут ли они. Всему, что делает управление, есть соответствие на борту. Планирование — это прокладка курса. Структура — это судовая команда. Дисциплина — это вахта и склянки. Политика — это постоянные приказы. Контроль — это лот.",
        "Каждый раздел открывается короткой панелью под названием «Корабль»: она излагает тему раздела этими понятиями и заканчивается одним вопросом, который стоит взять на свой корабль. Эти панели — не украшение. Если вы можете объяснить раздел другому человеку языком корабля, вы его поняли; если не можете — вернитесь назад.",
        "У образа есть ещё одно значение. Корабль — это судно, которое несёт людей, не сумевших бы переправиться в одиночку. В этом и состоит наше дело.",
      ],
    },
    room: {
      title: "Зал менеджмента: двенадцать направлений",
      paras: [
        "Это колесо висит в зале менеджмента «Ас-Сафина». На нём показаны двенадцать направлений — курсы, практика и поддержка, — которые предлагаются в зале; читать их нужно по часовой стрелке, начиная с «Основ» наверху.",
        "Направления опираются на разделы этого пособия: «Основы» — на Раздел 1, «Планирование и приоритеты» — на Раздел 3, «Делегирование» — на Раздел 4, «Наставничество и контроль» — на Раздел 5 и так далее. Используйте колесо, чтобы найти дорогу из зала в пособие, а пособие — чтобы углубиться дальше, чем способно любое отдельное занятие.",
      ],
      alt: "Колесо менеджмента: двенадцать направлений, читаемых по часовой стрелке от «Основ» наверху",
      caption: "Колесо менеджмента так, как оно висит в зале, — двенадцать направлений, читаемых по часовой стрелке сверху.",
      finding: {
        title: "Где найти каждое направление в этом пособии", head: ["На колесе", "Направление", "Где изучается", "Модуль"],
        note: "Колесо менеджмента называет двенадцать направлений, предлагаемых в зале. Разделы пособия выстроены как курс, поэтому направление может опираться более чем на один раздел.",
      },
    },
    figures: {
      "fig-cycle.webp": { alt: "Шесть принципов как один непрерывный цикл: планирование, организация, подбор персонала, руководство и лидерство, координация, контроль — вокруг единой системы управления", caption: "Тот же цикл, нарисованный как один из восьми медальонов, подготовленных для стены «Ас-Сафина»." },
      "fig-steps.webp": { alt: "Если результаты неудовлетворительны, двигайтесь по порядку: уточните желаемый результат, определите ключевые виды деятельности, спроектируйте структуру, развивайте управление, делегируйте надзор, обучите людей, упростите процедуры" },
      "fig-patterns.webp": { alt: "Четыре образца обновления: готовность, слои, соперничество и поворотный момент — вокруг вопроса, чего не показывают графики", caption: "Четыре образца этого раздела, у каждого — своя панель «Корабль» и свой вопрос." },
      "fig-layers.webp": { alt: "Три слоя, три темперамента: слой начала, слой движущей силы и слой строительства" },
      "fig-formula.webp": { alt: "Формула высшего успеха в виде колеса: четыре тройки, двенадцать частей", caption: "Формула высшего успеха в виде колеса: четыре тройки, двенадцать частей — нарисована, чтобы висеть рядом с иллюминатором зала." },
    },
    task: { caption: "Шаблон листа задач", head: ["№", "Задача", "Требуемая дата", "Проект", "Кто поручил", "Срок", "Выполнение", "Ссылка", "Исполнитель"] },
  },
};

const digitsAr = (s) => String(s).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);

for (const [lang, L] of Object.entries(T)) {
  const f = clone(en.front);
  const deep = (dst, src) => { for (const k of Object.keys(src)) { if (src[k] && typeof src[k] === "object" && !Array.isArray(src[k]) && dst[k] && typeof dst[k] === "object") deep(dst[k], src[k]); else dst[k] = src[k]; } };
  deep(f.cover, L.cover);
  f.contents = L.contents;
  deep(f.how, L.how);
  deep(f.who, L.who);
  f.taught.title = L.taught.title; f.taught.intro = L.taught.intro; f.taught.head = L.taught.head;
  f.taught.rows = en.front.taught.rows.map((r, i) => [`${i + 1}. ${L.modules[i]}`, r[1], r[2], L.taught.cover[i]]);
  deep(f.taught.figure, L.taught.figure);
  deep(f.ship, L.ship);
  const room = f.room;
  room.title = L.room.title; room.paras = L.room.paras; room.alt = L.room.alt; room.caption = L.room.caption;
  room.finding.title = L.room.finding.title; room.finding.head = L.room.finding.head; room.finding.note = L.room.finding.note;
  room.finding.rows = en.front.room.finding.rows.map((r, i) => {
    const where = r[2].replace(/^Sections?/, (w) => (w === "Sections" ? L.word.sections : L.word.section)).replace(/, /g, L.word.comma);
    const mod = `${L.word.module} ${r[3].match(/Module (\d)/)[1]} — ${L.modules[+r[3].match(/Module (\d)/)[1] - 1]}`;
    return [r[0], L.pathways[i], where, mod];
  });
  const file = `data/management/${lang}.json`;
  const j = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : { language: lang, modules: [] };
  j.front = f;
  j.figures = L.figures;
  // the Task Sheet template: a table instead of a one-line description
  const s10 = j.modules.flatMap((m) => m.sections).find((s) => s.id === "s10");
  const sub = s10?.subsections.find((x) => x.id === "10.2");
  if (sub) {
    const table = { type: "table", caption: L.task.caption, head: L.task.head, rows: en.modules.flatMap((m) => m.sections).find((s) => s.id === "s10").subsections.find((x) => x.id === "10.2").blocks.at(-1).rows };
    const last = sub.blocks.at(-1);
    if (last.type === "p") sub.blocks[sub.blocks.length - 1] = table;
  }
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n");
  console.log("wrote", file);
}
