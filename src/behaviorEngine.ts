export type HabitPlan = {
  minimum: string
  cue: string
  environment: string
  reward: string
  ifThen: string
  rationale: string
}

const first = (value: string, fallback: string) => value.trim() || fallback

/** A transparent, evidence-linked planner. It deliberately recommends only techniques
 * represented in the Habit Lab (if–then plans, stable context, environmental friction,
 * small actions, feedback) instead of making clinical or unsupported claims. */
export function buildSciencePlan(name: string, kind: 'build'|'break', cue: string, replacement = ''): HabitPlan {
  const n = name.toLowerCase()
  const anchor = first(cue.replace(/^after i\s*/i,''), kind === 'build' ? 'finish an existing daily routine' : 'notice the urge')
  if (kind === 'break') {
    const substitute = first(replacement, /scroll|phone|social/.test(n) ? 'stand up and take a two-minute screen-free break' : 'pause for two slow breaths and choose a brief alternative')
    return { minimum:'Pause before the behaviour for two minutes', cue:`When I ${anchor}`, environment:/scroll|phone|social/.test(n)?'Move the app off your home screen and keep the phone out of reach during focus time.':'Put one extra step between the trigger and the behaviour.', reward:'Mark the pause, not perfection.', ifThen:`When I ${anchor}, I will ${substitute} before deciding.`, rationale:'A specific response plan and a little more friction can make the automatic option easier to notice and interrupt.' }
  }
  if (/read|book/.test(n)) return {minimum:'Open the book and read two pages',cue:`After I ${anchor}`,environment:'Put the book exactly where the cue happens.',reward:'Tick the check-in after the two pages.',ifThen:`After I ${anchor}, I will open my book and read two pages.`,rationale:'A stable cue and a deliberately small start reduce the effort required at the moment of action.'}
  if (/study|learn|work|write|assignment/.test(n)) return {minimum:'Open the task and work for five minutes',cue:`After I ${anchor}`,environment:'Leave the document open and silence or move your phone.',reward:'A short guilt-free break after the timer.',ifThen:`After I ${anchor}, I will open the task and work for five minutes.`,rationale:'Turning a vague goal into a visible first action makes starting easier to repeat.'}
  if (/walk|run|exercise|workout|gym/.test(n)) return {minimum:'Put on your shoes and move for two minutes',cue:`After I ${anchor}`,environment:'Place your shoes or workout clothes in sight beforehand.',reward:'Choose a pleasant podcast or music only for this routine.',ifThen:`After I ${anchor}, I will put on my shoes and move for two minutes.`,rationale:'Preparing the environment and counting the smallest version removes several decisions before movement starts.'}
  if (/water|drink/.test(n)) return {minimum:'Take three sips',cue:`After I ${anchor}`,environment:'Keep a filled bottle where the cue occurs.',reward:'Watch the daily progress rise immediately.',ifThen:`After I ${anchor}, I will take three sips of water.`,rationale:'Visibility and convenience are more reliable supports than trying to remember a broad daily target.'}
  if (/sleep|bed/.test(n)) return {minimum:'Complete a two-minute wind-down action',cue:`After I ${anchor}`,environment:'Set the charger away from the bed and dim the room.',reward:'Use a calming activity you genuinely enjoy.',ifThen:`After I ${anchor}, I will plug in my phone and start my two-minute wind-down.`,rationale:'A consistent transition cue can help make the desired first step easier to notice and start.'}
  const action=first(name,'do the smallest useful action')
  return {minimum:`Start ${action} for two minutes`,cue:`After I ${anchor}`,environment:'Put the first item you need in plain sight before the cue.',reward:'Check it off as soon as the tiny version is complete.',ifThen:`After I ${anchor}, I will start ${action} for two minutes.`,rationale:'A specific cue, small action, and prepared environment support repetition without requiring perfect motivation.'}
}
