let token = localStorage.getItem('token');

// Temporarily hide auth for testing - show dashboard directly
document.getElementById('auth').style.display = 'none';
document.getElementById('dashboard').style.display = 'block';

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
      // Temporarily removed auth header for testing
      body: formData
    });
    
    const data = await res.json();
    alert(data.message || 'Uploaded!');
    console.log('Upload response:', data);
    document.getElementById('uploadForm').reset();
    document.getElementById('preview').style.display = 'none';
  } catch (err) {
    console.error('Upload error:', err);
    alert('Error uploading item: ' + err.message);
  }
});

async function search() {
  try {
    const res = await fetch('/api/items/search');
    const matches = await res.json();
    
    console.log('Search results:', matches);
    const resultsDiv = document.getElementById('results');
    
    if (matches.length === 0) {
      resultsDiv.innerHTML = '<p>No matches found. Upload both lost and found items with similar images to test matching!</p>';
      return;
    }
    
    resultsDiv.innerHTML = '<h3>Matches Found:</h3>' + matches.map(match => `
      <div class="item-card">
        <h4>Match Score: ${(match.score * 100).toFixed(1)}%</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <h5>Lost: ${match.lost.category}</h5>
            <p>${match.lost.description || 'No description'}</p>
            <p><strong>Location:</strong> ${match.lost.location}</p>
            <img src="/api/items/image/${match.lost.id}" alt="Lost item" style="max-width: 200px;" onerror="this.style.display='none'">
            <button class="delete-btn" onclick="deleteItem('${match.lost.id}')">Delete Lost Item</button>
          </div>
          <div>
            <h5>Found: ${match.found.category}</h5>
            <p>${match.found.description || 'No description'}</p>
            <p><strong>Location:</strong> ${match.found.location}</p>
            <img src="/api/items/image/${match.found.id}" alt="Found item" style="max-width: 200px;" onerror="this.style.display='none'">
            <button class="delete-btn" onclick="deleteItem('${match.found.id}')">Delete Found Item</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Search error:', err);
    alert('Error searching items: ' + err.message);
  }
}

async function deleteItem(id) {
  // Confirm before deleting
  if (!confirm('Are you sure you want to delete this item?')) {
    return;
  }
  
  try {
    const res = await fetch(`/api/items/delete/${id}`, {
      method: 'DELETE',
      // Auth header temporarily removed for testing
      // headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await res.json();
    alert(data.message);
    
    // Refresh search results after deletion
    search();
  } catch (err) {
    console.error('Delete error:', err);
    alert('Error deleting item: ' + err.message);
  }
}