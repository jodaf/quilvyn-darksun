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
 * from athas.org. The DarkSunv3 function contains methods that load rules for
 * particular parts of the rules: raceRules for character races, magicRules
 * for spells, etc. These member methods can be called independently in order
 * to use a subset of the DarkSunv3 rules. Similarly, the constant fields of
 * DarkSunv3 (FEATS, RACES, etc.) can be manipulated to modify the user's
 * choices.
 */
function DarkSunv3(baseRules) {

  if(window.SRD35 == null) {
    alert('The DarkSunv3 module requires use of the SRD35 module');
    return;
  }

  var rules = new QuilvynRules('DarkSunv3 - D&D v3.5', DarkSunv3.VERSION);
  rules.basePlugin = SRD35;
  DarkSunv3.rules = rules;

  DarkSunv3.CHOICES = rules.basePlugin.CHOICES.concat(DarkSunv3.CHOICES_ADDED);
  rules.defineChoice('choices', DarkSunv3.CHOICES);
  rules.choiceEditorElements = DarkSunv3.choiceEditorElements;
  rules.choiceRules = DarkSunv3.choiceRules;
  rules.editorElements = SRD35.initialEditorElements();
  rules.getFormats = SRD35.getFormats;
  rules.getPlugins = DarkSunv3.getPlugins;
  rules.makeValid = SRD35.makeValid;
  rules.randomizeOneAttribute = DarkSunv3.randomizeOneAttribute;
  DarkSunv3.RANDOMIZABLE_ATTRIBUTES =
    rules.basePlugin.RANDOMIZABLE_ATTRIBUTES.concat
    (DarkSunv3.RANDOMIZABLE_ATTRIBUTES_ADDED);
  rules.defineChoice('random', DarkSunv3.RANDOMIZABLE_ATTRIBUTES);
  rules.ruleNotes = DarkSunv3.ruleNotes;

  SRD35.createViewers(rules, SRD35.VIEWERS);
  rules.defineChoice('extras',
    'feats', 'featCount', 'sanityNotes', 'selectableFeatureCount',
    'validationNotes'
  );
  rules.defineChoice('preset',
    'race:Race,select-one,races', 'levels:Class Levels,bag,levels',
    'prestige:Prestige Levels,bag,prestiges', 'npc:NPC Levels,bag,npcs');

  DarkSunv3.ALIGNMENTS = Object.assign({}, rules.basePlugin.ALIGNMENTS);
  DarkSunv3.ANIMAL_COMPANIONS =
    Object.assign( {}, rules.basePlugin.ANIMAL_COMPANIONS);
  DarkSunv3.ARMORS = Object.assign({}, rules.basePlugin.ARMORS);
  DarkSunv3.NPC_CLASSES = Object.assign({}, rules.basePlugin.NPC_CLASSES);
  DarkSunv3.FAMILIARS = Object.assign({}, rules.basePlugin.FAMILIARS);
  DarkSunv3.FEATS =
    Object.assign({}, rules.basePlugin.FEATS, DarkSunv3.FEATS_ADDED);
  DarkSunv3.FEATURES =
    Object.assign({}, rules.basePlugin.FEATURES, DarkSunv3.FEATURES_ADDED);
  DarkSunv3.GOODIES = Object.assign({}, rules.basePlugin.GOODIES);
  DarkSunv3.LANGUAGES =
    Object.assign({}, rules.basePlugin.LANGUAGES, DarkSunv3.LANGUAGES_ADDED);
  DarkSunv3.DEITIES['None'] =
    'Domain="' + QuilvynUtils.getKeys(DarkSunv3.PATHS).filter(x => x.match(/Domain$/)).map(x => x.replace(' Domain', '')).join('","') + '"';
  DarkSunv3.SCHOOLS = Object.assign({}, rules.basePlugin.SCHOOLS);
  DarkSunv3.SHIELDS = Object.assign({}, rules.basePlugin.SHIELDS);
  DarkSunv3.SKILLS =
    Object.assign({}, rules.basePlugin.SKILLS, DarkSunv3.SKILLS_ADDED);
  DarkSunv3.SPELLS = Object.assign({}, SRD35.SPELLS, DarkSunv3.SPELLS_ADDED);
  delete DarkSunv3.SPELLS['Bless Water'];
  delete DarkSunv3.SPELLS['Control Water'];
  delete DarkSunv3.SPELLS['Create Water'];
  delete DarkSunv3.SPELLS['Curse Water'];
  delete DarkSunv3.SPELLS['Flame Strike'];
  delete DarkSunv3.SPELLS['Fire Storm'];
  delete DarkSunv3.SPELLS['Water Breathing'];
  delete DarkSunv3.SPELLS['Water Walking'];
  for(var s in DarkSunv3.SPELLS_LEVELS) {
    var levels = DarkSunv3.SPELLS_LEVELS[s];
    if(!(s in DarkSunv3.SPELLS)) {
      if(window.PHB35 && PHB35.SPELL_RENAMES && s in PHB35.SPELL_RENAMES) {
        s = PHB35.SPELL_RENAMES[s];
      } else {
        console.log('Missing spell "' + s + '"');
        continue;
      }
    }
    DarkSunv3.SPELLS[s] =
      DarkSunv3.SPELLS[s].replace('Level=', 'Level=' + levels + ',');
  }

  DarkSunv3.abilityRules(rules);
  DarkSunv3.aideRules(rules, DarkSunv3.ANIMAL_COMPANIONS, DarkSunv3.FAMILIARS);
  DarkSunv3.combatRules
    (rules, DarkSunv3.ARMORS, DarkSunv3.SHIELDS, DarkSunv3.WEAPONS);
  DarkSunv3.magicRules(rules, DarkSunv3.SCHOOLS, DarkSunv3.SPELLS);
  // Feats must be defined before classes
  DarkSunv3.talentRules
    (rules, DarkSunv3.FEATS, DarkSunv3.FEATURES, DarkSunv3.GOODIES,
     DarkSunv3.LANGUAGES, DarkSunv3.SKILLS);
  DarkSunv3.identityRules(
    rules, DarkSunv3.ALIGNMENTS, DarkSunv3.CLASSES, DarkSunv3.DEITIES, DarkSunv3.PATHS,
    DarkSunv3.RACES, DarkSunv3.PRESTIGE_CLASSES, DarkSunv3.NPC_CLASSES
  );

  Quilvyn.addRuleSet(rules);

}

DarkSunv3.VERSION = '2.3.1.0';

DarkSunv3.CHOICES_ADDED = [];
DarkSunv3.CHOICES = SRD35.CHOICES.concat(DarkSunv3.CHOICES_ADDED);
DarkSunv3.RANDOMIZABLE_ATTRIBUTES_ADDED = [];
DarkSunv3.RANDOMIZABLE_ATTRIBUTES =
  SRD35.RANDOMIZABLE_ATTRIBUTES.concat(DarkSunv3.RANDOMIZABLE_ATTRIBUTES_ADDED);

DarkSunv3.ALIGNMENTS = Object.assign({}, SRD35.ALIGNMENTS);
DarkSunv3.ANIMAL_COMPANIONS = Object.assign({}, SRD35.ANIMAL_COMPANIONS);
DarkSunv3.ARMORS = Object.assign({}, SRD35.ARMORS);
DarkSunv3.MONARCHS = {
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
DarkSunv3.CLASSES = {
  'Barbarian':
    SRD35.CLASSES['Barbarian'],
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
    SRD35.CLASSES['Cleric'] + ' ' +
    'Selectables=' +
      QuilvynUtils.getKeys(DarkSunv3.PATHS).filter(x => x.match(/Domain$/)).map(x => '"deityDomains =~ \'' + x.replace(' Domain', '') + '\' ? 1:' + x + '"').join(','),
  'Druid':
    SRD35.CLASSES['Druid'],
  'Fighter':
    SRD35.CLASSES['Fighter'],
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
  //'Psion': as Expanded Psionic Handbook
  //'Psychic Warrior': as Expanded Psionic Handbook
  'Ranger':
    SRD35.CLASSES['Ranger'],
  'Rogue':
    SRD35.CLASSES['Rogue']
    .replace('Features=', 'Features="Weapon Proficiency (Bard\'s Friend/Blowgun/Garrote/Small Macahuitl/Tonfa/Widow\'s Knife/Wrist Razor)",')
    .replace('Selectables=', 'Selectables="10:Dune Trader","10:False Vulnerability","10:Looter\'s Luck",10:Notoriety,"10:Silver Tongue",'),
  'Templar':
    'HitDie=d10 Attack=3/4 SkillPoints=4 Fortitude=1/2 Reflex=1/3 Will=1/2 ' +
    'Features=' +
      '"1:Armor Proficiency (Medium)","1:Shield Proficiency",' +
      '"1:Weapon Proficiency (Simple)","1:Martial Weapons",' +
      '"1:Secular Aptitude","1:Assume Domain",1:Sigil,"4:Turn Undead" ' +
    'Selectables=' +
      QuilvynUtils.getKeys(DarkSunv3.Monarchs).map(x => '"1:' + x + '"').join(',') + ' ' +
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
  //'Wilder': as Expanded Psionic Handbook
  'Wizard':
    SRD35.CLASSES['Wizard']
};
DarkSunv3.NPC_CLASSES = Object.assign({}, SRD35.NPC_CLASSES);
DarkSunv3.PRESTIGE_CLASSES = {
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
      '4:Dazzle,4:Linguist,5:Agent,"6:Improved Fast Talk",' +
      '"7:Integrative Bargaining",8:Taunt,9:Allies ' +
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
      '"1:Caster Level Bonus","1:Elemental Affiliation","1:Energy Reistance",' +
      '"2:Elemental Focus","3:Additional Domain","4:Elemental Shield",' +
      '"5:Ignore Element","6:Spontaneous Domain Spells","7:Summon Elemental",' +
      '"9:Power Element","10:Element Immunity" ' +
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
      '"4:Favored Terrain","5:Swift Strike","6:Bonus Feat" ' +
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
      '"1:Secular Authority","1:Spell-Like Abilities","1:Smite Opponents",' +
      '"2:Fearless Presence","3:Bonus Feat","5:Spell Channeling" ' +
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
DarkSunv3.FAMILIARS = Object.assign({}, SRD35.FAMILIARS);
DarkSunv3.FEATS_ADDED = {
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
      '"race =~ \'Thri-Kreen\'"',
  'Advanced Antennae':
    'Type=Racial ' +
    'Require=' +
      '"race =~ \'Thri-Kreen\'"',
  'Blend':
    'Type=Racial ' +
    'Require=' +
      '"race =~ \'Thri-Kreen\'"',
  'Blessed By The Ancestors':
    'Type=Racial ' +
    'Require=' +
      '"race =~ \'Thri-Kreen\'"',
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
      '"race =~ \'Thri-Kreen\'"',
  "Improved Gyth'sa":
    'Type=Racial ' +
    'Require=' +
      '"race =~ \'Thri-Kreen\'",' +
      '"constitution >= 13"',
  'Tikchak':
    'Type=Racial ' +
    'Require=' +
      '"race =~ \'Thri-Kreen\'",' +
      '"level >= 5"',
  'Tokchak':
    'Type=Racial ' +
    'Require=' +
      '"race =~ \'Thri-Kreen\'"',
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
      '"origin == \'Raam\'"'
};
DarkSunv3.FEATS = Object.assign({}, SRD35.FEATS, DarkSunv3.FEATS_ADDED);
DarkSunv3.FEATURES_ADDED = {

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
  'No Mercy':
    'Section=combat Note="Performs coup de grace as a standard action"',
  'Notoriety':
    'Section=feature,skill Note="+4 Leadership","+4 Bluff/+4 Intimidate"',
  'Parry':'Section=combat Note="Cancel foe attack w/%1opposed attack"',
  'Poison Dealer':
    'Section=feature Note="May buy poison ingredients for half price"',
  'Poison Resistance':'Section=save Note="+4 vs. poison"',
  'Poisonbane':'Section=skill Note="+4 Craft (Alchemy) (poison antidote)"',
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
    'Note="R30\' Inflicts -%{(source+4)//6>?1)} attack, damage, and saves vs. fear and charm on foes for 5 rd"',
  'Team Strike':
    'Section=combat ' +
    'Note="May distract foe to give ally +%V attack and +%Vd4 damage"',
  'Threatening Glare':'Section=combat Note="R30\' Gaze causes fear in creatures w/fewer HD (DC %{10+levels.Gladiator//2+charismaBonus} neg)"',
  'Trick':'Section=skill Note="R30\' Opposed bluff dazes %{levels.Gladiator//3-2} targets for 1 rd"',
  'Versatile':'Section=skill Note="Two chosen skills are class skills"',

  // Prestige Classes
  'Additional Domain':'Section=feature Note="FILL"',
  'Agent':'Section=feature Note="FILL"',
  'Allies':'Section=feature Note="FILL"',
  'Animal Companion':'Section=feature Note="FILL"',
  'Arch Defiler Bonus Feats':'Section=feature Note="%V Arch Defiler feats"',
  'Blaze Trail':'Section=feature Note="FILL"',
  'Casting Time Metamagic':'Section=feature Note="FILL"',
  'Contact':'Section=feature Note="FILL"',
  'Crowd Support':'Section=feature Note="FILL"',
  'Damage Reduction':'Section=feature Note="FILL"',
  'Dazzle':'Section=feature Note="FILL"',
  'Discipline Insight':'Section=feature Note="FILL"',
  'Distributive Bargaining':'Section=feature Note="FILL"',
  'Dosage':'Section=feature Note="FILL"',
  'Element Immunity':'Section=feature Note="FILL"',
  'Elemental Affiliation':'Section=feature Note="FILL"',
  'Elemental Focus':'Section=feature Note="FILL"',
  'Elemental Shield':'Section=feature Note="FILL"',
  'Empower Poison':'Section=feature Note="FILL"',
  'Energy Reistance':'Section=feature Note="FILL"',
  'Extend Poison':'Section=feature Note="FILL"',
  'Fame':'Section=feature Note="FILL"',
  'Fast Talk':'Section=feature Note="FILL"',
  'Favored Terrain':'Section=feature Note="FILL"',
  'Fearless Presence':'Section=feature Note="FILL"',
  'Finishing Move':'Section=feature Note="FILL"',
  'Forethought':'Section=feature Note="FILL"',
  'Grove Master Spells':'Section=feature Note="FILL"',
  'Guarded Lands':'Section=feature Note="FILL"',
  'Hard March':'Section=feature Note="FILL"',
  'Identify Poison':'Section=feature Note="FILL"',
  'Ignore Element':'Section=feature Note="FILL"',
  'Improved Fast Talk':'Section=feature Note="FILL"',
  'Improved Signature Move':'Section=feature Note="FILL"',
  'Integrative Bargaining':'Section=feature Note="FILL"',
  'Legend':'Section=feature Note="FILL"',
  'Linguist':'Section=feature Note="FILL"',
  'Maximize Poison':'Section=feature Note="FILL"',
  'Mental Resistance':'Section=feature Note="FILL"',
  'Metamagic Raze':'Section=feature Note="FILL"',
  'Mindblank':'Section=feature Note="FILL"',
  'Open Arms':'Section=feature Note="FILL"',
  'Painful Radius':'Section=feature Note="FILL"',
  'Poison Immunity':'Section=feature Note="FILL"',
  'Poison Secret':'Section=feature Note="FILL"',
  'Poison Use':'Section=feature Note="FILL"',
  "Poisoner's Fortitude":'Section=feature Note="FILL"',
  'Power Element':'Section=feature Note="FILL"',
  'Psilogism':'Section=feature Note="FILL"',
  'Psionic Acumen':'Section=feature Note="FILL"',
  'Psionic Rationalization':'Section=feature Note="FILL"',
  'Quicken Poison':'Section=feature Note="FILL"',
  'Reputation':'Section=feature Note="FILL"',
  'Roar Of The Crowd':'Section=feature Note="FILL"',
  'Sacrifice':'Section=feature Note="FILL"',
  'Schoolmaster':'Section=feature Note="FILL"',
  'Secular Authority':'Section=feature Note="FILL"',
  'Signature Move':'Section=feature Note="FILL"',
  'Smite Intruder':'Section=feature Note="FILL"',
  'Smite Opponents':'Section=feature Note="FILL"',
  'Spell Channeling':'Section=feature Note="FILL"',
  'Spell-Like Abilities':'Section=feature Note="FILL"',
  'Spontaneous Domain Spells':'Section=feature Note="FILL"',
  'Summon Elemental':'Section=feature Note="FILL"',
  'Sustenance':'Section=feature Note="FILL"',
  'Swift Strike':'Section=feature Note="FILL"',
  'Tainted Aura':'Section=feature Note="FILL"',
  'Taunt':'Section=feature Note="FILL"',
  'Timeless Body':'Section=feature Note="FILL"',
  'Uncanny Stealth':'Section=feature Note="FILL"',
  'Weapon Mastery':'Section=feature Note="FILL"',
  'Wild Shape':'Section=feature Note="FILL"',

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
    'Section=feature Note="FILL"',
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

  // Races
  'Aarakocra Ability Adjustment':
    'Section=ability Note="-2 Strength/+4 Dexterity/-2 Charisma"',
  'Aerial Dive':'Section=combat Note="Dbl damage after 30\' dive"',
  'Axis Alignment':
    'Section=ability Note="Half of alignment changes each morning"',
  'Beak Attack':'Section=combat Note="Attack with beak"',
  'Claustrophobic':'Section=feature Note="-2 all rolls in enclosed space"',
  'Desert Camouflage':'Section=skill Note="+4 Hide (arid and desert areas)"',
  'Dwarf Blood':'Section=feature Note="Dwarf for racial effects"',
  'Excellent Vision':'Section=skill Note="+6 Spot (daylight)"',
  'Elf Run':
    'Section=ability ' +
    'Note="Successful concentration checks allow running for days"',
  'Extended Activity':
    'Section=feature Note="May perform 12 hrs hard labor w/out fatigue"',
  'Fast':'Section=ability Note="+10 Speed"',
  'Flying':'Section=ability Note="90 Fly Speed"',
  'Focused':'Section=feature Note="+2 all rolls related to focus"',
  'Giant Blood':'Section=feature Note="Giant for racial effects"',
  'Half-Elf Ability Adjustment':
    'Section=ability Note="+2 Dexterity/-2 Charisma"',
  'Half-Giant Ability Adjustment':
    'Section=ability ' +
    'Note="+8 Strength/-2 Dexterity/+4 Constitution/-4 Intelligence/-4 Wisdom/-4 Charisma"',
  'Imitator':'Section=skill Note="+2 Disguise (elf or human)"',
  'Leap':'Section=skill Note="+30 Jump"',
  'Limited Darkvision':'Section=feature Note="30\' b/w vision in darkness"',
  'Monstrous Humanoid':
    'Section=save Note="Unaffected by spells that effect only humanoids"',
  'Mul Ability Adjustment':
    'Section=ability Note="+4 Strength/+2 Constitution/-2 Charisma"',
  'Multiple Limbs':
    'Section=combat ' +
    'Note="May use Multiweapon Fighting and Multiattck feats with all four arms"',
  'Poison':'Section=combat Note="Bite for 1d6 Dex + paralysis (DC %{constitutionModifier+11} neg) 1/dy"',
  'Poor Hearing':'Section=skill Note="-2 Listen"',
  'Precise':'Section=combat Note="+1 attack with slings and thrown"',
  'Psi-Like Ability':'Section=magic Note="<i>Missive</i> at will"',
  'Pterran Ability Adjustment':
    'Section=ability Note="-2 Dexterity/+2 Wisdom/+2 Charisma"',
  'Race Level Adjustment':'Section=ability Note="-%V Level"',
  'Resist Temperature':
    'Section=save Note="Treat extreme temperature as 1 level lower"',
  'Rugged':'Section=save Note="Nonlethal DR 1/-"',
  'Sharp Senses':'Section=skill Note="+4 Listen/+4 smell and taste"',
  'Suspect':'Section=skill Note="-2 Diplomacy (other races)"',
  'Thri-Kreen Ability Adjustment':
    'Section=ability ' +
    'Note="+2 Strength/+4 Dexterity/-2 Intelligence/+2 Wisdom/-4 Charisma"',
  'Tireless':'Section=save Note="+4 extended physical action"'

};
DarkSunv3.FEATURES = Object.assign({}, SRD35.FEATURES, DarkSunv3.FEATURES_ADDED);
DarkSunv3.GOODIES = Object.assign({}, SRD35.GOODIES);
DarkSunv3.LANGUAGES_ADDED = {
  'Kreen':'',
  'Sauran':''
};
DarkSunv3.PATHS = {
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
  // From Spell Compendium
  'Charm Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Charisma Boost"',
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
  'Nobility Domain':
    'Group=Cleric ' +
    'Level=levels.Cleric ' +
    'Features=' +
      '"1:Inspire Allies"'
};
DarkSunv3.DEITIES = {
  'None':'Domain="' + QuilvynUtils.getKeys(DarkSunv3.PATHS).filter(x => x.match(/Domain$/)).map(x => x.replace(' Domain', '')).join('","') + '"',
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
DarkSunv3.RACES = {
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
      '"Alert Senses","Elven Blood",Imitator,"Low-Light Vision" ' +
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
  'Mul':
    'Features=' +
      '"Mul Ability Adjustment",' +
      '"Dwarf Blood","Extended Activity","Limited Darkvision",' +
      '"Race Level Adjustment",Rugged,Tireless ' +
    'Languages=Common',
  'Pterran':
    'Features=' +
      '"Pterran Ability Adjustment",' +
      '"Weapon Familiarity (Thanak)",' +
      '"Bite Attack","Claw Attack","Poor Hearing","Psi-Like Ability" ' +
    'Languages=Sauran',
  'Thri-Kreen':
    'Features=' +
      '"Thri-Kreen Ability Adjustment",' +
      '"Weapon Familiarity (Chatkcha/Gythka)",' +
      '"Bite Attack","Claw Attack",Darkvision,"Deflect Arrows",' +
      '"Desert Camouflage",Fast,Leap,"Monstrous Humanoid","Multiple Limbs",' +
      '"Natural Armor",Poison,"Race Level Adjustment","Sleep Immunity" ' +
    'Languages=Kreen'
};
DarkSunv3.SCHOOLS = Object.assign({}, SRD35.SCHOOLS);
DarkSunv3.SHIELDS = Object.assign({}, SRD35.SHIELDS);
DarkSunv3.SKILLS_ADDED = {
  'Autohypnosis':
    'Ability=wisdom untrained=n',
  'Bluff':
    SRD35.SKILLS['Bluff'].replace('Class=', 'Class=Wizard,'),
  'Diplomacy':
    SRD35.SKILLS['Diplomacy'].replace('Druid,', ''),
  'Disguise':
    SRD35.SKILLS['Disguise'].replace('Class=', 'Class=Wizard,'),
  'Escape Artist':
    SRD35.SKILLS['Escape Artist'].replace('Class=', 'Class=Barbarian,'),
  'Hide':
    SRD35.SKILLS['Hide'].replace('Class=', 'Class=Druid,'),
  'Knowledge (Ancient History)':
    'Ability=intelligence untrained=n',
  'Knowledge (Warcraft)':
    'Ability=intelligence untrained=n Class=Fighter',
  'Literacy':
    'untrained=n Class=Wizard',
  'Move Silently':
    SRD35.SKILLS['Move Silently'].replace('Class=', 'Class=Druid,'),
  'Psicraft':
    'Ability=intelligence untrained=n',
  'Swim':
    SRD35.SKILLS['Swim'] + ' ' + 'Class=',
  'Use Psionic Device':
    'Ability=charisma untrained=n Class=Rogue'
};
DarkSunv3.SKILLS = Object.assign({}, SRD35.SKILLS, DarkSunv3.SKILLS_ADDED);
DarkSunv3.SPELLS_ADDED = {
  
  'Acid Rain':
    'School=Conjuration ' +
    'Level="Decaying Touch4" ' +
    'Description="FILL"',
  'Air Lens':
    'School=Transmutation ' +
    'Level=T5,"Sun Flare5" ' +
    'Description="FILL"',
  'Allegiance Of The Land':
    'School=Evocation ' +
    'Level=D6 ' +
    'Description="FILL"',
  'Awaken Water Spirits':
    'School=Transmutation ' +
    'Level=D6,"Living Waters6" ' +
    'Description="FILL"',
  'Backlash':
    'School=Abjuration ' +
    'Level=D1,W2 ' +
    'Description="FILL"',
  'Banish Tyr-Storm':
    'School=Abjuration ' +
    'Level=W6 ' +
    'Description="FILL"',
  'Battlefield Healing':
    'School=Conjuration ' +
    'Level=T2 ' +
    'Description="FILL"',
  'Black Cairn':
    'School=Divination ' +
    'Level=D1,T1 ' +
    'Description="FILL"',
  'Blazing Wreath':
    'School=Evocation ' +
    'Level="Smoldering Spirit9" ' +
    'Description="FILL"',
  'Bless Element':
    'School=Transmutation ' +
    'Level=C1 ' +
    'Description="FILL"',
  'Blindscorch':
    'School=Evocation ' +
    'Level="Smoldering Spirit4" ' +
    'Description="FILL"',
  "Boneclaw's Cut":
    'School=Necromancy ' +
    'Level=D3,W3 ' +
    'Description="FILL"',
  'Boneharden':
    'School=Transmutation ' +
    'Level=D2,W2 ' +
    'Description="FILL"',
  'Braxatskin':
    'School=Transmutation ' +
    'Level=C6,D5,W6 ' +
    'Description="FILL"',
  'Breeze Lore':
    'School=Divination ' +
    'Level="Ill Winds3" ' +
    'Description="FILL"',
  'Cerulean Hail':
    'School=Conjuration ' +
    'Level=W5,"Cold Malice6" ' +
    'Description="FILL"',
  'Cerulean Shock':
    'School=Evocation ' +
    'Level=W2 ' +
    'Description="FILL"',
  'Channel Stench':
    'School=Conjuration ' +
    'Level="Ill Winds1" ' +
    'Description="FILL"',
  'Claws Of The Tembo':
    'School=Conjuration ' +
    'Level=D3,R3,W4 ' +
    'Description="FILL"',
  'Cleansing Flame':
    'School=Evocation ' +
    'Level=C5,D5,W6 ' +
    'Description="FILL"',
  'Clear Water':
    'School=Transmutation ' +
    'Level=D2,"Living Waters1" ' +
    'Description="FILL"',
  'Clear-River':
    'School=Evocation ' +
    'Level=D3,W3 ' +
    'Description="FILL"',
  'Clues Of Ash':
    'School=Divination ' +
    'Level="Burning Eyes2" ' +
    'Description="FILL"',
  'Coat Of Mists':
    'School=Conjuration ' +
    'Level="Desert Mirage4",D5 ' +
    'Description="FILL"',
  "Confessor's Flame":
    'School=Evocation ' +
    'Level="Burning Eyes8",T7 ' +
    'Description="FILL"',
  'Conflagration':
    'School=Evocation ' +
    'Level="Fiery Wrath9" ' +
    'Description="FILL"',
  'Conservation':
    'School=Abjuration ' +
    'Level=D2,W3 ' +
    'Description="FILL"',
  'Control Tides':
    'School=Transmutation ' +
    'Level=C4,D4,"Drowning Despair3",W6,T6 ' +
    'Description="FILL"',
  'Conversion':
    'School=Abjuration ' +
    'Level=D5 ' +
    'Description="FILL"',
  'Cooling Canopy':
    'School=Conjuration ' +
    'Level=C1,D1,R1,W1 ' +
    'Description="FILL"',
  'Create Element':
    'School=Conjuration ' +
    'Level=C0 ' +
    'Description="FILL"',
  'Create Oasis':
    'School=Conjuration ' +
    'Level=D6 ' +
    'Description="FILL"',
  'Crusade':
    'School=Enchantment ' +
    'Level=T7 ' +
    'Description="FILL"',
  'Curse Element':
    'School=Transmutation ' +
    'Level=C1 ' +
    'Description="FILL"',
  'Curse Of The Black Sands':
    'School=Transmutation ' +
    'Level=C4,D3,"Broken Sands2" ' +
    'Description="FILL"',
  'Curse Of The Choking Sands':
    'School=Transmutation ' +
    'Level="Desert Mirage3" ' +
    'Description="FILL"',
  'Death Mark':
    'School=Necromancy ' +
    'Level=W2,"Soul Slayer2" ' +
    'Description="FILL"',
  'Death Whip':
    'School=Necromancy ' +
    'Level=W3,"Soul Slayer3" ' +
    'Description="FILL"',
  'Dedication':
    'School=Enchantment ' +
    'Level=W3,T3 ' +
    'Description="FILL"',
  'Defiler Scent':
    'School=Divination ' +
    'Level=D0,T0 ' +
    'Description="FILL"',
  'Detect Element':
    'School=Divination ' +
    'Level=C0 ' +
    'Description="FILL"',
  'Drown On Dry Land':
    'School=Transmutation ' +
    'Level="Drowning Despair6" ' +
    'Description="FILL"',
  'Echo Of The Lirr':
    'School=Evocation ' +
    'Level=D2,R2 ' +
    'Description="FILL"',
  'Elemental Armor':
    'School=Transmutation ' +
    'Level=C4 ' +
    'Description="FILL"',
  'Elemental Chariot':
    'School=Transmutation ' +
    'Level=C7 ' +
    'Description="FILL"',
  'Greater Elemental Chariot':
    'School=Transmutation ' +
    'Level=C9,"Soaring Spirit9" ' +
    'Description="FILL"',
  'Elemental Storm':
    'School=Evocation ' +
    'Level=C8,D7,"Smoldering Spirit7" ' +
    'Description="FILL"',
  'Elemental Strike':
    'School=Evocation ' +
    'Level=C5,D4,"Fiery Wrath5",T5 ' +
    'Description="FILL"',
  'Elemental Weapon':
    'School=Transmutation ' +
    'Level=C4 ' +
    'Description="FILL"',
  'Eye Of The Storm':
    'School=Abjuration ' +
    'Level=W2,C3,D3,"Furious Storm2",R2 ' +
    'Description="FILL"',
  'Fire Track':
    'School=Divination ' +
    'Level="Burning Eyes4" ' +
    'Description="FILL"',
  'Firewater':
    'School=Transmutation ' +
    'Level="Sky Blitz1" ' +
    'Description="FILL"',
  'Fissure':
    'School=Evocation ' +
    'Level="Broken Sands9","Mountains Fury9" ' +
    'Description="FILL"',
  'Flame Harvest':
    'School=Evocation ' +
    'Level=D8,"Fiery Wrath7" ' +
    'Description="FILL"',
  'Flash Flood':
    'School=Conjuration ' +
    'Level="Drowning Despair8",D9,"Living Waters8" ' +
    'Description="FILL"',
  "Fool's Feast":
    'School=Transmutation ' +
    'Level=T4 ' +
    'Description="FILL"',
  'Footsteps Of The Quarry':
    'School=Divination ' +
    'Level=R2,T2,W2 ' +
    'Description="FILL"',
  'Ghostfire':
    'School=Necromancy ' +
    'Level=W4 ' +
    'Description="FILL"',
  'Glass Storm':
    'School=Evocation ' +
    'Level="Broken Sands7" ' +
    'Description="FILL"',
  'Gloomcloud':
    'School=Enchantment ' +
    'Level=W4 ' +
    'Description="FILL"',
  'Gray Beckoning':
    'School=Conjuration ' +
    'Level="Dead Heart6",W7 ' +
    'Description="FILL"',
  'Gray Rift':
    'School=Conjuration ' +
    'Level="Dead Heart8",T9,W9 ' +
    'Description="FILL"',
  'Groundflame':
    'School=Conjuration ' +
    'Level=D5,W6 ' +
    'Description="FILL"',
  'Hand Of The Sorcerer-King':
    'School=Abjuration ' +
    'Level=T1 ' +
    'Description="FILL"',
  'Heartseeker':
    'School=Transmutation ' +
    'Level=C9,D9,"Forged Stone8" ' +
    'Description="FILL"',
  'Heat Lash':
    'School=Evocation ' +
    'Level=C1 ' +
    'Description="FILL"',
  'Illusory Talent':
    'School=Illusion ' +
    'Level=W1 ' +
    'Description="FILL"',
  'Image Of The Sorcerer-King':
    'School=Necromancy ' +
    'Level=T3 ' +
    'Description="FILL"',
  'Infestation':
    'School=Conjuration ' +
    'Level=C7,D6,"Ruinous Swarm6",W7 ' +
    'Description="FILL"',
  "Klar's Heart":
    'School=Transmutation ' +
    'Level=D4,T5 ' +
    'Description="FILL"',
  'Legendary Stonecraft':
    'School=Transmutation ' +
    'Level="Forged Stone9" ' +
    'Description="FILL"',
  'Lighten Load':
    'School=Transmutation ' +
    'Level=C3 ' +
    'Description="FILL"',
  'Liquid Lightning':
    'School=Evocation ' +
    'Level="Sky Blitz8" ' +
    'Description="FILL"',
  'Lungs Of Water':
    'School=Conjuration ' +
    'Level="Drowning Despair4" ' +
    'Description="FILL"',
  'Mage Seeker':
    'School=Divination ' +
    'Level=W4,T4 ' +
    'Description="FILL"',
  'Magic Trick':
    'School=Illusion ' +
    'Level=W2 ' +
    'Description="FILL"',
  'Magma Tunnel':
    'School=Transmutation ' +
    'Level="Mountains Fury8",W9 ' +
    'Description="FILL"',
  'Molten':
    'School=Transmutation ' +
    'Level="Broken Sands8" ' +
    'Description="FILL"',
  'Nurturing Seeds':
    'School=Abjuration ' +
    'Level=D0,R1 ' +
    'Description="FILL"',
  'Oil Spray':
    'School=Conjuration ' +
    'Level="Mountains Fury4" ' +
    'Description="FILL"',
  'Pact Of Darkness':
    'School=Necromancy ' +
    'Level=W9 ' +
    'Description="FILL"',
  'Pact Of Water':
    'School=Necromancy ' +
    'Level="Living Waters4",T5 ' +
    'Description="FILL"',
  'Plant Renewal':
    'School=Transmutation ' +
    'Level=D1 ' +
    'Description="FILL"',
  'Poisoned Gale':
    'School=Conjuration ' +
    'Level="Ill Winds7",T8 ' +
    'Description="FILL"',
  'Protection From Time':
    'School=Abjuration ' +
    'Level=W8 ' +
    'Description="FILL"',
  'Quietstorm':
    'School=Evocation ' +
    'Level=W5 ' +
    'Description="FILL"',
  'Ragestorm':
    'School=Evocation ' +
    'Level=C5,W5 ' +
    'Description="FILL"',
  'Rangeblade':
    'School=Illusion ' +
    'Level=C5,W5 ' +
    'Description="FILL"',
  'Rejuvenate':
    'School=Transmutation ' +
    'Level=C6,D5 ' +
    'Description="FILL"',
  'Return To The Earth':
    'School=Necromancy ' +
    'Level=C2,D3,"Decaying Touch1",T2 ' +
    'Description="FILL"',
  'Sand Pit':
    'School=Transmutation ' +
    'Level=W3,C3,"Broken Sands1",T3 ' +
    'Description="FILL"',
  'Sand Spray':
    'School=Evocation ' +
    'Level=W4,C4,"Broken Sands3",T3 ' +
    'Description="FILL"',
  'Sand Trap':
    'School=Transmutation ' +
    'Level=W5,"Broken Sands4" ' +
    'Description="FILL"',
  'Sand Flow':
    'School=Transmutation ' +
    'Level="Broken Sands5",T5,W5 ' +
    'Description="FILL"',
  'Sands Of Time':
    'School=Transmutation ' +
    'Level=C7,"Decaying Touch5",W6 ' +
    'Description="FILL"',
  'Sandstone':
    'School=Transmutation ' +
    'Level="Forged Stone1",W2 ' +
    'Description="FILL"',
  'Scapegoat':
    'School=Enchantment ' +
    'Level=W5 ' +
    'Description="FILL"',
  'Shining Sands':
    'School=Transmutation ' +
    'Level=W6,"Desert Mirage5" ' +
    'Description="FILL"',
  'Shroud Of Darkness':
    'School=Necromancy ' +
    'Level=W6 ' +
    'Description="FILL"',
  'Sirocco':
    'School=Evocation ' +
    'Level=D8,"Furious Storm6" ' +
    'Description="FILL"',
  'Skyfire':
    'School=Evocation ' +
    'Level=D5,W5 ' +
    'Description="FILL"',
  'Slave Scent':
    'School=Divination ' +
    'Level=W0 ' +
    'Description="FILL"',
  'Sparkrain':
    'School=Evocation ' +
    'Level=W5 ' +
    'Description="FILL"',
  'Spirit Of Flame':
    'School=Divination ' +
    'Level="Burning Eyes9" ' +
    'Description="FILL"',
  'Sting Of The Gold Scorpion':
    'School=Necromancy ' +
    'Level=D2,R2,W2 ' +
    'Description="FILL"',
  'Storm Legion':
    'School=Transmutation ' +
    'Level=D9,"Furious Storm8" ' +
    'Description="FILL"',
  'Summon Tyr-Storm':
    'School=Conjuration ' +
    'Level="Furious Storm6",W6 ' +
    'Description="FILL"',
  'Sunstroke':
    'School=Evocation ' +
    'Level="Fiery Wrath4" ' +
    'Description="FILL"',
  'Surface Tension':
    'School=Transmutation ' +
    'Level="Drowning Despair2" ' +
    'Description="FILL"',
  'Surface Walk':
    'School=Transmutation ' +
    'Level=C3,D3,R3,T3 ' +
    'Description="FILL"',
  'Swarm Of Anguish':
    'School=Transmutation ' +
    'Level=D9,"Ruinous Swarm9" ' +
    'Description="FILL"',
  'Sweet Water':
    'School=Transmutation ' +
    'Level="Living Waters5" ' +
    'Description="FILL"',
  'Tempest':
    'School=Evocation ' +
    'Level=W9 ' +
    'Description="FILL"',
  'Touch The Black':
    'School=Necromancy ' +
    'Level=W4 ' +
    'Description="FILL"',
  'Unliving Identity':
    'School=Necromancy ' +
    'Level=C7,"Dead Heart5",W7 ' +
    'Description="FILL"',
  'Vampiric Youthfulness':
    'School=Necromancy ' +
    'Level="Dead Heart9",W9 ' +
    'Description="FILL"',
  'Wakefulness':
    'School=Enchantment ' +
    'Level=W2 ' +
    'Description="FILL"',
  'Watch Fire':
    'School=Divination ' +
    'Level="Burning Eyes7" ' +
    'Description="FILL"',
  'Water Light':
    'School=Transmutation ' +
    'Level="Sky Blitz9" ' +
    'Description="FILL"',
  'Water Shock':
    'School=Evocation ' +
    'Level="Sky Blitz2" ' +
    'Description="FILL"',
  'Water Trap':
    'School=Transmutation ' +
    'Level="Drowning Despair5" ' +
    'Description="FILL"',
  'Waters Of Life':
    'School=Transmutation ' +
    'Level=D7,"Living Waters7" ' +
    'Description="FILL"',
  'Waterways':
    'School=Conjuration ' +
    'Level="Living Waters9" ' +
    'Description="FILL"',
  'Whirlpool Of Doom':
    'School=Transmutation ' +
    'Level="Drowning Despair7","Earthen Embrace7" ' +
    'Description="FILL"',
  'Wild Lands':
    'School=Enchantment ' +
    'Level=D9 ' +
    'Description="FILL"',
  'Wind Trap':
    'School=Conjuration ' +
    'Level="Ill Winds9" ' +
    'Description="FILL"',
  'Wisdom Of The Sorcerer-King':
    'School=Transmutation ' +
    'Level=T6 ' +
    'Description="FILL"',
  "Worm's Breath":
    'School=Transmutation ' +
    'Level=C3,D3,"Living Waters3",R3,T3,W3 ' +
    'Description="FILL"',
  'Wrath Of The Sorcerer-King':
    'School=Divination ' +
    'Level=T4 ' +
    'Description="FILL"',
  'Zombie Berry':
    'School=Transmutation ' +
    'Level=D3,W3 ' +
    'Description="FILL"',
  //
  'Aura Reading':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Bioflexibility':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Cast Missiles':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Cause Sleep':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Cryokinesis':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Deflect Strike':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Psionic Detect Poison':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Ghost Writing':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Hush':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Photosynthesis':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Psionic Draw':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Psychic Tracking':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Tattoo Animation':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Trail Of Destruction':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Wild Leap':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Psionic Alter Self':
    'School=Divination ' +
    'Level=Psion2 ' +
    'Description="FILL"',
  'Psionic Calm Emotions':
    'School=Divination ' +
    'Level=Psion2 ' +
    'Description="FILL"',
  'Concentrate Water':
    'School=Divination ' +
    'Level=Psion2 ' +
    'Description="FILL"',
  'Detect Life':
    'School=Divination ' +
    'Level=Psion2 ' +
    'Description="FILL"',
  'Molecular Binding':
    'School=Divination ' +
    'Level=Psion2 ' +
    'Description="FILL"',
  'Pheromone Discharge':
    'School=Divination ' +
    'Level=Psion2 ' +
    'Description="FILL"',
  'Return Missile':
    'School=Divination ' +
    'Level=Psion2 ' +
    'Description="FILL"',
  'Sensory Suppression':
    'School=Divination ' +
    'Level=Psion2 ' +
    'Description="FILL"',
  'Sever The Tie':
    'School=Divination ' +
    'Level=Psion2 ' +
    'Description="FILL"',
  'Watcher Ward':
    'School=Divination ' +
    'Level=Psion2 ' +
    'Description="FILL"',
  'Antidote Simulation':
    'School=Divination ' +
    'Level=Psion3 ' +
    'Description="FILL"',
  'Beacon':
    'School=Divination ' +
    'Level=Psion3 ' +
    'Description="FILL"',
  'Psionic Blink':
    'School=Divination ' +
    'Level=Psion3 ' +
    'Description="FILL"',
  'Psionic Lighten Load':
    'School=Divination ' +
    'Level=Psion3 ' +
    'Description="FILL"',
  'Mass Manipulation':
    'School=Divination ' +
    'Level=Psion3 ' +
    'Description="FILL"',
  'Nerve Manipulation':
    'School=Divination ' +
    'Level=Psion3 ' +
    'Description="FILL"',
  'Psionic Sight':
    'School=Divination ' +
    'Level=Psion3 ' +
    'Description="FILL"',
  'Detonate':
    'School=Divination ' +
    'Level=Psion4 ' +
    'Description="FILL"',
  'Magnetize':
    'School=Divination ' +
    'Level=Psion4 ' +
    'Description="FILL"',
  'Repugnance':
    'School=Divination ' +
    'Level=Psion4 ' +
    'Description="FILL"',
  'Shadow Jump':
    'School=Divination ' +
    'Level=Psion4 ' +
    'Description="FILL"',
  'Electroerosion':
    'School=Divination ' +
    'Level=Psion5 ' +
    'Description="FILL"',
  'Dimensional Screen':
    'School=Divination ' +
    'Level=Psion6 ' +
    'Description="FILL"',
  'Incorporeality':
    'School=Divination ' +
    'Level=Psion7 ' +
    'Description="FILL"',
  'Mindflame':
    'School=Divination ' +
    'Level=Psion7 ' +
    'Description="FILL"',
  'Share Strength':
    'School=Divination ' +
    'Level=Psion2 ' +
    'Description="FILL"',
  'Aging':
    'School=Divination ' +
    'Level=Psion3 ' +
    'Description="FILL"',
  'Death Field':
    'School=Divination ' +
    'Level=Psion3 ' +
    'Description="FILL"',
  'Accelerate':
    'School=Divination ' +
    'Level=Psion4 ' +
    'Description="FILL"',
  'Complete Healing':
    'School=Divination ' +
    'Level=Psion7 ' +
    'Description="FILL"',
  'Poison Simulation':
    'School=Divination ' +
    'Level=Psion7 ' +
    'Description="FILL"',
  'Psionic Teleport Object':
    'School=Divination ' +
    'Level=Psion7 ' +
    'Description="FILL"',
  'Psionic Locale':
    'School=Divination ' +
    'Level=Psion2 ' +
    'Description="FILL"',
  'Detect Moisture':
    'School=Divination ' +
    'Level=Psion3 ' +
    'Description="FILL"',
  'Truthear':
    'School=Divination ' +
    'Level=Psion3 ' +
    'Description="FILL"',
  'Cosmic Awareness':
    'School=Divination ' +
    'Level=Psion9 ' +
    'Description="FILL"',
  'Pocket Dimension':
    'School=Divination ' +
    'Level=Psion5 ' +
    'Description="FILL"',
  'Hallucination':
    'School=Divination ' +
    'Level=Psion4 ' +
    'Description="FILL"',
  'Cast Missiles':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Deflect Strike':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Psionic Draw':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Tattoo Animation':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Wild Leap':
    'School=Divination ' +
    'Level=Psion1 ' +
    'Description="FILL"',
  'Antidote Simulation':
    'School=Divination ' +
    'Level=Psion2 ' +
    'Description="FILL"',
  'Return Missile':
    'School=Divination ' +
    'Level=Psion2 ' +
    'Description="FILL"',
  'Share Strength':
    'School=Divination ' +
    'Level=Psion2 ' +
    'Description="FILL"',
  'Accelerate':
    'School=Divination ' +
    'Level=Psion3 ' +
    'Description="FILL"',
  'Death Field':
    'School=Divination ' +
    'Level=Psion3 ' +
    'Description="FILL"',
  'Shadow Jump':
    'School=Divination ' +
    'Level=Psion4 ' +
    'Description="FILL"',
  'Nerve Manipulation':
    'School=Divination ' +
    'Level=Psion5 ' +
    'Description="FILL"',
  'Poison Manipulation':
    'School=Divination ' +
    'Level=Psion6 ' +
    'Description="FILL"',
  //
  'Bolt Of Glory':
    'School=Evocation ' +
    'Level=Glory6 ' +
    'Description="FILL"',
  'Bolts Of Bedevilment':
    'School=Enchantment ' +
    'Level=Madness5 ' +
    'Description="FILL"',
  'Brain Spider':
    'School=Divination ' +
    'Level=Mind7 ' +
    'Description="FILL"',
  'Crown Of Glory':
    'School=Evocation ' +
    'Level=Glory8 ' +
    'Description="FILL"',
  'Lesser Telepathic Bond':
    'School=Divination ' +
    'Level=Mind3 ' +
    'Description="FILL"',
  'Maddening Scream':
    'School=Enchantment ' +
    'Level=Madness8 ' +
    'Description="FILL"',
  'Probe Thoughts':
    'School=Divination ' +
    'Level=Mind6 ' +
    'Description="FILL"',
  'Touch Of Madness':
    'School=Enchantment ' +
    'Level=Madness2 ' +
    'Description="FILL"'
};
DarkSunv3.SPELLS = Object.assign(
  {}, window.PHB35 != null ? PHB35.SPELLS : SRD35.SPELLS, DarkSunv3.SPELLS_ADDED
);
delete DarkSunv3.SPELLS['Bless Water'];
delete DarkSunv3.SPELLS['Control Water'];
delete DarkSunv3.SPELLS['Create Water'];
delete DarkSunv3.SPELLS['Curse Water'];
delete DarkSunv3.SPELLS['Flame Strike'];
delete DarkSunv3.SPELLS['Fire Storm'];
delete DarkSunv3.SPELLS['Water Breathing'];
delete DarkSunv3.SPELLS['Water Walking'];
DarkSunv3.SPELLS_LEVELS = {
  'Acid Fog':'"Ill Winds6"',
  'Air Walk':'"Soaring Spirit4"',
  'Animal Messenger':'"Ruinous Swarm1"',
  'Animate Dead':'"Dead Heart3"',
  "Bear's Endurance":'"Earthen Embrace2"',
  'Black Tentacles':'"Soul Slayer4"',
  'Blade Barrier':'"Broken Sands6"',
  'Bless Weapon':'Glory2',
  'Bolt Of Glory':'Glory6',
  'Bolts Of Bedevilment':'Madness5',
  'Brain Spider':'Mind7',
  'Burning Hands':'"Fiery Wrath1","Smoldering Spirit1"',
  'Call Lightning':'"Sky Blitz3"',
  'Call Lightning Storm':'"Sky Blitz5"',
  'Calm Emotions':'Charm2',
  'Cause Fear':'"Drowning Despair1"',
  'Chain Lightning':'"Sky Blitz7"',
  'Charm Monster':'Charm5',
  'Charm Person':'Charm1',
  'Chill Metal':'"Cold Malice2"',
  'Chill Touch':'"Cold Malice1"',
  'Circle Of Death':'"Soul Slayer7"',
  'Cloudkill':'"Ill Winds5"',
  'Color Spray':'"Sun Flare1"',
  'Command':'"Rolling Thunder1"',
  'Comprehend Languages':'Mind1',
  'Cone Of Cold':'"Cold Malice5"',
  'Confusion':'Madness4',
  'Contagion':'"Decaying Touch3"',
  'Continual Flame':'"Burning Eyes3"',
  'Control Weather':'"Sky Blitz6"',
  'Control Winds':'"Furious Storm5"',
  'Creeping Doom':'"Ruinous Swarm7"',
  'Daylight':'"Sun Flare2"',
  'Death Knell':'"Dead Heart1"',
  'Delayed Blast Fireball':'"Smoldering Spirit6"',
  'Demand':'Charm8,Nobility8',
  'Destruction':'"Decaying Touch7"',
  'Detect Secret Doors':'"Lights Revelation1"',
  'Detect Thoughts':'Mind2',
  'Discern Lies':'"Lights Revelation4",Mind4,Nobility4',
  'Discern Location':'"Lights Revelation8"',
  'Disintegrate':'"Decaying Touch6"',
  'Disrupt Undead':'Glory1',
  'Divine Favor':'Nobility1',
  'Dominate Monster':'Charm9',
  'Earthquake':'"Mountains Fury7"',
  'Elemental Storm':'"Smoldering Spirit7"',
  'Energy Drain':'"Cold Malice9"',
  'Enervation':'"Cold Malice4"',
  'Enthrall':'Nobility2',
  'Entropic Shield':'"Desert Mirage1"',
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
  'Freezing Sphere':'"Cold Malice7"',
  'Gate':'Glory9',
  'Geas/Quest':'Charm6,Nobility6',
  'Giant Vermin':'"Ruinous Swarm4"',
  'Glitterdust':'"Desert Mirage2"',
  'Greater Command':'Nobility5,"Rolling Thunder5"',
  'Greater Shout':'"Rolling Thunder7"',
  'Greater Teleport':'"Soaring Spirit6"',
  'Gust Of Wind':'"Furious Storm1"',
  'Harm':'"Soul Slayer6"',
  'Heat Metal':'"Mountains Fury2"',
  'Heroism':'Charm4',
  'Holy Smite':'Glory4',
  'Holy Sword':'Glory5',
  'Horrid Wilting':'"Cold Malice8","Desert Mirage8"',
  'Ice Storm':'"Cold Malice3","Furious Storm4"',
  'Imprisonment':'"Earthen Embrace9"',
  'Incendiary Cloud':'"Ill Winds8","Smoldering Spirit8","Sun Flare8"',
  'Infestation':'"Ruinous Swarm6"',
  'Insanity':'Charm7,Madness7',
  'Insect Plague':'"Ruinous Swarm5"',
  'Invisibility Purge':'"Lights Revelation3"',
  'Iron Body':'"Earthen Embrace8"',
  'Legend Lore':'"Lights Revelation7"',
  'Lesser Confusion':'Madness1',
  'Magic Stone':'"Earthen Embrace1","Mountains Fury1"',
  'Magic Vestment':'Nobility3',
  'Mind Blank':'Mind8',
  'Mislead':'"Desert Mirage6"',
  'Move Earth':'"Forged Stone6"',
  'Phantasmal Killer':'Madness6',
  'Power Word Blind':'"Decaying Touch8","Rolling Thunder8"',
  'Power Word Kill':'"Rolling Thunder9"',
  'Power Word Stun':'"Rolling Thunder6"',
  'Prismatic Sphere':'"Desert Mirage9"',
  'Prismatic Spray':'"Sun Flare7"',
  'Prismatic Wall':'"Desert Mirage7","Sun Flare9"',
  'Pyrotechnics':'"Ill Winds2","Smoldering Spirit2"',
  'Quench':'"Sky Blitz4"',
  'Rage':'Madness3',
  'Rainbow Pattern':'"Sun Flare4"',
  'Ray Of Enfeeblement':'"Soul Slayer1"',
  'Repel Metal Or Stone':'"Forged Stone8","Mountains Fury5"',
  'Repel Vermin':'"Ruinous Swarm3"',
  'Repulsion':'Nobility7',
  'Resist Energy':'"Fiery Wrath3"',
  'Reverse Gravity':'"Soaring Spirit8"',
  'Rusting Grasp':'"Decaying Touch2"',
  'Searing Light':'Glory3,"Sun Flare3"',
  'Secure Shelter':'"Earthen Embrace3"',
  'Shocking Grasp':'"Sky Blitz1"',
  'Shout':'"Rolling Thunder4"',
  'Slay Living':'"Soul Slayer5"',
  'Sleet Storm':'"Furious Storm3"',
  'Soften Earth And Stone':'"Forged Stone2"',
  'Soul Bind':'"Soul Slayer9"',
  'Sound Burst':'"Rolling Thunder2"',
  'Speak With Dead':'"Dead Heart2"',
  'Spider Climb':'"Soaring Spirit2"',
  'Spike Stones':'"Forged Stone4","Mountains Fury3"',
  'Statue':'"Forged Stone7"',
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
  'Transmute Mud To Rock':'"Forged Stone5"',
  'Trap The Soul':'"Soul Slayer8"',
  'True Seeing':'"Burning Eyes5","Lights Revelation5"',
  'Vampiric Touch':'"Dead Heart4"',
  'Wall Of Stone':'"Earthen Embrace4"',
  'Weird':'Madness9,Mind9',
  'Whirlwind':'"Furious Storm7"',
  'Wind Wall':'"Rolling Thunder3"',
  'Wind Walk':'"Soaring Spirit6"',
  'Zone Of Truth':'"Lights Revelation2"'
};
for(var s in DarkSunv3.SPELLS_LEVELS) {
  var levels = DarkSunv3.SPELLS_LEVELS[s];
  if(!(s in DarkSunv3.SPELLS)) {
    if(window.PHB35 && PHB35.SPELL_RENAMES && s in PHB35.SPELL_RENAMES) {
      s = PHB35.SPELL_RENAMES[s];
    } else {
      // We might be loading before PHB35 has completed. There will be another
      // chance to pick this up during DarkSunv3() initialization.
      // console.log('Missing spell "' + s + '"');
      continue;
    }
  }
  DarkSunv3.SPELLS[s] =
    DarkSunv3.SPELLS[s].replace('Level=', 'Level=' + levels + ',');
}
DarkSunv3.WEAPONS = {
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

/* Defines the rules related to character abilities. */
DarkSunv3.abilityRules = function(rules) {
  rules.basePlugin.abilityRules(rules);
  // No changes needed to the rules defined by base method
};

/* Defines rules related to animal companions and familiars. */
DarkSunv3.aideRules = function(rules, companions, familiars) {
  rules.basePlugin.aideRules(rules, companions, familiars);
  // No changes needed to the rules defined by base method
};

/* Defines rules related to combat. */
DarkSunv3.combatRules = function(rules, armors, shields, weapons) {
  rules.basePlugin.combatRules(rules, armors, shields, weapons);
  // No changes needed to the rules defined by base method
};

/* Defines rules related to basic character identity. */
DarkSunv3.identityRules = function(
  rules, alignments, classes, deities, paths, races, prestigeClasses, npcClasses
) {

  SRD35.identityRules(
    rules, alignments, classes, deities, paths, races, prestigeClasses,
    npcClasses
  );

  // Level adjustments for powerful races
  rules.defineRule('abilityNotes.raceLevelAdjustment',
    'race', '=', 'source.match(/Aarakocra|Mul/) ? 1 : source.match(/Half-Giant|Thri-Kreen/) ? 2 : null'
  );
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
DarkSunv3.magicRules = function(rules, schools, spells) {
  rules.basePlugin.magicRules(rules, schools, spells);
  // No changes needed to the rules defined by base method
};

/* Defines rules related to character aptitudes. */
DarkSunv3.talentRules = function(
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
DarkSunv3.choiceRules = function(rules, type, name, attrs) {
  if(type == 'Alignment')
    DarkSunv3.alignmentRules(rules, name);
  else if(type == 'Animal Companion')
    DarkSunv3.companionRules(rules, name,
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
    DarkSunv3.armorRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'AC'),
      QuilvynUtils.getAttrValue(attrs, 'Weight'),
      QuilvynUtils.getAttrValue(attrs, 'Dex'),
      QuilvynUtils.getAttrValue(attrs, 'Skill'),
      QuilvynUtils.getAttrValue(attrs, 'Spell')
    );
  else if(type == 'Class' || type == 'Npc' || type == 'Prestige') {
    DarkSunv3.classRules(rules, name,
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
    DarkSunv3.classRulesExtra(rules, name);
  } else if(type == 'Deity')
    DarkSunv3.deityRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Alignment'),
      QuilvynUtils.getAttrValueArray(attrs, 'Domain'),
      QuilvynUtils.getAttrValueArray(attrs, 'Weapon')
    );
  else if(type == 'Familiar')
    DarkSunv3.familiarRules(rules, name,
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
    DarkSunv3.featRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValueArray(attrs, 'Imply'),
      QuilvynUtils.getAttrValueArray(attrs, 'Type')
    );
    DarkSunv3.featRulesExtra(rules, name);
  } else if(type == 'Feature')
     DarkSunv3.featureRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Section'),
      QuilvynUtils.getAttrValueArray(attrs, 'Note')
    );
  else if(type == 'Goody')
    DarkSunv3.goodyRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Pattern'),
      QuilvynUtils.getAttrValue(attrs, 'Effect'),
      QuilvynUtils.getAttrValue(attrs, 'Value'),
      QuilvynUtils.getAttrValueArray(attrs, 'Attribute'),
      QuilvynUtils.getAttrValueArray(attrs, 'Section'),
      QuilvynUtils.getAttrValueArray(attrs, 'Note')
    );
  else if(type == 'Language')
    DarkSunv3.languageRules(rules, name);
  else if(type == 'Path') {
    DarkSunv3.pathRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Group'),
      QuilvynUtils.getAttrValue(attrs, 'Level'),
      QuilvynUtils.getAttrValueArray(attrs, 'Features'),
      QuilvynUtils.getAttrValueArray(attrs, 'Selectables'),
      QuilvynUtils.getAttrValue(attrs, 'SpellAbility'),
      QuilvynUtils.getAttrValueArray(attrs, 'SpellSlots')
    );
    DarkSunv3.pathRulesExtra(rules, name);
  } else if(type == 'Race') {
    DarkSunv3.raceRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValueArray(attrs, 'Features'),
      QuilvynUtils.getAttrValueArray(attrs, 'Selectables'),
      QuilvynUtils.getAttrValueArray(attrs, 'Languages'),
      QuilvynUtils.getAttrValue(attrs, 'SpellAbility'),
      QuilvynUtils.getAttrValueArray(attrs, 'SpellSlots')
    );
    DarkSunv3.raceRulesExtra(rules, name);
  } else if(type == 'School') {
    DarkSunv3.schoolRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Features')
    );
    if(rules.basePlugin.schoolRulesExtra)
      rules.basePlugin.schoolRulesExtra(rules, name);
  } else if(type == 'Shield')
    DarkSunv3.shieldRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'AC'),
      QuilvynUtils.getAttrValue(attrs, 'Weight'),
      QuilvynUtils.getAttrValue(attrs, 'Skill'),
      QuilvynUtils.getAttrValue(attrs, 'Spell')
    );
  else if(type == 'Skill') {
    var untrained = QuilvynUtils.getAttrValue(attrs, 'Untrained');
    DarkSunv3.skillRules(rules, name,
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
      var domainSpell = DarkSunv3.PATHS[group + ' Domain'] != null;
      DarkSunv3.spellRules
        (rules, fullName, school, group, level, description, domainSpell);
      rules.addChoice('spells', fullName, attrs);
    }
  } else if(type == 'Weapon')
    DarkSunv3.weaponRules(rules, name,
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
  if(type != 'Feature' && type != 'Path' && type != 'Spell') {
    type = type == 'Class' ? 'levels' :
    type = type == 'Deity' ? 'deities' :
    (type.substring(0,1).toLowerCase() + type.substring(1).replaceAll(' ', '') + 's');
    rules.addChoice(type, name, attrs);
  }
};

/* Defines in #rules# the rules associated with alignment #name#. */
DarkSunv3.alignmentRules = function(rules, name) {
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
DarkSunv3.armorRules = function(
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
DarkSunv3.classRules = function(
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
DarkSunv3.classRulesExtra = function(rules, name) {

  var allFeats = rules.getChoices('feats');
  var classLevel = 'levels.' + name;
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
  } else if(name == 'Templar') {
    rules.defineRule
      ('featCount.General', 'featureNotes.martialWeapons', '+', '2');
    rules.defineRule
      ('features.Secular Authority', 'featureNotes.secularAptitude', '=', '1');
    rules.defineRule('turningLevel', classLevel, '+=', null);
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
DarkSunv3.companionRules = function(
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
DarkSunv3.deityRules = function(rules, name, alignment, domains, weapons) {
  rules.basePlugin.deityRules(rules, name, alignment, domains, weapons);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with familiar #name#, which has
 * abilities #str#, #dex#, #con#, #intel#, #wis#, and #cha#, hit dice #hd#,
 * and armor class #ac#. The familiar has attack bonus #attack# and does
 * #damage# damage. If specified, #level# indicates the minimum master level
 * the character needs to have this animal as a familiar.
 */
DarkSunv3.familiarRules = function(
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
DarkSunv3.featRules = function(rules, name, requires, implies, types) {
  rules.basePlugin.featRules(rules, name, requires, implies, types);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with feat #name# that cannot be
 * derived directly from the abilities passed to featRules.
 */
DarkSunv3.featRulesExtra = function(rules, name) {
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
DarkSunv3.featureRules = function(rules, name, sections, notes) {
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
DarkSunv3.goodyRules = function(
  rules, name, pattern, effect, value, attributes, sections, notes
) {
  rules.basePlugin.goodyRules
    (rules, name, pattern, effect, value, attributes, sections, notes);
  // No changes needed to the rules defined by base method
};

/* Defines in #rules# the rules associated with language #name#. */
DarkSunv3.languageRules = function(rules, name) {
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
DarkSunv3.pathRules = function(
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
DarkSunv3.pathRulesExtra = function(rules, name) {
};

/*
 * Defines in #rules# the rules associated with race #name#, which has the list
 * of hard prerequisites #requires#. #features# and #selectables# list
 * associated features and #languages# any automatic languages. If the race
 * grants spell slots, #spellAbility# names the ability for computing spell
 * difficulty class, and #spellSlots# lists the number of spells per level per
 * day granted.
 */
DarkSunv3.raceRules = function(
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
DarkSunv3.raceRulesExtra = function(rules, name) {
  var raceLevel =
    name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '') + 'Level';
  if(name.includes('Aarakocra')) {
    rules.defineRule('combatNotes.naturalArmor', raceLevel, '=', '1');
    rules.choiceRules(rules, 'Weapon', 'Beak', 'Level=1 Category=Un Damage=d2');
    rules.choiceRules(rules, 'Weapon', 'Claw', 'Level=1 Category=Un Damage=d3');
    rules.defineRule('weapons.Beak', 'combatNotes.beakAttack', '=', '1');
    rules.defineRule('weapons.Claw', 'combatNotes.clawAttack', '=', '1');
  } else if(name.includes('Half-Giant')) {
    rules.defineRule('combatNotes.naturalArmor', raceLevel, '=', '2');
  } else if(name.includes('Pterran')) {
    rules.choiceRules(rules, 'Weapon', 'Bite', 'Level=1 Category=Un Damage=d4');
    rules.choiceRules(rules, 'Weapon', 'Claw', 'Level=1 Category=Un Damage=d3');
    rules.defineRule('weapons.Bite', 'combatNotes.biteAttack', '=', '1');
    rules.defineRule('weapons.Claw', 'combatNotes.clawAttack', '=', '1');
  } else if(name.includes('Thri-Kreen')) {
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
DarkSunv3.schoolRules = function(rules, name, features) {
  rules.basePlugin.schoolRules(rules, name, features);
  // No changes needed to the rules defined by base method
};

/*
 * Defines in #rules# the rules associated with shield #name#, which adds #ac#
 * to the character's armor class, requires a #profLevel# proficiency level to
 * use effectively, imposes #skillPenalty# on specific skills and yields a
 * #spellFail# percent chance of arcane spell failure.
 */
DarkSunv3.shieldRules = function(
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
DarkSunv3.skillRules = function(
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
DarkSunv3.spellRules = function(
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
DarkSunv3.weaponRules = function(
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
DarkSunv3.choiceEditorElements = function(rules, type) {
  return rules.basePlugin.choiceEditorElements(rules, type);
};

/* Sets #attributes#'s #attribute# attribute to a random value. */
DarkSunv3.randomizeOneAttribute = function(attributes, attribute) {
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
DarkSunv3.getPlugins = function() {
  var base = this.basePlugin == window.SRD35 && window.PHB35 != null ? window.PHB35 : this.basePlugin;
  return [base].concat(base.getPlugins());
};

/* Returns HTML body content for user notes associated with this rule set. */
DarkSunv3.ruleNotes = function() {
  return '' +
    '<h2>Quilvyn Dark Sun Rule Set Notes</h2>\n' +
    '<p>\n' +
    'Quilvyn Dark Sun Rule Set Version ' + DarkSunv3.VERSION + '\n' +
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
    'Dungeons & Dragons Dark Sun Campaign Setting © 2001 Wizards of ' +
    'the Coast, Inc.\n' +
    '</p><p>\n' +
    "Dungeons & Dragons Player's Handbook v3.5 © 2003 Wizards of the Coast, " +
    'Inc.\n' +
    '</p>\n';
};