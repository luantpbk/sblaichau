import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../Layout';
import pageCssMap from '../pageCssMap.json';

const api = axios.create({ baseURL: '/api' });

export default function PostDetail({ type }) {
    let slug = window.location.pathname.replace(/^\/|\/$/g, '');
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Find post by slug by searching across all 3 tables
        Promise.all([
            api.get('/news').catch(() => ({ data: [] })),
            api.get('/blogs').catch(() => ({ data: [] })),
            api.get('/cases').catch(() => ({ data: [] }))
        ]).then(responses => {
            const allData = [
                ...responses[0].data, 
                ...responses[1].data, 
                ...responses[2].data
            ];
            const data = allData.find(p => p.slug === slug);
            setPost(data);
            setLoading(false);
            
            // Try injecting CSS if we scraped it (fallback)
            const cssLinks = pageCssMap[slug];
            if (cssLinks) {
                cssLinks.forEach(href => {
                    if (!document.querySelector(`link[href="${href}"]`)) {
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = href;
                        document.head.appendChild(link);
                    }
                });
            }
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [slug]);

    if (loading) {
        return (
            <Layout>
                <div style={{ padding: '100px 20px', textAlign: 'center' }}>Đang tải bài viết...</div>
            </Layout>
        );
    }

    if (!post) {
        return (
            <Layout>
                <div style={{ padding: '100px 20px', textAlign: 'center' }}>Không tìm thấy bài viết!</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div style={{ backgroundColor: '#f9f9f9', padding: '60px 0' }}>
                <div className="ct-container-narrow" style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#161d30', lineHeight: '1.3' }}>{post.title}</h1>
                    <div style={{ color: '#666', marginBottom: '30px', fontSize: '0.95rem' }}>
                        Ngày đăng: {new Date(post.createdAt).toLocaleDateString('vi-VN')} | Chuyên mục: {post.category?.name || type}
                    </div>
                    {post.imageUrl && (
                        <div style={{ marginBottom: '40px', borderRadius: '8px', overflow: 'hidden' }}>
                            <img src={post.imageUrl} alt={post.title} style={{ width: '100%', display: 'block' }} />
                        </div>
                    )}
                    <div 
                        className="post-content elementor-widget-theme-post-content" 
                        dangerouslySetInnerHTML={{ __html: post.content }} 
                        style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#333' }}
                    />
                </div>
            </div>
        </Layout>
    );
}
