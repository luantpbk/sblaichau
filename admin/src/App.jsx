import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, ShoppingBag, FolderTree, BookOpen, Wrench, LogOut, Settings as SettingsIcon } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from './lib/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('admin_token', res.data.token);
      navigate('/');
    } catch (err) {
      alert('Đăng nhập thất bại: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <div className="card" style={{ width: '400px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Đăng nhập Quản trị</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Đăng nhập</button>
        </form>
      </div>
    </div>
  );
}

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { path: '/', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/pages', label: 'Trang tĩnh', icon: FileText },
    { path: '/categories', label: 'Danh mục', icon: FolderTree },
    { path: '/products', label: 'Sản phẩm', icon: ShoppingBag },
    { path: '/news', label: 'Tin tức', icon: BookOpen },
    { path: '/blogs', label: 'Blog', icon: BookOpen },
    { path: '/cases', label: 'Dự án', icon: BookOpen },
    { path: '/solutions', label: 'Giải pháp', icon: Wrench },
    { path: '/settings', label: 'Cài đặt', icon: SettingsIcon },
  ];

  const logout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-title">SBLaiChau Admin</div>
      <nav style={{ flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link key={item.path} to={item.path} className={`nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button onClick={logout} className="nav-link" style={{ borderTop: '1px solid var(--border-color)', width: '100%', textAlign: 'left' }}>
        <LogOut size={20} />
        Đăng xuất
      </button>
    </div>
  );
}

function Dashboard() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tổng quan</h1>
      </div>
      <div className="card">
        <p>Chào mừng đến với trang quản trị SBLaiChau.vn</p>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
          Chọn một mục ở menu bên trái để quản lý nội dung.
        </p>
      </div>
    </div>
  );
}

// Generic Table View Placeholder
function GenericList({ title, endpoint, columns }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  const [categories, setCategories] = useState([]);

  const fetchData = () => {
    setLoading(true);
    api.get(endpoint).then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
    
    // Fetch categories if needed
    if (endpoint === '/products' || endpoint === '/solutions' || endpoint === '/posts') {
       api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  const handleEdit = (item) => {
    setEditingItem(item);
  };

  const handleAddNew = () => {
    setEditingItem({});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem.id) {
        await api.put(`${endpoint}/${editingItem.id}`, editingItem);
      } else {
        await api.post(endpoint, editingItem);
      }
      setEditingItem(null);
      fetchData();
    } catch (err) {
      alert("Lỗi khi lưu: " + (err.response?.data?.error || err.message));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditingItem(prev => ({ ...prev, imageUrl: res.data.url }));
    } catch (err) {
      alert("Lỗi khi tải ảnh lên: " + (err.response?.data?.error || err.message));
    }
  };

  if (editingItem) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">{editingItem.id ? 'Sửa' : 'Thêm mới'} {title}</h1>
          <button className="btn btn-secondary" onClick={() => setEditingItem(null)}>Quay lại</button>
        </div>
        <div className="card">
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label>
              <strong>Tiêu đề / Tên</strong>
              <input className="input" type="text" value={editingItem.title || editingItem.name || ''} 
                onChange={e => {
                  if ('name' in editingItem || endpoint === '/products' || endpoint === '/categories') {
                    setEditingItem({...editingItem, name: e.target.value});
                  } else {
                    setEditingItem({...editingItem, title: e.target.value});
                  }
                }} required />
            </label>
            <label>
              <strong>Đường dẫn (Slug)</strong>
              <input className="input" type="text" value={editingItem.slug || ''} 
                onChange={e => setEditingItem({...editingItem, slug: e.target.value})} required />
            </label>
            
            {(endpoint === '/products' || endpoint === '/solutions' || endpoint === '/news' || endpoint === '/blogs' || endpoint === '/cases') && (
              <label>
                <strong>Danh mục (Category)</strong>
                <select className="input" value={editingItem.categoryId || ''} 
                  onChange={e => setEditingItem({...editingItem, categoryId: e.target.value ? Number(e.target.value) : null})}>
                  <option value="">-- Không có danh mục --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </label>
            )}
            
            {/* Image Upload section */}
            {(endpoint === '/products' || endpoint === '/news' || endpoint === '/blogs' || endpoint === '/cases' || endpoint === '/solutions' || endpoint === '/categories') && (
              <label>
                <strong>Ảnh đại diện (Image URL)</strong>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                  <input className="input" type="text" value={editingItem.imageUrl || ''} 
                    onChange={e => setEditingItem({...editingItem, imageUrl: e.target.value})} style={{ flex: 1 }} />
                  <input type="file" accept="image/*" onChange={handleImageUpload} id="image-upload" style={{ display: 'none' }} />
                  <button type="button" className="btn btn-secondary" onClick={() => document.getElementById('image-upload').click()}>
                    Tải ảnh lên
                  </button>
                </div>
                {editingItem.imageUrl && (
                  <div style={{ marginTop: '1rem' }}>
                    <img src={editingItem.imageUrl.startsWith('http') ? editingItem.imageUrl : `http://localhost:5174${editingItem.imageUrl}`} 
                         alt="Preview" style={{ maxHeight: '150px', borderRadius: '8px' }} />
                  </div>
                )}
              </label>
            )}

            {(endpoint === '/pages' || endpoint === '/products' || endpoint === '/news' || endpoint === '/blogs' || endpoint === '/cases' || endpoint === '/solutions' || endpoint === '/categories') && (
              <label>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Nội dung (Content)</strong>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingItem(prev => ({...prev, _isVisual: !prev._isVisual}))} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                    {editingItem._isVisual ? 'Chuyển sang HTML Text' : 'Sử dụng Editor Trực quan'}
                  </button>
                </div>
                {editingItem._isVisual ? (
                  <div style={{ marginTop: '0.5rem', backgroundColor: 'white', color: 'black' }}>
                    <ReactQuill theme="snow" value={editingItem.content || ''} onChange={val => setEditingItem({...editingItem, content: val})} />
                  </div>
                ) : (
                  <textarea className="input" rows="15" value={editingItem.content || ''} 
                    onChange={e => setEditingItem({...editingItem, content: e.target.value})} 
                    style={{ fontFamily: 'monospace', marginTop: '0.5rem' }} />
                )}
              </label>
            )}
            
            <div style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <button className="btn btn-primary" onClick={handleAddNew}>+ Thêm mới</button>
      </div>
      <div className="card">
        {loading ? <p>Đang tải...</p> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {columns.map(c => <th key={c.key}>{c.label}</th>)}
                  <th style={{ width: '100px' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data.map(row => (
                  <tr key={row.id}>
                    {columns.map(c => <td key={c.key}>{row[c.key]}</td>)}
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }} onClick={() => handleEdit(row)}>Sửa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SiteSettings() {
  const [settings, setSettings] = useState([
    { key: 'footer_email', value: '' },
    { key: 'footer_phone1', value: '' },
    { key: 'footer_phone2', value: '' },
    { key: 'footer_logo', value: '' },
    { key: 'footer_address', value: '' },
  ]);

  useEffect(() => {
    api.get('/settings').then(res => {
      if (res.data && res.data.length > 0) {
        setSettings(res.data);
      }
    });
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/settings', settings);
      alert('Đã lưu cấu hình thành công!');
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Cài đặt Website</h1>
      </div>
      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>Email liên hệ Footer</label>
            <input className="input" type="text" value={settings.find(s => s.key === 'footer_email')?.value || ''} onChange={e => handleChange('footer_email', e.target.value)} />
          </div>
          <div>
            <label>Số điện thoại 1 (Footer)</label>
            <input className="input" type="text" value={settings.find(s => s.key === 'footer_phone1')?.value || ''} onChange={e => handleChange('footer_phone1', e.target.value)} />
          </div>
          <div>
            <label>Số điện thoại 2 (Footer)</label>
            <input className="input" type="text" value={settings.find(s => s.key === 'footer_phone2')?.value || ''} onChange={e => handleChange('footer_phone2', e.target.value)} />
          </div>
          <div>
            <label>Địa chỉ liên hệ</label>
            <input className="input" type="text" value={settings.find(s => s.key === 'footer_address')?.value || ''} onChange={e => handleChange('footer_address', e.target.value)} />
          </div>
          <div>
            <label>Logo Footer (Đường dẫn tĩnh)</label>
            <input className="input" type="text" value={settings.find(s => s.key === 'footer_logo')?.value || ''} onChange={e => handleChange('footer_logo', e.target.value)} />
            <small style={{display:'block', marginTop:'5px'}}>VD: /assets/uploads/2024/07/logo.png</small>
          </div>
          <button type="submit" className="btn btn-primary">Lưu Cài đặt</button>
        </form>
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <PrivateRoute>
            <div className="app-container">
              <Sidebar />
              <div className="main-content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/pages" element={<GenericList title="Quản lý Trang tĩnh" endpoint="/pages" columns={[{key: 'title', label: 'Tiêu đề'}, {key: 'slug', label: 'Đường dẫn'}]} />} />
                  <Route path="/categories" element={<GenericList title="Danh mục Sản phẩm" endpoint="/categories" columns={[{key: 'name', label: 'Tên danh mục'}, {key: 'slug', label: 'Đường dẫn'}]} />} />
                  <Route path="/products" element={<GenericList title="Quản lý Sản phẩm" endpoint="/products" columns={[{key: 'name', label: 'Tên sản phẩm'}, {key: 'slug', label: 'Đường dẫn'}]} />} />
                  <Route path="/news" element={<GenericList title="Quản lý Tin tức" endpoint="/news" columns={[{key: 'title', label: 'Tiêu đề'}, {key: 'slug', label: 'Đường dẫn'}]} />} />
                  <Route path="/blogs" element={<GenericList title="Quản lý Blog" endpoint="/blogs" columns={[{key: 'title', label: 'Tiêu đề'}, {key: 'slug', label: 'Đường dẫn'}]} />} />
                  <Route path="/cases" element={<GenericList title="Quản lý Dự án" endpoint="/cases" columns={[{key: 'title', label: 'Tiêu đề'}, {key: 'slug', label: 'Đường dẫn'}]} />} />
                  <Route path="/solutions" element={<GenericList title="Quản lý Giải pháp" endpoint="/solutions" columns={[{key: 'title', label: 'Tiêu đề'}, {key: 'slug', label: 'Đường dẫn'}]} />} />
                  <Route path="/settings" element={<SiteSettings />} />
                </Routes>
              </div>
            </div>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
