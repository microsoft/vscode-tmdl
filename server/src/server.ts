/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
	createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
	Hover,
	HoverParams,
	Range,
	Position,
	SemanticTokens,
	SemanticTokensPartialResult,
	SemanticTokensParams,
	SemanticTokensBuilder
} from 'vscode-languageserver/node';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';

import * as tmTypes from "../../shared/TmdlSchema.json";
import * as stp from "./semanticTokenProvider";

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true
			},
			// Tell the client that this server supports hover details.
			hoverProvider: true,
			
			// Tell the client that this server supports semantic tokens
			semanticTokensProvider:
			{
				legend: {
					tokenTypes: stp.tokenTypesLegend,
					tokenModifiers: stp.tokenModifiersLegend
				},
				full: true
			}
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});

// The example settings
interface ExampleSettings {
	maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <ExampleSettings>(
			(change.settings.tmdlLanguageExtension || defaultSettings)
		);
	}

	// Revalidate all open text documents
	documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'tmdlLanguageExtension'
		});
		documentSettings.set(resource, result);
	}
	return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	validateTextDocument(change.document);
});

// TODO: Add more validations
async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	// In this simple example we get the settings for every validate run.
	const settings = await getDocumentSettings(textDocument.uri);

	// This validator flags description blocks that are not
	// immediately followed by a section header.
	const text = textDocument.getText();

	const pattern = /(?:^[ \t]*\/{3}.*\r*\n)+(?:^[ \t]*\r*\n)/gmi;

	// const objectTypes = "///|annotation\\b|model\\b|table\\b|column\\b|partition\\b|measure\\b";
	// // const pattern = new RegExp("(?:^[ \\t]*\\/{3}.*\\r*\\n)+(?:^[ \\t]*(?!" + objectTypes + ").*\\r*\\n)", "gmi");

	// const pattern = new RegExp("(?:^[ \\t]*\\/{3}.*\\r*\\n)+^(?![ \\t]*///|[ \\t]*annotation\\b|[ \\t]*model\\b|[ \\t]*table\\b|[ \\t]*column\\b|[ \\t]*partition\\b|[ \\t]*measure\\b).*", "gmi");

	let m: RegExpExecArray | null;

	let problems = 0;
	const diagnostics: Diagnostic[] = [];

	while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
		problems++;
		const diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Error,
			range: {
				start: textDocument.positionAt(m.index),
				end: textDocument.positionAt(m.index + m[0].length)
			},
			message: `Description block is not immediately followed by a section header.`,
			source: 'ex'
		};
		if (hasDiagnosticRelatedInformationCapability) {
			diagnostic.relatedInformation = [
				{
					location: {
						uri: textDocument.uri,
						range: Object.assign({}, diagnostic.range)
					},
					message: 'Consider using sentence case for description blocks.'
				},
				{
					location: {
						uri: textDocument.uri,
						range: Object.assign({}, diagnostic.range)
					},
					message: 'Add a section header after the description block to improve readability.'
				}
			];
		}
		diagnostics.push(diagnostic);
	}

	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		// The below is a quick and dirty implementation for prototype demo purposes.
		// The actual implementation will be substantially more sophisticated.
		// See https://tomassetti.me/integrating-code-completion-in-visual-studio-code/
		// for a good starting point of the actual thing.

		return tmTypes.rootObjects.map(typeName => {
			return {
				label: typeName,
				kind: CompletionItemKind.Property
			}
		});
	}
);

// TODO: Create file to pull documentation from
// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		item.detail = `${item.label} details`;
		item.documentation = `TODO: Add documentation for ${item.label}.`;
		
		return item;
	}
);

// TODO: Create file to pull documentation from
// A handler for the `Hover` request to show 
// type information and include documentation.
connection.onHover((params: HoverParams): Hover | null | undefined => {

	const document = documents.get(params.textDocument.uri);
	if (document) {
		const currentLine = Range.create(
			Position.create(params.position.line,0), 
			Position.create(params.position.line + 1,0)
		);

		const txt = document.getText(currentLine);
		return {
			contents: {
				kind: 'markdown',
				value: `${txt}\r\n-----\r\n**TODO**: Add documentation here.`
			}
		};
	}

	return null;
});

connection.languages.semanticTokens.on((params: SemanticTokensParams): SemanticTokens => {
	const builder = new SemanticTokensBuilder();

	const document = documents.get(params.textDocument.uri);
	if(document)
	{
		const allTokens = stp.parseText(document.getText());
		allTokens.forEach((token) => {
			builder.push(token.line, token.startCharacter, token.length, stp.encodeTokenType(token.tokenType), stp.encodeTokenModifiers(token.tokenModifiers));
		});
	}
	return builder.build();
});

  
// // Handler for when the user requests the definition of a symbol
// connection.onDefinition((params: TextDocumentPositionParams): Definition => {
// // Provide the location of the symbol definition
// });

// // Handler for when the user requests references to a symbol
// connection.onReferences((params: ReferenceParams): Location[] => {
// // Provide a list of locations where the symbol is referenced
// });

// // Handler for when the user requests a list of symbols in a document
// connection.onDocumentSymbol((params: DocumentSymbolParams): SymbolInformation[] => {
// // Provide a list of symbols and their locations
// });

// // Handler for when the user requests a list of symbols in the workspace
// connection.onWorkspaceSymbol((params: WorkspaceSymbolParams): SymbolInformation[] => {
// // Provide a list of symbols and their locations across multiple documents
// });

// // Handler for when the user requests a code action for a specific problem
// connection.onCodeAction((params: CodeActionParams): (Command | CodeAction)[] => {
// // Provide a list of possible code actions to fix the problem
// });

// // Handler for when the user executes a command
// connection.onExecuteCommand((params: ExecuteCommandParams): any => {
// // Perform custom operations or trigger other handlers based on the command
// });


// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();

