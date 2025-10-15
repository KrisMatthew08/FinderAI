import React, { useState } from 'react';
import axios from 'axios';

function App(){
  const [image, setImage] = useState(null);
  const [type, setType] = useState('lost');
  const [title, setTitle] = useState('');
  const [result, setResult] = useState(null);
  const [uploadedItem, setUploadedItem] = useState(null);

  const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert('Select image');

    const form = new FormData();
    form.append('image', image);
    form.append('type', type);
    form.append('title', title);

    try {
      const upl = await axios.post(`${apiBase}/api/items`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedItem(upl.data.item);
      // immediately search for matches
      const id = upl.data.item._id;
      const res = await axios.get(`${apiBase}/api/search/${id}?maxResults=5`);
      setResult(res.data.matches);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>FinderAI — Upload an item</h2>
      <form onSubmit={onSubmit}>
        <label>
          Type:
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
        </label><br/>
        <label>
          Title:
          <input value={title} onChange={e => setTitle(e.target.value)} />
        </label><br/>
        <label>
          Image:
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
        </label><br/>
        <button type="submit">Upload & Search</button>
      </form>

      {uploadedItem && (
        <div style={{ marginTop: 20 }}>
          <h3>Uploaded Item</h3>
          <p>{uploadedItem.title} ({uploadedItem.type})</p>
          <img alt="" src={`${apiBase}/api/image/${uploadedItem.fileId}`} style={{ maxWidth: 300 }} />
        </div>
      )}

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Matches</h3>
          {result.length === 0 && <div>No matches found</div>}
          {result.map((r, i) => (
            <div key={i} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
              <p>Score: {(r.score*100).toFixed(2)}% — distance {r.distance}</p>
              <p>{r.candidate.title} ({r.candidate.type})</p>
              <img alt="" src={`${apiBase}/api/image/${r.candidate.fileId}`} style={{ maxWidth: 200 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
