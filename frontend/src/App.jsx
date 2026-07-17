import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Layout from './Layout';
import ProductTemplate from './components/ProductTemplate';
import DynamicCatalog from './components/DynamicCatalog';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import pageCssMap from './pageCssMap.json';

const api = axios.create({ baseURL: '/api' });

// Intercept all API responses to strip out problematic WebP source tags injected by WordPress,
// which cause broken images since the .webp files aren't available locally.
api.interceptors.response.use((response) => {
  if (response.data) {
    try {
      let jsonStr = JSON.stringify(response.data);
      jsonStr = jsonStr.replace(/<source[^>]+type=\\"image\/webp\\"[^>]*>/gi, '');
      response.data = JSON.parse(jsonStr);
    } catch(e) {
      console.error('Error stripping webp sources:', e);
    }
  }
  return response;
});

// Add global error handler to suppress HTTrack missing chunk errors
window.addEventListener('unhandledrejection', function(event) {
  if (event.reason && event.reason.name === 'ChunkLoadError') {
    event.preventDefault(); // Suppress the red error in console
  }
});

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);
  const settingsRef = useRef([]);

  useEffect(() => {
      api.get('/settings').then(res => {
          settingsRef.current = res.data;
      }).catch(console.error);
  }, []);

  const applyDynamicSettings = (content) => {
      if (!content) return content;
      const email = settingsRef.current.find(s => s.key === 'footer_email')?.value || 'info@sblaichau.vn';
      const p1 = settingsRef.current.find(s => s.key === 'footer_phone1')?.value || '0964.822.438';
      const p2 = settingsRef.current.find(s => s.key === 'footer_phone2')?.value || '0986.072.277';
      const address = settingsRef.current.find(s => s.key === 'footer_address')?.value || 'Lai Châu, Việt Nam';
      let newContent = content.replace(/https?:\/\/(www\.)?weltrus\.com\/wp-content\//gi, '/assets/');
      newContent = newContent.replace(/sales@weltrus\.com/gi, email);
      newContent = newContent.replace(/\+86\s*181\s*5738\s*8806|0573-86221160/gi, p1);
      newContent = newContent.replace(/400\s*900\s*8856/gi, p2);
      newContent = newContent.replace(/Hangzhou,\s*China|Zhejiang\s*Province,\s*China/gi, address);
      newContent = newContent.replace(/weltrus\.com/gi, 'sblaichau.vn');
      return newContent;
  };

  const getCleanPath = () => {
    let p = window.location.pathname;
    if (p.startsWith('/')) p = p.substring(1);
    p = p.replace(/\/index\.html$/, '');
    p = p.replace(/^index\.html$/, '');
    if (p.endsWith('/')) p = p.substring(0, p.length - 1);
    return p || 'home';
  };

  useEffect(() => {
    const path = getCleanPath();
    if (initialized.current) return;
    initialized.current = true;

    // Inject page-specific CSS from map
    const cssLinks = pageCssMap[path];
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

    // Nếu là category (từ sidebar click sang)
    if (path.startsWith('category/')) {
        const catSlug = path.replace('category/', '');
        api.get(`/categories/${catSlug}`)
          .then(res => {
              if (res.data.content) res.data.content = applyDynamicSettings(res.data.content);
              setData({ type: 'category', data: res.data });
          })
          .catch(err => { console.error(err); setData({ type: '404' }); })
          .finally(() => setLoading(false));
        return;
    }

    // Nếu là trang products, lấy tất cả sản phẩm
    if (path === 'products' || path === 'news' || path === 'blog' || path === 'case') {
        if (path === 'products') {
            api.get(`/products`)
              .then(res => {
                  const processedProducts = res.data.map(p => {
                      if (p.content) p.content = applyDynamicSettings(p.content);
                      return p;
                  });
                  setData({ 
                      type: 'category', 
                      data: { name: 'Sản phẩm', description: '', products: processedProducts } 
                  });
              })
              .catch(err => { console.error(err); setData({ type: '404' }); })
              .finally(() => setLoading(false));
            return;
        } else {
            setLoading(false);
            return;
        }
    }

    // Call API chung cho các trang khác
    api.get(`/content?slug=${path}`)
      .then(res => {
        if (res.data.content) {
            res.data.content = applyDynamicSettings(res.data.content);
        }
        setData({ type: res.data.type, data: res.data });
        
        if (res.data.type === 'product') {
            let productCssLinks = pageCssMap[path];
            if (!productCssLinks || productCssLinks.length === 0) {
                // Fallback Elementor Product Single Template CSS
                productCssLinks = [
                    "/assets/uploads/elementor/css/post-26.css",
                    "/assets/uploads/elementor/css/post-720.css",
                    "/assets/uploads/elementor/css/post-1005.css",
                    "/assets/uploads/elementor/css/post-2422.css",
                    "/assets/uploads/elementor/css/post-658.css"
                ];
            }
            if (productCssLinks) {
                productCssLinks.forEach(href => {
                    if (!document.querySelector(`link[href="${href}"]`)) {
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = href;
                        document.head.appendChild(link);
                    }
                });
            }
        }
      })
      .catch(err => {
        console.error('API Error:', err);
        setData({ type: '404' });
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

  useEffect(() => {
      const p = getCleanPath();
      if (data && data.type === 'page' && p === 'home') {
          const fetchAndInject = async () => {
              try {
                  const [casesRes, newsRes, blogsRes] = await Promise.all([
                      api.get('/cases').catch(() => ({ data: [] })),
                      api.get('/news').catch(() => ({ data: [] })),
                      api.get('/blogs').catch(() => ({ data: [] }))
                  ]);
                  
                  const generateHtml = (items, type) => {
                      return items.slice(0, 3).map(item => `
                          <article class="elementor-post elementor-grid-item post type-post status-publish format-standard has-post-thumbnail hentry">
                              <a class="elementor-post__thumbnail__link" href="/${item.slug}">
                                  <div class="elementor-post__thumbnail">
                                      <img src="${item.imageUrl || ''}" alt="${item.title}" style="width: 100%; aspect-ratio: 4/3; object-fit: cover;">
                                  </div>
                              </a>
                              <div class="elementor-post__text">
                                  <h3 class="elementor-post__title">
                                      <a href="/${item.slug}">${item.title}</a>
                                  </h3>
                                  <div class="elementor-post__excerpt">
                                      <p>${item.excerpt || ''}</p>
                                  </div>
                                  <a class="elementor-post__read-more" href="/${item.slug}">Đọc tiếp »</a>
                              </div>
                          </article>
                      `).join('');
                  };

                  const casesContainer = document.getElementById('dynamic-home-cases');
                  if (casesContainer) casesContainer.innerHTML = generateHtml(casesRes.data, 'case');

                  const newsContainer = document.getElementById('dynamic-home-news');
                  if (newsContainer) newsContainer.innerHTML = generateHtml(newsRes.data, 'news');

                  const blogsContainer = document.getElementById('dynamic-home-blogs');
                  if (blogsContainer) blogsContainer.innerHTML = generateHtml(blogsRes.data, 'blog');

              } catch (e) {
                  console.error('Error injecting home content:', e);
              }
          };
          
          // Small timeout to ensure DOM is updated with dangerouslySetInnerHTML
          setTimeout(fetchAndInject, 100);
      }

      // Initialize Swiper for all pages
      setTimeout(() => {
          if (window.Swiper) {
              document.querySelectorAll('.swiper:not(.swiper-initialized)').forEach(el => {
                  const settingsStr = el.closest('.elementor-widget')?.getAttribute('data-settings');
                  const nextEl = el.parentNode.querySelector('.elementor-swiper-button-next');
                  const prevEl = el.parentNode.querySelector('.elementor-swiper-button-prev');
                  const pagEl = el.parentNode.querySelector('.swiper-pagination');
                  let options = {
                      loop: true,
                      autoplay: { delay: 5000 },
                      slidesPerView: 1,
                      spaceBetween: 0,
                      breakpoints: {}
                  };
                  if (pagEl) options.pagination = { el: pagEl, clickable: true };
                  if (nextEl && prevEl) options.navigation = { nextEl, prevEl };
                  try {
                      if (settingsStr) {
                          const settings = JSON.parse(settingsStr);
                          if (settings.autoplay_speed) options.autoplay.delay = settings.autoplay_speed;
                          if (settings.slides_per_view) options.slidesPerView = parseInt(settings.slides_per_view) || 1;
                          if (settings.space_between) options.spaceBetween = parseInt(settings.space_between) || 0;
                          if (settings.slides_per_view_tablet) {
                              options.breakpoints[768] = { slidesPerView: parseInt(settings.slides_per_view_tablet) || 1 };
                          }
                          if (settings.slides_per_view_mobile) {
                              options.breakpoints[480] = { slidesPerView: parseInt(settings.slides_per_view_mobile) || 1 };
                          }
                      }
                  } catch(e) {}
                  new window.Swiper(el, options);
              });

              // Check for Elementor video widgets
              document.querySelectorAll('.elementor-widget-video').forEach(widget => {
                  try {
                      const settingsStr = widget.getAttribute('data-settings');
                      const videoContainer = widget.querySelector('.elementor-video');
                      if (settingsStr && videoContainer && !videoContainer.innerHTML) {
                          const settings = JSON.parse(settingsStr);
                          let url = '';
                          if (settings.video_type === 'youtube' && settings.youtube_url) {
                              const match = settings.youtube_url.match(/[?&]v=([^&]+)/) || settings.youtube_url.match(/youtu\.be\/([^?]+)/);
                              if (match && match[1]) {
                                  const videoId = match[1];
                                  let params = '?feature=oembed';
                                  if (settings.autoplay === 'yes') params += '&autoplay=1';
                                  if (settings.mute === 'yes') params += '&mute=1';
                                  if (settings.loop === 'yes') params += '&loop=1&playlist=' + videoId;
                                  if (settings.controls === 'no') params += '&controls=0';
                                  url = 'https://www.youtube.com/embed/' + videoId + params;
                              }
                          } else if (settings.video_type === 'vimeo' && settings.vimeo_url) {
                              const match = settings.vimeo_url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
                              if (match && match[1]) {
                                  let params = '?';
                                  if (settings.autoplay === 'yes') params += '&autoplay=1';
                                  if (settings.mute === 'yes') params += '&muted=1';
                                  if (settings.loop === 'yes') params += '&loop=1';
                                  url = 'https://player.vimeo.com/video/' + match[1] + params;
                              }
                          } else if (settings.video_type === 'hosted' && settings.hosted_url && settings.hosted_url.url) {
                              let attrs = 'controls';
                              if (settings.autoplay === 'yes') attrs += ' autoplay';
                              if (settings.mute === 'yes') attrs += ' muted';
                              if (settings.loop === 'yes') attrs += ' loop';
                              let hostUrl = settings.hosted_url.url;
                              if (hostUrl.startsWith('/wp-content')) hostUrl = hostUrl.replace('/wp-content', '/assets');
                              videoContainer.innerHTML = '<video class="elementor-video" src="' + hostUrl + '" ' + attrs + ' style="width:100%;height:100%;"></video>';
                              return;
                          }
                          
                          if (url) {
                              videoContainer.innerHTML = '<iframe class="elementor-video-iframe" allowfullscreen="1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" src="' + url + '" width="100%" height="100%" frameborder="0" style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>';
                              videoContainer.style.position = 'relative';
                              if (settings.aspect_ratio) {
                                  const ratio = settings.aspect_ratio;
                                  if (ratio === '169') videoContainer.style.paddingBottom = '56.25%';
                                  else if (ratio === '219') videoContainer.style.paddingBottom = '42.85%';
                                  else if (ratio === '43') videoContainer.style.paddingBottom = '75%';
                                  else if (ratio === '32') videoContainer.style.paddingBottom = '66.66%';
                                  else videoContainer.style.paddingBottom = '56.25%';
                              } else {
                                  videoContainer.style.paddingBottom = '56.25%';
                              }
                          }
                      }
                  } catch(e) { console.error('Error initializing video widget', e); }
              });

              // Check for Elementor background slideshows
              document.querySelectorAll('[data-settings]').forEach(el => {
                  try {
                      const settings = JSON.parse(el.getAttribute('data-settings'));
                      if (settings.background_background === 'slideshow' && settings.background_slideshow_gallery) {
                          // Prevent duplicate initialization
                          if (el.querySelector('.elementor-background-slideshow')) return;
                          
                          const gallery = settings.background_slideshow_gallery;
                          const transitionStr = settings.background_slideshow_slide_transition || 'fade';
                          const speed = settings.background_slideshow_transition_duration || 500;
                          const delay = settings.background_slideshow_slide_duration || 5000;
                          
                          // Create container
                          const bgWrapper = document.createElement('div');
                          bgWrapper.className = 'elementor-background-slideshow swiper swiper-initialized';
                          bgWrapper.style.position = 'absolute';
                          bgWrapper.style.top = '0';
                          bgWrapper.style.left = '0';
                          bgWrapper.style.width = '100%';
                          bgWrapper.style.height = '100%';
                          bgWrapper.style.zIndex = '0';
                          bgWrapper.dir = 'ltr';
                          
                          const swiperWrapper = document.createElement('div');
                          swiperWrapper.className = 'swiper-wrapper';
                          swiperWrapper.style.width = '100%';
                          swiperWrapper.style.height = '100%';
                          
                          gallery.forEach(img => {
                              const slide = document.createElement('div');
                              slide.className = 'swiper-slide';
                              slide.style.width = '100%';
                              slide.style.height = '100%';
                              
                              const slideBg = document.createElement('div');
                              slideBg.className = 'swiper-slide-bg';
                              // Some URLs from API might be root relative, we can use them directly
                              let url = img.url;
                              if (url.startsWith('/wp-content')) {
                                  url = url.replace('/wp-content', '/assets');
                              }
                              slideBg.style.backgroundImage = `url('${url}')`;
                              slideBg.style.backgroundSize = 'cover';
                              slideBg.style.backgroundPosition = 'center';
                              slideBg.style.width = '100%';
                              slideBg.style.height = '100%';
                              
                              slide.appendChild(slideBg);
                              swiperWrapper.appendChild(slide);
                          });
                          
                          bgWrapper.appendChild(swiperWrapper);
                          // Ensure parent is relative and prepend
                          if (getComputedStyle(el).position === 'static') {
                              el.style.position = 'relative';
                          }
                          el.insertBefore(bgWrapper, el.firstChild);
                          
                          new window.Swiper(bgWrapper, {
                              loop: true,
                              autoplay: { delay },
                              speed,
                              effect: transitionStr === 'fade' ? 'fade' : 'slide'
                          });
                      }
                  } catch (e) {
                      console.error("Error parsing background slideshow settings:", e);
                  }
              });
          }
      }, 300);


  }, [data]);

  if (loading) return <Layout><div style={{padding: '50px', textAlign: 'center'}}>Đang tải...</div></Layout>;
  
  let path = getCleanPath();


  if (path === 'news') {
      return <PostList categorySlug="news" categoryName="Tin tức" />;
  }

  if (path === 'blog') {
      return <PostList categorySlug="blog" categoryName="Blog" />;
  }

  if (path === 'case' || path === 'energy-storage-case-studies') {
      return <PostList categorySlug="case" categoryName="Dự án Tiêu biểu" />;
  }

  if (data && data.type !== '404') {
      if (data.type === 'product' || data.type === 'solution') {
          return (
              <Layout>
                  <ProductTemplate data={data.data} type={data.type} />
              </Layout>
          );
      }
      if (data.type === 'category') {
          return (
              <Layout>
                  <DynamicCatalog data={data.data} />
              </Layout>
          );
      }
      if (data.type === 'news' || data.type === 'blog' || data.type === 'case') {
          return <PostDetail />;
      }
      return (
          <Layout>
              <div dangerouslySetInnerHTML={{ __html: data.data.content }} />
          </Layout>
      );
  }

  return <PostDetail />;
}
