export const players = [
  {
    id: "messi",
    name: "Lionel Messi",
    fullName: "Lionel Andrés Messi",
    country: "Argentina",
    countryCode: "AR",
    countryFlag: "\u{1F1E6}\u{1F1F7}",
    colors: { primary: "#75AADB", secondary: "#F6B40E" },
    position: "Forward",
    birthDate: "1987-06-24",
    ageAtTournament: 39,
    clubAtTournament: "Inter Miami",
    quote: "I enjoy football. It's what I love. It's what I've done since I was little.",
    worldCupGoals: 13,
    worldCupAssists: 8,
    worldCupApps: 26,
    wc2026: {
      group: "J",
      // Live tournament status — update one line per player after each match,
      // then push. The /status hub + its OG card regenerate from this.
      // stage ∈ group | r32 | r16 | qf | sf | final | champion | eliminated
      status: { stage: "group", alive: true, note: "Opener vs Algeria · Jun 16" },
      groupTeams: ["Argentina", "Algeria", "Austria", "Jordan"],
      matches: [
        {
          opponent: "Algeria",
          date: "2026-06-16",
          time: "9:00 PM ET",
          kickoffUtc: "2026-06-17T01:00:00.000Z",
          venue: "Arrowhead Stadium",
          city: "Kansas City",
        },
        {
          opponent: "Austria",
          date: "2026-06-21",
          time: "1:00 PM ET",
          venue: "AT&T Stadium",
          city: "Arlington, TX",
        },
        {
          opponent: "Jordan",
          date: "2026-06-25",
          time: "10:00 PM ET",
          venue: "AT&T Stadium",
          city: "Arlington, TX",
        },
      ],
      storyline:
        "Defending champions and heavy favorites — but Scaloni named a 26-man squad with six fitness concerns, Messi himself nursing a left-hamstring overload from Inter Miami. The record sixth World Cup, on American soil where he now lives. The group should be comfortable, but the knockouts await. Can he lead one more magical run?",
    },
    worldCups: [
      {
        year: 2006,
        host: "Germany",
        age: 18,
        result: "Quarter-finals",
        goals: 1,
        assists: 1,
        apps: 3,
        highlight:
          "Became Argentina's youngest-ever World Cup player and scorer",
        emoji: "\u{1F31F}",
      },
      {
        year: 2010,
        host: "South Africa",
        age: 22,
        result: "Quarter-finals",
        goals: 0,
        assists: 1,
        apps: 5,
        highlight:
          "Led Argentina's attack but couldn't break through in the knockouts",
        emoji: "\u{1F624}",
      },
      {
        year: 2014,
        host: "Brazil",
        age: 27,
        result: "Final (Runner-up)",
        goals: 4,
        assists: 1,
        apps: 7,
        highlight: "Won the Golden Ball — carried Argentina to the Final",
        emoji: "\u{1F948}",
      },
      {
        year: 2018,
        host: "Russia",
        age: 31,
        result: "Round of 16",
        goals: 1,
        assists: 2,
        apps: 4,
        highlight:
          "A stunning curler vs Nigeria saved Argentina; Mbappé and France ended the dream in the Round of 16",
        emoji: "\u{1F494}",
      },
      {
        year: 2022,
        host: "Qatar",
        age: 35,
        result: "Champion \u{1F3C6}",
        goals: 7,
        assists: 3,
        apps: 7,
        highlight:
          "Lifted the trophy at last — two goals in an all-time great Final",
        emoji: "\u{1F3C6}",
      },
      {
        year: 2026,
        host: "USA / Canada / Mexico",
        age: 39,
        result: "The Final Chapter",
        goals: null,
        assists: null,
        apps: null,
        highlight: "A record sixth World Cup — defending the title one last time",
        emoji: "\u{1FAE1}",
      },
    ],
    careerHonors: [
      "World Cup 2022",
      "8× Ballon d'Or",
      "Copa América 2021",
      "4× Champions League",
      "Finalissima 2022",
    ],
    photo: {
      src: "/players/messi.jpg",
      credit: "Hossein Zohrevand",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Lionel_Messi_WC2022.jpg",
      focus: "center 20%",
    },
    finalChapterReason:
      "He has said it himself, more than once: 2026 is the last one. The trophy lifted in Qatar finally settled the only open question. What remains is the goodbye — and the cosmic poetry that it happens on American soil, where he lives, where he plays, where the boy from Rosario built the back half of a life that already had everything.",
    milestonesAtStake: [
      {
        headline: "3 from Klose",
        detail:
          "Miroslav Klose holds the all-time World Cup goal record at 16. Messi enters with 13 — three short, with up to seven matches left to find them.",
      },
      {
        headline: "Sixth World Cup",
        detail:
          "No outfield player has ever played in six World Cups. The previous record of five was shared by Rafa Márquez, Cristiano Ronaldo, and Messi himself. In 2026, only Messi and Ronaldo will reach six — the historic first.",
      },
      {
        headline: "Most WC appearances ever",
        detail:
          "26 World Cup appearances and counting. Lothar Matthäus held the record at 25 before Messi passed him in Qatar. Every minute on the pitch widens the gap.",
      },
    ],
    bio: "The greatest player of all time returns for a record sixth World Cup. At 39, Messi has nothing left to prove — he won it all in Qatar. But the magic of a home-continent tournament, on American soil where he now lives and plays for Inter Miami, is too poetic to resist. Argentina open their title defense in Kansas City before heading to Dallas. This is his farewell.",
    relatedPlayers: [
      { id: "neymar", relation: "Barcelona & PSG teammate" },
    ],
    faqs: [
      {
        q: "Is 2026 Lionel Messi's last World Cup?",
        a: "Yes. Messi has said repeatedly that the 2026 World Cup will be his last. At 39 it is his record sixth tournament — a farewell staged on American soil, where he lives and plays for Inter Miami.",
      },
      {
        q: "How many World Cups has Lionel Messi played in?",
        a: "2026 is Messi's sixth World Cup (2006, 2010, 2014, 2018, 2022, 2026). No outfield player in history has ever appeared in six.",
      },
      {
        q: "How many World Cup goals does Messi have?",
        a: "Messi has 13 World Cup goals across five tournaments — three short of Miroslav Klose's all-time record of 16, with up to seven matches to close the gap.",
      },
      {
        q: "Will Messi play in the 2026 World Cup?",
        a: "Yes. Argentina qualified as reigning champions and Messi, still their captain and talisman, is set to lead them. At 39 it is his sixth and final World Cup — Argentina open Group J against Algeria in Kansas City on June 16, 2026.",
      },
      {
        q: "What group is Argentina in at the 2026 World Cup?",
        a: "Argentina are in Group J with Algeria, Austria, and Jordan. They open against Algeria at Arrowhead Stadium in Kansas City on June 16, 2026.",
      },
    ],
  },
  {
    id: "ronaldo",
    name: "Cristiano Ronaldo",
    fullName: "Cristiano Ronaldo dos Santos Aveiro",
    country: "Portugal",
    countryCode: "PT",
    countryFlag: "\u{1F1F5}\u{1F1F9}",
    colors: { primary: "#D52B1E", secondary: "#046A38" },
    position: "Forward",
    birthDate: "1985-02-05",
    ageAtTournament: 41,
    clubAtTournament: "Al Nassr",
    quote: "Your love makes me strong, your hate makes me unstoppable.",
    worldCupGoals: 8,
    worldCupAssists: 2,
    worldCupApps: 22,
    wc2026: {
      group: "K",
      status: { stage: "group", alive: true, note: "Opener vs DR Congo · Jun 17" },
      groupTeams: ["Portugal", "DR Congo", "Uzbekistan", "Colombia"],
      matches: [
        {
          opponent: "DR Congo",
          date: "2026-06-17",
          time: "TBD",
          kickoffUtc: null,
          venue: "NRG Stadium",
          city: "Houston, TX",
        },
        {
          opponent: "Uzbekistan",
          date: "2026-06-23",
          time: "TBD",
          venue: "NRG Stadium",
          city: "Houston, TX",
        },
        {
          opponent: "Colombia",
          date: "2026-06-27",
          time: "TBD",
          venue: "Hard Rock Stadium",
          city: "Miami, FL",
        },
      ],
      storyline:
        "At 41, Ronaldo will be the oldest outfield player in the tournament — and he arrives as the Nations League's top scorer with Portugal as reigning champions. Martinez named him in a 27+1 squad, the symbolic +1 in memory of the late Diogo Jota. Group K offers a tricky Colombia clash, but the real question is whether the ultimate competitor can finally lift the one trophy that has always eluded him.",
    },
    worldCups: [
      {
        year: 2006,
        host: "Germany",
        age: 21,
        result: "Semi-finals",
        goals: 1,
        assists: 1,
        apps: 6,
        highlight:
          "Announced himself on the world stage — Portugal's best run in decades",
        emoji: "⚡",
      },
      {
        year: 2010,
        host: "South Africa",
        age: 25,
        result: "Round of 16",
        goals: 1,
        assists: 1,
        apps: 4,
        highlight: "Fell to Spain in the Round of 16",
        emoji: "\u{1F61E}",
      },
      {
        year: 2014,
        host: "Brazil",
        age: 29,
        result: "Group Stage",
        goals: 1,
        assists: 0,
        apps: 3,
        highlight: "Struggled with injuries as Portugal exited early",
        emoji: "\u{1F915}",
      },
      {
        year: 2018,
        host: "Russia",
        age: 33,
        result: "Round of 16",
        goals: 4,
        assists: 0,
        apps: 4,
        highlight:
          "Hat-trick vs Spain — one of the greatest World Cup performances ever",
        emoji: "\u{1F525}",
      },
      {
        year: 2022,
        host: "Qatar",
        age: 37,
        result: "Quarter-finals",
        goals: 1,
        assists: 0,
        apps: 5,
        highlight: "Tears after Morocco defeat — feared it was the end",
        emoji: "\u{1F622}",
      },
      {
        year: 2026,
        host: "USA / Canada / Mexico",
        age: 41,
        result: "The Final Chapter",
        goals: null,
        assists: null,
        apps: null,
        highlight:
          "Defying age one final time — the ultimate competitor refuses to leave",
        emoji: "\u{1FAE1}",
      },
    ],
    careerHonors: [
      "5× Champions League",
      "5× Ballon d'Or",
      "Euro 2016",
      "Nations League 2019",
      "All-time international top scorer (130+ goals)",
    ],
    photo: {
      src: "/players/ronaldo.jpg",
      credit: "Анна Нэсси (Anna Nessi)",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_2018.jpg",
      focus: "center 25%",
    },
    finalChapterReason:
      "He turned 41 in February. The tears in Doha — at 37, with no trophy, against Morocco — looked like the end. They weren't. The only honor missing from his cabinet is the World Cup, and the most relentless career football has ever produced isn't leaving that box unchecked without one more fight.",
    milestonesAtStake: [
      {
        headline: "Score in 6 different World Cups",
        detail:
          "Ronaldo is the only man to have scored in five different World Cups (2006, 2010, 2014, 2018, 2022). A sixth would extend a record nobody else is anywhere near.",
      },
      {
        headline: "Oldest at the tournament",
        detail:
          "At 41, the oldest outfield player in the field. Roger Milla scored at 42 for Cameroon in 1994 — Ronaldo could become the second-oldest scorer in World Cup history.",
      },
      {
        headline: "The only one missing",
        detail:
          "Five Champions Leagues. Five Ballons d'Or. A European Championship. A Nations League. The all-time international scoring record. The World Cup is the one trophy his cabinet still doesn't hold.",
      },
    ],
    bio: "At 41, Cristiano Ronaldo will be the oldest outfield player at the 2026 World Cup — and he's heading into his sixth tournament. The all-time international goalscorer has defied every prediction about his decline. His tears in Qatar told the story — this World Cup dream remains unfinished. Portugal start in Houston before a crucial Colombia test in Miami.",
    relatedPlayers: [
      { id: "modric", relation: "Real Madrid teammate" },
    ],
    faqs: [
      {
        q: "Is 2026 Cristiano Ronaldo's last World Cup?",
        a: "Almost certainly. At 41 Ronaldo will be the oldest outfield player at the 2026 World Cup, his record sixth tournament — widely expected to be his final one.",
      },
      {
        q: "Has Cristiano Ronaldo ever won the World Cup?",
        a: "No. The World Cup is the one major trophy missing from Ronaldo's cabinet; his best run was the 2006 semi-finals. Portugal arrive in 2026 as reigning Nations League champions.",
      },
      {
        q: "How many World Cup goals does Ronaldo have?",
        a: "Ronaldo has 8 World Cup goals and is the only player to have scored in five different World Cups. A goal in 2026 would stretch that record to six.",
      },
      {
        q: "Will Cristiano Ronaldo play in the 2026 World Cup?",
        a: "Yes. Portugal have qualified and Ronaldo, at 41 the tournament's oldest outfield player, captains the side into his record-equalling sixth World Cup. Portugal are in Group K with DR Congo, Uzbekistan, and Colombia.",
      },
      {
        q: "What group is Portugal in at the 2026 World Cup?",
        a: "Portugal are in Group K with DR Congo, Uzbekistan, and Colombia. They open against DR Congo at NRG Stadium in Houston.",
      },
    ],
  },
  {
    id: "modric",
    name: "Luka Modrić",
    fullName: "Luka Modrić",
    country: "Croatia",
    countryCode: "HR",
    countryFlag: "\u{1F1ED}\u{1F1F7}",
    colors: { primary: "#E32119", secondary: "#1465B7" },
    position: "Midfielder",
    birthDate: "1985-09-09",
    ageAtTournament: 40,
    clubAtTournament: "AC Milan",
    quote: "I'm not the biggest, the strongest, or the fastest. But I have something others don't — the ball is my friend.",
    worldCupGoals: 3,
    worldCupAssists: 2,
    worldCupApps: 19,
    wc2026: {
      group: "L",
      status: { stage: "group", alive: true, note: "Opener vs England · Jun 17" },
      groupTeams: ["England", "Croatia", "Ghana", "Panama"],
      matches: [
        {
          opponent: "England",
          date: "2026-06-17",
          time: "4:00 PM ET",
          kickoffUtc: "2026-06-17T20:00:00.000Z",
          venue: "AT&T Stadium",
          city: "Dallas, TX",
        },
        {
          opponent: "Panama",
          date: "2026-06-23",
          time: "7:00 PM ET",
          venue: "BMO Field",
          city: "Toronto",
        },
        {
          opponent: "Ghana",
          date: "2026-06-27",
          time: "5:00 PM ET",
          venue: "Lincoln Financial Field",
          city: "Philadelphia, PA",
        },
      ],
      storyline:
        "Drawn into a blockbuster Group L with England. The opener in Dallas is a rematch of their classic 2018 semi-final. At 40, Modrić knows this group could be his last stand — or the launchpad for one more Croatia miracle run.",
    },
    worldCups: [
      {
        year: 2006,
        host: "Germany",
        age: 20,
        result: "Group Stage",
        goals: 0,
        assists: 0,
        apps: 2,
        highlight:
          "A young Modrić's first taste of the World Cup — brief but formative",
        emoji: "\u{1F331}",
      },
      {
        year: 2014,
        host: "Brazil",
        age: 28,
        result: "Group Stage",
        goals: 1,
        assists: 0,
        apps: 3,
        highlight: "Scored a stunner in the opener but Croatia fell short",
        emoji: "\u{1F4AB}",
      },
      {
        year: 2018,
        host: "Russia",
        age: 32,
        result: "Final (Runner-up)",
        goals: 2,
        assists: 1,
        apps: 7,
        highlight:
          "Won the Golden Ball — dragged Croatia to an unforgettable Final",
        emoji: "\u{1F947}",
      },
      {
        year: 2022,
        host: "Qatar",
        age: 37,
        result: "Semi-finals (3rd place)",
        goals: 0,
        assists: 1,
        apps: 7,
        highlight:
          "Still pulling strings at 37 — Croatia's heartbeat once again",
        emoji: "\u{1FAB6}",
      },
      {
        year: 2026,
        host: "USA / Canada / Mexico",
        age: 40,
        result: "The Final Chapter",
        goals: null,
        assists: null,
        apps: null,
        highlight:
          "Group L opener vs England in Dallas — the maestro's final symphony",
        emoji: "\u{1FAE1}",
      },
    ],
    careerHonors: [
      "2018 Ballon d'Or",
      "2018 Golden Ball",
      "5× Champions League",
      "World Cup Runner-up 2018",
      "Croatia's greatest-ever player",
    ],
    photo: {
      src: "/players/modric-wc18.jpg",
      credit: "Светлана Бекетова (Svetlana Beketova)",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Modri%C4%87_World_Cup_2018.jpg",
      focus: "center 10%",
    },
    finalChapterReason:
      "At 40, in his fifth World Cup, on the back of a Final and a third-place finish no other Croatian generation will ever reach again. Real Madrid let him go after 13 years; Milan took him. Schira reported in May 2026 that he's set to retire from professional football after the tournament. Croatia's golden midfield convenes one more time — knowing, this time, it will not convene again.",
    milestonesAtStake: [
      {
        headline: "Fifth World Cup at 40",
        detail:
          "Croatia missed 2010 qualifying, so Modrić's count is one short of the Messi/Ronaldo cohort. But captaining Croatia at his fifth World Cup at 40 puts him in a tiny club — only a handful of midfielders have ever played five.",
      },
      {
        headline: "Croatia's iron man",
        detail:
          "19 World Cup appearances — already a Croatian record. Every minute he plays extends the books for a country of four million.",
      },
      {
        headline: "Third major run in a row",
        detail:
          "2018: Golden Ball, World Cup Final. 2022: third place. No Croatian generation has come close to this. The maestro gets one last conducting opportunity.",
      },
    ],
    bio: "The boy who grew up in a war-torn village, who was told he was too small and too frail, became the most elegant midfielder of his generation. At 40, Modrić is now at AC Milan — still dictating games with his vision and touch. Croatia open against England in Dallas in a Group L blockbuster. This will be the last time.",
    relatedPlayers: [
      { id: "ronaldo", relation: "Real Madrid teammate" },
    ],
    faqs: [
      {
        q: "Is 2026 Luka Modrić's last World Cup?",
        a: "Yes. At 40 the 2026 World Cup is Modrić's last, and reports indicate he plans to retire from professional football after the tournament.",
      },
      {
        q: "How many World Cups has Luka Modrić played in?",
        a: "2026 is Modrić's fifth World Cup (2006, 2014, 2018, 2022, 2026). Croatia missed 2010 qualifying, so his count is one behind the Messi and Ronaldo cohort.",
      },
      {
        q: "What is Modrić's best World Cup finish?",
        a: "Runner-up in 2018, when he won the Golden Ball as the tournament's best player. Croatia then finished third in 2022.",
      },
      {
        q: "Will Luka Modrić play in the 2026 World Cup?",
        a: "Yes. Croatia have qualified and Modrić, their captain, is set for his fifth World Cup at 40 — Croatia missed 2010 qualifying, so it is one fewer than the Messi–Ronaldo cohort. They are in Group L with England, Ghana, and Panama.",
      },
      {
        q: "What group is Croatia in at the 2026 World Cup?",
        a: "Croatia are in Group L with England, Ghana, and Panama. The opener against England in Dallas is a rematch of their 2018 semi-final.",
      },
    ],
  },
  {
    id: "neymar",
    name: "Neymar Jr",
    fullName: "Neymar da Silva Santos Júnior",
    country: "Brazil",
    countryCode: "BR",
    countryFlag: "\u{1F1E7}\u{1F1F7}",
    colors: { primary: "#FFDF00", secondary: "#009739" },
    position: "Forward",
    birthDate: "1992-02-05",
    ageAtTournament: 34,
    clubAtTournament: "Santos",
    quote: "There is no pressure when you are making a dream come true.",
    worldCupGoals: 8,
    worldCupAssists: 3,
    worldCupApps: 13,
    wc2026: {
      group: "C",
      status: { stage: "group", alive: true, note: "Opener vs Morocco · Jun 13" },
      groupTeams: ["Brazil", "Morocco", "Haiti", "Scotland"],
      matches: [
        {
          opponent: "Morocco",
          date: "2026-06-13",
          time: "6:00 PM ET",
          kickoffUtc: "2026-06-13T22:00:00.000Z",
          venue: "MetLife Stadium",
          city: "New York / New Jersey",
        },
        {
          opponent: "Haiti",
          date: "2026-06-19",
          time: "9:00 PM ET",
          venue: "Lincoln Financial Field",
          city: "Philadelphia, PA",
        },
        {
          opponent: "Scotland",
          date: "2026-06-24",
          time: "6:00 PM ET",
          venue: "Hard Rock Stadium",
          city: "Miami, FL",
        },
      ],
      storyline:
        "Named in Ancelotti's 26-man squad — then ruled out of the Morocco opener with a grade 2 calf tear (May 2026, 2–3 weeks). Brazil should have him back for the rest of the group stage. At 34, Brazil's all-time top scorer is fighting his body one more time for a goodbye three campaigns of heartbreak never gave him.",
    },
    worldCups: [
      {
        year: 2014,
        host: "Brazil",
        age: 22,
        result: "Semi-finals",
        goals: 4,
        assists: 1,
        apps: 5,
        highlight:
          "Carried Brazil on home soil until a broken back against Colombia ended his tournament",
        emoji: "\u{1F494}",
      },
      {
        year: 2018,
        host: "Russia",
        age: 26,
        result: "Quarter-finals",
        goals: 2,
        assists: 0,
        apps: 5,
        highlight:
          "Scored twice but Belgium ended the dream in the quarter-finals",
        emoji: "\u{1F624}",
      },
      {
        year: 2022,
        host: "Qatar",
        age: 30,
        result: "Quarter-finals",
        goals: 2,
        assists: 2,
        apps: 3,
        highlight:
          "Returned from an ankle injury to score vs South Korea and a stunner vs Croatia in extra time — then heartbreak on penalties",
        emoji: "\u{1F622}",
      },
      {
        year: 2026,
        host: "USA / Canada / Mexico",
        age: 34,
        result: "The Final Chapter",
        goals: null,
        assists: null,
        apps: null,
        highlight:
          "Back from ACL surgery — Brazil's all-time top scorer seeks his World Cup moment",
        emoji: "\u{1FAE1}",
      },
    ],
    careerHonors: [
      "Champions League 2015",
      "Copa Libertadores 2011",
      "Olympic Gold 2016",
      "Brazil's all-time top scorer (79 goals)",
      "Ligue 1 Player of the Year 2017-18",
    ],
    photo: {
      src: "/players/neymar-wc18.jpg",
      credit: "Julia Engel (Granada)",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:20180610_FIFA_Friendly_Match_Austria_vs._Brazil_Neymar_850_1705.jpg",
      focus: "center 22%",
    },
    finalChapterReason:
      "Three World Cups, three heartbreaks. A fractured vertebra in 2014. Belgium in 2018. Penalties to Croatia in 2022. Now 34 and rebuilt from an ACL tear, back at Santos where he started. Ancelotti named him anyway. Brazil's all-time leading scorer gets one last tournament where — God willing — the body holds and the moment is finally his.",
    milestonesAtStake: [
      {
        headline: "4 from Pelé",
        detail:
          "Pelé scored 12 World Cup goals for Brazil. Neymar enters with 8 — four short of tying the king on Brazil's own record book.",
      },
      {
        headline: "Brazil's all-time top scorer",
        detail:
          "79 international goals — already past Pelé in the overall count. Every Neymar goal in 2026 is uncharted Brazilian territory.",
      },
      {
        headline: "A first World Cup, period",
        detail:
          "Three campaigns, three quarter- or semi-final exits. The most gifted Brazilian generation since the 70s has never won. This is almost certainly the last opportunity for this group.",
      },
    ],
    bio: "Three World Cups. Three heartbreaks. A broken back in 2014, Belgium in 2018, penalties against Croatia in 2022 (despite a stunner of his own in extra time). Now 34 and back at Santos after a grueling ACL recovery, Neymar was a surprise inclusion in Carlo Ancelotti's Brazil squad — then ruled out of the Morocco opener two weeks before kickoff with a grade 2 calf tear. Brazil should have him back for the knockouts if they advance. The body has fought him at every World Cup. Brazil's all-time leading scorer is fighting it one more time for the goodbye three campaigns of heartbreak never let him have.",
    relatedPlayers: [
      { id: "messi", relation: "Barcelona & PSG teammate" },
    ],
    faqs: [
      {
        q: "Is 2026 Neymar's last World Cup?",
        a: "At 34 and rebuilt from an ACL injury, the 2026 World Cup is widely expected to be Neymar's last — the goodbye three previous campaigns of injury and heartbreak never gave him.",
      },
      {
        q: "Is Neymar in Brazil's 2026 World Cup squad?",
        a: "Yes. Carlo Ancelotti named Neymar in the 26-man squad, though a grade 2 calf tear rules him out of the opener against Morocco. Brazil expect him back for the rest of the group stage.",
      },
      {
        q: "How many World Cup goals does Neymar have?",
        a: "Neymar has 8 World Cup goals across three tournaments — four short of Pelé's Brazil record of 12.",
      },
      {
        q: "Will Neymar play in the 2026 World Cup?",
        a: "Yes, though not from the opening match. Carlo Ancelotti included Neymar in Brazil's squad, but a calf tear sidelines him for the opener against Morocco; Brazil expect him back during the group stage of what is likely his final World Cup at 34.",
      },
      {
        q: "What group is Brazil in at the 2026 World Cup?",
        a: "Brazil are in Group C with Morocco, Haiti, and Scotland. They open against Morocco at MetLife Stadium in New York/New Jersey.",
      },
    ],
  },
  {
    id: "debruyne",
    name: "Kevin De Bruyne",
    fullName: "Kevin De Bruyne",
    country: "Belgium",
    countryCode: "BE",
    countryFlag: "\u{1F1E7}\u{1F1EA}",
    colors: { primary: "#E30613", secondary: "#FDDA24" },
    position: "Midfielder",
    birthDate: "1991-06-28",
    ageAtTournament: 35,
    clubAtTournament: "Napoli",
    quote: "I don't play for individual awards. I play to win with my team.",
    worldCupGoals: 2,
    worldCupAssists: 3,
    worldCupApps: 15,
    wc2026: {
      group: "G",
      status: { stage: "group", alive: true, note: "Opener vs Egypt · Jun 16" },
      groupTeams: ["Belgium", "Egypt", "Iran", "New Zealand"],
      matches: [
        {
          opponent: "Egypt",
          date: "2026-06-16",
          time: "TBD",
          kickoffUtc: null,
          venue: "TBD",
          city: "TBD",
        },
        {
          opponent: "Iran",
          date: "2026-06-22",
          time: "TBD",
          venue: "TBD",
          city: "TBD",
        },
        {
          opponent: "New Zealand",
          date: "2026-06-26",
          time: "TBD",
          venue: "TBD",
          city: "TBD",
        },
      ],
      storyline:
        "The last sentinel of Belgium's Golden Generation. With Hazard, Kompany, and others gone, De Bruyne captains a transitional squad into Group G. He was Belgium's top scorer in qualifying with six goals. At 35, this is almost certainly his final World Cup — and Belgium's last chance to deliver on a decade of promise.",
    },
    worldCups: [
      {
        year: 2014,
        host: "Brazil",
        age: 23,
        result: "Quarter-finals",
        goals: 1,
        assists: 1,
        apps: 5,
        highlight:
          "Extra-time winner vs USA in the Round of 16 — Belgium's Golden Generation arrives",
        emoji: "⚡",
      },
      {
        year: 2018,
        host: "Russia",
        age: 27,
        result: "Semi-finals (3rd place)",
        goals: 1,
        assists: 2,
        apps: 7,
        highlight:
          "Stunning strike vs Brazil — Belgium's best-ever World Cup finish",
        emoji: "\u{1F949}",
      },
      {
        year: 2022,
        host: "Qatar",
        age: 31,
        result: "Group Stage",
        goals: 0,
        assists: 0,
        apps: 3,
        highlight:
          "A shocking group-stage exit — the Golden Generation crumbled",
        emoji: "\u{1F494}",
      },
      {
        year: 2026,
        host: "USA / Canada / Mexico",
        age: 35,
        result: "The Final Chapter",
        goals: null,
        assists: null,
        apps: null,
        highlight:
          "The last of Belgium's Golden Generation — captaining one final campaign",
        emoji: "\u{1FAE1}",
      },
    ],
    careerHonors: [
      "6× Premier League",
      "Champions League 2023",
      "2× PL Player of the Season",
      "World Cup 3rd place 2018",
      "Belgium's qualifying top scorer 2026",
    ],
    photo: {
      src: "/players/debruyne.jpg",
      credit: "Bryan Berlin",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Kevin_De_Bruyne_USMNT_v_Belgium_Mar_28_2026-64_(cropped).jpg",
      focus: "center 25%",
    },
    finalChapterReason:
      "Hazard retired. Kompany coaches now. Vermaelen, Vertonghen — gone. Witsel came out of international retirement just to ride along. De Bruyne is the last torchbearer of Belgium's Golden Generation: the most-hyped, most-talented, most-disappointing group in the country's history. Third in 2018 was the ceiling. At 35, in his fourth World Cup, the captain gets one final chance to write the ending the generation deserved but never got.",
    milestonesAtStake: [
      {
        headline: "Belgium's first World Cup",
        detail:
          "Belgium have never won a World Cup. Best finish: third in 2018. The Golden Generation gets one final swing at delivering the trophy a decade of talent kept just out of reach.",
      },
      {
        headline: "The last man standing",
        detail:
          "Hazard, Kompany, Vermaelen, Vertonghen — all gone. KDB captains a transitional Belgium into a tournament that almost certainly has no Belgian veterans next time.",
      },
      {
        headline: "Top scorer in qualifying",
        detail:
          "Six goals in qualifying — Belgium's leading marksman as a midfielder, at 35. The talent hasn't gone anywhere; this is the last campaign with it.",
      },
    ],
    bio: "The most creative midfielder in the world for the last decade, De Bruyne is the last man standing from Belgium's vaunted Golden Generation. Hazard retired. Kompany became a manager. Lukaku is there but diminished. At 35, De Bruyne captains a younger squad into what will almost certainly be his final tournament. Belgium have never won a World Cup — and the window is closing.",
    faqs: [
      {
        q: "Is 2026 Kevin De Bruyne's last World Cup?",
        a: "Almost certainly. At 35 De Bruyne is the last torchbearer of Belgium's Golden Generation, and 2026 is widely expected to be his final World Cup.",
      },
      {
        q: "How many World Cups has Kevin De Bruyne played in?",
        a: "2026 is De Bruyne's fourth World Cup (2014, 2018, 2022, 2026). Belgium's best finish in that span was third place in 2018.",
      },
      {
        q: "Has Belgium ever won the World Cup?",
        a: "No. Belgium's best-ever finish is third place in 2018. De Bruyne captains a transitional squad in what may be the Golden Generation's last real chance.",
      },
      {
        q: "Will Kevin De Bruyne play in the 2026 World Cup?",
        a: "Yes. Belgium have qualified — with De Bruyne their top scorer in qualifying, six goals from midfield — and at 35, now with Napoli, he captains them into what is likely his fourth and final World Cup. Belgium are in Group G with Egypt, Iran, and New Zealand.",
      },
      {
        q: "What group is Belgium in at the 2026 World Cup?",
        a: "Belgium are in Group G with Egypt, Iran, and New Zealand. De Bruyne was Belgium's top scorer in qualifying with six goals.",
      },
    ],
  },
];

// Tournament-wide data
export const tournament = {
  name: "FIFA World Cup 2026",
  tagline: "The first 48-team World Cup",
  hosts: ["United States", "Canada", "Mexico"],
  format: "48 teams, 12 groups of 4, top 2 + 8 best 3rd-place advance to Round of 32",
  openingMatch: {
    date: "2026-06-11",
    time: "13:00",
    timezone: "America/Mexico_City",
    kickoffUtc: "2026-06-11T19:00:00.000Z",
    teams: "Mexico vs South Africa",
    venue: "Estadio Azteca",
    city: "Mexico City",
  },
  final: {
    date: "2026-07-19",
    venue: "MetLife Stadium",
    city: "New York / New Jersey",
  },
  hostCities: [
    { city: "Vancouver", country: "Canada", venue: "BC Place" },
    { city: "Seattle", country: "USA", venue: "Lumen Field" },
    { city: "San Francisco", country: "USA", venue: "Levi's Stadium" },
    { city: "Los Angeles", country: "USA", venue: "SoFi Stadium" },
    { city: "Guadalajara", country: "Mexico", venue: "Estadio Akron" },
    { city: "Mexico City", country: "Mexico", venue: "Estadio Azteca" },
    { city: "Monterrey", country: "Mexico", venue: "Estadio BBVA" },
    { city: "Houston", country: "USA", venue: "NRG Stadium" },
    { city: "Dallas", country: "USA", venue: "AT&T Stadium" },
    { city: "Kansas City", country: "USA", venue: "Arrowhead Stadium" },
    { city: "Atlanta", country: "USA", venue: "Mercedes-Benz Stadium" },
    { city: "Miami", country: "USA", venue: "Hard Rock Stadium" },
    { city: "Toronto", country: "Canada", venue: "BMO Field" },
    { city: "Boston", country: "USA", venue: "Gillette Stadium" },
    { city: "Philadelphia", country: "USA", venue: "Lincoln Financial Field" },
    {
      city: "New York / New Jersey",
      country: "USA",
      venue: "MetLife Stadium",
    },
  ],
  keyDates: [
    { date: "2026-06-11", event: "Opening Match — Mexico City" },
    { date: "2026-06-11", event: "Group Stage begins" },
    { date: "2026-06-27", event: "Group Stage ends" },
    { date: "2026-06-28", event: "Round of 32 begins" },
    { date: "2026-07-05", event: "Round of 16" },
    { date: "2026-07-11", event: "Quarter-finals" },
    { date: "2026-07-15", event: "Semi-finals (Dallas & Atlanta)" },
    { date: "2026-07-19", event: "Final — MetLife Stadium, NJ" },
  ],

  // Full 48-team group draw (held Dec 5, 2025, Kennedy Center, Washington DC).
  // Single source of truth for the group-stage grid on /world-cup-2026-groups.
  // Teams listed in pot/seeding order. `host: true` marks the three host nations
  // whose slots were predetermined (Mexico A1, Canada B1, USA D1). The five
  // legends' groups (C, G, J, K, L) match each player's wc2026.groupTeams — the
  // grid highlights them by cross-referencing players[].wc2026.group, so do NOT
  // duplicate a "legend" flag here. Verified June 2026 vs FIFA + Wikipedia.
  groups: [
    {
      id: "A",
      teams: [
        { name: "Mexico", flag: "🇲🇽", host: true },
        { name: "South Africa", flag: "🇿🇦" },
        { name: "South Korea", flag: "🇰🇷" },
        { name: "Czechia", flag: "🇨🇿" },
      ],
    },
    {
      id: "B",
      teams: [
        { name: "Canada", flag: "🇨🇦", host: true },
        { name: "Bosnia & Herzegovina", flag: "🇧🇦" },
        { name: "Qatar", flag: "🇶🇦" },
        { name: "Switzerland", flag: "🇨🇭" },
      ],
    },
    {
      id: "C",
      teams: [
        { name: "Brazil", flag: "🇧🇷" },
        { name: "Morocco", flag: "🇲🇦" },
        { name: "Haiti", flag: "🇭🇹" },
        { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
      ],
    },
    {
      id: "D",
      teams: [
        { name: "United States", flag: "🇺🇸", host: true },
        { name: "Paraguay", flag: "🇵🇾" },
        { name: "Australia", flag: "🇦🇺" },
        { name: "Türkiye", flag: "🇹🇷" },
      ],
    },
    {
      id: "E",
      teams: [
        { name: "Germany", flag: "🇩🇪" },
        { name: "Curaçao", flag: "🇨🇼" },
        { name: "Ivory Coast", flag: "🇨🇮" },
        { name: "Ecuador", flag: "🇪🇨" },
      ],
    },
    {
      id: "F",
      teams: [
        { name: "Netherlands", flag: "🇳🇱" },
        { name: "Japan", flag: "🇯🇵" },
        { name: "Sweden", flag: "🇸🇪" },
        { name: "Tunisia", flag: "🇹🇳" },
      ],
    },
    {
      id: "G",
      teams: [
        { name: "Belgium", flag: "🇧🇪" },
        { name: "Egypt", flag: "🇪🇬" },
        { name: "Iran", flag: "🇮🇷" },
        { name: "New Zealand", flag: "🇳🇿" },
      ],
    },
    {
      id: "H",
      teams: [
        { name: "Spain", flag: "🇪🇸" },
        { name: "Cape Verde", flag: "🇨🇻" },
        { name: "Saudi Arabia", flag: "🇸🇦" },
        { name: "Uruguay", flag: "🇺🇾" },
      ],
    },
    {
      id: "I",
      teams: [
        { name: "France", flag: "🇫🇷" },
        { name: "Senegal", flag: "🇸🇳" },
        { name: "Iraq", flag: "🇮🇶" },
        { name: "Norway", flag: "🇳🇴" },
      ],
    },
    {
      id: "J",
      teams: [
        { name: "Argentina", flag: "🇦🇷" },
        { name: "Algeria", flag: "🇩🇿" },
        { name: "Austria", flag: "🇦🇹" },
        { name: "Jordan", flag: "🇯🇴" },
      ],
    },
    {
      id: "K",
      teams: [
        { name: "Portugal", flag: "🇵🇹" },
        { name: "DR Congo", flag: "🇨🇩" },
        { name: "Uzbekistan", flag: "🇺🇿" },
        { name: "Colombia", flag: "🇨🇴" },
      ],
    },
    {
      id: "L",
      teams: [
        { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
        { name: "Croatia", flag: "🇭🇷" },
        { name: "Ghana", flag: "🇬🇭" },
        { name: "Panama", flag: "🇵🇦" },
      ],
    },
  ],

  // Tournament-format FAQ — the 2026 edition is the most-changed in World Cup
  // history (48 teams, a new Round of 32, the best-third-place rule), and search
  // demand for "how does it work" is huge. These mirror the on-page Q&A in
  // app/page.js and feed a FAQPage JSON-LD block. Facts verified June 2026
  // against FIFA + ESPN; cross-check against keyDates above before editing.
  faqs: [
    {
      q: "How is the 2026 World Cup different from previous tournaments?",
      a: "It's the first 48-team World Cup, up from 32. The teams are split into 12 groups of four and play 104 matches in total — far more than the 64 of past editions — across 16 cities in three host nations, the USA, Canada and Mexico. It also introduces a Round of 32, a knockout round that has never existed before.",
    },
    {
      q: "How many matches does each team play?",
      a: "Every team still plays three group-stage games, one against each of the other sides in its group — the same as it has always been. What changes is the run to the trophy: a team that reaches the final now plays eight matches in total rather than the seven needed in 2022, because of the extra knockout round.",
    },
    {
      q: "How do teams qualify for the knockout stage?",
      a: "The top two teams in each of the 12 groups go through automatically — that's 24 teams. They're joined by the eight best third-placed teams from across all the groups, making 32 in total. The eight are ranked by points, then goal difference, then goals scored, so a strong third-place finish is no longer an automatic exit.",
    },
    {
      q: "What is the new Round of 32?",
      a: "It's a brand-new opening knockout round — the first time in World Cup history that 32 teams reach the bracket. The knockout path now runs Round of 32, Round of 16, quarter-finals, semi-finals and final, instead of starting at the Round of 16 as it did when only 16 teams advanced.",
    },
    {
      q: "Can a team win its group and still be eliminated?",
      a: "No. Every group winner and every runner-up is guaranteed a place in the Round of 32. The only teams left sweating the math are those finishing third: just the eight best of the twelve third-placed sides advance, so a third-place team in a tough group can still be sent home.",
    },
    {
      q: "When does the group stage end and the knockouts begin?",
      a: "The group stage runs from the opening match on June 11 through June 27. The knockout rounds begin on June 28 and build to the final at MetLife Stadium, New Jersey, on July 19, 2026.",
    },
    {
      q: "Could one of the legends' nations finish third and still advance?",
      a: "Yes — and the new format could be a lifeline for them. With eight of the twelve third-placed teams going through, a side like Modrić's Croatia, De Bruyne's Belgium or Ronaldo's Portugal can drop a group game and still reach the knockouts on points. It's the rule most likely to keep a legend's final chapter alive beyond the group stage.",
    },
  ],
};

export function getPlayerById(id) {
  return players.find((p) => p.id === id);
}

export function getPlayerSlugs() {
  return players.map((p) => p.id);
}

// --- Tournament-status helpers (drive the /status "Who's Still Standing" hub) ---

// The knockout ladder, in order. Index = how far a player has progressed.
// "champion" sits one past "final"; "eliminated" is terminal and off-ladder.
export const STAGE_ORDER = ["group", "r32", "r16", "qf", "sf", "final", "champion"];

const STAGE_LABELS = {
  group: "Group Stage",
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter-final",
  sf: "Semi-final",
  final: "Final",
  champion: "Champion",
  eliminated: "Eliminated",
};

// Short labels for the compact progress track on the card.
export const STAGE_SHORT = {
  group: "Grp",
  r32: "R32",
  r16: "R16",
  qf: "QF",
  sf: "SF",
  final: "F",
  champion: "🏆",
};

export function stageLabel(stage) {
  return STAGE_LABELS[stage] || "Group Stage";
}

// Index of a player's furthest stage on STAGE_ORDER (eliminated players still
// report the stage they reached). Defaults to 0 (group) when unknown.
export function stageIndex(stage) {
  const i = STAGE_ORDER.indexOf(stage);
  return i === -1 ? 0 : i;
}

// The single answer-led Q&A that drives the player page's status banner, the
// dynamic <title>, and the per-player FAQ/JSON-LD status entry. The shape is
// always { q, a, alive } so callers can render one consistent block whatever
// phase the tournament is in.
//
//   pre-tournament / group  → "Is X playing in the 2026 World Cup?" · Yes, Group G
//   advanced (alive, > group) → "Is X still in the 2026 World Cup?" · Yes, reached the QF
//   eliminated              → "Is X out of the 2026 World Cup?" · Yes, knocked out at the R16
//   champion                → "Did X win the 2026 World Cup?" · Yes, champions
export function statusHeadline(player) {
  const st = player.wc2026?.status || { stage: "group", alive: true };
  const country = player.country;
  const name = player.name;

  if (st.stage === "champion") {
    return {
      q: `Did ${name} win the 2026 World Cup?`,
      a: `Yes — ${country} are 2026 World Cup champions.`,
      alive: true,
    };
  }
  if (st.alive === false || st.stage === "eliminated") {
    return {
      q: `Is ${name} out of the 2026 World Cup?`,
      a: `Yes — ${country} were knocked out at the ${stageLabel(st.stage)}.`,
      alive: false,
    };
  }
  if (stageIndex(st.stage) > 0) {
    return {
      q: `Is ${name} still in the 2026 World Cup?`,
      a: `Yes — ${country} have reached the ${stageLabel(st.stage)}.`,
      alive: true,
    };
  }
  // group / pre-tournament
  return {
    q: `Is ${name} playing in the 2026 World Cup?`,
    a: `Yes — ${country} are in Group ${player.wc2026.group}.`,
    alive: true,
  };
}

// Editorial one-liner for the on-page status strip — a STATEMENT in the site's
// voice, not the search-style Q&A above. (The Q&A still powers the <title>,
// meta description and FAQ JSON-LD, where the answer-led phrasing wins clicks;
// on the page itself a snippet-box reads off-brand.) Always returns a short
// serif line that works pre-tournament and as the run unfolds.
export function statusStatement(player) {
  const st = player.wc2026?.status || { stage: "group", alive: true };
  if (st.stage === "champion") return "Champions. 🏆";
  if (st.alive === false || st.stage === "eliminated") {
    return `Out — ${stageLabel(st.stage)}.`;
  }
  if (stageIndex(st.stage) > 0) return `Into the ${stageLabel(st.stage)}.`;
  return "In the hunt.";
}

// --- Match results (in-tournament updates) -------------------------------
//
// During the tournament, add a `result` object to a played match in
// wc2026.matches[] — one line per game — and it renders on the player's
// schedule card and as a "Last:" line on the /status hub. Shape:
//
//   result: {
//     outcome: "W",   // "W" | "D" | "L" — from the legend's nation's view
//     score: "2-1",   // own team first: <country>-<opponent>
//     scorers: "Messi 34' (pen), Álvarez 78'", // optional, the legend first
//   }
//
// Leave `result` absent for matches that haven't kicked off — the card falls
// back to the date/venue preview automatically.

// The most-recently-played match for a player, or null if none played yet.
// Matches are listed chronologically, so the last one carrying a result wins.
export function latestPlayedMatch(player) {
  const matches = player.wc2026?.matches || [];
  for (let i = matches.length - 1; i >= 0; i--) {
    if (matches[i].result) return matches[i];
  }
  return null;
}

// Compact "W 2-1 v Algeria" label for the most recent result, or null.
export function latestResultLabel(player) {
  const m = latestPlayedMatch(player);
  if (!m) return null;
  return `${m.result.outcome} ${m.result.score} v ${m.opponent}`;
}

// --- Road to the Final (knockout-path lanes on /road-to-the-final) --------
//
// The five legends' knockout journeys drawn as parallel left-to-right lanes,
// so a single nation's path reads in a straight line — the thing a symmetric
// bracket tree (ESPN/FIFA) makes hard. Driven by wc2026.status (how far a
// legend has progressed) plus the OPTIONAL wc2026.knockout[] opponents/results
// we fill in per round once the knockouts begin (June 28). Pre-knockout every
// lane shows the group node lit and the rounds ahead dated from the schedule.
//
//   wc2026.knockout: [                 // OPTIONAL — add one entry per round as
//     { stage: "r32",                  //   the legend plays it. stage ∈ ROAD_STAGES.
//       opponent: "Switzerland",       //   the named opponent once known
//       result: { outcome: "W", score: "2-1", scorers: "…" } },  // same shape as a match result; absent until played
//   ]
//
// Absent ⇒ that round's node shows the round date placeholder. Keep this in
// sync with wc2026.status.stage (the lane lights nodes from status, not from
// the knockout[] array) — the array only supplies opponent/score labels.

// First date of each knockout round (mirrors tournament.keyDates).
export const KNOCKOUT_STAGE_DATES = {
  group: "2026-06-11",
  r32: "2026-06-28",
  r16: "2026-07-05",
  qf: "2026-07-11",
  sf: "2026-07-15",
  final: "2026-07-19",
};

// The lane stages, group → final. "champion" is rendered as a trophy cap.
export const ROAD_STAGES = ["group", "r32", "r16", "qf", "sf", "final"];

// Build the ordered node list for a legend's lane. Each node is:
//   { stage, label, short, state, opponent, result, date }
// state ∈ "reached" (advanced past it) | "current" (where they are now) |
//         "out" (eliminated at this round) | "upcoming" (not yet reached).
export function playerRoad(player) {
  const st = player.wc2026?.status || { stage: "group", alive: true };
  const out = st.alive === false || st.stage === "eliminated";
  const champion = st.stage === "champion";
  const curIdx = stageIndex(st.stage);
  const ko = player.wc2026?.knockout || [];
  const koByStage = {};
  for (const k of ko) koByStage[k.stage] = k;

  return ROAD_STAGES.map((stage, i) => {
    let state;
    if (champion) state = "reached";
    else if (out && i === curIdx) state = "out";
    else if (i < curIdx) state = "reached";
    else if (i === curIdx) state = "current";
    else state = "upcoming";

    const k = koByStage[stage];
    return {
      stage,
      label: stageLabel(stage),
      short: STAGE_SHORT[stage],
      state,
      // The group node always names the group; knockout nodes name the
      // opponent once we know it (else null → the lane shows the round date).
      opponent:
        stage === "group"
          ? `Group ${player.wc2026?.group || ""}`.trim()
          : k?.opponent || null,
      result: k?.result || null,
      date: KNOCKOUT_STAGE_DATES[stage] || null,
    };
  });
}

// True once the legend has lifted the trophy — drives the trophy cap on the lane.
export function isChampion(player) {
  return (player.wc2026?.status?.stage || "") === "champion";
}

// --- Projected knockout opponents (fixed 2026 bracket) --------------------
//
// The 2026 Round-of-32 bracket is FIXED by group letter (FIFA; verified vs
// Wikipedia "2026 FIFA World Cup knockout stage", matches 73–104). So before a
// ball is kicked we can project — for any group + finishing position — which
// groups can supply each knockout opponent. The bracket is the source of truth;
// nothing here needs editing during the tournament (the real opponent names
// arrive via wc2026.knockout[] as rounds are played and override the projection
// on /road-to-the-final).
//
// Each R32 slot is "POS:GROUPS": "W:C" (winner of C), "RU:F" (runner-up of F),
// or "3:A,E,H,I,J" (a 3rd-place team from one of those groups — the 8 best
// third-placed teams aren't assigned to slots until the group stage ends, so
// these stay genuinely open).
const R32_MATCHES = {
  73: ["RU:A", "RU:B"],
  74: ["W:E", "3:A,B,C,D,F"],
  75: ["W:F", "RU:C"],
  76: ["W:C", "RU:F"],
  77: ["W:I", "3:C,D,F,G,H"],
  78: ["RU:E", "RU:I"],
  79: ["W:A", "3:C,E,F,H,I"],
  80: ["W:L", "3:E,H,I,J,K"],
  81: ["W:D", "3:B,E,F,I,J"],
  82: ["W:G", "3:A,E,H,I,J"],
  83: ["RU:K", "RU:L"],
  84: ["W:H", "RU:J"],
  85: ["W:B", "3:E,F,G,I,J"],
  86: ["W:J", "RU:H"],
  87: ["W:K", "3:D,E,I,J,L"],
  88: ["RU:D", "RU:G"],
};
// Which two earlier match-winners feed each later match (R16 → final).
const KO_TREE = {
  89: [74, 77], 90: [73, 75], 91: [76, 78], 92: [79, 80],
  93: [83, 84], 94: [81, 82], 95: [86, 88], 96: [85, 87],
  97: [89, 90], 98: [93, 94], 99: [91, 92], 100: [95, 96],
  101: [97, 98], 102: [99, 100],
  104: [101, 102],
};

const slotPos = (slot) => slot.split(":")[0]; // "W" | "RU" | "3"
const slotGroups = (slot) => slot.split(":")[1].split(",");

function findR32Match(slot) {
  for (const [m, slots] of Object.entries(R32_MATCHES)) {
    if (slots.includes(slot)) return Number(m);
  }
  return null;
}
function findParent(matchNo) {
  for (const [p, feeders] of Object.entries(KO_TREE)) {
    if (feeders.includes(matchNo)) return Number(p);
  }
  return null;
}
// All R32 leaf slots feeding a given match (the whole sub-bracket below it).
function r32Leaves(matchNo) {
  if (R32_MATCHES[matchNo]) return [...R32_MATCHES[matchNo]];
  const [a, b] = KO_TREE[matchNo];
  return [...r32Leaves(a), ...r32Leaves(b)];
}

// Lazy group-letter → [{ name, flag }] lookup, built from tournament.groups
// (which is defined later in this module but always initialized by call time,
// since these helpers only run during page render).
let _groupTeams = null;
function groupTeamsByLetter() {
  if (_groupTeams) return _groupTeams;
  _groupTeams = {};
  for (const g of tournament.groups) {
    _groupTeams[g.id] = g.teams.map((t) => ({ name: t.name, flag: t.flag }));
  }
  return _groupTeams;
}
// Pot-1 seed = the first-listed team in a group (draw is in seeding order).
// Groups are stored in pot/seeding order, so index 0 is the projected group
// winner and index 1 the projected runner-up — the "favourite" for each
// finishing position. nth(letter, i) returns that team (gracefully if absent).
function groupNth(letter, i) {
  const t = groupTeamsByLetter()[letter];
  return t && t[i]
    ? { ...t[i], grp: letter }
    : { name: letter, flag: "", grp: letter };
}
function groupSeed(letter) {
  return groupNth(letter, 0);
}

// The R32 round: a single, exact opponent slot.
function r32OpponentRound(slot) {
  const pos = slotPos(slot);
  const groups = slotGroups(slot);
  const posLabel = pos === "W" ? "Winner" : pos === "RU" ? "Runner-up" : "3rd place";
  // One named group ⇒ list its four teams (the opponent is one of them in the
  // stated position). Multiple groups ⇒ an open 3rd-place slot whose occupant is
  // genuinely unknown — and never a group's seed — so we show NO team chips and
  // let the prose ("3rd place · Group D/E/I/J/L") carry it. Surfacing seeds here
  // would wrongly imply the opponent is one of those strong sides.
  const single = groups.length === 1;
  const teams = single
    ? groupTeamsByLetter()[groups[0]].map((t) => ({ ...t, grp: groups[0] }))
    : [];
  return { stage: "r32", short: "R32", posLabel, groups, single, teams };
}

// A later round: opponent is the winner of a whole sibling sub-bracket. Group
// winners are the seeded/likely advancers, so surface the W-slot groups as the
// headline candidates; note when a runner-up or 3rd-place side could slot in.
function siblingOpponentRound(stage, leafSlots) {
  const winners = [];
  const runnersUp = [];
  let hasThirds = false;
  for (const s of leafSlots) {
    const pos = slotPos(s);
    if (pos === "W") winners.push(...slotGroups(s));
    else if (pos === "RU") runnersUp.push(...slotGroups(s));
    else hasThirds = true;
  }
  const usingWinners = winners.length > 0;
  const primaryGroups = [...new Set(usingWinners ? winners : runnersUp)];
  const primaryPos = usingWinners ? "Winner" : "Runner-up";
  // Name the projected team for each candidate group, matching the slot's
  // finishing position: WINNER slot → the group's top seed (favourite to win,
  // and where the legend-vs-legend collisions surface); RUNNER-UP slot → the
  // group's 2nd seed (favourite to finish 2nd). Both are pot-seeding
  // projections, disclaimed by the panel header — never show the top seed under
  // a "Runner-up" label (it's the LEAST likely team to finish 2nd).
  const teams = primaryGroups.map((g) => groupNth(g, usingWinners ? 0 : 1));
  return {
    stage,
    short: STAGE_SHORT[stage],
    primaryPos,
    primaryGroups,
    teams,
    hasThirds,
    // Deep rounds fan out across half the draw — too broad to list cleanly.
    wide: teams.length > 4,
  };
}

// Trace one finishing scenario ("W" or "RU" of a group) up the bracket and
// describe the potential opponent at each round (R32 → final).
function projectBranch(group, finish) {
  const slot = `${finish}:${group}`;
  const r32 = findR32Match(slot);
  if (!r32) return [];
  const oppSlot = R32_MATCHES[r32].find((s) => s !== slot);
  const rounds = [r32OpponentRound(oppSlot)];
  let cur = r32;
  for (const stage of ["r16", "qf", "sf", "final"]) {
    const parent = findParent(cur);
    if (!parent) break;
    const [a, b] = KO_TREE[parent];
    const sibling = a === cur ? b : a;
    rounds.push(siblingOpponentRound(stage, r32Leaves(sibling)));
    cur = parent;
  }
  return rounds;
}

// The projected road for a legend, both finishing scenarios. Used by
// /road-to-the-final to show "who could they face" before the draw resolves.
export function projectedPaths(player) {
  const group = player.wc2026?.group;
  if (!group) return null;
  return {
    group,
    win: projectBranch(group, "W"),
    runnerUp: projectBranch(group, "RU"),
  };
}

// --- Affiliate links (Amazon Associates) ---------------------------------
//
// Single source of truth for the Associates tag (account created June 2026).
// Amazon credits the 24-hour cookie on any tagged link, so we point at tagged
// search-result pages rather than specific products — durable, nothing breaks
// when an item goes out of stock and there's no ASIN to maintain. Two rules
// the program enforces: links must carry rel="sponsored", and the affiliate
// relationship must be disclosed near them (both handled in ShopLinks).
export const AFFILIATE_TAG = "finalchapterf-20";

export function amazonSearchUrl(query) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;
}

// The two affiliate items shown on each player page: the national-team kit and
// books about the player. Derived from existing fields so there's no extra
// per-player content to maintain. Returns [{ label, sublabel, href }].
export function playerShopLinks(player) {
  return [
    {
      label: `${player.country} National Team Jersey`,
      sublabel: "Shop World Cup 2026 kits",
      href: amazonSearchUrl(`${player.country} soccer jersey`),
    },
    {
      label: `${player.name} — Books & Biographies`,
      sublabel: "His story, in print",
      href: amazonSearchUrl(`${player.name} book`),
    },
  ];
}
