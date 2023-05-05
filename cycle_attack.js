/** @param {NS} ns */

export async function main(ns) {
	const targetMoney = 0.9;
	const target = ns.args[0];
	// const army = ns.read('army.txt').split(',').filter(e => e);
	// serv is the server that is running the scripts 
	// target is the server being attacked
	const serv = ns.getServer();
	const servName = serv.hostname;
	ns.killall(servName, true);
	const maxRam = serv.maxRam - serv.ramUsed;
	const hackRam = ns.getScriptRam('hack.js');
	const growRam = ns.getScriptRam('grow.js');
	const weakenRam = ns.getScriptRam('weaken.js');

	const maxMoney = ns.getServerMaxMoney(target);
	const moneyThresh = maxMoney * targetMoney;
	//// Get target to 100% money
	const threadsForMaxMoney = Math.ceil(ns.growthAnalyze(target, maxMoney / Math.max(ns.getServerMoneyAvailable(target), 1)));

	while (ns.getServerMoneyAvailable(target) < maxMoney || ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
		if (ns.getServerMoneyAvailable(target) < maxMoney) {
			ns.run('grow.js', Math.min(Math.floor(maxRam * 0.7 / growRam), threadsForMaxMoney), target);
			if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
				const maxSecRam = Math.floor((serv.maxRam - ns.getServerUsedRam(servName)) / weakenRam);
				ns.run('weaken.js', maxSecRam, target);
				await ns.sleep(ns.getWeakenTime(target) + 500);
			} else {
				await ns.sleep(ns.getGrowTime(target) + 500);
			}
		} else {
			const maxSecRam = Math.floor((serv.maxRam - ns.getServerUsedRam(servName)) / weakenRam);
			ns.run('weaken.js', maxSecRam, target);
			await ns.sleep(ns.getWeakenTime(target) + 500);
		}
	}

	// Growth calcs
	const growThreads = Math.ceil(ns.growthAnalyze(target, (1 / targetMoney)) * 1.2);

	// Hack calcs
	const moneyGain = maxMoney - moneyThresh;
	const hackThreads = Math.floor(ns.hackAnalyzeThreads(target, moneyGain));
	ns.tprint(`
	Target: ` + target + `
	Per cycle: ` + moneyGain.toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
	})
	)
	// Security calcs
	const hackSec = ns.hackAnalyzeSecurity(hackThreads) / 0.05;
	const growSec = ns.growthAnalyzeSecurity(growThreads) / 0.05;
	const weakenThreads = Math.ceil((hackSec + growSec) * 1.5);

	// Cycle calc
	const ramCost = (hackRam * hackThreads) + (growRam * growThreads) + (weakenRam * weakenThreads);
	const cycles = Math.floor(maxRam / ramCost);
	const cycleTime = Math.max(Math.ceil((ns.getWeakenTime(target)) / cycles) + 100, 400);
	
  ns.tprint(`
	# Grow Threads: ` + growThreads + `
	# Hack Threads ` + hackThreads + `
	# Weaken Threads ` + weakenThreads + `
	Ram Cost: ` + ramCost + ' B' + ` 
	Cycles: ` + cycles + `
	Time between cycles: ` + cycleTime + ' ms');

	// 10 Sec to run, 10 ram, 5 ram cost = 2 cycles per 5 sec
  
	let cycle = 0;
	let loop = 0;
  
	while (true) {
		if (ns.getServerSecurityLevel(target) === ns.getServerMinSecurityLevel(target)) {
			const weakenTime = ns.getWeakenTime(target);
			// ns.tprint('growTime ' + growTime + ' hackTime ' + hackTime + ' weakenTime ' + weakenTime);

			// Add a hack then grow then weaken to the queue, expiring in that order
			ns.run('hack.js', hackThreads, target, weakenTime - ns.getHackTime(target) - 150, cycle);
			ns.run('grow.js', growThreads, target, weakenTime - ns.getGrowTime(target) - 75, cycle);
			ns.run('weaken.js', weakenThreads, target, 0, cycle++);

			await ns.sleep(cycleTime);
			loop = 0;
		} else {
			loop++;
			if (loop >= 50) {
				ns.run('grow.js', growThreads * 3, target, ns.getWeakenTime(target) - ns.getGrowTime(target) - 75, cycle);
				ns.run('weaken.js', weakenThreads * 5, target, 0, cycle++);
				loop = 0;
				await ns.sleep(10000);
			}
			await ns.sleep(100);
		}
	}

}
