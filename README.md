## Dark Sun plugin for the Quilvyn RPG character sheet generator

The quilvyn-darksun package bundles modules that extend Quilvyn to work with
the Dark Sun campaign setting, applying the rules of the
<a href="https://www.drivethrurpg.com/product/17169/Dark-Sun-Boxed-Set-2e">2nd edition boxed set</a> and the
<a href="https://athas.org/products/ds3/documents/109">adaptation to 3rd edition rules</a> from <a href="https://athas.org">athas.org</a>.

### Requirements

quilvyn-darksun relies on the core and SRD35 modules installed by the
quilvyn-core package and the OldSchool module installed by the
quilvyn-oldschool package.

### Installation

To use quilvyn-darksun, unbundle the release package into the plugins/
subdirectory within the Quilvyn installation directory, then append the
following lines to the file plugins/plugins.js:

    RULESETS['Dark Sun Campaign Setting using AD&D 2E rules'] = {
      url:'plugins/DarkSun2E.js',
      group:'Old School D&D',
      require:['OSRIC.js', 'OldSchool.js']
    };

    RULESETS['Dark Sun Campaign Setting using SRD v3.5 rules'] = {
      url:'plugins/DarkSun35.js',
      group:'v3.5',
      require:'SRD35.js'
    };

### Usage

Once the quilvyn-darksun package is installed as described above, start Quilvyn
and check the box next to "Dark Sun Setting using AD&D 2E rules" and/or "Dark
Sun Campaign Setting using D&D v3.5 rules" from the rule sets menu in the
initial window.
