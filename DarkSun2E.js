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

  var rules = new QuilvynRules(DarkSun2E.EDITION, DarkSun2E.VERSION);

  rules.defineChoice('choices', OldSchool.CHOICES);
  rules.choiceEditorElements = OSRIC.choiceEditorElements;
  rules.choiceRules = DarkSun2E.choiceRules;
  rules.editorElements = DarkSun2E.initialEditorElements();
  rules.getFormats = OSRIC.getFormats;
  rules.getPlugins = DarkSun2E.getPlugins;
  rules.makeValid = OSRIC.makeValid;
  rules.randomizeOneAttribute = DarkSun2E.randomizeOneAttribute;
  rules.defineChoice('random', OldSchool.RANDOMIZABLE_ATTRIBUTES);
  rules.ruleNotes = DarkSun2E.ruleNotes;

  OSRIC.createViewers(rules, OSRIC.VIEWERS);
  rules.defineChoice('extras', 'feats', 'sanityNotes', 'validationNotes');
  rules.defineChoice
    ('preset', 'race:Race,select-one,races','levels:Class Levels,bag,levels');

  DarkSun2E.abilityRules(rules);
  DarkSun2E.combatRules
    (rules, OldSchool.editedRules(DarkSun2E.ARMORS, 'Armor'),
     OldSchool.editedRules(DarkSun2E.SHIELDS, 'Shield'),
     OldSchool.editedRules(DarkSun2E.WEAPONS, 'Weapon'));
  DarkSun2E.magicRules
    (rules, OldSchool.editedRules(DarkSun2E.SCHOOLS, 'School'),
     OldSchool.editedRules(DarkSun2E.SPELLS, 'Spell'));
  DarkSun2E.talentRules
    (rules, OldSchool.editedRules(DarkSun2E.FEATURES, 'Feature'),
     OldSchool.editedRules(DarkSun2E.GOODIES, 'Goody'),
     OldSchool.editedRules(DarkSun2E.LANGUAGES, 'Language'),
     OldSchool.editedRules(DarkSun2E.SKILLS, 'Skill'));
  DarkSun2E.identityRules(
    rules, OldSchool.editedRules(DarkSun2E.ALIGNMENTS, 'Alignment'),
    OldSchool.editedRules(DarkSun2E.CLASSES, 'Class'),
    OldSchool.editedRules(DarkSun2E.RACES, 'Race'));

  // Add additional elements to sheet
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

DarkSun2E.ALIGNMENTS = Object.assign({}, OldSchool.ALIGNMENTS);
DarkSun2E.ARMORS = {
  'None':
    'AC=0 Move=120 Weight=0 ' +
    'Skill="+10% Climb Walls/+5% Hide In Shadows/+10% Move Silently/+5% Pick Pockets"',
  'Banded Mail':'AC=6 Move=90 Weight=35',
  'Chain Mail':
    'AC=5 Move=90 Weight=30 ' +
    'Skill="-25% Climb Walls/-10% Find Traps/-10% Hear Noise/-15% Hide In Shadows/-15% Move Silently/-10% Open Locks/-25% Pick Pockets"',
  'Elven Chain Mail':
    'AC=5 Move=120 Weight=15 ' +
    'Skill="-20% Climb Walls/-5% Find Traps/-5% Hear Noise/-10% Hide In Shadows/-10% Move Silently/-5% Open Locks/-20% Pick Pockets"',
  'Leather':'AC=2 Move=120 Weight=15',
  'Padded':
    'AC=2 Move=90 Weight=10 ' +
    'Skill="-30% Climb Walls/-10% Find Traps/-10% Hear Noise/-20% Hide In Shadows/-20% Move Silently/-10% Open Locks/-30% Pick Pockets"',
  'Plate Mail':'AC=7 Move=60 Weight=45',
  'Ring Mail':'AC=3 Move=90 Weight=25',
  'Scale Mail':'AC=4 Move=60 Weight=40',
  'Splint Mail':'AC=6 Move=60 Weight=40',
  'Studded Leather':
    'AC=3 Move=90 Weight=20 ' +
    'Skill="-30% Climb Walls/-10% Find Traps/-10% Hear Noise/-20% Hide In Shadows/-20% Move Silently/-10% Open Locks/-30% Pick Pockets"'
};
DarkSun2E.CLASSES = {
  'Assassin':
    'Require=' +
      '"alignment =~ \'Evil\'","constitution >= 6","dexterity >= 12",' +
      '"intelligence >= 11","strength >= 12" ' +
    'HitDie=d6,15,1 Attack=-1,2,4,+1@9 WeaponProficiency=3,4,2 ' +
    'Breath=16,1,4 Death=13,1,4 Petrification=12,1,4 Spell=15,2,4 Wand=14,2,4 '+
    'Features=' +
      '"1:Armor Proficiency (Leather/Studded Leather)",' +
      '"1:Shield Proficiency (All)",' +
      '1:Assassination,1:Backstab,"1:Delayed Henchmen",1:Disguise,' +
      '"1:Poison Use","3:Thief Skills","4:Limited Henchmen Classes",' +
      '"intelligence >= 15 ? 9:Bonus Languages",' +
      '"12:Read Scrolls" ' +
    'Experience=0,1.5,3,6,12,25,50,100,200,300,425,575,750,1000,1500',
  'Bard':
    'Require=' +
      '"alignment =~ \'Neutral\'","charisma >= 15","constitution >= 10",' +
      '"dexterity >= 15","intelligence >= 12","strength >= 15",' +
      '"wisdom >= 15","levels.Fighter >= 5","levels.Thief >= 5",' +
      '"race =~ \'Human|Half-Elf\'" ' +
    'HitDie=d6,10,1 Attack=0,2,3,-1@19 WeaponProficiency=2,5,4 ' +
    'Breath=16,1,3 Death=10,1,3 Petrification=13,1,3 Spell=15,1,3 Wand=14,1,3 '+
    'Features=' +
      '"1:Armor Proficiency (Leather)",' +
      '"wisdom >= 13 ? 1:Bonus Druid Spells",' +
      '"1:Charming Music","1:Defensive Song","1:Poetic Inspiration",' +
      '"1:Resist Fire","1:Resist Lightning","2:Legend Lore",' +
      '"3:Druid\'s Knowledge","3:Wilderness Movement","3:Woodland Languages",' +
      '"4:Additional Languages","7:Immunity To Fey Charm",7:Shapeshift ' +
    'Experience=' +
      '0,2,4,8,16,25,40,60,85,110,150,200,400,600,800,1000,1200,1400,1600,' +
      '1800,2000,2200,3000 ' +
    'CasterLevelDivine=levels.Bard ' +
    'SpellAbility=wisdom ' +
    'SpellSlots=' +
      'D1:1=1;2=2;3=3;16=4;19=5,' +
      'D2:4=1;5=2;6=3;17=4;21=5,' +
      'D3:7=1;8=2;9=3;18=4;22=5,' +
      'D4:10=1;11=2;12=3;19=4;23=5,' +
      'D5:13=1;14=2;15=3;20=4;23=5',
  'Cleric':
    'Require=' +
      '"wisdom >= 9" ' +
    'HitDie=d8,9,2 Attack=0,2,3,-1@19 WeaponProficiency=2,4,3 ' +
    'Breath=16,1,3 Death=10,1,3 Petrification=13,1,3 Spell=15,1,3 Wand=14,1,3 '+
    'Features=' +
      '"1:Armor Proficiency (All)","1:Shield Proficiency (All)",' +
      '"1:Turn Undead",' +
      '"wisdom >= 16 ? 1:Bonus Cleric Experience",' +
      '"wisdom >= 13 ? 1:Bonus Cleric Spells",' +
      '"wisdom <= 12 ? 1:Cleric Spell Failure" ' +
    'Experience=' +
      '0,1.5,3,6,13,27.5,55,110,225,450,675,900,1125,1350,1575,1800,2025,' +
      '2250,2475,2700,2925,3150,3375,3600,3825,4050,4275,4500,4725 ' +
    'CasterLevelDivine=levels.Cleric ' +
    'SpellAbility=wisdom ' +
    'SpellSlots=' +
      'C1:1=1;2=2;4=3;9=4;11=5;12=6;15=7;17=8;19=9,' +
      'C2:3=1;4=2;5=3;9=4;12=5;13=6;15=7;17=8;19=9,' +
      'C3:5=1;6=2;8=3;11=4;12=5;13=6;15=7;17=8;19=9,' +
      'C4:7=1;8=2;10=3;13=4;14=5;16=6;18=7;20=8;21=9,' +
      'C5:9=1;10=2;14=3;15=4;16=5;18=6;20=7;21=8;22=9,' +
      'C6:11=1;12=2;16=3;18=4;20=5;21=6;23=7;24=8;26=9,' +
      'C7:16=1;19=2;22=3;25=4;27=5;28=6;29=7',
  'Druid':
    'Require=' +
      '"alignment =~ \'Neutral\'","charisma >= 15","wisdom >= 12" ' +
    'HitDie=d8,14,1 Attack=0,2,3,- WeaponProficiency=2,5,4 ' +
    'Breath=16,1,3 Death=10,1,3 Petrification=13,1,3 Spell=15,1,3 Wand=14,1,3 '+
    'Features=' +
      '"1:Armor Proficiency (Leather)","1:Shield Proficiency (All)",' +
      '"charisma >= 16/wisdom >= 16 ? 1:Bonus Druid Experience",' +
      '"wisdom >= 13 ? 1:Bonus Druid Spells",' +
      '"1:Resist Fire","1:Resist Lightning","3:Druid\'s Knowledge",' +
      '"3:Wilderness Movement","3:Woodland Languages",' +
      '"7:Immunity To Fey Charm",7:Shapeshift ' +
    'Experience=0,2,4,7.5,12.5,20,35,60,90,125,200,300,750,1500 ' +
    'CasterLevelDivine=levels.Druid ' +
    'SpellAbility=wisdom ' +
    'SpellSlots=' +
      'D1:1=2;3=3;4=4;9=5;13=6,' +
      'D2:2=1;3=2;5=3;7=4;11=5;14=6,' +
      'D3:3=1;4=2;7=3;12=4;13=5;14=6,' +
      'D4:6=1;8=2;10=3;12=4;13=5;14=6,' +
      'D5:9=1;10=2;12=3;13=4;14=5,' +
      'D6:11=1;12=2;13=3;14=4,' +
      'D7:12=1;13=2;14=3',
  'Fighter':
    'Require="constitution >= 7","strength >= 9" ' +
    'HitDie=d10,9,3 Attack=0,2,2,-2@19 WeaponProficiency=4,3,2 ' +
    'Breath=17,1.5,2 Death=14,1.5,2 Petrification=15,1.5,2 Spell=17,1.5,2 Wand=16,1.5,2 ' +
    'Features=' +
      '"1:Armor Proficiency (All)","1:Shield Proficiency (All)",' +
      '"strength >= 16 ? 1:Bonus Fighter Experience",' +
      '"1:Fighting The Unskilled" ' +
    'Experience=' +
      '0,2,4,8,18,25,70,125,250,500,750,1000,1250,1500,1750,2000,2250,2500,' +
      '2750,3000,3250,3500,3750,4000,4250,4500,4750,5000,5250',
  'Illusionist':
    'Require="dexterity >= 16","intelligence >= 15" ' +
    'HitDie=d4,10,1 Attack=-1,3,5,-1@6 WeaponProficiency=1,6,5 ' +
    'Breath=15,2,5 Death=14,1.5,5 Petrification=13,2,5 Spell=12,2,5 Wand=11,2,5 '+
    'Features=' +
      '"10:Eldritch Craft" ' +
    'CasterLevelArcane=levels.Illusionist ' +
    'Experience=' +
      '0,2.25,4.5,9,18,35,60,95,145,220,440,660,880,1100,1320,1540,1760,1980,' +
      '2200,2420,2640,2860,3080,3300,3520,3740,3960,4180,4400 ' +
    'SpellAbility=intelligence ' +
    'SpellSlots=' +
      'I1:1=1;2=2;4=3;5=4;9=5;24=6;26=7,' +
      'I2:3=1;4=2;6=3;10=4;12=5;24=6;26=7,' +
      'I3:5=1;7=2;9=3;12=4;16=5;24=6;26=7,' +
      'I4:8=1;9=2;11=3;15=4;17=5;24=6;26=7,' +
      'I5:10=1;11=2;16=3;19=4;21=5;25=6,' +
      'I6:12=1;13=2;18=3;21=4;22=5;25=6,' +
      'I7:14=1;15=2;20=3;22=4;23=5;25=6',
  'Magic User':
    'Require="dexterity >= 6","intelligence >= 9" ' +
    'HitDie=d4,11,1 Attack=-1,3,5,-1@6 WeaponProficiency=1,6,5 ' +
    'Breath=15,2,5 Death=14,1.5,5 Petrification=13,2,5 Spell=12,2,5 ' +
    'Wand=11,2,5 '+
    'Features=' +
      '"intelligence >= 16 ? 1:Bonus Magic User Experience",' +
      '"7:Eldritch Craft" ' +
    'Experience=' +
      '0,2.5,5,10,22.5,40,60,90,135,250,375,750,1125,1500,1875,2250,2625,' +
      '3000,3375,3750,4125,4500,4875,4250,4625,5000,5375,5750,6125 ' +
    'CasterLevelArcane="levels.Magic User" ' +
    'SpellAbility=intelligence ' +
    'SpellSlots=' +
      'M1:1=1;2=2;4=3;5=4;13=5;26=6;29=7,' +
      'M2:3=1;4=2;7=3;10=4;13=5;26=6;29=7,' +
      'M3:5=1;6=2;8=3;11=4;13=5;26=6;29=7,' +
      'M4:7=1;8=2;11=3;12=4;15=5;26=6;29=7,' +
      'M5:9=1;10=2;11=3;12=4;15=5;27=6,' +
      'M6:12=1;13=2;16=3;20=4;22=5;27=6,' +
      'M7:14=1;16=2;17=3;21=4;23=5;27=6,' +
      'M8:16=1;17=2;19=3;21=4;23=5;28=6,' +
      'M9:18=1;20=2;22=3;24=4;25=5;28=6',
  'Monk':
    'Require=' +
      '"alignment =~ \'Lawful\'","constitution >= 11","dexterity >= 15",' +
      '"strength >= 15","wisdom >= 15" ' +
    'HitDie=2d4,18,1 Attack=0,2,3,- WeaponProficiency=1,2,3 ' +
    'Breath=16,1,4 Death=13,1,4 Petrification=12,1,4 Spell=15,2,4 Wand=14,2,4 '+
    'Features=' +
      '"1:Delayed Henchmen","1:Dodge Missiles",1:Evasion,"1:Killing Blow",' +
      '"1:Monk Skills","1:Precise Blow",1:Spiritual,"1:Stunning Blow",' +
      '1:Unburdened,2:Aware,"3:Speak With Animals","4:Flurry Of Blows",' +
      '"4:Masked Mind","4:Slow Fall","5:Controlled Movement",' +
      '"5:Purity Of Body","6:Feign Death","6:Limited Henchmen Classes",' +
      '"7:Wholeness Of Body","8:Speak With Plants","9:Improved Evasion",' +
      '"9:Resist Influence","10:Mental Discipline","11:Diamond Body",' +
      '"12:Free Will","13:Quivering Palm" ' +
    'Experience=' +
      '0,2.25,4.75,10,22.5,47.5,98,200,350,500,700,950,1250,1750,2250,2750,' +
      '3250',
  'Paladin':
    'Require=' +
      '"alignment == \'Lawful Good\'","charisma >= 17","constitution >= 9",' +
      '"intelligence >= 9","strength >= 12","wisdom >= 13" ' +
    'HitDie=d10,9,3 Attack=0,2,2,-2@19 WeaponProficiency=3,3,2 ' +
    'Breath=17,1.5,2 Death=14,1.5,2 Petrification=15,1.5,2 Spell=17,1.5,2 ' +
    'Wand=16,1.5,2 ' +
    'Features=' +
      '"1:Armor Proficiency (All)","1:Shield Proficiency (All)",' +
      '"strength >= 16/wisdom >= 16 ? 1:Bonus Paladin Experience",' +
      '"1:Cure Disease","1:Detect Evil",1:Discriminating,"1:Divine Health",' +
      '"1:Divine Protection","1:Fighting The Unskilled","1:Lay On Hands",' +
      '1:Non-Materialist,1:Philanthropist,"1:Protection From Evil",' +
      '"3:Turn Undead","4:Summon Warhorse" ' +
    'Experience=' +
      '0,2.75,5.5,12,24,45,95,175,350,700,1050,1400,1750,2100,2450,2800,3150,' +
      '3500,3850,4200,4550,4900,5250,5600,5950,6300,6650,7000,7350 ' +
    'CasterLevelDivine="levels.Paladin >= 9 ? levels.Paladin - 8 : null" ' +
    'SpellAbility=wisdom ' +
    'SpellSlots=' +
      'C1:9=1;10=2;14=3;21=4,' +
      'C2:11=1;12=2;16=3;22=4,' +
      'C3:13=1;17=2;18=3;23=4,' +
      'C4:15=1;19=2;20=3;24=4',
  'Ranger':
    'Require=' +
      '"alignment =~ \'Good\'","constitution >= 14","dexterity >= 6",' +
      '"intelligence >= 13","strength >= 13","wisdom >= 14" ' +
    'HitDie=2d8,10,2 Attack=0,2,2,-2@19 WeaponProficiency=3,3,2 ' +
    'Breath=17,1.5,2 Death=14,1.5,2 Petrification=15,1.5,2 Spell=17,1.5,2 ' +
    'Wand=16,1.5,2 ' +
    'Features=' +
      '"1:Armor Proficiency (All)","1:Shield Proficiency (All)",' +
      '"strength >= 16/intelligence >= 16/wisdom >= 16 ? 1:Bonus Ranger Experience",' +
      '"1:Alert Against Surprise","1:Delayed Henchmen","1:Favored Enemy",' +
      '"1:Fighting The Unskilled",1:Loner,1:Selective,1:Tracking,' +
      '"1:Travel Light","10:Scrying Device Use" ' +
    'Experience=' +
      '0,2.25,4.5,10,20,40,90,150,225,325,650,975,1300,1625,2000,2325,2650,' +
      '2975,3300,3625,3950,4275,4600,4925,5250,5575,5900,6225,6550 ' +
    'CasterLevelArcane=' +
      '"levels.Ranger >= 8 ? Math.floor((levels.Ranger - 6) / 2) : null" ' +
    'CasterLevelDivine=' +
      '"levels.Ranger >= 9 ? Math.floor((levels.Ranger - 6) / 2) : null" ' +
      'SpellAbility=wisdom ' +
      'SpellSlots=' +
        'D1:8=1;10=2,' +
        'D2:12=1;14=2,' +
        'D3:16=1;17=2,' +
        'M1:9=1;11=2,' +
        'M2:12=1;14=2',
  'Thief':
    'Require=' +
      '"alignment =~ \'Neutral|Evil\'","dexterity >= 9" ' +
    'HitDie=d6,10,2 Attack=-1,2,4,+1@9 WeaponProficiency=2,4,3 ' +
    'Breath=16,1,4 Death=13,1,4 Petrification=12,1,4 Spell=15,2,4 Wand=14,2,4 '+
    'Features=' +
      '"1:Armor Proficiency (Leather/Studded Leather)",' +
      '"dexterity >= 16 ? 1:Bonus Thief Experience",' +
      '1:Backstab,"1:Thief Skills","10:Read Scrolls" ' +
    'Experience=' +
      '0,1.25,2.5,5,10,20,42.5,70,110,160,220,440,660,880,1100,1320,1540,' +
      '1760,1980,2200,2420,2640,2860,3080,3300,3520,3740,3960,4180'
};
DarkSun2E.FEATURES_ADDED = {

};
DarkSun2E.FEATURES =
  Object.assign({}, OSRIC.FEATURES, OldSchool.FEATURES_ADDED, DarkSun2E.FEATURES_ADDED);
DarkSun2E.GOODIES = Object.assign({}, OldSchool.GOODIES);
DarkSun2E.LANGUAGES = {
  'Common':''
};
DarkSun2E.RACES = {
  'Dwarf':
    'Require=' +
      '"charisma <= 16","constitution >= 12","dexterity <= 17",' +
      '"strength >= 8" ' +
    'Features=' +
      '"1:Detect Construction","1:Detect Sliding","1:Detect Slope",' +
      '"1:Detect Traps","1:Determine Depth","1:Dwarf Ability Adjustment",' +
      '"1:Dwarf Dodge","1:Dwarf Enmity",1:Infravision,"1:Resist Magic",' +
      '"1:Resist Poison" ' +
    'Languages=' +
      'Common,Dwarf,Gnome,Goblin,Kobold,Orc',
  'Elf':
    'Require=' +
      '"charisma >= 8","constitution >= 6","dexterity >= 7",' +
      '"intelligence >= 8" ' +
    'Features=' +
      '"1:Bow Precision","1:Detect Secret Doors","1:Elf Ability Adjustment",' +
      '1:Infravision,"1:Resist Charm","1:Resist Sleep",1:Stealthy,' +
      '"1:Sword Precision" ' +
    'Languages=' +
      'Common,Elf,Gnoll,Gnome,Goblin,Halfling,Hobgoblin,Orc',
  'Gnome':
    'Require=' +
      '"constitution >= 8","intelligence >= 7","strength >= 6" ' +
    'Features=' +
      '"1:Burrow Tongue","1:Detect Hazard","1:Detect Slope",' +
      '"1:Determine Depth","1:Determine Direction","1:Gnome Dodge",' +
      '"1:Gnome Enmity",1:Infravision,"1:Resist Magic" ' +
    'Languages=' +
      'Common,Dwarf,Gnome,Goblin,Halfling,Kobold',
  'Half-Elf':
    'Require=' +
      '"constitution >= 6","dexterity >= 6","intelligence >= 4" ' +
    'Features=' +
      '"1:Detect Secret Doors",1:Infravision,"1:Resist Charm",' +
      '"1:Resist Sleep" ' +
    'Languages=' +
      'Common,Elf,Gnoll,Gnome,Goblin,Halfling,Hobgoblin,Orc',
  'Half-Orc':
    'Require=' +
      '"charisma <= 12","constitution >= 13","dexterity <= 17",' +
      '"intelligence <= 17","strength >= 6","wisdom <= 14" ' +
    'Features=' +
      '"1:Half-Orc Ability Adjustment",1:Infravision ' +
    'Languages=' +
      'Common,Orc',
  'Halfling':
    'Require=' +
      '"constitution >= 10","dexterity >= 8","intelligence >= 6",' +
      '"strength >= 6","wisdom <= 17" ' +
    'Features=' +
      '"1:Detect Slope","1:Determine Direction",' +
      '"1:Halfling Ability Adjustment",1:Infravision,"1:Resist Magic",' +
      '"1:Resist Poison",1:Stealthy ' +
    'Languages=' +
      'Common,Dwarf,Elf,Gnome,Goblin,Halfling,Orc',
  'Human':
    'Languages=' +
      'Common'
};
DarkSun2E.SCHOOLS = Object.assign({}, OldSchool.SCHOOLS);
DarkSun2E.SHIELDS = Object.assign({}, OldSchool.SHIELDS);
DarkSun2E.SKILLS = Object.assign({}, OldSchool.SKILLS);
DarkSun2E.SPELLS = Object.assign({}, OldSchool.SPELLS);
DarkSun2E.WEAPONS = Object.assign({}, OldSchool.WEAPONS);

/* Defines rules related to character abilities. */
DarkSun2E.abilityRules = function(rules) {
  OldSchool.abilityRules(rules);
};

/* Defines rules related to combat. */
DarkSun2E.combatRules = function(rules, armors, shields, weapons) {
  OldSchool.combatRules(rules, armors, shields, weapons);
};

/* Defines rules related to basic character identity. */
DarkSun2E.identityRules = function(rules, alignments, classes, races) {
  OldSchool.identityRules(rules, alignments, classes, races);
};

/* Defines rules related to magic use. */
DarkSun2E.magicRules = function(rules, schools, spells) {
  OldSchool.magicRules(rules, schools, spells);
};

/* Defines rules related to character aptitudes. */
DarkSun2E.talentRules = function(rules, features, goodies, languages, skills) {
  OldSchool.talentRules(rules, features, goodies, languages, skills);
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
  } else if(type == 'Feature')
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
      var fullName = name + '(' + group + level + ' ' + schoolAbbr + ')';
      OldSchool.spellRules
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
  OldSchool.classRulesExtra(rules, name);
  // No changes needed to the rules defined by OldSchool method
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
  OldSchool.raceRulesExtra(rules, name);
  // No changes needed to the rules defined by OldSchool method
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
 * basic ability #ability#.  #classes# lists the classes for which this is a
 * class skill; a value of "all" indicates that this is a class skill for all
 * classes.
 */
DarkSun2E.skillRules = function(rules, name, ability, classes) {
  OldSchool.skillRules(rules, name, ability, classes);
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
  }
  return result;
};

/* Sets #attributes#'s #attribute# attribute to a random value. */
DarkSun2E.randomizeOneAttribute = function(attributes, attribute) {
  if(attribute == 'abilities') {
    for(var a in DarkSun2E.ABILITIES)
      DarkSun2E.randomizeOneAttribute(attributes, a.toLowerCase());
  } else if((attribute.charAt(0).toUpperCase + attribute.substring(1)) in DarkSun2E.ABILITIES) {
    var rolls = [];
    for(i = 0; i < 6; i++)
      rolls.push(QuilvynUtils.random(1, 4));
    rolls.sort();
    attributes[attribute] =
      rolls[1] + rolls[2] + rolls[3] + rolls[4] + rolls[5];
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
