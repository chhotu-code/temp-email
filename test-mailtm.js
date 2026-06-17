const testMail = async () => {
    const fetch = (await import('node-fetch')).default;
    
    // 1. Get domain
    const dRes = await fetch('https://api.mail.tm/domains');
    const dData = await dRes.json();
    const domain = dData['hydra:member'][0].domain;
    
    // 2. Create account
    const address = `test_${Date.now()}@${domain}`;
    const password = "password";
    
    console.log("Creating:", address);
    
    const cRes = await fetch('https://api.mail.tm/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password })
    });
    console.log("Create status:", cRes.status);
    
    // 3. Get token
    const tRes = await fetch('https://api.mail.tm/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password })
    });
    const tData = await tRes.json();
    const token = tData.token;
    console.log("Token:", token.substring(0, 10) + '...');
    
    // 4. Get messages
    const mRes = await fetch('https://api.mail.tm/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const mData = await mRes.json();
    console.log("Messages:", mData['hydra:member']);
};

testMail().catch(console.error);
