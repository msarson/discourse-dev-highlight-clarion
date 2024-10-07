const fs = require('fs');
const path = require('path');
// Define input and output paths relative to the 'dev' directory
const inputFilePath = '../common/common/color_definitions.scss'; // Adjusted path relative to dev
const outputFilePath = 'common/generated-colors.scss';           // Output file within dev/common

// Check if the input file exists before proceeding
if (!fs.existsSync(inputFilePath)) {
    console.error(`Input file not found: ${inputFilePath}`);

    // List directory structure to help debug, excluding node_modules
    console.log('Listing directories and files in the project, skipping node_modules:');
    const listDirectory = (dirPath) => {
        console.log(`\nDirectory: ${dirPath}`);
        fs.readdirSync(dirPath).forEach(file => {
            const fullPath = path.join(dirPath, file);
            const stat = fs.statSync(fullPath);

            // Skip the node_modules directory
            if (file === 'node_modules' || file === '.git') {
                console.log(`[DIR]  ${file} (skipped)`);
                return;
            }

            if (stat.isDirectory()) {
                console.log(`[DIR]  ${file}`);
                listDirectory(fullPath); // Recursive call to list subdirectories
            } else {
                console.log(`[FILE] ${file}`);
            }
        });
    };

    listDirectory('../');  // List the directories from one level above the current working directory
    process.exit(1);  // Exit the process with an error code
}

fs.readFile(inputFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the input file:', err);
        return;
    }

    console.log('Contents of color_definitions.scss:', data); // Log the contents

    // Updated regular expression to match the dark-light-choose lines with interpolation
    const regex = /--([^:]+):\s*#\{dark-light-choose\(unquote\("([^"]+)"\),\s*unquote\("([^"]+)"\)\)\};/g;
    let output = ':root {\n';

    // Replace and create separate light and dark variables
    let match;
    while ((match = regex.exec(data)) !== null) {
        console.log('Matched:', match); // Log matched results
        const variableName = match[1].trim();
        const lightColor = match[2].trim();
        const darkColor = match[3].trim();

        output += `  --${variableName}-light: ${lightColor}; /* Light mode color */\n`;
        output += `  --${variableName}-dark: ${darkColor}; /* Dark mode color */\n`;
    }
    output += '}\n\n.dark-mode {\n';

    // Append dark mode variables
    regex.lastIndex = 0; // Reset the regex index
    while ((match = regex.exec(data)) !== null) {
        const variableName = match[1].trim();
        output += `  --${variableName}: var(--${variableName}-dark);\n`;
    }

    output += '}\n';

    // Write the output to the new file
    fs.writeFile(outputFilePath, output, 'utf8', (err) => {
        if (err) {
            console.error('Error writing the output file:', err);
            return;
        }
        console.log('Generated colors have been written to', outputFilePath);
    });
});
