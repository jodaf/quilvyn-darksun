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
  DarkSunv3.CLASSES = Object.assign({}, rules.basePlugin.CLASSES);
  DarkSunv3.NPC_CLASSES = Object.assign({}, rules.basePlugin.NPC_CLASSES);
  DarkSunv3.FAMILIARS = Object.assign({}, rules.basePlugin.FAMILIARS);
  DarkSunv3.FEATS =
    Object.assign({}, rules.basePlugin.FEATS, DarkSunv3.FEATS_ADDED);
  DarkSunv3.FEATURES =
    Object.assign({}, rules.basePlugin.FEATURES, DarkSunv3.FEATURES_ADDED);
  DarkSunv3.GOODIES = Object.assign({}, rules.basePlugin.GOODIES);
  DarkSunv3.LANGUAGES =
    Object.assign({}, rules.basePlugin.LANGUAGES, DarkSunv3.LANGUAGES_ADDED);
  DarkSunv3.PATHS =
    Object.assign({}, rules.basePlugin.PATHS, DarkSunv3.PATHS_ADDED);
  DarkSunv3.DEITIES['None'] =
    'Domain=' + QuilvynUtils.getKeys(DarkSunv3.PATHS).filter(x => x.match(/Domain$/)).map(x => x.replace(' Domain', '')).join(',');
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
DarkSunv3.CLASSES = Object.assign({}, SRD35.CLASSES);
DarkSunv3.NPC_CLASSES = Object.assign({}, SRD35.NPC_CLASSES);
DarkSunv3.PRESTIGE_CLASSES = {
};
DarkSunv3.FAMILIARS = Object.assign({}, SRD35.FAMILIARS);
DarkSunv3.FEATS_ADDED = {
};
DarkSunv3.FEATS = Object.assign({}, SRD35.FEATS, DarkSunv3.FEATS_ADDED);
DarkSunv3.FEATURES_ADDED = {
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
DarkSunv3.PATHS_ADDED = {
};
DarkSunv3.PATHS = Object.assign({}, SRD35.PATHS, DarkSunv3.PATHS_ADDED);
DarkSunv3.DEITIES = {
  'None':'Domain=' + QuilvynUtils.getKeys(DarkSunv3.PATHS).filter(x => x.match(/Domain$/)).map(x => x.replace(' Domain', '')).join(',')
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
      'Accurate,"Resist Spells","Sharp Senses",Slow,Small,Spry,Suspect ' +
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
    'Languages=Kreen',
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

  if(name == 'Arcane Devotee') {

    if(allFeats == null)
      console.log('No feats defined for class "' + name + '"');
    else
      feats = [
        'Greater Spell Penetration', 'Improved Counterspell', 'Magical Artisan',
        'Shadow Weave Magic', 'Spell Penetration'
      ].concat(
        QuilvynUtils.getKeys(allFeats).filter(x => x.match(/Spell\s+Focus/))
      );

    rules.defineRule('featureNotes.arcaneDevoteeBonusFeats',
      classLevel, '=', 'Math.floor(source / 3)'
    );
    rules.defineRule('featCount.Arcane Devotee',
      'featureNotes.arcaneDevoteeBonusFeats', '=', null
    );
    rules.defineRule('magicNotes.casterLevelBonus', classLevel, '+=', null);
    rules.defineRule('magicNotes.devoteeEnlargeSpell',
      'charismaModifier', '+=', 'source > 0 ? source + 1 : 1'
    );
    rules.defineRule
      ('saveNotes.divineShroud', 'casterLevelArcane', '+=', '12 + source');
    rules.defineRule
      ('saveNotes.divineShroud.1', 'charismaModifier', '+=', '5 + source');
    rules.defineRule
      ('saveNotes.sacredDefense', classLevel, '+=', 'Math.floor(source / 2)');

  } else if(name == 'Archmage') {

    var allSpells = rules.getChoices('spells');
    var matchInfo;
    for(var spell in allSpells) {
      if((matchInfo = spell.match(/\(\w+5 (\w+)\)/)) != null) {
        var school = matchInfo[1];
        rules.defineRule
          ('level5' + school + 'Spells', 'spells.' + spell, '+=', '1');
        rules.defineRule
          ('level5SpellSchools', 'level5' + school + 'Spells', '+=', '1');
      }
    }
    rules.defineRule('features.Spell Power',
      'features.Spell Power +1', '=', '1',
      'features.Spell Power +2', '=', '1',
      'features.Spell Power +3', '=', '1'
    );
    rules.defineRule('featureNotes.highArcana', classLevel, '=', null);
    rules.defineRule('magicNotes.casterLevelBonus', classLevel, '+=', null);
    rules.defineRule('magicNotes.spellPower',
      'features.Spell Power +1', '+=', '1',
      'features.Spell Power +2', '+=', '2',
      'features.Spell Power +3', '+=', '3'
    );
    rules.defineRule('magicNotes.arcaneFire', 'levels.Archmage', '=', null);
    rules.defineRule('magicNotes.arcaneFire.1',
      'features.Arcane Fire', '?', null,
      'levels.Archmage', '=', '400 + 40 * source'
    );
    rules.defineRule
      ('selectableFeatureCount.Archmage', 'featureNotes.highArcana', '+=', null);
    rules.defineRule('spellSlots.S5',
      'archmageFeatures.Spell Power +1', '+', '-1',
      'archmageFeatures.Spell-Like Ability', '+', '-1'
    );
    rules.defineRule('spellSlots.W5',
      'archmageFeatures.Spell Power +1', '+', '-1',
      'archmageFeatures.Spell-Like Ability', '+', '-1'
    );
    rules.defineRule
      ('spellSlots.S6', 'archmageFeatures.Mastery Of Shaping', '+', '-1');
    rules.defineRule
      ('spellSlots.W6', 'archmageFeatures.Mastery Of Shaping', '+', '-1');
    rules.defineRule('spellSlots.S7',
      'archmageFeatures.Arcane Reach', '+', '-1',
      'archmageFeatures.Improved Arcane Reach', '+', '-1',
      'archmageFeatures.Mastery Of Counterspelling', '+', '-1',
      'archmageFeatures.Spell Power +2', '+', '-1'
    );
    rules.defineRule('spellSlots.W7',
      'archmageFeatures.Arcane Reach', '+', '-1',
      'archmageFeatures.Improved Arcane Reach', '+', '-1',
      'archmageFeatures.Mastery Of Counterspelling', '+', '-1',
      'archmageFeatures.Spell Power +2', '+', '-1'
    );
    rules.defineRule
      ('spellSlots.S8', 'archmageFeatures.Mastery Of Elements', '+', '-1');
    rules.defineRule
      ('spellSlots.W8', 'archmageFeatures.Mastery Of Elements', '+', '-1');
    rules.defineRule('spellSlots.S9',
      'archmageFeatures.Arcane Fire', '+', '-1',
      'archmageFeatures.Spell Power +3', '+', '-1'
    );
    rules.defineRule('spellSlots.W9',
      'archmageFeatures.Arcane Fire', '+', '-1',
      'archmageFeatures.Spell Power +3', '+', '-1'
    );

  } else if(name == 'Divine Champion') {

    rules.defineRule('combatNotes.divineWrath', 'charismaModifier', '=', null);
    rules.defineRule('combatNotes.smiteInfidel',
      'charismaModifier', '=', 'source > 0 ? source : 0'
    );
    rules.defineRule('combatNotes.smiteInfidel.1', classLevel, '=', null);
    rules.defineRule('featureNotes.divineChampionBonusFeats',
      classLevel, '=', 'Math.floor(source / 2)'
    );
    rules.defineRule('featCount.Fighter',
      'featureNotes.divineChampionBonusFeats', '+=', null
    );
    rules.defineRule('magicNotes.championLayOnHands',
      classLevel, '=', null,
      'charismaModifier', '*', null,
      'charisma', '?', 'source >= 12'
    );
    rules.defineRule('magicNotes.championLayOnHands.1',
      'features.Champion Lay On Hands', '?', null,
      'deity', '=', null
    );
    rules.defineRule('saveNotes.divineWrath', 'charismaModifier', '=', null);
    rules.defineRule
      ('saveNotes.sacredDefense', classLevel, '+=', 'Math.floor(source / 2)');

  } else if(name == 'Divine Disciple') {

    rules.defineRule
      ('selectableFeatureCount.Cleric', 'featureNotes.newDomain', '+=', '1');
    rules.defineRule('magicNotes.casterLevelBonus', classLevel, '+=', null);
    rules.defineRule
      ('saveNotes.sacredDefense', classLevel, '+=', 'Math.floor(source / 2)');
    rules.defineRule('skillNotes.transcendence',
      'deity', '=', 'source.replace(/\\s*\\(.*\\)/, "")'
    );

  } else if(name == 'Divine Seeker') {

    rules.defineRule
      ('combatNotes.sneakAttack', classLevel, '+=', 'Math.floor(source / 2)');
    rules.defineRule('magicNotes.locateCreature', classLevel, '=', null);
    rules.defineRule
      ('magicNotes.locateCreature.1', classLevel, '=', 'source * 40 + 400');
    rules.defineRule('magicNotes.locateObject', classLevel, '=', null);
    rules.defineRule
      ('magicNotes.locateObject.1', classLevel, '=', 'source * 40 + 400');
    // Unsure of the spell level for Obscure Object
    rules.defineRule
      ('magicNotes.obscureObject', 'charismaModifier', '=', '12 + source');
    rules.defineRule('magicNotes.sanctuary', classLevel, '=', null);
    rules.defineRule('magicNotes.sanctuary.1',
      classLevel, '?', null,
      'charismaModifier', '=', '11 + source'
    );
    rules.defineRule
      ('saveNotes.sacredDefense', classLevel, '+=', 'Math.floor(source / 2)');

  } else if(name == 'Guild Thief') {

    if(allFeats == null)
      console.log('No feats defined for class "' + name + '"');
    else
      feats = [
        'Alertness', 'Blind-Fight', 'Cosmopolitan', 'Education', 'Leadership',
        'Lightning Reflexes', 'Still Spell', 'Street Smart', 'Weapon Finesse',
        'Weapon Proficiency (Hand Crossbow)'
      ].concat(
        QuilvynUtils.getKeys(allFeats).filter(x => x.match(/Skill\s+Focus|Weapon\s+Focus|Track/))
      );

    rules.defineRule('combatNotes.improvedUncannyDodge',
      classLevel, '+=', null,
      '', '+', '4'
    );
    rules.defineRule('combatNotes.sneakAttack',
      classLevel, '+=', 'Math.floor((source + 1) / 2)'
    );
    rules.defineRule('featureNotes.guildThiefBonusFeats',
      classLevel, '=', 'Math.floor(source / 2)'
    );
    rules.defineRule('featCount.Guild Thief',
      'featureNotes.guildThiefBonusFeats', '=', null
    );
    rules.defineRule('featureNotes.reputation',
      classLevel, '=', 'source >= 3 ? source - 2 : null'
    );

  } else if(name == 'Harper Scout') {

    rules.defineRule('combatNotes.favoredEnemy',
      classLevel, '+=', '1 + Math.floor(source / 4)'
    );
    rules.defineRule
      ('featCount.General', classLevel, '+=', 'source >= 2 ? 2 : null');
    rules.defineRule('skillNotes.bardicKnowledge', classLevel, '+=', null);
    rules.defineRule('skillNotes.favoredEnemy',
      classLevel, '+=', '1 + Math.floor(source / 4)'
    );
    QuilvynRules.prerequisiteRules(
      rules, 'validation', 'harperSkillFocus', 'features.Harper Skill Focus',
      'Sum \'features.Skill Focus\' >= 1'
    );
    QuilvynRules.prerequisiteRules(
      rules, 'validation', 'harperPerformFocus','features.Harper Perform Focus',
      'Sum \'features.Skill Focus .Perform\' >= 1'
    );

  } else if(name == 'Hathran') {

    rules.defineRule('magicNotes.casterLevelBonus', classLevel, '+=', null);
    rules.defineRule
      ('magicNotes.fear', classLevel, '=', 'source>=8 ? 3 : source>=6 ? 2 : 1');
    rules.defineRule('magicNotes.fear.1',
      'features.Fear', '?', null,
      'charismaModifier', '=', '13 + source'
    );
    rules.defineRule('magicNotes.fear.2',
      'features.Fear', '?', null,
      'casterLevels.C', '^=', null,
      'casterLevels.D', '^=', null,
      'casterLevels.S', '^=', null,
      'casterLevels.W', '^=', null
    );
    rules.defineRule('magicNotes.greaterCommand', classLevel, '=', null);
    rules.defineRule('magicNotes.greaterCommand.1',
      classLevel, '=', 'source>=3 ? Math.floor(source / 2) * 5 + 25 : null'
    );
    rules.defineRule('magicNotes.greaterCommand.2',
      classLevel, '?', 'source >= 10',
      'charismaModifier', '=', '15 + source'
    );

  } else if(name == 'Hierophant') {

    rules.defineRule
      ('featureNotes.hierophantSpecialAbilities', classLevel, '=', null);
    rules.defineRule('selectableFeatureCount.Hierophant',
      'featureNotes.hierophantSpecialAbilities', '+=', null
    );
    rules.defineRule('combatNotes.turnUndead.1',
      'combatNotes.masteryOfEnergy', '+', '4'
    );
    rules.defineRule('combatNotes.turnUndead.2',
      'combatNotes.masteryOfEnergy', '+', '4'
    );
    rules.defineRule('magicNotes.faithHealing.1',
      'features.Faith Healing', '?', null,
      'deity', '=', null
    );
    rules.defineRule
      ('features.Spell Power', 'features.Spell Power +2', '=', '1');
    rules.defineRule
      ('magicNotes.spellPower', 'features.Spell Power +2', '+=', '2');

  } else if(name == 'Purple Dragon Knight') {

    rules.defineRule('combatNotes.finalStand',
      classLevel, '=', null,
      'charismaModifier', '+', null
    );
    rules.defineRule('magicNotes.fear', classLevel, '=', '1');
    rules.defineRule('magicNotes.fear.1',
      'features.Fear', '?', null,
      'charismaModifier', '=', '13 + source'
    );
    rules.defineRule('magicNotes.fear.2', classLevel, '=', null);
    rules.defineRule("magicNotes.inspireKnight'sCourage",
      classLevel, '=', 'Math.floor(source / 2)'
    );

  } else if(name == 'Red Wizard') {

    rules.defineRule('sumItemCreationAndMetamagicFeats',
      'sumItemCreationFeats', '=', null,
      'sumMetamagicFeats', '+', null
    );
    rules.defineRule('featureNotes.redWizardBonusFeats', classLevel, '=', '1');
    rules.defineRule
      ('featCount.Wizard', 'featureNotes.redWizardBonusFeats', '+=', null);
    rules.defineRule('magicNotes.casterLevelBonus', classLevel, '+=', null);
    rules.defineRule
      ('magicNotes.spellPower', classLevel, '+=', 'Math.floor(source / 2)');
    rules.defineRule('saveNotes.specialistDefense',
      classLevel, '+=', 'Math.floor((source + 1) / 2) - (source >= 5 ? 1 : 0)'
    );
    rules.defineRule('selectableFeatureCount.Wizard',
      'magicNotes.enhancedSpecialization', '+', '1'
    );

  } else if(name == 'Runecaster') {

    rules.defineRule('magicNotes.casterLevelBonus', classLevel, '+=', null);
    rules.defineRule('magicNotes.runePower',
      classLevel, '=', 'source >= 9 ? 3 : source >= 5 ? 2 : 1'
    );
    rules.defineRule('skillNotes.runeCraft',
      classLevel, '=', 'source>=7 ? 3 : Math.floor((source + 2) / 3)'
    );

  } else if(name == 'Shadow Adept') {

    rules.defineRule
      ('features.Insidious Magic', 'featureNotes.shadowFeats', '=', null);
    rules.defineRule
      ('features.Pernicious Magic', 'featureNotes.shadowFeats', '=', null);
    rules.defineRule
      ('features.Tenacious Magic', 'featureNotes.shadowFeats', '=', null);
    rules.defineRule
      ('featureNotes.shadowAdeptBonusFeats', classLevel, '=', '1');
    rules.defineRule
      ('featCount.Metamagic', 'featureNotes.shadowAdeptBonusFeats', '+=', null);
    rules.defineRule
      ('magicNotes.insidiousMagic', 'casterLevel', '=', 'source + 11');
    rules.defineRule('magicNotes.casterLevelBonus', classLevel, '+=', null);
    rules.defineRule
      ('magicNotes.perniciousMagic', 'casterLevel', '=', 'source + 11');
    rules.defineRule
      ('magicNotes.shieldOfShadows', 'casterLevel', '=', null);
    rules.defineRule
      ('magicNotes.shadowDouble', 'casterLevel', '=', null);
    rules.defineRule('magicNotes.shadowWalk', classLevel, '=', null);
    rules.defineRule
      ('magicNotes.spellPower', classLevel, '+=', 'Math.floor(source / 3)');
    rules.defineRule
      ('magicNotes.tenaciousMagic', 'casterLevel', '=', '15 + source');
    rules.defineRule
      ('saveNotes.greaterShieldOfShadows', classLevel, '=', 'source + 12');
    rules.defineRule('saveNotes.shadowDefense',
      classLevel, '=', 'Math.floor((source + 1) / 3)'
    );

  } else if(rules.basePlugin.classRulesExtra) {

    rules.basePlugin.classRulesExtra(rules, name);

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
      (rules, ["deityDomains =~ '" + name.replace(' Domain', '') + "' ? 1:" + name], 'Cleric', 'levels.Cleric', true);
};

/*
 * Defines in #rules# the rules associated with path #name# that cannot be
 * derived directly from the abilities passed to pathRules.
 */
DarkSunv3.pathRulesExtra = function(rules, name) {
  if(name == 'Family Domain') {
    rules.defineRule('magicNotes.familialProtection',
      'charismaModifier', '=', 'source > 1 ? source : 1'
    );
    rules.defineRule('magicNotes.familialProtection.1', 'level', '=', null);
  } else if(name == 'Halfling Domain') {
    rules.defineRule('skillNotes.sprightly', 'charismaModifier', '=', null);
  } else if(name == 'Mentalism Domain') {
    rules.defineRule('magicNotes.mentalWard', 'level', '=', 'source + 2');
  } else if(name == 'Nobility Domain') {
    rules.defineRule('magicNotes.inspireAllies',
      'charismaModifier', '=', 'source >= 1 ? source : null'
    );
  } else if(name == 'Ocean Domain') {
    rules.defineRule('magicNotes.waterBreathing', 'level', '=', '10 * source');
  } else if(name == 'Orc Domain') {
    rules.defineRule('combatNotes.smitePower', 'levels.Cleric', '=', null);
  } else if(name == 'Renewal Domain') {
    rules.defineRule('combatNotes.renewSelf', 'charismaModifier', '=', null);
  } else if(name == 'Storm Domain') {
    rules.defineRule
      ('resistance.Electricity', 'saveNotes.stormfriend', '^=', '5');
  } else if(name == 'Trade Domain') {
    rules.defineRule('magicNotes.tradeSecrets', 'charismaModifier', '=', null);
  } else if(name == 'Undeath Domain') {
    rules.defineRule
      ('combatNotes.extraTurning', 'clericFeatures.Extra Turning', '+=', '4');
  } else if(rules.basePlugin.pathRulesExtra) {
    rules.basePlugin.pathRulesExtra(rules, name);
  }
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
