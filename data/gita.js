'use strict';

/**
 * Bhagavad Gita verses dataset.
 * Each verse includes the chapter, verse number, Sanskrit shloka,
 * transliteration, English meaning, Hindi meaning, and theme tags.
 */
const GITA_VERSES = [
  {
    chapter: 2,
    verse: 14,
    shloka: 'मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः।\nआगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत॥',
    transliteration:
      'mātrā-sparśās tu kaunteya śītoṣṇa-sukha-duḥkha-dāḥ\nāgamāpāyino \'nityās tāṁs titikṣasva bhārata',
    meaning_en:
      'O son of Kunti, the contact between the senses and the sense objects gives rise to feelings of heat and cold, pleasure and pain. They come and go and are impermanent, so endure them bravely.',
    meaning_hi:
      'हे कुन्तीपुत्र! सर्दी-गर्मी, सुख-दुख तो इन्द्रियों और विषयों के संयोग से होते हैं; वे तो आने-जाने वाले और अनित्य हैं, इसलिए हे भारत! उन्हें सहन करो।',
    theme: ['resilience', 'impermanence', 'equanimity'],
    chapter_name: 'Sankhya Yoga',
  },
  {
    chapter: 2,
    verse: 22,
    shloka: 'वासांसि जीर्णानि यथा विहाय नवानि गृह्णाति नरोऽपराणि।\nतथा शरीराणि विहाय जीर्णान्यन्यानि संयाति नवानि देही॥',
    transliteration:
      'vāsāṁsi jīrṇāni yathā vihāya navāni gṛhṇāti naro \'parāṇi\ntathā śarīrāṇi vihāya jīrṇāny anyāni saṁyāti navāni dehī',
    meaning_en:
      'Just as a person puts on new garments, giving up old ones, the soul accepts new material bodies, giving up the old and useless ones.',
    meaning_hi:
      'जैसे मनुष्य पुराने वस्त्रों को त्यागकर दूसरे नए वस्त्र ग्रहण करता है, वैसे ही जीवात्मा पुराने शरीरों को त्यागकर दूसरे नए शरीर को प्राप्त होता है।',
    theme: ['soul', 'rebirth', 'change'],
    chapter_name: 'Sankhya Yoga',
  },
  {
    chapter: 2,
    verse: 47,
    shloka: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    transliteration:
      'karmaṇy evādhikāras te mā phaleṣu kadācana\nmā karma-phala-hetur bhūr mā te saṅgo \'stv akarmaṇi',
    meaning_en:
      'You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.',
    meaning_hi:
      'तेरा कर्म करने में ही अधिकार है, उसके फलों में कभी नहीं। इसलिए तू कर्मफल का हेतु मत बन और तेरी अकर्मण्यता में भी आसक्ति न हो।',
    theme: ['duty', 'karma', 'detachment', 'action'],
    chapter_name: 'Sankhya Yoga',
  },
  {
    chapter: 2,
    verse: 62,
    shloka: 'ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते।\nसङ्गात्सञ्जायते कामः कामात्क्रोधोऽभिजायते॥',
    transliteration:
      'dhyāyato viṣayān puṁsaḥ saṅgas teṣūpajāyate\nsaṅgāt sañjāyate kāmaḥ kāmāt krodho \'bhijāyate',
    meaning_en:
      'While contemplating the objects of the senses, a person develops attachment to them, and from such attachment lust develops, and from lust anger arises.',
    meaning_hi:
      'विषयों का चिन्तन करने वाले मनुष्य की उन विषयों में आसक्ति हो जाती है; आसक्ति से कामना उत्पन्न होती है; कामना में विघ्न होने से क्रोध उत्पन्न होता है।',
    theme: ['mind', 'desire', 'anger', 'discipline'],
    chapter_name: 'Sankhya Yoga',
  },
  {
    chapter: 3,
    verse: 21,
    shloka: 'यद्यदाचरति श्रेष्ठस्तत्तदेवेतरो जनः।\nस यत्प्रमाणं कुरुते लोकस्तदनुवर्तते॥',
    transliteration:
      'yad yad ācarati śreṣṭhas tat tad evetaro janaḥ\nsa yat pramāṇaṁ kurute lokas tad anuvartate',
    meaning_en:
      'Whatever action a great man performs, common men follow. And whatever standards he sets by exemplary acts, all the world pursues.',
    meaning_hi:
      'श्रेष्ठ पुरुष जो-जो आचरण करता है, अन्य पुरुष भी वैसा-वैसा ही आचरण करते हैं। वह जो प्रमाण देता है, समस्त मनुष्य उसी के अनुसार चलने लगते हैं।',
    theme: ['leadership', 'responsibility', 'example'],
    chapter_name: 'Karma Yoga',
  },
  {
    chapter: 3,
    verse: 27,
    shloka: 'प्रकृतेः क्रियमाणानि गुणैः कर्माणि सर्वशः।\nअहङ्कारविमूढात्मा कर्ताहमिति मन्यते॥',
    transliteration:
      'prakṛteḥ kriyamāṇāni guṇaiḥ karmāṇi sarvaśaḥ\nahaṅkāra-vimūḍhātmā kartāham iti manyate',
    meaning_en:
      'All actions are performed by the qualities of nature. Only the one deluded by ego thinks, "I am the doer."',
    meaning_hi:
      'वास्तव में सम्पूर्ण कर्म सब प्रकार से प्रकृति के गुणों द्वारा किए जाते हैं, तो भी जिसका अन्तःकरण अहंकार से मोहित हो रहा है, ऐसा अज्ञानी "मैं कर्ता हूँ" ऐसा मानता है।',
    theme: ['ego', 'nature', 'humility'],
    chapter_name: 'Karma Yoga',
  },
  {
    chapter: 4,
    verse: 7,
    shloka: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥',
    transliteration:
      'yadā yadā hi dharmasya glānir bhavati bhārata\nabhyutthānam adharmasya tadātmānaṁ sṛjāmy aham',
    meaning_en:
      'Whenever there is a decline in righteousness and an increase in unrighteousness, O Arjuna, at that time I manifest Myself on earth.',
    meaning_hi:
      'हे भारत! जब-जब धर्म की हानि और अधर्म की वृद्धि होती है, तब-तब मैं स्वयं की सृष्टि करता हूँ।',
    theme: ['dharma', 'justice', 'divine', 'purpose'],
    chapter_name: 'Jnana Karma Sannyasa Yoga',
  },
  {
    chapter: 4,
    verse: 8,
    shloka: 'परित्राणाय साधूनां विनाशाय च दुष्कृताम्।\nधर्मसंस्थापनार्थाय सम्भवामि युगे युगे॥',
    transliteration:
      'paritrāṇāya sādhūnāṁ vināśāya ca duṣkṛtām\ndharma-saṁsthāpanārthāya sambhavāmi yuge yuge',
    meaning_en:
      'To deliver the pious and to annihilate the miscreants, as well as to re-establish the principles of religion, I appear millennium after millennium.',
    meaning_hi:
      'साधु पुरुषों के उद्धार के लिए, पाप कर्म करने वालों के विनाश के लिए और धर्म की अच्छी तरह से स्थापना के लिए मैं युग-युग में प्रकट होता हूँ।',
    theme: ['dharma', 'justice', 'divine', 'protection'],
    chapter_name: 'Jnana Karma Sannyasa Yoga',
  },
  {
    chapter: 6,
    verse: 5,
    shloka: 'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥',
    transliteration:
      'uddhared ātmanātmānaṁ nātmānam avasādayet\nātmaiva hy ātmano bandhur ātmaiva ripur ātmanaḥ',
    meaning_en:
      'Let a man lift himself by his own self, let him not degrade himself; for the self alone is the friend of oneself, and the self alone is the enemy of oneself.',
    meaning_hi:
      'अपने द्वारा अपना संसार-सागर से उद्धार करे और अपने को अधोगति में न डाले; क्योंकि यह मनुष्य आप ही तो अपना मित्र है और आप ही अपना शत्रु है।',
    theme: ['self-improvement', 'willpower', 'discipline', 'resilience'],
    chapter_name: 'Dhyana Yoga',
  },
  {
    chapter: 6,
    verse: 6,
    shloka: 'बन्धुरात्मात्मनस्तस्य येनात्मैवात्मना जितः।\nअनात्मनस्तु शत्रुत्वे वर्तेतात्मैव शत्रुवत्॥',
    transliteration:
      'bandhur ātmātmanas tasya yenātmaivātmanā jitaḥ\nanātmanas tu śatrutve vartetātmaiva śatruvat',
    meaning_en:
      'For one who has conquered the mind, the mind is the best of friends; but for one who has failed to do so, the mind will remain the greatest enemy.',
    meaning_hi:
      'जिसने मन को जीत लिया है उसके लिए मन सबसे अच्छा मित्र है; लेकिन जो मन को जीत नहीं सका है उसके लिए मन ही सबसे बड़ा शत्रु है।',
    theme: ['mind', 'self-control', 'discipline', 'victory'],
    chapter_name: 'Dhyana Yoga',
  },
  {
    chapter: 9,
    verse: 22,
    shloka: 'अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते।\nतेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥',
    transliteration:
      'ananyāś cintayanto māṁ ye janāḥ paryupāsate\nteṣāṁ nityābhiyuktānāṁ yoga-kṣemaṁ vahāmy aham',
    meaning_en:
      'For those who worship Me with devotion, meditating on My transcendental form, I carry what they lack and preserve what they have.',
    meaning_hi:
      'जो अनन्य प्रेमी भक्तजन मुझे निरन्तर चिन्तन करते हुए भजते हैं, उन नित्य-निरन्तर मेरे ध्यान में लगे हुए पुरुषों का योगक्षेम मैं स्वयं वहन करता हूँ।',
    theme: ['devotion', 'faith', 'trust', 'surrender'],
    chapter_name: 'Raja Vidya Raja Guhya Yoga',
  },
  {
    chapter: 11,
    verse: 33,
    shloka: 'तस्मात्त्वमुत्तिष्ठ यशो लभस्व जित्वा शत्रून् भुङ्क्ष्व राज्यं समृद्धम्।\nमयैवैते निहताः पूर्वमेव निमित्तमात्रं भव सव्यसाचिन्॥',
    transliteration:
      'tasmāt tvam uttiṣṭha yaśo labhasva jitvā śatrūn bhuṅkṣva rājyaṁ samṛddham\nmayaivaite nihitāḥ pūrvam eva nimitta-mātraṁ bhava savyasācin',
    meaning_en:
      'Therefore, get up and attain glory! Conquer your enemies and enjoy a flourishing kingdom. They are already killed by Me, and you, O Savyasachi, can be just an instrument.',
    meaning_hi:
      'इसलिए तू उठ और यश प्राप्त कर। शत्रुओं को जीतकर धन-धान्य से सम्पन्न राज्य को भोग। ये सब पहले ही मेरे द्वारा मारे जा चुके हैं। हे सव्यसाची! तू निमित्त मात्र बन जा।',
    theme: ['courage', 'purpose', 'action', 'destiny'],
    chapter_name: 'Vishvarupa Darshana Yoga',
  },
  {
    chapter: 12,
    verse: 13,
    shloka: 'अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च।\nनिर्ममो निरहङ्कारः समदुःखसुखः क्षमी॥',
    transliteration:
      'adveṣṭā sarva-bhūtānāṁ maitraḥ karuṇa eva ca\nnirmamo nirahaṅkāraḥ sama-duḥkha-sukhaḥ kṣamī',
    meaning_en:
      'One who is not envious but is a kind friend to all living beings, who does not think himself a proprietor and is free from false ego, who is equal in happiness and distress, and who is forgiving…',
    meaning_hi:
      'जो सम्पूर्ण प्राणियों में द्वेषभाव से रहित है, स्वार्थरहित, सबका प्रेमी और हेतुरहित दयालु है तथा ममता से रहित, अहंकारशून्य, सुख-दुःख में सम और क्षमावान है…',
    theme: ['compassion', 'kindness', 'equanimity', 'forgiveness'],
    chapter_name: 'Bhakti Yoga',
  },
  {
    chapter: 18,
    verse: 66,
    shloka: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।\nअहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥',
    transliteration:
      'sarva-dharmān parityajya mām ekaṁ śaraṇaṁ vraja\nahaṁ tvāṁ sarva-pāpebhyo mokṣayiṣyāmi mā śucaḥ',
    meaning_en:
      'Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.',
    meaning_hi:
      'सम्पूर्ण धर्मों को अर्थात् सम्पूर्ण आश्रयों को त्यागकर तू केवल मेरी शरण में आ जा। मैं तुझे सम्पूर्ण पापों से मुक्त कर दूँगा, शोक मत कर।',
    theme: ['surrender', 'faith', 'liberation', 'grace'],
    chapter_name: 'Moksha Sannyasa Yoga',
  },
  {
    chapter: 18,
    verse: 78,
    shloka: 'यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः।\nतत्र श्रीर्विजयो भूतिर्ध्रुवा नीतिर्मतिर्मम॥',
    transliteration:
      'yatra yogeśvaraḥ kṛṣṇo yatra pārtho dhanur-dharaḥ\ntatra śrīr vijayo bhūtir dhruvā nītir matir mama',
    meaning_en:
      'Wherever there is Krishna, the master of all mystics, and wherever there is Arjuna, the supreme archer, there will also certainly be opulence, victory, extraordinary power, and morality.',
    meaning_hi:
      'जहाँ योगेश्वर श्रीकृष्ण हैं और जहाँ गाण्डीवधारी अर्जुन हैं — वहीं श्री, विजय, विभूति और अचल नीति है — ऐसा मेरा मत है।',
    theme: ['victory', 'righteousness', 'prosperity', 'wisdom'],
    chapter_name: 'Moksha Sannyasa Yoga',
  },
];

/**
 * Returns today's verse based on the day of the year.
 */
function getDailyVerse() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 1)) / 86400000
  );
  return GITA_VERSES[dayOfYear % GITA_VERSES.length];
}

/**
 * Returns a verse by chapter and verse number, or null if not found.
 */
function getVerse(chapter, verse) {
  return (
    GITA_VERSES.find(v => v.chapter === Number(chapter) && v.verse === Number(verse)) || null
  );
}

/**
 * Returns all unique chapters present in the dataset.
 */
function getChapters() {
  const seen = new Set();
  const chapters = [];
  for (const v of GITA_VERSES) {
    if (!seen.has(v.chapter)) {
      seen.add(v.chapter);
      chapters.push({ chapter: v.chapter, name: v.chapter_name });
    }
  }
  return chapters;
}

/**
 * Returns all verses in a given chapter.
 */
function getVersesByChapter(chapter) {
  return GITA_VERSES.filter(v => v.chapter === Number(chapter));
}

/**
 * Returns verses matching any of the given theme tags.
 */
function getVersesByTheme(theme) {
  const lower = theme.toLowerCase();
  return GITA_VERSES.filter(v => v.theme.includes(lower));
}

module.exports = {
  GITA_VERSES,
  getDailyVerse,
  getVerse,
  getChapters,
  getVersesByChapter,
  getVersesByTheme,
};
