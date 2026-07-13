import React, { useState } from 'react';

export default function ProductTemplate({ data }) {
  const [mainImage, setMainImage] = useState(
      (data.images && data.images.length > 0) ? data.images[0] : (data.imageUrl || null)
  );

  if (data.content && data.content.trim().length > 0) {
      return <div className="category-content-description full-elementor-page" dangerouslySetInnerHTML={{ __html: data.content }} />;
  }

  return (
    <div className="weltrus-solar-page">
      <div className="weltrus-solar-container">
        
        {/* Product Showcase Area */}
        <div className="weltrus-solar-showcase">
          <div className="weltrus-solar-header">
            
            {/* Left: Image with Thumbnails */}
            <div className="weltrus-solar-image">
              <div className="weltrus-solar-main-image">
                {mainImage ? (
                  <img src={mainImage} alt={data.title || data.name} />
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center' }}>Chưa có hình ảnh</div>
                )}
              </div>
              
              {data.images && data.images.length > 0 && (
                <div className="weltrus-solar-thumbnails">
                  {data.images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`weltrus-solar-thumb ${mainImage === img ? 'active' : ''}`}
                      onClick={() => setMainImage(img)}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Right: Product Information */}
            <div className="weltrus-solar-info">
              <h1 className="weltrus-solar-title">{data.title || data.name}</h1>
              
              {data.features && data.features.length > 0 && (
                <div className="weltrus-features">
                  <h3>Ưu điểm chính</h3>
                  <ul className="weltrus-feature-list">
                    {data.features.map((feature, idx) => (
                      <li key={idx} dangerouslySetInnerHTML={{ __html: feature }} />
                    ))}
                  </ul>
                  
                  {data.certifications && data.certifications.length > 0 && (
                    <div className="weltrus-certifications">
                      {data.certifications.map((cert, idx) => (
                        <span key={idx} className="weltrus-cert-badge">{cert}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Product Description */}
            {data.description && (
              <div className="weltrus-product-description-full">
                <div dangerouslySetInnerHTML={{ __html: data.description }} />
              </div>
            )}
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="weltrus-main-layout">
          {/* Left Main Content */}
          <div className="weltrus-content">
            
            {/* Specifications */}
            {data.specifications && data.specifications.length > 0 && (
              <div className="weltrus-section">
                <h2>Thông số kỹ thuật cơ bản</h2>
                <table className="weltrus-spec-table">
                  <thead>
                    <tr>
                      <th>Thông số</th>
                      <th>Đặc điểm kỹ thuật</th>
                      <th>Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.specifications.map((spec, idx) => (
                      <tr key={idx}>
                        <td>{spec.name}</td>
                        <td dangerouslySetInnerHTML={{ __html: spec.value }} />
                        <td dangerouslySetInnerHTML={{ __html: spec.details }} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Power Cards (Protection Features) */}
            {data.powerCards && data.powerCards.length > 0 && (
              <div className="weltrus-section">
                <h2>Tính năng bảo vệ</h2>
                <div className="weltrus-power-grid">
                  {data.powerCards.map((card, idx) => (
                    <div className="weltrus-power-card" key={idx}>
                      <h3>{card.title}</h3>
                      <div dangerouslySetInnerHTML={{ __html: card.description }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
          
          {/* Right Side Panel */}
          {data.sidePanels && data.sidePanels.length > 0 && (
            <div className="weltrus-side-panel">
              {data.sidePanels.map((panel, idx) => (
                <div className="weltrus-side-section" key={idx}>
                  <h3>{panel.title}</h3>
                  <ul className="weltrus-category-menu">
                    {(panel.items || []).map((item, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
