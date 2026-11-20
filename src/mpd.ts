import streamDeck from "@elgato/streamdeck";
import { Socket } from "node:net";

type GlobalSettings = {
	host?: string;
	port?: string;
	password?: string;
};

type Connection = {
	host: string;
	port: number;
	password: string;
};

async function loadConnection(): Promise<Connection> {
	const g = await streamDeck.settings.getGlobalSettings<GlobalSettings>();
	const host = (g.host ?? "").trim();
	if (!host) throw new Error("Configure o endereço (IP) do Waveflow no painel da ação.");
	return { host, port: Number(g.port) || 6600, password: g.password ?? "" };
}

/** Abre uma conexão MPD, envia os comandos em sequência e devolve as linhas de resposta. */
export async function mpd(commands: string[]): Promise<string[]> {
	const cfg = await loadConnection();
	const queue = cfg.password ? [`password ${cfg.password}`, ...commands] : [...commands];

	return new Promise((resolve, reject) => {
		const socket = new Socket();
		const output: string[] = [];
		let buffer = "";
		let greeted = false;
		let done = false;

		const finish = (err?: Error): void => {
			if (done) return;
			done = true;
			socket.destroy();
			if (err) reject(err);
			else resolve(output);
		};

		const sendNext = (): void => {
			const next = queue.shift();
			if (next === undefined) finish();
			else socket.write(`${next}\n`);
		};

		const onLine = (line: string): void => {
			if (!greeted) {
				greeted = true;
				if (line.startsWith("OK MPD")) sendNext();
				else finish(new Error(`Resposta inesperada: ${line}`));
			} else if (line === "OK") {
				sendNext();
			} else if (line.startsWith("ACK")) {
				finish(new Error(line));
			} else {
				output.push(line);
			}
		};

		socket.setTimeout(3000, () => finish(new Error("Tempo esgotado falando com o Waveflow")));
		socket.on("error", (err) => finish(err));
		socket.on("close", () => finish(new Error("Conexão fechada")));
		socket.on("data", (chunk) => {
			buffer += chunk.toString("utf8");
			let idx: number;
			while ((idx = buffer.indexOf("\n")) >= 0) {
				onLine(buffer.slice(0, idx).replace(/\r$/, ""));
				buffer = buffer.slice(idx + 1);
			}
		});
		socket.connect(cfg.port, cfg.host);
	});
}

/** Lê o `status` do player como um objeto (ex.: { volume: "7", state: "play" }). */
export async function getStatus(): Promise<Record<string, string>> {
	const status: Record<string, string> = {};
	for (const line of await mpd(["status"])) {
		const i = line.indexOf(": ");
		if (i > 0) status[line.slice(0, i)] = line.slice(i + 2);
	}
	return status;
}