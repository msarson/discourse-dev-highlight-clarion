const fs = require('fs');

// Define base paths
const commonDir = 'common/common'; // Base path for the common directory
const inputFilePath = `${commonDir}/color_definitions.scss`; // Input file
const outputFilePath = `${commonDir}/generated-colors.scss`; // Output file

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
