const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const path = require('path');
const app = express();
const PORT = 3000;

require('dotenv').config();

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const ec2 = new AWS.EC2();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index', { instances: undefined });
});

app.post('/search', async (req, res) => {
  const prefix = req.body.prefix;

  try {
    const result = await ec2.describeInstances({}).promise();
    const matched = [];

    result.Reservations.forEach(reservation => {
      reservation.Instances.forEach(instance => {
        const nameTag = instance.Tags.find(tag => tag.Key === 'Name');
        if (nameTag && nameTag.Value.startsWith(prefix)) {
          matched.push(instance.InstanceId);
        }
      });
    });

    res.render('index', { instances: matched });
  } catch (err) {
    console.error('EC2 Fetch Error:', err);
    res.status(500).send('Error fetching EC2 instances.');
  }
});

// Placeholder route for future redirection
app.get('/ec2/:id', async (req, res) => {
  const instanceId = req.params.id;

  try {
    const result = await ec2.describeInstances({
      InstanceIds: [instanceId]
    }).promise();

    const instance = result.Reservations[0]?.Instances[0];

    if (!instance) {
      return res.status(404).send('Instance not found');
    }

    res.render('instance-details', { instance });
  } catch (err) {
    console.error('Instance fetch error:', err);
    res.status(500).send('Error fetching instance details.');
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
