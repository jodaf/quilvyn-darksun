/*
Copyright 2021, James J. Hayes

This program is free software; you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation; either version 2 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program; if not, write to the Free Software Foundation, Inc., 59 Temple
Place, Suite 330, Boston, MA 02111-1307 USA.
*/

/*jshint esversion: 6 */
/* jshint forin: false */
/* globals PHB35, Quilvyn, QuilvynRules, QuilvynUtils, SRD35 */
"use strict";

/*
 * This module loads the rules from the Dark Sun Campaign Setting v3.5 rules
 * from athas.org. The DarkSun3E function contains methods that load rules for
 * particular parts of the rules: raceRules for character races, magicRules
 * for spells, etc. These member methods can be called independently in order
 * to use a subset of the DarkSun3E rules. Similarly, the constant fields of
 * DarkSun3E (FEATS, RACES, etc.) can be manipulated to modify the user's
 * choices.
 */
function DarkSun3E(baseRules) {

  if(window.SRD35 == null) {
    alert('The DarkSun3E module requires use of the SRD35 module');
    return;
  }

  var rules = new QuilvynRules('DarkSun - D&D v3.5', DarkSun3E.VERSION);
  rules.basePlugin = SRD35;
  DarkSun3E.rules = rules;

  DarkSun3E.CHOICES = rules.basePlugin.CHOICES.concat(DarkSun3E.CHOICES_ADDED);
  rules.defineChoice('choices', DarkSun3E.CHOICES);
  rules.choiceEditorElements = DarkSun3E.choiceEditorElements;
  rules.choiceRules = DarkSun3E.choiceRules;
  rules.editorElements = SRD35.initialEditorElements();
  rules.getFormats = SRD35.getFormats;
  rules.getPlugins = DarkSun3E.getPlugins;
  rules.makeValid = SRD35.makeValid;
  rules.randomizeOneAttribute = DarkSun3E.randomizeOneAttribute;
  DarkSun3E.RANDOMIZABLE_ATTRIBUTES =
    rules.basePlugin.RANDOMIZABLE_ATTRIBUTES.concat
    (DarkSun3E.RANDOMIZABLE_ATTRIBUTES_ADDED);
  rules.defineChoice('random', DarkSun3E.RANDOMIZABLE_ATTRIBUTES);
  rules.ruleNotes = DarkSun3E.ruleNotes;

  SRD35.createViewers(rules, SRD35.VIEWERS);
  rules.defineChoice('extras',
    'feats', 'featCount', 'sanityNotes', 'selectableFeatureCount',
    'validationNotes'
  );
  rules.defineChoice('preset',
    'race:Race,select-one,races', 'levels:Class Levels,bag,levels',
    'prestige:Prestige Levels,bag,prestiges', 'npc:NPC Levels,bag,npcs');

  DarkSun3E.ALIGNMENTS = Object.assign({}, rules.basePlugin.ALIGNMENTS);
  DarkSun3E.ARMORS = Object.assign({}, rules.basePlugin.ARMORS);
  DarkSun3E.NPC_CLASSES = Object.assign({}, rules.basePlugin.NPC_CLASSES);
  DarkSun3E.FAMILIARS = Object.assign({}, rules.basePlugin.FAMILIARS);
  DarkSun3E.FEATS =
    Object.assign({}, rules.basePlugin.FEATS, DarkSun3E.FEATS_ADDED);
  DarkSun3E.FEATURES =
    Object.assign({}, rules.basePlugin.FEATURES, DarkSun3E.FEATURES_ADDED);
  DarkSun3E.GOODIES = Object.assign({}, rules.basePlugin.GOODIES);
  DarkSun3E.LANGUAGES =
    Object.assign({}, rules.basePlugin.LANGUAGES, DarkSun3E.LANGUAGES_ADDED);
  DarkSun3E.DEITIES.None =
    'Domain="' + QuilvynUtils.getKeys(DarkSun3E.PATHS).filter(x => x.match(/Domain$/)).map(x => x.replace(' Domain', '')).join('","') + '"';
  DarkSun3E.SCHOOLS = Object.assign({}, rules.basePlugin.SCHOOLS);
  DarkSun3E.SHIELDS = Object.assign({}, rules.basePlugin.SHIELDS);
  DarkSun3E.SKILLS =
    Object.assign({}, rules.basePlugin.SKILLS, DarkSun3E.SKILLS_ADDED);
  DarkSun3E.SPELLS = Object.assign({}, SRD35.SPELLS, DarkSun3E.SPELLS_ADDED);
  for(var s in DarkSun3E.SPELLS_LEVELS) {
    var levels = DarkSun3E.SPELLS_LEVELS[s];
    if(levels == null) {
      delete DarkSun3E.SPELLS[s];
      continue;
    }
    if(!(s in DarkSun3E.SPELLS)) {
      if(window.PHB35 && PHB35.SPELL_RENAMES && s in PHB35.SPELL_RENAMES) {
        s = PHB35.SPELL_RENAMES[s];
      } else {
        console.log('Missing spell "' + s + '"');
        continue;
      }
    }
    DarkSun3E.SPELLS[s] =
      DarkSun3E.SPELLS[s].replace('Level=', 'Level=' + levels + ',');
  }
  DarkSun3E.WEAPONS =
    Object.assign({}, rules.basePlugin.WEAPONS, DarkSun3E.WEAPONS_ADDED);

  DarkSun3E.abilityRules(rules);
  DarkSun3E.aideRules(rules, DarkSun3E.ANIMAL_COMPANIONS, DarkSun3E.FAMILIARS);
  DarkSun3E.combatRules
    (rules, DarkSun3E.ARMORS, DarkSun3E.SHIELDS, DarkSun3E.WEAPONS);
  DarkSun3E.magicRules(rules, DarkSun3E.SCHOOLS, DarkSun3E.SPELLS);
  // Feats must be defined before classes
  DarkSun3E.talentRules
    (rules, DarkSun3E.FEATS, DarkSun3E.FEATURES, DarkSun3E.GOODIES,
     DarkSun3E.LANGUAGES, DarkSun3E.SKILLS);
  DarkSun3E.identityRules(
    rules, DarkSun3E.ALIGNMENTS, DarkSun3E.CLASSES, DarkSun3E.DEITIES, DarkSun3E.PATHS,
    DarkSun3E.RACES, DarkSun3E.PRESTIGE_CLASSES, DarkSun3E.NPC_CLASSES
  );
  DarkSun3E.psionicsRules(rules, DarkSun3E.DISCIPLINES, DarkSun3E.POWERS);

  // Add items to character sheet
  rules.defineEditorElement
    ('disciplines', 'Disciplines', 'set', 'disciplines', 'spells');
  rules.defineEditorElement('powers', 'Powers', 'set', 'powers', 'spells');
  rules.defineSheetElement('Disciplines', 'Spell Points+', null, '; ');
  rules.defineSheetElement('Power Points', 'Disciplines+');
  // defineSheetElement doesn't allow specification of columns; have to access
  // viewers directly
  var element = {
    name:'Powers', format: '<b>Powers</b>:\n%V', before:'Spells',
    separator: '\n', columns:'1L'
  };
  for(var v in rules.viewers)
    rules.viewers[v].addElements(element);

  Quilvyn.addRuleSet(rules);

}

DarkSun3E.VERSION = '2.3.1.0';

DarkSun3E.CHOICES_ADDED = [];
DarkSun3E.CHOICES = SRD35.CHOICES.concat(DarkSun3E.CHOICES_ADDED);
DarkSun3E.RANDOMIZABLE_ATTRIBUTES_ADDED = [];
DarkSun3E.RANDOMIZABLE_ATTRIBUTES =
  SRD35.RANDOMIZABLE_ATTRIBUTES.concat(DarkSun3E.RANDOMIZABLE_ATTRIBUTES_ADDED);

DarkSun3E.ALIGNMENTS = Object.assign({}, SRD35.ALIGNMENTS);
DarkSun3E.ANIMAL_COMPANIONS = {
  'Carru':
    'Str=22 Dex=10 Con=17 Int=2 Wis=10 Cha=3 HD=3 AC=12 Attack=7 ' +
    'Dam=1d6+6,1d8+3 Size=L',
  'Dire Rat':SRD35.ANIMAL_COMPANIONS['Dire Rat'],
  'Eagle':SRD35.ANIMAL_COMPANIONS.Eagle,
  'Erdlu':
    'Str=12 Dex=14 Con=13 Int=2 Wis=12 Cha=3 HD=2 AC=13 Attack=2 Dam=1d4+1 ' +
    'Size=M',
   'Jankx':
    'Str=6 Dex=19 Con=13 Int=1 Wis=10 Cha=8 HD=1 AC=16 Attack=6 Dam=1d2-2 ' +
    'Size=T',
  'Jhakar':
    'Str=6 Dex=17 Con=11 Int=3 Wis=12 Cha=8 HD=1 AC=16 Attack=6 Dam=1d6-2 ' +
    'Size=S',
  "Kes'trekel":
    'Str=12 Dex=12 Con=13 Int=1 Wis=10 Cha=8 HD=1 AC=15 Attack=3 Dam=1d3+1 ' +
    'Size=T',
  'Kivit':
    'Str=3 Dex=16 Con=10 Int=2 Wis=12 Cha=9 HD=1 AC=15 Attack=5 ' +
    'Dam=2@1d2-4,1d3-4 Size=T',
  'Lesser Boneclaw':
    'Str=6 Dex=14 Con=10 Int=1 Wis=10 Cha=4 HD=1 AC=16 Attack=3 Dam=1d4-2 ' +
    'Size=S',
  'Medium Viper':SRD35.ANIMAL_COMPANIONS['Medium Viper'],
  'Owl':SRD35.ANIMAL_COMPANIONS.Owl,
  'Slit Spawn':
    'Str=11 Dex=14 Con=12 Int=1 Wis=12 Cha=3 HD=2 AC=14 Attack=3 Dam=1d8 ' +
    'Size=M',
  'Small Viper':SRD35.ANIMAL_COMPANIONS['Small Viper'],

  'Athasian Shark':
    'Str=18 Dex=15 Con=13 Int=2 Wis=12 Cha=2 HD=7 AC=17 Attack=8 Dam=1d8+6 ' +
    'Size=L Level=4',
  'Bull Carru':
    'Str=24 Dex=8 Con=18 Int=2 Wis=8 Cha=3 HD=6 AC=13 Attack=10 ' +
    'Dam=1d6+7,1d8+3 Size=L Level=4',
  'Cheetah':SRD35.ANIMAL_COMPANIONS.Cheetah,
  'Constrictor':SRD35.ANIMAL_COMPANIONS.Constrictor,
  'Crodlu':
    'Str=22 Dex=19 Con=18 Int=2 Wis=13 Cha=7 HD=5 AC=17 Attack=8 ' +
    'Dam=2@1d6+6,1d8+3 Size=L Level=4',
  'Dire Bat':SRD35.ANIMAL_COMPANIONS['Dire Bat'],
  'Erdland':
    'Str=12 Dex=14 Con=13 Int=2 Wis=12 Cha=3 HD=2 AC=13 Attack=2 ' +
    'Dam=2@1d4+1,1d6 Size=M Level=4',
  'Giant Lizard':
    'Str=18 Dex=17 Con=20 Int=1 Wis=10 Cha=9 HD=3 AC=16 Attack=5 ' +
    'Dam=1d8+6 Size=L Level=4',
  'Heavy Crodlu':
    'Str=22 Dex=19 Con=18 Int=2 Wis=13 Cha=7 HD=5 AC=17 Attack=8 ' +
    'Dam=2@1d6+6,1d8+3 Size=L Level=4',
  'Medium Jhakar':
    'Str=6 Dex=17 Con=11 Int=3 Wis=12 Cha=8 HD=6 AC=16 Attack=6 Dam=1d6-2 ' +
    'Size=S Level=4',
  'Kluzd':
    'Str=12 Dex=17 Con=12 Int=1 Wis=12 Cha=2 HD=4 AC=15 Attack=5 Dam=1d8+1 ' +
    'Size=L Level=4',
  'Large Viper':SRD35.ANIMAL_COMPANIONS['Large Viper'],
  'Leopard':SRD35.ANIMAL_COMPANIONS.Leopard,
  'Monitor Lizard':SRD35.ANIMAL_COMPANIONS['Monitor Lizard'],
  'Rasclinn':
    'Str=6 Dex=17 Con=11 Int=1 Wis=12 Cha=14 HD=1 AC=18 Attack=4 ' +
    'Dam=2@1d4-2,1d4-2 Size=S Level=4',

  'Heavy Warmount Crodlu':
    'Str=24 Dex=17 Con=20 Int=2 Wis=13 Cha=7 HD=6 AC=18 Attack=10 ' +
    'Dam=2@1d8+7,1d8+3 Size=L Level=7',
  'Huge Viper':SRD35.ANIMAL_COMPANIONS['Huge Viper'],
  'Inix':
    'Str=19 Dex=15 Con=16 Int=2 Wis=12 Cha=6 HD=6 AC=17 Attack=7 ' +
    'Dam=1d8+6 Size=L Level=7',
  'Kalin':
    'Str=18 Dex=16 Con=14 Int=2 Wis=10 Cha=4 HD=7 AC=16 Attack=9 ' +
    'Dam=2@1d6+2,2d6+4 Size=L Level=7',
  'Kluzd 7HD':
    'Str=12 Dex=17 Con=12 Int=1 Wis=12 Cha=2 HD=7 AC=15 Attack=5 Dam=1d8+1 ' +
    'Size=L Level=7',
  'Lion':SRD35.ANIMAL_COMPANIONS.Lion,
  'Lirr':
    'Str=13 Dex=12 Con=14 Int=1 Wis=12 Cha=11 HD=5 AC=14 Attack=4 ' +
    'Dam=2@1d4+1,1d10 Size=M Level=7',
  'Pterrax':
    'Str=19 Dex=13 Con=17 Int=1 Wis=12 Cha=13 HD=5 AC=13 Attack=6 ' +
    'Dam=2@1d6+2,1d8+4 Size=L Level=7',
  'Puddingfish':
    'Str=26 Dex=15 Con=20 Int=1 Wis=10 Cha=2 HD=9 AC=15 Attack=13 Dam=2d6+12 ' +
    'Size=H Level=7',
  'Subterranean Lizard':
    'Str=20 Dex=18 Con=22 Int=2 Wis=12 Cha=11 HD=6 AC=17 Attack=8 Dam=1d8+7 ' +
    'Size=L Level=7',
  'Takis':
    'Str=22 Dex=12 Con=18 Int=2 Wis=12 Cha=6 HD=4 AC=15 Attack=8 ' +
    'Dam=2@1d4+6,1d8+3,1d12+6 Size=L Level=7',
  'Tiger':SRD35.ANIMAL_COMPANIONS.Tiger,

  "Cha'thrang":
    'Str=20 Dex=12 Con=20 Int=2 Wis=14 Cha=6 HD=6 AC=21 Attack=9 Dam=1d8+5 ' +
    'Size=M Level=10',
  'Dire Lion':SRD35.ANIMAL_COMPANIONS['Dire Lion'],
  'Hatori':
    'Str=26 Dex=13 Con=20 Int=2 Wis=13 Cha=9 HD=8 AC=16 Attack=12 Dam=2d8+12 ' +
    'Size=H Level=10',
  'Giant Constrictor':SRD35.ANIMAL_COMPANIONS['Giant Constrictor'],
  'Huge Athasian Shark':
    'Str=22 Dex=15 Con=15 Int=2 Wis=12 Cha=2 HD=10 AC=17 Attack=11 Dam=2d8+9 ' +
    'Size=H Level=10',
  'Minotaur Lizard':
    'Str=28 Dex=15 Con=27 Int=1 Wis=13 Cha=11 HD=8 AC=16 Attack=13 ' +
    'Dam=3d6+13 Size=H Level=10',

  'Athasian Sloth':
    'Str=22 Dex=16 Con=18 Int=1 Wis=12 Cha=11 HD=11 AC=18 Attack=13 ' +
    'Dam=1d8+6 Size=L Level=13',
  'Large Lirr':
    'Str=13 Dex=12 Con=14 Int=1 Wis=12 Cha=11 HD=11 AC=14 Attack=4 ' +
    'Dam=2@1d4+1,1d10 Size=M Level=7',
  'Ruktoi':
    'Str=28 Dex=13 Con=20 Int=1 Wis=12 Cha=7 HD=12 AC=17 Attack=16 ' +
    'Dam=2d6+13 Size=H Level=7',

  'Dire Athasian Shark':
    'Str=23 Dex=14 Con=17 Int=4 Wis=12 Cha=10 HD=18 AC=20 Attack=17 ' +
    'Dam=3d6+9 Size=H Level=16',
  'Dire Tiger':SRD35.ANIMAL_COMPANIONS['Dire Tiger'],
  'Gargantuan Hatori':
    'Str=34 Dex=13 Con=24 Int=2 Wis=13 Cha=9 HD=17 AC=18 Attack=20 ' +
    'Dam=3d6+18 Size=H Level=16', // Size=G
  'White Slit Horror':
    'Str=35 Dex=11 Con=25 Int=2 Wis=14 Cha=7 HD=16 AC=12 Attack=20 ' +
    'Dam=10@1d8+12 Size=H Level=16', // Size=G
  'Slimahacc':
    'Str=29 Dex=12 Con=22 Int=2 Wis=16 Cha=7 HD=16 AC=19 Attack=20 ' +
    'Dam=2d8+13 Size=H Level=16'

};
DarkSun3E.ARMORS = Object.assign({}, SRD35.ARMORS);
DarkSun3E.DISCIPLINES = {
  'Clairsentience':'',
  'Metacreativity':'',
  'Psychokinesis':'',
  'Psychometabolism':'',
  'Psychoportation':'',
  'Telepathy':''
};
DarkSun3E.MONARCHS = {
  'Abalach-Re':'Domain=Chaos,Charm',
  'Andropinis':'Domain=Law,Nobility',
  'Borys':'Domain=Destruction,Protection',
  'Daskinor':'Domain=Chaos,Madness',
  'Dregoth':'Domain=Death,Destruction',
  'Hamanu':'Domain=Strength,War',
  'Kalak':'Domain=Magic,Trickery',
  'Lalali-Puy':'Domain=Animal,Plant',
  'Nibenay':'Domain=Magic,Mind',
  'Oronis':'Domain=Knowledge,Protection',
  'Tectuktitlay':'Domain=Glory,Strength'
};
DarkSun3E.CLASSES = {
  'Barbarian':
    SRD35.CLASSES.Barbarian
    .replace('Features=', 'Features="3:Wasteland Trapsense",'),
  'Bard':
    'HitDie=d6 Attack=3/4 SkillPoints=6 Fortitude=1/2 Reflex=1/2 Will=1/2 ' +
    'Features=' +
      '"1:Armor Proficiency (Light)",' +
      '"1:Weapon Proficiency (Simple/Bard\'s Friend/Hand Crossbow/Heavy Crossbow/Light Crossbow/Garrote/Greater Blowgun/Whip/Widow\'s Knife)",' +
      '"1:Bardic Knowledge","1:Bardic Music",Smuggler,"2:Poison Use",' +
      '2:Streetsmart,"3:Quick Draw","5:Mental Resistance",' +
      '"6:Improved Poison Use","6:Quick Thinking",7:Chance,' +
      '"9:Speed Reactions","10:Slippery Mind","15:Defensive Roll",' +
      '17:Awareness,18:Mindblank ' +
    'Selectables=' +
      '"Alchemy Dealer",Accurate,"Agile (Bard)",Coolheaded,' +
      '"Improvised Materials","Poison Dealer",Poisonbane,"Poison Resistance",' +
      '"Scorpion\'s Touch",Skilled,"Smokestick Application",Versatile ' +
    'Skills=' +
      'Appraise,Balance,Climb,Craft,"Decipher Script",Diplomacy,Disguise,' +
      '"Escape Artist",Forgery,"Gather Information",Heal,Hide,Intimidate,' +
      'Jump,Knowledge,Listen,"Move Silently",Perform,Profession,Ride,Search,' +
      '"Sense Motive","Sleight Of Hand","Speak Language",Tumble,' +
      '"Use Magic Device","Use Psionic Device","Use Rope"',
  'Cleric':
    SRD35.CLASSES.Cleric + ' ' +
    'Selectables=' +
      QuilvynUtils.getKeys(DarkSun3E.PATHS).filter(x => x.match(/Domain$/)).map(x => '"deityDomains =~ \'' + x.replace(' Domain', '') + '\' ? 1:' + x + '"').join(','),
  'Druid':
    SRD35.CLASSES.Druid
    .replace('Weapon Proficiency (', 'Weapon Proficiency (Alak, Blowgun')
    .replace("Resist Nature's Lure", "Nature's Speech"),
  'Fighter':
    SRD35.CLASSES.Fighter,
  'Gladiator':
    'HitDie=d12 Attack=1 SkillPoints=4 Fortitude=1/2 Reflex=1/2 Will=1/3 ' +
    'Features=' +
      '"1:Armor Proficiency (Medium)","1:Shield Proficiency",' +
      '"1:Weapon Proficiency (Martial)",' +
      '"1:Gladitorial Performance",1:Mercy,"1:Exotic Weapon",' +
      '"2:Improved Unarmed Strike","2:Arena Guile","3:Improved Feint",' +
      '"4:Uncanny Dodge","5:Armor Optimization","6:No Mercy",' +
      '"8:Improved Uncanny Dodge",14:Parry,"15:Superior Feint",' +
      '"19:Improved Parry",' +
      '"Sum \'^skills.Perform\' >= 3 ? 1:Combat Stance",' +
      '"Sum \'^skills.Perform\' >= 3 ? 1:Martial Display",' +
      '"Sum \'^skills.Perform\' >= 3 ? 1:Team Strike",' +
      '"Sum \'^skills.Perform\' >= 6 ? 3:Taunt",' +
      '"Sum \'^skills.Perform\' >= 9 ? 6:Shake Off",' +
      '"Sum \'^skills.Perform\' >= 12 ? 9:Trick",' +
      '"Sum \'^skills.Perform\' >= 15 ? 12:Chant",' +
      '"Sum \'^skills.Perform\' >= 18 ? 15:Threatening Glare",' +
      '"Sum \'^skills.Perform\' >= 21 ? 18:Dragon\'s Fury" ' +
    'Selectables=' +
      '"AC Optimization","Armor Check Optimization",' +
      '"Armor Dexterity Optimization","Armor Weight Optimization" ' +
    'Skills=' +
      'Balance,Bluff,Climb,Craft,Intimidate,Jump,Perform,Profession,' +
      '"Sense Motive",Spot,Tumble',
  'Psion': // Expanded Psionic Handbook
    'HitDie=d4 Attack=1/2 SkillPoints=2 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"Weapon Proficiency (Club/Dagger/Heavy Crossbow/Light Crossbow/Quarterstaff/Shortspear)",' +
      'Discipline,"Psion Bonus Feats","Psion Powers" ' +
    'Selectables=' +
      QuilvynUtils.getKeys(DarkSun3E.DISCIPLINES).join(',') + ' ' +
    'Skills=' +
      'Concentration,Craft,Knowledge,Profession,Psicraft',
  //TODO 'Psychic Warrior': as Expanded Psionic Handbook
  'Ranger':
    SRD35.CLASSES.Ranger
    .replace('Features=', 'Features="Favored Terrain",'),
  'Rogue':
    SRD35.CLASSES.Rogue
    .replace('Weapon Proficiency ( ', "Weapon Proficiency (Bard's Friend/Blowgun/Garrote/Small Macahuitl/Tonfa/Widow's Knife/Wrist Razor,")
    .replace('Selectables=', 'Selectables="10:Dune Trader","10:False Vulnerability","10:Looter\'s Luck",10:Notoriety,"10:Silver Tongue",'),
  'Templar':
    'HitDie=d10 Attack=3/4 SkillPoints=4 Fortitude=1/2 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Armor Proficiency (Medium)","1:Shield Proficiency",' +
      '"1:Weapon Proficiency (Simple)","1:Martial Weapons",' +
      '"1:Secular Aptitude","1:Assume Domain",1:Sigil,"4:Turn Undead" ' +
    'Selectables=' +
      QuilvynUtils.getKeys(DarkSun3E.Monarchs).map(x => '"1:' + x + '"').join(',') + ' ' +
    'CasterLevelArcane=levels.Templar ' +
    'SpellAbility=charisma ' +
    'SpellSlots=' +
      'T0:1=5;2=6,' +
      'T1:1=3;2=4;3=5;4=6,' +
      'T2:4=3;5=4;6=5;7=6,' +
      'T3:6=3;7=4;8=5;9=6,' +
      'T4:8=3;9=4;10=5;11=6,' +
      'T5:10=3;11=4;12=5;13=6,' +
      'T6:12=3;13=4;14=5;15=6,' +
      'T7:14=3;15=4;16=5;17=6,' +
      'T8:16=3;17=4;18=5;19=6,' +
      'T9:18=3;19=4;20=6,' +
      'Domain1:1=1,' +
      'Domain2:4=1,' +
      'Domain3:6=1,' +
      'Domain4:8=1,' +
      'Domain5:10=1,' +
      'Domain6:12=1,' +
      'Domain7:14=1,' +
      'Domain8:16=1,' +
      'Domain9:18=1 ' +
    'Skills=' +
      'Appraise,Bluff,Concentration,Craft,Diplomacy,Forgery,' +
      '"Gather Information",Heal,Intimidate,Knowledge,Literacy,Profession,' +
      '"Sense Motive",Spellcraft,Spot',
  //TODO 'Wilder': as Expanded Psionic Handbook
  'Wizard':
    SRD35.CLASSES.Wizard
};
DarkSun3E.NPC_CLASSES = Object.assign({}, SRD35.NPC_CLASSES);
DarkSun3E.PRESTIGE_CLASSES = {
  'Arch Defiler':
    'Require=' +
      '"skills.Knowledge (Arcana) >= 8","skills.Spellcraft >= 8",' +
      '"features.Agonizing Radius","features.Great Fortitude",' +
      '"sumMetamagicFeats >= 0","spellSlots.W3 >= 0","features.Defiler" ' +
    'HitDie=d4 Attack=1/2 SkillPoints=2 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Caster Level Bonus","1:Tainted Aura","1:Defiler Feat Bonus",' +
      '"1:Casting Time Metamagic","1:Painful Radius",1:Metamagic Raze" ' +
    'Skills=' +
      'Bluff,Concentration,Craft,"Decipher Script",Disguise,Intimidate,' +
      'Knowledge,Profession,Spellcraft',
  'Arena Champion':
    'Require=' +
      '"baseAttack >= 5","sumPerformFeats >= 6",' +
      '"Max \'features.Weapon Focus\' >= 1","features.Toughness" ' +
    'HitDie=d12 Attack=1 SkillPoints=4 Fortitude=1/2 Reflex=1/3 Will=1/3 ' +
    'Features=' +
      '"1:Crowd Support",2:Reputation,"3:Weapon Mastery",' +
      '"4:Signature Move",6:Fame,"7:Improved Signature Move",' +
      '"8:Roar Of The Crowd",10:Legend,"10:Finishing Move" ' +
    'Skills=' +
      'Balance,Bluff,Climb,Craft,Intimidate,Jump,Perform,Profession,' +
      '"Sense Motive",Tumble',
  'Dune Trader':
    'Require=' +
      '"skills.Appraise >= 5","skills.Bluff >= 5","skills.Diplomacy >= 7",' +
      '"skills.Profession (Merchant) >= 2","skills.Sense Motive >= 5",' +
      'features.Trader ' +
    'HitDie=d6 Attack=3/4 SkillPoints=8 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Open Arms","1:Fast Talk",2:Contact,"3:Distributive Bargaining",' +
      '4:Dazzle,4:Linguist (Dune Trader),5:Agent,"6:Improved Fast Talk",' +
      '"7:Integrative Bargaining",8:Taunt (Dune Trader),9:Allies ' +
    'Skills=' +
      'Appraise,Bluff,Craft,"Decipher Script",Diplomacy,Disguise,Forgery,' +
      '"Gather Information",Hide,Intimidate,Listen,"Move Silently",' +
      '"Open Lock",Profession,Ride,Search,"Sense Motive","Sleight Of Hand",' +
      '"Speak Language",Spot',
  'Elementalist':
    'Require=' +
      '"skills.Knowledge (Religion) >= 8","skills.Knowledge (Planes) >= 5",' +
      '"spellSlots.C3 >= 1 || spellSlots.D3 >= 1" ' +
    'HitDie=d8 Attack=1/2 SkillPoints=2 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Caster Level Bonus","1:Energy Resistance","2:Elemental Focus",' +
      '"3:Additional Domain","4:Elemental Shield","5:Ignore Element",' +
      '"6:Spontaneous Domain Spells","7:Summon Elemental","9:Power Element" ' +
    'Skills=' +
      'Concentration,Craft,Heal,"Knowledge (Religion)","Knowledge (Planes)",' +
      'Profession,Spellcraft',
  'Grove Master':
    'Require=' +
      '"skills.Knowledge (Nature) >= 10","skills.Survival >= 5",' +
      '"skills.Hide >= 4","features.Wastelander",' +
      '"spellSlots.C3 >= 1 || spellSlots.D3 >= 1" ' +
    'HitDie=d8 Attack=1/2 SkillPoints=6 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Caster Level Bonus","1:Animal Companion","1:Wild Shape",' +
      '"1:Guarded Lands","1:Sacrifice","2:Smite Intruder","3:Sustenance",' +
      '"4:Grove Master Spells","10:Timeless Body" ' +
    'Skills=' +
      'Concentration,Craft,Diplomacy,Disguise,"Handle Animal",Heal,Hide,' +
      '"Knowledge (Nature)",Listen,"Move Silently",Profession,Ride,' +
      'Spellcraft,Spot,Survival',
  'Master Scout':
    'Require=' +
      '"skills.Survival >= 8","features.Track","features.Wastelander" ' +
    'HitDie=d8 Attack=1/2 SkillPoints=2 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Armor Proficiency (Light)","1:Weapon Proficiency (Simple)",' +
      '"1:Blaze Trail","1:Hard March","2:Swift Strike","3:Uncanny Stealth",' +
      '"4:Favored Terrain","6:Master Scout Feat Bonus" ' +
    'Skills=' +
      'Balance,Climb,Craft,"Handle Animal",Hide,Jump,"Knowledge (Nature)",' +
      'Listen,"Move Silently",Spot,Survival,"Use Rope"',
  'Poisonmaster':
    'Require=' +
      '"skills.Craft (Poisonmaking) >= 8","skills.Craft (Alchemy) >= 4",' +
      '"features.Skill Focus (Craft (Poisonmaking))" ' +
    'HitDie=d6 Attack=3/4 SkillPoints=4 Fortitude=1/2 Reflex=1/2 Will=1/2 ' +
    'Features=' +
      '"1:Identify Poison",1:Dosage,"1:Poison Use","2:Poison Secret",' +
      '"3:Extend Poison","4:Mental Resistance","5:Empower Poison",' +
      '"5:Damage Reduction","7:Poisoner\'s Fortitude","7:Maximize Poison",' +
      '8:Mindblank,"9:Quicken Poison","10:Poison Immunity" ' +
    'Selectables=' +
      '"Poison Dealer",Poisonbane,"Poison Resistance","Scorpion\'s Touch",' +
      '"Smokestick Application" ' +
    'Skills=' +
      'Appraise,Bluff,Concentration,Craft,"Decipher Script",Diplomacy,' +
      'Disguise,"Gather Information",Heal,Hide,Intimidate,' +
      '"Knowledge (Nature)",Listen,"Move Silently",Perform,Profession,' +
      '"Sense Motive","Sleight Of Hand",Spot',
  'Psiologist':
    'Require=' +
      '"alignment =~ \'Lawful\'","skills.Knowledge (Psionics) >= 12",' +
      '"skills.Psicraft >= 12","feats.Psionic Affinity",' +
      '"features.Skill Focus (Knowledge (Psionics))",' +
      '"features.Skill Focus (Psicraft)","sumMetapsionicFeats >= 2",' +
      '"spellSlots.Psionic5 >= 1" ' +
    'HitDie=d4 Attack=1/2 SkillPoints=2 Fortitude=1/3 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Caster Level Bonus",1:Psilogism,"2:Psionic Acumen",' +
      '"3:Psionic Rationalization",4:Forethought,"8:Discipline Insight",' +
      '10:Schoolmaster ' +
    'Skills=' +
      'Autohypnosis,Bluff,Concentration,Diplomacy,Knowledge,Literacy,' +
      'Psicraft,"Sense Motive","Use Psionic Device"',
  'Templar Knight':
    'Require=' +
      '"baseAttack >= 5","skills.Diplomacy >= 2" ' +
    'HitDie=d10 Attack=1 SkillPoints=2 Fortitude=1/2 Reflex=1/3 Will=1/3 ' +
    'Features=' +
      '"1:Secular Authority","1:Spell-Like Abilities","1:Smite Opponent",' +
      '"2:Fearless Presence","3:Templar Knight Feat Bonus",' +
      '"5:Spell Channeling" ' +
    'Skills=' +
      'Bluff,Climb,Concentration,Craft,Diplomacy,"Handle Animal",Heal,' +
      'Intimidate,Jump,"Knowledge (Religion)","Knowledge (Warcraft)",' +
      'Literacy,Profession,Ride,"Sense Motive",Spellcraft ' +
    'CasterLevelArcane="levels.Templar Knight" ' +
    'SpellAbility=wisdom ' +
    'SpellSlots=' +
      'T0:1=0;2=1;7=2,' +
      'T1:3=0;4=1;9=2,' +
      'T2:5=0;6=1;10=2,' +
      'T3:7=0;8=1'
};
DarkSun3E.FAMILIARS = Object.assign({}, SRD35.FAMILIARS);
DarkSun3E.FEATS_ADDED = {
  'Ancestral Knowledge (Blue Age)':
    'Type=General ' +
    'Require="intelligence >= 13","skills.Knowledge (History) >= 10"',
  'Ancestral Knowledge (Green Age)':
    'Type=General ' +
    'Require="intelligence >= 13","skills.Knowledge (History) >= 10"',
  'Ancestral Knowledge (Cleansing Wars)':
    'Type=General ' +
    'Require="intelligence >= 13","skills.Knowledge (History) >= 10"',
  'Arena Clamor':
    'Type=General ' +
    'Require=' +
      '"charisma >= 13",' +
      '"features.Improved Critical",' +
      '"Sum \'skills.Perform\' >= 5"',
  'Brutal Attack':
    'Type=General ' +
    'Require=' +
      '"charisma >= 13",' +
      '"features.Improved Critical",' +
      '"Sum \'skills.Perform\' >= 5"',
  'Bug Trainer':
    'Type=General ' +
    'Require=' +
      '"skills.Handle Animal >= 5",' +
      '"skills.Knowledge (Nature) >= 5"',
  'Commanding Presence':
    'Type=General,Fighter ' +
    'Require=' +
      '"skills.Diplomacy >= 7",' +
      '"skills.Knowledge (Warcraft) >= 5"',
  'Concentrated Fire':
    'Type=General,Fighter ' +
    'Require=' +
      '"baseAttack >= 1"',
  'Cornered Fighter':
    'Type=General ' +
    'Require=' +
      '"baseAttack >= 5"',
  'Defender Of The Land':
    'Type=General ' +
    'Require=' +
      '"features.Wild Shape"',
  'Dissimulated':
    'Type=General ' +
    'Require=' +
      '"intelligence >= 13",' +
      '"charisma >= 13",' +
      '"skills.Bluff >= 5"',
  "Drake's Child":
    'Type=General ' +
    'Require=' +
      '"strength >= 13",' +
      '"wisdom >= 13"',
  'Elemental Cleansing':
    'Type=General ' +
    'Require=' +
      '"features.Turn Undead"',
  'Faithful Follower':
    'Type=General',
  'Favorite':
    'Type=General ' +
    'Require=' +
      '"features.Secular Authority",' +
      '"skills.Diplomacy >= 10"',
  'Fearsome':
    'Type=General ' +
    'Require=' +
      '"strength >= 15"',
  'Field Officer':
    'Type=General',
  'Gladitorial Entertainer':
    'Type=General ' +
    'Require=' +
      '"features.Gladitorial Performance"',
  'Greasing The Wheels':
    'Type=General ' +
    'Require=' +
      '"charisma >= 13",' +
      '"skills.Diplomacy >= 7",' +
      '"skills.Knowledge (Local) >= 5"',
  'Hard As A Rock':
    'Type=General ' +
    'Require=' +
      '"constitution >= 15",' +
      '"features.Diehard",' +
      '"features.Great Fortitude"',
  'Implacable Defender':
    'Type=General ' +
    'Require=' +
      '"strength >= 13",' +
      '"baseAttack >= 3"',
  'Improved Sigil':
    'Type=General ' +
    'Require=' +
      '"features.Sigil",' +
      '"skills.Diplomacy >= 9"',
  'Improviser':
    'Type=General ' +
    'Require=' +
      '"wisdom >= 13",' +
      '"baseAttack >= 3"',
  'Innate Hunter':
    'Type=General ' +
    'Require=' +
      '"features.Track",' +
      '"skills.Survival >= 5"',
  'Intimidating Presence':
    'Type=General ' +
    'Require=' +
      '"charisma >= 13",' +
      '"skills.Intimidate >= 7"',
  'Inspiring Presence':
    'Type=General ' +
    'Require=' +
      '"charisma >= 13"',
  'Kiltektet':
    'Type=General',
  'Linguist':
    'Type=General',
  'Mastryrial Blood':
    'Type=General ' +
    'Require=' +
      '"constitution >= 13"',
  'Path Dexter':
    'Type=General ' +
    'Require=' +
      '"features.Preserver"',
  'Path Sinister':
    'Type=General ' +
    'Require=' +
      '"features.Defiler"',
  'Protective':
    'Type=General',
  'Psionic Mimicry':
    'Type=General ' +
    'Require=' +
      '"skills.Bluff >= 8",' +
      '"skills.Knowledge (Psionics) >= 4",' +
      '"skills.Psicraft >= 4"',
  'Psionic Schooling':
    'Type=General',
  'Raised By Beasts':
    'Type=General',
  'Rotate Lines':
    'Type=General ' +
    'Require=' +
      '"baseAttack >= 3"',
  'Secular Authority':
    'Type=General ' +
    'Require=' +
      '"charisma >= 13",' +
      '"skills.Diplomacy >= 6",' +
      '"features.Negotiator",' +
      '"levels.Templar"', // TODO? "Accepted into city-state's templarate"
  'Shield Wall':
    'Type=General,Fighter ' +
    'Require=' +
      '"baseAttack >= 2",' +
      '"features.Shield Proficiency"',
  'Sniper':
    'Type=General ' +
    'Require=' +
      '"dexterity >= 13",' +
      '"skills.Hide >= 1"',
  'Spear Wall':
    'Type=General ' +
    'Require=' +
      '"baseAttack >= 1"',
  'Tactical Expertise':
    'Type=General ' +
    'Require=' +
      '"skills.Knowledge (Warcraft) >= 7"',
  'Teamwork':
    'Type=General,Fighter ' +
    'Require=' +
      '"baseAttack >= 1"',
  'Trader':
    'Type=General',
  'Wastelander':
    'Type=General',
  'Elemental Affinity':
    'Type=Divine ' +
    'Require=' +
      '"charisma >= 13",' +
      '"features.Turn Undead"',
  'Elemental Might':
    'Type=Divine ' +
    'Require=' +
      '"strength >= 13",' +
      '"features.Turn Undead",' +
      '"features.Power Attack"',
  'Elemental Vengeance':
    'Type=Divine ' +
    'Require=' +
      '"features.Turn Undead",' +
      '"features.Extra Turning"',
  'Superior Blessing':
    'Type=Divine ' +
    'Require=' +
      '"features.Turn Undead"',
  'Elemental Manifestation':
    'Type=Psionic ' +
    'Require=' +
      '"spellSlots.Domain1 >= 0"',
      // TODO "manifester level 3rd"
  'Focused Mind':
    'Type=Psionic ' +
    'Require=' +
      '"intelligence >= 13"',
      // TODO "psionic subtype"
  'Greater Hidden Talent':
    'Type=Psionic ' +
    'Require=' +
      '"charisma >= 13",' +
      '"features.Improved Hidden Talent",' +
      '"level >= 5"',
      // TODO "psionic subtype"
  'Improved Dwarven Focus':
    'Type=Psionic ' +
    'Require=' +
      '"race =~ \'Dwarf\'"',
      // TODO "psionic subtype"
  'Improved Elf Run':
    'Type=Psionic ' +
    'Require=' +
      '"race =~ \'Elf\'"',
      // TODO "psionic subtype"
  'Improved Hidden Talent':
    'Type=Psionic ' +
    'Require=' +
      '"charisma >= 12",' +
      '"features.Hidden Talent",' +
      '"level >= 3"',
  'Jump Charge':
    'Type=Psionic ' +
    'Require=' +
      '"features.Psionic Fist||features.Psionic Weapon",' +
      '"skills.Jump >= 8"',
  'Pterran Telepathy':
    'Type=Psionic ' +
    'Require=' +
      '"race =~ \'Pterran\'",' +
      '"spells.Missive"',
  'Agonizing Radius':
    'Type=Raze ' +
    'Require=' +
      '"features.Defiler"',
  'Controlled Raze':
    'Type=Raze ' +
    'Require=' +
      '"features.Defiler"',
  'Distance Raze':
    'Type=Raze ' +
    'Require=' +
      '"features.Defiler"',
  'Destructive Raze':
    'Type=Raze ' +
    'Require=' +
      '"features.Defiler"',
  'Efficient Raze':
    'Type=Raze ' +
    'Require=' +
      '"features.Defiler"',
  'Exterminating Raze':
    'Type=Raze ' +
    'Require=' +
      '"features.Defiler"',
  'Fast Raze':
    'Type=Raze ' +
    'Require=' +
      '"features.Defiler"',
  'Sickening Raze':
    'Type=Raze ' +
    'Require=' +
      '"features.Agonizing Raze"',
  'Active Glands':
    'Type=Racial ' +
    'Require=' +
      '"race =~ \'Thri-kreen\'"',
  'Advanced Antennae':
    'Type=Racial ' +
    'Require=' +
      '"race =~ \'Thri-kreen\'"',
  'Blend':
    'Type=Racial ' +
    'Require=' +
      '"race =~ \'Thri-kreen\'"',
  'Blessed By The Ancestors':
    'Type=Racial ' +
    'Require=' +
      '"race =~ \'Thri-kreen\'"',
  'Cannibalism Ritual':
    'Type=Racial ' +
    'Require=' +
      '"wisdom >= 13",' +
      '"race =~ \'Halfling\'"',
  'Dwarven Vision':
    'Type=Racial ' +
    'Require=' +
      '"race =~ \'Mul\'"',
  'Elfeater':
    'Type=Racial ' +
    'Require=' +
      '"race =~ \'Thri-kreen\'"',
  "Improved Gyth'sa":
    'Type=Racial ' +
    'Require=' +
      '"race =~ \'Thri-kreen\'",' +
      '"constitution >= 13"',
  'Tikchak':
    'Type=Racial ' +
    'Require=' +
      '"race =~ \'Thri-kreen\'",' +
      '"level >= 5"',
  'Tokchak':
    'Type=Racial ' +
    'Require=' +
      '"race =~ \'Thri-kreen\'"',
  'Artisan':
    'Type=Regional ' +
    'Require=' +
      '"origin =~ \'Nibenay|Raam|Urik\'"',
  'Astrologer':
    'Type=Regional ' +
    'Require=' +
      '"origin =~ \'Draj|Nibenay\'"',
  'Companion':
    'Type=Regional ' +
    'Require=' +
      '"origin =~ \'Kurn|Tyr\'"',
  'Disciplined':
    'Type=Regional ' +
    'Require=' +
      '"race =~ \'Dwarf\' || origin == \'Urik\'"',
  'Freedom':
    'Type=Regional ' +
    'Require=' +
      '"origin == \'Tyr\'"',
  'Giant Killer':
    'Type=Regional ' +
    'Require=' +
      '"origin == \'Sea Of Silt\'"',
  'Jungle Fighter':
    'Type=Regional ' +
    'Require=' +
      '"origin =~ \'Forest Ridge|Gulg\'"',
  'Legerdemain':
    'Type=Regional ' +
    'Require=' +
      '"race =~ \'Elf\' || origin == \'Salt View\'"',
  'Mansabar':
    'Type=Regional ' +
    'Require=' +
      '"origin == \'Raam\'"',
  'Mekillothead':
    'Type=Regional ' +
    'Require=' +
      '"race =~ \'Mul\' || origin == \'Draj\'"',
  'Metalsmith':
    'Type=Regional ' +
    'Require=' +
      '"race =~ \'Dwarf\' || origin == \'Tyr\'"',
  "Nature's Child":
    'Type=Regional ' +
    'Require=' +
      '"race =~ \'Halfling\' || origin == \'Gulg\'"',
  'Paranoid':
    'Type=Regional ' +
    'Require=' +
      '"origin == \'Eldaarich\'"',
  'Performance Artist':
    'Type=Regional ' +
    'Require=' +
      '"origin =~ \'Nibenay|Balic|Salt View\'"',
  'Tarandan Method':
    'Type=Regional ' +
    'Require=' +
      '"origin == \'Raam\'"',
  // XPH
  'Aligned Attack':
    'Type=Psionic ' +
    'Require=' +
      '"baseAttack >= 6"',
  'Antipsionic Magic':
    'Type=General ' +
    'Require=' +
      '"skills.Spellcraft >= 5"',
  'Autonomous':
    'Type=General',
  'Body Fuel':
    'Type=Psionic',
  'Boost Construct':
    'Type=Psionic',
  'Burrowing Power':
    'Type=Metapsionic',
  'Chain Power':
    'Type=Metapsionic',
  'Chaotic Mind':
    'Type=General ' +
    'Require=' +
      '"charisma >= 15",' +
      '"alignment =~ \'Chaotic\'"',
  'Cloak Dance':
    'Type=General ' +
    'Require=' +
      '"skills.Hide >= 10",' +
      '"skills.Perform (Dance) >= 2"',
  'Closed Mind':
    'Type=General',
  'Combat Manifestation':
    'Type=Psionic',
  'Craft Dorje':
    'Type="Item Creation"',
  'Craft Psicrown':
    'Type="Item Creation" ' +
    'Require=' +
      '"manifesterLevel >= 12"',
  'Craft Psionic Arms And Armor':
    'Type="Item Creation" ' +
    'Require=' +
      '"manifesterLevel >= 5"',
  'Craft Psionic Construct':
    'Type="Item Creation" ' +
    'Require=' +
      '"features.Craft Psionic Arms And Armor",' +
      '"features.Craft Universal Item"',
  'Craft Universal Item':
    'Type="Item Creation" ' +
    'Require=' +
      '"manifesterLevel >= 3"',
  'Deadly Precision':
    'Type=General ' +
    'Require=' +
      '"dexterity >= 15",' +
      '"baseAttack >= 5"',
  'Deep Impact':
    'Type=Psionic ' +
    'Require=' +
      '"strength >= 13",' +
      '"baseAttack >= 5",' +
      '"features.Psionic Weapon"',
  'Delay Power':
    'Type=Metapsionic',
  'Empower Power':
    'Type=Metapsionic',
  'Enlarge Power':
    'Type=Metapsionic',
  'Expanded Knowledge':
    'Type=Psionic ' +
    'Require=' +
      '"manifesterLevel >= 3"',
  'Extend Power':
    'Type=Metapsionic',
  'Fell Shot':
    'Type=Psionic ' +
    'Require=' +
      '"dexterity >= 13",' +
      '"baseAttack >= 5",' +
      '"features.Point Blank Shot",' +
      '"features.Psionic Shot"',
  'Focused Sunder':
    'Type=Psionic ' +
    'Require=' +
      '"strength >= 13",' +
      '"features.Power Attack",' +
      '"features.Impoved Sunder"',
  'Force Of Will':
    'Type=General ' +
    'Require=' +
      '"features.Iron Will"',
  'Ghost Attack':
    'Type=Psionic ' +
    'Require=' +
      '"baseAttack >= 3"',
  'Greater Manyshot':
    'Type=General ' +
    'Require=' +
      '"dexterity >= 17",' +
      '"baseAttack >= 6",' +
      '"features.Manyshot",' +
      '"features.Point Blank Shot",' +
      '"features.Rapid Shot"',
  'Greater Power Penetration':
    'Type=General ' +
    'Require=' +
      '"features.Power Penetration"',
  'Greater Psionic Shot':
    'Type=Psionic ' +
    'Require=' +
      '"baseAttack >= 5",' +
      '"features.Point Blank Shot",' +
      '"features.Psionic Shot"',
  'Greater Psionic Weapon':
    'Type=Psionic ' +
    'Require=' +
      '"strength >= 13",' +
      '"baseAttack >= 5",' +
      '"features.Psionic Weapon"',
  'Hostile Mind':
    'Type=General ' +
    'Require=' +
      '"charisma >= 15"',
  'Imprint Stone':
    'Type="Item Creation" ' +
    'Require=' +
      '"manifesterLevel >= 1"',
  'Improved Psicrystal':
    'Type=Psionic ' +
    'Require=' +
      '"features.Psicrystal Affinity"',
  'Inquisitor':
    'Type=Psionic ' +
    'Require=' +
      '"wisdom >= 13"',
  'Maximize Power':
    'Type=Metapsionic',
  'Mental Leap':
    'Type=Psionic ' +
    'Require=' +
      '"strength >= 13",' +
      '"skills.Jump >= 5"',
  'Mental Resistance':
    'Type=General ' +
    'Require=' +
      '"save.Will >= 2"',
  'Metamorphic Transfer':
    'Type=Psionic ' +
    'Require=' +
      '"wisdom >= 13",' +
      '"masterLevel >= 5"',
  'Mind Over Body':
    'Type=General ' +
    'Require=' +
      '"constitution >= 13"',
  'Narrow Mind':
    'Type=Psionic ' +
    'Require=' +
      '"wisdom >= 13"',
  'Open Minded':
    'Type=General',
  'Opportunity Power':
    'Type=Metapsionic',
  'Overchannel':
    'Type=Psionic',
  'Power Penetration':
    'Type=Psionic',
  'Power Specialization':
    'Type=Psionic ' +
    'Require=' +
      '"manifesterLevel >= 4",' +
      '"features.Weapon Focus (Ray)"',
  'Psicrystal Affinity':
    'Type=Psionic ' +
    'Require=' +
      '"manifesterLevel >= 1"',
  'Psicrystal Containment':
    'Type=Psionic ' +
    'Require=' +
      '"manifesterLevel >= 3",' +
      '"features.Psicrystal Affinity"',
  'Psionic Affinity':
    'Type=General',
  'Psionic Body':
    'Type=Psionic',
  'Psionic Charge':
    'Type=Psionic ' +
    'Require=' +
      '"dexterity >= 13",' +
      '"features.Speed Of Thought"',
  'Psionic Dodge':
    'Type=Psionic ' +
    'Require=' +
      '"dexterity >= 13",' +
      '"features.Dodge"',
  'Psionic Endowment':
    'Type=Psionic',
  'Psionic Fist':
    'Type=Psionic ' +
    'Require=' +
      '"strength >= 13"',
  'Psionic Hole':
    'Type=General ' +
    'Require=' +
      '"constitution >= 13"',
  'Psionic Meditation':
    'Type=Psionic ' +
    'Require=' +
      '"wisdom >= 13",' +
      '"skills.Concentration >= 7"',
  'Psionic Shot':
    'Type=Psionic ' +
    'Require=' +
      '"features.Point Blank Shot"',
  'Psionic Talent':
    'Type=Psionic ' +
    'Require=' +
      '"powerPoints >= 1"',
  'Psionic Weapon':
    'Type=Psionic ' +
    'Require=' +
      '"strength >= 13"',
  'Quicken Power':
    'Type=Metapsionic',
  'Rapid Metabolism':
    'Type=General ' +
    'Require=' +
      '"constitution >= 13"',
  'Reckless Offense':
    'Type=General ' +
    'Require=' +
      '"baseAttack >= 1"',
  'Return Shot':
    'Type=Psionic ' +
    'Require=' +
      '"baseAttack >= 3",' +
      '"features.Point Blank Shot",' +
      '"features.Psionic Shot",' +
      '"features.Fell Shot"',
  'Scribe Tattoo':
    'Type="Item Creation" ' +
    'Require=' +
      '"manifesterLevel >= 3"',
  'Sidestep Charge':
    'Type=Psionic ' +
    'Require=' +
      '"dexterity >= 13",' +
      '"features.Dodge"',
  'Speed Of Thought':
    'Type=Psionic ' +
    'Require=' +
      '"wisdom >= 13"',
  'Split Psionic Ray':
    'Type=Metapsionic ' +
    'Require=' +
      '"sumMetapsionicFeats >= 2"',
  'Stand Still':
    'Type=General ' +
    'Require=' +
      '"strength >= 13"',
  'Talented':
    'Type=Psionic ' +
    'Require=' +
      '"features.Overchannel"',
  'Twin Power':
    'Type=Metapsionic',
  'Unavoidable Strike':
    'Type=Psionic ' +
    'Require=' +
      '"strength >= 13",' +
      '"baseAttack >= 5",' +
      '"features.Psionic Fist"',
  'Unconditional Power':
    'Type=Metapsionic',
  'Up The Walls':
    'Type=Psionic ' +
    'Require=' +
      '"wisdom >= 13"',
  'Widen Power':
    'Type=Metapsionic',
  'Wild Talent':
    'Type=General',
  'Wounding Attack':
    'Type=Psionic ' +
    'Require=' +
      '"baseAttack >= 8"'
};
DarkSun3E.FEATS = Object.assign({}, SRD35.FEATS, DarkSun3E.FEATS_ADDED);
DarkSun3E.FEATURES_ADDED = {

  // Classes
  'Accurate':'Section=combat Note="Ignore %V points of AC"',
  'Agile (Bard)':'Section=combat Note="+%V AC"',
  'Alchemy Dealer':
    'Section=feature Note="May buy alchemical ingredients for half price"',
  'Arena Guile':
    'Section=skill ' +
    'Note="+%{levels.Gladiator//2} Bluff (melee)/+%{levels.Gladiator//2} Sense Motive (melee)"',
  'Armor Class Optimization':'Section=combat Note="+1 AC"',
  'Armor Check Optimization':'Section=combat Note="-1 Armor check penalty"',
  'Armor Dexterity Optimization':
    'Section=combat Note="+1 maximum Dexterity bonus"',
  'Armor Weight Optimization':
    'Section=combat Note="Armor treated as one category lighter"',
  'Assume Domain':'Section=magic Note="Access to monarch domains"',
  'Awareness':
    'Section=combat Note="Never flat-footed; may always act in surprise round"',
  'Chance':'Section=feature Note="Reroll d20 %{levels.Bard<14?1:2}/dy"',
  'Chant':'Section=feature Note="R30\' %{levels.Gladiator//3-3} targets gain +2 AC, skill checks, and saves while chanting + 5 rd"',
  'Charisma Bonus Power Points':'Section=magic Note="+%V Power Points"',
  'Combat Stance':
    'Section=combat ' +
    'Note="+2 AC vs. first attack after taking stance as %1 action"',
  'Coolheaded':'Section=skill Note="May take 10 on Bluff and Diplomacy"',
  "Dragon's Fury":
    'Section=combat ' +
    'Note="+4 attack and damage, extra attack, and +%{levels.Gladiator*2} temporary HP for 10 rd"',
  'Dune Trader':
    'Section=skill ' +
    'Note="+4 Diplomacy (buying and selling)/Speak Language is a class skill"',
  'Exotic Weapon':
    'Section=feature Note="+%V Feat Count (Exotic Weapon Proficiency)"',
  'False Vulnerability':
    'Section=combat ' +
    'Note="No foe bonus when prone/May stand as a free action w/out foe AOO"',
  'Gladitorial Performance':'Section=combat Note="Talent effect %V/dy"',
  'Improved Parry':'Section=combat Note="Increased Parry effects"',
  'Improved Poison Use':
    'Section=combat Note="Apply poison as a free action w/out AOO"',
  'Improvised Materials':
    'Section=skill Note="DC +5 to craft poison from materials at hand"',
  'Intelligence Bonus Power Points':'Section=magic Note="+%V Power Points"',
  "Looter's Luck":
    'Section=skill ' +
    'Note="May use appraise to identify most valuable item in a pile"',
  'Martial Display':
    'Section=combat ' +
    'Note="+2 first attack after making display as %1 action"',
  'Martial Weapons':
    'Section=feature Note="+2 Feat Count (Martial Weapon Proficiency)"',
  'Mercy':'Section=combat Note="No nonlethal attack penalty"',
  'Mindblank':'Section=save Note="Immune to divination and mental effects"',
  'Mental Resistance':'Section=save Note="+2 vs. telepathy and charm"',
  "Nature's Speech":'Section=skill Note="Can speak with all animals"',
  'No Mercy':
    'Section=combat Note="Performs coup de grace as a standard action"',
  'Notoriety':
    'Section=feature,skill Note="+4 Leadership","+4 Bluff/+4 Intimidate"',
  'Parry':'Section=combat Note="Cancel foe attack w/%1opposed attack"',
  'Poison Dealer':
    'Section=feature Note="May buy poison ingredients for half price"',
  'Poison Resistance':'Section=save Note="+4 vs. poison"',
  'Poisonbane':'Section=skill Note="+4 Craft (Alchemy) (poison antidote)"',
  'Psion Powers':
    'Section=magic Note="%V Power Points and %1 Powers (Max Level %2)"',
  'Quick Thinking':'Section=combat Note="+%V Initiative"',
  'Scorpion\'s Touch':'Section=combat Note="+%V DC for poisons"',
  'Secular Aptitude':
    'Section=feature,skill ' +
    'Note="Secular Authority feat","+%{levels.Templar//2} Secular Authority"',
  'Shake Off':
    'Section=feature ' +
    'Note="Self or touched ally gains extra save to end mind-affecting effect"',
  'Sigil':
    'Section=magic ' +
    'Note="Cast <i>Arcane Mark</i>, <i>Purify Food And Drink</i>, and <i>Slave Scent</i> %{3+charismaModifier}/dy"',
  'Silver Tongue':'Section=skill Note="+2 Disguise/May retry Bluff at -5"',
  'Skilled':
    'Section=skill ' +
    'Note="+%{levels.Bard//2} on %V choices of Appraise, Bluff, Craft, Diplomacy, Heal, Perform, Profession, Sense Motive, Sleight of Hand"',
  'Smokestick Application':
    'Section=combat Note="Apply poison to 10\' cu via smokestick"',
  'Smuggler':'Section=skill Note="+%V Bluff/+%V Sleight Of Hand"',
  'Speed Reactions':
    'Section=combat ' +
    'Note="Trade up to -%{baseAttack} attack in current round for equal Initiative bonus for remainder of combat"',
  'Streetsmart':'Section=skill Note="+2 Gather Information/+2 Intimidate"',
  'Superior Feint':'Section=combat Note="Free action feint 1/rd"',
  'Taunt':
    'Section=combat ' +
    'Note="R30\' Inflicts -%V attack, damage, and saves vs. fear and charm on foes for 5 rd"',
  'Team Strike':
    'Section=combat ' +
    'Note="May distract foe to give ally +%V attack and +%Vd4 damage"',
  'Threatening Glare':'Section=combat Note="R30\' Gaze causes fear in creatures w/fewer HD (DC %{10+levels.Gladiator//2+charismaBonus} neg)"',
  'Trick':'Section=skill Note="R30\' Opposed bluff dazes %{levels.Gladiator//3-2} targets for 1 rd"',
  'Versatile':'Section=skill Note="Two chosen skills are class skills"',
  'Wasteland Trapsense':'Section=skill Note="Use Trap Sense w/natural hazards"',
  'Wisdom Bonus Power Points':'Section=magic Note="+%V Power Points"',

  // Prestige Classes
  'Additional Domain':'Section=magic Note="Access to third domain"',
  'Agent':'Section=feature Note="Leadership features w/score %V"',
  'Allies':
    'Section=feature ' +
    'Note="Receives favors from connected organization or powerful individual"',
  'Arch Defiler Bonus Feats':'Section=feature Note="%V Arch Defiler feats"',
  'Blaze Trail':
    'Section=ability,feature ' +
    'Note="+5 Speed/+5 Speed in favored terrain",' +
         '"Guide %V companions at full speed"',
  'Casting Time Metamagic':
    'Section=magic ' +
    'Note="Double casting time to apply metamagic feat w/out using higher spell slot %V/dy"',
  'Contact':'Section=feature Note="Can call in favor %V/wk"',
  'Crowd Support':
    'Section=combat Note="+%V attack and damage when viewed by %1 spectators"',
  'Damage Reduction':'Section=combat Note="DR %V/-"',
  'Dazzle':
    'Section=skill ' +
    'Note="R90\' Opposed bluff inflicts -1 attack, ability, skill, and save on %V targets"',
  'Discipline Insight':'Section=feature Note="FILL"',
  'Distributive Bargaining':
    'Section=feature,skill ' +
    'Note="%V% discount on purchased goods","+%V or +%1 on house-linked skill"',
  'Dosage':'Section=feature Note="Poison preparation yields double dose"',
  'Elemental Focus':'Section=magic Note="+%V DC on %1 spells"',
  'Elemental Shield':'Section=feature Note="FILL"',
  'Empower Poison':
    'Section=skill Note="Increase poison cost by 50% for +50% effect"',
  'Energy Resistance':'Section=save Note="+%1 vs %2 damage"',
  'Extend Poison':
    'Section=skill ' +
    'Note="Increase poison cost by 25% to alter onset time by 1 hr"',
  'Fame':'Section=feature Note="Increased Reputation effects"',
  'Fast Talk':'Section=skill Note="Retry failed Bluff and Diplomacy at -5"',
  'Favored Terrain':
    'Section=feature Note="Choose terrain type instead of favored enemy"',
  'Fearless Presence':
    'Section=save Note="Immune vs. fear; R10\' Allies +4 vs. fear"',
  'Finishing Move':
    'Section=combat Note="May perform coup de grace as free action"',
  'Forethought':'Section=feature Note="FILL"',
  'Grove Master Spells':'Section=magic Note="%V in guarded lands"',
  'Guarded Lands':
    'Section=feature Note="Detect defilement on 20\' sq mile protected area"',
  'Hard March':
    'Section=save Note="+%V Fortitude (forced march) for self and 1 companion"',
  'Identify Poison':'Section=skill Note="Safely identify any poison"',
  'Ignore Element':'Section=feature Note="Unaffected by %V for %1 rd 1/dy"',
  'Improved Fast Talk':
    'Section=skill Note="Make rushed Diplomacy check at -5 penalty"',
  'Improved Signature Move':
    'Section=combat ' +
    'Note="Select second Signature Move effect or double existing effect"',
  'Integrative Bargaining':
    'Section=feature Note="Improved Distributive Bargaining effects"',
  'Legend':
    'Section=feature ' +
    'Note="Increased Reputation effects/NPC initial attitude improves 1 step"',
  'Linguist (Dune Trader)':
    'Section=skill ' +
    'Note="DC 15 or 25 Int or Decipher Script check to understand unknown language"',
  'Master Scout Bonus Feats':'Section=feature Note="1 Master Scout feat"',
  'Maximize Poison':
    'Section=skill Note="Increase poison cost by 75% to maximize effects"',
  'Metamagic Raze':
    'Section=magic ' +
    'Note="Trade 5\' increase in defiling radius for 1 level metamagic spell reduction"',
  'Open Arms':'Section=skill Note="+%V Diplomacy"',
  'Painful Radius':'Section=magic Note="+1 penalty w/in defiling radius"',
  'Poison Immunity':'Section=save Note="Immune vs. poison"',
  'Poison Secret':'Section=feature Note="%V selections"',
  "Poisoner's Fortitude":
    'Section=save Note="Trade -2 Wis for +4 Fortitude vs. poison"',
  'Power Element':'Section=magic Note="%V spells inflict +%1 damage"',
  'Psilogism':'Section=feature Note="FILL"',
  'Psion Bonus Feats':'Section=feature Note="%V Psion feats"',
  'Psionic Acumen':'Section=feature Note="FILL"',
  'Psionic Rationalization':'Section=feature Note="FILL"',
  'Quicken Poison':
     'Section=skill ' +
     'Note="Double poison cost to reduce secondary effects onset to 1 rd"',
  'Reputation':
    'Section=feature,skill ' +
    'Note="+%V Leadership score",' +
         '"+%V Bluff/+%V Diplomacy/+%V Gather Information/+%V Intimidate"',
  'Roar Of The Crowd':
    'Section=combat Note="Successful attack give +1 attack in same rd"',
  'Sacrifice':
    'Section=magic ' +
    'Note="Trade -1 HP for negating each 5\' of defilement of guarded lands"',
  'Schoolmaster':'Section=feature Note="FILL"',
  'Signature Move':
    'Section=combat ' +
    'Note="+2 choice of disarm, sunder, trip, or combat Bluff and Sense Motive, or +1 AC when fighting defensively"',
  'Smite Intruder':'Section=combat Note="+%V attack; +%1 damage %2/dy"',
  'Smite Opponent':
    'Section=combat Note="+%1 attack/+%2 damage vs. evil foe %V/dy"',
  'Spell Channeling':'Section=magic Note="Deliver touch spells via weapon%1"',
  'Spell-Like Abilities':
    'Section=magic ' +
    'Note="Cast <i>Defiler Scent</i>, <i>Detect Magic</i>, <i>Slave Scent</i> %{wisdomModifier+3}/dy"',
  'Spontaneous Domain Spells':
    'Section=magic ' +
    'Note="Cast domain, <i>Cure</i>, or <i>Inflict</i> spell in place of known spell"',
  'Summon Elemental':'Section=magic Note="Summon %V elemental %1/dy"',
  'Sustenance':
    'Section=feature Note="Need no food or water while on guarded lands"',
  'Swift Strike':'Section=combat Note="+%Vd6 damage vs. flat-footed foe"',
  'Tainted Aura':
    'Section=skill ' +
    'Note="R%1\' -%V Bluff/-%V Diplomacy/-%V Gather Information/-%V Handle Animal/+%V Intimidation"',
  'Taunt (Dune Trader)':
    'Section=combat Note="Target can attack only self for 1 rd (DC %V Wis neg)"',
  'Templar Knight Bonus Feats':'Section=feature Note="%V Fighter Feats"',
  'Uncanny Stealth':
    'Section=skill Note="No Hide or Move Silently penalty at normal speed%1"',
  'Weapon Mastery':'Section=combat Note="+2 damage w/focused weapon"',

  // Feats
  'Ancestral Knowledge (Blue Age)':
    'Section=skill Note="+10 Knowledge (History) (blue age)"',
  'Ancestral Knowledge (Green Age)':
    'Section=skill Note="+10 Knowledge (History) (green age)"',
  'Ancestral Knowledge (Cleansing Wars)':
    'Section=skill Note="+10 Knowledge (History) (cleansing wars)"',
  'Arena Clamor':
    'Section=combat ' +
    'Note="R60\' After successful critical, allies gain +2 attack for 1 rd"',
  'Brutal Attack':
    'Section=combat ' +
    'Note="R10\' After successful critical, foes become shaken for %{charisma Modifier} rd (DC %{10+level//2+charismaModifier} neg)"',
  'Bug Trainer':'Section=skill Note="May train vermin"',
  'Commanding Presence':
    'Section=skill Note="DC 20 Diplomacy remove harmful condition from ally"',
  'Concentrated Fire':
    'Section=combat ' +
    'Note="1-4 allies add equal amount to simultaneous ranged attack on single target"',
  'Cornered Fighter':
    'Section=feature Note="+2 attack and AC against flanking foes"',
  'Defender Of The Land':
    'Section=magic Note="+1 caster level and +1 damage/die vs. defilers"',
  'Dissimulated':'Section=skill Note="+%V Bluff"',
  "Drake's Child":
    'Section=save ' +
    'Note="+1 Fortitude/+1 Will/+1 vs. ability damage, energy drain, and death effects"',
  'Elemental Cleansing':
    'Section=combat Note="Successful turn inflicts 2d6 energy damage"',
  'Faithful Follower':'Section=save Note="+5 vs. fear w/in 20\' of leader"',
  'Favorite':
    'Section=feature,skill ' +
    'Note="+4 Secular Authority use","+2 Diplomacy (secular authority)"',
  'Fearsome':'Section=skill Note="+%V Intimidate"',
  'Field Officer':'Section=skill Note="+2 Diplomacy/+2 Knowledge (Warcraft)"',
  'Gladitorial Entertainer':
    'Section=combat Note="+%V gladitorial performance/dy"',
  'Greasing The Wheels':'Section=skill Note="Adept at giving bribes"',
  'Hard As A Rock':
    'Section=combat ' +
    'Note="Does not die immediately from massive damage; 30%/rd chance of stabilizing, 30%/hr of becoming conscious"',
  'Implacable Defender':
    'Section=combat Note="+2 vs. bull rush, overrun, and trip"',
  'Improved Sigil':
    'Section=magic Note="Cast 2 chosen spells as spell-like ability 1/dy"',
  'Improviser':'Section=feature Note="-1 attack penalty w/improvised weapons"',
  'Innate Hunter':
    'Section=combat,skill Note="+1 attack (animals)","+1 Survival (hunting)"',
  'Intimidating Presence':
    'Section=combat Note="May demoralize %{charismaModifier} foes/rd"',
  'Inspiring Presence':
    'Section=combat Note="R10\' Allies +%{charismaModifier} Will saves"',
  'Kiltektet':'Section=skill Note="Knowledge is a class skill"',
  'Linguist':
    'Section=skill Note="+2 Language Count/Speak Language is a class skill"',
  'Mastryrial Blood':'Section=save Note="+4 vs. poison"',
  'Path Dexter':
    'Section=magic ' +
    'Note="+1 caster level on %V abjuration or divination spells"',
  'Path Sinister':
    'Section=magic ' +
    'Note="+1 caster level on %V evocation or necromancy spells"',
  'Protective':
    'Section=combat ' +
    'Note="Worn gear gains +4 saves; may make DC 10+damage Reflex to transfer damage to self"',
  'Psionic Mimicry':
    'Section=magic ' +
    'Note="May make DC 10+spell level Bluff to disguise spells as psionics"',
  'Psionic Schooling':
    'Section=ability ' +
    'Note="Choice of psion, psychic warrior, or wilder is a favored class"',
  'Raised By Beasts':
    'Section=skill ' +
    'Note="+%{level+charismaModifier} Diplomacy (chosen animal type)/+2 Handle Animal (chosen animal type)"',
  'Rotate Lines':'Section=combat Note="R5\' Swap positions w/ally w/out AOO"',
  'Secular Authority':
    'Section=skill ' +
    'Note="Use Diplomacy to requisition, intrude, accuse, and judge"',
  'Shield Wall':
    'Section=combat Note="+1 AC for each adjacent ally w/large shield"',
  'Sniper':'Section=skill Note="+5 Hide (firing missiles)"',
  'Spear Wall':'Section=combat Note="x3 damage w/readied weapon"',
  'Tactical Expertise':
    'Section=combat Note="May coordinate allies as standard action"',
  'Teamwork':'Section=combat Note="May Aid Another as a move action"',
  'Trader':'Section=skill Note="+2 Appraise/+2 Bluff"',
  'Wastelander':'Section=save,skill Note="+1 Fortitude","+2 Survival"',
  'Elemental Affinity':
    'Section=save ' +
    'Note="Spend 1 Turn Undead for +4 Fortitude vs. patron energy for %{charismaModifier} rd"',
  'Elemental Might':
    'Section=combat ' +
    'Note="Spend 1 Turn Undead for weapon +%{charismaModifier} patron energy damage for 1 rd"',
  'Elemental Vengeance':
    'Section=combat ' +
    'Note="Spend 1 Turn Undead for +2d6 patron energy damage vs. undead for 1 rd"',
  'Superior Blessing':
    'Section=combat Note="Spend 1 Turn Undead for dbl blessed element damage"',
  'Elemental Manifestation':
    'Section=magic Note="+2 DC on manifest power w/patron element"',
  'Focused Mind':
    'Section=skill ' +
    'Note="+2 Appraisal, Decipher Script, and Search while focused"',
  'Greater Hidden Talent':
    'Section=magic Note="Gain 3 Power Points and 1 1st-level power"',
  'Improved Dwarven Focus':
    'Section=save Note="+2 on focus-related checks while focused"',
  'Improved Elf Run':'Section=ability Note="+15\' Speed while focused"',
  'Improved Hidden Talent':
    'Section=feature Note="FILL"',
  'Jump Charge':
    'Section=combat ' +
    'Note="Jumping 10\' as part of charge multiplies psionic damage by 1.5"',
  'Pterran Telepathy':
    'Section=magic Note="Use <i>Missive</i> to communicate w/all humanoids"',
  'Agonizing Radius':'Section=magic Note="+1 penalty w/in defiling radius"',
  'Controlled Raze':
    'Section=magic ' +
    'Note="+5\' defiling radius; may specify unaffected 5\' squares"',
  'Distance Raze':
    'Section=magic Note="Cast defiling circle up to %{casterLevel*10}\' away"',
  'Destructive Raze':
    'Section=feature ' +
    'Note="Evocation spells inflict +1 damage/die while defiling "',
  'Efficient Raze':
    'Section=magic ' +
    'Note="Treat terrain as one category better while defiling"',
  'Exterminating Raze':
    'Section=magic ' +
    'Note="Plant creatures in defiling area suffer 4 HP/spell level"',
  'Fast Raze':
    'Section=magic ' +
    'Note="Spend move action for +1 caster level and +5\' defiling radius"',
  'Sickening Raze':
    'Section=magic Note="Creatures in defiling radius suffer nausea for 1 rd"',
  'Active Glands':'Section=combat Note="+2 poisonous bite/dy"',
  'Advanced Antennae':'Section=skill Note="R30\' Detect creatures via smell"',
  'Blend':'Section=skill Note="+3 Hide (arid and desert areas)"',
  'Blessed By The Ancestors':
    'Section=save Note="+1 Fortitude/+1 Reflex/+1 Will"',
  'Cannibalism Ritual':
    'Section=ability ' +
    'Note="Eating higher HD foe gives +2 Strength, Dexterity, or Constitution for 1 dy"',
  'Dwarven Vision':'Section=feature Note="Darkvision feature"',
  'Elfeater':
    'Section=combat,skill ' +
    'Note=' +
      '"+1 attack and +2 critical confirm vs. elves",' +
      '"+2 Bluff (elves)/+2 Listen (elves)/+2 Sense Motive (elves)"',
  "Improved Gyth'sa":
    'Section=combat ' +
    'Note="Recover {level*2} HP from full rest; dbl recovery from Heal skill"',
  'Tikchak':
    'Section=combat,skill ' +
    'Note=' +
      '"Weapon Proficiency (Chatkcha)",' +
      '"+%{wisdomModifier} Survival (hunting)"',
  'Tokchak':'Section=combat Note="Adjacent allies gain +1 Reflex"',
  'Artisan':'Section=skill Note="+3 Concentration/+3 choice of Craft"',
  'Astrologer':
    'Section=skill ' +
    'Note="+3 Knowledge (Nature)/+5 Survival (avoid getting lost outdoors)"',
  'Companion':'Section=skill Note="Assisting skill grants +3 bonus"',
  'Disciplined':'Section=save,skill Note="+1 Will","+3 Concentration"',
  'Freedom':
    'Section=combat ' +
    'Note="May take extra move or standard action %{level//5+1}/dy"',
  'Giant Killer':
    'Section=combat Note="+4 confirm critical vs. giants/+2 AC vs. giants"',
  'Jungle Fighter':'Section=combat Note="+2 AC in forest"',
  'Legerdemain':'Section=skill Note="+3 Open Lock/+3 Sleight Of Hand"',
  'Mansabar':'Section=save,skill Note="+1 Fortitude","+3 Intimidate"',
  'Mekillothead':'Section=save,skill Note="+1 Will","+3 Intimidate"',
  'Metalsmith':'Section=skill Note="No penalty on Craft w/metal"',
  "Nature's Child":'Section=skill Note="+3 Knowledge (Nature)/+3 Survival"',
  'Paranoid':'Section=save,skill Note="+1 Reflex","+3 Sense Motive"',
  'Performance Artist':
    'Section=skill ' +
    'Note="+3 choice of Perform/+3 Knowledge (Local) (choice of region)"',
  'Tarandan Method':'Section=magic Note="+2 DC from chosen discipline"',

  // XPH
  'Aligned Attack':'Section=feature Note="FILL"',
  'Antipsionic Magic':'Section=feature Note="FILL"',
  'Autonomous':'Section=feature Note="FILL"',
  'Body Fuel':'Section=feature Note="FILL"',
  'Boost Construct':'Section=feature Note="FILL"',
  'Burrowing Power':'Section=feature Note="FILL"',
  'Chain Power':'Section=feature Note="FILL"',
  'Chaotic Mind':'Section=feature Note="FILL"',
  'Cloak Dance':'Section=feature Note="FILL"',
  'Closed Mind':'Section=feature Note="FILL"',
  'Combat Manifestation':'Section=feature Note="FILL"',
  'Craft Dorje':'Section=feature Note="FILL"',
  'Craft Psicrown':'Section=feature Note="FILL"',
  'Craft Psionic Arms And Armor':'Section=feature Note="FILL"',
  'Craft Psionic Construct':'Section=feature Note="FILL"',
  'Craft Universal Item':'Section=feature Note="FILL"',
  'Deadly Precision':'Section=feature Note="FILL"',
  'Deep Impact':'Section=feature Note="FILL"',
  'Delay Power':'Section=feature Note="FILL"',
  'Empower Power':'Section=feature Note="FILL"',
  'Enlarge Power':'Section=feature Note="FILL"',
  'Expanded Knowledge':'Section=feature Note="FILL"',
  'Extend Power':'Section=feature Note="FILL"',
  'Fell Shot':'Section=feature Note="FILL"',
  'Focused Sunder':'Section=feature Note="FILL"',
  'Force Of Will':'Section=feature Note="FILL"',
  'Ghost Attack':'Section=feature Note="FILL"',
  'Greater Manyshot':'Section=feature Note="FILL"',
  'Greater Power Penetration':'Section=feature Note="FILL"',
  'Greater Psionic Shot':'Section=feature Note="FILL"',
  'Greater Psionic Weapon':'Section=feature Note="FILL"',
  'Hostile Mind':'Section=feature Note="FILL"',
  'Imprint Stone':'Section=feature Note="FILL"',
  'Improved Psicrystal':'Section=feature Note="FILL"',
  'Inquisitor':'Section=feature Note="FILL"',
  'Maximize Power':'Section=feature Note="FILL"',
  'Mental Leap':'Section=feature Note="FILL"',
  'Mental Resistance':'Section=feature Note="FILL"',
  'Metamorphic Transfer':'Section=feature Note="FILL"',
  'Mind Over Body':'Section=feature Note="FILL"',
  'Narrow Mind':'Section=feature Note="FILL"',
  'Open Minded':'Section=feature Note="FILL"',
  'Opportunity Power':'Section=feature Note="FILL"',
  'Overchannel':'Section=feature Note="FILL"',
  'Power Penetration':'Section=feature Note="FILL"',
  'Power Specialization':'Section=feature Note="FILL"',
  'Psicrystal Affinity':'Section=feature Note="FILL"',
  'Psicrystal Containment':'Section=feature Note="FILL"',
  'Psionic Affinity':'Section=feature Note="FILL"',
  'Psionic Body':'Section=feature Note="FILL"',
  'Psionic Charge':'Section=feature Note="FILL"',
  'Psionic Dodge':'Section=feature Note="FILL"',
  'Psionic Endowment':'Section=feature Note="FILL"',
  'Psionic Fist':'Section=feature Note="FILL"',
  'Psionic Hole':'Section=feature Note="FILL"',
  'Psionic Meditation':'Section=feature Note="FILL"',
  'Psionic Shot':'Section=feature Note="FILL"',
  'Psionic Talent':'Section=feature Note="FILL"',
  'Psionic Weapon':'Section=feature Note="FILL"',
  'Quicken Power':'Section=feature Note="FILL"',
  'Rapid Metabolism':'Section=feature Note="FILL"',
  'Reckless Offense':'Section=feature Note="FILL"',
  'Return Shot':'Section=feature Note="FILL"',
  'Scribe Tattoo':'Section=feature Note="FILL"',
  'Sidestep Charge':'Section=feature Note="FILL"',
  'Speed Of Thought':'Section=feature Note="FILL"',
  'Split Psionic Ray':'Section=feature Note="FILL"',
  'Stand Still':'Section=feature Note="FILL"',
  'Talented':'Section=feature Note="FILL"',
  'Twin Power':'Section=feature Note="FILL"',
  'Unavoidable Strike':'Section=feature Note="FILL"',
  'Unconditional Power':'Section=feature Note="FILL"',
  'Up The Walls':'Section=feature Note="FILL"',
  'Widen Power':'Section=feature Note="FILL"',
  'Wild Talent':'Section=feature Note="FILL"',
  'Wounding Attack':'Section=feature Note="FILL"',

  // Races
  'Aarakocra Ability Adjustment':
    'Section=ability Note="-2 Strength/+4 Dexterity/-2 Charisma"',
  'Aerial Dive':'Section=combat Note="Dbl damage after 30\' dive"',
  'Axis Alignment':
    'Section=ability Note="Half of alignment changes each morning"',
  'Beak Attack':'Section=combat Note="Attack with beak"',
  'Claustrophobic':'Section=feature Note="-2 all rolls in enclosed space"',
  'Desert Camouflage':'Section=skill Note="+4 Hide (arid and sandy areas)"',
  'Dwarven Blood':'Section=feature Note="Dwarf for racial effects"',
  'Excellent Vision':'Section=skill Note="+6 Spot (daylight)"',
  'Elf Run':
    'Section=ability ' +
    'Note="Successful concentration checks allow running for days"',
  'Extended Activity':
    'Section=feature Note="May perform 12 hrs hard labor w/out fatigue"',
  'Fast':'Section=ability Note="+10 Speed"',
  'Flying':'Section=ability Note="90\' Fly Speed"',
  'Focused':'Section=feature Note="+1 all rolls related to focus"',
  'Giant Blood':'Section=feature Note="Giant for racial effects"',
  'Half-Elf Ability Adjustment':
    'Section=ability Note="+2 Dexterity/-2 Charisma"',
  'Half-Giant Ability Adjustment':
    'Section=ability ' +
    'Note="+8 Strength/-2 Dexterity/+4 Constitution/-4 Intelligence/-4 Wisdom/-4 Charisma"',
  'Imitator':'Section=skill Note="+2 Disguise (elf or human)"',
  'Keen Senses':'Section=skill Note="+2 Listen/+2 Perform/+2 Search/+2 Spot"',
  'Leap':'Section=skill Note="+30 Jump"',
  'Life Path':'Section=feature Note="Choice of favored class"',
  'Limited Darkvision':'Section=feature Note="30\' b/w vision in darkness"',
  'Monstrous Humanoid':
    'Section=save Note="Unaffected by spells that effect only humanoids"',
  'Mul Ability Adjustment':
    'Section=ability Note="+4 Strength/+2 Constitution/-2 Charisma"',
  'Multiple Limbs':
    'Section=combat ' +
    'Note="May use Multiweapon Fighting and Multiattack feats with all four arms"',
  'Poison':
    'Section=combat ' +
    'Note="Bite for 1d6 Dex + paralysis (DC %{constitutionModifier+11} neg) 1/dy"',
  'Poor Hearing':'Section=skill Note="-2 Listen"',
  'Precise':'Section=combat Note="+1 attack with slings and thrown"',
  'Psi-Like Ability':
    'Section=magic Note="Use <i>Missive</i> at will w/reptiles"',
  'Pterran Ability Adjustment':
    'Section=ability Note="-2 Dexterity/+2 Wisdom/+2 Charisma"',
  'Race Level Adjustment':'Section=ability Note="-%V Level"',
  'Resist Temperature':
    'Section=save Note="Treat extreme temperature as 1 level lower"',
  'Rugged':'Section=save Note="Nonlethal DR 1/-"',
  'Sharp Senses':'Section=skill Note="+4 Listen/+4 smell and taste"',
  'Suspect':'Section=skill Note="-2 Diplomacy (other races)"',
  'Thri-kreen Ability Adjustment':
    'Section=ability ' +
    'Note="+2 Strength/+4 Dexterity/-2 Intelligence/+2 Wisdom/-4 Charisma"',
  'Tireless':'Section=save Note="+4 extended physical action"',
  'Wildlander':'Section=skill Note="+2 Handle Animal/+2 Survival"'

};
DarkSun3E.FEATURES = Object.assign({}, SRD35.FEATURES, DarkSun3E.FEATURES_ADDED);
DarkSun3E.GOODIES = Object.assign({}, SRD35.GOODIES);
DarkSun3E.LANGUAGES_ADDED = {
  'Kreen':'',
  'Sauran':''
};
DarkSun3E.PATHS = {
  'Broken Sands Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Burning Eyes Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Cold Malice Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Dead Heart Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Decaying Touch Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Desert Mirage Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Drowning Despair Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Earthen Embrace Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Fiery Wrath Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Forged Stone Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Furious Storm Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Ill Wind Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  "Light's Revelation Domain":
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Living Waters Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  "Mountains Fury Domain":
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Refreshing Storm Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Rolling Thunder Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Ruinous Swarm Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Sky Blitz Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Smoldering Spirit Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Soul Slayer Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Soaring Spirit Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  'Sun Flare Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric',
  // From SRD v3.5
  'Animal Domain':SRD35.PATHS['Animal Domain'],
  'Chaos Domain':SRD35.PATHS['Chaos Domain'],
  'Death Domain':SRD35.PATHS['Death Domain'],
  'Destruction Domain':SRD35.PATHS['Destruction Domain'],
  'Knowledge Domain':SRD35.PATHS['Knowledge Domain'],
  'Law Domain':SRD35.PATHS['Law Domain'],
  'Magic Domain':SRD35.PATHS['Magic Domain'],
  'Plant Domain':SRD35.PATHS['Plant Domain'],
  'Protection Domain':SRD35.PATHS['Protection Domain'],
  'Strength Domain':SRD35.PATHS['Strength Domain'],
  'Trickery Domain':SRD35.PATHS['Trickery Domain'],
  'War Domain':SRD35.PATHS['War Domain'],
  // From Complete Divine
  'Glory Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Powerful Turning"',
  'Madness Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Mad Insight"',
  'Mind Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Mental Insight"',
  // From Forgotten Realms Campaign Setting
  'Charm Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Charisma Boost"',
  'Nobility Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Inspire Allies"'
};
DarkSun3E.DEITIES = {
  'None':'Domain="' + QuilvynUtils.getKeys(DarkSun3E.PATHS).filter(x => x.match(/Domain$/)).map(x => x.replace(' Domain', '')).join('","') + '"',
  'Air':
    'Alignment=N ' +
    'Domain=' +
      '"Sun Flare","Furious Storm","Ill Wind","Rolling Thunder",' +
      '"Soaring Spirit"',
  'Earth':
    'Alignment=N ' +
    'Domain=' +
      '"Decaying Touch","Earthen Embrace","Forged Stone","Ruinous Swarm",' +
      '"Mountains Fury"',
  'Fire':
    'Alignment=N ' +
    'Domain=' +
      '"Burning Eyes","Sky Blitz","Mountains Fury","Smoldering Spirit",' +
      '"Fiery Wrath"',
  'Magma':
    'Alignment=N ' +
    'Domain=' +
      '"Broken Sands","Dead Heart","Ill Wind","Mountains Fury"',
  'Rain':
    'Alignment=N ' +
    'Domain=' +
      '"Cold Malice","Decaying Touch","Furious Storm","Refreshing Storm"',
  'Silt':
    'Alignment=N ' +
    'Domain=' +
      '"Broken Sands","Decaying Touch","Dead Heart","Soul Slayer"',
  'Sun':
    'Alignment=N ' +
    'Domain=' +
      '"Sun Flare","Light\'s Revelation","Desert Mirage","Fiery Wrath"',
  'Water':
    'Alignment=N ' +
    'Domain=' +
      '"Desert Mirage","Drowning Despair","Sky Blitz","Living Waters"'
};
DarkSun3E.POWERS = {
  'Accellerate':
    'Discipline=Psychometabolism ' +
    'Level=Egoist4,Warrior3 ' +
    'Cost=7,5 ' +
    'Description="FILL"',
  'Antidote Simulation':
    'Discipline=Psychometabolism ' +
    'Level=Psion3,Warrior2 ' +
    'Cost=5,3 ' +
    'Description="FILL"',
  'Aura Reading':
    'Discipline=Clairsentience ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Beacon':
    'Discipline=Psychokinesis ' +
    'Level=Psion3 ' +
    'Cost=5 ' +
    'Description="FILL"',
  'Bioflexibility':
    'Discipline=Psychometabolism ' +
    'Level=Psion1,Warrior1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Cast Missile':
    'Discipline=Psychokinesis ' +
    'Level=Psion1,Warrior1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Cause Sleep':
    'Discipline=Psychometabolism ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Complete Healing':
    'Discipline=Psychometabolism ' +
    'Level=Egoist7 ' +
    'Cost=13 ' +
    'Description="FILL"',
  'Concentrate Water':
    'Discipline=Psychokinesis ' +
    'Level=Psion2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Cosmic Awareness':
    'Discipline=Clairsentience ' +
    'Level=Seer9 ' +
    'Cost=17 ' +
    'Description="FILL"',
  'Cryokinesis':
    'Discipline=Psychokinesis ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Death Field':
    'Discipline=Psychometabolism ' +
    'Level=Egois3,Warrior3 ' +
    'Cost=5 ' +
    'Description="FILL"',
  'Deflect Strike':
    'Discipline=Psychokinesis ' +
    'Level=Psion1,Warrior1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Detect Life':
    'Discipline=Clairsentience ' +
    'Level=Psion2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Detect Moisture':
    'Discipline=Clairsentience ' +
    'Level=Seer3 ' +
    'Cost=5 ' +
    'Description="FILL"',
  'Detonate':
    'Discipline=Psychokinesis ' +
    'Level=Psion4 ' +
    'Cost=7 ' +
    'Description="FILL"',
  'Dimensional Screen':
    'Discipline=Psychoportation ' +
    'Level=Psion6 ' +
    'Cost=11 ' +
    'Description="FILL"',
  'Electroerosion':
    'Discipline=Psychokinesis ' +
    'Level=Psion5 ' +
    'Cost=9 ' +
    'Description="FILL"',
  'Ghost Writing':
    'Discipline=Metacreativity ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Hallucination':
    'Discipline=Telepathy ' +
    'Level=Telepath5 ' +
    'Cost=9 ' +
    'Description="FILL"',
  'Hush':
    'Discipline=Telepathy ' +
    'Level=Psion1 ' +
    'Cost=1 ' + // Not specified
    'Description="FILL"',
  'Incorporeality':
    'Discipline=Psychoportation ' +
    'Level=Psion7 ' +
    'Cost=13 ' +
    'Description="FILL"',
  'Magnetizze':
    'Discipline=Psychokinesis ' +
    'Level=Psion4 ' +
    'Cost=7 ' +
    'Description="FILL"',
  'Mass Manipulation':
    'Discipline=Psychokinesis ' +
    'Level=Psion3 ' +
    'Cost=5 ' +
    'Description="FILL"',
  'Mindflame':
    'Discipline=Telepathy ' +
    'Level=Psion7 ' +
    'Cost=13 ' +
    'Description="FILL"',
  'Molecular Binding':
    'Discipline=Psychokinesis ' +
    'Level=Psion2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Nerve Manipulation':
    'Discipline=Psychometabolism ' +
    'Level=Psion5,Warrior5 ' +
    'Cost=9 ' +
    'Description="FILL"',
  'Pheromone Discharge':
    'Discipline=Psychometabolism ' +
    'Level=Psion2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Photosynthesis':
    'Discipline=Psychometabolism ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Pocket Dimension':
    'Discipline=Metacreativity ' +
    'Level=Shaper5 ' +
    'Cost=9 ' +
    'Description="FILL"',
  'Poison Simulation':
    'Discipline=Psychometabolism ' +
    'Level=Egoist7,Warrior6 ' +
    'Cost=13,11 ' +
    'Description="FILL"',
  'Psionic Alter Self':
    'Discipline=Psychometabolism ' +
    'Level=Psion2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Psionic Blink':
    'Discipline=Psychoportation ' +
    'Level=Psion3 ' +
    'Cost=5 ' +
    'Description="FILL"',
  'Psionic Calm Emotions':
    'Discipline=Telepathy ' +
    'Level=Psion2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Psionic Detect Poison':
    'Discipline=Clairsentience ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Psionic Draw':
    'Discipline=Psychometabolism ' +
    'Level=Psion1,Warrior1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Psionic Lighten Load':
    'Discipline=Psychometabolism ' +
    'Level=Psion3 ' +
    'Cost=5 ' +
    'Description="FILL"',
  'Psionic Locate':
    'Discipline=Clairsentience ' +
    'Level=Seer2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Psionic Sight':
    'Discipline=Clairsentience ' +
    'Level=Psion3 ' +
    'Cost=5 ' +
    'Description="FILL"',
  'Psionic Teleport Object':
    'Discipline=Psychoportation ' +
    'Level=Nomad7 ' +
    'Cost=13 ' +
    'Description="FILL"',
  'Psychic Tracking':
    'Discipline=Clairsentience ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Repugnance':
    'Discipline=Telepathy ' +
    'Level=Psion4 ' +
    'Cost=7 ' +
    'Description="FILL"',
  'Return Missile':
    'Discipline=Psychokinesis ' +
    'Level=Psion2,Warrior2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Sensory Suppression':
    'Discipline=Telepathy ' +
    'Level=Psion2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Sever The Tie':
    'Discipline=Psychokinesis ' +
    'Level=Psion2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Shadow Jump':
    'Discipline=Psychoportation ' +
    'Level=Psion4,Warrior4 ' +
    'Cost=7 ' +
    'Description="FILL"',
  'Share Strength':
    'Discipline=Psychometabolism ' +
    'Level=Egoist2,Warrior2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Tattoo Animation':
    'Discipline=Psychokinesis ' +
    'Level=Psion1,Warrior1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Trail Of Destruction':
    'Discipline=Clairsentience ' +
    'Level=Psion1 ' +
    'Cost=1 ' + // Not specified
    'Description="FILL"',
  'Truthear':
    'Discipline=Clairsentience ' +
    'Level=Seer3 ' +
    'Cost=5 ' +
    'Description="FILL"',
  "Watcher's Ward":
    'Discipline=Clairsentience ' +
    'Level=Psion2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Weather Prediction':
    'Discipline=Clairsentience ' +
    'Level=Psion2 ' +
    'Cost=5 ' +
    'Description="FILL"',
  'Wild Leap':
    'Discipline=Psychoportation ' +
    'Level=Psion1,Warrior1 ' +
    'Cost=1 ' +
    'Description="FILL"',

  // XPH
  'Adapt Body':
    'Discipline=Psychometabolism ' +
    'Level=Psion5,Warrior5 ' +
    'Cost=9 ' +
    'Description="FILL"',
  'Affinity Field':
    'Discipline=Psychometabolism ' +
    'Level=Psion9 ' +
    'Cost=17 ' +
    'Description="FILL"',
  'Anchored Navigation':
    'Discipline=Clairsentience ' +
    'Level=Seer4 ' +
    'Cost=7 ' +
    'Description="FILL"',
  'Animal Affinity':
    'Discipline=Psychometabolism ' +
    'Level=Egoist2,Warrior2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Apopsi':
    'Discipline=Telepathy ' +
    'Level=Psion9 ' +
    'Cost=17 ' +
    'Description="FILL"',
  'Assimilate':
    'Discipline=Psychometabolism ' +
    'Level=Psion9 ' +
    'Cost=17 ' +
    'Description="FILL"',
  'Astral Caravan':
    'Discipline=Psychoportation ' +
    'Level=Nomad3 ' +
    'Cost=5 ' +
    'Description="FILL"',
  'Astral Construct':
    'Discipline=Metacreativity ' +
    'Level=Shaper1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Astral Seed':
    'Discipline=Metacreativity ' +
    'Level=Shaper8 ' +
    'Cost=15 ' +
    'Description="FILL"',
  'Astral Traveler':
    'Discipline=Psychoportation ' +
    'Level=Psion1,Warrior1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Attraction':
    'Discipline=Telepathy ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Aura Alteration':
    'Discipline=Telepathy ' +
    'Level=Psion6 ' +
    'Cost=11 ' +
    'Description="FILL"',
  'Aura Sight':
    'Discipline=Clairsentience ' +
    'Level=Psion4 ' +
    'Cost=7 ' +
    'Description="FILL"',
  'Aversion':
    'Discipline=Telepathy ' +
    'Level=Telepath2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Baleful Teleport':
    'Discipline=Psychoportation ' +
    'Level=Nomad5 ' +
    'Cost=9 ' +
    'Description="FILL"',
  'Bend Reality':
    'Discipline=Clairsentience ' +
    'Level=Psion8 ' +
    'Cost=15 ' +
    'Description="FILL"',
  'Bestow Power':
    'Discipline=Telepathy ' +
    'Level=Psion2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Biofeedback':
    'Discipline=Psychometabolism ' +
    'Level=Psion2,Warrior1 ' +
    'Cost=3,1 ' +
    'Description="FILL"',
  'Bite The Wolf':
    'Discipline=Psychometabolism ' +
    'Level=Warrior1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Body Adjustment':
    'Discipline=Psychometabolism ' +
    'Level=Psion3,Warrior2 ' +
    'Cost=5,3 ' +
    'Description="FILL"',
  'Body Equilibrium':
    'Discipline=Psychometabolism ' +
    'Level=Psion2,Warrior2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Body Purification':
    'Discipline=Psychometabolism ' +
    'Level=Psion3,Warrior2 ' +
    'Cost=5,3 ' +
    'Description="FILL"',
  'Bolt':
    'Discipline=Metacreativity ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Brain Lock':
    'Discipline=Telepathy ' +
    'Level=Telepath2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Breath Of The Black Dragon':
    'Discipline=Psychometabolism ' +
    'Level=Psion6,Warrior6 ' +
    'Cost=11 ' +
    'Description="FILL"',
  'Burst':
    'Discipline=Psychoportation ' +
    'Level=Psion1,Warrior1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Call To Mind':
    'Discipline=Telepathy ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Call Weaponry':
    'Discipline=Psychoportation ' +
    'Level=Warrior1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Catapsi':
    'Discipline=Telepathy ' +
    'Level=Psion5,Warrior5 ' +
    'Cost=9 ' +
    'Description="FILL"',
  'Catfall':
    'Discipline=Psychoportation ' +
    'Level=Psion1,Warrior1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Chameleon':
    'Discipline=Psychometabolism ' +
    'Level=Egoist2,Warrior1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Clairtangent Hand':
    'Discipline=Clairsentience ' +
    'Level=Seer5 ' +
    'Cost=9 ' +
    'Description="FILL"',
  'Clairvoyant Sense':
    'Discipline=Clairsentience ' +
    'Level=Seer2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Claw Of Energy':
    'Discipline=Psychokinesis ' +
    'Level=Warrior4 ' +
    'Cost=7 ' +
    'Description="FILL"',
  'Claws Of The Beast':
    'Discipline=Psychometabolism ' +
    'Level=Warrior1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Claws Of The Vampire':
    'Discipline=Psychometabolism ' +
    'Level=Warrior3 ' +
    'Cost=5 ' +
    'Description="FILL"',
  'Cloud Mind':
    'Discipline=Telepathy ' +
    'Level=Psion2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Compression':
    'Discipline=Psychometabolism ' +
    'Level=Warror1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Conceal Thoughts':
    'Discipline=Telepathy ' +
    'Level=Psion1,Warrior1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Concealing Amorpha':
    'Discipline=Metacreativity ' +
    'Level=Psion2,Warrior2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Concussion Blast':
    'Discipline=Psychokinesis ' +
    'Level=Psion2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Control Air':
    'Discipline=Psychokinesis ' +
    'Level=Kineticist2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Control Body':
    'Discipline=Psychokinesis ' +
    'Level=Kineticist4 ' +
    'Cost=7 ' +
    'Description="FILL"',
  'Control Flames':
    'Discipline=Psychokinesis ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Control Light':
    'Discipline=Psychokinesis ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Control Object':
    'Discipline=Psychokinesis ' +
    'Level=Kineticist1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Control Sound':
    'Discipline=Psychokinesis ' +
    'Level=Psion2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Co-Opt Concentration':
    'Discipline=Telepathy ' +
    'Level=Psion6 ' +
    'Cost=11 ' +
    'Description="FILL"',
  'Correspond':
    'Discipline=Telepathy ' +
    'Level=Psion4 ' +
    'Cost=7 ' +
    'Description="FILL"',
  'Create Sound':
    'Discipline=Metacreativity ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Crisis Of Breath':
    'Discipline=Telepathy ' +
    'Level=Telepath3 ' +
    'Cost=5 ' +
    'Description="FILL"',
  'Crisis Of Life':
    'Discipline=Telepathy ' +
    'Level=Telepath7 ' +
    'Cost=13 ' +
    'Description="FILL"',
  'Crystal Shard':
    'Discipline=Metacreativity ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Crystalize':
    'Discipline=Metacreativity ' +
    'Level=Shaper6 ' +
    'Cost=11 ' +
    'Description="FILL"',
  'Danger Sense':
    'Discipline=Clairsentience ' +
    'Level=Psion3,Warrior3 ' +
    'Cost=5 ' +
    'Description="FILL"',
  'Death Urge':
    'Discipline=Telepathy ' +
    'Level=Psion4 ' +
    'Cost=7 ' +
    'Description="FILL"',
  'Deceleration':
    'Discipline=Psychoportation ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Decerebrate':
    'Discipline=Psychoportation ' +
    'Level=Psion7 ' +
    'Cost=13 ' +
    'Description="FILL"',
  'Deja Vu':
    'Discipline=Telepathy ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Demoralize':
    'Discipline=Telepathy ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Destiny Dissonance':
    'Discipline=Clairsentience ' +
    'Level=Seer1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Detect Hostile Intent':
    'Discipline=Telepathy ' +
    'Level=Psion2,Warrior2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Detect Psionics':
    'Discipline=Clairsentience ' +
    'Level=Psion1,Warrior1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Detect Remote Viewing':
    'Discipline=Clairsentience ' +
    'Level=Psion4 ' +
    'Cost=7 ' +
    'Description="FILL"',
  'Detect Teleportation':
    'Discipline=Clairsentience ' +
    'Level=Nomad1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Dimension Slide':
    'Discipline=Psychoportation ' +
    'Level=Warrior3 ' +
    'Cost=5 ' +
    'Description="FILL"',
  'Dimension Swap':
    'Discipline=Psychoportation ' +
    'Level=Nomad2,Warrior2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Disable':
    'Discipline=Telepathy ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Dismiss Ectoplasm':
    'Discipline=Metacreativity ' +
    'Level=Psion3 ' +
    'Cost=5 ' +
    'Description="FILL"',
  'Dispel Psionics':
    'Discipline=Psychokinesis ' +
    'Level=Psion3 ' +
    'Cost=5 ' +
    'Description="FILL"',
  'Dispelling Buffer':
    'Discipline=Psychokinesis ' +
    'Level=Kineticist6,Warrior6 ' +
    'Cost=11 ' +
    'Description="FILL"',
  'Dissipating Touch':
    'Discipline=Psychoportation ' +
    'Level=Psion1,Warrior1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Dissolving Touch':
    'Discipline=Psychometabolism ' +
    'Level=Warrior2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Dissolving Weapon':
    'Discipline=Psychometabolism ' +
    'Level=Warrior2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Distract':
    'Discipline=Telepathy ' +
    'Level=Psion1,Warrior1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Divert Teleport':
    'Discipline=Psychoportation ' +
    'Level=Psion7 ' +
    'Cost=13 ' +
    'Description="FILL"',
  'Dream Travel':
    'Discipline=Psychoportation ' +
    'Level=Nomad7 ' +
    'Cost=13 ' +
    'Description="FILL"',
  'Duodimensional Claw':
    'Discipline=Psychometabolism ' +
    'Level=Warrior3 ' +
    'Cost=5 ' +
    'Description="FILL"',
  'Greater Concealing Amorpha':
    'Discipline=Metacreativity ' +
    'Level=Shaper3,Warrior3 ' +
    'Cost=5 ' +
    'Description="FILL"',
  'Mass Cloud Mind':
    'Discipline=Telepathy ' +
    'Level=Psion6 ' +
    'Cost=11 ' +
    'Description="FILL"',
  'Psionic Banishment':
    'Discipline=Psychoportation ' +
    'Level=Nomad6 ' +
    'Cost=11 ' +
    'Description="FILL"',
  'Psionic Charm':
    'Discipline=Telepathy ' +
    'Level=Telepath1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Psionic Contingency':
    'Discipline=Clairsentience ' +
    'Level=Psion6 ' +
    'Cost=11 ' +
    'Description="FILL"',
  'Psionic Darkvision':
    'Discipline=Clairsentience ' +
    'Level=Psion3,Warrior2 ' +
    'Cost=5,3 ' +
    'Description="FILL"',
  'Psionic Daze':
    'Discipline=Telepathy ' +
    'Level=Psion1 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Psionic Dimension Door':
    'Discipline=Psychoportation ' +
    'Level=Psion4,Warrior4 ' +
    'Cost=7 ' +
    'Description="FILL"',
  'Psionic Dimensional Anchor':
    'Discipline=Psychoportation ' +
    'Level=Nomad4 ' +
    'Cost=7 ' +
    'Description="FILL"',
  'Psionic Disintegrate':
    'Discipline=Psychoportation ' +
    'Level=Psion6 ' +
    'Cost=11 ' +
    'Description="FILL"',
  'Psionic Dismissal':
    'Discipline=Psychoportation ' +
    'Level=Nomad4 ' +
    'Cost=7 ' +
    'Description="FILL"',
  'Psionic Divination':
    'Discipline=Clairsentience ' +
    'Level=Psion4 ' +
    'Cost=7 ' +
    'Description="FILL"',
  'Psionic Dominate':
    'Discipline=Telepathy ' +
    'Level=Telepath4 ' +
    'Cost=7 ' +
    'Description="FILL"',
};
DarkSun3E.RACES = {
  'Aarakocra':
    'Features=' +
      '"Aarakocra Ability Adjustment",' +
      '"Aerial Dive","Beak Attack",Claustrophobic,"Claw Attack",' +
      '"Excellent Vision",Flying,"Low-Light Vision","Monstrous Humanoid",' +
      '"Natural Armor","Race Level Adjustment",Slow ' +
    'Languages=Auran,Common',
  'Dwarf':
    'Features=' +
      '"Dwarf Ability Adjustment",' +
      '"Weapon Familiarity (Dwarven Urgosh/Dwarven Waraxe)",' +
      'Darkvision,Focused,"Resist Poison","Resist Spells",Slow,Stability,' +
      'Steady ' +
    'Languages=Common,Dwarven',
  'Elf':
    'Features=' +
      '"Elf Ability Adjustment",' +
      '"Weapon Proficiency (Composite Longbow/Composite Shortbow/Longbow/Shortbow)",' +
      '"Weapon Familiarity (Elven Longblade)",' +
      '"Elf Run",Fast,"Keen Senses","Low-Light Vision","Resist Temperature" ' +
    'Languages=Common,Elven',
  'Half-Elf':
    'Features=' +
      '"Half-Elf Ability Adjustment",' +
      '"Alert Senses","Elven Blood",Imitator,"Low-Light Vision",Wildlander ' +
    'Languages=Common,Elven',
  'Half-Giant':
    'Features=' +
      '"Half-Giant Ability Adjustment",' +
      '"Axis Alignment",Darkvision,Fast,"Giant Blood",Large,"Natural Armor",' +
      '"Race Level Adjustment" ' +
    'Languages=Common',
  'Halfling':
    'Features=' +
      '"Halfling Ability Adjustment",' +
      'Precise,"Resist Spells","Sharp Senses",Slow,Small,Spry,Suspect ' +
    'Languages=Halfling',
  'Human':
    SRD35.RACES.Human + ' ' +
    'Languages=Common',
  'Mul':
    'Features=' +
      '"Mul Ability Adjustment",' +
      '"Dwarven Blood","Extended Activity","Limited Darkvision",' +
      '"Race Level Adjustment",Rugged,Tireless ' +
    'Languages=Common',
  'Pterran':
    'Features=' +
      '"Pterran Ability Adjustment",' +
      '"Weapon Familiarity (Thanak)",' +
      '"Bite Attack","Claw Attack","Life Path","Poor Hearing",' +
      '"Psi-Like Ability" ' +
    'Languages=Sauran',
  'Thri-kreen':
    'Features=' +
      '"Thri-kreen Ability Adjustment",' +
      '"Weapon Familiarity (Chatkcha/Gythka)",' +
      '"Bite Attack","Claw Attack",Darkvision,"Deflect Arrows",' +
      '"Desert Camouflage",Fast,Leap,"Monstrous Humanoid","Multiple Limbs",' +
      '"Natural Armor",Poison,"Race Level Adjustment","Sleep Immunity" ' +
    'Languages=Kreen'
};
DarkSun3E.SCHOOLS = Object.assign({}, SRD35.SCHOOLS);
DarkSun3E.SHIELDS = Object.assign({}, SRD35.SHIELDS);
DarkSun3E.SKILLS_ADDED = {
  'Bluff':
    SRD35.SKILLS.Bluff.replace('Class=', 'Class=Wizard,'),
  'Diplomacy':
    SRD35.SKILLS.Diplomacy.replace('Druid,', ''),
  'Disguise':
    SRD35.SKILLS.Disguise.replace('Class=', 'Class=Wizard,'),
  'Escape Artist':
    SRD35.SKILLS['Escape Artist'].replace('Class=', 'Class=Barbarian,'),
  'Hide':
    SRD35.SKILLS.Hide.replace('Class=', 'Class=Druid,'),
  'Intimidate':
    SRD35.SKILLS['Intimidate'].replace('Class=', 'Class="Psychic Warrior",'),
  'Knowledge (Ancient History)':
    'Ability=intelligence untrained=n',
  'Knowledge (Warcraft)':
    'Ability=intelligence untrained=n Class=Fighter',
  'Literacy':
    'untrained=n Class=Wizard',
  'Move Silently':
    SRD35.SKILLS['Move Silently'].replace('Class=', 'Class=Druid,'),
  'Survival':
    SRD35.SKILLS['Survival'].replace('Class=', 'Class=Wilder,'),
  'Swim':
    SRD35.SKILLS.Swim + ' ' + 'Class=',
  // XPH
  'Autohypnosis':
    'Ability=wisdom untrained=n',
  'Knowledge (Psionics)':
    'Ability=intelligence untrained=n',
  'Psicraft':
    'Ability=intelligence untrained=n',
  'Use Psionic Device':
    'Ability=charisma untrained=n Class=Rogue'
};
DarkSun3E.SKILLS = Object.assign({}, SRD35.SKILLS, DarkSun3E.SKILLS_ADDED);
DarkSun3E.SPELLS_ADDED = {
  
  // From Dark Sun 3
  'Acid Rain':
    'School=Conjuration ' +
    'Level="Decaying Touch4" ' +
    'Description=' +
      '"R$RM\' 20\' cu inflicts 4d4 HP acid/rd (Ref half) for %{lvl} rd"',
  'Air Lens':
    'School=Transmutation ' +
    'Level=T5,"Sun Flare5" ' +
    'Description=' +
      '"R$RM\' Ranged touch inflicts 2d6+%{lvl} HP fire for conc or %{lvl} rd"',
  'Allegiance Of The Land':
    'School=Evocation ' +
    'Level=D6 ' +
    'Description=' +
      '"Self gains %{lvl} temporary HP and energy resistance 15 for %{lvl} rd"',
  'Awaken Water Spirits':
    'School=Transmutation ' +
    'Level=D6,"Living Waters6" ' +
    'Description="Touched body of water becomes sentient"',
  'Backlash':
    'School=Abjuration ' +
    'Level=D1,W2 ' +
    'Description=' +
      '"R$RS\' 40\' radius inflicts %{lvl//2<?5}d6+%{lvl//2<?5} HP (Fort half) on next defiler within %{lvl} dy; affected must make successful Concentration to complete spell"',
  'Banish Tyr-Storm':
    'School=Abjuration ' +
    'Level=W6 ' +
    'Description="R$RL\' Self redirect Tyr-storm for conc or %{lvl} min"',
  'Battlefield Healing':
    'School=Conjuration ' +
    'Level=T2 ' +
    'Description="Stabilizes %{lvl} targets in 30\' radius"',
  'Black Cairn':
    'School=Divination ' +
    'Level=D1,T1 ' +
    'Description="R$RL\' Self sense direction of specified corpse"',
  'Blazing Wreath':
    'School=Evocation ' +
    'Level="Smoldering Spirit9" ' +
    'Description=' +
      '"Self gains DR 15/magic, immunity to fire, and flames that inflict 2d8 HP fire in 10\' radius for %{lvl*10} min"',
  'Bless Element':
    'School=Transmutation ' +
    'Level=C1 ' +
    'Description=' +
      '"Touched element becomes holy (Will neg), inflicts 2d4 HP on vulnerable"',
  'Blindscorch':
    'School=Evocation ' +
    'Level="Smoldering Spirit4" ' +
    'Description=' +
      '"R$RM\' Target suffers %{lvl<?10} HP fire and permanent blindness (Fort half HP only)"',
  "Boneclaw's Cut":
    'School=Necromancy ' +
    'Level=D3,W3 ' +
    'Description=' +
      '"R$RM\' Target suffers %{lvl//4} cuts that inflict 2 HP/rd for 10 rd (Cure spell or Heal ends)"',
  'Boneharden':
    'School=Transmutation ' +
    'Level=D2,W2 ' +
    'Description=' +
      '"Touched bone weapon hardens or creature suffers -4 Dex (Fort neg) for %{lvl} min"',
  'Braxatskin':
    'School=Transmutation ' +
    'Level=C6,D5,W6 ' +
    'Description=' +
      '"Self gains +5 natural armor and DR 10/metal, suffers -2 Dexterity and +20% arcane spell failure for %{lvl} min"',
  'Breeze Lore':
    'School=Divination ' +
    'Level="Ill Winds3" ' +
    'Description=' +
      '"Self gains ability to notice and track by scent, gains +4 Sense Motive for %{lvl*10} min"',
  'Cerulean Hail':
    'School=Conjuration ' +
    'Level=W5,"Cold Malice6" ' +
    'Description=' +
      '"R$RM\' 20\' radius inflicts %{lvl<?15}d6 HP (Ref half), panics in 60\' radius (Will neg)"',
  'Cerulean Shock':
    'School=Evocation ' +
    'Level=W2 ' +
    'Description=' +
      '"R$RS\' Target suffers %{2+(lvl*2)//4}d6 HP (Fort half) upon leaving square"',
  'Channel Stench':
    'School=Conjuration ' +
    'Level="Ill Winds1" ' +
    'Description="15\' cone nauseates for 1d6 rd (Fort sickens; 5 HD immune)"',
  'Claws Of The Tembo':
    'School=Conjuration ' +
    'Level=D3,R3,W4 ' +
    'Description=' +
      '"Self gains 2 claw attacks/rd that inflict 1d%{features.Large ? 8 : features.Small ? 4 : 6} HP and drain 1d4 HP additional (Fort no drain) for ${lvl} rd"',
  'Cleansing Flame':
    'School=Evocation ' +
    'Level=C5,D5,W6 ' +
    'Description="R$RS\' Target defiler or servant suffers %{lvl<?10}d6 HP"',
  'Clear Water':
    'School=Transmutation ' +
    'Level=D2,"Living Waters1" ' +
    'Description="Touched %{lvl} gallons of water doubles effectiveness"',
  'Clear-river':
    'School=Evocation ' +
    'Level=D3,W3 ' +
    'Description=' +
      '"50\' cone deflects missiles and pulls objects from grasp (Ref neg)"',
  'Clues Of Ash':
    'School=Divination ' +
    'Level="Burning Eyes2" ' +
    'Description="Self views the final %{lvl} minutes of touched debris"',
  'Coat Of Mists':
    'School=Conjuration ' +
    'Level="Desert Mirage4",D5 ' +
    'Description=' +
      '"Touched gains fire resistance 5, becomes comfortable up to 140F for 1 dy"',
  "Confessor's Flame":
    'School=Evocation ' +
    'Level="Burning Eyes8",T7 ' +
    'Description=' +
      '"R$RS\' Targets respond to questions as desired or suffer 1+d12 HP fire for 1 min"',
  'Conflagration':
    'School=Evocation ' +
    'Level="Fiery Wrath9" ' +
    'Description="R$RM\' 20\' radius inflicts 10d6 + 2d6 HP/rd for %{lvl} rd"',
  'Conservation':
    'School=Abjuration ' +
    'Level=D2,W3 ' +
    'Description="R$RM\' 40\' radius bars defilement (Will neg) for %{lvl} dy"',
  'Control Tides':
    'School=Transmutation ' +
    'Level=C4,D4,"Drowning Despair3",W6,T6 ' +
    'Description="R$RL\' Lowers or raises silt or water for %{lvl*10} min"',
  'Conversion':
    'School=Abjuration ' +
    'Level=D5 ' +
    'Description="Removes defilement from touched spellcaster"',
  'Cooling Canopy':
    'School=Conjuration ' +
    'Level=C1,D1,R1,W1 ' +
    'Description="R$RS\' Target shaded (Will neg) for 12 hr"',
  'Create Element':
    'School=Conjuration ' +
    'Level=C0 ' +
    'Description="R$RS\' Creates a small amount of caster\'s element"',
  'Create Oasis':
    'School=Conjuration ' +
    'Level=D6 ' +
    'Description="%{50*(lvl-10)}\' radius becomes plant- and water-filled"',
  'Crusade':
    'School=Enchantment ' +
    'Level=T7 ' +
    'Description=' +
      '"Allies in 20\' radius gain +4 attack, damage, and save, plus 2d8 temporary HP for %{lvl} rd"',
  'Curse Element':
    'School=Transmutation ' +
    'Level=C1 ' +
    'Description=' +
      '"Touched element becomes unholy (Will neg), inflicts 2d4 HP on vulnerable"',
  'Curse Of The Black Sands':
    'School=Transmutation ' +
    'Level=C4,D3,"Broken Sands2" ' +
    'Description="R$RS\' Target leaves oily tracks (Will neg) for %{lvl} dy"',
  'Curse Of The Choking Sands':
    'School=Transmutation ' +
    'Level="Desert Mirage3" ' +
    'Description=' +
      '"R$RS\' Target drink transforms to sand (Will neg) for %{lvl} dy"',
  'Death Mark':
    'School=Necromancy ' +
    'Level=W2,"Soul Slayer2" ' +
    'Description=' +
      '"R$RM\' Target sickened and loses Dex AC bonus (Will neg) for %{lvl} min"',
  'Death Whip':
    'School=Necromancy ' +
    'Level=W3,"Soul Slayer3" ' +
    'Description=' +
      '"Touched whip inflicts 1d2 temporary Strength damage for conc or %{lvl} rd"',
  'Dedication':
    'School=Enchantment ' +
    'Level=W3,T3 ' +
    'Description=' +
      '"Touched needs no sleep and half rations, gains +1 rolls while working on activity (Will neg) for 1 dy"',
  'Defiler Scent':
    'School=Divination ' +
    'Level=D0,T0 ' +
    'Description="Self detects defilers in 20\' radius"',
  'Detect Element':
    'School=Divination ' +
    'Level=C0 ' +
    'Description="Self detects element in 60\' cone for conc or %{lvl} min"',
  'Drown On Dry Land':
    'School=Transmutation ' +
    'Level="Drowning Despair6" ' +
    'Description=' +
      '"R$RS\' Target can breathe only water (Fort neg) for %{lvl} hr"',
  'Echo Of The Lirr':
    'School=Evocation ' +
    'Level=D2,R2 ' +
    'Description="30\' cone stuns (Will neg) for 1d3 rd"',
  'Elemental Armor':
    'School=Transmutation ' +
    'Level=C4 ' +
    'Description=' +
      '"Touched armor gains +1 AC and elemental quality for %{lvl} min"',
  'Elemental Chariot':
    'School=Transmutation ' +
    'Level=C7 ' +
    'Description=' +
      '"Touched chariot gives DR 10/magic vs. ranged and +4 attack and +5 damage on ranged for %{lvl*10} min"',
  'Greater Elemental Chariot':
    'School=Transmutation ' +
    'Level=C9,"Soaring Spirit9" ' +
    'Description=' +
      '"Touched chariot gives DR 10/magic vs. ranged, +4 attack and +5 damage on ranged, and elemental ability for %{lvl} hr"',
  'Elemental Storm':
    'School=Evocation ' +
    'Level=C8,D7,"Smoldering Spirit7" ' +
    'Description="R$RM\' %{lvl*20}\' cu inflicts %{lvl<?20}d6 HP (Ref half)"',
  'Elemental Strike':
    'School=Evocation ' +
    'Level=C5,D4,"Fiery Wrath5",T5 ' +
    'Description="R$RM\' 10\' cylinder inflicts %{lvl<?15}d6 HP (Ref half)"',
  'Elemental Weapon':
    'School=Transmutation ' +
    'Level=C4 ' +
    'Description=' +
       '"Touched weapon gains +1 attack and damage plus elemental enhancement for %{lvl} min"',
  'Eye Of The Storm':
    'School=Abjuration ' +
    'Level=W2,C3,D3,"Furious Storm2",R3 ' +
    'Description="Air in 30\' radius becomes calm for %{lvl} hr"',
  'Fire Track':
    'School=Divination ' +
    'Level="Burning Eyes4",T5 ' +
    'Description=' +
      '"R$RM\' Creates small flame that tracks specified target at 240\'/rd for %{lvl} rd"',
  'Firewater':
    'School=Transmutation ' +
    'Level="Sky Blitz1" ' +
    'Description="R$RS\' Makes %{lvl} gallons of water intoxicating"',
  'Fissure':
    'School=Evocation ' +
    'Level="Broken Sands9","Mountains Fury9" ' +
    'Description=' +
      '"R$RM\' Ground fissure opens with elemental effects and remains until closed"',
  'Flame Harvest':
    'School=Evocation ' +
    'Level=D8,"Fiery Wrath7" ' +
    'Description=' +
      '"Touched 36 5\'x5\' areas inflict 8d8 HP fire when triggered (Ref half) w/in 1 month"',
  'Flash Flood':
    'School=Conjuration ' +
    'Level="Drowning Despair8",D9,"Living Waters8" ' +
    'Description="R$RL\' Target river floods or deluge falls in 100\' radius"',
  "Fool's Feast":
    'School=Transmutation ' +
    'Level=T4 ' +
    'Description=' +
      '"R$RM\' Food for %{lvl} creatures cures sickness and disease, gives 1d8+%{lvl//2<?10} temporary HP, +1 attack and Will saves and immunity to poison and fear for 12 hr; self gains +4 skill checks w/consumers"',
  'Footsteps Of The Quarry':
    'School=Divination ' +
    'Level=R2,T2,W2 ' +
    'Description="Self gains +20 Survival to track quarry"',
  'Ghostfire':
    'School=Necromancy ' +
    'Level=W4 ' +
    'Description=' +
      '"R$RS\' %{2*lvl<?20}d4 HD of creatures w/up to 5 HD in 40\' radius slain (Fort neg)"',
  'Glass Storm':
    'School=Evocation ' +
    'Level="Broken Sands7" ' +
    'Description=' +
      '"Sand driven by 100 MPH winds in 50\' radius inflicts 2d8 HP/rd for %{lvl} rd"',
  'Gloomcloud':
    'School=Enchantment ' +
    'Level=W4 ' +
    'Description="R$RS\' Target severely depressed (Will neg) for %{lvl} rd"',
  'Gray Beckoning':
    'School=Conjuration ' +
    'Level="Dead Heart6",W7 ' +
    'Description="R$RM\' Summons %{lvl} gray zombies for %{lvl} min"',
  'Gray Rift':
    'School=Conjuration ' +
    'Level="Dead Heart8",T9,W9 ' +
    'Description=' +
      '"30\'x15\' gray rift moves 30\'/rd, inflicts %{lvl*10<?150} HP on touched (Will half) for conc + 1d6 rd"',
  'Groundflame':
    'School=Conjuration ' +
    'Level=D5,W6 ' +
    'Description=' +
      '"R$RM\' 20\' radius inflicts %{lvl<?15}d6 HP acid (Fort half)"',
  'Hand Of The Sorcerer-King':
    'School=Abjuration ' +
    'Level=T1 ' +
    'Description=' +
      '"Self gains +2 save vs. spells and spell-like abilities for %{lvl} min"',
  'Heartseeker':
    'School=Transmutation ' +
    'Level=C9,D9,"Forged Stone8" ' +
    'Description=' +
      '"Touched wooden weapon destroys self, killing target, after hit (Fort 108 HP)"',
  'Heat Lash':
    'School=Evocation ' +
    'Level=C1 ' +
    'Description=' +
      '"R$RM\' Inflicts 1d4+1 HP on target and knocks back 5\' (Fort half HP only)"',
  'Illusory Talent':
    'School=Illusion ' +
    'Level=W1 ' +
    'Description=' +
      '"R$RM\' Self and 1 other gain +10 Perform (Will observer neg) for %{lvl*10} min"',
  'Image Of The Sorcerer-King':
    'School=Necromancy ' +
    'Level=T3 ' +
    'Description=' +
      '"Touched frightened for 10 min (Will shaken 1 rd; 10+ HD neg)"',
  'Infestation':
    'School=Conjuration ' +
    'Level=C7,D6,"Ruinous Swarm6",W7 ' +
    'Description=' +
      '"R$RM\' Creatures in 10\' radius infested w/choice of parasites that take effect after 1 dy"',
  "Klar's Heart":
    'School=Transmutation ' +
    'Level=D4,T5 ' +
    'Description=' +
      '"Creatures in 20\' radius gain +4 Strength and %{lvl//2} temporary HP (Will neg) for %{lvl} rd"',
  'Legendary Stonecraft':
    'School=Transmutation ' +
    'Level="Forged Stone9" ' +
    'Description=' +
      '"Stops time and removes need for food and water for work in R$RL\' radius"',
  'Lighten Load':
    'School=Transmutation ' +
    'Level=C3 ' +
    'Description=' +
      '"Quadruples carrying capacity of touched targets for %{lvl*2} hr total"',
  'Liquid Lightning':
    'School=Evocation ' +
    'Level="Sky Blitz8" ' +
    'Description=' +
      '"Touched water inflicts %{lvl<?20}d6 HP (Ref half) on next toucher, plus half on those w/in 60\', w/in %{lvl} hr"',
  'Lungs Of Water':
    'School=Conjuration ' +
    'Level="Drowning Despair4" ' +
    'Description=' +
      '"R$RS\' Target drowns in 3 rd (Fort neg; conscious breathing or Fort save extends 1 rd)"',
  'Mage Seeker':
    'School=Divination ' +
    'Level=W4,T4 ' +
    'Description=' +
      '"Touched object points direction to most powerful wizard to cross %{20+lvl*20}\' radius in past dy"',
  'Magic Trick':
    'School=Illusion ' +
    'Level=W2 ' +
    'Description="Self gains +10 Bluff to disguise casting for %{lvl} min"',
  'Magma Tunnel':
    'School=Transmutation ' +
    'Level="Mountains Fury8",W9 ' +
    'Description="Magma digs 10\'-30\'/rd, inflicting 10d6 HP, for %{lvl} min"',
  'Molten':
    'School=Transmutation ' +
    'Level="Broken Sands8" ' +
    'Description=' +
      '"R$RM\' %{lvl*5}\' cu heats, inflicting 4d8 HP, then 8d6 HP, then 10d6 HP (Ref half) for conc"',
  'Nurturing Seeds':
    'School=Abjuration ' +
    'Level=D0,R1 ' +
    'Description="10 prepared seeds take root in infertile ground"',
  'Oil Spray':
    'School=Conjuration ' +
    'Level="Mountains Fury4" ' +
    'Description="Oil covers 20\' radius, inflicts 2d8+%{lvl*2} if lit"',
  'Pact Of Darkness':
    'School=Necromancy ' +
    'Level=W9 ' +
    'Description="R$RS\' Makes agreement with summoned shadow giant"',
  'Pact Of Water':
    'School=Necromancy ' +
    'Level="Living Waters4",T5 ' +
    'Description=' +
      '"Makes contract between two touched, enforced by <i>Curse Of The Choking Sands</i> spell"',
  'Plant Renewal':
    'School=Transmutation ' +
    'Level=D1,R1 ' +
    'Description="Revives touched wilted plant"',
  'Poisoned Gale':
    'School=Conjuration ' +
    'Level="Ill Winds7",T8 ' +
    'Description=' +
      '"R30\' Gust inflicts 2d8 HP to two abilities (Fort neg) for 1 rd"',
  'Protection From Time':
    'School=Abjuration ' +
    'Level=W8 ' +
    'Description="Touched protected from aging for %{lvl//2} months"',
  'Quietstorm':
    'School=Evocation ' +
    'Level=W5 ' +
    'Description="R$RS\' %{7+((lvl-10)//2)>?0} rays inflict 8d6 HP each"',
  'Ragestorm':
    'School=Evocation ' +
    'Level=C5,W5 ' +
    'Description="R$RM\' 30\' radius storm inflicts 4d8 HP for %{lvl} rd"',
  'Rangeblade':
    'School=Illusion ' +
    'Level=C5,W5 ' +
    'Description=' +
      '"Touched weapon can strike at %{5+5*(lvl//2)}\' for %{lvl} rd"',
  'Rejuvenate':
    'School=Transmutation ' +
    'Level=C6,D5 ' +
    'Description="$RS\' radius ground becomes fertile and grassy"',
  'Return To The Earth':
    'School=Necromancy ' +
    'Level=C2,D3,"Decaying Touch1",T2 ' +
    'Description=' +
      '"R$RS\' Target corpses decompose in 4 rd, corporeal undead suffer 1d12 HP for %{lvl} rd"',
  'Sand Pit':
    'School=Transmutation ' +
    'Level=W3,C3,"Broken Sands1",T3 ' +
    'Description="R$RS\' Excavates 30\' radius, 50\' deep for conc"',
  'Sand Spray':
    'School=Evocation ' +
    'Level=W4,C4,"Broken Sands3",T3 ' +
    'Description=' +
      '"60\' cone inflicts 2d6 HP lethal plus 2d6 HP nonlethal and blinds for 1d6 min (Ref half HP and bind 1 rd)"',
  'Sand Trap':
    'School=Transmutation ' +
    'Level=W5,"Broken Sands4" ' +
    'Description=' +
      '"R$RL\' 30\' target sand area triggers trap in %{100+lvl*10}\' radius, causing noise, damage, or slipping for %{lvl} dy"',
  'Sandflow':
    'School=Transmutation ' +
    'Level="Broken Sands5",T5,W5 ' +
    'Description="R$RL\' Slowly digs 7500\' cu sand"',
  'Sands Of Time':
    'School=Transmutation ' +
    'Level=C7,"Decaying Touch5",W6 ' +
    'Description="Erodes or restores touched item"',
  'Sandstone':
    'School=Transmutation ' +
    'Level="Forged Stone1",W2 ' +
    'Description="Converts %{5*lvl}\' sand or gravel to sandstone"',
  'Scapegoat':
    'School=Enchantment ' +
    'Level=W5 ' +
    'Description=' +
      '"R$RS\' Creatures w/in 20\' become hostile to target (Will neg) for %{lvl} min"',
  'Shining Sands':
    'School=Transmutation ' +
    'Level=W6,"Desert Mirage5" ' +
    'Description=' +
      '"R$RM\' Sand in 20\' radius reflects sunlight inward or outward, blinding for %{lvl} hr (Fort neg)"',
  'Shroud Of Darkness':
    'School=Necromancy ' +
    'Level=W6 ' +
    'Description=' +
      '"Touched cloak gives DR 5/magic, 60\' darkvision, +{charismaModifier} AC, and access to Black"',
  'Sirocco':
    'School=Evocation ' +
    'Level=D8,"Furious Storm6" ' +
    'Description="R$RL\' Sand in 1000\' radius inflicts 2d8 HP for %{lvl} min"',
  'Skyfire':
    'School=Evocation ' +
    'Level=D5,W5 ' +
    'Description=' +
      '"R$RM\' 3 spheres inflict 1d6 HP bludgeoning (no save) and 3d6 HP fire (Ref half) in 5\' radius"',
  'Slave Scent':
    'School=Divination ' +
    'Level=W0 ' +
    'Description="Self learns class of touched"',
  'Sparkrain':
    'School=Evocation ' +
    'Level=W5 ' +
    'Description=' +
      '"R$RM\' Ranged touch dispels defensive force spells in 20\' radius"',
  'Spirit Of Flame':
    'School=Divination ' +
    'Level="Burning Eyes9" ' +
    'Description=' +
      '"Allows self to scry, cast spells, and teleport through fires in %{lvl*10} mile radius for %{lvl} hr"',
  'Sting Of The Gold Scorpion':
    'School=Necromancy ' +
    'Level=D2,R2,W2 ' +
    'Description="Touched scorpion barb inflicts 1d6 temporary Strength on successful attack, then 1d4 temporary Stength 1 min later (Fort neg)"',
  'Storm Legion':
    'School=Transmutation ' +
    'Level=D9,"Furious Storm8" ' +
    'Description="Self and %{lvl*7} HD others move via storm for %{lvl} hr"',
  'Summon Tyr-Storm':
    'School=Conjuration ' +
    'Level="Furious Storm6",W6 ' +
    'Description="$RL\' diameter storm inflicts 2d8 HP/rd for 2d10 min"',
  'Sunstroke':
    'School=Evocation ' +
    'Level="Fiery Wrath4" ' +
    'Description=' +
      '"R$RM\' Ranged touch inflicts 4d4 HP nonlethal and fatigue (Fort half HP only) for %{lvl} rd"',
  'Surface Tension':
    'School=Transmutation ' +
    'Level="Drowning Despair2" ' +
    'Description="R$RM\' Water in 20\' radius becomes cohesive for %{lvl} hr"',
  'Surface Walk':
    'School=Transmutation ' +
    'Level=C3,D3,R3,T3 ' +
    'Description="{lvl} touched can traverse any surface for {lvl*10} min"',
  'Swarm Of Anguish':
    'School=Transmutation ' +
    'Level=D9,"Ruinous Swarm9" ' +
    'Description="Self shapechanges into swarm of agony beetles for %{lvl} hr"',
  'Sweet Water':
    'School=Transmutation ' +
    'Level="Living Waters5" ' +
    'Description="R$RL\' Water in 15\' radius becomes pure, gives +4 vs. poison, and heals 1d8 HP for 1 dy"',
  'Tempest':
    'School=Evocation ' +
    'Level=W9 ' +
    'Description=' +
      '"R$RM\' Violent storm obliterates creatures in 20\' radius (Ref neg)"',
  'Touch The Black':
    'School=Necromancy ' +
    'Level=W4 ' +
    'Description=' +
      '"40\' radius inflicts %{lvl<?15}d6 HP cold (Fort half), -2 rolls for 1d4+1 rd"',
  'Unliving Identity':
    'School=Necromancy ' +
    'Level=C7,"Dead Heart5",W7 ' +
    'Description="Touch zombie regains sentience"',
  'Vampiric Youthfulness':
    'School=Necromancy ' +
    'Level="Dead Heart9",W9 ' +
    'Description=' +
      '"Healthy touched ages 10 yr (Fort neg); self becomes 1 yr younger"',
  'Wakefulness':
    'School=Enchantment ' +
    'Level=W2 ' +
    'Description="Touched cannot sleep for %{lvl} hr, exhausted afterwards"',
  'Watch Fire':
    'School=Divination ' +
    'Level="Burning Eyes7" ' +
    'Description=' +
      '"Allows self to scry through fires in %{lvl*10} mile radius for %{lvl} min"',
  'Water Light':
    'School=Transmutation ' +
    'Level="Sky Blitz9" ' +
    'Description=' +
      '"R$RM\' Other creatures in 30\' radius glow, 10\' radius inflicts 5d8 HP electricity each rd for %{lvl} rd"',
  'Water Shock':
    'School=Evocation ' +
    'Level="Sky Blitz2" ' +
    'Description=' +
      '"Touched water inflicts %{lvl//2<?5}d6 HP (Ref half) when touched w/in %{lvl} hr"',
  'Water Trap':
    'School=Transmutation ' +
    'Level="Drowning Despair5" ' +
    'Description=' +
      '"20\' diameter water pulls next toucher underneath (Ref neg) w/in %{lvl} dy"',
  'Waters Of Life':
    'School=Transmutation ' +
    'Level=D7,"Living Waters7" ' +
    'Description=' +
      '"Creates potion that transfers damage, blindness, poisoning, and infection from drinker to self (Fort heals in 1 hr)"',
  'Waterways':
    'School=Conjuration ' +
    'Level="Living Waters9" ' +
    'Description="Self and %{lvl} others teleport via water for %{lvl} min"',
  'Whirlpool Of Doom':
    'School=Transmutation ' +
    'Level="Drowning Despair7","Earthen Embrace7" ' +
    'Description=' +
      '"R$RM\' 20\' radius earth swallows those standing on it (Ref or 3 Swim checks neg) %{lvl} rd"',
  'Wild Lands':
    'School=Enchantment ' +
    'Level=D9 ' +
    'Description="Target attracts animals from %{lvl} mile radius"',
  'Wind Trap':
    'School=Conjuration ' +
    'Level="Ill Winds9" ' +
    'Description=' +
      '"R$RM\' Trigger causes 50\' radius toxic cloud w/varying effects (Fort neg)"',
  'Wisdom Of The Sorcerer-King':
    'School=Transmutation ' +
    'Level=T6 ' +
    'Description="Self gains metamagic feat on spell up to level 4"',
  "Worm's Breath":
    'School=Transmutation ' +
    'Level=C3,D3,"Living Waters3",R3,T3,W3 ' +
    'Description="Touched creatures breathe via skin for %{2*lvl} hr total"',
  'Wrath Of The Sorcerer-King':
    'School=Divination ' +
    'Level=T4 ' +
    'Description=' +
      '"R$RM\' Self know crimes committed by creatures in 20\' radius"',
  'Zombie Berry':
    'School=Transmutation ' +
    'Level=D3,W3 ' +
    'Description="Touched 1d4 zombie berries enslave consumers for %{lvl} dy"',

  // From Complete Divine
  'Bolt Of Glory':
    'School=Evocation ' +
    'Level=Glory6 ' +
    'Description=' +
      '"R$RS\' Ranged touch inflicts up to %{lvl<?15}d6 HP on outsider"',
  'Bolts Of Bedevilment':
    'School=Enchantment ' +
    'Level=Madness5 ' +
    'Description=' +
      '"R$RM\' Stuns target for 1d3 rd (Will neg) 1/rd for %{lvl} rd"',
  'Brain Spider':
    'School=Divination ' +
    'Level=Mind7 ' +
    'Description="R$RL\' Self hears thoughts of 8 others for %{lvl} min"',
  'Crown Of Glory':
    'School=Evocation ' +
    'Level=Glory8 ' +
    'Description=' +
      '"Self gains +4 Charisma, fascinates others in 120\' radius (Will or 8 HD neg) for %{lvl} min"',
  'Lesser Telepathic Bond':
    'School=Divination ' +
    'Level=Mind3 ' +
    'Description=' +
      '"R30\' Self communicates telepathically with willing target for %{lvl*10} min"',
  'Maddening Scream':
    'School=Enchantment ' +
    'Level=Madness8 ' +
    'Description="Touched screams uncontollably for 1d4+1 rd"',
  'Probe Thoughts':
    'School=Divination ' +
    'Level=Mind6 ' +
    'Description=' +
      '"R$RS\' Self answers 1 question/rd from target\'s thoughts (Fort neg) for conc"',
  'Touch Of Madness':
    'School=Enchantment ' +
    'Level=Madness2 ' +
    'Description="Touched inactive (Will neg) for %{lvl} rd"'

  // Mentioned, not defined--seems carried over from 2E's Dark Sun: Dragon Kings
  // 'Proof Against Undeath':
  //   'School=Necromancy ' +
  //   'Level=D2 ' +
  //   'Description="Touched corpse dead up to %{lvl} dy cannot be animated"'

};
DarkSun3E.SPELLS = Object.assign(
  {}, window.PHB35 != null ? PHB35.SPELLS : SRD35.SPELLS, DarkSun3E.SPELLS_ADDED
);
DarkSun3E.SPELLS_LEVELS = {
  'Bless Water':null,
  'Control Water':null,
  'Create Water':null,
  'Curse Water':null,
  'Flame Strike':null,
  'Fire Storm':null,
  'Water Breathing':null,
  'Water Walking':null,
  'Acid Fog':'"Ill Winds6"',
  'Air Walk':'"Soaring Spirit4",T4',
  'Animal Messenger':'"Ruinous Swarm1"',
  'Animate Dead':'"Dead Heart3"',
  "Bear's Endurance":'"Earthen Embrace2",T2',
  'Bestow Curse':'T3',
  'Black Tentacles':'"Soul Slayer4"',
  'Blade Barrier':'"Broken Sands6"',
  'Bless Weapon':'Glory2',
  'Bolt Of Glory':'Glory6',
  'Brain Spider':'Mind7',
  'Break Enchantment':'T5',
  "Bull's Strength":'T2',
  'Burning Hands':'"Fiery Wrath1","Smoldering Spirit1"',
  'Call Lightning':'"Sky Blitz3"',
  'Call Lightning Storm':'"Sky Blitz5"',
  'Calm Emotions':'Charm2',
  'Cause Fear':'"Drowning Despair1",T1',
  'Chain Lightning':'"Sky Blitz7"',
  'Charm Monster':'Charm5',
  'Charm Person':'Charm1',
  'Chill Metal':'"Cold Malice2"',
  'Chill Touch':'"Cold Malice1"',
  'Circle Of Death':'"Soul Slayer7"',
  'Cloudkill':'"Ill Winds5"',
  'Color Spray':'"Sun Flare1"',
  'Command':'"Rolling Thunder1",T1',
  'Comprehend Languages':'Mind1,T1',
  'Cone Of Cold':'"Cold Malice5"',
  'Confusion':'Madness4',
  'Contagion':'"Decaying Touch3"',
  'Continual Flame':'"Burning Eyes3"',
  'Control Weather':'"Sky Blitz6"',
  'Control Winds':'"Furious Storm5"',
  'Creeping Doom':'"Ruinous Swarm7"',
  'Cure Critical Wounds':'T4',
  'Cure Light Wounds':'T1',
  'Cure Minor Wounds':'T0',
  'Cure Moderate Wounds':'T2',
  'Cure Serious Wounds':'T3',
  'Darkness':'D2',
  'Daylight':'D3,"Sun Flare2"',
  'Death Knell':'"Dead Heart1",T2',
  'Deathwatch':'T1',
  'Deeper Darkness':'D3',
  'Delay Poison':'T2',
  'Delayed Blast Fireball':'"Smoldering Spirit6"',
  'Demand':'Charm8,Nobility8',
  'Destruction':'"Decaying Touch7"',
  'Detect Secret Doors':'"Lights Revelation1"',
  'Detect Magic':'T0',
  'Detect Poison':'T0',
  'Detect Thoughts':'Mind2',
  'Detect Undead':'D1,T1',
  'Dimensional Anchor':'T4',
  'Discern Lies':'"Lights Revelation4",Mind4,Nobility4,T3',
  'Discern Location':'"Lights Revelation8"',
  'Disintegrate':'"Decaying Touch6"',
  'Dispel Magic':'T3',
  'Disrupt Undead':'Glory1',
  'Divine Favor':'Nobility1,T1',
  'Divine Power':'T4',
  'Dominate Monster':'Charm9',
  'Doom':'T1',
  'Earthquake':'"Mountains Fury7"',
  'Endure Elements':'T1',
  'Energy Drain':'"Cold Malice9"',
  'Enervation':'"Cold Malice4"',
  'Enthrall':'Nobility2,T2',
  'Entropic Shield':'"Desert Mirage1",T1',
  'Faerie Fire':'"Burning Eyes1"',
  'Feather Fall':'"Soaring Spirit1"',
  'Find The Path':'"Burning Eyes6","Lights Revelation6"',
  'Finger Of Death':'"Dead Heart7"',
  'Fire Seeds':'"Fiery Wrath6"',
  'Fire Shield':'"Smoldering Spirit5"',
  'Fire Trap':'"Fiery Wrath2"',
  'Fireball':'"Smoldering Spirit3"',
  'Fly':'"Soaring Spirit3"',
  'Fog Cloud':'"Living Waters2"',
  'Foresight':'"Lights Revelation9"',
  'Flesh To Stone':'"Earthen Embrace6","Mountains Fury6"',
  'Freedom Of Movement':'T4',
  'Freezing Sphere':'"Cold Malice7"',
  'Gate':'Glory9',
  'Geas/Quest':'Charm6,Nobility6',
  'Gentle Repose':'D2',
  'Giant Vermin':'"Ruinous Swarm4"',
  'Glitterdust':'"Desert Mirage2"',
  'Glyph Of Warding':'T3',
  'Greater Command':'Nobility5,"Rolling Thunder5",T4',
  'Greater Magic Weapon':'T4',
  'Greater Shout':'"Rolling Thunder7"',
  'Greater Teleport':'"Soaring Spirit6"',
  'Guidance':'T0',
  'Gust Of Wind':'"Furious Storm1"',
  'Harm':'"Soul Slayer6"',
  'Heat Metal':'"Mountains Fury2"',
  'Heroism':'Charm4',
  'Hide From Undead':'T1',
  'Hold Person':'T2',
  'Holy Smite':'Glory4',
  'Holy Sword':'Glory5',
  'Horrid Wilting':'"Cold Malice8","Desert Mirage8"',
  'Ice Storm':'"Cold Malice3","Furious Storm4"',
  'Imprisonment':'"Earthen Embrace9"',
  'Incendiary Cloud':'"Ill Winds8","Smoldering Spirit8","Sun Flare8"',
  'Inflict Critical Wounds':'T4',
  'Inflict Light Wounds':'T1',
  'Inflict Minor Wounds':'T0',
  'Inflict Moderate Wounds':'T2',
  'Inflict Serious Wounds':'T3',
  'Insanity':'Charm7,Madness7',
  'Insect Plague':'"Ruinous Swarm5"',
  'Invisibility Purge':'"Lights Revelation3",T3',
  'Iron Body':'"Earthen Embrace8"',
  'Legend Lore':'"Lights Revelation7"',
  'Lesser Confusion':'Madness1',
  'Lesser Geas':'T4',
  'Lesser Restoration':'T2',
  'Light':'T0',
  'Lightning Bolt':'T3',
  'Locate Object':'T3',
  'Magic Circle Against Evil':'T3',
  'Magic Circle Against Good':'T3',
  'Magic Stone':'"Earthen Embrace1","Mountains Fury1"',
  'Magic Weapon':'T1',
  'Magic Vestment':'Nobility3,T3',
  'Mark Of Justice':'D5,T5',
  'Mending':'T0',
  'Mind Blank':'Mind8',
  'Mislead':'"Desert Mirage6"',
  'Move Earth':'"Forged Stone6"',
  'Neutralize Poison':'T4',
  'Nondetection':'D4',
  'Phantasmal Killer':'Madness6',
  'Power Word Blind':'"Decaying Touch8","Rolling Thunder8"',
  'Power Word Kill':'"Rolling Thunder9"',
  'Power Word Stun':'"Rolling Thunder6"',
  'Prismatic Sphere':'"Desert Mirage9"',
  'Prismatic Spray':'"Sun Flare7"',
  'Prismatic Wall':'"Desert Mirage7","Sun Flare9"',
  'Protection From Energy':'T3',
  'Protection From Evil':'T1',
  'Protection From Good':'T1',
  'Pyrotechnics':'"Ill Winds2","Smoldering Spirit2"',
  'Quench':'"Sky Blitz4"',
  'Rage':'Madness3,T2',
  'Rainbow Pattern':'"Sun Flare4"',
  'Raise Dead':'D6',
  'Ray Of Enfeeblement':'"Soul Slayer1"',
  'Read Magic':'T0',
  'Remove Curse':'D3',
  'Remove Disease':'T3',
  'Remove Fear':'T1',
  'Remove Paralysis':'D2,T2',
  'Repel Metal Or Stone':'"Forged Stone8","Mountains Fury5"',
  'Repel Vermin':'"Ruinous Swarm3"',
  'Repulsion':'Nobility7',
  'Resist Energy':'"Fiery Wrath3",T2',
  'Resistance':'T0',
  'Reverse Gravity':'"Soaring Spirit8"',
  'Righteous Might':'D5',
  'Rusting Grasp':'"Decaying Touch2"',
  'Searing Light':'D3,Glory3,"Sun Flare3",T3',
  'Secure Shelter':'"Earthen Embrace3"',
  'Sending':'T4',
  'Shield Of Faith':'T1',
  'Shocking Grasp':'"Sky Blitz1"',
  'Shout':'"Rolling Thunder4"',
  'Silence':'T2',
  'Slay Living':'"Soul Slayer5"',
  'Sleep':'D2',
  'Sleet Storm':'"Furious Storm3"',
  'Soften Earth And Stone':'"Forged Stone2"',
  'Soul Bind':'"Soul Slayer9"',
  'Sound Burst':'"Rolling Thunder2"',
  'Speak With Dead':'"Dead Heart2",T3',
  'Spider Climb':'"Soaring Spirit2"',
  'Spike Stones':'"Forged Stone4","Mountains Fury3"',
  'Statue':'"Forged Stone7"',
  'Status':'T4',
  'Stinking Cloud':'"Ill Winds4"',
  'Stoneskin':'"Earthen Embrace5"',
  'Stone Shape':'"Forged Stone3"',
  'Storm Of Vengeance':'"Drowning Despair9",Nobility9,"Furious Storm9"',
  'Suggestion':'Charm3',
  'Summon Swarm':'"Ruinous Swarm2"',
  'Sunbeam':'Glory7,"Sun Flare6"',
  'Sunburst':'"Fiery Wrath8"',
  'Sympathy':'"Ruinous Swarm8"',
  'Telepathic Bond':'Mind5',
  'Teleport':'"Soaring Spirit5"',
  'Time Stop':'"Decaying Touch9"',
  'Tongues':'T4',
  'Transmute Mud To Rock':'"Forged Stone5"',
  'Trap The Soul':'"Soul Slayer8"',
  'True Seeing':'"Burning Eyes5","Lights Revelation5"',
  'True Strike':'T1',
  'Undetectable Alignment':'T2',
  'Vampiric Touch':'"Dead Heart4"',
  'Virtue':'T0',
  'Wall Of Stone':'"Earthen Embrace4"',
  'Weird':'Madness9,Mind9',
  'Whirlwind':'"Furious Storm7"',
  'Wind Wall':'"Rolling Thunder3",T3',
  'Wind Walk':'"Soaring Spirit6"',
  'Zone Of Truth':'"Lights Revelation2",T2'
};
for(var s in DarkSun3E.SPELLS_LEVELS) {
  var levels = DarkSun3E.SPELLS_LEVELS[s];
  if(levels == null) {
    delete DarkSun3E.SPELLS[s];
    continue;
  }
  if(!(s in DarkSun3E.SPELLS)) {
    if(window.PHB35 && PHB35.SPELL_RENAMES && s in PHB35.SPELL_RENAMES) {
      s = PHB35.SPELL_RENAMES[s];
    } else {
      // We might be loading before PHB35 has completed. There will be another
      // chance to pick this up during DarkSun3E() initialization.
      // console.log('Missing spell "' + s + '"');
      continue;
    }
  }
  DarkSun3E.SPELLS[s] =
    DarkSun3E.SPELLS[s].replace('Level=', 'Level=' + levels + ',');
}
DarkSun3E.WEAPONS_ADDED = {
  'Puchik':'Level=1 Category=Li Damage=d4 Crit=3',
  'Quabone':'Level=1 Category=1h Damage=d6',
  'Tonfa':'Level=1 Category=1h Damage=d4',
  'Great Tonfa':'Level=1 Category=2h Damage=d6',
  'Blowgun':'Level=1 Category=R Damage=d1 Range=10',
  'Pelota':'Level=1 Category=R Damage=d4 Range=10',
  'Forearm Axe':'Level=2 Category=Li Damage=d4 Crit=3',
  'Small Macahuitl':'Level=2 Category=Li Damage=d6 Threat=19',
  'Slodak':'Level=2 Category=Li Damage=d6 Threat=19',
  'Tortoise Blade':'Level=2 Category=Li Damage=d4',
  'Alak':'Level=2 Category=1h Damage=d6 Crit=3',
  'Alhulak':'Level=2 Category=1h Damage=d6 Crit=3',
  'Carrikal':'Level=2 Category=1h Damage=d8 Crit=3',
  'Impaler':'Level=2 Category=1h Damage=d6 Crit=4',
  'Macahuitl':'Level=2 Category=1h Damage=d6 Threat=19',
  'Fixed Crusher':'Level=2 Category=2h Damage=d6',
  'Datchi Club':'Level=2 Category=2h Damage=d8 Crit=3',
  'Gouge':'Level=2 Category=2h Damage=d10 Crit=3',
  'Great Macahuitl':'Level=2 Category=2h Damage=2d6 Threat=19',
  'Maul':'Level=2 Category=2h Damage=d12',
  'Tkaesali':'Level=2 Category=2h Damage=d10 Crit=3',
  'Trikal':'Level=2 Category=2h Damage=d8 Crit=3',
  'Atlatl':'Level=2 Category=R Damage=d6 Crit=3 Range=40',
  'Fixed Crossbow':'Level=2 Category=R Damage=2d8 Threat=19 Range=150',
  "Bard's Friend":'Level=3 Category=Li Damage=d4 Threat=18',
  'Ko':'Level=3 Category=Li Damage=d4 Crit=4',
  "Bard's Garrote":'Level=3 Category=Li Damage=2d4 Crit=4',
  'Handfork':'Level=3 Category=Li Damage=d4',
  'Lajav':'Level=3 Category=Li Damage=d4 Crit=4',
  'Singing Sticks':'Level=3 Category=Li Damage=d6',
  'Talid':'Level=3 Category=Li Damage=d6 Threat=19',
  "Widow's Knife":'Level=3 Category=Li Damage=d4 Crit=3',
  'Wrist Razor':'Level=3 Category=Li Damage=d6 Threat=18',
  'Elven Longblade':'Level=3 Category=1h Damage=d8 Threat=18',
  'Heartpick':'Level=3 Category=1h Damage=d8 Crit=4',
  "Master's Whip":'Level=3 Category=1h Damage=d3',
  'Cahulak':'Level=3 Category=2h Damage=d6/d6 Crit=3',
  'Free Crusher':'Level=3 Category=2h Damage=d10',
  "Dragon's Paw":'Level=3 Category=2h Damage=d6/d6 Threat=19',
  'Gythka':'Level=3 Category=2h Damage=d8/d8',
  'Lotulis':'Level=3 Category=2h Damage=d8/d8 Threat=19',
  'Double-Tipped Spear':'Level=3 Category=2h Damage=d8/d8 Crit=3 Range=20',
  'Thanak':'Level=3 Category=2h Damage=2d6 Crit=3',
  'Weighted Pike':'Level=3 Category=2h Damage=d8/d6 Threat=19',
  'Swatter':'Level=3 Category=2h Damage=2d8 Crit=4',
  'Makillot Sap':'Level=3 Category=2h Damage=2d8 Range=10',
  'Greater Blowgun':'Level=3 Category=R Damage=d4 Range=10',
  'Chatkcha':'Level=3 Category=R Damage=d6 Range=20',
  'Dejada':'Level=3 Category=R Damage=d6 Range=30',
  'Skyhammer':'Level=3 Category=R Damage=d10 Range=15',
  'Splashbow':'Level=3 Category=R Damage=d4 Range=60',
  'Zerka':'Level=3 Category=R Damage=d8 Threat=18 Range=30'
};
DarkSun3E.WEAPONS = Object.assign({}, SRD35.WEAPONS, DarkSun3E.WEAPONS_ADDED);

/* Defines the rules related to character abilities. */
DarkSun3E.abilityRules = function(rules) {
  rules.basePlugin.abilityRules(rules);
  // No changes needed to the rules defined by base method
};

/* Defines rules related to animal companions and familiars. */
DarkSun3E.aideRules = function(rules, companions, familiars) {
  rules.basePlugin.aideRules(rules, companions, familiars);
  // No changes needed to the rules defined by base method
};

/* Defines rules related to combat. */
DarkSun3E.combatRules = function(rules, armors, shields, weapons) {
  rules.basePlugin.combatRules(rules, armors, shields, weapons);
  // No changes needed to the rules defined by base method
};

/* Defines rules related to basic character identity. */
DarkSun3E.identityRules = function(
  rules, alignments, classes, deities, paths, races, prestigeClasses, npcClasses
) {

  SRD35.identityRules(
    rules, alignments, classes, deities, paths, races, prestigeClasses,
    npcClasses
  );

  // Level adjustments for powerful races
  rules.defineRule('level', '', '^', '1');
  rules.defineRule('experienceNeededLevel',
    'level', '=', null,
    'abilityNotes.raceLevelAdjustment', '+', null
  );
  rules.defineRule('experienceNeeded',
    'experienceNeededLevel', '=', '1000 * source * (source + 1) / 2'
  );

};

/* Defines rules related to magic use. */
DarkSun3E.magicRules = function(rules, schools, spells) {
  rules.basePlugin.magicRules(rules, schools, spells);
  // No changes needed to the rules defined by base method
};

/* Defines rules related to psionics use. */
DarkSun3E.psionicsRules = function(rules, disciplines, powers) {
  QuilvynUtils.checkAttrTable(disciplines, []);
  QuilvynUtils.checkAttrTable
    (powers, ['Discipline', 'Level', 'Cost', 'Description']);
  for(var d in disciplines) {
    rules.choiceRules(rules, 'Discipline', d, disciplines[d]);
  }
  for(var p in powers) {
    rules.choiceRules(rules, 'Power', p, powers[p]);
  }
};

/* Defines rules related to character aptitudes. */
DarkSun3E.talentRules = function(
  rules, feats, features, goodies, languages, skills
) {
  rules.basePlugin.talentRules
    (rules, feats, features, goodies, languages, skills);
  // No changes needed to the rules defined by base method
};

/*
 * Adds #name# as a possible user #type# choice and parses #attrs# to add rules
 * related to selecting that choice.
 */
DarkSun3E.choiceRules = function(rules, type, name, attrs) {
  if(type == 'Alignment')
    DarkSun3E.alignmentRules(rules, name);
  else if(type == 'Animal Companion')
    DarkSun3E.companionRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Str'),
      QuilvynUtils.getAttrValue(attrs, 'Dex'),
      QuilvynUtils.getAttrValue(attrs, 'Con'),
      QuilvynUtils.getAttrValue(attrs, 'Int'),
      QuilvynUtils.getAttrValue(attrs, 'Wis'),
      QuilvynUtils.getAttrValue(attrs, 'Cha'),
      QuilvynUtils.getAttrValue(attrs, 'HD'),
      QuilvynUtils.getAttrValue(attrs, 'AC'),
      QuilvynUtils.getAttrValue(attrs, 'Attack'),
      QuilvynUtils.getAttrValueArray(attrs, 'Dam'),
      QuilvynUtils.getAttrValue(attrs, 'Size'),
      QuilvynUtils.getAttrValue(attrs, 'Level')
    );
  else if(type == 'Armor')
    DarkSun3E.armorRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'AC'),
      QuilvynUtils.getAttrValue(attrs, 'Weight'),
      QuilvynUtils.getAttrValue(attrs, 'Dex'),
      QuilvynUtils.getAttrValue(attrs, 'Skill'),
      QuilvynUtils.getAttrValue(attrs, 'Spell')
    );
  else if(type == 'Class' || type == 'Npc' || type == 'Prestige') {
    DarkSun3E.classRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValue(attrs, 'HitDie'),
      QuilvynUtils.getAttrValue(attrs, 'Attack'),
      QuilvynUtils.getAttrValue(attrs, 'SkillPoints'),
      QuilvynUtils.getAttrValue(attrs, 'Fortitude'),
      QuilvynUtils.getAttrValue(attrs, 'Reflex'),
      QuilvynUtils.getAttrValue(attrs, 'Will'),
      QuilvynUtils.getAttrValueArray(attrs, 'Skills'),
      QuilvynUtils.getAttrValueArray(attrs, 'Features'),
      QuilvynUtils.getAttrValueArray(attrs, 'Selectables'),
      QuilvynUtils.getAttrValueArray(attrs, 'Languages'),
      QuilvynUtils.getAttrValue(attrs, 'CasterLevelArcane'),
      QuilvynUtils.getAttrValue(attrs, 'CasterLevelDivine'),
      QuilvynUtils.getAttrValue(attrs, 'SpellAbility'),
      QuilvynUtils.getAttrValueArray(attrs, 'SpellSlots')
    );
    DarkSun3E.classRulesExtra(rules, name);
  } else if(type == 'Deity')
    DarkSun3E.deityRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Alignment'),
      QuilvynUtils.getAttrValueArray(attrs, 'Domain'),
      QuilvynUtils.getAttrValueArray(attrs, 'Weapon')
    );
  else if(type == 'Discipline')
    DarkSun3E.disciplineRules(rules, name);
  else if(type == 'Familiar')
    DarkSun3E.familiarRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Str'),
      QuilvynUtils.getAttrValue(attrs, 'Dex'),
      QuilvynUtils.getAttrValue(attrs, 'Con'),
      QuilvynUtils.getAttrValue(attrs, 'Int'),
      QuilvynUtils.getAttrValue(attrs, 'Wis'),
      QuilvynUtils.getAttrValue(attrs, 'Cha'),
      QuilvynUtils.getAttrValue(attrs, 'HD'),
      QuilvynUtils.getAttrValue(attrs, 'AC'),
      QuilvynUtils.getAttrValue(attrs, 'Attack'),
      QuilvynUtils.getAttrValueArray(attrs, 'Dam'),
      QuilvynUtils.getAttrValue(attrs, 'Size'),
      QuilvynUtils.getAttrValue(attrs, 'Level')
    );
  else if(type == 'Feat') {
    DarkSun3E.featRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValueArray(attrs, 'Imply'),
      QuilvynUtils.getAttrValueArray(attrs, 'Type')
    );
    DarkSun3E.featRulesExtra(rules, name);
  } else if(type == 'Feature')
     DarkSun3E.featureRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Section'),
      QuilvynUtils.getAttrValueArray(attrs, 'Note')
    );
  else if(type == 'Goody')
    DarkSun3E.goodyRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Pattern'),
      QuilvynUtils.getAttrValue(attrs, 'Effect'),
      QuilvynUtils.getAttrValue(attrs, 'Value'),
      QuilvynUtils.getAttrValueArray(attrs, 'Attribute'),
      QuilvynUtils.getAttrValueArray(attrs, 'Section'),
      QuilvynUtils.getAttrValueArray(attrs, 'Note')
    );
  else if(type == 'Language')
    DarkSun3E.languageRules(rules, name);
  else if(type == 'Path') {
    DarkSun3E.pathRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Group'),
      QuilvynUtils.getAttrValue(attrs, 'Level'),
      QuilvynUtils.getAttrValueArray(attrs, 'Features'),
      QuilvynUtils.getAttrValueArray(attrs, 'Selectables'),
      QuilvynUtils.getAttrValue(attrs, 'SpellAbility'),
      QuilvynUtils.getAttrValueArray(attrs, 'SpellSlots')
    );
    DarkSun3E.pathRulesExtra(rules, name);
  } else if(type == 'Power') {
    var powerCosts = QuilvynUtils.getAttrValueArray(attrs, 'Cost');
    var powerDesc = QuilvynUtils.getAttrValue(attrs, 'Description');
    var powerDiscipline = QuilvynUtils.getAttrValue(attrs, 'Discipline');
    var powerLevels = QuilvynUtils.getAttrValueArray(attrs, 'Level');
    for(var i = 0; i < powerLevels.length; i++) {
      var powerLevel = powerLevels[i];
      var powerCost = powerCosts[powerCosts.length == 1 ? 0 : i];
      var powerName = name + '(' + powerLevels[i] + ' ' + powerCost + ' PP)';
      DarkSun3E.powerRules
        (rules, powerName, powerDiscipline, powerLevel, powerCost, powerDesc);
      rules.addChoice('powers', powerName, attrs);
    }
  } else if(type == 'Race') {
    DarkSun3E.raceRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValueArray(attrs, 'Features'),
      QuilvynUtils.getAttrValueArray(attrs, 'Selectables'),
      QuilvynUtils.getAttrValueArray(attrs, 'Languages'),
      QuilvynUtils.getAttrValue(attrs, 'SpellAbility'),
      QuilvynUtils.getAttrValueArray(attrs, 'SpellSlots')
    );
    DarkSun3E.raceRulesExtra(rules, name);
  } else if(type == 'School') {
    DarkSun3E.schoolRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Features')
    );
    if(rules.basePlugin.schoolRulesExtra)
      rules.basePlugin.schoolRulesExtra(rules, name);
  } else if(type == 'Shield')
    DarkSun3E.shieldRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'AC'),
      QuilvynUtils.getAttrValue(attrs, 'Weight'),
      QuilvynUtils.getAttrValue(attrs, 'Skill'),
      QuilvynUtils.getAttrValue(attrs, 'Spell')
    );
  else if(type == 'Skill') {
    var untrained = QuilvynUtils.getAttrValue(attrs, 'Untrained');
    DarkSun3E.skillRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Ability'),
      untrained != 'n' && untrained != 'N',
      QuilvynUtils.getAttrValueArray(attrs, 'Class'),
      QuilvynUtils.getAttrValueArray(attrs, 'Synergies')
    );
    if(rules.basePlugin.skillRulesExtra)
      rules.basePlugin.skillRulesExtra(rules, name);
  } else if(type == 'Spell') {
    var description = QuilvynUtils.getAttrValue(attrs, 'Description');
    var groupLevels = QuilvynUtils.getAttrValueArray(attrs, 'Level');
    var school = QuilvynUtils.getAttrValue(attrs, 'School');
    var schoolAbbr = (school || 'Universal').substring(0, 4);
    for(var i = 0; i < groupLevels.length; i++) {
      var matchInfo = groupLevels[i].match(/^(\D+)(\d+)$/);
      if(!matchInfo) {
        console.log('Bad level "' + groupLevels[i] + '" for spell ' + name);
        continue;
      }
      var group = matchInfo[1];
      var level = matchInfo[2] * 1;
      var fullName = name + '(' + group + level + ' ' + schoolAbbr + ')';
      // TODO indicate domain spells in attributes?
      var domainSpell = DarkSun3E.PATHS[group + ' Domain'] != null;
      DarkSun3E.spellRules
        (rules, fullName, school, group, level, description, domainSpell);
      rules.addChoice('spells', fullName, attrs);
    }
  } else if(type == 'Weapon')
    DarkSun3E.weaponRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Level'),
      QuilvynUtils.getAttrValue(attrs, 'Category'),
      QuilvynUtils.getAttrValue(attrs, 'Damage'),
      QuilvynUtils.getAttrValue(attrs, 'Threat'),
      QuilvynUtils.getAttrValue(attrs, 'Crit'),
      QuilvynUtils.getAttrValue(attrs, 'Range')
    );
  else {
    console.log('Unknown choice type "' + type + '"');
    return;
  }
  if(type!='Feature' && type!='Path' && type!='Power' && type!='Spell') {
    type = type == 'Class' ? 'levels' :
    type = type == 'Deity' ? 'deities' :
    (type.substring(0,1).toLowerCase() + type.substring(1).replaceAll(' ', '') + 's');
    rules.addChoice(type, name, attrs);
  }
};

/* Defines in #rules# the rules associated with alignment #name#. */
DarkSun3E.alignmentRules = function(rules, name) {
  rules.basePlugin.alignmentRules(rules, name);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with armor #name#, which adds #ac#
 * to the character's armor class, requires a #weight# proficiency level to
 * use effectively, allows a maximum dex bonus to ac of #maxDex#, imposes
 * #skillPenalty# on specific skills and yields a #spellFail# percent chance of
 * arcane spell failure.
 */
DarkSun3E.armorRules = function(
  rules, name, ac, weight, maxDex, skillPenalty, spellFail
) {
  rules.basePlugin.armorRules
    (rules, name, ac, weight, maxDex, skillPenalty, spellFail);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with class #name#, which has the list
 * of hard prerequisites #requires#. The class grants #hitDie# (format [n]'d'n)
 * additional hit points and #skillPoints# additional skill points with each
 * level advance. #attack# is one of '1', '1/2', or '3/4', indicating the base
 * attack progression for the class; similarly, #saveFort#, #saveRef#, and
 * #saveWill# are each one of '1/2' or '1/3', indicating the saving throw
 * progressions. #skills# indicate class skills for the class; see skillRules
 * for an alternate way these can be defined. #features# and #selectables# list
 * the fixed and selectable features acquired as the character advances in
 * class level, and #languages# lists any automatic languages for the class.
 * #casterLevelArcane# and #casterLevelDivine#, if specified, give the
 * Javascript expression for determining the caster level for the class; these
 * can incorporate a class level attribute (e.g., 'levels.Cleric') or the
 * character level attribute 'level'. If the class grants spell slots,
 * #spellAbility# names the ability for computing spell difficulty class, and
 * #spellSlots# lists the number of spells per level per day granted.
 */
DarkSun3E.classRules = function(
  rules, name, requires, hitDie, attack, skillPoints, saveFort, saveRef,
  saveWill, skills, features, selectables, languages, casterLevelArcane,
  casterLevelDivine, spellAbility, spellSlots
) {
  rules.basePlugin.classRules(
    rules, name, requires, hitDie, attack, skillPoints, saveFort, saveRef,
    saveWill, skills, features, selectables, languages, casterLevelArcane,
    casterLevelDivine, spellAbility, spellSlots
  );
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with class #name# that cannot be
 * derived directly from the attributes passed to classRules.
 */
DarkSun3E.classRulesExtra = function(rules, name) {

  var allFeats = rules.getChoices('feats');
  var classLevel = 'levels.' + name;
  var feat;
  var feats = null;

  if(name == 'Bard') {
    rules.defineRule
      ('combatNotes.accurate', 'bardFeatures.Accurate', '=', null);
    rules.defineRule
      ('combatNotes.agile(Bard)', 'bardFeatures.Agile (Bard)', '=', null);
    rules.defineRule('combatNotes.quickThinking',
      classLevel, '+=', 'Math.floor((source - 2) / 5)'
    );
    rules.defineRule("combatNotes.scorpion'sTouch",
      "bardFeatures.Scorpion's Touch", '=', null
    );
    rules.defineRule('selectableFeatureCount.Bard',
      classLevel, '=', 'source<4 ? null : Math.floor(source / 4)'
    );
    rules.defineRule('skillNotes.skilled', 'bardFeatures.Skilled', '=', null);
    rules.defineRule
      ('skillNotes.smuggler', classLevel, '+=', 'Math.floor(source / 2)');
  } else if(name == 'Gladiator') {
    rules.defineRule('combatNotes.taunt',
      classLevel, '+=', 'Math.min(Math.floor((source + 4) / 6), 1)'
    );
    rules.defineRule('combatNotes.combatStance.1',
      'features.Combat Stance', '?', null,
      classLevel, '=', 'source<6 ? "standard" : source<12 ? "move" : "swift"'
    );
    rules.defineRule
      ('combatNotes.gladitorialPerformance', classLevel, '=', null);
    rules.defineRule('combatNotes.martialDisplay.1',
      'features.Combat Stance', '?', null,
      classLevel, '=', 'source<6 ? "standard" : source<12 ? "move" : "swift"'
    );
    rules.defineRule('combatNotes.parry.1',
      'features.Parry', '=', '"-5 "',
      'combatNotes.improvedParry', '=', '""'
    );
    rules.defineRule('combatNotes.teamStrike',
      classLevel, '=', 'Math.floor((source + 5) / 6)'
    );
    rules.defineRule('gladiatorFeatures.Improved Uncanny Dodge',
      'gladiatorFeatures.Uncanny Dodge', '?', null,
      'uncannyDodgeSources', '=', 'source >= 2 ? 1 : null'
    );
    rules.defineRule
      ('featCount.General', 'featureNotes.exoticWeapon', '+', null);
    rules.defineRule('featureNote.exoticWeapon',
      classLevel, '=', 'Math.floor((source + 3) / 4)'
    );
    rules.defineRule('selectableFeatureCount.Gladiator',
      classLevel, '=', 'source<5 ? null : Math.floor(source / 5)'
    );
    rules.defineRule
      ('uncannyDodgeSources', 'gladiatorFeatures.Uncanny Dodge', '+=', '1');
  } else if(name == 'Psion') {
    feats = [];
    for(feat in allFeats) {
      if(allFeats[feat].includes('psionic'))
        feats.push(feat);
    }
    rules.defineRule('classSkills.Gather Information',
      'psionFeatures.Clairsentience', '=' ,'1'
    );
    rules.defineRule
      ('classSkills.Listen', 'psionFeatures.Clairsentience', '=' ,'1');
    rules.defineRule
      ('classSkills.Spot', 'psionFeatures.Clairsentience', '=' ,'1');
    rules.defineRule
      ('classSkills.Bluff', 'psionFeatures.Metacreativity', '=' ,'1');
    rules.defineRule
      ('classSkills.Disguise', 'psionFeatures.Metacreativity', '=' ,'1');
    rules.defineRule('classSkills.Use Psionic Device',
      'psionFeatures.Metacreativity', '=' ,'1'
    );
    rules.defineRule
      ('classSkills.Autohypnosis', 'psionFeatures.Psychokinesis', '=' ,'1');
    rules.defineRule
      ('classSkills.Disable Device', 'psionFeatures.Psychokinesis', '=' ,'1');
    rules.defineRule
      ('classSkills.Intimidate', 'psionFeatures.Psychokinesis', '=' ,'1');
    rules.defineRule
      ('classSkills.Autohypnosis', 'psionFeatures.Psychometabolism', '=' ,'1');
    rules.defineRule('classSkills.Disable Device',
      'psionFeatures.Psychometabolism', '=' ,'1'
    );
    rules.defineRule
      ('classSkills.Intimidate', 'psionFeatures.Psychometabolism', '=' ,'1');
    rules.defineRule
      ('classSkills.Climb', 'psionFeatures.Psychoportation', '=' ,'1');
    rules.defineRule
      ('classSkills.Jump', 'psionFeatures.Psychoportation', '=' ,'1');
    rules.defineRule
      ('classSkills.Ride', 'psionFeatures.Psychoportation', '=' ,'1');
    rules.defineRule
      ('classSkills.Survival', 'psionFeatures.Psychoportation', '=' ,'1');
    rules.defineRule
      ('classSkills.Swim', 'psionFeatures.Psychoportation', '=' ,'1');
    rules.defineRule('classSkills.Bluff', 'psionFeatures.Telepathy', '=' ,'1');
    rules.defineRule
      ('classSkills.Diplomacy', 'psionFeatures.Telepathy', '=' ,'1');
    rules.defineRule
      ('classSkills.Gather Information', 'psionFeatures.Telepathy', '=' ,'1');
    rules.defineRule
      ('classSkills.Sense Motive', 'psionFeatures.Telepathy', '=' ,'1');
    rules.defineRule
      ('featCount.Psion', 'featureNotes.psionBonusFeats', '+=', null);
    rules.defineRule('magicRules.intelligenceBonusPowerPoints',
      classLevel, '?', null,
      'manifesterLevel', '=', 'Math.floor(source / 2)',
      'intelligenceModifier', '*', null
    );
    rules.defineRule('magicNotes.psionPowers',
      classLevel, '=', '[2, 6, 11, 17, 25, 35, 46, 58, 72, 88, 106, 126, 147, 170, 195, 221, 250, 280, 311, 343][source - 1]'
    );
    rules.defineRule('magicNotes.psionPowers.1',
      classLevel, '=', 'source * 2 + 1 - (source<11 ? 0 : Math.ceil((source - 10) / 2))'
    );
    rules.defineRule('magicNotes.psionPowers.2',
      classLevel, '=', 'Math.min(Math.ceil(source / 2), 9)'
    );
    rules.defineRule('powerPoints', 'magicNotes.psionPowers', '+=', null);
    rules.defineRule('featureNotes.psionBonusFeats',
      classLevel, '=', '1 + Math.floor(source / 5)'
    );
    rules.defineRule('selectableFeatureCount.Psion', classLevel, '=', '1');
  } else if(name == 'Psychic Warrior') {
    rules.defineRule('magicRules.wisdomBonusPowerPoints',
      classLevel, '?', null,
      'manifesterLevel', '=', 'Math.floor(source / 2)',
      'wisdomModifier', '*', null
    );
  } else if(name == 'Templar') {
    rules.defineRule
      ('featCount.General', 'featureNotes.martialWeapons', '+', '2');
    rules.defineRule
      ('features.Secular Authority', 'featureNotes.secularAptitude', '=', '1');
    rules.defineRule('turningLevel', classLevel, '+=', null);
  } else if(name == 'Wilder') {
    rules.defineRule('magicRules.charismaBonusPowerPoints',
      classLevel, '?', null,
      'manifesterLevel', '=', 'Math.floor(source / 2)',
      'charismaModifier', '*', null
    );
  } else if(name == 'Arch Defiler') {
    feats = [
      'Controlled Raze', 'Destructive Raze', 'Distance Raze', 'Efficient Raze',
      'Exterminating Raze', 'Fast Raze', 'Path Sinister', 'Sickening Raze'
    ];
    rules.defineRule('featCount.Arch Defiler',
      'featureNotes.archDefilerBonusFeats', '=', null
    );
    rules.defineRule('featureNotes.archDefilerBonusFeats',
      classLevel, '=', 'Math.floor((source + 3) / 4)'
    );
    rules.defineRule('magicNotes.casterLevelBonus', classLevel, '+=', null);
    rules.defineRule
      ('magicNotes.castingTimeMetamagic', classLevel, '=', 'source<7 ? 1 : 2');
    rules.defineRule('skillNotes.taintedAura',
      classLevel, '=', 'Math.floor((source + 1) / 2)'
    );
    rules.defineRule('skillNotes.taintedAura.1', classLevel, '=', 'source * 5');
  } else if(name == 'Arena Champion') {
    rules.defineRule('combatNotes.crowdSupport',
      classLevel, '=', 'Math.floor((source + 3) / 4)'
    );
    rules.defineRule('combatNotes.crowdSupport.1',
      classLevel, '=', 'level<5 ? 10 : level<9 ? 50 : 100'
    );
    rules.defineRule('featuresNotes.reputation',
      classLevel, '=', '1',
      'featureNotes.fame', '+', '1',
      'featureNotes.legend', '+', '1'
    );
    rules.defineRule('skillNotes.reputation',
      classLevel, '=', '1',
      'featureNotes.fame', '+', '1'
    );
  } else if(name == 'Dune Trader') {
    rules.defineRule('combatNotes.taunt(DuneTrader)',
      classLevel, '=', '10 + source',
      'charismaModifier', '+', null
    );
    rules.defineRule('featureNotes.agent',
      classLevel, '=', null,
      'charismaModifier', '+', null
    );
    rules.defineRule
      ('featureNotes.contact', classLevel, '=', 'Math.floor((source + 2) / 4)');
    rules.defineRule('featureNotes.distributiveBargaining',
      classLevel, '=', '10',
      'featureNotes.integrativeBargaining', '+', '10'
    );
    rules.defineRule('skillNotes.distributiveBargaining',
      classLevel, '=', '1',
      'featureNotes.integrativeBargaining', '+', '1'
    );
    rules.defineRule('skillNotes.distributiveBargaining.1',
      classLevel, '=', '2',
      'featureNotes.integrativeBargaining', '+', '2'
    );
    rules.defineRule
      ('skillNotes.openArms', classLevel, '=', 'Math.floor(source / 2)');
    rules.defineRule
      ('skillNotes.dazzle', classLevel, '=', 'Math.floor((source - 1) / 3)');
  } else if(name == 'Elementalist') {
    rules.defineRule('featureNotes.ignoreElement',
      'magicNotes.energyResistance.2', '=', null
    );
    rules.defineRule('featureNotes.ignoreElement.1',
      'features.Ignore Element', '?', null,
      classLevel, '=', null
    );
    rules.defineRule('magicNotes.elementalFocus',
      classLevel, '=', 'Math.floor((source + 1) / 3)'
    );
    rules.defineRule('magicNotes.elementalFocus.1',
      'features.Elemental Focus', '?', null,
      'saveNotes.energyResistance.2', '=', null
    );
    rules.defineRule('magicNotes.powerElement',
      'saveNotes.energyResistance.2', '=', 'source.charAt(0).toUpperCase() + source.substring(1)'
    );
    rules.defineRule('magicNotes.powerElement.1',
      'features.Power Element', '?', null,
      classLevel, '=', null
    );
    rules.defineRule('magicNotes.summonElemental',
      'saveNotes.energyResistance.2', '=', null
    );
    rules.defineRule('magicNotes.summonElemental.1',
      'features.Summon Elemental', '?', null,
      classLevel, '=', 'source<9 ? 1 : 2'
    );
    rules.defineRule('saveNotes.energyResistance.1',
      'features.Energy Resistance', '?', null,
      classLevel, '=', 'source<4 ? 10 : source<7 ? 30 : source<10 ? 30 : "Immune"'
    );
    rules.defineRule('saveNotes.energyResistance.2',
      'features.Energy Resistance', '?', null,
      'deity', '=', 'source=="Air" ? "sonic" : ' +
                    'source=="Rain" ? "electricity" : ' +
                    'source=="Water" ? "cold" : ' +
                    '"EarthSilt".includes(source) ? "acid" : "fire"'
    );
    rules.defineRule('selectableFeatureCount.Cleric',
      'magicNotes.additionalDomain', '+', '1'
    );
  } else if(name == 'Grove Master') {
    rules.defineRule('combatNotes.smiteIntruder',
      'charismaModifier', '=', 'Math.max(source, 0)'
    );
    rules.defineRule('combatNotes.smiteIntruder.1',
      'features.Smite Intruder', '?', null,
      classLevel, '=', null
    );
    rules.defineRule('combatNotes.smiteIntruder.2',
      'features.Smite Intruder', '?', null,
      classLevel, '=', 'source<7 ? 1 : 2'
    );
    rules.defineRule('companionMasterLevel', 'levels.Grove Master', '+=', null);
    rules.defineRule('magicNotes.groveMasterSpells',
      classLevel, '=',
        '("<i>Invisibility</i> " + source<6 ? "1" : "2") + "/dy" + ' +
        '(source<4 ? "" : ", <i>Teleport</i> 1/dy") + ' +
        '(source<5 ? "" : ", <i>Nondetection</i> 1/dy") + ' +
        '(source<8 ? "" : ", <i>Greater Teleport</i> 2/dy") + ' +
        '(source<9 ? "" : ", <i>Improved Invisibility</i> 1/dy")'
    );
    rules.defineRule('magicNotes.wildShape',
      'levels.Grove Master', '^=', '"small-medium"'
    );
    rules.defineRule
      ('magicNotes.wildShape.1', 'levels.Grove Master', '+=', null);
    rules.defineRule('magicNotes.wildShape.2',
      'levels.Druid', '=', 'null',
      'magicNotes.wildShape.3', '=',
         'source < 5 ? null : ' +
         'source == 5 ? 1 : ' +
         'source == 6 ? 2 : ' +
         'source < 10 ? 3 : ' +
         'source < 14 ? 4 : ' +
         'source < 18 ? 5 : 6'
    );
    rules.defineRule('magicNotes.wildShape.3',
      'levels.Druid', '=', null,
      'levels.Grove Master', '+=', null
    );
  } else if(name == 'Master Scout') {
    feats = [
      'Endurance', 'Great Fortitude', 'Iron Will', 'Lightning Reflexes',
      'Mobility', 'Toughness'
    ];
    rules.defineRule('combatNotes.favoredEnemy',
      'levels.Master Scout', '+=', 'Math.floor(source / 4)'
    );
    rules.defineRule('combatNotes.swiftStrike',
      classLevel, '=', 'Math.floor((source + 1) / 3)'
    );
    rules.defineRule('featCount.Master Scout',
      'featureNotes.masterScoutBonusFeats', '=', '1'
    );
    rules.defineRule('featureNotes.blazeTrail', classLevel, '=', null);
    rules.defineRule
      ('saveNotes.hardMarch', 'wisdomModifier', '=', 'Math.max(source, 0)');
    rules.defineRule('skillNotes.favoredEnemy',
      'levels.Master Scout', '+=', 'Math.floor(source / 4)'
    );
    rules.defineRule('skillNotes.uncannyStealth.1',
      'features.Uncanny Stealth', '?', null,
      classLevel, '=', 'source<7 ? "" : ", -10 when running or charging"'
    );
  } else if(name == 'Poisonmaster') {
    rules.defineRule
      ('combatNotes.damageReduction', 'classLevel', '=', 'source<10 ? 3 : 6');
    rules.defineRule('featureNotes.poisonSecret',
      classLevel, '=', 'Math.min(Math.floor(source / 2), 4)'
    );
    rules.defineRule('selectableFeatureCount.Poisonmaster',
      'featureNotes.poisonSecret', '=', null
    );
  } else if(name == 'Templar Knight') {
    rules.defineRule('combatNotes.smiteOpponent',
      classLevel, '+=', '1 + Math.floor(source / 5)'
    );
    rules.defineRule('combatNotes.smiteOpponent.1',
      'features.Smite Opponent', '?', null,
      'charismaModifier', '=', 'Math.max(source, 0)'
    );
    rules.defineRule('combatNotes.smiteOpponent.2',
      'features.Smite Opponent', '?', null,
      'levels.Templar Knight', '+=', null
    );
    rules.defineRule
      ('featCount.Fighter', classLevel, '+=', 'Math.floor(source / 3)');
    rules.defineRule('magicNotes.spellChanneling.1',
      'features.Spell Channeling', '?', null,
      classLevel, '=', 'source<10 ? "" : " to all hit in rd"'
    );
  }

  if(feats != null && allFeats != null) {
    for(var j = 0; j < feats.length; j++) {
      var feat = feats[j];
      if(!(feat in allFeats)) {
        console.log('Feat "' + feat + '" undefined for class "' + name + '"');
        continue;
      }
      allFeats[feat] = allFeats[feat].replace('Type=', 'Type="' + name + '",');
    }
  }

  SRD35.classRulesExtra(rules, name);

};

/*
 * Defines in #rules# the rules associated with animal companion #name#, which
 * has abilities #str#, #dex#, #con#, #intel#, #wis#, and #cha#, hit dice #hd#,
 * and armor class #ac#. The companion has attack bonus #attack# and does
 * #damage# damage. If specified, #level# indicates the minimum master level
 * the character needs to have this animal as a companion.
 */
DarkSun3E.companionRules = function(
  rules, name, str, dex, con, intel, wis, cha, hd, ac, attack, damage, size,
  level
) {
  rules.basePlugin.companionRules(
    rules, name, str, dex, con, intel, wis, cha, hd, ac, attack, damage, size,
    level
  );
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with deity #name#. #alignment# gives
 * the deity's alignment, and #domains# and #weapons# list the associated
 * domains and favored weapons.
 */
DarkSun3E.deityRules = function(rules, name, alignment, domains, weapons) {
  rules.basePlugin.deityRules(rules, name, alignment, domains, weapons);
  // No changes needed to the rules defined by base method
};

/* Defines in #rules# the rules associated with discipline #name#. */
DarkSun3E.disciplineRules = function(rules, name) {
  if(!name) {
    console.log('Empty discipline name');
    return;
  }
  // No rules pertain to discipline
};

/*
 * Defines in #rules# the rules associated with familiar #name#, which has
 * abilities #str#, #dex#, #con#, #intel#, #wis#, and #cha#, hit dice #hd#,
 * and armor class #ac#. The familiar has attack bonus #attack# and does
 * #damage# damage. If specified, #level# indicates the minimum master level
 * the character needs to have this animal as a familiar.
 */
DarkSun3E.familiarRules = function(
  rules, name, str, dex, con, intel, wis, cha, hd, ac, attack, damage, size,
  level
) {
  rules.basePlugin.familiarRules(
    rules, name, str, dex, con, intel, wis, cha, hd, ac, attack, damage, size,
    level
  );
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with feat #name#. #require# and
 * #implies# list any hard and soft prerequisites for the feat, and #types#
 * lists the categories of the feat.
 */
DarkSun3E.featRules = function(rules, name, requires, implies, types) {
  rules.basePlugin.featRules(rules, name, requires, implies, types);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with feat #name# that cannot be
 * derived directly from the abilities passed to featRules.
 */
DarkSun3E.featRulesExtra = function(rules, name) {
  if(name == 'Dissimulated') {
    rules.defineRule
      ('skillNotes.dissimulated', 'intelligenceModifier', '=', null);
  } else if(name == 'Dwarven Vision') {
    rules.defineRule
      ('features.Darkvision', 'featureNotes.dwarvenVision', '=', '1');
  } else if(name == 'Fearsome') {
    rules.defineRule('skillNotes.fearsome',
      'strengthModifier', '=', 'source + 2',
      'charismaModifier', '+', '-source'
    );
  } else if(name == 'Gladitorial Entertainer') {
    rules.defineRule('combatNotes.gladitorialEntertainer',
      'feats.Gladitorial Entertainer', '=', 'source * 4'
    );
    rules.defineRule('combatNotes.gladitorialPerformance',
      'combatNotes.gladitorialEntertainer', '+', null
    );
  } else if(name == 'Path Dexter') {
    rules.defineRule
      ('magicNotes.pathDexter', 'feats.Path Dexter', '=', 'source * 2');
  } else if(name == 'Path Sinister') {
    rules.defineRule
      ('magicNotes.pathSinister', 'feats.Path Sinister', '=', 'source * 2');
  }
};

/*
 * Defines in #rules# the rules associated with feature #name#. #sections# lists
 * the sections of the notes related to the feature and #notes# the note texts;
 * the two must have the same number of elements.
 */
DarkSun3E.featureRules = function(rules, name, sections, notes) {
  rules.basePlugin.featureRules(rules, name, sections, notes);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with goody #name#, triggered by
 * a starred line in the character notes that matches #pattern#. #effect#
 * specifies the effect of the goody on each attribute in list #attributes#.
 * This is one of "increment" (adds #value# to the attribute), "set" (replaces
 * the value of the attribute by #value#), "lower" (decreases the value to
 * #value#), or "raise" (increases the value to #value#). #value#, if null,
 * defaults to 1; occurrences of $1, $2, ... in #value# reference capture
 * groups in #pattern#. #sections# and #notes# list the note sections
 * ("attribute", "combat", "companion", "feature", "magic", "save", or "skill")
 * and formats that show the effects of the goody on the character sheet.
 */
DarkSun3E.goodyRules = function(
  rules, name, pattern, effect, value, attributes, sections, notes
) {
  rules.basePlugin.goodyRules
    (rules, name, pattern, effect, value, attributes, sections, notes);
  // No changes needed to the rules defined by base method
};

/* Defines in #rules# the rules associated with language #name#. */
DarkSun3E.languageRules = function(rules, name) {
  rules.basePlugin.languageRules(rules, name);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with path #name#, which is a
 * selection for characters belonging to #group# and tracks path level via
 * #levelAttr#. The path grants the features listed in #features#. If the path
 * grants spell slots, #spellAbility# names the ability for computing spell
 * difficulty class, and #spellSlots# lists the number of spells per level per
 * day granted.
 */
DarkSun3E.pathRules = function(
  rules, name, group, levelAttr, features, selectables, spellAbility,
  spellSlots
) {
  rules.basePlugin.pathRules(
    rules, name, group, levelAttr, features, selectables, spellAbility,
    spellSlots
  );
  // Add new domains to Cleric selections
  if(name.match(/Domain$/))
    QuilvynRules.featureListRules
      (rules, ["deityDomains =~ '" + name.replace(' Domain', '').replaceAll("'", "\\'") + "' ? 1:" + name], 'Cleric', 'levels.Cleric', true);
};

/*
 * Defines in #rules# the rules associated with path #name# that cannot be
 * derived directly from the abilities passed to pathRules.
 */
DarkSun3E.pathRulesExtra = function(rules, name) {
};

/*
 * Defines in #rules# the rules associated with psionic power #name# from
 * discipline #discipline#, which has level #level# and cost #cost#.
 * #description# is a brief description of the power's effects.
 */
DarkSun3E.powerRules = function(
  rules, name, discipline, level, cost, description
) {
  if(!name) {
    console.log('Empty power name');
    return;
  }
  if(!((discipline + '') in rules.getChoices('disciplines'))) {
    console.log('Bad discipline "' + discipline + '" for power ' + name);
    return;
  }
  if(!level.match(/^\w+\d$/)) {
    console.log('Bad level "' + level + '" for power ' + name);
    return;
  }
  if(typeof(cost) != 'number') {
    console.log('Bad cost "' + cost + '" for power ' + name);
    return;
  }
  rules.defineChoice
    ('notes', 'powers.' + name + ':(' + level + ' ' + cost + ' PP) ' + description);
};

/*
 * Defines in #rules# the rules associated with race #name#, which has the list
 * of hard prerequisites #requires#. #features# and #selectables# list
 * associated features and #languages# any automatic languages. If the race
 * grants spell slots, #spellAbility# names the ability for computing spell
 * difficulty class, and #spellSlots# lists the number of spells per level per
 * day granted.
 */
DarkSun3E.raceRules = function(
  rules, name, requires, features, selectables, languages, spellAbility,
  spellSlots
) {
  rules.basePlugin.raceRules
    (rules, name, requires, features, selectables, languages, spellAbility,
     spellSlots);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with race #name# that cannot be
 * derived directly from the abilities passed to raceRules.
 */
DarkSun3E.raceRulesExtra = function(rules, name) {
  var raceLevel =
    name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '') +
    'Level';
  if(name.includes('Aarakocra')) {
    rules.defineRule('abilityNotes.raceLevelAdjustment', raceLevel, '=', '1');
    rules.defineRule('combatNotes.naturalArmor', raceLevel, '+=', '1');
    rules.choiceRules(rules, 'Weapon', 'Beak', 'Level=1 Category=Un Damage=d2');
    rules.choiceRules(rules, 'Weapon', 'Claw', 'Level=1 Category=Un Damage=d3');
    rules.defineRule('weapons.Beak', 'combatNotes.beakAttack', '=', '1');
    rules.defineRule('weapons.Claw', 'combatNotes.clawAttack', '=', '1');
  } else if(name.includes('Half-Giant')) {
    rules.defineRule('abilityNotes.raceLevelAdjustment', raceLevel, '=', '2');
    rules.defineRule('combatNotes.naturalArmor', raceLevel, '=', '2');
  } else if(name.includes('Mul')) {
    rules.defineRule('abilityNotes.raceLevelAdjustment', raceLevel, '=', '1');
  } else if(name.includes('Pterran')) {
    rules.choiceRules(rules, 'Weapon', 'Bite', 'Level=1 Category=Un Damage=d4');
    rules.choiceRules(rules, 'Weapon', 'Claw', 'Level=1 Category=Un Damage=d3');
    rules.defineRule('weapons.Bite', 'combatNotes.biteAttack', '=', '1');
    rules.defineRule('weapons.Claw', 'combatNotes.clawAttack', '=', '1');
  } else if(name.includes('Thri-kreen')) {
    rules.defineRule('abilityNotes.raceLevelAdjustment', raceLevel, '=', '2');
    rules.defineRule('combatNotes.naturalArmor', raceLevel, '=', '2');
    rules.choiceRules(rules, 'Weapon', 'Bite', 'Level=1 Category=Un Damage=d4');
    rules.choiceRules(rules, 'Weapon', 'Claw', 'Level=1 Category=Un Damage=d3');
    rules.defineRule('weapons.Bite', 'combatNotes.biteAttack', '=', '1');
    rules.defineRule('weapons.Claw', 'combatNotes.clawAttack', '=', '1');
  }
  SRD35.raceRulesExtra(rules, name);
};

/*
 * Defines in #rules# the rules associated with magic school #name#, which
 * grants the list of #features#.
 */
DarkSun3E.schoolRules = function(rules, name, features) {
  rules.basePlugin.schoolRules(rules, name, features);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with shield #name#, which adds #ac#
 * to the character's armor class, requires a #profLevel# proficiency level to
 * use effectively, imposes #skillPenalty# on specific skills and yields a
 * #spellFail# percent chance of arcane spell failure.
 */
DarkSun3E.shieldRules = function(
  rules, name, ac, profLevel, skillFail, spellFail
) {
  rules.basePlugin.shieldRules
    (rules, name, ac, profLevel, skillFail, spellFail);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with skill #name#, associated with
 * basic ability #ability#. #untrained#, if specified, is a boolean indicating
 * whether or not the skill can be used untrained; the default is true.
 * #classes# lists the classes for which this is a class skill; a value of
 * "all" indicates that this is a class skill for all classes. #synergies#
 * lists any synergies with other skills and abilities granted by high ranks in
 * this skill.
 */
DarkSun3E.skillRules = function(
  rules, name, ability, untrained, classes, synergies
) {
  rules.basePlugin.skillRules
    (rules, name, ability, untrained, classes, synergies);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with spell #name#, which is from
 * magic school #school#. #casterGroup# and #level# are used to compute any
 * saving throw value required by the spell. #description# is a concise
 * description of the spell's effects.
 */
DarkSun3E.spellRules = function(
  rules, name, school, casterGroup, level, description, domainSpell
) {
  rules.basePlugin.spellRules
    (rules, name, school, casterGroup, level, description, domainSpell);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with weapon #name#, which requires a
 * #profLevel# proficiency level to use effectively and belongs to weapon
 * category #category# (one of '1h', '2h', 'Li', 'R', 'Un' or their spelled-out
 * equivalents). The weapon does #damage# HP on a successful attack and
 * threatens x#critMultiplier# (default 2) damage on a roll of #threat# (default
 * 20). If specified, the weapon can be used as a ranged weapon with a range
 * increment of #range# feet.
 */
DarkSun3E.weaponRules = function(
  rules, name, profLevel, category, damage, threat, critMultiplier, range
) {
  rules.basePlugin.weaponRules(
    rules, name, profLevel, category, damage, threat, critMultiplier, range
  );
  // No changes needed to the rules defined by base method
};

/*
 * Returns the list of editing elements needed by #choiceRules# to add a #type#
 * item to #rules#.
 */
DarkSun3E.choiceEditorElements = function(rules, type) {
  return rules.basePlugin.choiceEditorElements(rules, type);
};

/* Sets #attributes#'s #attribute# attribute to a random value. */
DarkSun3E.randomizeOneAttribute = function(attributes, attribute) {
  this.basePlugin.randomizeOneAttribute.apply(this, [attributes, attribute]);
  if(attribute == 'levels') {
    // Recompute experience to account for level offset for some races
    var attrs = this.applyRules(attributes);
    if(QuilvynUtils.sumMatching(attrs, /LevelAdjustment/) > 0) {
      var level = QuilvynUtils.sumMatching(attrs, /^levels\./) +
                  QuilvynUtils.sumMatching(attrs, /LevelAdjustment/);
      var max = level * (level + 1) * 1000 / 2 - 1;
      var min = level * (level - 1) * 1000 / 2;
      if(!attributes.experience || attributes.experience < min)
        attributes.experience = QuilvynUtils.random(min, max);
    }
  }
};

/* Returns an array of plugins upon which this one depends. */
DarkSun3E.getPlugins = function() {
  var base = this.basePlugin == window.SRD35 && window.PHB35 != null ? window.PHB35 : this.basePlugin;
  return [base].concat(base.getPlugins());
};

/* Returns HTML body content for user notes associated with this rule set. */
DarkSun3E.ruleNotes = function() {
  return '' +
    '<h2>Quilvyn Dark Sun Rule Set Notes</h2>\n' +
    '<p>\n' +
    'Quilvyn Dark Sun Rule Set Version ' + DarkSun3E.VERSION + '\n' +
    '</p>\n' +
    '<h3>Copyrights and Licensing</h3>\n' +
    '<p>\n' +
    "Quilvyn's Dark Sun Rule Set is unofficial Fan Content " +
    "permitted under Wizards of the Coast's " +
    '<a href="https://company.wizards.com/en/legal/fancontentpolicy">Fan Content Policy</a>.\n' +
    '</p><p>\n' +
    'Quilvyn is not approved or endorsed by Wizards of the Coast. Portions ' +
    'of the materials used are property of Wizards of the Coast. ©Wizards of ' +
    'the Coast LLC.\n' +
    '</p><p>\n' +
    'Dark Sun 3: Rules for Dark Sun Campaigns © 2009 athas.org.\n' +
    '</p><p>\n' +
    'Expanded Psionics Handbook © 2004 Wizards of the Coast, Inc.\n' +
    '</p><p>\n' +
    'Complete Divine © 2004 Wizards of the Coast, Inc.\n' +
    '</p><p>\n' +
    'Dungeons & Dragons Forgotten Realms Campaign Setting © 2001 Wizards of ' +
    'the Coast, Inc.\n' +
    '</p><p>\n' +
    "Dungeons & Dragons Player's Handbook v3.5 © 2003 Wizards of the Coast, " +
    'Inc.\n' +
    '</p>\n';
};
