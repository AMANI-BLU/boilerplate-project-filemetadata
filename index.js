var express = require('express');
var cors = require('cors');
require('dotenv').config();

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/fileanalyse', (req, res) => {
  let dataBuffer = Buffer.alloc(0);

  // Gather data chunks into dataBuffer
  req.on('data', (chunk) => {
    dataBuffer = Buffer.concat([dataBuffer, chunk]);
  });

  req.on('end', () => {
    // Convert buffer data into string
    const dataString = dataBuffer.toString();
    
    // Extract file metadata from data string
    const contentDisposition = dataString.match(/Content-Disposition: form-data; name="upfile"; filename="(.+?)"/);
    const contentType = dataString.match(/Content-Type: (.+?)(\r\n|\n)/);

    if (!contentDisposition || !contentType) {
      return res.status(400).json({ error: 'Invalid file upload' });
    }

    const fileName = contentDisposition[1];
    const fileType = contentType[1];
    const fileSize = dataBuffer.length;

    // Respond with the file information
    res.json({
      name: fileName,
      type: fileType,
      size: fileSize
    });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port);
});
