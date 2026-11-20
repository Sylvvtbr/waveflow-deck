import streamDeck, { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { getStatus, mpd } from "../mpd";

abstract class WaveflowAction extends SingletonAction {
	protected abstract run(ev: KeyDownEvent): Promise<void>;

	override async onKeyDown(ev: KeyDownEvent): Promise<void> {
		try {
			await this.run(ev);
		} catch (err) {
			streamDeck.logger.error(`Falha ao falar com o Waveflow: ${err}`);
			await ev.action.showAlert();
		}
	}
}

@action({ UUID: "com.sylv.waveflow-deck.playpause" })
export class PlayPause extends WaveflowAction {
	protected async run(): Promise<void> {
		const { state } = await getStatus();
		await mpd([state === "play" ? "pause 1" : "pause 0"]);
	}
}

@action({ UUID: "com.sylv.waveflow-deck.next" })
export class Next extends WaveflowAction {
	protected async run(): Promise<void> {
		await mpd(["next"]);
	}
}

@action({ UUID: "com.sylv.waveflow-deck.previous" })
export class Previous extends WaveflowAction {
	protected async run(): Promise<void> {
		await mpd(["previous"]);
	}
}

type VolumeSettings = {
	direction?: "up" | "down";
	step?: number;
};

@action({ UUID: "com.sylv.waveflow-deck.volume" })
export class Volume extends SingletonAction<VolumeSettings> {
	override async onKeyDown(ev: KeyDownEvent<VolumeSettings>): Promise<void> {
		try {
			const direction = ev.payload.settings.direction ?? "up";
			const step = Math.max(1, Math.min(50, Number(ev.payload.settings.step) || 5));
			const current = Number((await getStatus()).volume ?? 0);
			const next = Math.max(0, Math.min(100, current + (direction === "down" ? -step : step)));
			await mpd([`setvol ${next}`]);
			await ev.action.setTitle(`${direction === "down" ? "Vol -" : "Vol +"}\n${next}%`);
		} catch (err) {
			streamDeck.logger.error(`Falha ao falar com o Waveflow: ${err}`);
			await ev.action.showAlert();
		}
	}
}