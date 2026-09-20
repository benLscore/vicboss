# Vicboss - Peace Walker Save Editor

Vicboss is a save editor for The PC version of Metal Gear Solid: Peace Walker. The editor currently allows you to edit Mother Base staff members, and track codename progression.

The name "Vicboss" comes from "Vic Boss", a nickname given to Big Boss in the story of Peace Walker.

## Compatibility

This save editor supports PC save files for the Metal Gear Solid: Master Collection Vol. 2 version of Metal Gear Solid: Peace Walker. It does not support save files from console releases of the Master Collection Vol. 2, nor does it support save files from the HD Collection on PS3 or Xbox 360 or the original PSP game.

Vicboss includes staff quotes/descriptions in English, however these will be displayed differently when setting the language to something other than English.

## Features

Vicboss can be accessed via the website, or downloaded for offline use.

The save editor is split into three categories:

### Overview

The overview category features most of what the save selection screen displays, including:

- Profile name
- Date when last saved
- Time when last saved
- Total play time
- Heroism
- Total camaraderie
- GMP
- Last mission completed

This category includes the "Export Save" button to download your edited save file. It also includes a checkbox that, when ticked, changes the "Last Saved" timestamp of the save file to the current date and time. This feature is included because editing a save file that is currently in the save folder, then downloading the new save file into the save folder, will result in the old and new save files looking identical to eachother. In my testing, the save selection screen seems to order save files by their system "date modified" instead of the save file's "Last saved" value, however to avoid confusion, I have added the functionality to alter the timestamp so that edited save files appear as the most recent.

### Staff

The staff category features a full staff editor, where details / values of almost every staff member can be altered.

Staff members that are currently dispatched on OUTER OPS in-game cannot be edited; this is due to stability reasons as staff members can change stats / become injured / even die while on OUTER OPS. Also, unique characters (Miller, Chico, Amanda etc.) cannot be edited; this is because unique characters (including Hideo, even though he is listed as a Normal staff member) have special game logic which means that they cannot be edited in the same way that other staff members can. Editing unique characters could also interfere with story progression, so they do not appear in the staff editor.

The staff category has a sidebar on the left-hand side. The top part of the sidebar contains a search feature, where staff members can be filtered by the team in which they are currently located in, and by their name. The bottom part of the sidebar contains a list of staff members matching the critera of your search.

Clicking on a staff member will reveal their details. Each staff member's LIFE, PSYCHE, GMP and Morale can be edited. LIFE and PSYCHE have a maximum value of 9999, GMP has a maximum of 99999, and Morale has a maximum of 999. Any values inputted above these limits will not be accepted by the editor, as the game caps out these values at the same limits.

Staff abilities can be altered. Each ability is labeled with it's name and current grade, alongside a vertical slider and number input. Combat ability cannot be directly changed; this is because combat ability is calculated using the staff member's individual Combat Abilities, which are also editable.

The staff category then displays more details about the staff member, which include:

- Gender
- Location
- Tag
- Portrait ID
- Title
- Statuses
- Quote (or Description)

None of these values are directly editable. Each portrait / avatar for staff members has not been mapped yet, so representation of the staff portrait is done as a raw ID instead of a picture. 

Each combat ability is directly editable, similar to regular abilities. It is important to note that when editing regular / combat abilities, only the base values are being edited. In-game, abilities are boosted depending on how much morale a staff member has; a staff member who would only usually have an A rank ability could get bumped up to having an S rank in that ability. This is why the letter grade above each slider calculates the grade that ability would be after being boosted by morale, even if the amount it is being boosted by is not visible in the slider.

Finally, staff skills can be edited. There are four skill slots, each can be changed to any skill in the game.

### Codenames

The codenames category displays all the information you need for obtaining different codenames in the game. 

- How many lethal / non-lethal takedowns you have done
- Your most used weapon
- The codenames you are eligible for
- Each lethal and non-lethal takedown you've made for each weapon type
- How many missions you have completed solo or in CO-OPS, and how many more you have left
- What you need to do to get the next codename rank
- The codenames and codename ranks you have obtained
- What you need to do to get the four special codenames (FOX, HOUND, DOBERMAN, FOXHOUND)

## How to use

To use the editor, you first need to find where your save files are located. Go to Peace Walker on Steam, then click Manage -> Browse Local Files. The file path should look something like:

"SteamLibrary\steamapps\common\MGS_PW\mgspw_savedata_win\[your steam ID]\ww"

[your steam ID] will be a random-looking long number. The "\ww" folder will contain all of your save games. There will also be a file named "EU_SYSTEM.DAT", however this can be ignored. Every save file will be named something like "STW000000xxxxxx", with the "x"s replaced by numbers and letters. If you have multiple save files and can't tell which one is which, have a look at the "Date modified" value of the file; it should match the date shown in the save file selection screen in-game.

Before you use the editor, it is very important that you make a backup of your save file folder. Save files could be accidentally deleted / overwritten, the editor could output an invalid save file, etc. Simply make a copy of the "ww" folder somewhere safe before uploading any files to the editor.

Once you've backed up the saves, open Vicboss; you can do this online by going to the website, or by downloading the repository and opening "index.html". Upload your save file using the input in the top-left, and if everything goes correctly, the save editor container will appear and you will be able to view the overview, staff editor and codename tracker.

Once you have made all of the changes you want, go to the "Overview" tab and select "Export Save". You will be prompted to download your new save file; set the download location to the save folder "ww". Do not rename the file, or try and overwrite the old save file with the new one; if you rename the save file, it will not work.

Once the new save file has been downloaded into the save folder, check the save selection screen in-game. If you are already on the save selection screen (or the title), it will not appear at first; you can "refresh" the save selection screen by either restarting the game or loading a save file, then exiting out of it and returning to the title screen. You should then see your new save file.

If the save file is invalid for any reason, it will appear as "Corrupted Data". You shouldn't try and manually open the save file with a text or hex editor, as it is encrypted.

## Safety and privacy

Vicboss does not use any kind of server or persistant storage; save files are processed locally in the browser. This remains true for both the website version and the offline version. Editing save files may cause data corruption or unexpected behaviour; always back up your saves before using the editor.

## Limitations and upcoming features

- Unique characters (and Hideo) will not appear in the staff editor, as they use special game logic that makes editing them inconsistent
- Heroism may be directly editable in a future version; this may not be the case for Camaraderie and GMP as they are cumulative values that can't be directly edited
- The morale boosts for each ability may be viewable in a future version
- Staff details including portrait, title, statuses and description may be editable in a future version
- Functionality to max out the abilities of a staff member / max out the abilities of all staff members may be added in a future version
- More categories, including for viewing/editing weapons, items and insignias, are planned to be implemented in future versions

## Credits

The custom Peace Walker font was created by gleeson: https://gleeson.itch.io/peace-walker-font-pack

This codename guide verified essentially all of my testing, and was extremely helpful: https://gamefaqs.gamespot.com/boards/960566-metal-gear-solid-peace-walker/56113639