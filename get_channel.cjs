const https = require('https');

https.get({
  hostname: 'www.youtube.com',
  path: '/@tvadpgassembleiadedeus',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
}, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const match = data.match(/"channelId":"([^"]+)"/);
    if (match) {
      console.log('CHANNEL_ID:', match[1]);
    } else {
      console.log('Not found');
    }
  });
});
