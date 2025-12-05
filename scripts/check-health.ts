
import fetch from 'node-fetch';

async function checkHealth() {
    try {
        console.log('Checking backend health...');
        const response = await fetch('http://localhost:5000/api/health');
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Body:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Health check failed:', error);
    }
}

checkHealth();
