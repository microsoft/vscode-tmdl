# TMDL Extension for Visual Studio Code
[![Version](https://img.shields.io/visual-studio-marketplace/v/analysis-services.TMDL)](https://marketplace.visualstudio.com/items?itemName=analysis-services.TMDL)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/analysis-services.TMDL)](https://marketplace.visualstudio.com/items?itemName=analysis-services.TMDL)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/analysis-services.TMDL)](https://marketplace.visualstudio.com/items?itemName=analysis-services.TMDL)
[![Ratings](https://img.shields.io/visual-studio-marketplace/r/analysis-services.TMDL)](https://marketplace.visualstudio.com/items?itemName=analysis-services.TMDL)

![TMDL Extension for Visual Studio Code](./images/TMDLExtensionforVisualStudioCode.png "TMDL Extension for Visual Studio Code")

A [Visual Studio Code extension](https://marketplace.visualstudio.com/items?itemName=analysis-services.TMDL) that adds language support for the [Tabular Model Definition Language (TMDL)](https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-tmdl-view).

# Features

- **Semantic Highlighting**: Improves TMDL readability with context-aware coloring  
- **Error Diagnostics**: Highlights errors that will cause TMDL serialization to fail  
- **Autocomplete**: Offers intelligent TMDL token completion suggestions  
- **Code Formatting**: Automatically organizes TMDL code for enhanced readability and consistency  
- **Hover Information**: Provides detailed context and information for TMDL tokens on mouse hover  
- **Code Actions**: Provides quick fixes and refactoring options for common TMDL issues  
- **Breadcrumb Navigation**: Displays the hierarchical structure of TMDL code for easy navigation  
- **Power Query Support**: Enhances readability of Power Query embedded within TMDL  
- **Power Query Support**: Provides syntax error identification for Power Query expressions within TMDL  
- **Power Query Support**: Enhanced formatting for embedded Power Query expressions within TMDL  
- **Power Query Support**: Offers context-aware Power Query tokens and functions suggestions  
- **Localization of Diagnostics**: Localizes error messages based on the user's language setting  

## Code Structure

| Directory           | Description                                         |
|---------------------|-----------------------------------------------------|
| Root                | Essential project files and documentation.         |
|                     | - `.gitignore`                                      |
|                     | - `CODE_OF_CONDUCT.md`                             |
|                     | - `LICENSE`                                         |
|                     | - `package.json`                                    |
|                     | - `README.md`                                       |
|                     | - `SECURITY.md`                                     |
|                     | - `SUPPORT.md`                                      |
|                     |
| .vscode             | VSCode-specific configuration files.                |
|                     | - `launch.json`                                     |
|                     |
| config              | Project configuration files.                        |
|                     | - `tmdl-configuration.json`                         |
|                     |
| syntaxes            | Syntax definition files.                            |
|                     | - `tmdl.tmLanguage.json`                            |

## Contributing

Please log an issues for this feature on [Issues Tab](https://github.com/microsoft/vscode-tmdl/issues)

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft 
trademarks or logos is subject to and must follow 
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
