async function testPiston() {
    try {
        const res = await fetch('https://emacs.piston.rs/api/v2/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                language: 'python',
                version: '3.10.0',
                files: [
                    { content: 'print("Hello from Piston!")' }
                ]
            })
        });
        const data = await res.json();
        console.log(data);
    } catch (e) {
        console.error(e);
    }
}
testPiston();
