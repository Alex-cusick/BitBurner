/** @param {NS} ns */
export async function main(ns) {
	if (ns.args[0] === undefined) {
		for (let i = 32; i <= 1048576; i *= 2) {
			ns.tprint('A ' + i + 'GB server costs: ' + 
				ns.getPurchasedServerCost(i).toLocaleString('en-US', {style: 'currency', currency: 'USD'})
			);
		}
	} else {
		const ram = ns.args[0];
		const count = ns.args[1] || 1;
		let target = ns.read('cur_target.txt')
		const moneyThresh = ns.getServerMaxMoney(target) * 0.9;
		const securityThresh = ns.getServerMinSecurityLevel(target) * 1.2;
		
		const servList = ns.getPurchasedServers();
		let servNum = servList[servList.length - 1]?.match(/\d+/g) || 0;

		for (let i = 1; i <= count; i++) {
			const servName = ('Serv' + ++servNum);
			ns.purchaseServer(servName, ram);
			ns.write('army.txt', ',' + servName, 'a');	

			ns.scp(ns.ls('home').filter((file) => file.endsWith('.js')), servName);
			await ns.sleep(50);
			// ns.exec('basic_hack.js', servName, Math.floor(ram / ns.getScriptRam('basic_hack.js')), target, moneyThresh, securityThresh);
		}
	}
}
