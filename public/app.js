let token = localStorage.getItem('token');

// Check if user is already logged in
if (token) {
  document.getElementById('auth').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
}

async function signup() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (!username || !password) {
    alert('Please enter username and password');
    return;
  }
  
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.text();
    alert(data);
  } catch (err) {
    alert('Error during signup: ' + err.message);
  }
}

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (!username || !password) {
    alert('Please enter username and password');
    return;
  }
  
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    if (data.token) {
      token = data.token;
      localStorage.setItem('token', token);
      document.getElementById('auth').style.display = 'none';
      document.getElementById('dashboard').style.display = 'block';
      alert('Login successful!');
    } else {
      alert('Login failed');
    }
  } catch (err) {
    alert('Error during login: ' + err.message);
  }
}

function previewImage() {
  const file = document.getElementById('image').files[0];
  const preview = document.getElementById('preview');
  
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value;
  const description = document.getElementById('description').value;
  const location = document.getElementById('location').value;
  const image = document.getElementById('image').files[0];
  
  if (!image || !category || !location) {
    alert('Please fill in all required fields and select an image');
    return;
  }
  
  const formData = new FormData();
  formData.append('type', type);
  formData.append('category', category);
  formData.append('description', description);
  formData.append('location', location);
  formData.append('image', image);

  try {
    const res = await fetch('/api/items/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    const data = await res.text();
    alert(data);
    document.getElementById('uploadForm').reset();
    document.getElementById('preview').style.display = 'none';
  } catch (err) {
    alert('Error uploading item: ' + err.message);
  }
});

async function search() {
  try {
    const res = await fetch('/api/items/search', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const items = await res.json();
    const resultsDiv = document.getElementById('results');
    
    if (items.length === 0) {
      resultsDiv.innerHTML = '<p>No items found.</p>';
      return;
    }
    
    resultsDiv.innerHTML = items.map(item => `
      <div class="item-card">
        <h3>${item.category} - ${item.type}</h3>
        <p><strong>Description:</strong> ${item.description || 'N/A'}</p>
        <p><strong>Location:</strong> ${item.location}</p>
        <p><strong>Date:</strong> ${new Date(item.date).toLocaleDateString()}</p>
        ${item.imagePath ? `<img src="/${item.imagePath}" alt="${item.category}">` : ''}
      </div>
    `).join('');
  } catch (err) {
    alert('Error searching items: ' + err.message);
  }
}