const axios = require('axios');
const FormData = require('form-data');

const API_BASE_URL = 'http://localhost:3001';

async function testFrontendFormSubmission() {
  try {
    console.log('Testing frontend form submission simulation...');
    
    const formData = new FormData();
    
    // Simulate what the frontend form sends
    formData.append('serialNumber', 'SJPROD0008');
    formData.append('category', 'RING');
    formData.append('grossWt', '35');
    formData.append('netWt', '30');
    formData.append('diaWt', '6.0');
    formData.append('diaPcs', '20');
    formData.append('clarity', 'vs');
    formData.append('color', 'd-f');
    
    // Simulate the new fields as they would be sent from frontend
    // This simulates what happens when MM Size is NOT selected
    formData.append('mmSize', '0'); // Default value when not selected
    formData.append('seiveSize', ''); // Empty string when not selected
    formData.append('sieveSizeRange', ''); // Empty string when not selected
    
    // Create a dummy image file
    const dummyImage = Buffer.from('dummy image data');
    formData.append('image', dummyImage, {
      filename: 'test.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('Simulating frontend form submission with default values...');
    
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
    
    // Now test with actual values (simulating when MM Size IS selected)
    console.log('\n--- Testing with actual MM Size values ---');
    
    const formData2 = new FormData();
    formData2.append('serialNumber', 'SJPROD0009');
    formData2.append('category', 'EARRING');
    formData2.append('grossWt', '40');
    formData2.append('netWt', '35');
    formData2.append('diaWt', '7.0');
    formData2.append('diaPcs', '25');
    formData2.append('clarity', 'vs');
    formData2.append('color', 'd-f');
    
    // Simulate the new fields with actual values
    formData2.append('mmSize', '3.5');
    formData2.append('seiveSize', '+15.0-15.5');
    formData2.append('sieveSizeRange', '+14.0-16.0');
    
    formData2.append('image', dummyImage, {
      filename: 'test2.jpg',
      contentType: 'image/jpeg'
    });
    
    const response2 = await axios.post(
      `${API_BASE_URL}/api/pdmaster/createDesignMaster`,
      formData2,
      {
        headers: {
          ...formData2.getHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log('Response with actual values:', response2.data);
    
    // Check all records
    const fetchResponse = await axios.get(`${API_BASE_URL}/api/pdmaster/getAllDesignMasters`);
    console.log('\nAll Design Masters:');
    fetchResponse.data.data.forEach((design, index) => {
      console.log(`Record ${index + 1}:`, {
        serialNumber: design.serialNumber,
        mmSize: design.mmSize,
        seiveSize: design.seiveSize,
        sieveSizeRange: design.sieveSizeRange
      });
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testFrontendFormSubmission();
