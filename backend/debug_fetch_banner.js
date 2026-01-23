fetch('http://localhost:5000/api/banners?active=true')
    .then(res => res.json())
    .then(data => console.log('Data:', data))
    .catch(err => console.error('Error:', err));
