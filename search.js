/** @param {NS} ns */

export async function main(ns) {
	const runFunc = ns.args[0];
	ns.write('army.txt', '', 'w');
	ns.write('serv_info.txt', '', 'w');

	// const backdoor = {
	// 	'CSEC': 1,
	// 	'avmnite-02h': 1,
	// 	'I.I.I.I': 1
	// }

	function full_scan(server) {
		if (targets[server] === 'first') targets[server] = true
		for (const ele of ns.scan(server)) {
			if (ele === 'home' || ele.startsWith('Serv')) continue
			else if (targets[ele] === undefined) targets[ele] = 'first';
		}
	}

	function full_hack(target) {
		try {
			if (target === 'home' || target.startsWith('Serv')) return false;

			ns.fileExists("BruteSSH.exe", "home") && ns.brutessh(target);
			ns.fileExists("FTPCrack.exe", "home") && ns.ftpcrack(target);
			ns.fileExists("relaySMTP.exe", "home") && ns.relaysmtp(target);
			ns.fileExists("HTTPWorm.exe", "home") && ns.httpworm(target);
			ns.fileExists("SQLInject.exe", "home") && ns.sqlinject(target);
			ns.nuke(target);

			army.push(target);
			// if (backdoor[target]) ns.(target)

			// Append server info to info doc
			const serv = ns.getServer(target) 
			if (serv.serverGrowth >= 10) {
				ns.write('serv_info.txt', target.padEnd(20) +
				'| Lvl: ' + serv.requiredHackingSkill + 
				'\t| Growth: ' + serv.serverGrowth + 
				'\t| Max $: ' + (serv.moneyMax).toLocaleString('en-US', {
					style: 'currency',
					currency: 'USD',
					}) + 
				'\n', 'a');
			}

			// Run basic hack on n00dles for basic start income
			ns.scp(ns.ls('home').filter((file) => file.endsWith('.js')), target);
			const hackRam = ns.getScriptRam('basic_hack.js');
			const moneyThresh = ns.getServerMaxMoney('n00dles') * 0.9;
			const securityThresh = ns.getServerMinSecurityLevel('n00dles') * 1.2;
			if (runFunc) {
				ns.exec('basic_hack.js', target, Math.max(Math.floor(serv.maxRam / hackRam), 1), 'n00dles', moneyThresh, securityThresh);
			}
			
			// Scan connections and add them to targets list
			targets[target] = false;
			
			ns.tprint('Access granted to: ' + target);
			return true;
		} catch {
			return false;
		}
	}

	// List of servers reachable at current lvl, if value is true the server has not been hacked yet
	const targets = {};

	// Get army from txt file as an array
	const army = ns.read('army.txt').split(',').filter(e => e);
	ns.tprint(army);

	// Start list of targets from home connection
	full_scan('home');

	while (true) {
		let armyChange = false;
		const playerLvl = ns.getHackingLevel();

		// For each server in targets list, scan it
		for (const target in targets) {
			if (targets[target] === 'first') {
				full_scan(target);
				armyChange = true
			}
			if (targets[target] === true && ns.getServerRequiredHackingLevel(target) <= playerLvl) {
				if (full_hack(target)) armyChange = true;
			}
		}
		// ns.tprint(targets);
		// Write army list to army.txt if it has changed
		if (armyChange === true) {
			let armyStr = '';
			for (let i = 0; i < army.length; i++) {
				armyStr = `${armyStr},${army[i]}`;
			}
			// ns.tprint('army.txt: ' + armyStr);
			ns.write('army.txt', armyStr, 'w');
			await ns.sleep(200);
		} else await ns.sleep(20000);
	}
}
