/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const path = require("path");
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
// import { TmdlSemanticTokensProvider, legend} from "./tmdlSemanticTokensProvider";
let client;
async function activate(context) {
    //	context.subscriptions.push(languages.registerDocumentSemanticTokensProvider({ language: 'tmdl' }, new TmdlSemanticTokensProvider(), legend));
    // Attempt to locate the TMDL language server.
    const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
    // Rethrow Not-Found exception if the server does not exist.
    // try {
    // 	await fs.promises.access(serverModule);
    // 	console.log(`TMDL language server located at: '${serverModule}'`);
    // } catch (err) {
    // 	throw err;
    // }
    // Use port 4711 in debug mode.
    let debugOptions = { execArgv: ['--nolazy', '--inspect=4711'] };
    const serverOptions = {
        run: { module: serverModule, transport: node_1.TransportKind.ipc },
        debug: { module: serverModule, transport: node_1.TransportKind.ipc, options: debugOptions }
    };
    // Options to configure the language client
    const clientOptions = {
        // Register the server for tmdl language
        documentSelector: [{ scheme: 'file', language: 'tmdl' }],
        synchronize: {
            // Notify the server about changes to '.tmdl files contained in the workspace
            fileEvents: [
                vscode_1.workspace.createFileSystemWatcher('**/.tmd'),
                vscode_1.workspace.createFileSystemWatcher('**/.tmdl'),
            ]
        }
    };
    // Create and start the TMDL language client.
    client = new node_1.LanguageClient('tmdlLanguageExtension', 'Tabular Model Definition Language (TMDL) Extension', serverOptions, clientOptions);
    // Start the client. This will also launch the server.
    // client.trace = Trace.Verbose;
    client.start();
}
exports.activate = activate;
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map