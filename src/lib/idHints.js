export function getIdHints() {
	const commandNameRegex = /\[(.*?)\]/;
	const idRegex = /"\d+"/;

	let logs = `
Jun 04 21:13:47 koala npm[13560]: 2023-06-04 21:13:47 - INFO  - ApplicationCommandRegistry[botinfo] Successfully created chat input guild command "botinfo" with id "1115025634155053096". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:13:47 koala npm[13560]: 2023-06-04 21:13:47 - INFO  - ApplicationCommandRegistry[define] Successfully created chat input guild command "define" with id "1115025635375579186". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:13:48 koala npm[13560]: 2023-06-04 21:13:48 - INFO  - ApplicationCommandRegistry[serverinfo] Successfully created chat input guild command "serverinfo" with id "1115025637019766834". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:13:48 koala npm[13560]: 2023-06-04 21:13:48 - INFO  - ApplicationCommandRegistry[urban] Successfully created chat input guild command "urban" with id "1115025638844289095". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:13:49 koala npm[13560]: 2023-06-04 21:13:49 - INFO  - ApplicationCommandRegistry[userinfo] Successfully created chat input guild command "userinfo" with id "1115025640882716762". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:14:07 koala npm[13560]: 2023-06-04 21:14:07 - INFO  - ApplicationCommandRegistry[invite] Successfully created chat input guild command "invite" with id "1115025719425253397". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:14:08 koala npm[13560]: 2023-06-04 21:14:08 - INFO  - ApplicationCommandRegistry[ban] Successfully created chat input guild command "ban" with id "1115025720918409308". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:14:08 koala npm[13560]: 2023-06-04 21:14:08 - INFO  - ApplicationCommandRegistry[unban] Successfully created chat input guild command "unban" with id "1115025722419986542". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:14:08 koala npm[13560]: 2023-06-04 21:14:08 - INFO  - ApplicationCommandRegistry[role] Successfully created chat input guild command "role" with id "1115025723938320516". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:14:09 koala npm[13560]: 2023-06-04 21:14:09 - INFO  - ApplicationCommandRegistry[play] Successfully created chat input command "play" with id "1115025725435695286". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:14:10 koala npm[13560]: 2023-06-04 21:14:10 - INFO  - ApplicationCommandRegistry[filter] Successfully created chat input guild command "filter" with id "1115025726572331029". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:14:29 koala npm[13560]: 2023-06-04 21:14:29 - INFO  - ApplicationCommandRegistry[loop] Successfully created chat input guild command "loop" with id "1115025808650674206". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:14:29 koala npm[13560]: 2023-06-04 21:14:29 - INFO  - ApplicationCommandRegistry[pause-resume] Successfully created chat input guild command "pause-resume" with id "1115025810353569844". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:14:30 koala npm[13560]: 2023-06-04 21:14:30 - INFO  - ApplicationCommandRegistry[skip] Successfully created chat input guild command "skip" with id "1115025812287127562". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:14:30 koala npm[13560]: 2023-06-04 21:14:30 - INFO  - ApplicationCommandRegistry[volume] Successfully created chat input guild command "volume" with id "1115025813880967219". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:14:30 koala npm[13560]: 2023-06-04 21:14:30 - INFO  - ApplicationCommandRegistry[nowplaying] Successfully created chat input guild command "nowplaying" with id "1115025815294443582". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:14:49 koala npm[13560]: 2023-06-04 21:14:49 - INFO  - ApplicationCommandRegistry[queue] Successfully created chat input guild command "queue" with id "1115025895036567632". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:14:50 koala npm[13560]: 2023-06-04 21:14:50 - INFO  - ApplicationCommandRegistry[stop] Successfully created chat input guild command "stop" with id "1115025896756219924". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:14:50 koala npm[13560]: 2023-06-04 21:14:50 - INFO  - ApplicationCommandRegistry[eval] Successfully created chat input guild command "eval" with id "1115025898308120726". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:14:50 koala npm[13560]: 2023-06-04 21:14:50 - INFO  - ApplicationCommandRegistry[setup] Successfully created chat input guild command "setup" with id "1115025899633529034". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:14:51 koala npm[13560]: 2023-06-04 21:14:51 - INFO  - ApplicationCommandRegistry[test] Successfully created chat input guild command "test" with id "1115025901357379634". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:15:10 koala npm[13560]: 2023-06-04 21:15:10 - INFO  - ApplicationCommandRegistry[achievement] Successfully created chat input guild command "achievement" with id "1115025980956885125". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:15:10 koala npm[13560]: 2023-06-04 21:15:10 - INFO  - ApplicationCommandRegistry[avatar] Successfully created chat input guild command "avatar" with id "1115025982869475459". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:15:11 koala npm[13560]: 2023-06-04 21:15:11 - INFO  - ApplicationCommandRegistry[beautiful] Successfully created chat input guild command "beautiful" with id "1115025984484286525". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:15:11 koala npm[13560]: 2023-06-04 21:15:11 - INFO  - ApplicationCommandRegistry[certificate] Successfully created chat input guild command "certificate" with id "1115025985889386526". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:15:12 koala npm[13560]: 2023-06-04 21:15:12 - INFO  - ApplicationCommandRegistry[gandhi] Successfully created chat input guild command "gandhi" with id "1115025987244146788". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:15:31 koala npm[13560]: 2023-06-04 21:15:31 - INFO  - ApplicationCommandRegistry[gun] Successfully created chat input guild command "gun" with id "1115026069951623168". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:15:31 koala npm[13560]: 2023-06-04 21:15:31 - INFO  - ApplicationCommandRegistry[hands] Successfully created chat input guild command "hands" with id "1115026071679676478". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:15:32 koala npm[13560]: 2023-06-04 21:15:32 - INFO  - ApplicationCommandRegistry[hearts] Successfully created chat input guild command "hearts" with id "1115026073432891523". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:15:32 koala npm[13560]: 2023-06-04 21:15:32 - INFO  - ApplicationCommandRegistry[rainbow] Successfully created chat input guild command "rainbow" with id "1115026074808635412". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:15:33 koala npm[13560]: 2023-06-04 21:15:33 - INFO  - ApplicationCommandRegistry[ross] Successfully created chat input guild command "ross" with id "1115026076314370118". You should add the id to the "idHints" property of the register method you used!
Jun 04 21:15:52 koala npm[13560]: 2023-06-04 21:15:52 - INFO  - ApplicationCommandRegistry[steamnowplaying] Successfully created chat input guild command "steamnowplaying" with id "1115026156371066940". You should add the id to the "idHints" property of the register method you used!
	`;

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
