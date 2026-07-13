import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../Layout';

const api = axios.create({ baseURL: 'http://localhost:3001/api' });

export default function PostList({ categorySlug, categoryName }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        let endpoint = '/news';
        if (categorySlug === 'blog') endpoint = '/blogs';
        if (categorySlug === 'energy-storage-case-studies' || categorySlug === 'case') endpoint = '/cases';

        api.get(endpoint).then(res => {
            setPosts(res.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [categorySlug]);

    return (
        <Layout>
            <div className="elementor elementor-location-archive">
                <div className="elementor-element e-flex e-con-boxed e-con e-parent" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
                    <div className="e-con-inner">
                        <div className="elementor-widget-heading">
                            <h1 className="elementor-heading-title elementor-size-default" style={{ textAlign: 'center', marginBottom: '40px', fontSize: '3rem', color: '#161d30' }}>
                                {categoryName}
                            </h1>
                        </div>
                        {loading ? (
                            <p style={{ textAlign: 'center' }}>Đang tải dữ liệu...</p>
                        ) : (
                            <div className="elementor-posts-container elementor-posts elementor-posts--skin-classic elementor-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                                {posts.map(post => (
                                    <article key={post.id} className="elementor-post elementor-grid-item" style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                        <a className="elementor-post__thumbnail__link" href={`/${post.slug}`} style={{ display: 'block', overflow: 'hidden' }}>
                                            <div className="elementor-post__thumbnail">
                                                <img 
                                                    src={post.imageUrl || '/assets/uploads/placeholder.png'} 
                                                    alt={post.title} 
                                                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', transition: 'transform 0.3s' }} 
                                                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                                />
                                            </div>
                                        </a>
                                        <div className="elementor-post__text" style={{ padding: '20px' }}>
                                            <h3 className="elementor-post__title" style={{ fontSize: '1.25rem', marginBottom: '10px', lineHeight: '1.4' }}>
                                                <a href={`/${post.slug}`} style={{ color: '#161d30', textDecoration: 'none' }}>{post.title}</a>
                                            </h3>
                                            <div className="elementor-post__excerpt" style={{ color: '#666', fontSize: '0.95rem', marginBottom: '15px', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                <p>{post.excerpt || '...'}</p>
                                            </div>
                                            <a className="elementor-post__read-more" href={`/${post.slug}`} style={{ color: '#0068ff', fontWeight: 'bold', textDecoration: 'none' }}>
                                                Xem thêm »
                                            </a>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                        {!loading && posts.length === 0 && (
                            <p style={{ textAlign: 'center' }}>Chưa có bài viết nào trong chuyên mục này.</p>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
