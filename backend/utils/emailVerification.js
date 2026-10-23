const imaps = require('imap-simple');

async function verifyUtrInEmails(utrNumber) {
    if (!utrNumber || utrNumber.length !== 12) return false;

    const config = {
        imap: {
            user: process.env.GMAIL_USER,
            password: process.env.GMAIL_APP_PASSWORD,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            authTimeout: 5000,
            tlsOptions: { rejectUnauthorized: false }
        }
    };

    if (!config.imap.user || !config.imap.password || config.imap.password === 'YOUR_APP_PASSWORD') {
        console.error("[Email Auth] Gmail credentials missing or not configured in .env");
        return false; // Default to false if not configured, fallback to manual approval
    }

    let connection;
    try {
        connection = await imaps.connect(config);
        await connection.openBox('INBOX');

        // Search for emails containing the UTR in the last 48 hours
        const delay = 48 * 3600 * 1000;
        let pastDate = new Date();
        pastDate.setTime(Date.now() - delay);
        
        const searchCriteria = [
            ['SINCE', pastDate.toISOString()],
            ['TEXT', utrNumber]
        ];
        
        // We only need the UID to know it exists
        const fetchOptions = {
            bodies: ['HEADER.FIELDS (SUBJECT)'],
            markSeen: false
        };

        const results = await connection.search(searchCriteria, fetchOptions);
        
        if (results && results.length > 0) {
            console.log(`[Email Auth] SUCCESS: Found matching UTR ${utrNumber} in email.`);
            connection.end();
            return true;
        }

        console.log(`[Email Auth] UTR ${utrNumber} not found in recent emails.`);
        connection.end();
        return false; 
    } catch (error) {
        console.error("[Email Auth] IMAP Error:", error.message);
        if (connection) connection.end();
        return false;
    }
}

module.exports = { verifyUtrInEmails };
