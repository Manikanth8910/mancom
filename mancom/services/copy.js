const fs = require('fs');
const path = require('path');

const baseDir = '/Users/panugantimanikanth/Desktop/mancomm/Mancomm/mancom/services';
const visitorDir = path.join(baseDir, 'visitor-service');

function copyDir(src, dest, stringMap) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        if (entry.name === 'node_modules' || entry.name === 'dist') continue;

        let destName = entry.name;
        for (let [k, v] of Object.entries(stringMap)) {
            destName = destName.replace(new RegExp(k, 'g'), v);
        }

        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, destName);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath, stringMap);
        } else {
            let content = fs.readFileSync(srcPath, 'utf8');

            // first do exact maps
            for (let [k, v] of Object.entries(stringMap)) {
                content = content.replace(new RegExp(k, 'g'), v);
            }

            // Capitilized map
            const capTarget = stringMap.visitor.charAt(0).toUpperCase() + stringMap.visitor.slice(1);
            content = content.replace(/Visitor/g, capTarget);
            content = content.replace(/VISITOR/g, stringMap.visitor.toUpperCase());

            fs.writeFileSync(destPath, content);
        }
    }
}

copyDir(visitorDir, path.join(baseDir, 'payment-service'), { visitor: 'payment', '3002': '3003' });
copyDir(visitorDir, path.join(baseDir, 'helpdesk-service'), { visitor: 'helpdesk', '3002': '3004' });
