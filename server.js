const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8085;
const PUBLIC_DIR = __dirname;

const server = http.createServer((req, res) => {
    // Enable CORS for development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API to save salon services data
    if (req.url === '/api/save-services' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                if (!payload.services || !Array.isArray(payload.services)) {
                    throw new Error('Invalid services array format');
                }

                // Read existing salon-data.json
                const dataPath = path.join(PUBLIC_DIR, 'salon-data.json');
                if (!fs.existsSync(dataPath)) {
                    throw new Error('salon-data.json not found on disk');
                }

                const rawData = fs.readFileSync(dataPath, 'utf8');
                const data = JSON.parse(rawData);

                // Re-index dynamic service numbers (e.g. 01, 02...) for safety
                let femaleCount = 1;
                let maleCount = 1;
                const updatedServices = payload.services.map(service => {
                    const gender = service.gender ? service.gender.toLowerCase() : 'female';
                    let numStr = '';
                    if (gender === 'male') {
                        numStr = String(maleCount++).padStart(2, '0');
                    } else {
                        numStr = String(femaleCount++).padStart(2, '0');
                    }
                    return {
                        num: numStr,
                        name: service.name.trim(),
                        desc: service.desc.trim(),
                        price: service.price.trim(),
                        gender: gender
                    };
                });

                // Update services
                data.services = updatedServices;

                // Write back to disk
                fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Services saved successfully!', count: updatedServices.length }));
            } catch (err) {
                console.error('API Error saving services:', err);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // Serve static files
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    
    // Check if path is outside the public directory (directory traversal prevention)
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }

        const ext = path.extname(filePath);
        let contentType = 'text/html';
        switch (ext) {
            case '.css': contentType = 'text/css'; break;
            case '.js': contentType = 'application/javascript'; break;
            case '.json': contentType = 'application/json'; break;
            case '.svg': contentType = 'image/svg+xml'; break;
            case '.png': contentType = 'image/png'; break;
            case '.jpg': case '.jpeg': contentType = 'image/jpeg'; break;
            case '.ico': contentType = 'image/x-icon'; break;
            case '.woff': contentType = 'font/woff'; break;
            case '.woff2': contentType = 'font/woff2'; break;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`Development API server running at http://localhost:${PORT}/`);
});
