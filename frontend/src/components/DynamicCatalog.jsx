import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function DynamicCatalog({ data }) {
  const { name, description, content, imageUrl, products, solutions, posts } = data;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const getImageUrl = (item) => {
      if (item.imageUrl) {
          if (item.imageUrl.startsWith('//')) {
              return item.imageUrl.replace('//', '/');
          }
          return item.imageUrl;
      }
      // Return a transparent 500x500 pixel or placeholder if missing
      return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22500%22%20height%3D%22500%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20500%20500%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A25pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22500%22%20height%3D%22500%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22180%22%20y%3D%22260%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
  };

  const renderCard = (item) => (
    <li key={item.id} className="product type-product status-publish instock has-post-thumbnail product-type-simple">
        <figure>
            <a className="ct-media-container" href={`/${item.slug}`} aria-label={item.name || item.title}>
                <picture>
                    <img loading="lazy" src={getImageUrl(item)} alt={item.name || item.title} className="wp-post-image" style={{ aspectRatio: '3/4', objectFit: 'cover' }} />
                </picture>
            </a>
        </figure>
        <h2 className="woocommerce-loop-product__title">
            <a className="woocommerce-LoopProduct-link woocommerce-loop-product__link" href={`/${item.slug}`}>{item.name || item.title}</a>
        </h2>
        <div className="ct-woo-card-actions" data-add-to-cart="auto-hide">
            <a href={`/${item.slug}`} className="button product_type_simple" rel="nofollow">Đọc thêm</a>
        </div>
    </li>
  );

  const allItems = [
    ...(products || []),
    ...(solutions || []),
    ...(posts || [])
  ];

  const hasItems = allItems.length > 0;
  const totalPages = Math.ceil(allItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = allItems.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getFullImageUrl = (url) => {
      if (!url) return '';
      if (url.startsWith('http')) return url;
      return ``;
  };

  const isFullElementorPage = content && content.includes('data-elementor-type="wp-page"');

  if (isFullElementorPage) {
    return (
      <div className="category-content-description full-elementor-page" dangerouslySetInnerHTML={{ __html: content }} />
    );
  }

  return (
    <>
      <div className="hero-section" data-type="type-2" style={imageUrl ? { backgroundImage: `url(${getFullImageUrl(imageUrl)})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {}}>
        <header className="entry-header ct-container-narrow" style={imageUrl ? { backgroundColor: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: '8px' } : {}}>
          <h1 className="page-title" style={imageUrl ? { color: '#fff', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' } : {}}>{name}</h1>
          {description && <p style={{ color: '#fff', textAlign: 'center', marginTop: '10px', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>{description}</p>}
        </header>
      </div>
      
      {content && (
        <div className="ct-container" style={{ marginTop: '40px', marginBottom: '20px' }}>
            <div className="category-content-description" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )}

      <div className="ct-container" data-vertical-spacing="top:bottom">
        <section>
          <div className="woo-listing-top" style={{ marginBottom: '20px' }}>
            <p className="woocommerce-result-count">
               {hasItems ? `Hiển thị ${startIndex + 1}–${Math.min(startIndex + itemsPerPage, allItems.length)} trên ${allItems.length} kết quả` : 'Không có kết quả'}
            </p>
          </div>

          {!hasItems && (
            <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: '#666' }}>
              Danh mục này chưa có dữ liệu.
            </div>
          )}

          {hasItems && (
            <>
              <ul data-products="type-1" className="products columns-4">
                {currentItems.map(renderCard)}
              </ul>
              
              {totalPages > 1 && (
                <nav className="woocommerce-pagination" style={{ marginTop: '40px', textAlign: 'center' }}>
                  <ul className="page-numbers" style={{ display: 'inline-flex', listStyle: 'none', gap: '10px', padding: 0 }}>
                    {currentPage > 1 && (
                      <li><button className="prev page-numbers" onClick={() => handlePageChange(currentPage - 1)} style={{ padding: '10px 15px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>&larr; Trang trước</button></li>
                    )}
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <li key={page}>
                        <button 
                          className={`page-numbers ${currentPage === page ? 'current' : ''}`}
                          onClick={() => handlePageChange(page)}
                          style={{
                            padding: '10px 15px',
                            border: currentPage === page ? 'none' : '1px solid #ddd',
                            background: currentPage === page ? '#333' : '#fff',
                            color: currentPage === page ? '#fff' : '#333',
                            cursor: 'pointer'
                          }}
                        >
                          {page}
                        </button>
                      </li>
                    ))}

                    {currentPage < totalPages && (
                      <li><button className="next page-numbers" onClick={() => handlePageChange(currentPage + 1)} style={{ padding: '10px 15px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>Trang sau &rarr;</button></li>
                    )}
                  </ul>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
