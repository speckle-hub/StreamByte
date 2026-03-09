import axios from 'axios';

async function testProxy() {
  console.log('Testing proxy connection to MediaFusion...');
  const addonUrl = encodeURIComponent('https://mediafusion.elfhosted.com/manifest.json');
  try {
    const response = await axios.get(`http://localhost:3001/proxy?url=${addonUrl}`);
    console.log('Success! Manifest name:', response.data.name);
    process.exit(0);
  } catch (err) {
    console.error('Proxy test failed:', err.message);
    process.exit(1);
  }
}

testProxy();
