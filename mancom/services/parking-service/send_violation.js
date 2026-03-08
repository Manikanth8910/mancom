require('dotenv').config({ path: __dirname + '/.env' });
const emailService = require('./services/emailService');

async function testViolation() {
    console.log('Sending parking violation messages...');

    try {
        const result1 = await emailService.sendParkingViolationEmail(
            'panugantimanikanth8910@gmail.com',
            'Panuganti Manikanth',
            'TG09FF9009'
        );
        console.log('Sent to panugantimanikanth8910@gmail.com:', result1.success);

        const result2 = await emailService.sendParkingViolationEmail(
            'panugantimanikanth10@gmail.com',
            'Manikanth',
            'TG16ER5565'
        );
        console.log('Sent to panugantimanikanth10@gmail.com:', result2.success);

    } catch (error) {
        console.error('❌ Error sending violations:', error);
    }
}

testViolation();
