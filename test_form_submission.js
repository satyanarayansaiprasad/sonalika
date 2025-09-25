const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE_URL = 'https://sonalika.onrender.com';

async function testDesignMasterSubmission() {
  try {
    console.log('Testing Design Master submission...');
    
    const formData = new FormData();
    
    // Add required fields
    formData.append('serialNumber', 'SJPROD0003');
    formData.append('category', 'NECKLACE');
    formData.append('grossWt', '15');
    formData.append('netWt', '12');
    formData.append('diaWt', '2.5');
    formData.append('diaPcs', '5');
    formData.append('clarity', 'vs');
    formData.append('color', 'd-f');
    
    // Add new fields
    formData.append('mmSize', '2.5');
    formData.append('seiveSize', '+10.0-10.5');
    formData.append('sieveSizeRange', '+8.0-11.0');
    
    // Create a dummy image file
    const dummyImage = Buffer.from('dummy image data');
    formData.append('image', dummyImage, {
      filename: 'test.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, ':', value);
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/api/pdmaster/createDesignMaster`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log('Response:', response.data);
    
    // Now fetch all design masters to see if the new fields are there
    const fetchResponse = await axios.get(`${API_BASE_URL}/api/pdmaster/getAllDesignMasters`);
    console.log('All Design Masters:', JSON.stringify(fetchResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testDesignMasterSubmission();
