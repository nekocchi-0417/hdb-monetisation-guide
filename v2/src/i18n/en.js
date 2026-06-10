// English — source of truth. All other languages fall back to these keys.
export default {
  app: {
    title: 'Plan with your flat',
    masthead: 'A Singapore Government guide',
    back: 'Back',
    continue: 'Continue',
    skip: 'Not sure — skip',
    restart: 'Start over',
    restartConfirm: 'Start over from the beginning? Your answers will be cleared.',
    changeAnswer: 'Change an answer',
    textSize: 'Text size',
    textSizeBase: 'A',
    textSizeLarge: 'A+',
    textSizeXlarge: 'A++',
    langName: 'Language',
    stubToast: 'This language is coming soon — showing English for now.',
    progressMore: 'about {n} more question{plural}',
    progressAlmost: 'almost done',
  },

  s0: {
    eyebrow: 'HDB Retirement Planning',
    title: 'Plan with your flat',
    sub: 'Answer a few simple questions to see how your HDB flat could add to your monthly retirement income.',
    modeHeading: 'Who is this for?',
    modeSelf: "I'm planning for myself",
    modeHelper: "I'm helping my parent or relative",
    modeAdvisor: "I'm an advisor or volunteer helping someone",
    relationshipHeading: 'Who are you helping?',
    relMum: 'My mother',
    relDad: 'My father',
    relOther: 'Someone else',
    privacy: 'No login needed. Your answers stay on this phone — nothing is sent or stored.',
    singpassOptional: 'Optional: retrieve CPF balance and flat details with Singpass to skip typing',
    singpassDemo: 'DEMO',
    start: 'Start',
  },

  // Pronoun fragments resolved into the {mum} token by mode/relationship.
  pronoun: {
    self_subject: 'you', self_possessive: 'your', self_object: 'you',
    mum_subject: 'your mum', mum_possessive: "your mum's", mum_object: 'your mum',
    dad_subject: 'your dad', dad_possessive: "your dad's", dad_object: 'your dad',
    other_subject: 'your relative', other_possessive: "your relative's", other_object: 'your relative',
    advisor_subject: 'the senior', advisor_possessive: "the senior's", advisor_object: 'the senior',
  },

  // Stage placeholders — filled in as stages S1–S7 are built.
  s1: { title: 'What kind of retirement would {mum} like?' },
  s2: { title: 'Money coming in' },
  s3: { title: 'The gap' },
  s4: { title: 'Thinking about the flat' },
  s5: { title: 'A few eligibility details' },
  s6: { title: "{mum_possessive} options" },
  s7: { title: 'The plan' },
}
