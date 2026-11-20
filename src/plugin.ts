import streamDeck from "@elgato/streamdeck";

import { Next, PlayPause, Previous, Volume } from "./actions/waveflow";

streamDeck.logger.setLevel("info");

streamDeck.actions.registerAction(new PlayPause());
streamDeck.actions.registerAction(new Next());
streamDeck.actions.registerAction(new Previous());
streamDeck.actions.registerAction(new Volume());

streamDeck.connect();