export function getIdHints() {
	const commandNameRegex = /\[(.*?)\]/;
	const idRegex = /"\d+"/;

	let logs = `
	2023-06-04 22:53:45 - INFO  - ApplicationCommandRegistry[achievement] Successfully created chat input command "achievement" with id "1115020559928016996". You should add the id to the "idHints" property of the register method you used!
2023-06-04 22:53:45 - INFO  - ApplicationCommandRegistry[avatar] Successfully created chat input command "avatar" with id "1115020561962242138". You should add the id to the "idHints" property of the register method you used! 
2023-06-04 22:53:46 - INFO  - ApplicationCommandRegistry[beautiful] Successfully created chat input command "beautiful" with id "1115020563413487616". You should add the id to the "idHints" property of the register method you used!
2023-06-04 22:53:46 - INFO  - ApplicationCommandRegistry[certificate] Successfully created chat input command "certificate" with id "1115020564420100118". You should add the id to the "idHints" property of the register method you used!
2023-06-04 22:53:46 - INFO  - ApplicationCommandRegistry[gandhi] Successfully created chat input command "gandhi" with id "1115020565841989642". You should add the id to the "idHints" property of the register method you used! 
2023-06-04 22:54:05 - INFO  - ApplicationCommandRegistry[gun] Successfully created chat input command "gun" with id "1115020645223383183". You should add the id to the "idHints" property of the register method you used!
2023-06-04 22:54:06 - INFO  - ApplicationCommandRegistry[hands] Successfully created chat input command "hands" with id "1115020647362482197". You should add the id to the "idHints" property of the register method you used!
2023-06-04 22:54:06 - INFO  - ApplicationCommandRegistry[hearts] Successfully created chat input command "hearts" with id "1115020648448798801". You should add the id to the "idHints" property of the register method you used!
2023-06-04 22:55:07 - INFO  - ApplicationCommandRegistry[loop] Successfully created chat input command "loop" with id "1115020905672888380". You should add the id to the "idHints" property of the register method you used!     
2023-06-04 22:55:08 - INFO  - ApplicationCommandRegistry[nowplaying] Successfully created chat input command "nowplaying" with id "1115020906868265010". You should add the id to the "idHints" property of the register method you used!
2023-06-04 22:55:08 - INFO  - ApplicationCommandRegistry[pause-resume] Successfully created chat input command "pause-resume" with id "1115020908285923418". You should add the id to the "idHints" property of the register method you used!
2023-06-04 22:55:27 - INFO  - ApplicationCommandRegistry[play] Successfully created chat input command "play" with id "1115020989433139280". You should add the id to the "idHints" property of the register method you used!     
2023-06-04 22:55:28 - INFO  - ApplicationCommandRegistry[queue] Successfully created chat input command "queue" with id "1115020991077302363". You should add the id to the "idHints" property of the register method you used!   
2023-06-04 22:55:28 - INFO  - ApplicationCommandRegistry[skip] Successfully created chat input command "skip" with id "1115020992201371658". You should add the id to the "idHints" property of the register method you used!     
2023-06-04 22:55:28 - INFO  - ApplicationCommandRegistry[stop] Successfully created chat input command "stop" with id "1115020993820377238". You should add the id to the "idHints" property of the register method you used!     
2023-06-04 22:55:29 - INFO  - ApplicationCommandRegistry[volume] Successfully created chat input command "volume" with id "1115020994944446497". You should add the id to the "idHints" property of the register method you used! 
2023-06-04 22:55:48 - INFO  - ApplicationCommandRegistry[eval] Successfully created chat input command "eval" with id "1115021074984353883". You should add the id to the "idHints" property of the register method you used!     
2023-06-04 22:55:48 - INFO  - ApplicationCommandRegistry[setup] Successfully created chat input command "setup" with id "1115021076129390605". You should add the id to the "idHints" property of the register method you used!
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
