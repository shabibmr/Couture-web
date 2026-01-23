import express from 'express';
const app = express();
app.listen(5000, () => {
    console.log('Minimal server listening on 5000');
});

// Add a timer to ensure event loop is active
setInterval(() => {
    console.log('Tick');
}, 1000);
