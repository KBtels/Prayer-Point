// Prayer generator. Combines a universal opening, a category-specific middle,
// and a universal closing to produce thousands of unique 2–3 paragraph prayers
// per category. Selection is seeded by (userName + date + category) so each
// user gets different prayers and a fresh one every session.

const OPENINGS = [
  "Heavenly Father, I come before You with an open heart. You know me by name, You see every step of my journey, and You hear every word before I speak it. Today I quiet myself in Your presence, ready to listen and to be loved.",
  "Lord, here I am. The world is loud, but I have stepped away to be still with You. Thank You for meeting me here — not because I have earned it, but because You are good and Your love endures forever.",
  "God of grace, I lift my eyes to You. You are my Shepherd, my Refuge, my unshakable hope. In this moment I lay down what I am carrying so that my hands and my heart can be free to receive from You.",
  "Father, thank You for this breath, for this moment, for the chance to draw near. You are not far off; You are closer than my own heartbeat. Settle me in Your presence and let Your peace begin to fill the space within me.",
  "Lord Jesus, I come to You just as I am — with all my hopes and all my struggles. You have promised that those who seek You will find You. I seek You now, and I trust that You are already meeting me.",
  "Almighty God, You spoke and the world began. The same voice that calmed the storm calls to me today. Speak, Lord — Your servant is listening. Quiet every other voice so that I may hear only Yours.",
  "Father in heaven, I bow before You with reverence and with gratitude. You are worthy of every word of praise. Before I bring You my requests, let me first remember who You are: faithful, holy, merciful, and near.",
  "Loving God, I open my heart wide to You today. I do not pretend to have it all together. I come honestly, knowing that Your grace is enough and Your love covers me even in my weakness.",
  "Gracious Father, I pause here to remember that You are God and I am Yours. Every good thing in my life has come from Your hand. Every struggle I face is held within Your sovereign care.",
  "Lord of my life, I draw near in the name of Jesus. Thank You that the door to Your presence is always open, that Your Spirit dwells within me, and that I am never alone in any moment of any day.",
  "Father, I lift up my soul to You. You are the lifter of my head and the joy of my heart. As I begin this prayer, soften anything in me that is hard, and warm anything in me that has grown cold.",
  "God, my Maker and my Friend, here I am again. Thank You for never growing tired of my voice, for welcoming every prayer, and for treasuring even the smallest whisper of my heart toward You.",
];

const CLOSINGS = [
  "I trust You with what I have prayed and with everything I have not even known how to say. You are working all things together for good. I rest in Your love and Your timing. In Jesus' name, Amen.",
  "Thank You for hearing me. Thank You that nothing I have brought You is too big for Your power or too small for Your tenderness. I leave this prayer at Your feet and walk forward in Your peace. Amen.",
  "I release what is heavy and I receive what You give — Your grace, Your strength, Your unfailing love. May my life today be a quiet song of praise to You. In the precious name of Jesus, Amen.",
  "Lord, I believe; help my unbelief. Carry me when I am weak and remind me that Your faithfulness does not depend on my feelings. I give You all the glory now and forever. Amen.",
  "Hold me close today, Father. Let every step I take be guided by Your Spirit and every word I speak be seasoned with Your grace. I love You, Lord. In Jesus' mighty name I pray, Amen.",
  "Thank You that this conversation does not end here — Your presence goes with me into every moment that follows. I am Yours, and that is enough. To You be all honor and praise. Amen.",
  "Seal what You have spoken to my heart. Help me to walk in obedience, to trust without seeing, and to love because You first loved me. In the name above every name, Jesus Christ, Amen.",
  "Cover me with Your peace that surpasses understanding. Guard my heart and my mind in Christ Jesus. I rise from this prayer encouraged, knowing that You are with me. Amen.",
  "Be glorified in my life today, Lord. Use even my smallest acts of faith to point others to You. I belong to You, and I want Your kingdom to come in and through me. In Jesus' name, Amen.",
  "I lay down my way and pick up Yours. Lead me where You will, change me as You see fit, and let Your love be the steady ground beneath my feet. Forever I am Yours. Amen.",
  "Thank You, Father, for hearing me, holding me, and going before me. I leave this place lighter than I came, because I have been with You. In the name of Jesus my Savior, Amen.",
  "May the words of my mouth and the meditations of my heart be pleasing to You. Let everything I am bow to who You are. I trust You completely. In Jesus' name, Amen.",
];

type CategoryBodies = Record<string, string[]>;

const BODIES: CategoryBodies = {
  Beginner: [
    "I am still learning how to pray, and I want to learn from You. Teach me to speak honestly, to listen patiently, and to trust that You delight in every fumbling word I bring. There is no perfect way to come to You — there is only coming.",
    "Father, I am new to this, and parts of me feel uncertain. But Your Word says that those who draw near to You, You draw near to them. So here I am, drawing near, knowing that You are not measuring my words but listening to my heart.",
    "Lord, I want to know You — not just know about You. Open my eyes to see who You really are. Strip away wrong ideas of You and replace them with the truth of Your love. Begin a real friendship in me.",
    "Holy Spirit, You are my Helper. Help me to pray. Help me to recognize Your voice. Help me to walk with God in a way that becomes the most natural rhythm of my life. I want this to be the start of something real.",
    "God, I do not need fancy words; I just need You. Take this small mustard-seed faith and grow it. Plant Your truth in me deep enough that it will hold when storms come and seasons shift.",
    "Father, every saint of the faith began exactly where I am — at the start. Thank You that You meet beginners with the same love You give to those who have walked with You for years. I receive that love today.",
    "Jesus, You said that whoever comes to You, You will never cast out. So I come. I bring my questions, my hopes, and even my doubts. Let me find in You a Friend closer than a brother.",
    "Lord, I do not want a routine — I want a relationship. Make my prayer life real, alive, honest, and sweet. Let what begins here today grow into a love story between my soul and Yours.",
  ],
  Enlightenment: [
    "Open the eyes of my heart, Lord. I want to see beyond what is in front of me — to perceive Your hand at work, Your wisdom in every season, and Your truth cutting clean through the noise of this world.",
    "Father of lights, shine into the places in me that are still in shadow. Where I have believed lies, replace them with truth. Where I have leaned on my own understanding, teach me to lean on You.",
    "Holy Spirit, You are the Spirit of truth. Lead me into all truth today. Illuminate the Scriptures when I read them; illuminate the moments of my day so I can see what You are doing and join You there.",
    "Lord, give me wisdom — not just knowledge, but the kind of wisdom that walks with You. Let me understand things the way You understand them, weigh them the way You weigh them, and respond the way You would.",
    "God, I do not want to live blind. Awaken my spirit to Your presence in the ordinary. Let me see the holy in the small, the eternal in the everyday, and Your fingerprints across every part of my life.",
    "Father, You promise that if anyone lacks wisdom, they may ask of You and You will give it generously. So I ask. Pour clarity into my confusion and discernment into every decision I am facing.",
    "Jesus, You are the Light of the World. Be the light in me. Let nothing hidden remain hidden — not to shame me, but so that I may walk in freedom and in truth.",
    "Lord, deepen me. I do not want shallow faith or borrowed convictions. Take me into the deeper waters of Your Word and Your Spirit, and teach me to swim there.",
  ],
  Gratitude: [
    "Thank You, Father — for life, for breath, for grace I did not earn and never could. Thank You for the morning that came again, for the bed I slept in, for every face I love and every kindness I have received.",
    "Lord, my heart overflows when I think of who You are. You are good, all the time. Even on the hard days, even in the questions, even when I cannot trace Your hand — I can trust Your heart.",
    "God, I do not want to take a single thing for granted today. Thank You for the small mercies I usually rush past: the warmth of the sun, a quiet moment, a familiar voice, a prayer answered before I even thought to ask.",
    "Father, thank You for Jesus. There is no greater gift. Thank You that I have been welcomed into Your family, made new, given hope that does not disappoint. May my life be a thank-You note in motion.",
    "Lord, You have been so faithful. Looking back, I can see Your hand on every chapter — even the ones I did not understand at the time. Thank You for not leaving me, even once. You have been better than I deserve.",
    "God, I lift my hands in praise for who You are: holy, loving, near, mighty, gentle, faithful. Thank You that my gratitude does not change You, but it changes me. Make me a person whose first response is thanks.",
    "Father, thank You for this very moment — that I get to speak to You, that You hear me, that I am Yours. There is no greater joy than knowing You. Receive my praise as the offering of a grateful heart.",
    "Lord, I thank You for what I have and for what I do not yet have, because You are the Giver of every good and perfect gift. Whatever comes, my life is built on Your goodness, and Your goodness has never failed.",
  ],
  Peace: [
    "Prince of Peace, still the storms within me. Where my thoughts are racing, slow them. Where my heart is troubled, calm it. Let Your peace, which surpasses understanding, settle deep into my soul.",
    "Father, I let go of what I cannot control and place it in Your hands — hands that hold the universe and yet are gentle enough to hold my heart. I rest in Your sovereign care.",
    "Lord Jesus, You said that in this world we will have trouble, but to take heart because You have overcome the world. I take heart today. My peace is not in my circumstances; it is in You.",
    "God of peace, sanctify me through and through. Quiet every anxious thought. Untangle every knot in my spirit. Let stillness become my home and trust become my native language.",
    "Father, You are a very present help in times of trouble. I do not have to manufacture calm; I only have to rest in Your presence. Be the anchor that keeps me steady today.",
    "Holy Spirit, breathe peace into my body and my mind. Loosen my shoulders, soften my jaw, slow my breath. Remind me that I am held, I am loved, and I am safe in You.",
    "Lord, where my world feels chaotic, plant a garden of peace in the middle of it. Let me carry Your stillness into every conversation and every demand of this day.",
    "God, I trade my striving for Your stillness, my fear for Your faithfulness, my noise for Your nearness. You are my peace. You are enough.",
  ],
  Stress: [
    "Father, I bring You this weight that I cannot carry alone. You see how much is on my shoulders right now. I do not have to pretend with You. Take from me what was never meant to be mine, and remind me that You are God and I am not.",
    "Lord, I am stretched thin, and I need You. Multiply my time, my strength, my patience, and my grace. Help me to do the next right thing without trying to do everything all at once.",
    "Jesus, You invite the weary to come to You and find rest for their souls. I am weary. I come. Take my burden and give me Your gentle, easy yoke instead.",
    "Father, the demands feel relentless. But You are not in a panic. You are not rushed. You are not overwhelmed. Let Your unhurried strength become mine. Let me operate from Your peace, not for it.",
    "God, help me to release what is not mine to carry — other people's choices, outcomes I cannot control, expectations I was never meant to meet. Free me to focus on what You have actually given me to do.",
    "Lord, slow me down. Remind me that the most important thing in my day is You, and that everything else flows from time spent with You. Re-order my priorities and re-anchor my heart.",
    "Father, when stress rises, let my first instinct be to turn to You — not to scroll, not to numb, not to spiral. You are my refuge. You are my strength. You are a very present help.",
    "Holy Spirit, fill me with peace that does not depend on circumstances. Remind me again and again today that I am loved, I am held, and I do not have to carry what You are willing to take.",
  ],
  Anxiety: [
    "Father, my heart is racing and my thoughts are spinning. I bring this anxiety to You, not because I have figured it out, but because You are bigger than it. Speak to the storm inside me and say, 'Peace, be still.'",
    "Lord, You tell me not to be anxious about anything, but in everything by prayer and supplication, with thanksgiving, to make my requests known to You. So here I am — making it known. I trust You with what I cannot see.",
    "Jesus, You went to the Father with loud cries and tears, and You understand what it is to feel overwhelmed. Thank You that I can come to You honestly. Hold me in this moment exactly as I am.",
    "Holy Spirit, help me breathe. In through Your peace, out with my fear. Replace every anxious thought with the truth of who You are: faithful, near, loving, sovereign, in control.",
    "Father, fear lies. It tells me I am alone. It tells me the worst is coming. It tells me I am not enough. But Your Word tells the truth: I am loved, I am held, and You are with me always.",
    "God, calm my body. Loosen the tightness in my chest. Slow my heartbeat. Let the truth of Your presence reach the places that words cannot reach. Heal me from the inside out.",
    "Lord, You are perfect love, and perfect love casts out fear. Pour Your love over the parts of me that are afraid until they have no room left to be afraid. I am safe in You.",
    "Father, even if the thing I fear comes to pass, You will still be God, You will still be good, and You will still be with me. That is the foundation I can stand on when nothing else feels stable.",
  ],
  Uncertainty: [
    "Father, I do not know what is ahead, but You do. That is enough. I do not need the whole map; I just need to take the next step with You. Light my path one step at a time.",
    "Lord, I am tempted to demand answers, to need a clear plan, to feel in control. Instead, teach me to trust the One who holds the future rather than needing to see it.",
    "God, You are the same yesterday, today, and forever. Even as my circumstances shift, You do not. Anchor me to who You are. Let Your unchanging nature be the rock I stand on in every changing season.",
    "Father, when I cannot trace Your hand, help me trust Your heart. You have been faithful in every chapter so far; I have no reason to believe You will not be faithful in this one too.",
    "Lord, I lay down my need to know and pick up Your invitation to trust. You are working things together for good — even now, even in this, even when I cannot see it.",
    "Holy Spirit, give me peace in the in-between. Help me to live well in this season of waiting and not waiting, knowing and not knowing. You are with me in every part of it.",
    "God, You make a way where there is no way. You open doors that no one can shut and shut doors that no one can open. I trust Your sovereign hand over my future.",
    "Father, I commit my way to You. Direct my steps. Speak when You want me to move and grant me peace when You want me to wait. I will follow wherever You lead.",
  ],
  "Test results": [
    "Father, I await an outcome that is in Your hands. You see this report, this number, this verdict, before I do. Whatever the result, You will not be surprised, and You will not leave me.",
    "Lord, my worth is not in this score, this diagnosis, this letter, this answer. My worth is in You, and that is settled. Let no result — good or bad — shake the truth of who I am in You.",
    "God, calm me as I wait. Take the 'what ifs' that are spinning in my mind and replace them with the truth: You are with me, You love me, and You are working everything for my good.",
    "Jesus, whether the news is what I hoped for or what I feared, You are still on the throne. Help me to receive it with grace, to trust You with what comes next, and to praise You either way.",
    "Father, I have done what I can. The rest is in Your hands — better hands than my own. I release the outcome to You and rest in the knowledge that You are good and Your plans for me are good.",
    "Lord, give me courage to face whatever comes. If the news is hard, walk with me through it. If the news is good, keep my heart humble and grateful. In every case, let me draw closer to You.",
    "God, You are not just the God of good outcomes — You are God in every outcome. Let my faith not be tied to the result, but to who You are. You are enough, no matter what.",
    "Father, comfort the anxious places in me right now. Steady my breathing, quiet my thoughts, and surround me with Your peace. I am Yours, and I will trust You with this.",
  ],
  "School day": [
    "Father, as I begin this day of learning, sharpen my mind, steady my focus, and remind me that all wisdom flows from You. May every lesson be an opportunity to grow — not just in knowledge, but in character.",
    "Lord, give me a teachable spirit today. Let me listen well, ask good questions, and treat every person I encounter — teachers and classmates alike — with kindness and respect.",
    "Jesus, You are the wisdom of God. Walk with me through this day. When I am tempted to cut corners or to compare myself to others, draw me back to integrity and to confidence in who You made me to be.",
    "Holy Spirit, help me with what is hard. Where I struggle, help me persevere. Where I feel pressured, help me rest in Your peace. Where I succeed, help me give You the glory.",
    "Father, this day belongs to You. Use it to shape me. Even the boring lessons, the tough teachers, the awkward moments — work them all together for good in my life.",
    "Lord, protect my heart and my mind today. Guard me from comparison, from anxiety, from self-doubt. Let me see myself as You see me: known, loved, and called to good things.",
    "God, give me strength when I am tired, focus when I am distracted, courage when I am unsure. Let me leave this day having honored You in how I learned, how I treated others, and how I worked.",
    "Father, may I be a light today — not loud, not showy, just real. Let my peace, my kindness, and my joy point others toward the One who gives them.",
  ],
  "New week": [
    "Lord, a new week stretches before me, full of unknowns and opportunities. I dedicate it to You. Let every task, every conversation, and every quiet moment be lived in Your presence and for Your glory.",
    "Father, I refuse to drag last week's burdens into this one. I leave behind what is finished — the failures, the regrets, the pressures — and I step into this week with fresh mercies that are new every morning.",
    "God, set the tone of this week with Your peace. Let me begin Monday and end Sunday more grounded in You than I started. Anchor me in Your Word and steady me with Your Spirit.",
    "Lord, I ask for clarity in my priorities, strength in my work, kindness in my words, and joy in the ordinary. Let me work hard, rest well, and keep my eyes on You.",
    "Jesus, lead me through this week. Where I need wisdom, give it. Where I need courage, supply it. Where I need patience, grow it. Let my life this week reflect Your love.",
    "Father, I commit my plans to You. I know that You may rearrange them, redirect them, or refine them — and that is good. Have Your way in my schedule, my goals, and my heart.",
    "God, let this be a week of growth — in faith, in love, in self-control, in wisdom. Stretch me in good ways. Use everything that comes my way to make me more like Jesus.",
    "Lord, I do not want to merely survive this week; I want to walk with You through it. Be my Strength on the busy days and my Joy on the quiet ones. Let me arrive at the weekend closer to You than I am right now.",
  ],
  "Long trip": [
    "Heavenly Father, I entrust this journey to You. Be my guide on the road, my peace in every mile, and my rest at journey's end. Send Your angels before and behind me to keep me safe.",
    "Lord, watch over every mile, every turn, every decision along the way. Grant safety to me and to those traveling with me, as well as to every other person on the road today.",
    "God, calm any anxiety I feel about this trip. You go with me and before me. There is no place I can travel where Your presence is not already waiting to meet me.",
    "Jesus, may this journey be more than just a change in location. Use the miles to bring me closer to You. Let the time on the road be time for prayer, reflection, and rest.",
    "Father, protect us from delays, from accidents, from anything that would harm us. And where things do go wrong, let Your peace cover us and Your hand guide us through.",
    "Lord, give wisdom to those who are driving, alertness when we are tired, and patience when traffic tests us. Let our travels be marked by kindness — to each other and to strangers.",
    "Holy Spirit, fill this trip with Your presence. Let conversations be sweet, silences be restful, and the destination — when we arrive — be a place of joy and good purpose.",
    "Father, thank You for the gift of being able to travel. Thank You for the people I will see, the places I will go, and the experiences ahead. Let everything about this journey honor You.",
  ],
  Work: [
    "Father, I bring my work to You today. Whatever I do, let me do it heartily, as for You and not for people. Use the ordinary tasks of this day to shape me and to bless others through me.",
    "Lord, give me focus when distractions pull at me, integrity when shortcuts tempt me, and patience when frustrations rise. Let my work reflect Your excellence and Your character.",
    "God, You are the One who gives strength to the weary and skill to the hands. I ask for both today. Help me steward my time well and finish what You have given me to do.",
    "Jesus, where I feel unseen at work, remind me that You see. Where I feel undervalued, remind me of who I am in You. My identity is not in a paycheck or a title — it is in being Your child.",
    "Father, bless my coworkers and those in authority over me. Help me to honor them, to speak well of them, and to be a person of peace in every meeting and conversation.",
    "Lord, where my work feels meaningless, give it meaning by reminding me that I do it for You. Where it feels overwhelming, break it into the next small faithful step.",
    "Holy Spirit, give me wisdom for the decisions I will face today. Help me to listen well, to think clearly, and to respond with grace even when pressure mounts.",
    "Father, thank You for the gift of being able to work. Use my hands, my mind, and my voice today to add value to the world and to point — even quietly — back to You.",
  ],
  Commuting: [
    "Father, as I travel from one place to another today, travel with me. Use this in-between time as sacred space — a chance to breathe, to pray, to remember who You are and whose I am.",
    "Lord, protect me on the road, on the train, on the bus, on every step of this commute. Watch over me and over every person traveling near me. Bring us all safely to where we are going.",
    "God, calm the rush within me. Help me to release the urgency that tempts me to drive aggressively or to be impatient with delays. You hold my time in Your hands.",
    "Jesus, fill this commute with Your presence. Let it be a transition not just of place, but of heart — preparing me for what comes next with peace, not pressure.",
    "Father, where I am tempted to scroll mindlessly or stew in worry, gently turn my heart back to You. Let me arrive more centered than I left.",
    "Holy Spirit, soften me toward the strangers around me. Help me see them as people loved by You, not obstacles in my way. Let kindness leak out of me even in traffic.",
    "Lord, when delays come, remind me that nothing happens outside Your sight. Use even the slow moments to slow me down in good ways and to draw me closer to You.",
    "Father, thank You for safe travel, for working transportation, for the everyday miracle of getting from one place to another. Let me arrive thankful and ready.",
  ],
  "School work submission": [
    "Father, I bring this assignment before You. I have done what I can; the rest is in Your hands. Settle my heart and remind me that my worth is not measured by a grade.",
    "Lord, as I submit this work, I let go of the outcome. Whether the result is what I hoped for or not, You are still good and I am still loved. Help me to trust You with what comes next.",
    "God, thank You for the strength You gave me to finish this. Every hour of effort, every late night, every moment of focus — it was sustained by Your grace.",
    "Jesus, calm the second-guessing in my mind. I will not keep rewriting what is already done. Help me to release this work and to rest in the knowledge that I gave my best.",
    "Father, bless the hands that will receive and review this. Give them clarity and fairness. And whatever feedback comes, let it be something I can grow from.",
    "Holy Spirit, take the pressure I feel and replace it with peace. Remind me that this submission is one moment in a long journey, and You are walking with me through all of it.",
    "Lord, where I feel I could have done more, free me from regret. Where I feel proud of what I did, keep me humble. In every case, anchor me in You.",
    "Father, use even this small act of submission to teach me something — about faithfulness, about diligence, about trusting You with results I cannot control.",
  ],
  Depression: [
    "Father, I do not have strong words today. The weight is heavy and the light feels far away. But I know You are near to the brokenhearted, and I trust that You are near to me right now.",
    "Lord, You are not afraid of my sadness. You do not flinch at my tears. Sit with me in this. Let me feel — even faintly — that I am not alone, because You are here.",
    "God, when my soul is downcast within me, help me to remember You. To remember Your past faithfulness. To remember that this season, however long, is not the end of my story.",
    "Jesus, You were called a man of sorrows, acquainted with grief. You understand. Hold me in this place I cannot lift myself out of. I lean on Your strength because mine is gone.",
    "Father, give me grace to do the next small thing — to drink some water, to step outside, to reach out to someone safe, to keep showing up. Strength for one moment at a time.",
    "Holy Spirit, breathe life into the dry places in me. Where hope has thinned, restore it. Where joy has faded, do not let it die. I cling to the promise that weeping may endure for a night, but joy comes in the morning.",
    "Lord, surround me with people who carry the light when I cannot. Give me the courage to ask for help and the wisdom to receive it. I do not have to walk this alone.",
    "Father, You are a refuge in times of trouble, a very present help. Even when I cannot feel You, I choose to believe You are with me. Hold me until I can feel it again.",
  ],
  Joy: [
    "Father, my heart is full today, and I lift it up to You. You are the source of every good gift, and I want You to know how grateful I am for the joy I am feeling right now.",
    "Lord, thank You that joy is more than a passing feeling — it is the deep knowing that You are good, You are near, and You are mine. Anchor this joy in You so it lasts.",
    "God, let my joy spill over today. Let it touch the people around me. Use my smile, my laughter, my lightness as small reminders to others that You are still good.",
    "Jesus, the joy of the Lord is my strength. Let this joy not just lift me but fuel me — for love, for service, for boldness in following You.",
    "Father, I do not want to take this gift for granted. Help me to celebrate well, to give You credit for it, and to remember this season when harder days come.",
    "Holy Spirit, deepen my joy. Move it from being just about my circumstances to being rooted in who You are. Then it will hold even when circumstances change.",
    "Lord, may this joy make me more generous, more kind, more present. Let it overflow into love for the people You have placed in my life.",
    "Father, I rejoice in You today. Not just for what You have given, but for who You are. Receive this celebration as my offering of praise.",
  ],
  Presentation: [
    "Father, I am about to stand in front of others, and I bring this moment to You. Steady my voice, quiet my nerves, and replace fear with confidence in You — not in myself.",
    "Lord, You did not give me a spirit of fear, but of power, love, and a sound mind. I receive that promise now. Let it carry me through every word I am about to speak.",
    "God, may my words be clear, my thoughts be ordered, and my preparation bear fruit. Let those who listen receive what they need to hear.",
    "Jesus, take the pressure off my shoulders. This presentation does not define me — You do. Whatever happens, my identity is secure in You.",
    "Father, use me for something bigger than this moment. Even in a business meeting, a class, a pitch — let my work and my presence point in some way back to You.",
    "Holy Spirit, give me clarity in real time. Bring back to my mind what I have prepared. And if I lose my place, give me grace to recover with composure.",
    "Lord, calm my body. Slow my breathing, steady my hands, settle my heart. I trust You to walk with me into that room.",
    "Father, when this is done — whatever the outcome — help me to release it to You and to rest. I will have done my part, and the rest is in Your hands.",
  ],
  Relationship: [
    "Father, I bring this relationship before You. You see what I cannot see. Where there is misunderstanding, bring clarity. Where there is hurt, bring healing. Where there is love, deepen it.",
    "Lord, help me to love this person well — patiently, kindly, without keeping a record of wrongs. Make me quick to listen, slow to speak, and slow to anger.",
    "God, where my own pride or fear gets in the way, soften me. Show me where I need to repent, where I need to forgive, and where I need to simply be present.",
    "Jesus, You loved us first; teach me to love like that — not waiting for the other person to deserve it, but choosing to give it freely because You first gave it to me.",
    "Father, guard this relationship from the enemy's schemes — from comparison, from bitterness, from miscommunication. Surround it with Your peace and Your protection.",
    "Holy Spirit, give us both wisdom for the next conversation, courage for the hard truths, and tenderness in the way we speak. Let our words build up and not tear down.",
    "Lord, if this relationship is meant to grow, help us nurture it. If it is meant to change shape, give us grace to navigate that. In every case, may Your will be done.",
    "Father, thank You for this person. Even when it is hard, You have placed them in my life on purpose. Help me to see them through Your eyes and to love them with Your love.",
  ],
  Expectations: [
    "Father, I lay down my expectations at Your feet — the ones I have placed on myself, the ones others have placed on me, and the ones I have placed on others. They are too heavy. I trade them for Your gentle yoke.",
    "Lord, where I have demanded that life look a certain way, free me. Help me to receive what You give with open hands, even when it is different from what I imagined.",
    "God, You see the weight of unspoken expectations I have been carrying. Lift them. Replace them with the simple invitation to walk with You and to do the next right thing.",
    "Jesus, I do not want to live for the approval of people. Set me free from the constant performance. Let my deepest 'well done' come from You alone.",
    "Father, where I have been disappointed because reality did not match my expectation, heal that disappointment. Reorient my heart around what is true, not just what I hoped for.",
    "Holy Spirit, help me hold my plans loosely and Your hand tightly. You may rearrange my expectations because You see something I cannot. Make me trust You enough to let You.",
    "Lord, free me from comparing my life to anyone else's. Their timeline is not mine. Their measure of success is not Yours. Let me run my own race with my eyes on You.",
    "Father, the only expectation I want to live under today is this: that You are good, You are faithful, and You will not fail me. That is enough. Everything else can be held loosely.",
  ],
};

const FALLBACK_BODY: string[] = [
  "Lord, You know exactly what is on my heart in this moment. The words may be hard to find, but You hear what I cannot say. I trust You with everything that I am holding.",
  "Father, meet me where I am. Speak to the things I have brought before You today and to the things I do not even have language for. Let Your Spirit translate the deepest needs of my heart.",
];

// Simple deterministic hash so prayer choice can be reproducible per session.
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export type PrayerInput = {
  category: string;
  userName?: string;
  // Optional free-form prayer point typed by the user.
  // When provided, it is woven into the body of the prayer.
  customTopic?: string;
  // A unique seed for this prayer session — usually Date.now() so each
  // session feels fresh, but can be a stable string for testing.
  sessionSeed?: string | number;
};

const CUSTOM_BODIES: string[] = [
  "Lord, I bring before You {topic}. You see every detail and every weight tied to it. I lay it down at Your feet and ask You to move in ways only You can.",
  "Father, I am praying about {topic}. Nothing about it is hidden from You. Wrap Your peace around this part of my life and lead me in the right direction.",
  "God, hear my heart concerning {topic}. Where I feel uncertain, give me clarity. Where I feel weary, give me strength. Where I have lost hope, restore it.",
  "Holy Spirit, meet me in {topic}. Move where I cannot reach, soften what is hard, and open what feels closed. I trust You to work even when I cannot see the way.",
  "Lord, I surrender {topic} into Your hands. Take what I cannot carry, redeem what I cannot fix, and shape it for Your good purpose in my life.",
  "Father, You already know everything about {topic}. I ask for Your wisdom, Your timing, and Your grace. Help me trust You with each step from here.",
];

export function generatePrayer({
  category,
  userName,
  customTopic,
  sessionSeed,
}: PrayerInput): string {
  const cleanTopic = (customTopic ?? "").trim();
  const bodies = cleanTopic
    ? CUSTOM_BODIES.map((b) => b.replace("{topic}", cleanTopic))
    : BODIES[category] ?? FALLBACK_BODY;
  const seedStr =
    String(sessionSeed ?? Date.now()) +
    "|" +
    (userName ?? "") +
    "|" +
    (cleanTopic || category);
  const h = hashString(seedStr);

  const opening = OPENINGS[h % OPENINGS.length];
  const middle = bodies[Math.floor(h / 7) % bodies.length];
  const closing = CLOSINGS[Math.floor(h / 53) % CLOSINGS.length];

  return `${opening}\n\n${middle}\n\n${closing}`;
}

// Approximate count of unique prayers available per category.
// 12 openings × 8 bodies × 12 closings = 1152 base combinations,
// further multiplied by user name personalization.
export const PRAYERS_PER_CATEGORY = 12 * 8 * 12;
