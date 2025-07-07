const express = require('express');
const router = express.Router();

// GET /privacy - Privacy Policy page
router.get('/privacy', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Privacy Policy - LexiFlow</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        .update-date { color: #888; font-style: italic; }
      </style>
    </head>
    <body>
      <h1>Privacy Policy</h1>
      <p class="update-date">Last updated: ${new Date().toLocaleDateString()}</p>
      
      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us.</p>
      
      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
      
      <h2>3. Information Sharing</h2>
      <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.</p>
      
      <h2>4. Data Security</h2>
      <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
      
      <h2>5. Your Rights</h2>
      <p>You have the right to access, update, or delete your personal information. You can do this through your account settings or by contacting us.</p>
      
      <h2>6. Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, please contact us at privacy@lexiflow.app</p>
    </body>
    </html>
  `);
});

// GET /terms - Terms of Service page
router.get('/terms', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Terms of Service - LexiFlow</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        .update-date { color: #888; font-style: italic; }
      </style>
    </head>
    <body>
      <h1>Terms of Service</h1>
      <p class="update-date">Last updated: ${new Date().toLocaleDateString()}</p>
      
      <h2>1. Acceptance of Terms</h2>
      <p>By using LexiFlow, you agree to be bound by these Terms of Service.</p>
      
      <h2>2. Use of Service</h2>
      <p>You may use our service for lawful purposes only. You agree not to use the service to violate any laws or regulations.</p>
      
      <h2>3. User Accounts</h2>
      <p>You are responsible for maintaining the confidentiality of your account and password.</p>
      
      <h2>4. Intellectual Property</h2>
      <p>The service and its original content remain the exclusive property of LexiFlow and its licensors.</p>
      
      <h2>5. Termination</h2>
      <p>We may terminate or suspend your account at any time without prior notice or liability.</p>
      
      <h2>6. Contact</h2>
      <p>If you have any questions about these Terms, please contact us at support@lexiflow.app</p>
    </body>
    </html>
  `);
});

module.exports = router;