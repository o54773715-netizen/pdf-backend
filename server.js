const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const upload = multer({ dest: '/tmp/' });

// Health check route (Railway needs this)
app.get('/', (req, res) => {
    res.status(200).send('OK');
});

app.post('/compress', upload.single('pdf'), (req, res) => {
    if (!req.file) return res.status(400).send('No file');

    const input = req.file.path;
    const output = `/tmp/output-${Date.now()}.pdf`;

    const level = req.body.level || 'medium';

    let quality = '/ebook';
    if (level === 'low') quality = '/printer';
    if (level === 'high') quality = '/screen';

    const cmd = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${quality} -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${output} ${input}`;

    exec(cmd, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Compression failed');
        }

        res.download(output, () => {
            fs.unlinkSync(input);
            fs.unlinkSync(output);
        });
    });
});

// CRITICAL FIX
const PORT = process.env.PORT;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on ${PORT}`);
});
