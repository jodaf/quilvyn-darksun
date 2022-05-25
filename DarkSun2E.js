/*
Copyright 2022, James J. Hayes

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
/* globals OldSchool, OSRIC, Quilvyn, QuilvynRules, QuilvynUtils */
"use strict";

/*
 * This module loads the rules from the 2nd Edition Dark Sun boxed set. The
 * DarkSun2E function contains methods that load rules for particular parts
 * of the rule book; raceRules for character races, magicRules for spells, etc.
 * These member methods can be called independently in order to use a
 * subset of the DarkSun2E rules. Similarly, the constant fields of DarkSun2E
 * (CLASSES, RACES, etc.) can be manipulated to modify the choices.
 */
function DarkSun2E() {

  if(window.OldSchool == null) {
    alert('The DarkSun2E module requires use of the OldSchool module');
    return;
  }

  OldSchool.EDITION = 'Second Edition';

  var rules = new QuilvynRules('Dark Sun - AD&D 2E', DarkSun2E.VERSION);

  rules.defineChoice
    ('choices', ['Discipline', 'Power'].concat(OldSchool.CHOICES));
  rules.choiceEditorElements = OSRIC.choiceEditorElements;
  rules.choiceRules = DarkSun2E.choiceRules;
  rules.editorElements = DarkSun2E.initialEditorElements();
  rules.getFormats = OSRIC.getFormats;
  rules.getPlugins = DarkSun2E.getPlugins;
  rules.makeValid = OSRIC.makeValid;
  rules.randomizeOneAttribute = DarkSun2E.randomizeOneAttribute;
  rules.defineChoice
    ('random', OldSchool.RANDOMIZABLE_ATTRIBUTES.concat(['element', 'disciplines', 'powers']));
  rules.ruleNotes = DarkSun2E.ruleNotes;

  OSRIC.createViewers(rules, OSRIC.VIEWERS);
  rules.defineChoice('extras', 'feats', 'sanityNotes', 'validationNotes');
  rules.defineChoice
    ('preset', 'race:Race,select-one,races','levels:Class Levels,bag,levels');

  DarkSun2E.abilityRules(rules);
  DarkSun2E.combatRules
    (rules, DarkSun2E.ARMORS, DarkSun2E.SHIELDS, DarkSun2E.WEAPONS);
  DarkSun2E.magicRules
    (rules, DarkSun2E.SCHOOLS, DarkSun2E.SPELLS, DarkSun2E.DISCIPLINES,
     DarkSun2E.POWERS);
  DarkSun2E.talentRules
    (rules, DarkSun2E.FEATURES, DarkSun2E.GOODIES,
     DarkSun2E.LANGUAGES, DarkSun2E.SKILLS);
  DarkSun2E.identityRules(
    rules, DarkSun2E.ALIGNMENTS, DarkSun2E.CLASSES, DarkSun2E.RACES
  );

  rules.defineEditorElement
    ('wildTalent', 'Wild Talent', 'checkbox', [''], 'spells');
  rules.defineEditorElement
    ('disciplines', 'Disciplines', 'set', 'disciplines', 'spells');
  rules.defineEditorElement('powers', 'Powers', 'set', 'powers', 'spells');
  rules.defineSheetElement('Cleric Element', 'Levels+', ' <b>(%V)</b>');
  rules.defineSheetElement('Defiler Or Preserver', 'Levels+', ' <b>(%V)</b>');
  rules.defineSheetElement('Disciplines', 'Spell Points+', null, '; ');
  rules.defineSheetElement('Psionic Strength Points', 'Disciplines+');
  rules.defineSheetElement
    ('Powers', 'Spells', '<b>Powers</b>:\n%V', '\n');

  // Add additional elements to sheet -- copied from OldSchool.js
  rules.defineSheetElement('Strength');
  rules.defineSheetElement
    ('StrengthInfo', 'Dexterity', '<b>Strength</b>: %V', '/');
  rules.defineSheetElement('Strength', 'StrengthInfo/', '%V');
  rules.defineSheetElement('Extra Strength', 'StrengthInfo/', '%V');
  rules.defineSheetElement
    ('Experience Points', 'Level', '<b>Experience</b>: %V', '; ');
  rules.defineSheetElement('SpeedInfo');
  rules.defineSheetElement('Speed', 'LoadInfo', '<b>%N</b>: %V');
  rules.defineSheetElement('StrengthTests', 'LoadInfo', '%V', '');
  rules.defineSheetElement
    ('Strength Minor Test', 'StrengthTests/',
     '<b>Strength Minor/Major Test</b>: %Vin20');
  rules.defineSheetElement('Strength Major Test', 'StrengthTests/', '/%V%');
  rules.defineSheetElement('Maximum Henchmen', 'Alignment');
  rules.defineSheetElement('Survive System Shock', 'Save+', '<b>%N</b>: %V%');
  rules.defineSheetElement('Survive Resurrection', 'Save+', '<b>%N</b>: %V%');
  rules.defineSheetElement('EquipmentInfo', 'Combat Notes', null);
  rules.defineSheetElement('Weapon Proficiency Count', 'EquipmentInfo/');
  rules.defineSheetElement
    ('Weapon Proficiency', 'EquipmentInfo/', null, '; ');
  rules.defineSheetElement('Nonweapon Proficiency Count', 'SkillStats');
  rules.defineSheetElement
    ('Thac0Info', 'AttackInfo', '<b>THAC0 Melee/Ranged</b>: %V', '/');
  rules.defineSheetElement('Thac0Melee', 'Thac0Info/', '%V');
  rules.defineSheetElement('Thac0Ranged', 'Thac0Info/', '%V');
  rules.defineSheetElement
    ('Thac10Info', 'AttackInfo', '<b>THAC10 Melee/Ranged</b>: %V', '/');
  rules.defineSheetElement('Thac10Melee', 'Thac10Info/', '%V');
  rules.defineSheetElement('Thac10Ranged', 'Thac10Info/', '%V');
  rules.defineSheetElement('AttackInfo');
  rules.defineSheetElement('Turn Undead', 'Combat Notes', null);
  rules.defineSheetElement
    ('Understand Spell', 'Spell Slots', '<b>%N</b>: %V%');
  rules.defineSheetElement('Maximum Spells Per Level', 'Spell Slots');

  Quilvyn.addRuleSet(rules);

}

DarkSun2E.VERSION = '2.3.1.0';

OldSchool.EDITION = 'Second Edition';

DarkSun2E.ALIGNMENTS =
  Object.assign({}, OldSchool.editedRules(OldSchool.ALIGNMENTS, 'Alignment'));
DarkSun2E.ARMORS =
  Object.assign({}, OldSchool.editedRules(OldSchool.ARMORS, 'Armor'));
var classes2E = OldSchool.editedRules(OldSchool.CLASSES, 'Class');
DarkSun2E.CLASSES = {
  'Abjurer':
    classes2E.Abjurer,
  'Bard':
    classes2E.Bard
    .replace(/CasterLevel\S*|SpellAbility\S*|SpellSlots\S*/g, '') + ' ' +
    'Features=' +
      '"Armor Proficiency (All)",' +
      '"Charming Music","Defensive Song","Legend Lore",' +
      '"Poetic Inspiration","Bard Skills","Master Of Poisons"',
  'Cleric':
    classes2E.Cleric
    .replace('Features=', 'Features="5:Elemental Indifference","7:Conjure Element",'),
  'Conjurer':
    classes2E.Conjurer,
  'Diviner':
    classes2E.Diviner,
  'Druid':
    classes2E.Druid
    .replace(/"[^"]*Armor\s+Proficiency[^"]*",/ig, '')
    .replaceAll('Features=',
      'Features=' +
        'Concealment,"Guarded Lands","3:Speak With Animals",' +
        '"charisma >= 16/wisdom >= 16 ? 1:Bonus Druid Experience",' +
        '"5:Speak With Plants","7:Live Off The Land",10:Shapeshift,') + ' ' +
    'Require=' +
      '"charisma >= 15","wisdom >= 12"',
  'Enchanter':
    classes2E.Enchanter,
  'Fighter':
    classes2E.Fighter + ' ' +
    'Features=' +
      '"1:Armor Proficiency (All)","1:Shield Proficiency (All)",' +
      '"strength >= 16 ? 1:Bonus Fighter Experience",' +
      '3:Trainer,4:Artillerist,"6:Construct Defenses",7:Commander,' +
      '"9:War Engineer",10:Leader', 
  'Gladiator':
    classes2E.Fighter + ' ' +
    'Require="constitution >= 15","dexterity >= 12","strength >= 13" ' +
    'Features=' +
      '"1:Armor Proficiency (All)","1:Shield Proficiency (All)",' +
      '"strength >= 16 ? 1:Bonus Gladiator Experience",' +
      '"Weapons Expert",Brawler,"5:Optimized Armor",9:Leader',
  'Illusionist':
    classes2E.Illusionist,
  'Invoker':
    classes2E.Invoker,
  'Magic User':
    classes2E['Magic User'],
  'Necromancer':
    classes2E.Necromancer,
  'Psionicist':
    'Require=' +
      '"alignment !~ \'Chaotic\'","constitution >= 11","intelligence >= 13",' +
      '"wisdom >= 15" ' +
    'HitDie=d6,9,2 Attack=0,1,2,- WeaponProficiency=2,5,4 ' +
    'NonweaponProficiency=3,3 ' +
    'Breath=16,1,4 Death=13,1,4 Petrification=10,1,4 Spell=15,2,4 Wand=15,2,4 '+
    'Features=' +
      '"Armor Proficiency (Hide/Leather/Studded Leather)",' +
      '"Shield Proficiency (Small)",' +
      '"Psionic Powers","Resist Enchantment" ' +
    'Experience=' +
      '0,2.2,4.4,8.8,16.5,30,55,100,200,400,600,800,1000,1200,1500,1800,2100,' +
      '2400,2700,3000',
  'Ranger':
    classes2E.Ranger + ' ' +
    'Require=' +
      '"alignment =~ \'Good\'","constitution >= 14","dexterity >= 13",' +
      '"strength >= 13","wisdom >= 14"',
  'Templar':
    classes2E.Cleric
    .replaceAll('Cleric', 'Templar') + ' ' +
    'Require="alignment !~ \'Good\'","intelligence >= 10","wisdom >= 9" ' +
    'Features=' +
      '"1:Armor Proficiency (All)","1:Shield Proficiency (All)",' +
      '"1:Turn Undead","Command Slave","Pass Judgment","2:Enter Building",' +
      '"3:Requisition Soldiers","4:Make Accusation","6:Create Scroll",' +
      '"6:Draw Funds","8:Create Potion","17:Grant Pardon"' + ' ' +
    'SpellSlots=' +
      'P1:2=1;4=2;5=3;11=4;14=5;15=6;16=7;18=8;19=9,' +
      'P2:3=1;5=2;8=3;12=4;14=5;15=6;16=7;18=8;19=9,' +
      'P3:6=1;7=2;9=3;13=4;15=5;16=6;17=7;18=8;19=9,' +
      'P4:8=1;10=2;12=3;14=4;15=5;16=6;17=7;18=8;19=9,' +
      'P5:11=1;13=2;15=3;16=4;17=5;18=6;19=7;20=9,' +
      'P6:14=1;15=2;16=3;17=4;19=5;20=6,' +
      'P7:15=1;17=2;19=3;20=4',
  'Thief':
    classes2E.Thief
    .replaceAll('Features=', 'Features=10:Patron,') + ' ' +
    'Require=' +
      '"alignment != \'Lawful Good\'","dexterity >= 9"',
  'Transmuter':
    classes2E.Transmuter
};
DarkSun2E.DISCIPLINES = {
  'Clairsentience':'',
  'Psychokinesis':'',
  'Psychometabolism':'',
  'Psychoportation':'',
  'Telepathy':'',
  'Metapsionic':''
};
DarkSun2E.FEATURES_ADDED = {

  // Class
  'Artillerist':
    'Section=combat Note="May operate bombardment and siege weapons"',
  'Bard Skills':
    'Section=skill ' +
    'Note="Climb Walls, Find Traps, Hear Noise, Hide In Shadows, Move Silently, Open Locks, Pick Pockets, Read Languages"',
  'Bonus Gladiator Experience':
    'Section=ability Note="10% added to awarded experience"',
  'Command Slave':
    'Section=feature Note="May command any slave within home city"',
  'Commander':
    'Section=combat Note="May lead up to %{levels.Fighter*100} troops"',
  'Concealment':
    'Section=feature Note="Undetectable non-magically in guarded lands"',
  'Conjure Element':
    'Section=magic ' +
    'Note="R50\' Gate %{levels.Cleric-6}\' cu material from element plane of %V 1/dy"',
  'Construct Defenses':
    'Section=combat Note="Knows how to construct defensive works"',
  'Defiler Abjurer':'Section=ability Note="Rapid advancement to level %V"',
  'Defiler Conjurer':'Section=ability Note="Rapid advancement to level %V"',
  'Defiler Diviner':'Section=ability Note="Rapid advancement to level %V"',
  'Defiler Enchanter':'Section=ability Note="Rapid advancement to level %V"',
  'Defiler Invoker':'Section=ability Note="Rapid advancement to level %V"',
  'Defiler Magic User':'Section=ability Note="Rapid advancement to level %V"',
  'Defiler Necromancer':'Section=ability Note="Rapid advancement to level %V"',
  'Defiler Transmuter':'Section=ability Note="Rapid advancement to level %V"',
  'Draw Funds':
    'Section=feature Note="May draw %{levels.Templar}d10 GP city funds"',
  'Elemental Indifference':
    'Section=feature Note="Unaffected by %V %{levels.Cleric} rd/dy"',
  'Enter Building':'Section=feature Note="May enter any %V within home city"',
  'Grant Pardon':
    'Section=feature Note="May pardon condemned man within home city"',
  'Guarded Lands':
    'Section=feature ' +
    'Note="Must select geography to protect %{levels.Druid>=12?\'and spend half time there\':\'\'}"',
  'Leader':'Section=combat Note="Leads %V units of followers"',
  'Live Off The Land':
    'Section=feature Note="Needs no food or water while in guarded lands"',
  'Make Accusation':
    'Section=feature Note="May accuse %V of crime within home city"',
  'Master Of Poisons':
    'Section=skill Note="Knows how to use up to %{levels.Bard} poisons"',
  'Optimized Armor':'Section=combat Note="-%V AC in armor"',
  'Pass Judgment':
    'Section=feature Note="May pass judgment on %V within home city"',
  'Patron':
    'Section=combat ' +
    'Note="%{levels.Thief*5}% chance of finding patron to assign tasks and provide protection"',
  'Psionic Powers':
    'Section=magic ' +
    'Note="Access to %V disciplines, %1 sciences, %2 devotions, and %3 defense modes"',
  'Requisition Soldiers':
    'Section=feature ' +
    'Note="Can call upon %{levels.Templar}d4 soldiers within home city"',
  'Resist Enchantment':'Section=save Note="+2 vs. enchantment spells"',
  'Shapeshift':
    'Section=magic ' +
    'Note="May change into creatures common to guarded lands 3/dy"',
  'Speak With Animals':
    'Section=magic ' +
    'Note="<i>Speak With Animals</i> at will %{levels.Druid>=7 ? \'\' : \'in guarded lands\'}"',
  'Speak With Plants':
    'Section=magic ' +
    'Note="<i>Speak With Plants</i> at will %{levels.Druid>=9 ? \'\': \'in guarded lands\'}"',
  'Trainer':
    'Section=combat Note="May teach students in use of specialized weapons"',
  'War Engineer':'Section=combat Note="May build heavy war machines"',
  'Weapons Expert':
    'Section=combat ' +
    'Note="Proficient in all weapons; may specialize in multiple weapons"',
  'Wild Talent':
    'Section=magic ' +
    'Note="Access to 1 discipline and 1 devotion; %V Psionic Strength Points"',

  // Race
  'Antennae':'Section=combat Note="Reduces melee vision penalty by 1"',
  'Bite Attack':'Section=combat Note="May attack w/bite"',
  'Brawler':'Section=combat Note="+%V punching/+%1% KO"',
  'Brawny':'Section=combat Note="Dbl rolled hit points"',
  'Carnivore':'Section=feature Note="Considers others as potential food"',
  'Chatkcha Fighter':'Section=combat Note="Weapon Proficiency (Chatkcha)"',
  'Claw Attack':'Section=combat Note="May attack w/claws"',
  'Clannish':
    'Section=feature ' +
    'Note="Attached to halfling culture; will always help other halflings"',
  'Conditioned':
    'Section=feature Note="Unaffected by temperatures from 32F to 110F"',
  'Dodge Missiles':'Section=combat Note="12in20 chance to dodge missiles"',
  'Dwarf Ability Adjustment':
    'Section=ability ' +
    'Note="+2 Constitution/-2 Charisma/-1 Dexterity/+1 Strength"',
  'Elf Ability Adjustment':
    'Section=ability ' +
    'Note="-2 Constitution/+2 Dexterity/+1 Intelligence/-1 Wisdom"',
  'Elf Run':'Section=ability Note="+%1 Speed/May move 50 miles/dy"',
  'Exoskeleton':'Section=combat Note="-5 AC/Cannot use armor"',
  'Focused':
    'Section=feature,save,skill ' +
    'Note="Judges others based on contribution to focus",' +
         '"+1 saves while pursuing focus",' +
         '"+2 proficiencies while pursuing focus"',
  'Half-Elf Ability Adjustment':
    'Section=ability ' +
    'Note="-1 Constitution/+1 Dexterity"',
  'Half-Giant Ability Adjustment':
    'Section=ability ' +
    'Note="-2 Charisma/+2 Constitution/-2 Intelligence/+4 Strength/-2 Wisdom"',
  'Halfling Ability Adjustment':
    'Section=ability ' +
    'Note="-1 Charisma/-1 Constitution/+2 Dexterity/-2 Strength/+2 Wisdom"',
  'Hunter':'Section=feature Note="Focused on procuring food"',
  'Imitator':
    'Section=feature Note="Will often take on habits of nearby culture"',
  'Leaper':'Section=skill Note="May jump 20\' up or 50\' forward"',
  'Long Bow Precision':'Section=combat Note="+1 attack w/Long Bow"',
  'Long Sword Precision':'Section=combat Note="+1 attack w/Long Sword"',
  'Mul Ability Adjustment':
    'Section=ability ' +
    'Note="-2 Charisma/+1 Constitution/-1 Intelligence/+2 Strength"',
  'Pet':'Section=feature Note="May have trained animal companion"',
  'Protective':
    'Section=combat Note="Instinctively leaps into battle to help companions"',
  'Resist Disease':'Section=save Note="+%V vs. disease"',
  'Respect For Place':
    'Section=feature ' +
    'Note="Will not remove resources from where they are found"',
  'Sleepless':'Section=feature Note="Does not sleep"',
  'Paralyzing Bite':
    'Section=combat ' +
    'Note="Bitten S/M/L creature paralyzed for 2d10/2d8/1d8 rd (Save neg)"',
  'Survivalist':
    'Section=skill Note="Proficient in Survival (choice of terrain)"',
  'Thri-kreen Ability Adjustment':
    'Section=ability ' +
    'Note="-2 Charisma/+2 Dexterity/-1 Intelligence/+1 Wisdom"',
  'Thri-kreen Immunities':
    'Section=save Note="Immune <i>Charm Person</i> and <i>Hold Person</i>"',
  'Variable Alignment':
    'Section=ability Note="Changes one axis of alignment each morning"',
  'Vigorous':
    'Section=feature ' +
    'Note="May perform %1/%2/%3/%4 hrs normal/light/medium/heavy labor w/out rest; recovers w/8 hrs rest"',
  'Walker':'Section=skill Note="Travels only on foot"',
  'Wilderness Stealth':
    'Section=skill Note="Foes -4 surprise in wilderness and wastes"',
  'Xenophobic':'Section=feature Note="Suspicious of those outside of tribe"'

};
DarkSun2E.FEATURES =
  Object.assign({}, OldSchool.editedRules(Object.assign({}, OSRIC.FEATURES, OldSchool.FEATURES_ADDED), 'Feature'), DarkSun2E.FEATURES_ADDED);
DarkSun2E.GOODIES =
  Object.assign({}, OldSchool.editedRules(OldSchool.GOODIES, 'Goody'));
DarkSun2E.LANGUAGES = {
  'Aarakocra':'',
  'Anakore':'',
  'Belgoi':'',
  'Braxat':'',
  'Common':'',
  'Dwarf':'',
  'Elf':'',
  'Ettercap':'',
  'Genie':'',
  'Giant':'',
  'Gith':'',
  'Goblin Spider':'',
  'Halfling':'',
  'Jozhal':'',
  'Kenku':'',
  'Meazel':'',
  'Thri-kreen':'',
  'Yuan-ti':''
};
DarkSun2E.POWERS = {
  'Aura Sight':
    'Discipline=Clairsentience ' +
    'Type=Science ' +
    'Score=wisdom,-5 ' +
    'Cost=9,9/rd ' +
    'Description="R50\' Self learns 2 targets\' alignment or level"',
  'Clairaudience':
    'Discipline=Clairsentience ' +
    'Type=Science ' +
    'Score=wisdom,-3 ' +
    'Cost=6,4/rd ' +
    'Description="Self hears known location"',
  'Clairvoyance':
    'Discipline=Clairsentience ' +
    'Type=Science ' +
    'Score=wisdom,-4 ' +
    'Cost=7,4/rd ' +
    'Description="Self sees known location"',
  'Object Reading':
    'Discipline=Clairsentience ' +
    'Type=Science ' +
    'Score=wisdom,-5 ' +
    'Preparation=1 ' +
    'Cost=16 ' +
    'Description="Self learns info about target object\'s prior owner"',
  'Precognition':
    'Discipline=Clairsentience ' +
    'Type=Science ' +
    'Score=wisdom,-5 ' +
    'Preparation=5 ' +
    'Cost=24 ' +
    'Description="Self learns outcome of action over the next few hours"',
  'Sensitivity To Psychic Impressions':
    'Discipline=Clairsentience ' +
    'Type=Science ' +
    'Score=wisdom,-4 ' +
    'Preparation=2 ' +
    'Cost=12,2/rd ' +
    'Description="Self learns history of area"',
  'All-Round Vision':
    'Discipline=Clairsentience ' +
    'Type=Devotion ' +
    'Score=wisdom,-3 ' +
    'Cost=6,4/rd ' +
    'Description="Self gains 360-degree vision"',
  'Combat Mind':
    'Discipline=Clairsentience ' +
    'Type=Devotion ' +
    'Score=intelligence,-4 ' +
    'Cost=5,4/rd ' +
    'Description="Self gains -1 initiative"',
  'Danger Sense':
    'Discipline=Clairsentience ' +
    'Type=Devotion ' +
    'Score=wisdom,-3 ' +
    'Cost=4,3/tn ' +
    'Description="R10\' Self detects nearby hazard or threat"',
  'Feel Light':
    'Discipline=Clairsentience ' +
    'Type=Devotion ' +
    'Score=wisdom,-3 ' +
    'Cost=7,5/rd ' +
    'Description="Self sees via skin"',
  'Feel Sound':
    'Discipline=Clairsentience ' +
    'Type=Devotion ' +
    'Score=wisdom,-3 ' +
    'Cost=5,3/rd ' +
    'Description="Self hears via skin"',
  'Hear Light':
    'Discipline=Clairsentience ' +
    'Type=Devotion ' +
    'Score=wisdom,-3 ' +
    'Cost=6,3/rd ' +
    'Description="Self sees via ears"',
  'Know Direction':
    'Discipline=Clairsentience ' +
    'Type=Devotion ' +
    'Score=intelligence ' +
    'Cost=1 ' +
    'Description="Self determines north"',
  'Know Location':
    'Discipline=Clairsentience ' +
    'Type=Devotion ' +
    'Score=intelligence ' +
    'Preparation=5 ' +
    'Cost=10 ' +
    'Description="Self learns general location"',
  'Poison Sense':
    'Discipline=Clairsentience ' +
    'Type=Devotion ' +
    'Score=wisdom ' +
    'Preparation=5 ' +
    'Cost=1 ' +
    'Description="R1\' Self detects presence of poison"',
  'Radial Navigation':
    'Discipline=Clairsentience ' +
    'Type=Devotion ' +
    'Score=intelligence,-3 ' +
    'Cost=4,7/hr ' +
    'Description="Self knows distance and direction of starting point"',
  'See Sound':
    'Discipline=Clairsentience ' +
    'Type=Devotion ' +
    'Score=wisdom,-3 ' +
    'Cost=6,3/rd ' +
    'Description="Self hears via eyes"',
  'Spirit Sense':
    'Discipline=Clairsentience ' +
    'Type=Devotion ' +
    'Score=wisdom,-3 ' +
    'Cost=10 ' +
    'Description="R15\' Self detects presence of spirits"',
  'Create Object':
    'Discipline=Psychokinesis ' +
    'Type=Science ' +
    'Score=intelligence,-4 ' +
    'Cost=16,3/rd ' +
    'Description="R20\' Creates object up to 4\' diameter"',
  'Detonate':
    'Discipline=Psychokinesis ' +
    'Type=Science ' +
    'Score=constitution,-3 ' +
    'Cost=18 ' +
    'Description="R60\' 10\' radius inflicts 1d10 HP (Breath save half)"',
  'Disintegrate':
    'Discipline=Psychokinesis ' +
    'Type=Science ' +
    'Score=wisdom,-4 ' +
    'Cost=40 ' +
    'Description="R50\' Target obliterated (Death save neg)"',
  'Molecular Rearrangement':
    'Discipline=Psychokinesis ' +
    'Type=Science ' +
    'Score=intelligence,-5 ' +
    'Preparation="2 hr" ' +
    'Cost=20,10/hr ' +
    'Description="R2\' Converts 1 oz from one material to another"',
  'Project Force':
    'Discipline=Psychokinesis ' +
    'Type=Science ' +
    'Score=constitution,-2 ' +
    'Cost=10 ' +
    'Description="R200\' Remote punch inflicts 1d6+AC HP"',
  'Telekinesis':
    'Discipline=Psychokinesis ' +
    'Type=Science ' +
    'Score=wisdom,-3 ' +
    'Cost=3,1/rd ' +
    'Description="R30\' Target object moves 60\'/rd"',
  'Animate Object':
    'Discipline=Psychokinesis ' +
    'Type=Devotion ' +
    'Score=intelligence,-3 ' +
    'Cost=8,3/rd ' +
    'Description="Target up to 100 lb moves as if alive"',
  'Animate Shadow':
    'Discipline=Psychokinesis ' +
    'Type=Devotion ' +
    'Score=wisdom,-3 ' +
    'Cost=7,3/rd ' +
    'Description="R40\' Target shadow moves independently of source"',
  'Ballistic Attack':
    'Discipline=Psychokinesis ' +
    'Type=Devotion ' +
    'Score=constitution,-2 ' +
    'Cost=5 ' +
    'Description="R30\' 1 lb missile inflicts 1d6 HP"',
  'Control Body':
    'Discipline=Psychokinesis ' +
    'Type=Devotion ' +
    'Score=constitution,-2 ' +
    'Cost=8,8/rd ' +
    'Description="R80\' Self controls target\'s movements"',
  'Control Flames':
    'Discipline=Psychokinesis ' +
    'Type=Devotion ' +
    'Score=wisdom,-1 ' +
    'Cost=6,3/rd ' +
    'Description="R40\' Target 10\' sq flame doubles or halves size"',
  'Control Light':
    'Discipline=Psychokinesis ' +
    'Type=Devotion ' +
    'Score=intelligence ' +
    'Cost=12,4/rd ' +
    'Description="R25\' Target 400\' sq area brightens or dims"',
  'Control Sound':
    'Discipline=Psychokinesis ' +
    'Type=Devotion ' +
    'Score=intelligence,-5 ' +
    'Cost=5,2/rd ' +
    'Description="R100\' Modifies existing sounds"',
  'Control Wind':
    'Discipline=Psychokinesis ' +
    'Type=Devotion ' +
    'Score=constitution,-4 ' +
    'Preparation=2 ' +
    'Cost=16,10/rd ' +
    'Description=' +
      '"R500\' Changes speed and direction of wind, up to 10 MPH and degrees"',
  'Create Sound':
    'Discipline=Psychokinesis ' +
    'Type=Devotion ' +
    'Score=intelligence,-7 ' +
    'Cost=8,3/rd ' +
    'Description="R100\' Creates sound up to group shouting"',
  'Inertial Barrier':
    'Discipline=Psychokinesis ' +
    'Type=Devotion ' +
    'Score=constitution,-3 ' +
    'Cost=7,5/rd ' +
    'Description=' +
      '"R3\' Barrier reduces damage from missiles, flames, breath, and gas"',
  'Levitation':
    'Discipline=Psychokinesis ' +
    'Type=Devotion ' +
    'Score=wisdom,-3 ' +
    'Cost=12,2/rd ' +
    'Description="Self ascend or descend up to 60\'/rd"',
  'Molecular Agitation':
    'Discipline=Psychokinesis ' +
    'Type=Devotion ' +
    'Score=wisdom ' +
    'Cost=7,6/rd ' +
    'Description="R40\' Heats targets"',
  'Molecular Manipulation':
    'Discipline=Psychokinesis ' +
    'Type=Devotion ' +
    'Score=intelligence,-3 ' +
    'Preparation=1 ' +
    'Cost=6,5/rd ' +
    'Description="R15\' Creates weak spot in target"',
  'Soften':
    'Discipline=Psychokinesis ' +
    'Type=Devotion ' +
    'Score=intelligence ' +
    'Cost=4,3/rd ' +
    'Description="R30\' Target object softens"',
  'Animal Affinity':
    'Discipline=Psychometabolism ' +
    'Type=Science ' +
    'Score=constitution,-4 ' +
    'Cost=15,4/rd ' +
    'Description="Self gains one attribute of affinity animal"',
  'Complete Healing':
    'Discipline=Psychometabolism ' +
    'Type=Science ' +
    'Score=constitution ' +
    'Preparation="1 dy" ' +
    'Cost=30 ' +
    'Description="Self healed of all ailments, wounds, and normal disease"',
  'Death Field':
    'Discipline=Psychometabolism ' +
    'Type=Science ' +
    'Score=constitution,-8 ' +
    'Preparation=3 ' +
    'Cost=40 ' +
    'Description=' +
      '"R20\' All in range lose specified number of HP (Death save neg)"',
  'Energy Containment':
    'Discipline=Psychometabolism ' +
    'Type=Science ' +
    'Score=constitution,-2 ' +
    'Cost=10 ' +
    'Description="Specified energy type attacks on self reflected as light"',
  'Life Draining':
    'Discipline=Psychometabolism ' +
    'Type=Science ' +
    'Score=constitution,-3 ' +
    'Cost=11,5/rd ' +
    'Description=' +
      '"Transfers HP from touched to self, raising self HP up to %{hitPoints+10}"',
  'Metamorphosis':
    'Discipline=Psychometabolism ' +
    'Type=Science ' +
    'Score=constitution,-6 ' +
    'Preparation=5 ' +
    'Cost=21,1/tn ' +
    'Description="Self transforms into object of approximately same mass"',
  'Shadow-form':
    'Discipline=Psychometabolism ' +
    'Type=Science ' +
    'Score=constitution,-6 ' +
    'Cost=12,3/rd ' +
    'Description="Self transforms into shadow"',
  'Absorb Disease':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-3 ' +
    'Cost=12 ' +
    'Description="Transfers disease from touched to self"',
  'Adrenalin Control':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-3 ' +
    'Cost=8,4/rd ' +
    'Description="Self gains 1d6 Strength, Dexterity, or Constitution"',
  'Aging':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-7 ' +
    'Cost=15 ' +
    'Description="Touched ages 1d4+1 yr (Polymorph save 1d4 yr)"',
  'Biofeedback':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-2 ' +
    'Cost=6,3/rd ' +
    'Description=' +
      '"Self gains -1 AC, damage from attacks on self reduced by 2 HP"',
  'Body Control':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-4 ' +
    'Cost=7,5/tn ' +
    'Description="Self becomes comfortable in extreme environment"',
  'Body Equilibrium':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-3 ' +
    'Cost=2,2/rd ' +
    'Description=' +
      '"Self can walk on water or fragile surfaces, takes no damage from falling"',
  'Body Weaponry':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-3 ' +
    'Cost=9,4/rd ' +
    'Description="Self arm becomes chosen weapon"',
  'Catfall':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=dexterity,-2 ' +
    'Cost=4 ' +
    'Description=' +
      '"Self drops 30\' w/out damage; takes half damage from longer fall"',
  'Cause Decay':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-2 ' +
    'Cost=4 ' +
    'Description="Touched object decays or rusts"',
  'Cell Adjustment':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-3 ' +
    'Cost=5,20/rd ' +
    'Description="Cures touched of disease"',
  'Chameleon Power':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-1 ' +
    'Cost=6,3/rd ' +
    'Description="Self skin and clothes blend into background"',
  'Chemical Simulation':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-4 ' +
    'Preparation=1 ' +
    'Cost=9,6/rd ' +
    'Description="Self touch causes acid effects"',
  'Displacement':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-3 ' +
    'Cost=6,3/rd ' +
    'Description="Self gains -2 AC"',
  'Double Pain':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-3 ' +
    'Cost=7 ' +
    'Description="Touched takes double damage for 1 tn"',
  'Ectoplasmic Form':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-4 ' +
    'Preparation=1 ' +
    'Cost=9,9/rd ' +
    'Description="Self becomes insubstantial"',
  'Enhanced Strength':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=wisdom,-3 ' +
    'Cost=2,1/rd ' +
    'Description="Self strength increases"',
  'Expansion':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-2 ' +
    'Cost=6,1/rd ' +
    'Description="Self dimension increased 50%-400%"',
  'Flesh Armor':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-3 ' +
    'Cost=8,4/rd ' +
    'Description="Self skin becomes armor"',
  'Graft Weapon':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-5 ' +
    'Cost=10,1/rd ' +
    'Description="Self weapon gains +1 attack and damage"',
  'Heightened Senses':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution ' +
    'Cost=5,1/rd ' +
    'Description=' +
      '"Self gains increased notice, tracking, hearing, poison detection, and touch identification"',
  'Immovability':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-5 ' +
    'Cost=9,6/rd ' +
    'Description=' +
      '"Self moved only by combined strength of %{(constitution-5)*10}"',
  'Lend Health':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-1 ' +
    'Cost=4 ' +
    'Description="Transfers HP from self to touched"',
  'Mind Over Body':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=wisdom,-3 ' +
    'Cost=0,10/dy ' +
    'Description="Self needs no food, water, or sleep"',
  'Reduction':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-2 ' +
    'Cost=1,1/rd ' +
    'Description="Reduces self dimension down to 1\'"',
  'Share Strength':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-4 ' +
    'Cost=6,2/rd ' +
    'Description="Transfers strength from self to touched"',
  'Suspend Animation':
    'Discipline=Psychometabolism ' +
    'Type=Devotion ' +
    'Score=constitution,-3 ' +
    'Preparation=5 ' +
    'Cost=12 ' +
    'Description="Self appears dead"',
  'Banishment':
    'Discipline=Psychoportation ' +
    'Type=Science ' +
    'Score=intelligence,-1 ' +
    'Cost=30,10/rd ' +
    'Description="R5\' Target banished to pocket dimension"',
  'Probability Travel':
    'Discipline=Psychoportation ' +
    'Type=Science ' +
    'Score=intelligence ' +
    'Preparation=2 ' +
    'Cost=20,8/hr ' +
    'Description="Self travel astral plane"',
  'Summon Planar Creature':
    'Discipline=Psychoportation ' +
    'Type=Science ' +
    'Score=intelligence,-4 ' +
    'Preparation=12 ' +
    'Cost=45/90 ' +
    'Description="R200\' Brings and controls creature from another plane"',
  'Teleport':
    'Discipline=Psychoportation ' +
    'Type=Science ' +
    'Score=intelligence ' +
    'Cost=10 ' +
    'Description="Transfer self to familiar location"',
  'Teleport Other':
    'Discipline=Psychoportation ' +
    'Type=Science ' +
    'Score=intelligence,-2 ' +
    'Cost=20 ' +
    'Description="R10\' Transfers target to familiar location"',
  'Astral Projection':
    'Discipline=Psychoportation ' +
    'Type=Devotion ' +
    'Score=intelligence ' +
    'Preparation=1 ' +
    'Cost=6,2/hr ' +
    'Description="Self astral copy travels astral plane"',
  'Dimensional Door':
    'Discipline=Psychoportation ' +
    'Type=Devotion ' +
    'Score=constitution,-1 ' +
    'Cost=4,2/rd ' +
    'Description="R50\' Creates portal that teleports passers"',
  'Dimension Walk':
    'Discipline=Psychoportation ' +
    'Type=Devotion ' +
    'Score=constitution,-2 ' +
    'Preparation=2 ' +
    'Cost=8,4/tn ' +
    'Description="Self travels quickly through parallel dimension"',
  'Dream Travel':
    'Discipline=Psychoportation ' +
    'Type=Devotion ' +
    'Score=wisdom,-4 ' +
    'Cost=1 ' +
    'Description="R500 miles Self and companions travel during sleep"',
  'Teleport Trigger':
    'Discipline=Psychoportation ' +
    'Type=Devotion ' +
    'Score=intelligence,1 ' +
    'Cost=0,2/hr ' +
    'Description="Trigger teleports self to safe location"',
  'Time Shift':
    'Discipline=Psychoportation ' +
    'Type=Devotion ' +
    'Score=intelligence ' +
    'Cost=16 ' +
    'Description="Self sees three rounds into the future"',
  'Time/Space Anchor':
    'Discipline=Psychoportation ' +
    'Type=Devotion ' +
    'Score=intelligence ' +
    'Cost=5,1/rd ' +
    'Description="Self cannot be involuntarily teleported"',
  'Domination':
    'Discipline=Telepathy ' +
    'Type=Science ' +
    'Score=wisdom,-4 ' +
    'Cost=6,6/rd ' +
    'Description="FILL"',
  'Ejection':
    'Discipline=Telepathy ' +
    'Type=Science ' +
    'Score=wisdom,-4 ' +
    'Preparation=1 ' +
    'Cost=6 ' +
    'Description="FILL"',
  'Fate Link':
    'Discipline=Telepathy ' +
    'Type=Science ' +
    'Score=constitution,-5 ' +
    'Cost=3,5/tn ' +
    'Description="FILL"',
  'Mass Domination':
    'Discipline=Telepathy ' +
    'Type=Science ' +
    'Score=wisdom,-6 ' +
    'Preparation=2 ' +
    'Cost=3,2/rd ' +
    'Description="FILL"',
  'Mindlink':
    'Discipline=Telepathy ' +
    'Type=Science ' +
    'Score=wisdom,-5 ' +
    'Cost=3,8/rd ' +
    'Description="FILL"',
  'Mindwipe':
    'Discipline=Telepathy ' +
    'Type=Science ' +
    'Score=intelligence,-6 ' +
    'Preparation=1 ' +
    'Cost=3,8/rd ' +
    'Description="FILL"',
  'Probe':
    'Discipline=Telepathy ' +
    'Type=Science ' +
    'Score=wisdom,-5 ' +
    'Cost=3,9/rd ' +
    'Description="FILL"',
  'Psychic Crush':
    'Discipline=Telepathy ' +
    'Type=Science ' +
    'Score=wisdom,-4 ' +
    'Cost=7 ' +
    'Description="FILL"',
  'Superior Invisibility':
    'Discipline=Telepathy ' +
    'Type=Science ' +
    'Score=intelligence,-5 ' +
    'Cost=3,5/rd ' +
    'Description="FILL"',
  'Switch Personality':
    'Discipline=Telepathy ' +
    'Type=Science ' +
    'Score=constitution,-4 ' +
    'Preparation=3 ' +
    'Cost=33 ' +
    'Description="FILL"',
  'Tower Of Iron Will':
    'Discipline=Telepathy ' +
    'Type=Defense ' +
    'Score=wisdom,-2 ' +
    'Cost=6 ' +
    'Description="FILL"',
  'Attraction':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom,-4 ' +
    'Cost=3,8/rd ' +
    'Description="FILL"',
  'Aversion':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom,-4 ' +
    'Cost=3,8/tn ' +
    'Description="FILL"',
  'Awe':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=charisma,-2 ' +
    'Cost=3,4/rd ' +
    'Description="FILL"',
  'Conceal Thoughts':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom ' +
    'Cost=5,3/rd ' +
    'Description="FILL"',
  'Contact':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom ' +
    'Cost=3,1/rd ' +
    'Description="FILL"',
  'Daydream':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom ' +
    'Cost=3,3/rd ' +
    'Description="FILL"',
  'Ego Whip':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom,-3 ' +
    'Cost=4 ' +
    'Description="FILL"',
  'Empathy':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom ' +
    'Cost=1,1/rd ' +
    'Description="FILL"',
  'ESP':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom,-4 ' +
    'Cost=3,6/rd ' +
    'Description="FILL"',
  'False Sensory Input':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=intelligence,-3 ' +
    'Cost=3,4/rd ' +
    'Description="FILL"',
  'Id Insinuation':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom,-4 ' +
    'Cost=5 ' +
    'Description="FILL"',
  'Identity Penetration':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom,-3 ' +
    'Cost=3,6/rd ' +
    'Description="FILL"',
  'Incarnation Awareness':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom,-4 ' +
    'Cost=3,13/rd ' +
    'Description="FILL"',
  'Inflict Pain':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=constitution,-4 ' +
    'Preparation=1 ' +
    'Cost=3,2/rd ' +
    'Description="FILL"',
  'Intellect Fortress':
    'Discipline=Telepathy ' +
    'Type=Defense ' +
    'Score=wisdom,-3 ' +
    'Cost=4 ' +
    'Description="FILL"',
  'Invincible Foes':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom,-3 ' +
    'Cost=3,5/rd ' +
    'Description="FILL"',
  'Invisibility':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=intelligence,-5 ' +
    'Cost=3,2/rd ' +
    'Description="FILL"',
  'Life Detection':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=intelligence,-2 ' +
    'Cost=3,3/rd ' +
    'Description="FILL"',
  'Mental Barrier':
    'Discipline=Telepathy ' +
    'Type=Defense ' +
    'Score=wisdom,-2 ' +
    'Cost=3 ' +
    'Description="FILL"',
  'Mind Bar':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=intelligence,-2 ' +
    'Cost=6,4/rd ' +
    'Description="FILL"',
  'Mind Blank':
    'Discipline=Telepathy ' +
    'Type=Defense ' +
    'Score=wisdom,-7 ' +
    'Cost=0,0 ' +
    'Description="FILL"',
  'Mind Thrust':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom,-2 ' +
    'Cost=2 ' +
    'Description="FILL"',
  'Phobia Amplification':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom,-2 ' +
    'Cost=3,4/rd ' +
    'Description="FILL"',
  'Psionic Blast':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom,-5 ' +
    'Cost=10 ' +
    'Description="FILL"',
  'Psychic Impersonation':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom ' +
    'Cost=10,3/hr ' +
    'Description="FILL"',
  'Psychic Messenger':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=constitution,-4 ' +
    'Preparation=2 ' +
    'Cost=4,3/rd ' +
    'Description="FILL"',
  'Repugnance':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom,-5 ' +
    'Cost=3,8/rd ' +
    'Description="FILL"',
  'Send Thoughts':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=intelligence,-1 ' +
    'Cost=3,2/rd ' +
    'Description="FILL"',
  'Sight Link':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=constitution,-3 ' +
    'Preparation=1 ' +
    'Cost=3,5/tn ' +
    'Description="FILL"',
  'Sound Link':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=constitution,-2 ' +
    'Preparation=1 ' +
    'Cost=3,4/tn ' +
    'Description="FILL"',
  'Synaptic Static':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=intelligence,-4 ' +
    'Cost=15,10/rd ' +
    'Description="FILL"',
  'Taste Link':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=constitution,-2 ' +
    'Preparation=1 ' +
    'Cost=3,4/tn ' +
    'Description="FILL"',
  'Telempathic Projection':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom,-2 ' +
    'Preparation=1 ' +
    'Cost=3,4/rd ' +
    'Description="FILL"',
  'Thought Shield':
    'Discipline=Telepathy ' +
    'Type=Defense ' +
    'Score=wisdom,-3 ' +
    'Cost=1 ' +
    'Description="FILL"',
  'Truthear':
    'Discipline=Telepathy ' +
    'Type=Devotion ' +
    'Score=wisdom ' +
    'Cost=4,2/rd ' +
    'Description="FILL"',
  'Appraise':
    'Discipline=Metapsionic ' +
    'Type=Science ' +
    'Score=intelligence,-4 ' +
    'Cost=14 ' +
    'Description="FILL"',
  'Aura Alteration':
    'Discipline=Metapsionic ' +
    'Type=Science ' +
    'Score=wisdom,-4 ' +
    'Preparation=5 ' +
    'Cost=10 ' +
    'Description="FILL"',
  'Empower':
    'Discipline=Metapsionic ' +
    'Type=Science ' +
    'Score=wisdom,-12 ' +
    'Cost=150 ' +
    'Description="FILL"',
  'Psychic Clone':
    'Discipline=Metapsionic ' +
    'Type=Science ' +
    'Score=wisdom,-8 ' +
    'Preparation=10 ' +
    'Cost=50,5/rd ' +
    'Description="FILL"',
  'Psychic Surgery':
    'Discipline=Metapsionic ' +
    'Type=Science ' +
    'Score=wisdom,-5 ' +
    'Preparation=10 ' +
    'Cost=3,10/tn ' +
    'Description="FILL"',
  'Split Personality':
    'Discipline=Metapsionic ' +
    'Type=Science ' +
    'Score=wisdom,-5 ' +
    'Preparation=1 ' +
    'Cost=40,6/rd ' +
    'Description="FILL"',
  'Ultrablast':
    'Discipline=Metapsionic ' +
    'Type=Science ' +
    'Score=wisdom,-10 ' +
    'Preparation=3 ' +
    'Cost=75 ' +
    'Description="FILL"',
  'Cannibalize':
    'Discipline=Metapsionic ' +
    'Type=Devotion ' +
    'Score=constitution ' +
    'Cost=0 ' +
    'Description="FILL"',
  'Convergence':
    'Discipline=Metapsionic ' +
    'Type=Devotion ' +
    'Score=wisdom ' +
    'Preparation=1 ' +
    'Cost=8 ' +
    'Description="FILL"',
  'Enhancement':
    'Discipline=Metapsionic ' +
    'Type=Devotion ' +
    'Score=wisdom,-3 ' +
    'Preparation=5 ' +
    'Cost=30,8/rd ' +
    'Description="FILL"',
  'Gird':
    'Discipline=Metapsionic ' +
    'Type=Devotion ' +
    'Score=intelligence,-3 ' +
    'Cost=0 ' +
    'Description="FILL"',
  'Intensify':
    'Discipline=Metapsionic ' +
    'Type=Devotion ' +
    'Score=varies,-3 ' +
    'Preparation=1 ' +
    'Cost=5,1/rd ' +
    'Description="FILL"',
  'Magnify':
    'Discipline=Metapsionic ' +
    'Type=Devotion ' +
    'Score=wisdom,-5 ' +
    'Preparation=5 ' +
    'Cost=25,1/rd ' +
    'Description="FILL"',
  'Martial Trance':
    'Discipline=Metapsionic ' +
    'Type=Devotion ' +
    'Score=wisdom,-3 ' +
    'Preparation=1 ' +
    'Cost=7 ' +
    'Description="FILL"',
  'Prolong':
    'Discipline=Metapsionic ' +
    'Type=Devotion ' +
    'Score=constitution,-4 ' +
    'Cost=5,2/rd ' +
    'Description="FILL"',
  'Psionic Inflation':
    'Discipline=Metapsionic ' +
    'Type=Devotion ' +
    'Score=wisdom,-5 ' +
    'Preparation=1 ' +
    'Cost=20,3/rd ' +
    'Description="FILL"',
  'Psionic Sense':
    'Discipline=Metapsionic ' +
    'Type=Devotion ' +
    'Score=wisdom,-3 ' +
    'Cost=4,1/rd ' +
    'Description="FILL"',
  'Psychic Drain':
    'Discipline=Metapsionic ' +
    'Type=Devotion ' +
    'Score=wisdom,-6 ' +
    'Cost=13 ' +
    'Description="FILL"',
  'Receptacle':
    'Discipline=Metapsionic ' +
    'Type=Devotion ' +
    'Score=wisdom,-5 ' +
    'Preparation=1 ' +
    'Cost=0 ' +
    'Description="FILL"',
  'Retrospection':
    'Discipline=Metapsionic ' +
    'Type=Devotion ' +
    'Score=wisdom,-4 ' +
    'Preparation=10 ' +
    'Cost=120 ' +
    'Description="FILL"',
  'Splice':
    'Discipline=Metapsionic ' +
    'Type=Devotion ' +
    'Score=intelligence,-2 ' +
    'Cost=5,1/rd ' +
    'Description="FILL"',
  'Stasis Field':
    'Discipline=Metapsionic ' +
    'Type=Devotion ' +
    'Score=constitution,-3 ' +
    'Preparation=3 ' +
    'Cost=20,20/rd ' +
    'Description="FILL"',
  'Wrench':
    'Discipline=Metapsionic ' +
    'Type=Devotion ' +
    'Score=wisdom,-4 ' +
    'Cost=15,8/rd ' +
    'Description="FILL"'
};
DarkSun2E.RACES = {
  'Dwarf':
    'Require=' +
      '"constitution >= 14","strength >= 10" ' +
    'Features=' +
      '"Dwarf Ability Adjustment",Focused,Infravision,"Resist Magic",' +
      '"Resist Poison" ' +
    'Languages=' +
      'Common,Dwarf',
  'Elf':
    'Require=' +
      '"constitution >= 8","dexterity >= 12","intelligence >= 8" ' +
    'Features=' +
      'Conditioned,"Elf Ability Adjustment","Elf Run",Infravision,' +
      '"Long Bow Precision","Long Sword Precision",Walker,' +
      '"Wilderness Stealth",Xenophobic ' +
    'Languages=' +
      'Common,Elf',
  'Half-Elf':
    'Require=' +
      '"dexterity >= 8" ' +
    'Features=' +
      '"Half-Elf Ability Adjustment",Infravision,3:Survivalist,5:Pet ' +
    'Languages=' +
      'Common,Elf',
  'Half-Giant':
    'Require=' +
      '"charisma <= 17","constitution >= 15","dexterity <= 15",' +
      '"intelligence <= 15","strength >= 17","wisdom <= 17" ' +
    'Features=' +
      'Brawny,"Half-Giant Ability Adjustment",Imitator,"Variable Alignment" ' +
    'Languages=' +
      'Common,Giant',
  'Halfling':
    'Require=' +
      '"dexterity >= 12","strength <= 18","wisdom >= 7" ' +
    'Features=' +
      'Carnivore,Clannish,"Deadly Aim","Halfling Ability Adjustment",' +
      '"Respect For Place","Resist Disease","Resist Magic","Resist Poison",' +
      'Stealthy ' +
    'Languages=' +
      'Common,Halfling',
  'Human':
    'Languages=' +
      'Common',
  'Mul':
    'Require=' +
      '"constitution >= 8","strength >= 10" ' +
    'Features=' +
      'Brawler,"Mul Ability Adjustment",Vigorous ' +
    'Languages=' +
      'Common,Dwarf',
  'Thri-kreen':
    'Require=' +
      '"charisma <= 17","dexterity >= 15","strength >= 8" ' +
    'Features=' +
      'Antennae,"Bite Attack",Carnivore,"Claw Attack",Exoskeleton,Hunter,' +
      'Protective,Sleepless,"Thri-kreen Ability Adjustment",' +
      '"Thri-kreen Immunities",3:Leaper,"5:Chatkcha Fighter",' +
      '"5:Paralyzing Bite","7:Dodge Missiles" ' +
    'Languages=' +
      'Common,Thri-kreen'
};
DarkSun2E.SCHOOLS =
  Object.assign({}, OldSchool.editedRules(OldSchool.SCHOOLS, 'School'));
DarkSun2E.SHIELDS =
  Object.assign({}, OldSchool.editedRules(OldSchool.SHIELDS, 'Shield'));
var skills2E = OldSchool.editedRules(OldSchool.SKILLS, 'Skill');
DarkSun2E.SKILLS_ADDED = {
  'Find Traps':skills2E['Find Traps'].replaceAll('Class=', 'Class=Bard,'),
  'Hide In Shadows':
    skills2E['Hide In Shadows'].replaceAll('Class=', 'Class=Bard,'),
  'Move Silently':skills2E['Move Silently'].replaceAll('Class=', 'Class=Bard,'),
  'Open Locks':skills2E['Open Locks'].replaceAll('Class=', 'Class=Bard,'),
  'Gem Cutting':
    skills2E['Gem Cutting'].replaceAll('Class=', 'Class=Psionicist,'),
  'Harness Subconscious':'Ability=wisdom Modifier=-1 Class=Psionicist',
  'Hypnosis':'Ability=charisma Modifier=-2 Class=Psionicist',
  'Rejuvenation':'Ability=wisdom Modifier=-1 Class=Psionicist',
  'Meditative Focus':'Ability=wisdom Modifier=1 Class=Psionicist',
  'Musical Instrument':
    skills2E['Musical Instrument'].replaceAll('Class=', 'Class=Psionicist,'),
  'Reading And Writing':
    skills2E['Reading And Writing'].replaceAll('Class=', 'Class=Psionicist,'),
  'Religion':skills2E['Religion'].replaceAll('Class=', 'Class=Psionicist,')
};
DarkSun2E.SKILLS = Object.assign({}, skills2E, DarkSun2E.SKILLS_ADDED);
DarkSun2E.SPELLS_PRIEST_SPHERES = {
  'Aerial Servant':'Air',
  'Air Walk':'Air',
  'Animate Rock':'Earth',
  'Astral Spell':'Air',
  'Call Lightning':'Air',
  'Chariot Of Sustarre':'Fire',
  "Control Temperature 10' Radius":'Air',
  'Control Weather':'Air',
  'Control Winds':'Air',
  'Create Food And Water':'Water',
  'Create Water':'Water',
  'Dust Devil':'Air',
  'Dust Devil':'Earth',
  'Earthquake':'Earth',
  'Endure Cold':'Fire',
  'Endure Heat':'Fire',
  'Faerie Fire':'Fire',
  'Fire Seeds':'Fire',
  'Fire Storm':'Fire',
  'Fire Trap':'Fire',
  'Flame Blade':'Fire',
  'Flame Strike':'Fire',
  'Flame Walk':'Fire',
  'Heat Metal':'Fire',
  'Insect Plague':'Air',
  'Lower Water':'Water',
  'Magic Font':'Water',
  'Magical Stone':'Earth',
  'Meld Into Stone':'Earth',
  'Part Water':'Water',
  'Plane Shift':'Air',
  'Produce Fire':'Fire',
  'Produce Flame':'Fire',
  'Protection From Fire':'Fire',
  'Protection From Lightning':'Air',
  'Purify Food And Drink':'Water',
  'Pyrotechnics':'Fire',
  'Reflecting Pool':'Water',
  'Resist Cold':'Fire',
  'Resist Fire':'Fire',
  'Spike Stones':'Earth',
  'Stone Shape':'Earth',
  'Transmute Metal To Wood':'Earth',
  'Transmute Water To Dust':'Earth',
  'Transmute Water To Dust':'Water',
  'Wall Of Fire':'Fire',
  'Water Breathing':'Water',
  'Water Walk':'Water',
  'Weather Summoning':'Air',
  'Wind Walk':'Air'
};
DarkSun2E.SPELLS =
  Object.assign({}, OldSchool.editedRules(OldSchool.SPELLS, 'Spell'));
delete DarkSun2E.SPELLS['Conjure Earth Elemental'];
delete DarkSun2E.SPELLS['Conjure Fire Elemental'];
DarkSun2E.WEAPONS_ADDED = {
  'Chatkcha':'Category=R Damage=d6+2 Range=90',
  'Gythka':'Category=2h Damage=2d4',
  'Impaler':'Category=2h Damage=d8',
  'Quabone':'Category=Li Damage=d4',
  'Wrist Razor':'Category=Li Damage=d6+1'
};
DarkSun2E.WEAPONS =
  Object.assign({}, OldSchool.editedRules(OldSchool.WEAPONS, 'Weapon'), DarkSun2E.WEAPONS_ADDED);
DarkSun2E.DEFILER_EXPERIENCE_THRESHOLD = [
  0, 1.75, 3.5, 7, 14, 28, 42, 63, 94.5, 180, 270, 540, 820, 1080, 1350, 1620,
  1890, 2160, 2430, 2700
];

/* Defines rules related to character abilities. */
DarkSun2E.abilityRules = function(rules) {
  OldSchool.abilityRules(rules);
  // No changes needed to the rules defined by OldSchool method
};

/* Defines rules related to combat. */
DarkSun2E.combatRules = function(rules, armors, shields, weapons) {
  OldSchool.combatRules(rules, armors, shields, weapons);
  // No changes needed to the rules defined by OldSchool method
};

/* Defines rules related to basic character identity. */
DarkSun2E.identityRules = function(rules, alignments, classes, races) {
  OldSchool.identityRules(rules, alignments, classes, races);
  // No changes needed to the rules defined by OldSchool method
  rules.defineRule('clericElement',
    'levels.Cleric', '?', null,
    'element', '=', null
  );
  rules.defineRule('defilerOrPreserver',
    'casterLevelArcane', '=', '"Preserver"',
    'features.Defiler', '=', '"Defiler"'
  );
  rules.defineRule('features.Defiler', 'defiler', '=', '1');
  rules.defineChoice('notes',
    'validationNotes.defilerAlignment:Requires alignment !~ \'Good\''
  );
  rules.defineRule('validationNotes.defilerAlignment',
    'features.Defiler', '?', null,
    'alignment', '=', 'source.includes("Good") ? 1 : null'
  );
};

/* Defines rules related to magic use. */
DarkSun2E.magicRules = function(rules, schools, spells, disciplines, powers) {
  QuilvynUtils.checkAttrTable(disciplines, []);
  QuilvynUtils.checkAttrTable
    (powers, ['Discipline', 'Type', 'Score', 'Preparation', 'Cost', 'Description']);
  OldSchool.magicRules(rules, schools, spells);
  for(var d in disciplines) {
    DarkSun2E.choiceRules(rules, 'Discipline', d, disciplines[d]);
  }
  for(var p in powers) {
    DarkSun2E.choiceRules(rules, 'Power', p, powers[p]);
  }
  QuilvynRules.validAllocationRules
    (rules, 'discipline', 'psionicDisciplineCount', 'Sum "^disciplines\\."');
  rules.defineRule
    ('features.Wild Talent', 'wildTalent', '=', 'source ? 1 : null');
  rules.defineRule('psionicStrengthPoints', 'magicNotes.wildTalent', '+=', null);
  rules.defineRule('magicNotes.wildTalent',
    'features.Wild Talent', '?', null,
    'level', '=', '4 * (source - 1)'
  );
  rules.defineRule
    ('psionicDisciplineCount', 'magicNotes.wildTalent', '+=', '1');
  rules.defineRule('psionicDevotionCount', 'magicNotes.wildTalent', '+=', '1');
};

/* Defines rules related to character aptitudes. */
DarkSun2E.talentRules = function(rules, features, goodies, languages, skills) {
  OldSchool.talentRules(rules, features, goodies, languages, skills);
  // No changes needed to the rules defined by OldSchool method
};

/*
 * Adds #name# as a possible user #type# choice and parses #attrs# to add rules
 * related to selecting that choice.
 */
DarkSun2E.choiceRules = function(rules, type, name, attrs) {
  if(type == 'Alignment')
    DarkSun2E.alignmentRules(rules, name);
  else if(type == 'Armor')
    DarkSun2E.armorRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'AC'),
      QuilvynUtils.getAttrValue(attrs, 'Move'),
      QuilvynUtils.getAttrValue(attrs, 'Weight'),
      QuilvynUtils.getAttrValue(attrs, 'Skill')
    );
  else if(type == 'Class') {
    DarkSun2E.classRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValueArray(attrs, 'Experience'),
      QuilvynUtils.getAttrValueArray(attrs, 'HitDie'),
      QuilvynUtils.getAttrValueArray(attrs, 'Attack'),
      QuilvynUtils.getAttrValueArray(attrs, 'Breath'),
      QuilvynUtils.getAttrValueArray(attrs, 'Death'),
      QuilvynUtils.getAttrValueArray(attrs, 'Petrification'),
      QuilvynUtils.getAttrValueArray(attrs, 'Spell'),
      QuilvynUtils.getAttrValueArray(attrs, 'Wand'),
      QuilvynUtils.getAttrValueArray(attrs, 'Features'),
      QuilvynUtils.getAttrValueArray(attrs, 'Selectables'),
      QuilvynUtils.getAttrValueArray(attrs, 'Languages'),
      QuilvynUtils.getAttrValueArray(attrs, 'WeaponProficiency'),
      QuilvynUtils.getAttrValueArray(attrs, 'NonweaponProficiency'),
      QuilvynUtils.getAttrValue(attrs, 'CasterLevelArcane'),
      QuilvynUtils.getAttrValue(attrs, 'CasterLevelDivine'),
      QuilvynUtils.getAttrValueArray(attrs, 'SpellSlots')
    );
    DarkSun2E.classRulesExtra(rules, name);
  } else if(type == 'Discipline')
    DarkSun2E.disciplineRules(rules, name);
  else if(type == 'Feature')
    DarkSun2E.featureRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Section'),
      QuilvynUtils.getAttrValueArray(attrs, 'Note')
    );
  else if(type == 'Goody')
    DarkSun2E.goodyRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Pattern'),
      QuilvynUtils.getAttrValue(attrs, 'Effect'),
      QuilvynUtils.getAttrValue(attrs, 'Value'),
      QuilvynUtils.getAttrValueArray(attrs, 'Attribute'),
      QuilvynUtils.getAttrValueArray(attrs, 'Section'),
      QuilvynUtils.getAttrValueArray(attrs, 'Note')
    );
  else if(type == 'Language')
    DarkSun2E.languageRules(rules, name);
  else if(type == 'Power')
    DarkSun2E.powerRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Discipline'),
      QuilvynUtils.getAttrValue(attrs, 'Type'),
      QuilvynUtils.getAttrValueArray(attrs, 'Score'),
      QuilvynUtils.getAttrValue(attrs, 'Preparation'),
      QuilvynUtils.getAttrValueArray(attrs, 'Cost'),
      QuilvynUtils.getAttrValue(attrs, 'Description')
    );
  else if(type == 'Race') {
    DarkSun2E.raceRules(rules, name,
      QuilvynUtils.getAttrValueArray(attrs, 'Require'),
      QuilvynUtils.getAttrValueArray(attrs, 'Features'),
      QuilvynUtils.getAttrValueArray(attrs, 'Selectables'),
      QuilvynUtils.getAttrValueArray(attrs, 'Languages')
    );
    DarkSun2E.raceRulesExtra(rules, name);
  } else if(type == 'School')
    DarkSun2E.schoolRules(rules, name);
  else if(type == 'Shield')
    DarkSun2E.shieldRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'AC'),
      QuilvynUtils.getAttrValue(attrs, 'Weight')
    );
  else if(type == 'Skill') {
    DarkSun2E.skillRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Ability'),
      QuilvynUtils.getAttrValue(attrs, 'Modifier'),
      QuilvynUtils.getAttrValueArray(attrs, 'Class')
    );
    DarkSun2E.skillRulesExtra(rules, name);
  } else if(type == 'Spell') {
    var description = QuilvynUtils.getAttrValue(attrs, 'Description');
    var duration = QuilvynUtils.getAttrValue(attrs, 'Duration');
    var effect =  QuilvynUtils.getAttrValue(attrs, 'Effect');
    var groupLevels = QuilvynUtils.getAttrValueArray(attrs, 'Level');
    var range = QuilvynUtils.getAttrValue(attrs, 'Range');
    var school = QuilvynUtils.getAttrValue(attrs, 'School');
    var schoolAbbr = school.substring(0, 4);
    for(var i = 0; i < groupLevels.length; i++) {
      var matchInfo = groupLevels[i].match(/^(\D+)(\d+)$/);
      if(!matchInfo) {
        console.log('Bad level "' + groupLevels[i] + '" for spell ' + name);
        continue;
      }
      var group = matchInfo[1];
      var level = matchInfo[2] * 1;
      if(group == 'P')
        schoolAbbr = DarkSun2E.SPELLS_PRIEST_SPHERES[name] || 'Cosmos';
      var fullName = name + '(' + group + level + ' ' + schoolAbbr + ')';
      DarkSun2E.spellRules
        (rules, fullName, school, group, level, description, duration, effect,
         range);
      rules.addChoice('spells', fullName, attrs);
    }
  } else if(type == 'Weapon')
    DarkSun2E.weaponRules(rules, name,
      QuilvynUtils.getAttrValue(attrs, 'Category'),
      QuilvynUtils.getAttrValue(attrs, 'Damage'),
      QuilvynUtils.getAttrValue(attrs, 'Range')
    );
  else {
    console.log('Unknown choice type "' + type + '"');
    return;
  }
  if(type != 'Feature' && type != 'Spell') {
    type = type == 'Class' ? 'levels' :
    (type.substring(0,1).toLowerCase() + type.substring(1).replaceAll(' ', '') + 's');
    rules.addChoice(type, name, attrs);
  }
};

/* Defines in #rules# the rules associated with alignment #name#. */
DarkSun2E.alignmentRules = function(rules, name) {
  OldSchool.alignmentRules(rules, name);
  // No changes needed to the rules defined by OldSchool method
};

/*
 * Defines in #rules# the rules associated with armor #name#, which adds #ac#
 * to the character's armor class, imposes a maximum movement speed of
 * #maxMove#, weighs #weight# pounds, and modifies skills as specified in
 * #skill#.
 */
DarkSun2E.armorRules = function(rules, name, ac, maxMove, weight, skill) {
  OldSchool.armorRules(rules, name, ac, maxMove, weight, skill);
  // No changes needed to the rules defined by OldSchool method
};

/*
 * Defines in #rules# the rules associated with class #name#, which has the list
 * of hard prerequisites #requires#. #experience# lists the experience point
 * progression required to advance levels in the class. #hitDie# is a triplet
 * indicating the additional hit points granted with each level advance--the
 * first element (format [n]'d'n) specifies the number of side on each die,
 * the second the maximum number of hit dice for the class, and the third the
 * number of points added each level after the maximum hit dice are reached.
 * #hitDie# (format [n]'d'n) additional hit points with each level advance.
 * #attack# is a quadruplet indicating: the attack bonus for a level 1
 * character; the amount this increases as the character gains levels; the
 * number of levels between increases; any adjustment in this pattern at a
 * specific level. Similarly, #saveBreath#, #saveDeath#, #savePetrification#,
 * #saveSpell#, and #saveWand# are each triplets indicating: the saving throw
 * for a level 1 character; the amount this decreases as the character gains
 * levels; the number of levels between decreases. #features# and #selectables#
 * list the fixed and selectable features acquired as the character advances in
 * class level, and #languages# lists any automatic languages for the class.
 * #weaponProficiency# is a triplet indicating: the number of weapon
 * proficiencies for a level 1 character; the number of levels between
 * increments of weapon proficiencies; the penalty for using a non-proficient
 * weapon. #weaponProficiency# is a pair indicating the number of nonweapon
 * proficiencies for a level 1 character and the number of levels between
 * increments of nonweapon proficiencies. #casterLevelArcane# and
 * #casterLevelDivine#, if specified, give the Javascript expression for
 * determining the caster level for the class; these can incorporate a class
 * level attribute (e.g., 'levels.Cleric') or the character level attribute
 * 'level'. If the class grants spell slots, #spellSlots# lists the number of
 * spells per level per day granted.
 */
DarkSun2E.classRules = function(
  rules, name, requires, experience, hitDie, attack, saveBreath, saveDeath,
  savePetrification, saveSpell, saveWand, features, selectables, languages,
  weaponProficiency, nonweaponProficiency, casterLevelArcane,
  casterLevelDivine, spellSlots
) {
  OldSchool.classRules(
    rules, name, requires, experience, hitDie, attack, saveBreath, saveDeath,
    savePetrification, saveSpell, saveWand, features, selectables, languages,
    weaponProficiency, nonweaponProficiency, casterLevelArcane,
    casterLevelDivine, spellSlots
  );
  // No changes needed to the rules defined by OldSchool method
};

/*
 * Defines in #rules# the rules associated with class #name# that cannot be
 * derived directly from the abilities passed to classRules.
 */
DarkSun2E.classRulesExtra = function(rules, name) {
  var classLevel = 'levels.' + name;
  OldSchool.classRulesExtra(rules, name);
  if(name.match(/Magic User|Abjurer|Conjurer|Diviner|Enchanter|Illusionist|Invoker|Necromancer|Transmuter/)) {
    var note = 'abilityNotes.defiler' + name.replaceAll(' ', '');
    rules.defineRule('features.Defiler ' + name,
      classLevel, '?', null,
      'features.Defiler', '=', '1'
    );
    rules.defineRule(note,
      'experiencePoints.' + name, '=', 'DarkSun2E.DEFILER_EXPERIENCE_THRESHOLD.findIndex(item => item * 1000 > source)'
    );
    rules.defineRule(note + '.1',
      note, '=', 'DarkSun2E.DEFILER_EXPERIENCE_THRESHOLD[source] * 1000'
    );
    rules.defineRule(classLevel, note, '^', null);
    rules.defineRule('experiencePoints.' + name + '.1', note + '.1', '=', null);
  }
  if(name == 'Bard') {
    // Override values from OldSchool
    rules.defineRule('skillLevel.Find Traps', classLevel, '+=', null);
    rules.defineRule('skillLevel.Hide In Shadows', classLevel, '+=', null);
    rules.defineRule('skillLevel.Move Silently', classLevel, '+=', null);
    rules.defineRule('skillLevel.Open Locks', classLevel, '+=', null);
    rules.defineRule('skillModifier.Climb Walls', classLevel, '+=', '60');
    rules.defineRule('skillModifier.Find Traps', classLevel, '+=', '5');
    rules.defineRule('skillModifier.Hear Noise', classLevel, '+=', '15');
    rules.defineRule('skillModifier.Hide In Shadows', classLevel, '+=', '5');
    rules.defineRule('skillModifier.Move Silently', classLevel, '+=', '10');
    rules.defineRule('skillModifier.Open Locks', classLevel, '+=', '10');
    rules.defineRule('skillModifier.Pick Pockets', classLevel, '+=', '15');
    rules.defineRule('skillModifier.Read Languages', classLevel, '+=', '0');
    rules.defineRule('skillPoints', classLevel, '+=', '20 * (source - 1)');
  } else if(name == 'Cleric') {
    rules.defineRule('featureNotes.elementalIndifference',
      'element', '=', 'source.toLowerCase()'
    );
    rules.defineRule
      ('magicNotes.conjureElement', 'element', '=', 'source.toLowerCase()');
  } else if(name == 'Fighter') {
    rules.defineRule
      ('combatNotes.leader', classLevel, '+=', 'source>=10 ? source-9 : null');
  } else if(name == 'Gladiator') {
    rules.defineRule
      ('armorClass', 'combatNotes.optimizedArmor.1', '+', '-source');
    rules.defineRule('combatNotes.brawler', classLevel, '+=', '4');
    rules.defineRule('combatNotes.brawler.1', classLevel, '+=', '0');
    rules.defineRule
      ('combatNotes.leader', classLevel, '+=', 'source>=9 ? source-8 : null');
    rules.defineRule
      ('combatNotes.optimizedArmor', classLevel, '=', 'Math.floor(source / 5)');
    rules.defineRule('combatNotes.optimizedArmor.1',
      'armor', '?', 'source != "None"',
      'combatNotes.optimizedArmor', '=', null
    );
    rules.defineRule('warriorLevel', classLevel, '+', null);
    rules.defineRule
      ('validationNotes.weaponSpecialization', classLevel, '^', '0');
    // Noop to get note to appear in italics
    rules.defineRule
      ('weaponProficiencyCount', 'combatNotes.weaponsExpert', '+', '0');
    rules.defineRule('weaponNonProficiencyPenalty', classLevel, 'v', '0');
  } else if(name == 'Psionicist') {
    rules.defineRule('classPsionicistBreathSaveAdjustment',
      classLevel, '=', 'source>=21 ? -2 : source>=9 ? -1 : null'
    );
    rules.defineRule('classPsionicistSpellSaveAdjustment',
      classLevel, '=', 'source>=13 ? 2 : source>=5 ? 1 : null'
    );
    rules.defineRule('classPsionicistSpellSave',
      'classPsionicistSpellSaveAdjustment', '+', null
    );
    rules.defineRule
      ('psionicDisciplineCount', 'magicNotes.psionicPowers', '+=', null);
    rules.defineRule
      ('psionicScienceCount', 'magicNotes.psionicPowers.1', '+=', null);
    rules.defineRule
      ('psionicDevotionCount', 'magicNotes.psionicPowers.2', '+=', null);
    rules.defineRule
      ('psionicDefenseCount', 'magicNotes.psionicPowers.2', '+=', null);
    rules.defineRule('magicNotes.psionicPowers',
      classLevel, '+=', 'Math.floor((source + 6) / 4)'
    );
    rules.defineRule('magicNotes.psionicPowers.1',
      classLevel, '+=', 'Math.floor((source + 1) / 2)'
    );
    rules.defineRule('magicNotes.psionicPowers.2',
      classLevel, '+=', 'source>=4 ? source + 5 : (source * 2 + 1)'
    );
    rules.defineRule('magicNotes.psionicPowers.3',
      classLevel, '+=', 'Math.min(Math.floor((source + 1) / 2), 5)'
    );
    rules.defineRule('magicNotes.constitutionPsionicStrengthPointsBonus',
      classLevel, '?', null,
      'constitution', '=', 'source>=16 ? source - 15 : null'
    );
    rules.defineRule('magicNotes.intelligencePsionicStrengthPointsBonus',
      classLevel, '?', null,
      'intelligence', '=', 'source>=16 ? source - 15 : null'
    );
    rules.defineRule('magicNotes.wisdomPsionicStrengthPoints',
      classLevel, '?', null,
      'wisdom', '=', '20 + (source - 15) * 2',
      'levelPsionicStrengthPoints', '+', null
    );
    rules.defineRule('levelPsionicStrengthPoints',
      classLevel, '=', 'source - 1',
      'wisdom', '*', 'source - 5'
    );
    rules.defineRule('psionicStrengthPoints',
      'magicNotes.wisdomPsionicStrengthPoints', '=', null,
      'magicNotes.constitutionPsionicStrengthPointsBonus', '+', null,
      'magicNotes.intelligencePsionicStrengthPointsBonus', '+', null,
    );
  } else if(name == 'Templar') {
    rules.defineRule('featureNotes.enterBuilding',
      classLevel, '=',
        'source >= 5 ? "freehold, palace, or temple" : "freehold"'
    );
    rules.defineRule('featureNotes.makeAccusation',
      classLevel, '=', 'source >= 10 ? "freeman or noble" : "freeman"'
    );
    rules.defineRule('featureNotes.passJudgment',
      classLevel, '=',
        'source >= 15 ? "slave, freeman, or noble" : ' +
        'source >= 7 ? "slave or freeman" : "slave"'
    );
    rules.defineRule('turningLevel', classLevel, '+=', null);
    rules.defineRule('warriorLevel', classLevel, '+', null);
  } else if(name == 'Thief') {
    rules.defineRule('highDexSkillModifiers', 'dexterity', '=',
      'source==20 ? "+12% Find Traps/+17% Hide In Shadows/+20% Move Silently/+25% Open Locks/+20% Pick Pockets" : ' +
      'source==21 ? "+15% Find Traps/+20% Hide In Shadows/+25% Move Silently/+27% Open Locks/+25% Pick Pockets" : ' +
      'source==22 ? "+17% Find Traps/+22% Hide In Shadows/+30% Move Silently/+30% Open Locks/+27% Pick Pockets" : ' +
      'null'
    );
    rules.defineRule('skillNotes.dexteritySkillModifiers',
      'highDexSkillModifiers', '=', null
    );
  }
};

/* Defines in #rules# the rules associated with discipline #name#. */
DarkSun2E.disciplineRules = function(rules, name) {
  if(!name) {
    console.log('Empty discipline name');
    return;
  }
  // No rules pertain to discipline
};

/*
 * Defines in #rules# the rules associated with feature #name#. #sections# lists
 * the sections of the notes related to the feature and #notes# the note texts;
 * the two must have the same number of elements.
 */
DarkSun2E.featureRules = function(rules, name, sections, notes) {
  OldSchool.featureRules(rules, name, sections, notes);
  // No changes needed to the rules defined by OldSchool method
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
DarkSun2E.goodyRules = function(
  rules, name, pattern, effect, value, attributes, sections, notes
) {
  OldSchool.goodyRules
    (rules, name, pattern, effect, value, attributes, sections, notes);
  // No changes needed to the rules defined by OldSchool method
};

/* Defines in #rules# the rules associated with language #name#. */
DarkSun2E.languageRules = function(rules, name) {
  OldSchool.languageRules(rules, name);
  // No changes needed to the rules defined by OldSchool method
};

/*
 * Defines in #rules# the rules associated with psionic power #name# from
 * discipline #discipline#, which has type #type# ('Science', 'Devotion', or
 * 'Defense'), score #score# (either an ability name or a tuple consisting of
 * an ability name and a modifier), requires #preparation# time to prepare
 * (may be undefined if no prep required), cost #cost# (either a single value
 * or a two-value tuple with initial and maintenance costs). #description# is
 * a brief description of the power's effects.
 */
DarkSun2E.powerRules = function(
  rules, name, discipline, type, score, preparation, cost, description
) {
  if(!name) {
    console.log('Empty power name');
    return;
  }
  if(!((discipline + '') in rules.getChoices('disciplines'))) {
    console.log('Bad discipline "' + discipline + '" for power ' + name);
    return;
  }
  if(!(type + '').match(/^(Science|Devotion|Defense)$/i)) {
    console.log('Bad type "' + type + '" for power ' + name);
    return;
  }
  if(!Array.isArray(score) || score.length < 1 || score.length > 2) {
    console.log('Bad score "' + score + '" for power ' + name);
    return;
  } else if(!(score[0] in OldSchool.ABILITIES) && score[0] != 'varies') {
    console.log('Bad score "' + score + '" for power ' + name);
    return;
  } else if(score.length == 2 && typeof(score[1]) != 'number') {
    console.log('Bad score "' + score + '" for power ' + name);
    return;
  }
  if(!Array.isArray(cost) || cost.length < 1 || cost.length > 2) {
    console.log('Bad cost "' + cost + '" for power ' + name);
    return;
  }

  var testAndCost =
    score[0].substring(0, 3) +
    (score.length==1 ? '' : score[1]>=0 ? '+' + score[1] : score[1]) +
    ' (%{' + score[0] + (score.length>1 ? '+' + score[1] : '') + '})' + '; ' +
    cost[0] + (cost.length>1 ? '+' + cost[1] : '') + ' PSP';
  if(preparation)
    testAndCost += '; Prep ' + preparation;
  rules.defineChoice
    ('notes', 'powers.' + name + ':(' + testAndCost + ') ' + description);
  rules.defineRule('magicNotes.wildTalent',
    'powers.' + name, '+',
      cost[0] + (cost.length>1 ? (cost[1]+'').replace(/\/.*/, '') : 0) * 4
  );
};

/*
 * Defines in #rules# the rules associated with race #name#, which has the list
 * of hard prerequisites #requires#. #features# and #selectables# list
 * associated features and #languages# any automatic languages.
 */
DarkSun2E.raceRules = function(
  rules, name, requires, features, selectables, languages
) {
  OldSchool.raceRules(rules, name, requires, features, selectables, languages);
  // No changes needed to the rules defined by OldSchool method
};

/*
 * Defines in #rules# the rules associated with race #name# that cannot be
 * derived directly from the abilities passed to raceRules.
 */
DarkSun2E.raceRulesExtra = function(rules, name) {
  var raceLevel =
    name.charAt(0).toLowerCase() + name.substring(1).replaceAll(' ', '') + 'Level';
  if(name == 'Elf') {
    rules.defineRule('abilityNotes.elfRun.1',
      'dexterity', '=', 'source>=16 ? (source - 12) * 10 : source>=12 ? Math.floor((source - 10) / 2) * 10 : 0'
    );
    rules.defineRule('compoundLongBowAttackModifier',
      'combatNotes.longBowPrecision', '+', '1'
    );
    rules.defineRule
      ('longBowAttackModifier', 'combatNotes.longBowPrecision', '+', '1');
    rules.defineRule
      ('longSwordAttackModifier', 'combatNotes.longSwordPrecision', '+', '1');
  } else if(name == 'Half-Elf') {
    rules.defineRule
      ('nonweaponProficiencyCount', 'skillNotes.survivalist', '+=', '1');
    rules.defineRule('skills.Survival', 'skillNotes.survivalist', '^=', '1');
  } else if(name == 'Halfling') {
    rules.defineRule('saveNotes.resistDisease',
      'constitution', '=', 'Math.floor(source / 3.5)'
    );
  } else if(name == 'Mul') {
    rules.defineRule('combatNotes.brawler', raceLevel, '+=', '1');
    rules.defineRule('combatNotes.brawler.1', raceLevel, '+=', '5');
    rules.defineRule('featureNotes.vigorous.1',
      'features.Vigorous', '?', null,
      'constitution', '=', 'source * 24'
    );
    rules.defineRule('featureNotes.vigorous.2',
      'features.Vigorous', '?', null,
      'constitution', '=', 'source + 48'
    );
    rules.defineRule('featureNotes.vigorous.3',
      'features.Vigorous', '?', null,
      'constitution', '=', 'source + 36'
    );
    rules.defineRule('featureNotes.vigorous.4',
      'features.Vigorous', '?', null,
      'constitution', '=', 'source + 24'
    );
    rules.defineRule('skillNotes.raceSkillModifiers',
      raceLevel, '=',
        '"+5% Climb Walls/-5% Open Locks/+5% Move Silently/-5% Read Languages"'
      );
  } else if(name == 'Thri-kreen') {
    DarkSun2E.weaponRules(rules, 'Bite', 'Un', 'd4+1', null);
    DarkSun2E.weaponRules(rules, 'Claws', 'Un', 'd4', null);
    rules.defineRule('weaponProficiencyCount',
      raceLevel, '+', '2',
      'combatNotes.chatkchaFighter', '+', '1'
    );
    rules.defineRule('weaponProficiency.Bite', raceLevel, '=', '1');
    rules.defineRule('weaponProficiency.Claws', raceLevel, '=', '1');
    rules.defineRule
      ('weaponProficiency.Chatkcha', 'combatNotes.chatkchaFighter', '=', '1');
    rules.defineRule('weapons.Bite', raceLevel, '=', '1');
    rules.defineRule('weapons.Claws', raceLevel, '=', '1');
  }
};

/* Defines in #rules# the rules associated with magic school #name#. */
DarkSun2E.schoolRules = function(rules, name) {
  OldSchool.schoolRules(rules, name);
  // No changes needed to the rules defined by OldSchool method
};

/*
 * Defines in #rules# the rules associated with shield #name#, which adds #ac#
 * to the character's armor class and weight #weight# pounds
 */
DarkSun2E.shieldRules = function(rules, name, ac, weight) {
  OldSchool.shieldRules(rules, name, ac, weight);
  // No changes needed to the rules defined by OldSchool method
};

/*
 * Defines in #rules# the rules associated with skill #name#, associated with
 * basic ability #ability# plus #modifier#. #classes# lists the classes for
 * which this is a class skill; a value of "all" indicates that this is a class
 * skill for all classes.
 */
DarkSun2E.skillRules = function(rules, name, ability, modifier, classes) {
  OldSchool.skillRules(rules, name, ability, modifier, classes);
  // No changes needed to the rules defined by OldSchool method
};

/*
 * Defines in #rules# the rules associated with skill #name# that cannot be
 * derived directly from the abilities passed to skillRules.
 */
DarkSun2E.skillRulesExtra = function(rules, name) {
  OldSchool.skillRulesExtra(rules, name);
  // No changes needed to the rules defined by OldSchool method
};

/*
 * Defines in #rules# the rules associated with spell #name#, which is from
 * magic school #school#. #casterGroup# and #level# are used to compute any
 * saving throw value required by the spell. #description# is a verbose
 * description of the spell's effects.
 */
DarkSun2E.spellRules = function(
  rules, name, school, casterGroup, level, description, duration, effect, range
) {
  OldSchool.spellRules(
    rules, name, school, casterGroup, level, description, duration, effect,
    range
  );
  // No changes needed to the rules defined by OldSchool method
};

/*
 * Defines in #rules# the rules associated with weapon #name#, which belongs to
 * weapon category #category# (one of '1h', '2h', 'Li', 'R', 'Un' or their
 * spelled-out equivalents). The weapon does #damage# HP on a successful attack.
 * If specified, the weapon can be used as a ranged weapon with a range
 * increment of #range# feet.
 */
DarkSun2E.weaponRules = function(rules, name, category, damage, range) {
  OldSchool.weaponRules(rules, name, category, damage, range);
  // No changes needed to the rules defined by OldSchool method
};

/* Returns the elements in a basic OldSchool character editor. */
DarkSun2E.initialEditorElements = function() {
  var result = OldSchool.initialEditorElements();
  var abilityChoices = [
    5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
  ];
  for(var i = 0; i < result.length; i++) {
    if(result[i][0] in OldSchool.ABILITIES)
      result[i][3] = abilityChoices;
    else if(result[i][0] == 'weaponSpecialization')
      result[i][3] = ['None'].concat(QuilvynUtils.getKeys(DarkSun2E.WEAPONS));
  }
  var index = result.findIndex(x => x[0] == 'alignment');
  result.splice(index, 0, ['element', 'Element', 'select-one', ['Air', 'Earth', 'Fire', 'Water']]);
  result.splice(index, 0, ['defiler', '', 'checkbox', ['Defiler']]);
  return result;
};

/* Sets #attributes#'s #attribute# attribute to a random value. */
DarkSun2E.randomizeOneAttribute = function(attributes, attribute) {
  var attr;
  var attrs;
  var choices;
  var howMany;
  var i;
  if(attribute == 'abilities') {
    for(var a in OldSchool.ABILITIES)
      DarkSun2E.randomizeOneAttribute(attributes, a.toLowerCase());
  } else if(attribute in OldSchool.ABILITIES) {
    var rolls = [];
    for(i = 0; i < 6; i++)
      rolls.push(QuilvynUtils.random(1, 4));
    rolls.sort();
    attributes[attribute] =
      rolls[1] + rolls[2] + rolls[3] + rolls[4] + rolls[5];
  } else if(attribute == 'disciplines') {
    attrs = this.applyRules(attributes);
    howMany = attrs.psionicDisciplineCount || 0;
    choices = [];
    for(attr in this.getChoices('disciplines')) {
      if('disciplines.' + attr in attrs)
        howMany--;
      else
        choices.push(attr);
    }
    while(howMany > 0 && choices.length > 0) {
      i = QuilvynUtils.random(0, choices.length - 1);
      attributes['disciplines.' + choices[i]] = 1;
      choices.splice(i, 1);
      howMany--;
    }
  } else if(attribute == 'element') {
    attributes[attribute] =
      ['Air', 'Earth', 'Fire', 'Water'][QuilvynUtils.random(0, 3)];
  } else if(attribute == 'powers') {
    attrs = this.applyRules(attributes);
    var allowedDisciplines = {};
    for(attr in attrs) {
      if(attr.match(/^disciplines\./))
        allowedDisciplines[attr.replace('disciplines.', '')] = 1;
    }
    var allPowers = this.getChoices('powers');
    ['Science', 'Devotion', 'Defense'].forEach(type => {
      howMany = attrs['psionic' + type + 'Count'] || 0;
      choices = [];
      for(attr in allPowers) {
        if(!allPowers[attr].includes('Type=' + type))
          continue;
        var discipline =
          QuilvynUtils.getAttrValue(allPowers[attr], 'Discipline');
        if(type != 'Defense' && !(discipline in allowedDisciplines))
          continue;
        if('powers.' + attr in attrs)
          howMany--;
        else
          choices.push(attr);
      }
      while(howMany > 0 && choices.length > 0) {
        i = QuilvynUtils.random(0, choices.length - 1);
        attributes['powers.' + choices[i]] = 1;
        choices.splice(i, 1);
        howMany--;
      }
    });
  } else if(attribute == 'spells' &&
            ('levels.Cleric' in attributes ||
             'experiencePoints.Cleric' in attributes)) {
    attrs = this.applyRules(attributes);
    for(var level = 1; level < 8; level++) {
      attr = 'spellSlots.P' + level;
      if(!(attr in attrs))
        continue;
      howMany = attrs[attr];
      choices = [];
      for(var spell in this.getChoices('spells')) {
        if(!spell.includes('P' + level))
          continue;
        if('spells.' + spell in attrs)
          howMany--;
        else if(spell.includes('Cosmos') || spell.includes(attrs.element))
          choices.push(spell);
      }
      while(howMany > 0 && choices.length > 0) {
        i = QuilvynUtils.random(0, choices.length - 1);
        attributes['spells.' + choices[i]] = 1;
        choices.splice(i, 1);
        howMany--;
      }
    }
    // Call OSRIC in case of multiclass caster
    OSRIC.randomizeOneAttribute.apply(this, [attributes, attribute]);
  } else if(attribute == 'weapons' &&
            ('levels.Gladiator' in attributes ||
             'experiencePoints.Gladiator' in attributes)) {
    for(var weapon in this.getChoices('weapons')) {
      attributes['weaponProficiency.' + weapon] = 1;
    }
    OSRIC.randomizeOneAttribute.apply(this, [attributes, attribute]);
    for(weapon in this.getChoices('weapons')) {
      delete attributes['weaponProficiency.' + weapon];
    }
  } else {
    OSRIC.randomizeOneAttribute.apply(this, [attributes, attribute]);
  }
};

/* Returns an array of plugins upon which this one depends. */
DarkSun2E.getPlugins = function() {
  return [OldSchool].concat(OldSchool.getPlugins());
};

/* Returns HTML body content for user notes associated with this rule set. */
DarkSun2E.ruleNotes = function() {
  return '' +
    '<h2>Quilvyn Second Edition Dark Sun Rule Set Notes</h2>\n' +
    'Quilvyn Second Edition Rule Set Version ' + DarkSun2E.VERSION + '\n' +
    '<h3>Copyrights and Licensing</h3>\n' +
    '<p>\n' +
    'Quilvyn\'s Second Edition Dark Sun rule set is unofficial ' +
    'Fan Content permitted under Wizards of the Coast\'s ' +
    '<a href="https://company.wizards.com/en/legal/fancontentpolicy">Fan Content Policy</a>.\n' +
    '</p><p>\n' +
    'Quilvyn is not approved or endorsed by Wizards of the Coast. Portions ' +
    'of the materials used are property of Wizards of the Coast. ©Wizards of ' +
    'the Coast LLC.\n' +
    '</p><p>\n' +
    'Advanced Dungeons & Dragons Players Handbook © 2012 Wizards of the ' +
    'Coast LLC.\n' +
    '</p><p>\n' +
    'Advanced Dungeons & Dragons 2nd Edition Player\'s Handbook © 1989, ' +
    '1995, 2013 Wizards of the Coast LLC.\n' +
    '</p>\n';
};
