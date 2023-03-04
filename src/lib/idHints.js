export function getIdHints() {
	const commandNameRegex = /\[(.*?)\]/;
	const idRegex = /"\d+"/;

	let logs = `Mar 04 22:51:46 koala npm[94611]: 2023-03-04 22:51:46 - INFO  - ApplicationComma                                                                                                                                                             ndRegistry[botinfo] Successfully created chat input command "botinfo" with id "1                                                                                                                                                             081710608233283664". You should add the id to the "idHints" property of the regi                                                                                                                                                             ster method you used!
	Mar 04 22:51:46 koala npm[94611]: 2023-03-04 22:51:46 - INFO  - ApplicationComma                                                                                                                                                             ndRegistry[define] Successfully created chat input command "define" with id "108                                                                                                                                                             1710609428660235". You should add the id to the "idHints" property of the regist                                                                                                                                                             er method you used!
	Mar 04 22:51:47 koala npm[94611]: 2023-03-04 22:51:47 - INFO  - ApplicationComma                                                                                                                                                             ndRegistry[invite] Successfully created chat input command "invite" with id "108                                                                                                                                                             1710611043455126". You should add the id to the "idHints" property of the regist                                                                                                                                                             er method you used!
	Mar 04 22:51:47 koala npm[94611]: 2023-03-04 22:51:47 - INFO  - ApplicationComma                                                                                                                                                             ndRegistry[serverinfo] Successfully created chat input command "serverinfo" with                                                                                                                                                              id "1081710612498894968". You should add the id to the "idHints" property of th                                                                                                                                                             e register method you used!
	Mar 04 22:51:47 koala npm[94611]: 2023-03-04 22:51:47 - INFO  - ApplicationComma                                                                                                                                                             ndRegistry[urban] Successfully created chat input command "urban" with id "10817                                                                                                                                                             10613270638593". You should add the id to the "idHints" property of the register                                                                                                                                                              method you used!
	Mar 04 22:52:06 koala npm[94611]: 2023-03-04 22:52:06 - INFO  - ApplicationCommandRegistry[userinfo] Successfully created chat input command "userinfo" with id "1081710693427982357". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:52:06 koala npm[94611]: 2023-03-04 22:52:06 - INFO  - ApplicationCommandRegistry[ban] Successfully created chat input command "ban" with id "1081710694417846273". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:52:07 koala npm[94611]: 2023-03-04 22:52:07 - INFO  - ApplicationCommandRegistry[unban] Successfully created chat input command "unban" with id "1081710695760015390". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:52:07 koala npm[94611]: 2023-03-04 22:52:07 - INFO  - ApplicationCommandRegistry[filter] Successfully created chat input command "filter" with id "1081710696892485632". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:52:07 koala npm[94611]: 2023-03-04 22:52:07 - INFO  - ApplicationCommandRegistry[loop] Successfully created chat input command "loop" with id "1081710698352103504". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:52:27 koala npm[94611]: 2023-03-04 22:52:27 - INFO  - ApplicationCommandRegistry[nowplaying] Successfully created chat input command "nowplaying" with id "1081710779243438251". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:52:27 koala npm[94611]: 2023-03-04 22:52:27 - INFO  - ApplicationCommandRegistry[pause-resume] Successfully created chat input command "pause-resume" with id "1081710780325580830". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:52:27 koala npm[94611]: 2023-03-04 22:52:27 - INFO  - ApplicationCommandRegistry[play] Successfully created chat input command "play" with id "1081710781554499594". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:52:27 koala npm[94611]: 2023-03-04 22:52:27 - INFO  - ApplicationCommandRegistry[queue] Successfully created chat input command "queue" with id "1081710782863126720". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:52:28 koala npm[94611]: 2023-03-04 22:52:28 - INFO  - ApplicationCommandRegistry[skip] Successfully created chat input command "skip" with id "1081710783932674138". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:52:47 koala npm[94611]: 2023-03-04 22:52:47 - INFO  - ApplicationCommandRegistry[stop] Successfully created chat input command "stop" with id "1081710864752717936". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:52:47 koala npm[94611]: 2023-03-04 22:52:47 - INFO  - ApplicationCommandRegistry[volume] Successfully created chat input command "volume" with id "1081710866271051776". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:52:48 koala npm[94611]: 2023-03-04 22:52:48 - INFO  - ApplicationCommandRegistry[eval] Successfully created chat input command "eval" with id "1081710867562909782". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:52:49 koala npm[94611]: 2023-03-04 22:52:49 - INFO  - ApplicationCommandRegistry[setup] Successfully created chat input command "setup" with id "1081710869790064790". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:52:49 koala npm[94611]: 2023-03-04 22:52:49 - INFO  - ApplicationCommandRegistry[test] Successfully created chat input command "test" with id "1081710872147267654". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:53:08 koala npm[94611]: 2023-03-04 22:53:08 - INFO  - ApplicationCommandRegistry[achievement] Successfully created chat input command "achievement" with id "1081710952862462005". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:53:08 koala npm[94611]: 2023-03-04 22:53:08 - INFO  - ApplicationCommandRegistry[avatar] Successfully created chat input command "avatar" with id "1081710954196238346". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:53:09 koala npm[94611]: 2023-03-04 22:53:09 - INFO  - ApplicationCommandRegistry[beautiful] Successfully created chat input command "beautiful" with id "1081710955500679329". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:53:09 koala npm[94611]: 2023-03-04 22:53:09 - INFO  - ApplicationCommandRegistry[certificate] Successfully created chat input command "certificate" with id "1081710957132255292". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:53:09 koala npm[94611]: 2023-03-04 22:53:09 - INFO  - ApplicationCommandRegistry[gandhi] Successfully created chat input command "gandhi" with id "1081710958470234192". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:53:29 koala npm[94611]: 2023-03-04 22:53:29 - INFO  - ApplicationCommandRegistry[gun] Successfully created chat input command "gun" with id "1081711039109922886". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:53:29 koala npm[94611]: 2023-03-04 22:53:29 - INFO  - ApplicationCommandRegistry[hands] Successfully created chat input command "hands" with id "1081711040682795088". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:53:29 koala npm[94611]: 2023-03-04 22:53:29 - INFO  - ApplicationCommandRegistry[hearts] Successfully created chat input command "hearts" with id "1081711042217910442". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:53:30 koala npm[94611]: 2023-03-04 22:53:30 - INFO  - ApplicationCommandRegistry[rainbow] Successfully created chat input command "rainbow" with id "1081711043513946132". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:53:31 koala npm[94611]: 2023-03-04 22:53:31 - INFO  - ApplicationCommandRegistry[ross] Successfully created chat input command "ross" with id "1081711048337391767". You should add the id to the "idHints" property of the register method you used!
	Mar 04 22:53:50 koala npm[94611]: 2023-03-04 22:53:50 - INFO  - ApplicationCommandRegistry[steamnowplaying] Successfully created chat input command "steamnowplaying" with id "1081711127605555310". You should add the id to the "idHints" property of the register method you used!`;

	let cmds = [];

	let lines = logs.split('\n');

	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];

		// if the line contains the command name
		if (line.includes('Successfully created chat')) {
			// get the command name
			let commandName = line.match(commandNameRegex)[1].replace('[', '').replace(']', '');

			// get the id
			let id = line.match(idRegex)[0].replace('"', '').replace('"', '');

			// push the command name and id to the array
			cmds.push([commandName, id]);
		}
	}

	console.log(cmds);
	console.log(`Found ${cmds.length} commands!`);
	return cmds;
}
