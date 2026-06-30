const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Tumhari Secure API Details
const API_KEY = 'b75x2Zef3LgSGkA-kt3D429v-nA4jFfFT-1zrHMtgz-TXy73sxZ81WkqRY';
const API_BASE = 'https://onlinesim.ru/api';

// 🔐 SITE PROTECTION PASSWORD (HTML MEIN NAHI HAI - YAHAN SE CHANGE KARO)
const ACCESS_PASSWORD = 'NawabZada@_"*:!?_/*-+`~|~÷✓™©®£';

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 0. ROUTE: Password verification endpoint
app.post('/api/verify-auth', (req, res) => {
    const { password } = req.body;
    if (password === ACCESS_PASSWORD) {
        return res.json({ success: true, token: "NZ_SECURE_AUTH_VALIDATED_2026" });
    }
    res.json({ success: false, message: "Invalid access key restriction." });
});

// 1. ROUTE: Get Available Services/Categories (Publicly Viewable)
app.get('/api/get-services', async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE}/getServiceList.php`, {
            params: { apikey: API_KEY, lang: 'en' }
        });
        res.json({ success: true, services: response.data.services || response.data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. ROUTE: Buy / Request Virtual Number (Protected via Header validation check)
app.post('/api/get-number', async (req, res) => {
    try {
        const userToken = req.headers['x-auth-token'];
        if (userToken !== "NZ_SECURE_AUTH_VALIDATED_2026") {
            return res.status(401).json({ success: false, message: "Unauthorized restriction trigger." });
        }

        const { service, country } = req.body;
        const response = await axios.get(`${API_BASE}/getNum.php`, {
            params: {
                apikey: API_KEY,
                service: service || 'whatsapp',
                country: country || 7 
            }
        });

        if (response.data.tzid) {
            res.json({
                success: true,
                tzid: response.data.tzid,
                number: response.data.number
            });
        } else {
            res.json({ success: false, message: response.data.error || 'Service Busy' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. ROUTE: Check Live Dynamic OTP Status (Protected)
app.get('/api/get-otp/:tzid', async (req, res) => {
    try {
        const userToken = req.headers['x-auth-token'];
        if (userToken !== "NZ_SECURE_AUTH_VALIDATED_2026") {
            return res.status(401).json({ success: false, message: "Access Denied." });
        }

        const { tzid } = req.params;
        const response = await axios.get(`${API_BASE}/getState.php`, {
            params: { apikey: API_KEY, tzid: tzid, msg_list: 1 }
        });

        const orderData = Array.isArray(response.data) ? response.data[0] : response.data;

        if (orderData && orderData.msg) {
            res.json({ success: true, status: 'RECEIVED', otp: orderData.msg });
        } else {
            res.json({ success: true, status: 'WAITING', otp: null });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🦅 Nawab Zada Virtual Numbers Premium Shield Server Active 🦅`);
    console.log(`🌐 Dashboard Link: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
});
