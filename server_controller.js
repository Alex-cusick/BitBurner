/** @param {NS} ns */
export async function main(ns) {
	const isSelect = await ns.prompt('Choose an action to perform\n', {type: 'select', choices: [
		'Add server(s)', 
		'Run cycle_attack', 
		'Stop all Serv scripts', 
		// 'Remove serv from army.txt',
		]});
	ns.tprint(isSelect);
	const servers = ns.getPurchasedServers();

	switch(isSelect) {
		case 'Add server(s)':
			const ramArr = [];
			for (let i = 32; i <= 1048576; i *= 2) {
				ramArr.push(i);
				ns.tprint('A ' + i + 'GB server costs: ' + 
					ns.getPurchasedServerCost(i).toLocaleString('en-US', 
						{style: 'currency', currency: 'USD'})
				);
			}
			
			const size = await ns.prompt('Select amount of ram on server purchased\n', 
				{type: 'select', choices: ramArr});

			if (size === '') return false;
			ns.run('add_server.js', 1, size);
			break;
		case 'Run cycle_attack':
			const serv = await ns.prompt('Select server to run script from\n', 
				{type: 'select', choices: servers});
			const servInfo = ns.read('serv_info.txt')
			ns.tprint(servInfo);

			const target = await ns.prompt('Select target for cycle_attack\n', 
				{type: 'select', choices: servInfo.match(/(?<=\n)\S*/g)});

			if (serv === '' || target === '' || servInfo === '') return false;
			ns.scp('cycle_attack.js', serv);
			ns.exec('cycle_attack.js', serv, 1, target);
			break;
		case 'Stop all Serv scripts':
			for (const serv of servers) {
				ns.killall(serv);
			}
			break;
		// case 'Remove serv from army.txt':
		// 	const servers = ns.getPurchasedServers();
		// 	const target = await ns.prompt('Select server to remove from army.txt\n', {type: 'select', choices: servers});
		// 	let armyStr = ns.read('army.txt');
		// 	armyStr = armyStr.replace(new RegExp('/' + target + ',/g'),'');
		// 	ns.tprint(armyStr);
		// 	// ns.write('army.txt', armyStr, 'w');	
		// 	break;
	}
	ns.tprint('Exited successfully');
}
