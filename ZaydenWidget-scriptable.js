// ZAYDEN D1 — real iPhone/iPad HOME SCREEN widget (live data from your sync backend)
// ────────────────────────────────────────────────────────────────────────────
// SETUP (one time, ~3 min — requires cloud sync from SETUP-SYNC.md to be live):
//  1. App Store → install "Scriptable" (free).
//  2. Scriptable → + → paste this whole file → name it "Zayden D1".
//  3. Fill the 4 CONFIG lines below (same values as the app's sync setup).
//  4. Long-press home screen → add widget → Scriptable → Medium → choose "Zayden D1".
// The widget shows: days to the June 15 2028 gate · this week vs the bar · Daily Four.
// It reads the SAME synced data as the app. iOS refreshes it periodically on its own.
// ────────────────────────────────────────────────────────────────────────────
const CONFIG = {
  apiKey:   "PASTE_FIREBASE_API_KEY",
  projectId:"PASTE_FIREBASE_PROJECT_ID",
  email:    "PASTE_SYNC_EMAIL",
  password: "PASTE_SYNC_PASSWORD"
};
const GATE = "2028-06-15";
const AMBER = new Color("#c9f24e"), DIM = new Color("#9aa4b3"), FAINT = new Color("#5d6574");

function iso(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function addDays(s,n){ const d=new Date(s+"T12:00"); d.setDate(d.getDate()+n); return iso(d); }

async function getState(){
  let r = new Request(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${CONFIG.apiKey}`);
  r.method = "POST"; r.headers = {"Content-Type":"application/json"};
  r.body = JSON.stringify({email:CONFIG.email,password:CONFIG.password,returnSecureToken:true});
  const auth = await r.loadJSON();
  if(!auth.idToken) throw new Error(auth.error ? auth.error.message : "sign-in failed");
  let g = new Request(`https://firestore.googleapis.com/v1/projects/${CONFIG.projectId}/databases/(default)/documents/athletes/${auth.localId}`);
  g.headers = {"Authorization":"Bearer "+auth.idToken};
  const doc = await g.loadJSON();
  return JSON.parse(doc.fields.state.stringValue);
}

// v2 (item 16): streak + tonight's film assignment
const SYLLABUS=[["kuechly-method","Kuechly's method"],["sanders-vision","Sanders: vision"],["sproles-passpro","Sproles: pass pro"],["kuechly-keys","Kuechly: guard keys"],["contact-balance","Contact balance"],["wagner-fits","Wagner: run fits"],["call-it","CALL-IT drill"],["sproles-space","Winning in space"],["warner-cover","Warner: coverage"],["self-scout","Self-scout"],["situations","Situational IQ"],["undersized-canon","The undersized canon"]];
function extraRead(S){
  let streak=0;
  for(let i=0;i<400;i++){ const d=addDays(iso(new Date()),-i);
    const c=(S.checkins||{})[d]||[];
    if(c.some(Boolean)) streak++; else if(i>0) break; }
  const done=id=>(S.events||[]).some(e=>e.type==="task"&&e.meta&&e.meta.id==="film:"+id);
  const next=SYLLABUS.find(([id])=>!done(id));
  return {streak, film: next?next[1]:"syllabus complete"};
}
function weekRead(S){
  const today = iso(new Date());
  const ws = (d=>{ const dt=new Date(d+"T12:00"); return addDays(d,-((dt.getDay()+6)%7)); })(today);
  const work = start=>{ let days=0,acts=0;
    for(let i=0;i<7;i++){ const d=addDays(start,i);
      const sets=(S.lifts||[]).filter(l=>l.d===d).length;
      const ck=((S.checkins||{})[d])||[];
      const sess=(((S.sessions||{})[d])||[]).some(Boolean);
      if(sets||sess||ck[0]) days++;
      acts+=sets+ck.filter(Boolean).length+(S.pushLog||[]).filter(p=>p.d===d).length+(S.notes||[]).filter(n=>n.d===d).length;
    } return {days,acts}; };
  const cur=work(ws), a=work(addDays(ws,-7)), b=work(addDays(ws,-14));
  return {cur, bar:{days:Math.max(a.days,b.days), acts:Math.max(a.acts,b.acts)},
    ck:(((S.checkins||{})[today])||[]).filter(Boolean).length};
}

const w = new ListWidget();
const grad = new LinearGradient();
grad.colors = [new Color("#0d1016"), new Color("#07080b")];
grad.locations = [0,1];
w.backgroundGradient = grad;
w.setPadding(14,16,12,16);

try {
  const S = await getState();
  const R = weekRead(S);
  const gate = Math.round((new Date(GATE+"T12:00") - new Date(iso(new Date())+"T12:00"))/864e5);

  const top = w.addStack(); top.centerAlignContent();
  const n = top.addText(String(gate));
  n.font = Font.heavySystemFont(44); n.textColor = AMBER; n.minimumScaleFactor = 0.5;
  top.addSpacer(8);
  const lbl = top.addStack(); lbl.layoutVertically();
  const l1 = lbl.addText("DAYS TO THE GATE"); l1.font = Font.semiboldSystemFont(10); l1.textColor = DIM;
  const l2 = lbl.addText("JUNE 15 · 2028");   l2.font = Font.semiboldSystemFont(10); l2.textColor = FAINT;

  w.addSpacer(10);
  const row = w.addStack();
  const cell = (v,k,good)=>{ const c=row.addStack(); c.layoutVertically();
    const t=c.addText(v); t.font=Font.heavySystemFont(20); t.textColor= good?AMBER:Color.white();
    const kk=c.addText(k); kk.font=Font.mediumSystemFont(9); kk.textColor=FAINT; row.addSpacer(); };
  cell(`${R.cur.days}/${R.bar.days}`,"DAYS VS BAR", R.cur.days>=R.bar.days&&R.bar.days>0);
  cell(`${R.cur.acts}/${R.bar.acts}`,"WORK VS BAR", R.cur.acts>R.bar.acts);
  cell(`${R.ck}/4`,"DAILY FOUR", R.ck===4);

  const X = extraRead(S);
  w.addSpacer(6);
  const r2 = w.addStack();
  const s1 = r2.addText((X.streak>0?X.streak+"-day streak · ":"")+"film: "+X.film);
  s1.font = Font.mediumSystemFont(10); s1.textColor = DIM; s1.lineLimit = 1;
  w.addSpacer(6);
  const f = w.addText("BEAT LAST WEEK — the bar never comes down");
  f.font = Font.mediumSystemFont(9); f.textColor = FAINT;
} catch(e) {
  const t = w.addText("D1 OS widget — "+e.message);
  t.font = Font.mediumSystemFont(11); t.textColor = DIM;
  w.addSpacer(4);
  const h = w.addText("Check CONFIG values + that sync is live (SETUP-SYNC.md)");
  h.font = Font.mediumSystemFont(9); h.textColor = FAINT;
}
Script.setWidget(w);
Script.complete();
if(config.runsInApp) w.presentMedium();
