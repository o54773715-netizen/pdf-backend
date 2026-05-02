const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.get("/", (req, res) => {
    res.send("PDF Backend Working 🚀");
});

app.post('/compress', upload.single('pdf'), (req, res) => {
    const input = req.file.path;
    if (req.file.mimetype !== 'application/pdf') {
  return res.status(400).send('Only PDF allowed');
}
    const output = `compressed-${Date.now()}.pdf`;

    const level = req.body.level || 'medium';

    let quality = '/screen'; // fastest
    if (level === 'low') quality = '/printer';
    if (level === 'high') quality = '/screen';

    const cmd = `gs -sDEVICE=pdfwrite \
-dCompatibilityLevel=1.4 \
-dPDFSETTINGS=${quality} \
-dNOPAUSE -dQUIET -dBATCH \
-sOutputFile=${output} ${input}`;

    exec(cmd, (err) => {
        if (err) return res.status(500).send('Error');

        res.download(output, () => {
            fs.unlink(input, () => {});
            fs.unlink(output, () => {});
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('Server running on port ' + PORT);
});
