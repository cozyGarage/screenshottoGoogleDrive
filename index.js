const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');


// Function to read the configuration from the JSON file
function readInfo() {
  const privatePath = './private.json';
  const privateInfo = fs.readFileSync(privatePath);
  return JSON.parse(privateInfo);
}

const info = readInfo();

// Screenshotmachine API options
const options = {
  dimension: '1920x1080',
  device: 'desktop',
  format: 'jpg',
  cacheLimit: '0',
  delay: '200',
  zoom: '100'
};

// Array of webpages to take screenshots of
const webpages = [
  {
    id: 1,
    name: 'iFunded',
    website: 'https://ifunded.de/en/'
  },
  {
    id: 2,
    name: 'Property Partner',
    website: 'https://www.propertypartner.co'
  },
  {
    id: 3,
    name: 'Property Moose',
    website: 'https://propertymoose.co.uk'
  },
  {
    id: 4,
    name: 'Homegrown',
    website: 'https://www.homegrown.co.uk'
  },
  {
    id: 5,
    name: 'Realty Mogul',
    website: 'https://www.realtymogul.com'
  }
];

// Function to take a screenshot and save it locally
async function takeScreenshotAndSaveLocally(id, name, website) {
  const apiUrl = `https://api.screenshotmachine.com/?key=${info.customerKey}&secret=${info.secretPhrase}&url=${encodeURIComponent(website)}&dimension=${options.dimension}&device=${options.device}&format=${options.format}&cacheLimit=${options.cacheLimit}&delay=${options.delay}&zoom=${options.zoom}`;

  try {
    const response = await axios({
      url: apiUrl,
      method: 'GET',
      responseType: 'stream'
    });

    const fileName = `${id}_${name}.jpg`;
    const filePath = path.join('images', fileName);

    response.data.pipe(fs.createWriteStream(filePath));

    return new Promise((resolve, reject) => {
      response.data.on('end', () => {
        console.log(`Screenshot for ${name} saved locally as ${filePath}`);
        resolve(filePath);
      });

      response.data.on('error', (error) => {
        console.error(`Error saving screenshot for ${name}: ${error.message}`);
        reject(error);
      });
    });
  } catch (error) {
    console.error(`Error taking screenshot for ${name}: ${error.message}`);
    throw error;
  }
}

// Function to create the "images" folder if it doesn't exist
function createImagesFolder() {
  const folderPath = 'images';
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
}

// Function to upload an image to Google Drive
async function uploadImageToDrive(filePath, fileName, accessToken, folderId) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: fileName,
    parents: [folderId]
  };

  const media = {
    mimeType: 'image/jpeg',
    body: fs.createReadStream(filePath)
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media
    });

    console.log(`Image ${fileName} uploaded to Google Drive. File ID: ${response.data.id}`);
    return response.data.id;
  } catch (error) {
    console.error(`Error uploading image ${fileName} to Google Drive: ${error.message}`);
    throw error;
  }
}

// Main function to take screenshots and upload them to Google Drive
async function main() {

  createImagesFolder();

  try {
    for (const webpage of webpages) {
      const filePath = await takeScreenshotAndSaveLocally(webpage.id, webpage.name, webpage.website);
      await uploadImageToDrive(filePath, `${webpage.id}_${webpage.name}.jpg`, info.accessToken, info.folderId);
    }

    console.log('Screenshots captured and uploaded successfully!');
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

// Call the main function
main();
