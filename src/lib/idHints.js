export function getIdHints() {
	const commandNameRegex = /\[(.*?)\]/;
	const idRegex = /"\d+"/;

	// test

	let logs = `2023-02-07 22:18:31 - INFO  - ApplicationCommandRegistry[achievement] Successfully created chat input guild command "achievement-dev" with id "1072627426003267664". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:18:31 - INFO  - ApplicationCommandRegistry[avatar] Successfully created chat input guild command "avatar-dev" with id "1072627427475456131". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:18:32 - INFO  - ApplicationCommandRegistry[beautiful] Successfully created chat input guild command "beautiful-dev" with id "1072627429249646664". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:18:32 - INFO  - ApplicationCommandRegistry[certificate] Successfully created chat input guild command "certificate-dev" with id "1072627431216791663". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:18:32 - INFO  - ApplicationCommandRegistry[gandhi] Successfully created chat input guild command "gandhi-dev" with id "1072627432647041124". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:18:51 - INFO  - ApplicationCommandRegistry[gun] Successfully created chat input guild command "gun-dev" with id "1072627512196218910". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:18:52 - INFO  - ApplicationCommandRegistry[hands] Successfully created chat input guild command "hands-dev" with id "1072627513945235517". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:18:52 - INFO  - ApplicationCommandRegistry[hearts] Successfully created chat input guild command "hearts-dev" with id "1072627515476152351". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:18:53 - INFO  - ApplicationCommandRegistry[rainbow] Successfully created chat input guild command "rainbow-dev" with id "1072627517892067358". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:18:53 - INFO  - ApplicationCommandRegistry[ross] Successfully created chat input guild command "ross-dev" with id "1072627519431393290". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:19:12 - INFO  - ApplicationCommandRegistry[steamnowplaying] Successfully created chat input guild command "steamnowplaying-dev" with id "1072627598414327869". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:19:12 - INFO  - ApplicationCommandRegistry[botinfo] Successfully created chat input guild command "botinfo-dev" with id "1072627600389845194". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:19:13 - INFO  - ApplicationCommandRegistry[define] Successfully created chat input guild command "define-dev" with id "1072627602205978704". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:19:13 - INFO  - ApplicationCommandRegistry[invite] Successfully created chat input guild command "invite-dev" with id "1072627604168904794". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:19:14 - INFO  - ApplicationCommandRegistry[serverinfo] Successfully created chat input guild command "serverinfo-dev" with id "1072627605737586820". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:19:33 - INFO  - ApplicationCommandRegistry[urban] Successfully created chat input guild command "urban-dev" with id "1072627685177692200". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:19:33 - INFO  - ApplicationCommandRegistry[userinfo] Successfully created chat input guild command "userinfo-dev" with id "1072627687413256203". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:19:34 - INFO  - ApplicationCommandRegistry[ban] Successfully created chat input guild command "ban-dev" with id "1072627689187459113". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:19:34 - INFO  - ApplicationCommandRegistry[unban] Successfully created chat input guild command "unban-dev" with id "1072627690747736224". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:19:34 - INFO  - ApplicationCommandRegistry[nowplaying] Successfully created chat input guild command "nowplaying-dev" with id "1072627692698091661". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:19:53 - INFO  - ApplicationCommandRegistry[play] Successfully created chat input guild command "play-dev" with id "1072627771190288486". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:19:54 - INFO  - ApplicationCommandRegistry[queue] Successfully created chat input guild command "queue-dev" with id "1072627772951887912". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:19:54 - INFO  - ApplicationCommandRegistry[skip] Successfully created chat input guild command "skip-dev" with id "1072627774625435728". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:19:55 - INFO  - ApplicationCommandRegistry[stop] Successfully created chat input guild command "stop-dev" with id "1072627776772919396". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:19:56 - INFO  - ApplicationCommandRegistry[eval] Successfully created chat input guild command "eval-dev" with id "1072627778920386680". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:20:15 - INFO  - ApplicationCommandRegistry[setup] Successfully created chat input guild command "setup-dev" with id "1072627861019709561". You should add the id to the "idHints" property of the register method you used!
	2023-02-07 22:20:15 - INFO  - ApplicationCommandRegistry[test] Successfully created chat input guild command "test-dev" with id "1072627863293014086". You should add the id to the "idHints" property of the register method you used!`;

	let cmds = [];

	let lines = logs.split('\n');

	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];

		// if the line contains the command name
		if (line.includes('Successfully created chat input guild command')) {
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
