// All interface text in English and Hebrew. {0},{1} are filled in by t().
const S={
 en:{
  armed:'ARMED',safe:'SAFE',offline:'OFFLINE',bomb:'BOMB',practice:'PRACTICE',
  days:['SUN','MON','TUE','WED','THU','FRI','SAT'],
  intro1:'A bomb with <b>4 wires</b>. Each wire has a tag with a note on it.',
  intro2:'Some notes are <b>lies</b>. The bomb tells you how many.',
  intro3:'Find the safe wire and cut it. <b>One cut. No second chances.</b>',
  start:'▶ START THE CLOCK',rule:'// RULE',
  oneTrue:'Only <b>ONE</b> tag tells the truth. All the others are lying.',
  oneLie:'Only <b>ONE</b> tag is lying. All the others tell the truth.',
  hintSel:'Tap a wire or a tag to select it',hintCut:'Tap the wire again or hit the button to cut',
  tapWire:'TAP A WIRE TO SELECT IT',cutX:'✂ CUT {0}',cutMark:'✂ CUT',safeMark:'SAFE',
  tagLbl:'tag_0{0} · {1} wire',
  legendTemp:'WARM = red · orange · yellow &nbsp;|&nbsp; COOL = green · blue · purple',
  defused:'DEFUSED',boom:'💥 BOOM',
  wonSmall:'Cut in {0} · {1} left on the clock',outOfTime:'You ran out of time.',wrongWire:'The {0} wire was the wrong one.',
  whyTrue:'Only the {0} tag was telling the truth, so the safe wire was {1}.',
  whyLie:'Only the {0} tag was lying, so the safe wire was {1}.',
  played:'played',wins:'defused',streak:'streak',best:'best',
  shareWA:'CHALLENGE ON WHATSAPP',copy:'⧉ COPY RESULT',copied:'Copied — paste it anywhere!',copyFail:'Couldn’t copy.',
  tomorrow:'New bomb tomorrow.',practiceBtn:'⟳ PRACTICE BOMB',practiceMore:'⟳ ANOTHER PRACTICE BOMB',today:'◂ TODAY\'S BOMB',
  shareWon:'💣 DEFUSE #{0}\n✂️ Defused in {1} 🟢',shareLost:'💣 DEFUSE #{0}\n💥 BOOM{1} 🔴',shareTime:' (out of time)',
  dareWon:'Think you can do it faster? 😏',dareLost:'Think you can do better? 💀',
  // leaderboard
  board:'LEADERBOARD',todayBoard:'Today',boardEmpty:'No defuses yet today. Be the first!',boardOff:'Leaderboard is offline right now.',
  boardLoading:'Loading…',you:'you',boomed:'💥',
  yourName:'Your name for the leaderboard',namePh:'Nickname',save:'SAVE',post:'POST MY TIME',
  posted:'Posted to the leaderboard ✓',rankX:'#{0} today',
  groups:'GROUPS',newGroup:'+ NEW GROUP',groupNamePh:'Group name (e.g. The Guys)',create:'CREATE',
  inviteWA:'INVITE ON WHATSAPP',inviteText:'Join my DEFUSE group "{0}" 💣 — a new bomb every day, let\'s see who\'s fastest:\n{1}',
  joined:'You joined "{0}" ✓',groupGone:'That group link doesn\'t work anymore.',needName:'Pick a name first',
  members:'{0} members',leave:'Leave group',
  // challenge
  vsBanner:'⚔️ <b>{0}</b> defused today\'s bomb in <b>{1}</b>. Can you beat that?',
  vsBannerLost:'⚔️ <b>{0}</b> blew up on today\'s bomb. Can you do better?',
  vsOld:'⚔️ <b>{0}</b> challenged you on an older bomb — here\'s today\'s.',
  vsWin:'You beat {0}! ({1} vs {2})',vsLose:'{0} wins this one ({2} vs {1})',vsBothBoom:'You both blew up 💀',
  vsOnlyThem:'{0} blew up — you win! 🏆',vsOnlyYou:'{0} survived, you didn\'t 💀',
  // settings
  settings:'SETTINGS',lang:'Language',sound:'Sound',vibrate:'Vibration',on:'ON',off:'OFF',name:'Name',
  install:'Install as an app',installHow:'Add DEFUSE to your home screen: open your browser menu (⋮ or Share) and tap “Add to Home screen”.',installBtn:'⬇ INSTALL APP',
  close:'✕',back:'◂ BACK',vTrue:'TRUE',vLie:'LIE',
  colors:{red:'red',orange:'orange',yellow:'yellow',green:'green',blue:'blue',purple:'purple'}
 },
 he:{
  armed:'דרוך',safe:'נוטרל',offline:'כבוי',bomb:'פצצה',practice:'אימון',
  days:['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'],
  intro1:'פצצה עם <b>4 חוטים</b>. על כל חוט תלוי פתק.',
  intro2:'חלק מהפתקים <b>משקרים</b>. הפצצה אומרת לכם כמה.',
  intro3:'מצאו את החוט הבטוח וחתכו אותו. <b>חיתוך אחד. אין הזדמנות שנייה.</b>',
  start:'▶ הפעילו את השעון',rule:'// חוק',
  oneTrue:'רק פתק <b>אחד</b> אומר אמת. כל השאר משקרים.',
  oneLie:'רק פתק <b>אחד</b> משקר. כל השאר אומרים אמת.',
  hintSel:'הקישו על חוט או על פתק כדי לבחור',hintCut:'הקישו שוב על החוט או על הכפתור כדי לחתוך',
  tapWire:'בחרו חוט',cutX:'✂ חתכו את {0}',cutMark:'✂ חתוך',safeMark:'בטוח',
  tagLbl:'פתק {0} · חוט {1}',
  legendTemp:'חם = אדום · כתום · צהוב &nbsp;|&nbsp; קר = ירוק · כחול · סגול',
  defused:'נוטרלה!',boom:'💥 בום',
  wonSmall:'נחתך תוך {0} · נשארו {1} בשעון',outOfTime:'נגמר הזמן.',wrongWire:'החוט ה{0} היה החוט הלא נכון.',
  whyTrue:'רק הפתק {0} אמר אמת, ולכן החוט הבטוח היה {1}.',
  whyLie:'רק הפתק {0} שיקר, ולכן החוט הבטוח היה {1}.',
  played:'שיחקתם',wins:'נוטרלו',streak:'רצף',best:'שיא',
  shareWA:'אתגרו בוואטסאפ',copy:'⧉ העתיקו תוצאה',copied:'הועתק — הדביקו איפה שתרצו!',copyFail:'ההעתקה נכשלה.',
  tomorrow:'פצצה חדשה מחר.',practiceBtn:'⟳ פצצת אימון',practiceMore:'⟳ עוד פצצת אימון',today:'▸ הפצצה של היום',
  shareWon:'💣 DEFUSE #{0}\n✂️ נוטרלה תוך {1} 🟢',shareLost:'💣 DEFUSE #{0}\n💥 בום{1} 🔴',shareTime:' (נגמר הזמן)',
  dareWon:'חושבים שתעשו את זה מהר יותר? 😏',dareLost:'חושבים שתצליחו יותר? 💀',
  board:'טבלת שיאים',todayBoard:'היום',boardEmpty:'עוד אף אחד לא נטרל היום. היו הראשונים!',boardOff:'הטבלה לא זמינה כרגע.',
  boardLoading:'טוען…',you:'את/ה',boomed:'💥',
  yourName:'השם שלכם בטבלה',namePh:'כינוי',save:'שמירה',post:'פרסמו את הזמן שלי',
  posted:'פורסם בטבלה ✓',rankX:'מקום {0} היום',
  groups:'קבוצות',newGroup:'+ קבוצה חדשה',groupNamePh:'שם הקבוצה (למשל: החבר׳ה)',create:'יצירה',
  inviteWA:'הזמינו בוואטסאפ',inviteText:'הצטרפו לקבוצת DEFUSE שלי "{0}" 💣 — פצצה חדשה כל יום, בואו נראה מי הכי מהיר:\n{1}',
  joined:'הצטרפתם ל"{0}" ✓',groupGone:'הקישור לקבוצה כבר לא עובד.',needName:'קודם בחרו שם',
  members:'{0} חברים',leave:'יציאה מהקבוצה',
  vsBanner:'⚔️ <b>{0}</b> נטרל/ה את הפצצה של היום תוך <b>{1}</b>. תצליחו לנצח?',
  vsBannerLost:'⚔️ <b>{0}</b> התפוצץ/ה על הפצצה של היום. תצליחו יותר?',
  vsOld:'⚔️ <b>{0}</b> אתגר/ה אתכם על פצצה ישנה — הנה של היום.',
  vsWin:'ניצחתם את {0}! ({1} מול {2})',vsLose:'{0} ניצח/ה הפעם ({2} מול {1})',vsBothBoom:'שניכם התפוצצתם 💀',
  vsOnlyThem:'{0} התפוצץ/ה — ניצחתם! 🏆',vsOnlyYou:'{0} שרד/ה, אתם לא 💀',
  settings:'הגדרות',lang:'שפה',sound:'צלילים',vibrate:'רטט',on:'פועל',off:'כבוי',name:'שם',
  install:'התקנה כאפליקציה',installHow:'הוסיפו את DEFUSE למסך הבית: פתחו את תפריט הדפדפן (⋮ או שיתוף) והקישו "הוספה למסך הבית".',installBtn:'⬇ התקנת האפליקציה',
  close:'✕',back:'▸ חזרה',vTrue:'אמת',vLie:'שקר',
  colors:{red:'אדום',orange:'כתום',yellow:'צהוב',green:'ירוק',blue:'כחול',purple:'סגול'}
 }
};
export let LANG='en';
export function setLang(l){LANG=S[l]?l:'en';document.documentElement.lang=LANG;document.documentElement.dir=LANG==='he'?'rtl':'ltr'}
export function t(key,...a){let s=S[LANG][key];if(s===undefined)s=S.en[key];if(typeof s!=='string')return s;return s.replace(/\{(\d)\}/g,(_,i)=>a[i]??'')}
export const colorName=n=>S[LANG].colors[n];

// Tag statements. chip(i) renders a colored name for wire i.
export function stmtText(tg,chip){
  const c=tg.c;
  if(LANG==='he'){
    switch(tg.type){
      case'is':return`החוט ${chip(c)} בטוח.`;
      case'not':return`החוט ${chip(c)} לא בטוח.`;
      case'next':return`החוט הבטוח צמוד לחוט ${chip(c)}.`;
      case'left':return`החוט הבטוח נמצא איפשהו משמאל לחוט ${chip(c)}.`;
      case'right':return`החוט הבטוח נמצא איפשהו מימין לחוט ${chip(c)}.`;
      case'end':return`החוט הבטוח נמצא באחד הקצוות.`;
      case'notEnd':return`החוט הבטוח לא נמצא באף אחד מהקצוות.`;
      case'warm':return`החוט הבטוח בצבע חם.`;
      case'cool':return`החוט הבטוח בצבע קר.`;
      case'lies':return`הפתק ${chip(c)} משקר.`;
      case'truth':return`הפתק ${chip(c)} אומר אמת.`;
      case'between':return`החוט הבטוח נמצא איפשהו בין החוט ${chip(c)} לחוט ${chip(tg.d)}.`;
      case'twoAway':return`החוט הבטוח נמצא בדיוק שני מקומות מהחוט ${chip(c)}.`;
      case'sameTemp':return`החוט הבטוח חם/קר בדיוק כמו החוט ${chip(c)}.`;
      case'xor':return`בדיוק אחד מהפתקים ${chip(c)} ו${chip(tg.d)} משקר.`;
    }
  }
  switch(tg.type){
    case'is':return`The ${chip(c)} wire is safe.`;
    case'not':return`The ${chip(c)} wire is NOT safe.`;
    case'next':return`The safe wire is right next to ${chip(c)}.`;
    case'left':return`The safe wire is somewhere left of ${chip(c)}.`;
    case'right':return`The safe wire is somewhere right of ${chip(c)}.`;
    case'end':return`The safe wire is at one of the ends.`;
    case'notEnd':return`The safe wire is not at either end.`;
    case'warm':return`The safe wire is a warm color.`;
    case'cool':return`The safe wire is a cool color.`;
    case'lies':return`The ${chip(c)} tag is lying.`;
    case'truth':return`The ${chip(c)} tag is telling the truth.`;
    case'between':return`The safe wire is somewhere between ${chip(c)} and ${chip(tg.d)}.`;
    case'twoAway':return`The safe wire is exactly two places away from ${chip(c)}.`;
    case'sameTemp':return`The safe wire is the same temperature (warm/cool) as ${chip(c)}.`;
    case'xor':return`Exactly one of the ${chip(c)} and ${chip(tg.d)} tags is lying.`;
  }
}
