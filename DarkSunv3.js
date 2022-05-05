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
/* globals Quilvyn, QuilvynRules, QuilvynUtils, SRD35 */
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
  DarkSunv3.SKILLS = Object.assign({}, rules.basePlugin.SKILLS);
  DarkSunv3.SPELLS = Object.assign({}, SRD35.SPELLS, DarkSunv3.SPELLS_ADDED);
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
  DarkSunv3.WEAPONS =
    Object.assign({}, rules.basePlugin.WEAPONS, DarkSunv3.WEAPONS_ADDED);

  DarkSunv3.abilityRules(rules);
  DarkSunv3.aideRules(rules, DarkSunv3.ANIMAL_COMPANIONS, DarkSunv3.FAMILIARS);
  DarkSunv3.combatRules(rules, DarkSunv3.ARMORS, DarkSunv3.SHIELDS, DarkSunv3.WEAPONS);
  DarkSunv3.magicRules(rules, DarkSunv3.SCHOOLS, DarkSunv3.SPELLS);
  // Feats must be defined before classes
  DarkSunv3.talentRules
    (rules, DarkSunv3.FEATS, DarkSunv3.FEATURES, DarkSunv3.GOODIES, DarkSunv3.LANGUAGES,
     DarkSunv3.SKILLS);
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
      '"Scorpion\'s Touch",Skilled,"Smokestick Application",Versatile',
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
      '"Armor Dexterity Optimization","Armor Weight Optimization"',
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
      'Domain9:18=1'
};
DarkSunv3.NPC_CLASSES = Object.assign({}, SRD35.NPC_CLASSES);
DarkSunv3.PRESTIGE_CLASSES = {
};
DarkSunv3.FAMILIARS = Object.assign({}, SRD35.FAMILIARS);
DarkSunv3.FEATS_ADDED = {
};
DarkSunv3.FEATS = Object.assign({}, SRD35.FEATS, DarkSunv3.FEATS_ADDED);
DarkSunv3.FEATURES_ADDED = {
  // Class
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
  'Gladitorial Performance':
    'Section=combat Note="Talent effect %{levels.Gladiator}/dy"',
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
    'Note="+2 first attack after making dispay as %1 action"',
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

  // Race
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
  "Mountain's Fury Domain":
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
      '"Mountain\'s Fury"',
  'Fire':
    'Alignment=N ' +
    'Domain=' +
      '"Burning Eyes","Sky Blitz","Mountain\'s Fury","Smoldering Spirit",' +
      '"Fiery Wrath"',
  'Magma':
    'Alignment=N ' +
    'Domain=' +
      '"Broken Sands","Dead Heart","Ill Wind","Mountain\'s Fury"',
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
DarkSunv3.SKILLS = Object.assign({}, SRD35.SKILLS);
DarkSunv3.SPELLS_ADDED = {
};
DarkSunv3.SPELLS = Object.assign(
  {}, window.PHB35 != null ? PHB35.SPELLS : SRD35.SPELLS, DarkSunv3.SPELLS_ADDED
);
DarkSunv3.SPELLS_LEVELS = {
  'Bless Weapon':'Glory2',
  'Bolt Of Glory':'Glory6',
  'Bolts Of Bedevilment':'Madness5',
  'Brain Spider':'Mind7',
  'Calm Emotions':'Charm2',
  'Charm Monster':'Charm5',
  'Charm Person':'Charm1',
  'Comprehend Languages':'Mind1',
  'Confusion':'Madness4',
  'Crown Of Glory':'Glory8',
  'Demand':'Charm8,Nobility8',
  'Detect Thoughts':'Mind2',
  'Discern Lies':'Mind4,Nobility4',
  'Disrupt Undead':'Glory1',
  'Divine Favor':'Nobility1',
  'Dominate Monster':'Charm9',
  'Enthrall':'Nobility2',
  'Gate':'Glory9',
  'Geas/Quest':'Charm6,Nobility6',
  'Greater Command':'Nobility5',
  'Heroism':'Charm4',
  'Holy Smite':'Glory4',
  'Holy Sword':'Glory5',
  'Insanity':'Charm7,Madness7',
  'Lesser Confusion':'Madness1',
  'Lesser Telepathic Bond':'Mind3',
  'Maddening Scream':'Madness8',
  'Magic Vestment':'Nobility3',
  'Mind Blank':'Mind8',
  'Phantasmal Killer':'Madness6',
  'Probe Thoughts':'Mind6',
  'Rage':'Madness3',
  'Repulsion':'Nobility7',
  'Searing Light':'Glory3',
  'Storm Of Vengeance':'Nobility9',
  'Suggestion':'Charm3',
  'Sunbeam':'Glory7',
  'Telepathic Bond':'Mind5',
  'Touch Of Madness':'Madness2',
  'Weird':'Madness9,Mind9'
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
DarkSunv3.WEAPONS_ADDED = {
  'Blade Boot':'Level=3 Category=Li Damage=1d4 Threat=19',
  'Chakram':'Level=3 Category=R Damage=1d4 Crit=3 Range=30',
  'Claw Bracer':'Level=3 Category=1h Damage=1d4 Threat=19',
  'Cutlass':'Level=2 Category=1h Damage=1d6 Threat=19',
  'Halfspear':'Level=1 Category=R Damage=d6 Crit=3 Range=20',
  'Khopesh':'Level=3 Category=1h Damage=1d8 Threat=19',
  'Saber':'Level=2 Category=1h Damage=1d8 Threat=19',
  'Maul':'Level=2 Category=2h Damage=1d10 Crit=3 Threat=20',
  'Scourge':'Level=3 Category=1h Damage=1d8 Threat=20'
};
DarkSunv3.WEAPONS = Object.assign({}, SRD35.WEAPONS, DarkSunv3.WEAPONS_ADDED);

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
