# Vicboss - Peace Walker Save Editor

Vicboss (pronounced "vic" as in "victory" - boss) is a save editor for The PC version of Metal Gear Solid: Peace Walker. The editor currently allows you to edit Mother Base staff members, R&D (Weapons/Items/Mechs/Other), insignias, ZEKE, and track/edit codenames.

The name "Vicboss" comes from "Vic Boss", a nickname given to Big Boss in the story of Peace Walker.

## Quickstart

To use Vicboss, go to https://benlscore.github.io/vicboss/. Follow the instructions on the page and upload your save file to begin editing.

## Changelog

v1.4.0
- Added Codenames editor
    - Click the "Enable Editing" checkbox at the bottom of the codename tracker to access the editor
    - Edit individual weapon takedowns
    - Edit obtained codenames and codename ranks
- Added Insignia editor
    - View all 84 insignia names, descriptions and obtainment status
    - Edit obtained insignias
    - Feature to award every insignia
- Added ZEKE editor
    - View every obtained part, part health and whether the part is equipped
    - Add unobtained parts
    - Heal All Parts feature
    - View every obtained/unobtained AI Board
    - Personalized recommendation of which bosses to get which AI Boards from
    - Unlock All AI Boards feature
- Added staff portrait preview
- Altered a few things in Database, and added a Codename guide
- Improved the font

v1.3.0
- Added Mechs editor
    - View all Armored Vehicles, Tanks and Attack Choppers
    - View / edit every mech's LIFE
    - Add / remove mechs
- Added Other editor
    - View all Key Items, Bullets and Uniforms
    - Unlock all Key Items and Uniforms
    - Unlock all Bullets and edit stock level
- Added Advanced settings
    - Enable UNQ character editing
    - Enable OUTER OPS editing
    - Change profile name
- Fixed issue where I referred to the Transfarring mod as Transfarmer (a different Peace Walker mod)

v1.2.1
- Added Database, a collection of informational pages for Vicboss and Peace Walker
- Added Grenade Launcher kill counter
- Added descriptions for skills

v1.2.0
- Added R&D category
    - Set development status for weapons and items
    - Edit stock level for applicable weapons and items
    - Edit usage level for weapons
    - Instantly develop weapons and items that are currently in development
    - Buttons to unlock all weapons / items, set every stock level to max, and set every usage level to max
- Fixed bug where staff members that have been discharged still appear in the staff editor. This affected discharged staff members in save files that had not completed any missions between the staff member being discharged and the game being saved.
- Added metatags for the web version

v1.1.1
- Replaced bloated .ttf file with .woff2 file
- Added functionality where if you clear the name edit field, the name will revert to its saved value (in case of accidental changes)
- Improved responsivity
- Improved upload validation

v1.1.0
- Improved staff editor
    - Added buttons to automatically max out different stats
    - New ability sliders that display morale boosts and illness debuffs
    - Staff name is now editable
    - Tag, Portrait, Title and Quote are now editable
    - Statuses can now be cleared

## Compatibility

This save editor supports PC save files for the Metal Gear Solid: Master Collection Vol. 2 version of Metal Gear Solid: Peace Walker. It does not support save files from console releases of the Master Collection Vol. 2, nor does it support save files from the HD Collection on PS3 or Xbox 360 or the original PSP game.

Vicboss includes staff quotes/descriptions in English, however does not reflect how the quotes appear in-game when setting the language to something other than English. The same goes for other assets such as Location and Title.

## How to use

I highly recommend that you use the online version of Vicboss (https://benlscore.github.io/vicboss/). If you want to use the offline version, you can download the latest release from GitHub, or by downloading it from Nexus. If you use the offline version, the custom fonts may not load; this can be fixed by running Vicboss on a local server, e.g. a Python HTTP server.

To use the editor, you first need to find where your save files are located. Go to Peace Walker on Steam, then click Manage -> Browse Local Files. The file path should look something like:

> "SteamLibrary\steamapps\common\MGS_PW\mgspw_savedata_win\[your steam ID]\ww"

[your steam ID] will be a random-looking long number. The "ww" folder will contain all of your save games. There may also be a file named "EU_SYSTEM.DAT", however this can be ignored. Every save file will be named something like "STW000000xxxxxx", with the "x"s replaced by numbers and letters. If you have multiple save files and can't tell which one is which, have a look at the "Date modified" value of the file; it should match the date shown in the save file selection screen in-game.

Before you use the editor, it is very important that you make a backup of your save file folder. Save files could be accidentally deleted / overwritten, the editor could output an invalid save file, etc. Simply make a copy of the "ww" folder somewhere safe before uploading any files to the editor.

Once you've backed up the saves, open Vicboss. Upload your save file using the input in the top-left, and if everything goes correctly, the save editor container will appear. The tabs at the top of the save editor will allow you to edit different parts of your save file.

Once you have made all of the changes you want, go to the "Overview" tab and select "Export Save". You will be prompted to download your new save file; set the download location to the save folder "ww". Do not rename the file, or try and overwrite the old save file with the new one; if you rename the save file, it will not work.

Once the new save file has been downloaded into the save folder, check the save selection screen in-game. If you are already on the save selection screen (or the title screen), it will not appear at first; you can "refresh" the save selection screen by either restarting the game or loading a save file, then exiting out of it and returning to the title screen. You should then see your new save file.

If the save file is invalid for any reason, it will appear as "Corrupted Data". You shouldn't try and manually open the save file with a text or hex editor, as it is encrypted.

## Features

Vicboss can be accessed via the website (recommended), or downloaded for offline use.

The save editor is split into multiple categories:

### Overview

The overview category features most of what the save selection screen displays, including:

- Profile name
- Date when last saved
- Time when last saved
- Total play time
- Heroism
- Total camaraderie
- Total GMP
- Last mission completed

This category includes the "Export Save" button to download your edited save file. Once you have made all the changes you want, go to the Overview category and click the export button to download your new save.

### Staff

The staff category features a full staff editor, where details / values of almost every staff member can be altered.

Staff members that are currently dispatched on OUTER OPS in-game cannot be edited; this is due to stability reasons as staff members can change stats / become injured / even die while on OUTER OPS. Also, unique characters (Miller, Chico, Amanda etc.) cannot be edited; this is because unique characters (including Hideo, even though he is listed as a Normal staff member) have special game logic which means that they cannot be edited in the same way that other staff members can. Editing unique characters could also interfere with story progression, so they do not appear in the staff editor. However, if you would like to edit staff members who are in OUTER OPS or are unique, there are settings in Advanced that allow this.

The staff category has a sidebar on the left-hand side. The top part of the sidebar contains a search feature, where staff members can be filtered by the team in which they are currently located in, and by their name. The bottom part of the sidebar contains a list of staff members matching the critera of your search.

Clicking on a staff member will reveal their details. Each staff member's Name, LIFE, PSYCHE, GMP and Morale can be edited. LIFE and PSYCHE have a maximum value of 9999, GMP has a maximum of 99999, and Morale has a maximum of 999. Any values inputted above these limits will not be accepted by the editor, as the game caps out these values at the same limits.

Staff abilities can be altered. Each ability is labeled with its name and current grade, alongside a vertical slider and number input. The slider displays the base ability value, the boost gained from morale, and debuffs from illnesses. Combat ability cannot be directly changed; this is because combat ability is calculated using the staff member's individual Combat Abilities, which are also editable.

The staff category then displays more details about the staff member, which include:

- Gender
- Location
- Tag
- Portrait
- Title
- Statuses
- Quote (or Description)

Every detail can be edited, except for Gender and Location. This is because Location can easily be changed in-game (and implementation requires logic for ill / hostile soldiers), but Gender is not editable as Portrait and Quote have values exclusive to each gender. Statuses cannot be directly edited; instead a "Clear Statuses" button has been provided that, if the staff member has a value of Hostility / Wounded / Sick / PTSD above 0, all statuses are cleared and the staff member is moved to the Waiting Room.

Each combat ability is directly editable, similar to regular abilities. It is important to note that when editing regular / combat abilities, only the base values are being edited. The morale boost is calculated from the amount of morale that the soldier has. Also, if the staff member has an illness (Wounded / Sick / PTSD), they are given a debuff, which is also reflected in the ability sliders.

Finally, staff skills can be edited. There are four skill slots; although there is an order that natural soldiers are given skills (left to right, top to bottom), leaving gaps where there should be a skill does not seem to be an issue for the game. Hover over skills to see their in-game descriptions.

### R&D

The R&D category lets you edit information relating to your Mother Base's R&D department. R&D is split into the four categories that it appears as in-game: Weapons, Items, Mechs and Other.

Every weapon in the game is displayed, split into five ranks. Weapons can be filtered by category (Handguns, Shotguns, etc.) and each category includes a percentage amount of weapons developed. You can edit the development status of each, the usage level (choose from LVL 1, 2 or 3), and the Stock level (for weapons that have a stock level). Item editing is similar; you can edit the development status, and stock level of each. Some items can only have a stock level of 1, for example the Binoculars and the Surround Indicator. Since ranks are usually dependent on the previous rank, and can also be dependent on other weapons, the editor does not allow for weapons/items to be "undeveloped" if another rank depends on it, since this results in strange behaviour in-game. There are also buttons to make 100% completion easier; both weapons and items have a Develop All and Max Inventory Level feature, and Weapons has a Max Usage Level feature.

Every mech you have stored is displayed. You can add any type of mech, including Custom variants, within the 50-mech limit set by the game. You can edit each mech's LIFE value (measured from 1-100%) and remove any mech. Mechs that are currently deployed to OUTER OPS are displayed, however they cannot be edited (this is for stability reasons; to edit mechs deployed to OUTER OPS, change the settings in the Advanced category). Every item/material in the "Other" section of R&D can also be edited. You can set any Key Item (mostly Design Specs), Bullet type or Uniform to "unlocked". You can also edit the stock level of any bullet, from 0-9999.

### Codenames

Vicboss features a codename tracker (for viewing important information about obtaining different codenames), and a codename editor. The codename tracker shows you:

- How many lethal / non-lethal takedowns you have done
- Your most used weapon
- The codenames you are eligible for
- Each lethal and non-lethal takedown you've made for each weapon type
- How many missions you have completed solo or in CO-OPS, and how many more you have left
- What you need to do to get the next codename rank
- The codenames and codename ranks you have obtained
- What you need to do to get the four special codenames (FOX, HOUND, DOBERMAN, FOXHOUND)

The codename editor is at the bottom of this category, and must be accessed by clicking the "Enable Editing" checkbox. The editor allows you to change each individual takedown counter, and set the obtainment status of each individual codename. The editor is kept separate from the tracker for people who want to obtain codenames legitimately.

### Insignias

This category is straightforward; every insignia in the game, including its obtainment status, name, description and any additional notes are displayed. You can set any insignia to "Obtained", and there is a button which, when pressed, unlocks every insignia. Removing an insignia that you have already achieved does not lock you out of getting it again; simply meet the requirements of it again, then complete a mission. Unlocking insignias like this does not provide the usual Heroism boost that it does in-game, nor does "unobtaining" an insignia lower your Heroism.

### ZEKE

This category is dedicated to the obtained parts and AI Boards of Metal Gear ZEKE. For the same reasons that staff and mechs assigned to OUTER OPS cannot be edited, ZEKE also cannot be edited while assigned to an OUTER OPS team (unless Enable OUTER OPS Editing is enabled in Advanced settings). Every part, part health, and equip status can be viewed. Every part can be added, up to the maximum in-game amount (5 for Head Parts, 3 for every other part). There are also features to add every part to storage, and heal every part to 100% LIFE.

Every AI Board is displayed. Boards that have been obtained are highlighted, and boards that have not been obtained are left gray. Hovering over a specific board displays the bosses that can drop it. Above the list of boards, there is a button that unlocks every AI Board. The "Recommended Boss Fights" section provides a list of every AI Board that you should attempt to get from each AI Weapon. Each type of boss has an overlap between their normal Type II and Custom variants of the boards that they can drop. However, getting boards from the easier variants takes less time. The guide lists each mobility board for each boss, and highlights which boss you should farm for the easiest experience of getting a specific board. Below the guide is a list of every board that can be obtained from each boss.

### Advanced

This category contains some additional functionality / settings that do not fit anywhere else. These settings aren't intended for normal use, and using them could result in the game acting strange or the save file becoming corrupted, so use these settings with caution.

The first setting, when ticked, changes the "Last Saved" timestamp of the save file to the current date and time. This feature is included because editing a save file that is currently in the save folder, then downloading the new save file into the save folder, will result in the old and new save files looking identical to eachother. In my testing, the save selection screen seems to order save files by their system "date modified" instead of the save file's "Last saved" value, meaning that the newest file will always be displayed at the top. However, to avoid confusion, I have added the functionality to alter the timestamp so that edited save files appear as the most recent.

The second setting allows for staff members with the UNQ tag (Miller, Chico, Amanda, etc.), and Hideo, to be editable. The reason UNQ staff are not editable by default is because they have special game logic associated with them that makes editing some information impossible. For example, quotes for Unique characters and Hideo are set by the game, no matter what you set the quote as in the save file. Ticking this checbox allows you to edit these staff member's Abilities, LIFE, PSYCHE and GMP only.
Hideo is not a UNQ staff member, however has a lot of the weirdness that other UNQ staff have so is included in this list. UNQ staff are not affected by Morale, however Hideo is.
SNAKE can be edited, however this is hard to do. You'll first need to switch to SNAKE in Mission Prep, and select the weapons/items/camo you want. Then, save your game, go to Vicboss and enable unqiue staff editing in Advanced. SNAKE should then appear in the editor. HOWEVER, if you ever go back into Mission Prep, his stats are set back to default and any changes you made are reverted. So the next time you need to change your loadout, you'll need to edit SNAKE again. It's not perfect but it's the only way SNAKE can be edited using just the save file; you'll find it much easier to pick a staff member in the Combat Unit to edit.

"Enable OUTER OPS editing" allows for the details of staff / mechs currently in an OUTER OPS team, as well as ZEKE if it is currently in an OUTER OPS team, to be edited. This is not allowed by default as the save file protects these units, and this may interfere with missions that these units are currently deployed to.

Finally, the editor allows for you to change the name associated with your save file. The name can be from 1-15 characters, and accepts letters/numbers but only accepts certain symbols.

### Database

Database is a collection of informational pages, which holds information about Vicboss and guides for Peace Walker. This can be accessed at the top-left of the editor. It currently includes links to the Github + README and Nexus pages, and guides for beating mech fights, beating AI Weapon fights, getting the true ending / what to do in the postgame, and a guide for getting codenames.

## Safety and privacy

Vicboss does not use any kind of server or persistant storage; save files are processed locally in the browser. This remains true for both the website version and the offline version. Editing save files may cause data corruption or unexpected behaviour; always back up your saves before using the editor.

Cloudflare Web Analytics is used on the web version to get a rough estimate of the amount of users. Only web requests are tracked; your save data and other information do not get tracked.

## Limitations and upcoming features

- The Gold T-Shirt and Love Box outfits are special bonuses that are not stored in the save file but determined by the game's code, so are not available to edit in the Outfit editor.
- Heroism may be directly editable in a future version; this may not be the case for Camaraderie and GMP as they are cumulative values that can't be directly edited
- Vicboss does not currently support other languages, or support editing of Japanese save files

## Credits

The custom Peace Walker font was created by gleeson: https://gleeson.itch.io/peace-walker-font-pack

This codename guide was extremely helpful when developing the codename tracker: https://gamefaqs.gamespot.com/boards/960566-metal-gear-solid-peace-walker/56113639

The Peace Walker Field Guide is an amazing resource that a lot of Database is based on: https://mgspw.pages.dev/

This Reddit guide contains a table of every AI Board that can be dropped by each boss: https://www.reddit.com/r/metalgearsolid/comments/18ky8po/peace_walker_ai_memory_board_fight_list_tips/