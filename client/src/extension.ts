/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import * as fs from "fs";
import * as path from 'path';

import { workspace, Disposable, ExtensionContext, languages } from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    SettingMonitor,
    ServerOptions,
    TransportKind,
    InitializeParams,
    StreamInfo,
    createServerPipeTransport,
} from "vscode-languageclient/node";
import { Trace } from "vscode-jsonrpc/node";
// import { TmdlSemanticTokensProvider, legend} from "./tmdlSemanticTokensProvider";

let client: LanguageClient;

export async function activate(context: ExtensionContext) {

//	context.subscriptions.push(languages.registerDocumentSemanticTokensProvider({ language: 'tmdl' }, new TmdlSemanticTokensProvider(), legend));

	// Attempt to locate the TMDL language server.
	const serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);

	// Rethrow Not-Found exception if the server does not exist.
	// try {
	// 	await fs.promises.access(serverModule);
	// 	console.log(`TMDL language server located at: '${serverModule}'`);
	// } catch (err) {
	// 	throw err;
	// }

	// Use port 4711 in debug mode.
	let debugOptions = { execArgv: ['--nolazy', '--inspect=4711'] };
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
	};


	// Options to configure the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for tmdl language
		documentSelector: [{ scheme: 'file', language: 'tmdl' }],
		synchronize: {
			// Notify the server about changes to '.tmdl files contained in the workspace
			fileEvents: [
				workspace.createFileSystemWatcher('**/.tmd'),
				workspace.createFileSystemWatcher('**/.tmdl'),
			]
		}
	};

	// Create and start the TMDL language client.
	client = new LanguageClient(
		'tmdlLanguageExtension',
		'Tabular Model Definition Language (TMDL) Extension',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server.
	// client.trace = Trace.Verbose;
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}